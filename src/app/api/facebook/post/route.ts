// Facebook Graph API posting endpoint
import { NextRequest, NextResponse } from 'next/server';
import { AdminPostsService } from '@/lib/supabase';
import { ApiResponse, FacebookPostResponse, FacebookError } from '@/types/posts';

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    
    // Validate required fields
    if (!postId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Post ID is required'
      }, { status: 400 });
    }

    // Validate environment variables
    const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!facebookAccessToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Facebook access token not configured'
      }, { status: 500 });
    }
    
    // Get post from database
    const post = await AdminPostsService.getPostById(postId);
    
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }
    
    // Check if post is already posted
    if (post.status === 'posted' && post.facebook_post_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Post has already been published to Facebook',
        data: {
          facebook_post_id: post.facebook_post_id,
          facebook_url: `https://facebook.com/${post.facebook_post_id}`
        }
      }, { status: 400 });
    }
    
    // Prepare Facebook Graph API request
    const facebookApiUrl = 'https://graph.facebook.com/v23.0/me/photos';
    const facebookPayload = {
      url: post.image_url,
      message: post.content,
      access_token: facebookAccessToken
    };
    
    console.log('🚀 Posting to Facebook:', {
      post_id: postId,
      image_url: post.image_url,
      message_preview: post.content.substring(0, 100) + '...'
    });
    
    // Make request to Facebook Graph API
    const facebookResponse = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facebookPayload)
    });
    
    const facebookResult: FacebookPostResponse | FacebookError = await facebookResponse.json();
    
    // Handle Facebook API errors
    if (!facebookResponse.ok || 'error' in facebookResult) {
      console.error('❌ Facebook API error:', facebookResult);
      
      // Update post status to failed
      await AdminPostsService.updatePost(postId, { 
        status: 'failed',
        metadata: {
          ...post.metadata,
          facebook_error: facebookResult,
          failed_at: new Date().toISOString()
        }
      });
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'error' in facebookResult ? facebookResult.message : 'Facebook API request failed'
      }, { status: 400 });
    }
    
    // Success - update post status in database
    const updatedPost = await AdminPostsService.updatePost(postId, { 
      status: 'posted',
      facebook_post_id: facebookResult.id,
      posted_at: new Date().toISOString(),
      metadata: {
        ...post.metadata,
        facebook_response: facebookResult,
        posted_at: new Date().toISOString()
      }
    });
    
    console.log('✅ Successfully posted to Facebook:', {
      post_id: postId,
      facebook_post_id: facebookResult.id,
      facebook_url: `https://facebook.com/${facebookResult.id}`
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        post_id: postId,
        facebook_post_id: facebookResult.id,
        facebook_url: `https://facebook.com/${facebookResult.id}`,
        posted_at: updatedPost.posted_at
      },
      message: 'Successfully posted to Facebook!'
    });
    
  } catch (error) {
    console.error('❌ Facebook posting error:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error while posting to Facebook'
    }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Baby Nurse Facebook Posting Endpoint',
    status: 'Active',
    endpoints: {
      POST: 'Post content to Facebook',
      GET: 'Health check'
    },
    facebook_configured: !!process.env.FACEBOOK_ACCESS_TOKEN
  });
}
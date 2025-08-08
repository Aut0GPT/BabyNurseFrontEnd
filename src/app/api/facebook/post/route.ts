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

    // Get post from database first
    const post = await AdminPostsService.getPostById(postId);
    
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }

    // Check if Facebook API is configured
    const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!facebookAccessToken || facebookAccessToken === 'your_facebook_page_access_token_here') {
      // Mark as failed with helpful message for unconfigured API
      await AdminPostsService.updatePost(postId, { 
        status: 'failed',
        metadata: {
          ...post.metadata,
          facebook_error: { message: 'Facebook API not configured' },
          failed_at: new Date().toISOString()
        }
      });
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Facebook API não configurado. Configure FACEBOOK_ACCESS_TOKEN para publicar.'
      }, { status: 400 });
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
    
    const facebookResult = await facebookResponse.json();
    
    // Handle Facebook API errors
    if (!facebookResponse.ok || facebookResult.error) {
      console.error('❌ Facebook API error:', facebookResult);
      
      // Extract error message safely
      let errorMessage = 'Facebook API request failed';
      if (facebookResult.error) {
        errorMessage = facebookResult.error.message || facebookResult.error || 'Facebook API error';
      }
      
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
        error: errorMessage
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
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const isConfigured = facebookAccessToken && facebookAccessToken !== 'your_facebook_page_access_token_here';
  
  return NextResponse.json({
    message: 'Baby Nurse Facebook Posting Endpoint',
    status: 'Active',
    endpoints: {
      POST: 'Post content to Facebook',
      GET: 'Health check'
    },
    facebook_configured: isConfigured,
    configuration_status: isConfigured ? 'Configurado' : 'Configure FACEBOOK_ACCESS_TOKEN no .env.local'
  });
}
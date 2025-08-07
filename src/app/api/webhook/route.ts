// Webhook endpoint to receive data from n8n workflow
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin, StorageService, AdminPostsService } from '@/lib/supabase';
import { WebhookPayload, ApiResponse } from '@/types/posts';

export async function POST(request: NextRequest) {
  try {
    // Create server-side admin client
    const supabaseAdmin = createSupabaseAdmin();
    
    // Parse the webhook payload from n8n
    const payload: WebhookPayload = await request.json();
    
    // Validate required fields
    if (!payload.dataimage || !payload.output) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: dataimage or output'
      }, { status: 400 });
    }

    // Convert base64 image data to blob
    const base64Data = payload.dataimage.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `baby-nurse-${timestamp}.jpg`;
    
    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('baby-nurse-posts')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to upload image to storage'
      }, { status: 500 });
    }
    
    // Get the public URL for the uploaded image
    const publicUrl = StorageService.getPublicUrl(filename);
    
    // Save post metadata to database
    const post = await AdminPostsService.createPost({
      image_url: publicUrl,
      content: payload.output,
      status: 'pending',
      original_filename: filename,
      metadata: {
        original_timestamp: payload.timestamp || new Date().toISOString(),
        filename: filename,
        workflow_id: payload.workflow_id || 'n8n-webhook',
        upload_path: uploadData.path
      }
    });
    
    console.log(`✅ New post created successfully:`, {
      id: post.id,
      filename: filename,
      content_preview: payload.output.substring(0, 100) + '...'
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        post_id: post.id,
        image_url: publicUrl,
        filename: filename
      },
      message: 'Post created successfully and ready for approval'
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error while processing webhook'
    }, { status: 500 });
  }
}

// Handle GET requests (for testing webhook endpoint)
export async function GET() {
  return NextResponse.json({
    message: 'Baby Nurse Webhook Endpoint Active',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: 'Receives webhook data from n8n',
      GET: 'Health check'
    }
  });
}
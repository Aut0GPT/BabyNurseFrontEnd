// Posts CRUD API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { PostsService, AdminPostsService, StorageService } from '@/lib/supabase';
import { ApiResponse } from '@/types/posts';

// GET /api/posts - Fetch all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let posts;
    
    if (status) {
      // Filter by status if specified (using client supabase for read operations)
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      posts = data;
    } else {
      // Get all posts
      posts = await PostsService.getAllPosts();
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: posts,
      message: `Retrieved ${posts?.length || 0} posts`
    });
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch posts'
    }, { status: 500 });
  }
}

// DELETE /api/posts - Delete a post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    
    if (!postId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Post ID is required'
      }, { status: 400 });
    }
    
    // Get post details first to clean up storage
    const post = await AdminPostsService.getPostById(postId);
    
    // Delete from database
    await AdminPostsService.deletePost(postId);
    
    // Clean up image from storage if it exists
    if (post.metadata?.filename) {
      try {
        const { StorageService } = await import('@/lib/supabase');
        await StorageService.deleteImage(post.metadata.filename);
      } catch (storageError) {
        console.warn('Failed to delete image from storage:', storageError);
        // Continue even if storage cleanup fails
      }
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting post:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete post'
    }, { status: 500 });
  }
}
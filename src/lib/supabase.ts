// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import { Post } from '@/types/posts';

// Database type definitions
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Post, 'id' | 'created_at'>>;
      };
    };
  };
}

// Client-side Supabase client (uses anon key) - Safe for browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client - Only available in API routes
export function createSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server side');
  }
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Utility functions for common operations (client-side)
export class PostsService {
  static async getAllPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getPostById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Subscribe to real-time changes (client-side only)
  static subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('posts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        callback
      )
      .subscribe();
  }
}

// Server-side operations (API routes only)
export class AdminPostsService {
  static async createPost(post: Database['public']['Tables']['posts']['Insert']) {
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePost(id: string, updates: Database['public']['Tables']['posts']['Update']) {
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePost(id: string) {
    const supabaseAdmin = createSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async getPostById(id: string) {
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Storage utilities
export class StorageService {
  static async uploadImage(file: File | Blob, filename: string) {
    const { data, error } = await supabase.storage
      .from('baby-nurse-posts')
      .upload(filename, file, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (error) throw error;
    return data;
  }

  static getPublicUrl(filename: string) {
    const { data } = supabase.storage
      .from('baby-nurse-posts')
      .getPublicUrl(filename);
    
    return data.publicUrl;
  }

  static async deleteImage(filename: string) {
    const { error } = await supabase.storage
      .from('baby-nurse-posts')
      .remove([filename]);
    
    if (error) throw error;
  }
}
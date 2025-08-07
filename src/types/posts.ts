// TypeScript definitions for Baby Nurse Posts

export type PostStatus = 'pending' | 'posted' | 'failed' | 'draft';

export interface Post {
  id: string;
  image_url: string;
  content: string;
  status: PostStatus;
  facebook_post_id?: string;
  original_filename?: string;
  created_at: string;
  posted_at?: string;
  metadata?: {
    original_timestamp?: string;
    filename?: string;
    workflow_id?: string;
    [key: string]: any;
  };
}

export interface PostCreateData {
  image_url: string;
  content: string;
  status?: PostStatus;
  metadata?: Record<string, any>;
}

export interface PostUpdateData {
  status?: PostStatus;
  facebook_post_id?: string;
  posted_at?: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WebhookPayload {
  dataimage: string;
  output: string;
  timestamp?: string;
  workflow_id?: string;
}

export interface FacebookPostResponse {
  id: string;
  post_id?: string;
}

export interface FacebookError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
}
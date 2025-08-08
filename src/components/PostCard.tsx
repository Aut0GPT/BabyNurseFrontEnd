// Individual post card component with posting functionality
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types/posts';
import { 
  Share2, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPostUpdate: () => void;
}

export default function PostCard({ post, onPostUpdate }: PostCardProps) {
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle Facebook posting
  const handlePost = async () => {
    if (posting) return;
    
    setPosting(true);
    try {
      const response = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success feedback
        console.log('✅ Post publicado com sucesso:', result.data.facebook_url);
        onPostUpdate(); // Refresh posts
      } else {
        // Show error feedback with user-friendly message
        console.error('❌ Erro ao publicar:', result.error);
        
        let userMessage = result.error;
        if (result.error?.includes('não configurado')) {
          userMessage = 'Facebook API não está configurado. Contate o administrador.';
        } else if (result.error?.includes('not configured')) {
          userMessage = 'Facebook API não está configurado. Contate o administrador.';
        }
        
        alert(`Erro ao publicar post: ${userMessage}`);
        onPostUpdate(); // Refresh to show failed status
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setPosting(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    if (deleting) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        onPostUpdate(); // Refresh posts
      } else {
        alert(`Erro ao deletar post: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get status styling
  const getStatusConfig = () => {
    switch (post.status) {
      case 'posted':
        return {
          icon: CheckCircle,
          label: 'PUBLICADO',
          className: 'status-badge status-posted',
          iconColor: 'text-green-600'
        };
      case 'failed':
        return {
          icon: XCircle,
          label: 'FALHOU',
          className: 'status-badge status-failed',
          iconColor: 'text-red-600'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          label: 'PENDENTE',
          className: 'status-badge status-pending',
          iconColor: 'text-yellow-600'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Format content for preview (limit lines)
  const formatContentPreview = (content: string, maxLines: number = 6) => {
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    
    return lines.slice(0, maxLines).join('\n') + '\n...';
  };

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-2/5 flex-shrink-0">
          <div className="relative aspect-square lg:h-80 w-full">
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
              priority={false}
            />
            
            {/* Status overlay */}
            <div className="absolute top-3 left-3">
              <div className={statusConfig.className}>
                <StatusIcon className={`inline h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
                {statusConfig.label}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="lg:w-3/5 flex flex-col">
          <div className="p-6 flex-grow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(post.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Deletar post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conteúdo:</h3>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {formatContentPreview(post.content)}
                </pre>
              </div>
            </div>

            {/* Metadata */}
            {post.metadata && (
              <div className="text-xs text-gray-500 mb-4">
                {post.metadata.filename && (
                  <div>Arquivo: {post.metadata.filename}</div>
                )}
                {post.metadata.workflow_id && (
                  <div>Workflow: {post.metadata.workflow_id}</div>
                )}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="border-t bg-gray-50 p-6">
            {post.status === 'pending' && (
              <button
                onClick={handlePost}
                disabled={posting}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {posting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>🚀 Poste agora</span>
                  </>
                )}
              </button>
            )}
            
            {post.status === 'posted' && post.facebook_post_id && (
              <div className="space-y-3">
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Publicado com sucesso!</span>
                </div>
                
                <a
                  href={`https://facebook.com/${post.facebook_post_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Ver no Facebook</span>
                </a>
                
                {post.posted_at && (
                  <div className="text-xs text-gray-500 text-center">
                    Publicado em {new Date(post.posted_at).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            )}
            
            {post.status === 'failed' && (
              <div className="space-y-3">
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Falha na publicação</span>
                </div>
                
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {posting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Tentando novamente...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      <span>Tentar novamente</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Deletar post?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta ação não pode ser desfeita. O post e a imagem serão removidos permanentemente.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex-1 flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Deletando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Deletar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

// Main dashboard page component
import { useEffect, useState } from 'react';
import { supabase, PostsService } from '@/lib/supabase';
import { Post } from '@/types/posts';
import PostGrid from '@/components/PostGrid';
import DashboardStats from '@/components/DashboardStats';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [facebookConfigured, setFacebookConfigured] = useState<boolean | null>(null);

  // Fetch posts from database
  const fetchPosts = async () => {
    try {
      setError(null);
      const posts = await PostsService.getAllPosts();
      setPosts(posts || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  // Check Facebook API configuration
  const checkFacebookConfig = async () => {
    try {
      const response = await fetch('/api/facebook/post');
      const result = await response.json();
      setFacebookConfigured(result.facebook_configured);
    } catch (error) {
      console.error('Error checking Facebook config:', error);
      setFacebookConfigured(false);
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await fetchPosts();
    await checkFacebookConfig();
  };

  // Real-time subscription setup
  useEffect(() => {
    // Initial fetch
    fetchPosts();
    checkFacebookConfig();

    // Set up real-time subscription
    const subscription = PostsService.subscribeToChanges((payload) => {
      console.log('Real-time update received:', payload);
      fetchPosts(); // Re-fetch all posts when changes occur
    });

    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate stats
  const stats = {
    total: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    posted: posts.filter(p => p.status === 'posted').length,
    failed: posts.filter(p => p.status === 'failed').length,
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Posts
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie e aprove conteúdo automatizado para redes sociais
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>

          {/* Last Update */}
          <div className="text-sm text-gray-500">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats stats={stats} />

      {/* Facebook Configuration Warning */}
      {facebookConfigured === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Facebook API não configurado
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Para publicar posts no Facebook, configure <code className="bg-amber-100 px-1 rounded">FACEBOOK_ACCESS_TOKEN</code> nas variáveis de ambiente.
                Posts criados aparecerão como "Falharam" até a configuração ser feita.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for First Use */}
      {posts.length === 0 && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-blue-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Nenhum post encontrado
            </h3>
            <p className="text-blue-700 mb-4">
              Posts criados pelo workflow n8n aparecerão aqui automaticamente.
            </p>
            <div className="text-sm text-blue-600 bg-blue-100 rounded-lg p-3">
              <p><strong>Para testar:</strong></p>
              <p>1. Execute o workflow n8n manualmente</p>
              <p>2. O webhook enviará dados para: <code>/api/webhook</code></p>
              <p>3. Posts aparecerão aqui em tempo real</p>
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 && (
        <PostGrid posts={posts} onPostUpdate={fetchPosts} />
      )}
    </div>
  );
}
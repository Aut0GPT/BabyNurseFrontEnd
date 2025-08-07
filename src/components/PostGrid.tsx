// Post grid component that displays all posts
import { useState } from 'react';
import { Post } from '@/types/posts';
import PostCard from '@/components/PostCard';
import { Filter } from 'lucide-react';

interface PostGridProps {
  posts: Post[];
  onPostUpdate: () => void;
}

type FilterType = 'all' | 'pending' | 'posted' | 'failed';

export default function PostGrid({ posts, onPostUpdate }: PostGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filter posts based on selected filter
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    
    if (sortBy === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const filterOptions = [
    { value: 'all', label: 'Todos', count: posts.length },
    { value: 'pending', label: 'Pendentes', count: posts.filter(p => p.status === 'pending').length },
    { value: 'posted', label: 'Publicados', count: posts.filter(p => p.status === 'posted').length },
    { value: 'failed', label: 'Falharam', count: posts.filter(p => p.status === 'failed').length },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Status Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as FilterType)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Sort Control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Mostrando {sortedPosts.length} de {posts.length} posts
        {filter !== 'all' && ` • Filtro: ${filterOptions.find(f => f.value === filter)?.label}`}
      </div>

      {/* Posts Grid */}
      {sortedPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Aguarde novos posts do workflow n8n' 
              : `Nenhum post com status "${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}"`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={onPostUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
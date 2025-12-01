'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/context/AuthContext';
import { postsAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import type { Post } from '@/types';

function ThreadsContent() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await postsAPI.getAll();
      const allPosts: Post[] = response.data.results || response.data || [];
      
      // Filter posts that have likes (as a placeholder for replies)
      const postsWithReplies = allPosts.filter(post => 
        post.likes_count && post.likes_count > 0
      );
      
      setThreads(postsWithReplies);
    } catch (err: unknown) {
      let message = 'Failed to load threads';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-purple-600" />
          Threads
        </h1>
        <p className="text-gray-600 mt-1">
          Explore conversations and ongoing discussions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Threads List */}
      <div className="space-y-4">
        {threads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <MessageSquare className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No threads yet
              </h3>
              <p className="text-gray-500">
                Threads with replies will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          threads.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onDelete={fetchThreads}
              onUpdate={fetchThreads}
              onLikeToggle={fetchThreads}
              showActions={true}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function ThreadsPage() {
  return (
    <ProtectedRoute>
      <ThreadsContent />
    </ProtectedRoute>
  );
}

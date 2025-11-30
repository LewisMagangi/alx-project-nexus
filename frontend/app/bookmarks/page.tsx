'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/context/AuthContext';
import { bookmarksAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Bookmark as BookmarkIcon } from 'lucide-react';
import type { Bookmark } from '../../types/index';

function BookmarksContent() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, [user?.id]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookmarksAPI.getAll();
      const data = response.data;
      // Support both array and paginated object
      if (Array.isArray(data)) {
        setBookmarks(data);
      } else if (Array.isArray(data.results)) {
        setBookmarks(data.results);
      } else {
        setBookmarks([]);
      }
    } catch (err: unknown) {
      let message = 'Failed to load bookmarks';
      if (err instanceof Error) {
        message = err.message;
      } else if (
        err !== null &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
        message = (err as { message: string }).message;
      } else {
        message = String(err);
      }
      setError(message);
      setBookmarks([]);
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookmarkIcon className="h-8 w-8 text-blue-600" />
          Bookmarks
        </h1>
        <p className="text-gray-600 mt-1">
          Posts you&apos;ve saved for later
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Bookmarks List */}
      <div className="space-y-4">
        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <BookmarkIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No bookmarks yet
              </h3>
              <p className="text-gray-500">
                Bookmark posts to save them for later
              </p>
            </CardContent>
          </Card>
        ) : (
          bookmarks.map((bookmark: Bookmark) => (
            bookmark.post ? (
              <PostCard
                key={bookmark.id}
                post={bookmark.post}
                currentUserId={user?.id}
                onDelete={fetchBookmarks}
                onLikeToggle={fetchBookmarks}
              />
            ) : null
          ))
        )}
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}

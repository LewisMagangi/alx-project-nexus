'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { postsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Hash, TrendingUp, RefreshCw } from 'lucide-react';
import PostCard from '@/components/PostCard';
import type { Post } from '@/types';

interface TrendingHashtag {
  id: number;
  tag: string;
  post_count: number;
}

function DashboardContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendingHashtags = useCallback(async () => {
    try {
      const response = await postsAPI.getTrendingHashtags();
      setTrendingHashtags(response.data?.results || response.data || []);
    } catch (err) {
      console.error('Failed to load trending hashtags:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTrendingHashtags();
  }, [fetchPosts, fetchTrendingHashtags]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchTrendingHashtags()]);
    setRefreshing(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    setError('');
    try {
      await postsAPI.create({ content: newPost });
      setNewPost('');
      await fetchPosts();
      await fetchTrendingHashtags(); // Refresh hashtags in case new ones were added
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async () => {
    await fetchPosts();
  };

  const handleLikeToggle = async () => {
    await fetchPosts();
  };

  const handleRetweet = async () => {
    await fetchPosts();
  };

  // Extract hashtags from input for preview
  const extractedHashtags = newPost.match(/#\w+/g) || [];
  const extractedMentions = newPost.match(/@\w+/g) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Create Post */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">What&apos;s on your mind?</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts... Use #hashtags and @mentions!"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  maxLength={280}
                  disabled={posting}
                  className="min-h-[100px] resize-none"
                />

                {/* Preview extracted hashtags and mentions */}
                {(extractedHashtags.length > 0 || extractedMentions.length > 0) && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    {extractedHashtags.map((tag, i) => (
                      <span key={`tag-${i}`} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {extractedMentions.map((mention, i) => (
                      <span key={`mention-${i}`} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {mention}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${newPost.length > 260 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {newPost.length}/280
                  </span>
                  <Button type="submit" disabled={posting || !newPost.trim()}>
                    {posting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-2 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Feed</h2>
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No posts yet. Be the first to post!
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onDelete={handleDeletePost}
                  onUpdate={handleRefresh}
                  onLikeToggle={handleLikeToggle}
                  onRetweet={handleRetweet}
                  showActions={true}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 width on large screens, hidden on mobile */}
        <div className="hidden lg:block space-y-6">
          {/* Trending Hashtags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Trending Hashtags</h3>
              </div>
            </CardHeader>
            <CardContent>
              {trendingHashtags.length === 0 ? (
                <p className="text-sm text-gray-500">No trending hashtags yet</p>
              ) : (
                <div className="space-y-3">
                  {trendingHashtags.slice(0, 10).map((hashtag) => (
                    <Link
                      key={hashtag.id}
                      href={`/explore?hashtag=${hashtag.tag}`}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">#{hashtag.tag}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {hashtag.post_count} {hashtag.post_count === 1 ? 'post' : 'posts'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Quick Links</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/explore" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation">
                🔍 Explore
              </Link>
              <Link href="/follows" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation">
                👥 Follows
              </Link>
              <Link href="/bookmarks" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation">
                🔖 Bookmarks
              </Link>
              <Link href="/notifications" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation">
                🔔 Notifications
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

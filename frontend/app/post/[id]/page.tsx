'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { postsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, RefreshCw, MessageCircle, AlertCircle, Send } from 'lucide-react';
import PostCard from '@/components/PostCard';
import type { Post } from '@/types';

function PostDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const postId = params.id as string;

  // State
  const [post, setPost] = useState<Post | null>(null);
  const [thread, setThread] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Reply state
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');

  // Fetch the post
  const fetchPost = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError('');
    setNotFound(false);

    try {
      const response = await postsAPI.getById(parseInt(postId, 10));
      setPost(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch post:', err);
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        setNotFound(true);
        setError('This post was not found or has been deleted.');
      } else {
        setError('Failed to load post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Fetch the thread (replies)
  const fetchThread = useCallback(async () => {
    if (!postId) return;

    try {
      const response = await postsAPI.getThread(parseInt(postId, 10));
      // Thread response may be an array or have results property
      const threadData = response.data?.results || response.data || [];
      setThread(Array.isArray(threadData) ? threadData : []);
    } catch (err) {
      console.error('Failed to fetch thread:', err);
      // Non-critical error, thread may be empty
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchThread();
  }, [fetchPost, fetchThread]);

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([fetchPost(), fetchThread()]);
  };

  // Handle reply submission
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !post) return;

    setReplying(true);
    setReplyError('');

    try {
      await postsAPI.create({
        content: replyContent.trim(),
        parent_post: post.id,
      });
      setReplyContent('');
      await fetchThread(); // Refresh replies
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; detail?: string } } };
      setReplyError(error.response?.data?.message || error.response?.data?.detail || 'Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  // Get the username from the post
  const getPostUsername = (p: Post) => {
    if (typeof p.user === 'object' && p.user !== null) {
      return p.user.username;
    }
    return p.username || 'Unknown';
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Post</h1>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Post Not Found</h2>
            <p className="text-gray-500 mb-4">
              This post may have been deleted or doesn&apos;t exist.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !notFound) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Post</h1>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Post</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Parent post reference (if this is a reply) */}
      {post.parent_post && (
        <div className="mb-4">
          <Link
            href={`/post/${post.parent_post}`}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            View parent post
          </Link>
        </div>
      )}

      {/* Main Post */}
      <div className="mb-6">
        <PostCard
          post={post}
          currentUserId={user?.id}
          onDelete={() => router.push('/dashboard')}
          onUpdate={handleRefresh}
          onLikeToggle={handleRefresh}
          onRetweet={handleRefresh}
          showActions={true}
        />
      </div>

      {/* Reply Form */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Reply to @{getPostUsername(post)}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReply} className="space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength={500}
              disabled={replying}
              className="min-h-[80px] resize-none"
            />

            {replyError && (
              <p className="text-sm text-red-500">{replyError}</p>
            )}

            <div className="flex justify-between items-center">
              <span className={`text-sm ${replyContent.length > 450 ? 'text-orange-500' : 'text-gray-500'}`}>
                {replyContent.length}/500
              </span>
              <Button
                type="submit"
                disabled={replying || !replyContent.trim()}
                size="sm"
              >
                {replying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Replying...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Thread / Replies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Replies ({thread.length})
        </h3>

        {thread.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No replies yet. Be the first to reply!
            </CardContent>
          </Card>
        ) : (
          thread.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              currentUserId={user?.id}
              onDelete={handleRefresh}
              onUpdate={handleRefresh}
              onLikeToggle={handleRefresh}
              onRetweet={handleRefresh}
              showActions={true}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  return (
    <ProtectedRoute>
      <PostDetailContent />
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { postsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Quote, MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import type { Post } from '@/types';

function ComposeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useAuth();

  // URL params
  const quoteId = searchParams.get('quote');
  const replyId = searchParams.get('reply');

  // State
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [quotedPost, setQuotedPost] = useState<Post | null>(null);
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteNotFound, setQuoteNotFound] = useState(false);

  // Fetch the quoted post if quoteId is provided
  const fetchQuotedPost = useCallback(async () => {
    if (!quoteId) return;

    setLoadingQuote(true);
    setQuoteNotFound(false);
    try {
      const response = await postsAPI.getById(parseInt(quoteId, 10));
      setQuotedPost(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch quoted post:', err);
      setQuoteNotFound(true);
      setError('The post you are trying to quote was not found or has been deleted.');
    } finally {
      setLoadingQuote(false);
    }
  }, [quoteId]);

  // Fetch the reply-to post if replyId is provided
  const fetchReplyToPost = useCallback(async () => {
    if (!replyId) return;

    setLoadingQuote(true);
    try {
      const response = await postsAPI.getById(parseInt(replyId, 10));
      setReplyToPost(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch reply-to post:', err);
      setError('The post you are trying to reply to was not found or has been deleted.');
    } finally {
      setLoadingQuote(false);
    }
  }, [replyId]);

  useEffect(() => {
    fetchQuotedPost();
    fetchReplyToPost();
  }, [fetchQuotedPost, fetchReplyToPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    setError('');

    try {
      const postData: {
        content: string;
        parent_post?: number | null;
        quote_of?: number | null;
      } = {
        content: content.trim(),
      };

      // Add reply reference if replying
      if (replyId && replyToPost) {
        postData.parent_post = parseInt(replyId, 10);
      }

      // Add quote reference if quoting
      if (quoteId && quotedPost) {
        postData.quote_of = parseInt(quoteId, 10);
      }

      await postsAPI.create(postData);

      // Redirect to dashboard after successful post
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; detail?: string } } };
      setError(error.response?.data?.message || error.response?.data?.detail || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  // Extract hashtags and mentions for preview
  const extractedHashtags = content.match(/#\w+/g) || [];
  const extractedMentions = content.match(/@\w+/g) || [];

  // Get the username from the post (handles both object and ID cases)
  const getPostUsername = (post: Post) => {
    if (typeof post.user === 'object' && post.user !== null) {
      return post.user.username;
    }
    return post.username || 'Unknown';
  };

  // Determine the page title and context
  const getPageContext = () => {
    if (quoteId) return { title: 'Quote Tweet', icon: Quote };
    if (replyId) return { title: 'Reply', icon: MessageCircle };
    return { title: 'Compose', icon: null };
  };

  const pageContext = getPageContext();

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {pageContext.icon && <pageContext.icon className="h-6 w-6 text-blue-500" />}
          {pageContext.title}
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700">{error}</p>
            {quoteNotFound && (
              <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mt-1 block">
                Return to Dashboard
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Loading state for quoted/reply post */}
      {loadingQuote && (
        <div className="flex justify-center items-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* Compose form */}
      {!quoteNotFound && (
        <Card>
          <CardHeader>
            <p className="text-gray-600">
              {quoteId ? 'Add your thoughts to this quote tweet' :
               replyId ? 'Write your reply' :
               'What\'s on your mind?'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reply context */}
              {replyToPost && (
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                  <p className="text-sm text-gray-500 mb-1">
                    Replying to <span className="font-medium text-blue-600">@{getPostUsername(replyToPost)}</span>
                  </p>
                  <p className="text-gray-700 line-clamp-3">{replyToPost.content}</p>
                </div>
              )}

              {/* Text input */}
              <Textarea
                placeholder={
                  quoteId ? "Add your comment..." :
                  replyId ? "Write your reply..." :
                  "Share your thoughts... Use #hashtags and @mentions!"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                disabled={posting}
                className="min-h-30 resize-none"
                autoFocus
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

              {/* Quoted post preview */}
              {quotedPost && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Quoting</span>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium text-gray-800">@{getPostUsername(quotedPost)}</p>
                    <p className="text-gray-600 mt-1 line-clamp-3">{quotedPost.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(quotedPost.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Character count and submit */}
              <div className="flex justify-between items-center pt-2">
                <span className={`text-sm ${content.length > 450 ? 'text-orange-500' : content.length > 480 ? 'text-red-500' : 'text-gray-500'}`}>
                  {content.length}/500
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={posting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={posting || !content.trim()}
                  >
                    {posting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      quoteId ? 'Quote Tweet' : replyId ? 'Reply' : 'Post'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Post not found state */}
      {quoteNotFound && !loadingQuote && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Post Not Found</h2>
            <p className="text-gray-500 mb-4">
              The post you&apos;re trying to quote may have been deleted or doesn&apos;t exist.
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
      )}
    </div>
  );
}

// Loading fallback for Suspense
function ComposeLoading() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    </div>
  );
}

export default function ComposePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<ComposeLoading />}>
        <ComposeContent />
      </Suspense>
    </ProtectedRoute>
  );
}

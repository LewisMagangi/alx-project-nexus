'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Bookmark, Trash2, MoreHorizontal, Repeat2, Quote, Pencil, X, Check, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Post } from '../types/index';
import { likesAPI, bookmarksAPI, postsAPI } from '@/services/api';
import { formatDistanceToNow } from '@/lib/date-utils';

interface PostCardProps {
  post: Post;
  currentUserId?: number;
  onDelete?: () => void;
  onUpdate?: () => void;
  onLikeToggle?: () => void;
  onRetweet?: () => void;
  showActions?: boolean;
}

// Helper function to render content with clickable hashtags and mentions
function renderContentWithLinks(content: string): React.ReactNode {
  if (!content) return null;

  // Regex to match hashtags and mentions
  const parts = content.split(/(#\w+|@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.slice(1);
      return (
        <Link
          key={index}
          href={`/explore?hashtag=${tag}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <Link
          key={index}
          href={`/profile/${username}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

export default function PostCard({
  post,
  currentUserId,
  onDelete,
  onUpdate,
  onLikeToggle,
  onRetweet,
  showActions = true,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(!!post.is_liked || !!post.is_liked_by_user);
  const [likesCount, setLikesCount] = useState<number>(post.likes_count ?? post.like_count ?? 0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(!!post.is_bookmarked || !!post.is_bookmarked_by_user);
  const [isRetweeted, setIsRetweeted] = useState<boolean>(!!post.is_retweeted_by_user);
  const [retweetCount, setRetweetCount] = useState<number>(post.retweet_count ?? 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>(post.content ?? '');
  const [editError, setEditError] = useState<string>('');

  // Determine the post owner's ID
  // Backend can return: user as number (ID), user as object {id, username}, or legacy user_id
  const postOwnerId: number | undefined =
    typeof post.user === 'object' && post.user !== null
      ? post.user.id
      : (post.user_id ?? post.user);

  // Support both user_id and user object for compatibility
  const isOwnPost = currentUserId !== undefined && postOwnerId !== undefined && currentUserId === postOwnerId;

  // Debug log - remove after confirming fix
  console.log('PostCard Debug:', {
    postId: post.id,
    currentUserId,
    postUser: post.user,
    postUserId: post.user_id,
    postOwnerId,
    isOwnPost,
    showActions
  });

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike - need to find and delete the like
        const likesResponse = await likesAPI.getAll();
        type Like = { id: number; post: number; user: number };
        const like = (likesResponse.data.results as Like[] | undefined)?.find(
          (l) => l.post === post.id && l.user === currentUserId
        );
        if (like) {
          await likesAPI.delete(like.id);
          setLikesCount((prev) => Math.max(0, prev - 1));
          setIsLiked(false);
        }
      } else {
        // Like
        await likesAPI.create(post.id);
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      }
      onLikeToggle?.();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarksResponse = await bookmarksAPI.getAll();
        type Bookmark = { id: number; post: { id: number }; user: number };
        const bookmark = (bookmarksResponse.data.results as Bookmark[] | undefined)?.find(
          (b) => b.post.id === post.id && b.user === currentUserId
        );
        if (bookmark) {
          await bookmarksAPI.delete(bookmark.id);
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        await bookmarksAPI.create(post.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetweet = async () => {
    if (isLoading || isOwnPost) return;
    setIsLoading(true);
    try {
      if (isRetweeted) {
        // Unretweet
        await postsAPI.unretweet(post.id);
        setRetweetCount((prev) => Math.max(0, prev - 1));
        setIsRetweeted(false);
      } else {
        // Retweet
        await postsAPI.retweet(post.id);
        setRetweetCount((prev) => prev + 1);
        setIsRetweeted(true);
      }
      onRetweet?.();
    } catch (error) {
      console.error('Failed to toggle retweet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsLoading(true);
    try {
      await postsAPI.delete(post.id);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit handlers
  const handleStartEdit = () => {
    setEditContent(post.content ?? '');
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(post.content ?? '');
    setEditError('');
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setEditError('Post content cannot be empty');
      return;
    }
    setIsLoading(true);
    setEditError('');
    try {
      await postsAPI.update(post.id, { content: editContent.trim() });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update post:', error);
      setEditError('Failed to update post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={post.is_retweet ? 'border-l-4 border-l-green-500' : ''}>
      <CardContent className="p-6">
        {/* Retweet indicator */}
        {post.is_retweet && !post.is_quote_tweet && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3 -mt-2">
            <Repeat2 className="h-4 w-4" />
            <span>Retweeted</span>
          </div>
        )}

        {/* Quote Tweet indicator */}
        {post.is_quote_tweet && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3 -mt-2">
            <Quote className="h-4 w-4" />
            <span>Quote Tweet</span>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.username ?? (typeof post.user === 'object' && post.user ? post.user.username : 'unknown')}`}>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity">
                {(() => {
                  if (typeof post.username === 'string' && post.username.length > 0) {
                    return post.username[0].toUpperCase();
                  } else if (typeof post.user === 'object' && post.user && typeof post.user.username === 'string' && post.user.username.length > 0) {
                    return post.user.username[0].toUpperCase();
                  } else if (typeof post.user_id === 'number') {
                    return String(post.user_id);
                  }
                  return '?';
                })()}
              </div>
            </Link>
            <div>
              <Link href={`/profile/${post.username ?? (typeof post.user === 'object' && post.user ? post.user.username : 'unknown')}`}>
                <p className="font-semibold hover:underline cursor-pointer">
                  @{post.username ?? (typeof post.user === 'object' && post.user ? post.user.username : 'unknown')}
                </p>
              </Link>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(post.created_at)}
              </p>
            </div>
          </div>

          {showActions && isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleStartEdit}
                  disabled={isLoading || isEditing}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Reply indicator */}
        {post.parent_post && (
          <p className="text-sm text-blue-500 mb-2">
            <Link href={`/post/${post.parent_post}`} className="hover:underline">
              Replying to a post
            </Link>
          </p>
        )}

        {/* Content with clickable hashtags and mentions */}
        {isEditing ? (
          <div className="mb-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            {editError && (
              <p className="text-red-500 text-sm mt-1">{editError}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {editContent.length}/500 characters
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editContent.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {renderContentWithLinks(post.content ?? '')}
          </div>
        )}

        {/* Quoted post (for quote tweets) */}
        {post.is_quote_tweet && (() => {
          // Get the quoted post data from either retweet_of or retweet_of_data
          const quotedPost = post.retweet_of_data || (typeof post.retweet_of === 'object' ? post.retweet_of : null);
          if (!quotedPost) return null;

          const quotedUsername = quotedPost.username ||
            (typeof quotedPost.user === 'object' && quotedPost.user ? quotedPost.user.username : 'unknown');

          return (
            <Link href={`/post/${quotedPost.id}`} className="block">
              <div className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="h-4 w-4 text-green-500" />
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                    {quotedUsername?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="font-semibold text-sm">
                    @{quotedUsername}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(quotedPost.created_at)}
                  </span>
                </div>
                {/* Use plain text to avoid nested <a> tags inside the Link */}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {quotedPost.content ?? ''}
                </p>
              </div>
            </Link>
          );
        })()}

        {/* Hashtags display (if provided as structured data) */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.hashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                href={`/explore?hashtag=${hashtag.tag}`}
                className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                #{hashtag.tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions - Order: Reply/Threads, Retweet, Like, Views (left to right) */}
        {showActions && (
          <div className="flex items-center gap-1 pt-3 border-t">
            {/* Reply/Threads Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              asChild
            >
              <Link href={`/post/${post.id}`}>
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="text-sm">{post.reply_count ?? 0}</span>
              </Link>
            </Button>

            {/* Retweet dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading || isOwnPost}
                  className={`flex items-center gap-2 hover:text-green-500 hover:bg-green-50 transition-colors ${
                    isRetweeted ? 'text-green-500' : ''
                  }`}
                >
                  <Repeat2 className={`h-5 w-5 ${isRetweeted ? 'text-green-500' : 'text-green-400'}`} />
                  <span className="text-sm">{retweetCount}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={handleRetweet}
                  disabled={isLoading}
                >
                  <Repeat2 className="h-4 w-4 mr-2" />
                  {isRetweeted ? 'Undo Retweet' : 'Retweet'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/compose?quote=${post.id}`}>
                    <Quote className="h-4 w-4 mr-2" />
                    Quote Tweet
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className="flex items-center gap-2 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-red-400'
                }`}
              />
              <span className="text-sm">{likesCount}</span>
            </Button>

            {/* Views/Analytics Placeholder */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:text-purple-500 hover:bg-purple-50 transition-colors"
              disabled
            >
              <Eye className="h-5 w-5 text-purple-400" />
              <span className="text-sm">--</span>
            </Button>

            {/* Bookmark Button (right side) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isLoading}
              className="flex items-center gap-2 hover:text-amber-500 hover:bg-amber-50 ml-auto transition-colors"
            >
              <Bookmark
                className={`h-5 w-5 ${
                  isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-amber-400'
                }`}
              />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

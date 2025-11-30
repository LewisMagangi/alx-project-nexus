'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Bookmark, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Post } from '../types/index';
import { likesAPI, bookmarksAPI, postsAPI } from '@/services/api';
import { formatDistanceToNow } from '@/lib/date-utils';

interface PostCardProps {
  post: Post;
  currentUserId?: number;
  onDelete?: () => void;
  onLikeToggle?: () => void;
  showActions?: boolean;
}

export default function PostCard({
  post,
  currentUserId,
  onDelete,
  onLikeToggle,
  showActions = true,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(!!post.is_liked);
  const [likesCount, setLikesCount] = useState<number>(post.likes_count ?? 0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(!!post.is_bookmarked);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Support both user_id and user object for compatibility
  const isOwnPost = currentUserId === (typeof post.user === 'object' && post.user ? post.user.id : post.user_id);

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

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
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
            <div>
              <p className="font-semibold hover:underline cursor-pointer">
                @{post.username ?? (typeof post.user === 'object' && post.user ? post.user.username : 'unknown')}
              </p>
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

        {/* Content */}
        <p className="mb-4 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          {post.content ?? ''}
        </p>

        {/* Reply indicator */}
        {post.parent_post && (
          <p className="text-sm text-gray-500 mb-3">
            Replying to a post
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-4 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Heart
                className={`h-5 w-5 ${
                  isLiked ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.replies_count ?? 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isLoading}
            >
              <Bookmark
                className={`h-5 w-5 ${
                  isBookmarked ? 'fill-blue-500 text-blue-500' : ''
                }`}
              />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

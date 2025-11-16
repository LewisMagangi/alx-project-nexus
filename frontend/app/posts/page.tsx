'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { postsAPI, likesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Trash2 } from 'lucide-react';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
}

function PostsContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        const likesResponse = await likesAPI.getAll();
        const like = likesResponse.data.find(
          (l: any) => l.post_id === postId && l.user_id === user?.id
        );
        if (like) {
          await likesAPI.delete(like.id);
        }
      } else {
        await likesAPI.create(postId);
      }
      await fetchPosts();
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.delete(postId);
      await fetchPosts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">All Posts</h1>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No posts yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">@{post.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  {post.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <p className="mb-4">{post.content}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id, post.is_liked)}
                    className="flex items-center gap-1"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        post.is_liked ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    <span>{post.likes_count}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <ProtectedRoute>
      <PostsContent />
    </ProtectedRoute>
  );
}

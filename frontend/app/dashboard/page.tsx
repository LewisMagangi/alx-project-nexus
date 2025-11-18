'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { postsAPI, likesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart } from 'lucide-react';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
}

function DashboardContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());

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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    try {
      await postsAPI.create({ content: newPost });
      setNewPost('');
      await fetchPosts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number, isLiked: boolean) => {
    if (likingPosts.has(postId)) return;

    setLikingPosts(prev => new Set(prev).add(postId));

    try {
      if (isLiked) {
        // Find like ID and delete
        const likesResponse = await likesAPI.getAll();
        const like = likesResponse.data.find(
          (l: any) => l.post === postId && l.user === user?.id
        );
        if (like) {
          await likesAPI.delete(like.id);
        }
      } else {
        await likesAPI.create(postId);
      }
      await fetchPosts();
    } catch (err: any) {
      // Log backend error details for debugging
      console.error('Failed to toggle like', err);
      console.error('Backend error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to toggle like');
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Create a Post</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Input
              placeholder="What's happening? (max 280 chars)"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              maxLength={280}
              disabled={posting}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
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
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">@{post.username}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mb-4">{post.content}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id, post.is_liked)}
                    disabled={likingPosts.has(post.id)}
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
          ))
        )}
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

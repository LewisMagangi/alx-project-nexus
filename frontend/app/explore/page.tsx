// frontend/app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { postsAPI, followsAPI, usersAPI, searchAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserCheck, Heart } from 'lucide-react';

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Follow {
  id: number;
  follower: number;
  following: number;
}

function ExploreContent() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    posts: Post[];
  }>({ users: [], posts: [] });
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [postsRes, usersRes, followsRes] = await Promise.all([
          postsAPI.getAll(),
          usersAPI.getAll(),
          followsAPI.getAll(),
        ]);

        const posts: Post[] = postsRes.data.results ?? postsRes.data ?? [];
        setAllPosts(posts);

        const usersData: User[] = (usersRes.data.results ?? usersRes.data ?? []).filter(
          (u: User) => u.id !== currentUser?.id
        );
        setSuggestedUsers(usersData);

        const follows: Follow[] = followsRes.data.results ?? followsRes.data ?? [];
        const followingSet = new Set<number>(
          follows
            .filter((f: Follow) => f.follower === currentUser?.id)
            .map((f: Follow) => f.following)
        );
        setFollowingIds(followingSet);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchAPI.search(searchQuery);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await followsAPI.create(userId);
      const newSet = new Set(followingIds);
      newSet.add(userId);
      setFollowingIds(newSet);
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const followsRes = await followsAPI.getAll();
      const follows: Follow[] = followsRes.data.results ?? followsRes.data ?? [];
      const follow = follows.find(
        (f: Follow) => f.follower === currentUser?.id && f.following === userId
      );
      if (follow) {
        await followsAPI.delete(follow.id);
        const newSet = new Set(followingIds);
        newSet.delete(userId);
        setFollowingIds(newSet);
      }
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users or posts..."
          className="flex-1 rounded-md border px-3 py-2"
        />
        <Button type="submit" size="sm" disabled={loading}>
          Search
        </Button>
      </form>

      {/* Search Results or Browse Content */}
      {searchQuery && searchResults.users.length + searchResults.posts.length > 0 ? (
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger
              value="users"
              className="touch-manipulation cursor-pointer hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 py-2.5 transition-colors"
            >
              Users ({searchResults.users.length})
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="touch-manipulation cursor-pointer hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 py-2.5 transition-colors"
            >
              Posts ({searchResults.posts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3">
            {searchResults.users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div
                    className="cursor-pointer flex-1"
                    onClick={() => router.push(`/profile/${user.username}`)}
                  >
                    <p className="font-semibold">@{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {followingIds.has(user.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleFollow(user.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="posts" className="space-y-3">
            {searchResults.posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">@{post.username}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="mb-3">{post.content}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes_count || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger
              value="posts"
              className="touch-manipulation cursor-pointer hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 py-2.5 transition-colors"
            >
              All Posts
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="touch-manipulation cursor-pointer hover:bg-gray-100 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 py-2.5 transition-colors"
            >
              Suggested Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-3">
            {allPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No posts available yet
                </CardContent>
              </Card>
            ) : (
              allPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">@{post.username}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="mb-3">{post.content}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes_count || 0}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-3">
            {suggestedUsers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No users to discover
                </CardContent>
              </Card>
            ) : (
              suggestedUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => router.push(`/profile/${user.username}`)}
                    >
                      <p className="font-semibold">@{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {followingIds.has(user.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnfollow(user.id)}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleFollow(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <ExploreContent />
    </ProtectedRoute>
  );
}

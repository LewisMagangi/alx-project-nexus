'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { followsAPI, usersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Follow {
  id: number;
  follower: number;
  following: number;
  follower_username?: string;
  following_username?: string;
}

function FollowsContent() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // helper to extract an error message from unknown error shapes (incl. axios)
  const getErrorMessage = (error: unknown, fallback = 'An error occurred') => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    const errObj = error as { response?: { data?: { message?: string; detail?: string; following?: string[] } } } | undefined;

    // Check for DRF validation errors
    if (errObj?.response?.data?.detail) return errObj.response.data.detail;
    if (errObj?.response?.data?.following) return errObj.response.data.following[0];
    if (errObj?.response?.data?.message) return errObj.response.data.message;

    return fallback;
  };

  const fetchData = useCallback(async () => {
    try {
      const [followsRes, usersRes] = await Promise.all([
        followsAPI.getAll(),
        usersAPI.getAll(),
      ]);

      // Handle both paginated and array responses
      const allFollows = Array.isArray(followsRes.data)
        ? followsRes.data
        : (followsRes.data.results || []);

      const allUsersData = Array.isArray(usersRes.data)
        ? usersRes.data
        : (usersRes.data.results || []);

      setFollowers(allFollows.filter((f: Follow) => f.following === user?.id));
      setFollowing(allFollows.filter((f: Follow) => f.follower === user?.id));
      setAllUsers(allUsersData.filter((u: User) => u.id !== user?.id));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollow = async (userId: number) => {
    try {
      console.log('Attempting to follow user ID:', userId);
      const response = await followsAPI.create(userId);
      console.log('Follow response:', response);
      await fetchData();
    } catch (err: unknown) {
      console.error('Follow error:', err);
      const axiosErr = err as { response?: { data?: unknown } };
      console.error('Error response data:', axiosErr?.response?.data);
      setError(getErrorMessage(err, 'Failed to follow user'));
    }
  };

  const handleUnfollow = async (followId: number) => {
    try {
      await followsAPI.delete(followId);
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to unfollow user'));
    }
  };

  const isFollowing = (userId: number) => {
    return following.some((f) => f.following === userId);
  };

  const getFollowId = (userId: number) => {
    return following.find((f) => f.following === userId)?.id;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Follows</h1>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Tabs defaultValue="discover">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="followers">
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({following.length})
          </TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="followers" className="space-y-4">
          {followers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No followers yet
              </CardContent>
            </Card>
          ) : (
            followers.map((follow) => {
              const followerUser = allUsers.find((u) => u.id === follow.follower);
              return (
                <Card key={follow.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">@{followerUser?.username}</p>
                      <p className="text-sm text-gray-500">{followerUser?.email}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          {following.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Not following anyone yet
              </CardContent>
            </Card>
          ) : (
            following.map((follow) => {
              const followingUser = allUsers.find((u) => u.id === follow.following);
              return (
                <Card key={follow.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">@{followingUser?.username}</p>
                      <p className="text-sm text-gray-500">{followingUser?.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(follow.id)}
                    >
                      Unfollow
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {allUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No users to discover
              </CardContent>
            </Card>
          ) : (
            allUsers.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">@{u.username}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  {isFollowing(u.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const followId = getFollowId(u.id);
                        if (followId) handleUnfollow(followId);
                      }}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleFollow(u.id)}>
                      Follow
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FollowsPage() {
  return (
    <ProtectedRoute>
      <FollowsContent />
    </ProtectedRoute>
  );
}

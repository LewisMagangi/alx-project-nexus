'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { usersAPI, postsAPI, followsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Link as LinkIcon, Calendar, UserPlus, UserCheck, CheckCircle, Settings } from 'lucide-react';
import PostCard from '@/components/PostCard';
import styles from './profile.module.css';

interface UserProfile {
  id: number;
  username: string;
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    avatar_url?: string;
    header_url?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
    is_verified: boolean;
  };
}

interface Post {
  id: number;
  user_id: number;
  username: string;
  user: number;
  content: string;
  created_at: string;
  likes_count?: number;
  reply_count?: number;
  replies_count?: number;
  retweet_count?: number;
  retweets_count?: number;
  quote_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_retweeted?: boolean;
  media_urls?: string[];
  is_quote_tweet?: boolean;
  is_retweet?: boolean;
  is_reply?: boolean;
}

interface Follow {
  id: number;
  follower: number;
  following: number;
}

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userRes = await usersAPI.getByUsername(username);
        setProfileUser(userRes.data);

        // Fetch user's posts
        const postsRes = await postsAPI.getUserPosts(userRes.data.id);
        const userPosts = Array.isArray(postsRes.data)
          ? postsRes.data
          : (postsRes.data.results || []);
        setPosts(userPosts);

        // Check if current user is following this profile
        if (!isOwnProfile) {
          const followsRes = await followsAPI.getAll();
          const allFollows = Array.isArray(followsRes.data)
            ? followsRes.data
            : (followsRes.data.results || []);

          const existingFollow = allFollows.find(
            (f: Follow) => f.follower === currentUser?.id && f.following === userRes.data.id
          );

          if (existingFollow) {
            setIsFollowing(true);
            setFollowId(existingFollow.id);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load profile:', err);
        if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'detail' in err.response.data) {
          setError((err.response as { data: { detail?: string } }).data.detail || 'Failed to load user profile');
        } else {
          setError('Failed to load user profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!profileUser) return;

    try {
      const response = await followsAPI.create(profileUser.id);
      setIsFollowing(true);
      setFollowId(response.data.id);

      // Update follower count
      setProfileUser({
        ...profileUser,
        profile: {
          ...profileUser.profile,
          followers_count: profileUser.profile.followers_count + 1
        }
      });
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  const handleUnfollow = async () => {
    if (!followId) return;

    try {
      await followsAPI.delete(followId);
      setIsFollowing(false);
      setFollowId(null);

      // Update follower count
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          profile: {
            ...profileUser.profile,
            followers_count: Math.max(0, profileUser.profile.followers_count - 1)
          }
        });
      }
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || 'User not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Image */}
      <div
        className={
          profileUser.profile.header_url
            ? `${styles.headerImage} ${styles.headerImageCustom} ${styles.headerImageWithBg}`
            : styles.headerImage
        }
        {...(profileUser.profile.header_url && {
          'data-bg': profileUser.profile.header_url
        })}
      >
        {profileUser.profile.header_url && (
          <Image
            src={profileUser.profile.header_url}
            alt="Profile header"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex justify-between items-start -mt-16 mb-4">
          {/* Avatar */}
          <div className={styles.avatar}>
            {profileUser.profile.avatar_url ? (
              <Image
                src={profileUser.profile.avatar_url}
                alt={profileUser.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
                {profileUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4">
            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                {isFollowing ? (
                  <Button variant="outline" onClick={handleUnfollow}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </Button>
                ) : (
                  <Button onClick={handleFollow}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Username and Verification */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">@{profileUser.username}</h1>
            {profileUser.profile.is_verified && (
              <CheckCircle className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>

        {/* Bio */}
        {profileUser.profile.bio && (
          <p className="text-gray-700 mb-4">{profileUser.profile.bio}</p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {profileUser.profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profileUser.profile.location}</span>
            </div>
          )}
          {profileUser.profile.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <a
                href={profileUser.profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {profileUser.profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined Project Nexus</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm mb-6">
          <div>
            <span className="font-bold">{profileUser.profile.following_count}</span>
            <span className="text-gray-600 ml-1">Following</span>
          </div>
          <div>
            <span className="font-bold">{profileUser.profile.followers_count}</span>
            <span className="text-gray-600 ml-1">Followers</span>
          </div>
          <div>
            <span className="font-bold">{profileUser.profile.posts_count}</span>
            <span className="text-gray-600 ml-1">Posts</span>
          </div>
        </div>

        {/* Posts Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No posts yet
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        reply_count: post.reply_count ?? post.replies_count ?? 0,
                        retweet_count: post.retweet_count ?? post.retweets_count ?? 0,
                        likes_count: post.likes_count ?? 0,
                        quote_count: post.quote_count ?? 0,
                        is_quote_tweet: post.is_quote_tweet ?? false,
                        is_retweet: post.is_retweet ?? false,
                        is_reply: post.is_reply ?? false,
                      }}
                    />
                  ))
              )}
            </TabsContent>

          <TabsContent value="replies" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Replies coming soon
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Media coming soon
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

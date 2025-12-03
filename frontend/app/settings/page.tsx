// frontend/app/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { accountAPI, usersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Lock,
  Bell,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  header_url?: string;
}

function SettingsContent() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  // Account settings state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Profile settings state
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headerUrl, setHeaderUrl] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Notification preferences (mock for now)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [followNotifs, setFollowNotifs] = useState(true);
  const [likeNotifs, setLikeNotifs] = useState(true);
  const [replyNotifs, setReplyNotifs] = useState(true);

  // Fetch current profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.username) return;
    
    setProfileLoading(true);
    try {
      const response = await usersAPI.getByUsername(user.username);
      const profile = response.data?.profile as UserProfile;
      if (profile) {
        setBio(profile.bio || '');
        setLocation(profile.location || '');
        setWebsite(profile.website || '');
        setAvatarUrl(profile.avatar_url || '');
        setHeaderUrl(profile.header_url || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await accountAPI.update({ username, email });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setSuccess('Account updated successfully!');
      setIsEditingAccount(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'string'
          ? err
          : (typeof err === 'object' && err !== null && 'response' in err)
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await accountAPI.updateProfile({
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar_url: avatarUrl.trim(),
        header_url: headerUrl.trim(),
      });
      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'string'
          ? err
          : (typeof err === 'object' && err !== null && 'response' in err)
          ? (err as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error || 
            (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await accountAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message =
        typeof err === 'string'
          ? err
          : (typeof err === 'object' && err !== null && 'response' in err)
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await accountAPI.deactivate();
      logout(); // logout() already redirects to home page
    } catch (err: unknown) {
      const message =
        typeof err === 'string'
          ? err
          : (typeof err === 'object' && err !== null && 'response' in err)
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || 'Failed to deactivate account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Update your username and email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditingAccount || loading}
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingAccount || loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">User ID</label>
                  <Input value={user?.id} disabled />
                </div>

                {isEditingAccount ? (
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUsername(user?.username || '');
                        setEmail(user?.email || '');
                        setIsEditingAccount(false);
                        setError('');
                        setSuccess('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditingAccount(true)}
                  >
                    Edit Account
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Customize your public profile - bio, location, website, and images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!isEditingProfile || loading}
                      maxLength={160}
                      className="resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">{bio.length}/160 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={!isEditingProfile || loading}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Website
                    </label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={!isEditingProfile || loading}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label htmlFor="avatarUrl" className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Avatar URL
                    </label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://example.com/your-avatar.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      disabled={!isEditingProfile || loading}
                    />
                    <p className="text-xs text-gray-500">Direct link to your profile picture</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="headerUrl" className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Header Image URL
                    </label>
                    <Input
                      id="headerUrl"
                      type="url"
                      placeholder="https://example.com/your-header.jpg"
                      value={headerUrl}
                      onChange={(e) => setHeaderUrl(e.target.value)}
                      disabled={!isEditingProfile || loading}
                    />
                    <p className="text-xs text-gray-500">Direct link to your profile header/banner image</p>
                  </div>

                  {isEditingProfile ? (
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Profile'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          fetchProfile();
                          setIsEditingProfile(false);
                          setError('');
                          setSuccess('');
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deactivate Account</p>
                  <p className="text-sm text-gray-500">
                    Temporarily deactivate your account
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeactivateAccount}
                  disabled={loading}
                >
                  Deactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">General</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="emailNotifs" className="font-medium">Email Notifications</label>
                    <p id="emailNotifs-desc" className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    id="emailNotifs"
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    title="Email Notifications"
                    aria-describedby="emailNotifs-desc"
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="pushNotifs" className="font-medium">Push Notifications</label>
                    <p id="pushNotifs-desc" className="text-sm text-gray-500">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <input
                    id="pushNotifs"
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    title="Push Notifications"
                    aria-describedby="pushNotifs-desc"
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Activity</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="followNotifs" className="font-medium">New Followers</label>
                    <p id="followNotifs-desc" className="text-sm text-gray-500">
                      When someone follows you
                    </p>
                  </div>
                  <input
                    id="followNotifs"
                    type="checkbox"
                    checked={followNotifs}
                    onChange={(e) => setFollowNotifs(e.target.checked)}
                    title="New Followers"
                    aria-describedby="followNotifs-desc"
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="likeNotifs" className="font-medium">Likes</label>
                    <p id="likeNotifs-desc" className="text-sm text-gray-500">
                      When someone likes your post
                    </p>
                  </div>
                  <input
                    id="likeNotifs"
                    type="checkbox"
                    checked={likeNotifs}
                    onChange={(e) => setLikeNotifs(e.target.checked)}
                    title="Likes"
                    aria-describedby="likeNotifs-desc"
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="replyNotifs" className="font-medium">Replies</label>
                    <p id="replyNotifs-desc" className="text-sm text-gray-500">
                      When someone replies to your post
                    </p>
                  </div>
                  <input
                    id="replyNotifs"
                    type="checkbox"
                    checked={replyNotifs}
                    onChange={(e) => setReplyNotifs(e.target.checked)}
                    title="Replies"
                    aria-describedby="replyNotifs-desc"
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <Button variant="default">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="oldPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Logout
              </CardTitle>
              <CardDescription>
                Sign out of your account on this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

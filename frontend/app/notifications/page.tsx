// frontend/app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notificationsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, UserPlus, MessageCircle, CheckCheck } from 'lucide-react';

interface Notification {
  id: number;
  actor_username: string;
  verb: string;
  target_id: number | null;
  target_type: string | null;
  is_read: boolean;
  created_at: string;
}

function NotificationsContent() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      const notifs = response.data.results || response.data;
      setNotifications(notifs);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.target_type === 'post' && notification.target_id) {
      router.push(`/posts/${notification.target_id}`);
    } else if (notification.target_type === 'user' && notification.target_id) {
      router.push(`/profile/${notification.actor_username}`);
    }
  };

  const getNotificationIcon = (verb: string) => {
    if (verb.includes('liked')) return <Heart className="h-5 w-5 text-red-500" />;
    if (verb.includes('follow')) return <UserPlus className="h-5 w-5 text-blue-500" />;
    if (verb.includes('replied') || verb.includes('commented'))
      return <MessageCircle className="h-5 w-5 text-green-500" />;
    return <MessageCircle className="h-5 w-5 text-gray-500" />;
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.is_read);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <div className="flex justify-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                // Mark all as read
                await Promise.all(
                  notifications
                    .filter(n => !n.is_read)
                    .map(n => notificationsAPI.markAsRead(n.id))
                );
                await fetchNotifications();
              } catch (err) {
                console.error('Failed to mark all as read:', err);
              }
            }}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3 mt-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : "No notifications yet. Start interacting to get notified!"}
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.verb)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">
                          @{notification.actor_username}
                        </span>{' '}
                        <span className={!notification.is_read ? 'font-medium' : ''}>
                          {notification.verb}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';

function ProfileRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the user's own profile page
    if (user?.username) {
      router.replace(`/profile/${user.username}`);
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileRedirect />
    </ProtectedRoute>
  );
}

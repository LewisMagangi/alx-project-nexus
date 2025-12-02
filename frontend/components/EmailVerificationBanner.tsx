// File: frontend/components/EmailVerificationBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function EmailVerificationBanner() {
  const [status, setStatus] = useState<'loading' | 'verified' | 'unverified'>('loading');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/auth/verification-status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmail(response.data.email);
      setStatus(response.data.email_verified ? 'verified' : 'unverified');
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  const handleResendVerification = async () => {
    setSending(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/auth/resend-verification/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        type: 'success',
        text: 'Verification email sent! Check your inbox.'
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to send verification email. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading') {
    return null; // Or show a skeleton loader
  }

  if (status === 'verified') {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Email Verified</p>
              <p className="text-sm text-green-700">{email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Email Not Verified</p>
              <p className="text-sm text-yellow-700">
                Please verify your email address: <strong>{email}</strong>
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={sending}
            className="w-full sm:w-auto"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


// ============================================
// USAGE EXAMPLES
// ============================================

// 1. Add to Settings Page
// File: frontend/app/settings/page.tsx
/*
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Email Verification Status *\/}
      <EmailVerificationBanner />
      
      {/* Rest of settings... *\/}
    </div>
  );
}
*/

// 2. Add to Profile Page
// File: frontend/app/profile/page.tsx
/*
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      {/* Email Verification Status *\/}
      <EmailVerificationBanner />
      
      {/* Profile content... *\/}
    </div>
  );
}
*/

// 3. Add to Dashboard (optional)
// File: frontend/app/dashboard/page.tsx
/*
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

export default function DashboardPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Show banner only if not verified *\/}
      <EmailVerificationBanner />
      
      {/* Dashboard content... *\/}
    </div>
  );
}
*/

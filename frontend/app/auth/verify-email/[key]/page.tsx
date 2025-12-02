'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function EmailVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/verify-email/`, {
          key: params.key,
        });
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => router.push('/auth/login?verified=true'), 3000);
      } catch {
        setStatus('error');
        setMessage('Invalid or expired verification link.');
      }
    };

    if (params.key) {
      verifyEmail();
    }
  }, [params.key, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Verifying Email...</h2>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/auth/login?verified=true">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">Back to Registration</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

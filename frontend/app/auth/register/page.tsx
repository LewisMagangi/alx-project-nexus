// frontend/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!acceptedPolicies) {
      setError('You must accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join Nexus today and start connecting with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
              />
              <p className="text-xs text-gray-500">
                3-50 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                At least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptPolicies"
                  checked={acceptedPolicies}
                  onChange={(e) => setAcceptedPolicies(e.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="acceptPolicies" className="text-sm text-gray-700 leading-tight">
                  I agree to the{' '}
                  <Link
                    href="/legal/terms"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/legal/privacy"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {acceptedPolicies && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Policies accepted</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !acceptedPolicies}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

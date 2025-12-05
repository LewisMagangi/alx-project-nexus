"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function PasswordResetVerifyContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Get search params manually to avoid Next.js issues
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 Password verify page loaded');
    console.log('📝 Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    
    // Parse URL parameters manually
    if (typeof window !== 'undefined') {
      const search = window.location.search.replace(/&amp;/g, '&');
      const urlParams = new URLSearchParams(search);
      const tokenParam = urlParams.get("token");
      const emailParam = urlParams.get("email");

      console.log('🔗 URL params present:', { hasToken: !!tokenParam, hasEmail: !!emailParam });

      // URL decode the parameters in case they contain encoded characters
      const decodedToken = tokenParam ? decodeURIComponent(tokenParam) : null;
      const decodedEmail = emailParam ? decodeURIComponent(emailParam) : null;
      
      console.log('🔧 Parameters decoded successfully');
      
      setToken(decodedToken);
      setEmail(decodedEmail);
    }
  }, []);

  // Handle case where parameters are missing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token && !email && status === "loading") {
        setStatus("error");
        setMessage("Invalid or missing verification parameters.");
      }
    }, 1000); // Wait 1 second for parameters to load

    return () => clearTimeout(timer);
  }, [token, email, status]);

  useEffect(() => {
    console.log('🚀 Verification useEffect triggered with params present:', { hasToken: !!token, hasEmail: !!email });
    
    const verifyEmail = async () => {
      console.log('⚡ Starting verification process...');
      if (!token || !email) {
        console.log('❌ Missing token or email, skipping verification');
        return;
      }

      console.log('✅ Parameters valid, proceeding with API call');
      console.log('📡 Making request to:', `${API_BASE_URL}/api/auth/password/reset/verify/`);
      setStatus("loading");

      try {
        console.log('Making API call to:', `${API_BASE_URL}/api/auth/password/reset/verify/`);
        
        // Add timeout to prevent infinite hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `${API_BASE_URL}/api/auth/password/reset/verify/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        console.log('📡 API response status:', response.status);
        const data = await response.json();
        console.log('📨 Response received:', data);

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        setStatus("success");
        setMessage("Email verified! Redirecting to password reset...");

        // Redirect to password reset confirm page
        setTimeout(() => {
          router.push(`/auth/password/reset/confirm?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        }, 2000);

      } catch (err) {
        console.error('Verification error:', err);
        
        if (err instanceof Error && err.name === 'AbortError') {
          setMessage("Request timed out. Please check your connection and try again.");
        } else {
          setMessage(err instanceof Error ? err.message : "Verification failed.");
        }
        
        setStatus("error");
      }
    };

    if (token && email) {
      verifyEmail();
    }
  }, [token, email, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
            {status === "success" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {status === "error" && <XCircle className="h-6 w-6 text-red-500" />}
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <ShieldCheck className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-sm text-gray-600">Verifying your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-green-600 font-medium mb-4">{message}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Your email has been verified successfully.
                  You will be redirected to the password reset page shortly.
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Please enter your new password on the next page.
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-sm text-red-600 font-medium">{message}</p>
              <Link href="/auth/forgot-password">
                <Button className="w-full mt-4">Request New Reset Link</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PasswordResetVerifyPage() {
  return <PasswordResetVerifyContent />;
}

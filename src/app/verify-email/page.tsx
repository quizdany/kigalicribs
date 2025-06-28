'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const role = searchParams.get('role');

      if (!token || !email || !role) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch(`/api/verify-email?token=${token}&email=${encodeURIComponent(email)}&role=${role}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(data.message);
        } else {
          setVerificationStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-green-800">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Continue to Login</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-800">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/register">Register Again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
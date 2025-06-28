"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const fee = searchParams.get('fee') || '1000';
  const context = searchParams.get('context') || '';
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setPaid(true);
      setLoading(false);
      setTimeout(() => {
        router.push(redirectTo);
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Service Fee Required</h1>
        <p className="mb-4">
          {context === 'contact' && 'To view the owner\'s contact information, '}
          {context === 'lease' && 'To view or sign the lease agreement, '}
          {context === 'list' && 'To list your property, '}
          please pay a service fee of <span className="font-bold">RWF {fee}</span> via MTN MOMO.
        </p>
        {!paid ? (
          <Button onClick={handlePay} disabled={loading} className="w-full">
            {loading ? 'Processing Payment...' : 'Pay with MTN MOMO'}
          </Button>
        ) : (
          <div className="text-green-600 font-semibold mt-4">Payment successful! Redirecting...</div>
        )}
      </div>
    </div>
  );
} 
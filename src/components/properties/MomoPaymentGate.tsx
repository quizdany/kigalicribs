"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MomoPaymentGateProps {
  children?: React.ReactNode;
  fee?: number;
  context?: 'list' | 'lease' | 'contact';
  onPaymentComplete?: () => void;
}

export default function MomoPaymentGate({ children, fee = 1000, context, onPaymentComplete }: MomoPaymentGateProps) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success' | 'error'>('input');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  // For polling
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setStep('processing');
    try {
      // 1. Get access token
      const tokenRes = await fetch('/api/momo/token', { method: 'POST' });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) throw new Error('Failed to get access token');
      // 2. Initiate payment
      const initiateRes = await fetch('/api/momo/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: tokenData.access_token,
          amount: fee.toString(),
          currency: 'RWF',
          externalId: `KIGALICRIBS_${Date.now()}`,
          payer: phone.replace(/\D/g, ''), // Only digits
          payerMessage: 'KigaliCribs Service Fee',
        }),
      });
      const initiateData = await initiateRes.json();
      if (!initiateData.referenceId) throw new Error(initiateData.error || 'Failed to initiate payment');
      // 3. Poll for payment status
      setPolling(true);
      let status = 'PENDING';
      let pollTries = 0;
      while (status === 'PENDING' && pollTries < 10) {
        await new Promise(res => setTimeout(res, 3000)); // Wait 3s
        pollTries++;
        setPollCount(pollTries);
        const statusRes = await fetch('/api/momo/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: tokenData.access_token,
            referenceId: initiateData.referenceId,
          }),
        });
        const statusData = await statusRes.json();
        status = statusData.status;
        if (status === 'SUCCESSFUL') {
          setPaid(true);
          setStep('success');
          setPolling(false);
          if (onPaymentComplete) onPaymentComplete();
          return;
        } else if (status === 'FAILED' || status === 'REJECTED') {
          setStep('error');
          setError('Payment failed or was rejected.');
          setPolling(false);
          return;
        }
      }
      setStep('error');
      setError('Payment timed out. Please try again.');
      setPolling(false);
    } catch (err: any) {
      setStep('error');
      setError(err.message || 'Payment error.');
      setPolling(false);
    } finally {
      setLoading(false);
    }
  };

  if (paid) return children ? <>{children}</> : null;

  let title = "Service Fee Required";
  let message = '';
  if (context === 'list') {
    title = "Listing Fee Required";
    message = `To list your property on KigaliCribs, please pay a service fee of <span class='font-bold'>RWF ${fee}</span> via MTN MOMO.`;
  } else if (context === 'contact') {
    message = `To view the owner's contact information, please pay a service fee of <span class='font-bold'>RWF ${fee}</span> via MTN MOMO.`;
  } else if (context === 'lease') {
    message = `To view or sign the lease agreement, please pay a service fee of <span class='font-bold'>RWF ${fee}</span> via MTN MOMO.`;
  } else {
    message = `To view lease options and contact the property owner, please pay a service fee of <span class='font-bold'>RWF ${fee}</span> via MTN MOMO.`;
  }

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center border p-6 rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-4" dangerouslySetInnerHTML={{ __html: message }} />
        {step === 'input' && (
          <>
            <input
              type="tel"
              className="border rounded px-3 py-2 w-full mb-4"
              placeholder="Enter your MTN phone number (e.g. 2507xxxxxxx)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handlePay} disabled={loading || !/^\d{12}$/.test(phone)} className="w-full">
              {loading ? "Processing..." : "Pay with MTN MOMO"}
            </Button>
          </>
        )}
        {step === 'processing' && (
          <>
            <p className="mb-2 text-gray-600">Waiting for payment confirmation...</p>
            {polling && <p className="text-xs text-gray-400">Polling status... (try {pollCount}/10)</p>}
            <div className="mt-4 animate-pulse text-yellow-600">Processing Payment...</div>
          </>
        )}
        {step === 'success' && (
          <div className="text-green-600 font-semibold mt-4">Payment successful!</div>
        )}
        {step === 'error' && (
          <div className="text-red-600 font-semibold mt-4">{error}</div>
        )}
      </div>
    </div>
  );
} 
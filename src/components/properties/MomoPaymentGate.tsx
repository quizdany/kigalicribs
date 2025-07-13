"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MomoPaymentGateProps {
  children: React.ReactNode;
  fee?: number;
  context?: 'list' | 'lease' | 'contact';
}

export default function MomoPaymentGate({ children, fee = 1000, context }: MomoPaymentGateProps) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setPaid(true);
      setLoading(false);
    }, 2000); // Simulate payment delay
  };

  if (paid) return <>{children}</>;

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
        <Button onClick={handlePay} disabled={loading} className="w-full">
          {loading ? "Processing Payment..." : "Pay with MTN MOMO"}
        </Button>
        {loading && <p className="mt-2 text-sm text-gray-500">Simulating payment...</p>}
      </div>
    </div>
  );
} 
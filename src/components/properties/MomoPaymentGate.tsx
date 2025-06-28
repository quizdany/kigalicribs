"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MomoPaymentGateProps {
  children: React.ReactNode;
  fee?: number;
}

export default function MomoPaymentGate({ children, fee = 1000 }: MomoPaymentGateProps) {
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

  return (
    <div className="max-w-md mx-auto text-center border p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Service Fee Required</h2>
      <p className="mb-4">To view lease options and contact the property owner, please pay a service fee of <span className="font-bold">RWF {fee}</span> via MTN MOMO.</p>
      <Button onClick={handlePay} disabled={loading} className="w-full">
        {loading ? "Processing Payment..." : "Pay with MTN MOMO"}
      </Button>
      {loading && <p className="mt-2 text-sm text-gray-500">Simulating payment...</p>}
    </div>
  );
} 
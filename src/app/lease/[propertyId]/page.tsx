"use client";
import { use } from 'react';
import MomoPaymentGate from '@/components/properties/MomoPaymentGate';
import LeaseAgreementView from '@/components/properties/LeaseAgreementView';
import { useState } from 'react';

export default function LeasePage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [paymentComplete, setPaymentComplete] = useState(false);

  return (
    <div className="container mx-auto py-12 px-4">
      {!paymentComplete ? (
        <MomoPaymentGate fee={2000}>
          <div className="text-center">
            <p className="mb-4">Please complete your payment to view the lease agreement.</p>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded"
              onClick={() => setPaymentComplete(true)}
            >
              Simulate Payment Success
            </button>
          </div>
        </MomoPaymentGate>
      ) : (
        <LeaseAgreementView propertyId={propertyId} />
      )}
    </div>
  );
}

// export const dynamic = 'force-dynamic'; // If IDs are not known at build time

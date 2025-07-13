"use client";
import { use } from 'react';
import MomoPaymentGate from '@/components/properties/MomoPaymentGate';
import LeaseAgreementView from '@/components/properties/LeaseAgreementView';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LeasePage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [property, setProperty] = useState<{ title: string; address: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('title,address')
        .eq('id', propertyId)
        .single();
      if (data) setProperty(data);
      setLoading(false);
    }
    fetchProperty();
  }, [propertyId]);

  if (loading || !property) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading property details...</div>;
  }

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
        <LeaseAgreementView
          propertyName={property.title}
          propertyAddress={property.address}
        />
      )}
    </div>
  );
}

// export const dynamic = 'force-dynamic'; // If IDs are not known at build time

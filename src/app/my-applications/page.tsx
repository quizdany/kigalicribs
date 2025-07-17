import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import { getTenantSignedLease } from '../../lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default async function MyApplicationsPage() {
  // Get the current session
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tenant') {
    redirect('/');
  }

  // Fetch the signed lease for the tenant
  const lease = await getTenantSignedLease(session.user.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      {lease ? (
        <Card className="max-w-xl w-full shadow-lg">
          <CardHeader>
            <CardTitle>Signed Lease Agreement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-gray-600">
              <strong>Property:</strong> {lease.propertyName}<br />
              <strong>Address:</strong> {lease.propertyAddress}<br />
              <strong>Lease Start:</strong> {lease.startDate}<br />
              <strong>Lease End:</strong> {lease.endDate}<br />
            </div>
            <a href={lease.documentUrl} target="_blank" rel="noopener noreferrer">
              <Button>View Lease Document</Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md w-full shadow-lg text-center">
          <CardHeader>
            <CardTitle>No Lease Signed Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4 text-gray-600">You have not signed a lease agreement yet. Once you sign a lease, it will appear here.</p>
            <span className="text-5xl text-gray-400">🏠</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
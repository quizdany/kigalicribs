'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Home, Building2, Search, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isLandlord = session?.user?.role === 'landlord';

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <UserCircle className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}!</h1>
            <p className="text-gray-600 capitalize">You are logged in as a {session?.user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLandlord ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    List New Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Add a new property to your portfolio and start attracting tenants.</p>
                  <Button asChild className="w-full">
                    <Link href="/list-property">List Property</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    My Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage your existing properties and view tenant applications.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/my-properties">View Properties</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Tenant Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Review and respond to tenant applications for your properties.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/applications">View Applications</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Search for properties that match your preferences and budget.</p>
                  <Button asChild className="w-full">
                    <Link href="/search">Search Properties</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    My Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Track your property applications and lease agreements.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/my-applications">View Applications</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Update your preferences and personal information.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent activity to display.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyForm from "@/components/properties/PropertyForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ListPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      // Redirect to login, with callback to return here
      router.replace(`/login?callbackUrl=/list-property`);
      return;
    }
    setChecked(true);
  }, [status, session, router]);

  if (status === "loading" || !checked) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Checking Permissions...</CardTitle>
          </CardHeader>
          <CardContent>
            Please wait while we verify your access.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user?.role === "tenant") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Landlord Access Required</CardTitle>
            <CardDescription>
              Only landlords can post properties. To continue, please create a landlord profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button asChild size="lg" className="w-2/3">
              <Link href="/register?role=landlord">Become a Landlord</Link>
            </Button>
            <Button asChild variant="outline" className="w-2/3">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only landlords reach here
  return (
    <div className="container mx-auto py-12 px-4">
      <PropertyForm />
    </div>
  );
}

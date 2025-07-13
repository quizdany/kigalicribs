"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import TenantRegistrationForm from "@/components/auth/TenantRegistrationForm";
import LandlordRegistrationForm from "@/components/auth/LandlordRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"tenant" | "landlord" | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (status === "authenticated" && session?.user?.email) {
        if (session.user.role === "tenant" || session.user.role === "landlord") {
          setRole(session.user.role);
        } else {
          setRole(null);
        }
        setLoading(true);
        try {
          if (typeof session.user.email === "string") {
            if (session.user.role === "tenant") {
              const { getTenantProfile } = await import("@/lib/actions");
              const data = await getTenantProfile(session.user.email);
              setProfileData({
                ...data,
                email: session.user.email,
                password: "",
                confirmPassword: "",
                budgetMin: data.budget?.min ?? 0,
                budgetMax: data.budget?.max ?? 0,
                budgetCurrency: data.budget?.currency ?? "RWF",
                preferredLocations: data.preferences?.locations ?? [],
                propertyTypes: data.preferences?.propertyTypes ?? [],
                minBedrooms: data.preferences?.minBedrooms ?? 0,
                minBathrooms: data.preferences?.minBathrooms ?? 0,
                preferredAmenities: data.preferences?.amenities ?? [],
                additionalNotes: data.additionalNotes ?? "",
              });
            } else if (session.user.role === "landlord") {
              const { getLandlordProfile } = await import("@/lib/actions");
              const data = await getLandlordProfile(session.user.email);
              setProfileData({
                ...data,
                email: session.user.email,
                password: "",
                confirmPassword: "",
              });
            }
          }
        } catch (e) {
          setProfileData(null);
        }
        setLoading(false);
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [session, status]);

  // Helper to display profile info in a card
  function ProfileSummary({ data, role, onEdit }: { data: any; role: string; onEdit: () => void }) {
    // Helper to display a value or a dash
    const show = (val: any) => {
      if (Array.isArray(val)) return val.length ? val.join(", ") : "-";
      if (val === null || val === undefined || val === "") return "-";
      return val;
    };
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {role === "tenant" ? (
              <>
                <div><b>Full Name:</b> {show(data.fullName)}</div>
                <div><b>Email:</b> {show(data.email)}</div>
                <div><b>Phone:</b> {show(data.phone)}</div>
                <div><b>Budget:</b> {show(data.budgetMin) !== "-" && show(data.budgetMax) !== "-" && show(data.budgetCurrency) !== "-" ? `${show(data.budgetMin)} - ${show(data.budgetMax)} ${show(data.budgetCurrency)}` : "-"}</div>
                <div><b>Preferred Locations:</b> {show(data.preferredLocations)}</div>
                <div><b>Property Types:</b> {show(data.propertyTypes)}</div>
                <div><b>Bedrooms:</b> {show(data.minBedrooms)}</div>
                <div><b>Bathrooms:</b> {show(data.minBathrooms)}</div>
                <div><b>Amenities:</b> {show(data.preferredAmenities)}</div>
                <div><b>Notes:</b> {show(data.additionalNotes)}</div>
              </>
            ) : (
              <>
                <div><b>First Name:</b> {show(data.firstName)}</div>
                <div><b>Last Name:</b> {show(data.lastName)}</div>
                <div><b>Email:</b> {show(data.email)}</div>
                <div><b>Phone:</b> {show(data.phone)}</div>
                <div><b>Company Name:</b> {show(data.companyName)}</div>
                <div><b>Business License:</b> {show(data.businessLicense)}</div>
                <div><b>Experience:</b> {show(data.experience)}</div>
                <div><b>Properties Owned:</b> {show(data.propertiesOwned)}</div>
                <div><b>Additional Info:</b> {show(data.additionalInfo)}</div>
              </>
            )}
            <Button className="mt-4" onClick={onEdit}>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || status === "loading" || !profileData) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Loading profile...</h2>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {editMode ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-center">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {role === "tenant" && profileData && (
              <TenantRegistrationForm
                editable={true}
                initialData={profileData}
                // After save, exit edit mode and refresh data
                onSuccess={async () => {
                  window.location.reload();
                }}
              />
            )}
            {role === "landlord" && profileData && (
              <LandlordRegistrationForm
                editable={true}
                initialData={profileData}
                onSuccess={async () => {
                  window.location.reload();
                }}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <ProfileSummary data={profileData} role={role!} onEdit={() => setEditMode(true)} />
      )}
    </div>
  );
} 
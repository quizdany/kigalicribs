"use client";

import { useState } from "react";
import TenantRegistrationForm from "@/components/auth/TenantRegistrationForm";
import LandlordRegistrationForm from "@/components/auth/LandlordRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"tenant" | "landlord">("tenant");

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Join KigaliCribs</CardTitle>
          <CardDescription className="text-center">Choose your role to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as "tenant" | "landlord")}
            className="flex justify-center space-x-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tenant" id="tenant" />
              <Label htmlFor="tenant" className="text-lg font-medium">I'm a Tenant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="landlord" id="landlord" />
              <Label htmlFor="landlord" className="text-lg font-medium">I'm a Landlord</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedRole === "tenant" ? <TenantRegistrationForm /> : <LandlordRegistrationForm />}
    </div>
  );
}

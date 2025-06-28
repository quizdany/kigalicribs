'use server';

import type { TenantRegistrationFormData } from '@/components/auth/TenantRegistrationForm';
import type { PropertyFormData } from '@/components/properties/PropertyForm';
import type { LoginFormData } from '@/components/auth/LoginForm';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function registerTenant(data: TenantRegistrationFormData) {
  try {
    console.log('Registering tenant:', data);
    
    // Check if user already exists
    const existingUser = await adminDb
      .collection('tenants')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      throw new Error('A tenant with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Save tenant profile to Firebase
    const tenantDoc = await adminDb.collection('tenants').add({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || null,
      budget: {
        min: data.budgetMin,
        max: data.budgetMax,
        currency: data.budgetCurrency
      },
      preferences: {
        locations: data.preferredLocations,
        propertyTypes: data.propertyTypes,
        minBedrooms: data.minBedrooms,
        minBathrooms: data.minBathrooms,
        amenities: data.preferredAmenities || []
      },
      additionalNotes: data.additionalNotes || null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Tenant registered successfully with ID:', tenantDoc.id);
    return { 
      success: true, 
      message: 'Tenant profile created successfully!',
      tenantId: tenantDoc.id 
    };
  } catch (error) {
    console.error('Error registering tenant:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to register tenant due to a server error.');
  }
}

export async function loginTenant(data: LoginFormData) {
  try {
    console.log('Logging in user:', data.email, 'as', data.role);
    
    // Determine which collection to search based on role
    const collection = data.role === 'landlord' ? 'landlords' : 'tenants';
    
    // Find user by email in the appropriate collection
    const userSnapshot = await adminDb
      .collection(collection)
      .where('email', '==', data.email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      throw new Error('Invalid email or password.');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, userData.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    console.log('Login successful for user:', userData.email);
    return { 
      success: true, 
      message: `Welcome back${data.role === 'landlord' ? ', landlord' : ''}!`,
      userId: userDoc.id,
      role: data.role,
      user: {
        id: userDoc.id,
        fullName: userData.fullName || userData.firstName + ' ' + userData.lastName,
        email: userData.email,
        role: data.role
      }
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw new Error(error instanceof Error ? error.message : 'Login failed due to a server error.');
  }
}

export async function createPropertyListing(data: PropertyFormData) {
  console.log('Creating property listing:', data);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate success/failure
  if (Math.random() > 0.1) { // 90% success rate
    return { success: true, message: 'Property listed successfully.', propertyId: Date.now().toString() };
  } else {
    throw new Error('Failed to list property due to a server error.');
  }
}

// Add more server actions as needed for authentication, fetching data, etc.

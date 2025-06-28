'use server';

import type { TenantRegistrationFormData } from '@/components/auth/TenantRegistrationForm';
import type { LandlordRegistrationFormData } from '@/components/auth/LandlordRegistrationForm';
import type { PropertyFormData } from '@/types';
import type { LoginFormData } from '@/components/auth/LoginForm';
import { adminDb } from '@/lib/firebase-admin';
import { sendVerificationEmail } from '@/lib/email';
import { generateVerificationToken, hashVerificationToken } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { supabase } from './supabaseClient';

export async function registerTenant(data: TenantRegistrationFormData) {
  try {
    console.log('Registering tenant:', data);
    
    // Check if user already exists in either collection
    const existingTenant = await adminDb
      .collection('tenants')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    const existingLandlord = await adminDb
      .collection('landlords')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    if (!existingTenant.empty || !existingLandlord.empty) {
      throw new Error('A user with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const hashedToken = hashVerificationToken(verificationToken);

    // Save tenant profile to Firebase with verification status
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
      status: 'pending_verification',
      emailVerified: false,
      verificationToken: hashedToken,
      verificationTokenCreatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: data.email,
        name: data.fullName,
        verificationToken,
        role: 'tenant'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    console.log('Tenant registered successfully with ID:', tenantDoc.id);
    return { 
      success: true, 
      message: 'Tenant profile created successfully! Please check your email to verify your account.',
      tenantId: tenantDoc.id 
    };
  } catch (error) {
    console.error('Error registering tenant:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to register tenant due to a server error.');
  }
}

export async function registerLandlord(data: LandlordRegistrationFormData) {
  try {
    console.log('Registering landlord:', data);
    
    // Check if user already exists in either collection
    const existingTenant = await adminDb
      .collection('tenants')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    const existingLandlord = await adminDb
      .collection('landlords')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    if (!existingTenant.empty || !existingLandlord.empty) {
      throw new Error('A user with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const hashedToken = hashVerificationToken(verificationToken);

    // Save landlord profile to Firebase with verification status
    const landlordDoc = await adminDb.collection('landlords').add({
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      companyName: data.companyName || null,
      businessLicense: data.businessLicense || null,
      experience: data.experience,
      propertiesOwned: data.propertiesOwned,
      additionalInfo: data.additionalInfo || null,
      status: 'pending_verification',
      emailVerified: false,
      verificationToken: hashedToken,
      verificationTokenCreatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        verificationToken,
        role: 'landlord'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    console.log('Landlord registered successfully with ID:', landlordDoc.id);
    return { 
      success: true, 
      message: 'Landlord profile created successfully! Please check your email to verify your account.',
      landlordId: landlordDoc.id 
    };
  } catch (error) {
    console.error('Error registering landlord:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to register landlord due to a server error.');
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

    // Check if email is verified
    if (!userData.emailVerified) {
      throw new Error('Please verify your email address before logging in. Check your inbox for a verification link.');
    }

    // Check if account is active
    if (userData.status !== 'active') {
      throw new Error('Your account is not active. Please contact support if you believe this is an error.');
    }

    console.log('Login successful for user:', userData.email);
    return { 
      success: true, 
      message: `Welcome back${data.role === 'landlord' ? ', landlord' : ''}!`,
      userId: userDoc.id,
      role: data.role,
      user: {
        id: userDoc.id,
        fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
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

function mapFormDataToDb(data: PropertyFormData, landlordId: string) {
  return {
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    location: data.location,
    address: data.address,
    property_type: data.propertyType,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    amenities: data.amenities ?? [],
    photos: data.photos,
    agent_name: data.agentName || null,
    agent_email: data.agentEmail || null,
    agent_phone: data.agentPhone || null,
    features_for_ai: data.featuresForAI || null,
    market_trends_for_ai: data.marketTrendsForAI || null,
    landlord_id: landlordId,
  };
}

export async function createPropertyListingSupabase(data: PropertyFormData, landlordId: string) {
  const mappedData = mapFormDataToDb(data, landlordId);
  const { error } = await supabase
    .from('properties')
    .insert([mappedData]);
  if (error) throw error;
  return { success: true, message: 'Property listed successfully.' };
}

export async function fetchAllProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
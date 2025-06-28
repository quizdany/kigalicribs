import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { hashVerificationToken, isTokenExpired } from '@/lib/utils';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (!token || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Determine which collection to search based on role
    const collection = role === 'landlord' ? 'landlords' : 'tenants';
    
    // Find user by email
    const userSnapshot = await adminDb
      .collection(collection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if already verified
    if (userData.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Hash the provided token to compare with stored token
    const hashedToken = hashVerificationToken(token);

    // Verify token matches
    if (userData.verificationToken !== hashedToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(userData.verificationTokenCreatedAt.toDate())) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update user verification status
    await userDoc.ref.update({
      emailVerified: true,
      status: 'active',
      verificationToken: null,
      verificationTokenCreatedAt: null,
      updatedAt: new Date()
    });

    // Send welcome email
    try {
      await sendWelcomeEmail({
        email: userData.email,
        name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        role: role as 'tenant' | 'landlord'
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email verified successfully! You can now log in to your account.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
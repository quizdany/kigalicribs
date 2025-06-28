import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminDb } from './firebase-admin';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null;
        }

        try {
          // Determine which collection to search based on role
          const collection = credentials.role === 'landlord' ? 'landlords' : 'tenants';
          
          // Get user from Firestore
          const userDoc = await adminDb
            .collection(collection)
            .where('email', '==', credentials.email)
            .limit(1)
            .get();

          if (userDoc.empty) {
            return null;
          }

          const userData = userDoc.docs[0].data();
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            userData.password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: userDoc.docs[0].id,
            email: userData.email,
            name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
            role: credentials.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

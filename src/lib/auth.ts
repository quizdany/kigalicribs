import { NextAuthOptions } from 'next-auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminDb, adminAuth } from './firebase-admin';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter(adminDb),
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from Firestore
          const userDoc = await adminDb
            .collection('users')
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
            name: userData.name,
            role: userData.role || 'tenant',
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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};

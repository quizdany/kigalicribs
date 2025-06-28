import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a hash for the verification token
export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Check if a token has expired (24 hours)
export function isTokenExpired(createdAt: Date): boolean {
  const now = new Date();
  const tokenAge = now.getTime() - createdAt.getTime();
  const hours24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return tokenAge > hours24;
}

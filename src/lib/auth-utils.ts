
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import type { Role as AppRole } from '@/types';

// Key for 'jose' must be a Uint8Array.
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-please-change-this'
);
export const TOKEN_NAME = 'auth_token';

export interface UserPayload {
  id: string;
  email: string;
  role: AppRole;
  isVerified: boolean;
  kelasId?: string | null;
}

/**
 * Verifies a JWT using 'jose' and returns its payload if valid.
 * This function is safe for the Edge runtime.
 * @param token The JWT string to verify.
 * @returns A promise that resolves to the decoded UserPayload or null.
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // The payload from jwtVerify is a JWT.Payload object, which is indexable.
    // We cast it to our UserPayload type.
    return payload as unknown as UserPayload;
  } catch (error) {
    // It's common for this to fail (e.g., expired token), so we don't need to log every error.
    // console.error('Invalid token (Edge):', error);
    return null;
  }
}

/**
 * Extracts the JWT from the cookies of a NextRequest.
 * Safe for Edge runtime.
 * @param req The incoming NextRequest.
 * @returns The token string or null if not found.
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const cookies = req.cookies.get(TOKEN_NAME);
  return cookies?.value || null;
}

/**
 * Retrieves the authenticated user payload from the request token.
 * A convenient utility combining token extraction and verification for the Edge.
 * @returns A promise that resolves to the UserPayload or null if the user is not authenticated.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<UserPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }
  return await verifyToken(token);
}

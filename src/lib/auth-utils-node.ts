import jwt from 'jsonwebtoken';
import type { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';
import type { User, Role as AppRole } from '@/types';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-please-change-this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';
export const TOKEN_NAME = 'auth_token';

/**
 * Payload that will be encoded into the JWT token.
 * Contains essential, non-sensitive user data.
 */
export interface UserPayload {
  id: string;
  email: string;
  role: AppRole;
  isVerified: boolean;
  kelasId?: string | null;
}

/**
 * Generates a JWT for a given user.
 * @param user The user object containing id, email, role, and verification status.
 * @returns A JWT string.
 */
export function generateToken(user: Pick<User, 'id' | 'email' | 'role' | 'isVerified' | 'kelasId'>): string {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    kelasId: user.kelasId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verifies a JWT and returns its payload if valid.
 * @param token The JWT string to verify.
 * @returns The decoded UserPayload or null if the token is invalid.
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    // console.error('Invalid token:', error);
    return null;
  }
}

/**
 * Sets the authentication token as a secure, HTTP-only cookie on a NextResponse.
 * @param res The NextResponse object to modify.
 * @param token The JWT string to set in the cookie.
 */
export function setTokenCookie(res: NextResponse, token: string): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24 * 1, // 1 day in seconds
    path: '/',
    sameSite: 'lax' as const,
  };
  res.headers.append('Set-Cookie', cookie.serialize(TOKEN_NAME, token, cookieOptions));
}

/**
 * Clears the authentication token cookie from a NextResponse.
 * @param res The NextResponse object to modify.
 */
export function clearTokenCookie(res: NextResponse): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    expires: new Date(0), // Set expiry to a past date
    path: '/',
    sameSite: 'lax' as const,
  };
  res.headers.append('Set-Cookie', cookie.serialize(TOKEN_NAME, '', cookieOptions));
}

/**
 * Retrieves the authenticated user payload from the request token.
 * A convenient utility combining token extraction and verification.
 * This should be used inside Route Handlers or Server Components.
 * @param request The incoming NextRequest object.
 * @returns The UserPayload or null if the user is not authenticated.
 */
export function getAuthenticatedUser(request: NextRequest): UserPayload | null {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}


/**
 * Generates a cryptographically secure random token.
 * @param length The desired byte length of the token.
 * @returns A hex-encoded secure token.
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

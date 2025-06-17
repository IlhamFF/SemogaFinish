
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import type { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/types'; // Using your simplified User type
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-please-change-this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1d'; // e.g., 1 day
export const TOKEN_NAME = 'auth_token';

export interface UserPayload {
  id: string;
  email: string;
  role: User['role'];
  isVerified: boolean;
  // Add other essential, non-sensitive fields you want in the token
}

export function generateToken(user: Pick<User, 'id' | 'email' | 'role' | 'isVerified'>): string {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

export function setTokenCookie(res: NextResponse, token: string): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24 * 1, // 1 day in seconds (matches default JWT_EXPIRY)
    path: '/',
    sameSite: 'lax' as const,
  };
  res.headers.append('Set-Cookie', cookie.serialize(TOKEN_NAME, token, cookieOptions));
}

export function clearTokenCookie(res: NextResponse): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    expires: new Date(0), // Set expiry to past date
    path: '/',
    sameSite: 'lax' as const,
  };
  res.headers.append('Set-Cookie', cookie.serialize(TOKEN_NAME, '', cookieOptions));
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookies = req.cookies.get(TOKEN_NAME);
  return cookies?.value || null;
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

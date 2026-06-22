import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'flystay_auth';
const TOKEN_EXPIRY = '7d';

export type UserRole = 'USER' | 'ADMIN' | 'SUPPORT';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  
  // In production, JWT_SECRET is required
  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      console.error('[AUTH] JWT_SECRET is required in production');
      return null;
    }
    if (secret.length < 32) {
      console.error('[AUTH] JWT_SECRET must be at least 32 characters in production');
      return null;
    }
    return new TextEncoder().encode(secret);
  }
  
  // In development, allow temporary local secret
  if (!secret) {
    console.warn('[AUTH] Using temporary JWT_SECRET for development only');
    return new TextEncoder().encode('dev-only-secret-do-not-use-in-production-32ch');
  }
  
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  const jwtSecret = getJwtSecret();
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET_NOT_CONFIGURED: JWT_SECRET must be configured in production');
  }
  
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(jwtSecret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  const jwtSecret = getJwtSecret();
  
  if (!jwtSecret) {
    return null;
  }
  
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

export function unauthorizedResponse(message = 'غير مصرح'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'غير مسموح'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Require specific roles for accessing a route.
 * Returns the user payload if authorized, or an error response.
 */
export async function requireRoles(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: JWTPayload } | NextResponse> {
  const user = await getAuthUserFromRequest(request);

  if (!user) {
    return unauthorizedResponse('غير مصرح - يرجى تسجيل الدخول');
  }

  if (!allowedRoles.includes(user.role)) {
    return forbiddenResponse(`غير مسموح - الدور المطلوب: ${allowedRoles.join(' أو ')}`);
  }

  return { user };
}

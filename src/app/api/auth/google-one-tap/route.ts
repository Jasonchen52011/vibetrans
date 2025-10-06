import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import {
  account,
  session as sessionTable,
  user as userTable,
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Google One Tap login endpoint
 * Verifies the Google JWT credential and creates/updates user session
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { credential?: string };
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: 'Missing credential' },
        { status: 400 }
      );
    }

    // Verify Google JWT token
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured' },
        { status: 500 }
      );
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 400 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    // Get database connection
    const db = await getDb();

    // Find or create user
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    let userId: string;
    const currentDate = new Date();

    if (existingUser.length > 0) {
      // User exists
      userId = existingUser[0].id;

      // Update user info if needed
      await db
        .update(userTable)
        .set({
          name: name || existingUser[0].name,
          image: picture || existingUser[0].image,
          emailVerified: true, // Google accounts are pre-verified
          updatedAt: currentDate,
        })
        .where(eq(userTable.id, userId));
    } else {
      // Create new user
      userId = randomUUID();
      await db.insert(userTable).values({
        id: userId,
        name: name || email.split('@')[0],
        email,
        emailVerified: true, // Google accounts are pre-verified
        image: picture,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
    }

    // Check if Google account is linked
    const existingAccount = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, 'google')))
      .limit(1);

    if (existingAccount.length === 0) {
      // Link Google account
      await db.insert(account).values({
        id: `${userId}_google_${googleId}`,
        userId,
        accountId: googleId,
        providerId: 'google',
        accessToken: credential, // Store the JWT as access token
        idToken: credential,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        password: null,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
    }

    // Create session
    const sessionId = randomUUID();
    const sessionToken = randomUUID();
    const expiresAt = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Get client info
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined;

    await db.insert(sessionTable).values({
      id: sessionId,
      userId,
      token: sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
      impersonatedBy: null,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name: name || email.split('@')[0],
        image: picture,
        emailVerified: true,
      },
      session: {
        id: sessionId,
        token: sessionToken,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Google One Tap error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    );
  }
}

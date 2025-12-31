import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { logger } from '@/lib/utils/logger';
import crypto from 'crypto';

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
export async function POST(request: NextRequest) {
  try {
    const { token, lang = 'en' } = await request.json();

    // Validate token
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'الرمز مطلوب'
            : 'Token is required',
        },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid verification token
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, hashedToken),
          gt(emailVerificationTokens.expiresAt, new Date()),
          eq(emailVerificationTokens.used, false)
        )
      )
      .limit(1);

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'رابط التحقق غير صالح أو منتهي الصلاحية'
            : 'Invalid or expired verification link',
        },
        { status: 400 }
      );
    }

    // Update user email verified status
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, verificationToken.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    logger.info('Email verified successfully', { 
      userId: verificationToken.userId,
      email: verificationToken.email 
    });

    return NextResponse.json({
      success: true,
      message: lang === 'ar'
        ? 'تم تأكيد بريدك الإلكتروني بنجاح'
        : 'Your email has been verified successfully',
    });
  } catch (error) {
    logger.error('Error verifying email', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if token is valid (without marking as used)
 * GET /api/auth/verify-email?token=xxx&lang=en
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const lang = searchParams.get('lang') || 'en';

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid verification token
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, hashedToken),
          gt(emailVerificationTokens.expiresAt, new Date()),
          eq(emailVerificationTokens.used, false)
        )
      )
      .limit(1);

    if (!verificationToken) {
      return NextResponse.json(
        {
          valid: false,
          error: lang === 'ar'
            ? 'رابط التحقق غير صالح أو منتهي الصلاحية'
            : 'Invalid or expired verification link',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: lang === 'ar'
        ? 'الرابط صالح'
        : 'Token is valid',
    });
  } catch (error) {
    logger.error('Error checking verification token', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

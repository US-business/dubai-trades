import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { logger } from '@/lib/utils/logger';
import { RateLimiters, getClientIP, createRateLimitResponse } from '@/lib/utils/rate-limiter';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, lang = 'en' } = await request.json();

    // Rate limiting - protect against brute force token guessing
    const clientIP = getClientIP(request);
    const rateLimitResult = RateLimiters.auth(`reset-password:${clientIP}`);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.retryAfter || 60, lang),
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          }
        }
      );
    }

    // Validate inputs
    if (!token || !newPassword) {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'الرمز وكلمة المرور الجديدة مطلوبة'
            : 'Token and new password are required',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
            : 'Password must be at least 8 characters',
        },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid reset token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, hashedToken),
          gt(passwordResetTokens.expiresAt, new Date()),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية'
            : 'Invalid or expired reset link',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, resetToken.id));

    logger.info('Password reset successfully', { userId: resetToken.userId });

    return NextResponse.json({
      success: true,
      message: lang === 'ar'
        ? 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن'
        : 'Password has been reset successfully. You can now sign in',
    });
  } catch (error) {
    logger.error('Error resetting password', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify reset token
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

    // Find valid reset token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, hashedToken),
          gt(passwordResetTokens.expiresAt, new Date()),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json(
        {
          valid: false,
          error: lang === 'ar'
            ? 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية'
            : 'Invalid or expired reset link',
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
    logger.error('Error verifying reset token', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

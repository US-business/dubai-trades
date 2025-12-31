import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendForgotPasswordEmail } from '@/lib/email/email-service';
import { logger } from '@/lib/utils/logger';
import { RateLimiters, getClientIP, createRateLimitResponse } from '@/lib/utils/rate-limiter';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, lang = 'en' } = await request.json();

    // Rate limiting - protect against password reset abuse
    const clientIP = getClientIP(request);
    const rateLimitResult = RateLimiters.passwordReset(`forgot-password:${clientIP}`);
    
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

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      logger.warn('Password reset requested for non-existent email', { email });
      return NextResponse.json({
        success: true,
        message: lang === 'ar'
          ? 'إذا كان البريد الإلكتروني موجود، سيتم إرسال رابط إعادة تعيين كلمة المرور'
          : 'If the email exists, a password reset link will be sent',
      });
    }

    // Don't allow reset for OAuth users (users without password)
    if (user.provider && user.provider !== 'email') {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'لا يمكن إعادة تعيين كلمة المرور لحسابات Google. يرجى تسجيل الدخول باستخدام Google'
            : 'Cannot reset password for OAuth accounts. Please sign in using Google',
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store token in database (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: hashedToken,
      expiresAt,
      createdAt: new Date(),
    });

    // Send reset email
    const emailResult = await sendForgotPasswordEmail(
      user.email,
      user.username || 'User',
      resetToken,
      lang
    );

    if (!emailResult.success) {
      logger.error('Failed to send password reset email', {
        email: user.email,
        error: emailResult.error,
      });
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقاً'
            : 'Failed to send email. Please try again later',
        },
        { status: 500 }
      );
    }

    logger.info('Password reset email sent', { email: user.email });

    return NextResponse.json({
      success: true,
      message: lang === 'ar'
        ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
        : 'Password reset link has been sent to your email',
    });
  } catch (error) {
    logger.error('Error processing forgot password request', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

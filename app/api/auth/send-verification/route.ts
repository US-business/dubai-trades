import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '@/lib/email/email-service';
import { logger } from '@/lib/utils/logger';
import { RateLimiters, getClientIP, createRateLimitResponse } from '@/lib/utils/rate-limiter';
import crypto from 'crypto';

/**
 * Send or resend email verification link
 * POST /api/auth/send-verification
 */
export async function POST(request: NextRequest) {
  try {
    const { email, lang = 'en' } = await request.json();

    // Rate limiting - prevent spam
    const clientIP = getClientIP(request);
    const rateLimitResult = RateLimiters.passwordReset(`send-verification:${clientIP}`);
    
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
        { 
          error: lang === 'ar' 
            ? 'البريد الإلكتروني مطلوب' 
            : 'Email is required' 
        },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Don't reveal if email exists
    if (!user) {
      logger.warn('Verification email requested for non-existent email', { email });
      return NextResponse.json({
        success: true,
        message: lang === 'ar'
          ? 'إذا كان البريد الإلكتروني موجود، سيتم إرسال رابط التحقق'
          : 'If the email exists, a verification link will be sent',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          error: lang === 'ar'
            ? 'البريد الإلكتروني مؤكد بالفعل'
            : 'Email is already verified',
        },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Store token in database (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      email: user.email,
      token: hashedToken,
      expiresAt,
      createdAt: new Date(),
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      user.username || 'User',
      verificationToken,
      lang
    );

    if (!emailResult.success) {
      logger.error('Failed to send verification email', {
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

    logger.info('Verification email sent', { email: user.email });

    return NextResponse.json({
      success: true,
      message: lang === 'ar'
        ? 'تم إرسال رابط التحقق إلى بريدك الإلكتروني'
        : 'Verification link has been sent to your email',
    });
  } catch (error) {
    logger.error('Error sending verification email', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

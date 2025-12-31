import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, cart } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { hashPassword } from "@/lib/utils"
import {
  createAuthError,
  logAuthError,
  isValidEmail,
  validateRequiredFields,
  AuthError
} from "@/lib/auth/errors"
import { validatePasswordStrength } from "@/lib/auth/password-policy"
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email/email-service"
import crypto from 'crypto'
import { emailVerificationTokens } from "@/lib/db/schema"
import { RateLimiters, getClientIP, createRateLimitResponse } from "@/lib/utils/rate-limiter"
import { logRegistration } from "@/lib/auth/audit"

export async function POST(request: Request) {
  try {
    // Parse form data first to get email for better rate limiting
    const form = await request.formData()
    const email = String(form.get("email") || "").trim().toLowerCase()
    const username = String(form.get("username") || "").trim()
    const password = String(form.get("password") || "")
    const address = String(form.get("address") || "") || null
    const phoneNumber = String(form.get("phoneNumber") || "") || null

    // Validate required fields
    const userData = { email, username, password }
    validateRequiredFields(userData, ["email", "username", "password"])

    // Validate email format
    if (!isValidEmail(email)) {
      throw createAuthError.invalidEmail({ email })
    }

    // Rate limiting - protect against brute force registration attacks
    // Use email + IP combination to prevent blocking legitimate users in dev environment
    const clientIP = getClientIP(request);
    const rateLimitIdentifier = email ? `register:${email}:${clientIP}` : `register:${clientIP}`;
    const rateLimitResult = RateLimiters.auth(rateLimitIdentifier);
    
    if (!rateLimitResult.allowed) {
      const lang = request.headers.get('accept-language')?.includes('ar') ? 'ar' : 'en';
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

    // Validate password strength (enhanced)
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      const lang = request.headers.get('accept-language')?.includes('ar') ? 'ar' : 'en'
      return NextResponse.json(
        { 
          success: false, 
          error: lang === 'ar' 
            ? `كلمة المرور ضعيفة: ${passwordValidation.errors.join(', ')}`
            : `Weak password: ${passwordValidation.errors[0]}`,
          errors: passwordValidation.errors,
          strength: passwordValidation.strength,
          code: 'WEAK_PASSWORD'
        },
        { status: 400 }
      )
    }

    // Validate username length
    if (username.length < 3) {
      throw createAuthError.validationError("Username must be at least 3 characters")
    }

    // Check if user with email already exists
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).then(r => r[0])
    if (existingEmail) {
      // Reset rate limit for this email since it's a valid attempt with existing email
      RateLimiters.reset(rateLimitIdentifier);
      throw createAuthError.userAlreadyExists({ email })
    }

    // Check if user with username already exists
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).then(r => r[0])
    if (existingUsername) {
      // Reset rate limit for this email since it's a valid attempt with existing username
      RateLimiters.reset(rateLimitIdentifier);
      throw createAuthError.validationError("Username already taken")
    }

    // Hash password
    const hashed = await hashPassword(password)

    // Create user
    let created
    try {
      [created] = await db.insert(users).values({
        email,
        username,
        password: hashed,
        address: address || undefined,
        phoneNumber: phoneNumber || undefined,
        role: "user",
        provider: "email",
      }).returning()
    } catch (dbError: any) {
      // Handle database-specific errors
      logAuthError("POST /api/auth/register - database insert", dbError)
      
      // Check for unique constraint violations
      if (dbError?.message?.includes('unique') || dbError?.code === '23505') {
        if (dbError.message?.includes('email')) {
          throw createAuthError.userAlreadyExists({ email })
        }
        if (dbError.message?.includes('username')) {
          throw createAuthError.validationError("Username already taken")
        }
      }
      
      throw createAuthError.databaseError({ originalError: dbError.message })
    }

    // Create cart for new user
    try {
      await db.insert(cart).values({
        userId: created.id,
        totalAmount: "0.00"
      })
    } catch (cartError) {
      logAuthError("POST /api/auth/register - cart creation", cartError, {
        userId: created.id
      })
      // Continue even if cart creation fails
    }

    // Send verification email (don't block registration if email fails)
    const lang = request.headers.get('accept-language')?.includes('ar') ? 'ar' : 'en';
    try {
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      // Store token in database (expires in 24 hours)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await db.insert(emailVerificationTokens).values({
        userId: created.id,
        email: created.email,
        token: hashedToken,
        expiresAt,
        createdAt: new Date(),
      });

      // Send verification email
      await sendVerificationEmail(created.email, created.username || 'User', verificationToken, lang as 'ar' | 'en');
    } catch (emailError) {
      logAuthError("POST /api/auth/register - verification email", emailError, {
        userId: created.id,
        email: created.email
      })
      // Continue even if email fails - user can request resend later
    }

    // Reset rate limit after successful registration
    RateLimiters.reset(rateLimitIdentifier);

    // 🆕 Log successful registration
    await logRegistration(created.id, created.email, "email", request)

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: created.id, 
        email: created.email, 
        username: created.username 
      } 
    })
  } catch (error) {
    if (error instanceof AuthError) {
      logAuthError("POST /api/auth/register", error)
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    logAuthError("POST /api/auth/register", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}



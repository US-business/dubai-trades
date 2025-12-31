"use server"

import { db } from "@/lib/db"
import { authAuditLogs } from "@/lib/db/schema"
import { getClientIP, getUserAgent } from "@/lib/utils/request-helpers"

/**
 * Authentication Audit Logging
 * Tracks all authentication-related activities for security monitoring
 */

export type AuditAction = 
  | "login"
  | "logout"
  | "register"
  | "failed_login"
  | "password_change"
  | "password_reset_request"
  | "password_reset_complete"
  | "email_verification"
  | "account_locked"
  | "oauth_login"

interface AuditLogData {
  userId?: number
  action: AuditAction
  email?: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  failureReason?: string
  metadata?: Record<string, any>
}

/**
 * Log authentication activity
 */
export async function logAuthActivity(data: AuditLogData) {
  try {
    await db.insert(authAuditLogs).values({
      userId: data.userId,
      action: data.action,
      email: data.email,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success,
      failureReason: data.failureReason,
      metadata: data.metadata,
      createdAt: new Date(),
    })
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break the app
    console.error("Failed to log auth activity:", error)
  }
}


/**
 * Helper: Log successful login
 */
export async function logSuccessfulLogin(
  userId: number,
  email: string,
  provider: string,
  request: Request
) {
  await logAuthActivity({
    userId,
    action: provider === "email" ? "login" : "oauth_login",
    email,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    success: true,
    metadata: { provider },
  })
}

/**
 * Helper: Log failed login
 */
export async function logFailedLogin(
  email: string,
  reason: string,
  request: Request
) {
  await logAuthActivity({
    action: "failed_login",
    email,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    success: false,
    failureReason: reason,
  })
}

/**
 * Helper: Log registration
 */
export async function logRegistration(
  userId: number,
  email: string,
  provider: string,
  request: Request
) {
  await logAuthActivity({
    userId,
    action: "register",
    email,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    success: true,
    metadata: { provider },
  })
}

/**
 * Helper: Log password change
 */
export async function logPasswordChange(
  userId: number,
  email: string,
  request?: Request
) {
  await logAuthActivity({
    userId,
    action: "password_change",
    email,
    ipAddress: request ? getClientIP(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
    success: true,
  })
}

/**
 * Helper: Log account locked
 */
export async function logAccountLocked(
  userId: number,
  email: string,
  reason: string,
  request: Request
) {
  await logAuthActivity({
    userId,
    action: "account_locked",
    email,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    success: false,
    failureReason: reason,
  })
}

"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth.config"
import { db } from "@/lib/db"
import { users, cart } from "@/lib/db/schema"
import { eq, like, or, desc } from "drizzle-orm"
import { hashPassword } from "@/lib/utils"
import {
  createAuthError,
  logAuthError,
  isValidEmail,
  validateRequiredFields,
  AuthError
} from "@/lib/auth/errors"
import { validatePasswordStrength } from "@/lib/auth/password-policy"

export interface UserFormData {
  username: string
  email: string
  password?: string
  address?: string
  phoneNumber?: string
  role: "super_admin" | "viewer" | "user"
}

export interface UsersResponse {
  success: boolean
  data?: any[]
  error?: string
  total?: number
}

export interface UserResponse {
  success: boolean
  data?: any
  error?: string
}

// Helper function to check if user is super admin
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "super_admin") {
    throw new Error("Unauthorized: Super admin access required")
  }

  return session
}

// Get all users with pagination and search (Super Admin only)
export async function getUsers(page = 1, limit = 10, search?: string): Promise<UsersResponse> {
  try {
    await requireSuperAdmin()

    const offset = (page - 1) * limit

    const baseSelect = {
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      provider: users.provider,
      emailVerified: users.emailVerified,
      address: users.address,
      phoneNumber: users.phoneNumber,
    }

    let result
    let totalResult

    if (search) {
      const searchCondition = or(
        like(users.username, `%${search}%`),
        like(users.email, `%${search}%`),
        like(users.address, `%${search}%`),
        like(users.phoneNumber, `%${search}%`),
      )

      result = await db
        .select(baseSelect)
        .from(users)
        .where(searchCondition)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset)

      // Get total count for pagination
      totalResult = await db
        .select({ count: users.id })
        .from(users)
        .where(searchCondition)
    } else {
      result = await db
        .select(baseSelect)
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset)

      // Get total count for pagination
      totalResult = await db.select({ count: users.id }).from(users)
    }

    const total = totalResult.length

    return {
      success: true,
      data: result,
      total,
    }
  } catch (error) {
    logAuthError("getUsers", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    }
  }
}

// Get all users (simple version for admin dashboard)
export async function getAllUsers(): Promise<UsersResponse> {
  try {
    await requireSuperAdmin()

    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      provider: users.provider,
      emailVerified: users.emailVerified,
      address: users.address,
      phoneNumber: users.phoneNumber,
    }).from(users).orderBy(desc(users.createdAt))

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    logAuthError("getAllUsers", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    }
  }
}

// Get single user (Super Admin only)
export async function getUser(id: number): Promise<UserResponse> {
  try {
    await requireSuperAdmin()

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        provider: users.provider,
        emailVerified: users.emailVerified,
        address: users.address,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (result.length === 0) {
      return {
        success: false,
        error: "User not found",
      }
    }

    return {
      success: true,
      data: result[0],
    }
  } catch (error) {
    logAuthError("getUser", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    }
  }
}

// Create new viewer user (Super Admin only)
export async function createUser(data: UserFormData): Promise<UserResponse> {
  try {
    await requireSuperAdmin()

    // Validate required fields
    validateRequiredFields(data, ["username", "email", "password"])

    // Validate email format
    if (!isValidEmail(data.email)) {
      throw createAuthError.invalidEmail({ email: data.email })
    }

    // Validate role (only viewer allowed for creation)
    if (data.role !== "viewer") {
      return {
        success: false,
        error: "Only viewer role can be created"
      }
    }

    // Validate password strength
    if (!data.password) {
      throw createAuthError.validationError("Password is required")
    }

    const passwordValidation = validatePasswordStrength(data.password)
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: `Weak password: ${passwordValidation.errors[0]}`,
      }
    }

    // Validate username length
    if (data.username.length < 3) {
      throw createAuthError.validationError("Username must be at least 3 characters")
    }

    // Check if user with email already exists
    const existingEmail = await db.select().from(users).where(eq(users.email, data.email.toLowerCase())).then(r => r[0])
    if (existingEmail) {
      throw createAuthError.userAlreadyExists({ email: data.email })
    }

    // Check if user with username already exists
    const existingUsername = await db.select().from(users).where(eq(users.username, data.username)).then(r => r[0])
    if (existingUsername) {
      throw createAuthError.validationError("Username already taken")
    }

    // Hash password
    const hashed = await hashPassword(data.password)

    // Create user
    const [created] = await db.insert(users).values({
      email: data.email.toLowerCase(),
      username: data.username,
      password: hashed,
      role: "viewer",
      provider: "email",
      emailVerified: new Date(), // Admin-created users are pre-verified
      address: data.address || null,
      phoneNumber: data.phoneNumber || null,
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })

    // Create cart for new user
    try {
      await db.insert(cart).values({
        userId: created.id,
        totalAmount: "0.00"
      })
    } catch (cartError) {
      logAuthError("createUser - cart creation", cartError, {
        userId: created.id
      })
      // Continue even if cart creation fails
    }

    revalidatePath("/dashboard/users")

    return {
      success: true,
      data: created,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      logAuthError("createUser", error)
      return {
        success: false,
        error: error.message,
      }
    }

    logAuthError("createUser", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    }
  }
}

// Update user (Super Admin only)
export async function updateUser(id: number, data: UserFormData): Promise<UserResponse> {
  try {
    const session = await requireSuperAdmin()

    // Prevent admin from modifying themselves
    if (session.user.id === id) {
      return {
        success: false,
        error: "Cannot modify your own account"
      }
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, id)).then(rows => rows[0])
    if (!existingUser) {
      return {
        success: false,
        error: "User not found"
      }
    }

    // Prevent changing super_admin role
    if (existingUser.role === "super_admin") {
      return {
        success: false,
        error: "Cannot modify super admin accounts"
      }
    }

    // Validate role if provided
    if (data.role && !["viewer", "user"].includes(data.role)) {
      return {
        success: false,
        error: "Invalid role. Only 'viewer' and 'user' are allowed"
      }
    }

    // Validate email if provided
    if (data.email && !isValidEmail(data.email)) {
      throw createAuthError.invalidEmail({ email: data.email })
    }

    // Check for duplicate email (if changing)
    if (data.email && data.email !== existingUser.email) {
      const duplicateEmail = await db.select().from(users).where(eq(users.email, data.email.toLowerCase())).then(r => r[0])
      if (duplicateEmail) {
        throw createAuthError.userAlreadyExists({ email: data.email })
      }
    }

    // Check for duplicate username (if changing)
    if (data.username && data.username !== existingUser.username) {
      const duplicateUsername = await db.select().from(users).where(eq(users.username, data.username)).then(r => r[0])
      if (duplicateUsername) {
        throw createAuthError.validationError("Username already taken")
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.email) updateData.email = data.email.toLowerCase()
    if (data.username) updateData.username = data.username
    if (data.role) updateData.role = data.role
    if (data.address !== undefined) updateData.address = data.address || null
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber || null

    // Handle password update
    if (data.password) {
      const passwordValidation = validatePasswordStrength(data.password)
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Weak password: ${passwordValidation.errors[0]}`,
        }
      }
      updateData.password = await hashPassword(data.password)
    }

    // Update user
    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        updatedAt: users.updatedAt
      })

    revalidatePath("/dashboard/users")

    return {
      success: true,
      data: updated,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      logAuthError("updateUser", error)
      return {
        success: false,
        error: error.message,
      }
    }

    logAuthError("updateUser", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    }
  }
}

// Delete user (Super Admin only)
export async function deleteUser(id: number): Promise<UserResponse> {
  try {
    const session = await requireSuperAdmin()

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return {
        success: false,
        error: "Cannot delete your own account"
      }
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, id)).then(rows => rows[0])
    if (!existingUser) {
      return {
        success: false,
        error: "User not found"
      }
    }

    // Prevent deleting super_admin
    if (existingUser.role === "super_admin") {
      return {
        success: false,
        error: "Cannot delete super admin accounts"
      }
    }

    // Delete user (cascade will handle related records)
    await db.delete(users).where(eq(users.id, id))

    revalidatePath("/dashboard/users")

    return {
      success: true,
    }
  } catch (error) {
    logAuthError("deleteUser", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    }
  }
}

// Get current user (without admin requirements)
export async function getCurrentUser(): Promise<UserResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        image: users.image,
        address: users.address,
        phoneNumber: users.phoneNumber,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, Number(session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return {
        success: false,
        error: "User not found",
      }
    }

    return {
      success: true,
      data: result[0],
    }
  } catch (error) {
    logAuthError("getCurrentUser", error)
    return {
      success: false,
      error: "Failed to fetch user",
    }
  }
}

// Update profile (for current user)
export async function updateProfile(data: Partial<UserFormData>): Promise<UserResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Unauthorized - No session or user ID",
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (data.username) updateData.username = data.username
    if (data.email) updateData.email = data.email
    if (data.address !== undefined) updateData.address = data.address || null
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber || null

    // Only update password if provided
    if (data.password) {
      const passwordValidation = validatePasswordStrength(data.password)
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Weak password: ${passwordValidation.errors[0]}`,
        }
      }
      updateData.password = await hashPassword(data.password)
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id as number))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        address: users.address,
        phoneNumber: users.phoneNumber,
        role: users.role,
        createdAt: users.createdAt,
      })

    revalidatePath("/account")

    return {
      success: true,
      data: result[0],
    }
  } catch (error) {
    logAuthError("updateProfile", error)
    return {
      success: false,
      error: "Failed to update profile",
    }
  }
}

// Update profile image action
export async function updateProfileImage(imageUrl: string): Promise<UserResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return {
        success: false,
        error: "Unauthorized - No session or user ID",
      }
    }

    const result = await db
      .update(users)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id as number))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        image: users.image,
        address: users.address,
        phoneNumber: users.phoneNumber,
        role: users.role,
        createdAt: users.createdAt,
      })

    revalidatePath("/account")

    return {
      success: true,
      data: result[0],
    }
  } catch (error) {
    logAuthError("updateProfileImage", error)
    return {
      success: false,
      error: "Failed to update profile image",
    }
  }
}
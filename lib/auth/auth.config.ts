import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users, accounts, sessions, verificationTokens, cart } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { env, isDevelopment } from "@/lib/config/env"
import { logAuthError } from "./errors"
import { RateLimiters } from "@/lib/utils/rate-limiter"
import { logAccountLocked } from "./audit"




export const authOptions: AuthOptions = {
  // تم إزالة DrizzleAdapter لحل مشاكل التوافق
  // سيتم التعامل مع قاعدة البيانات يدوياً في callbacks
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline", 
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      // Use default configuration - NextAuth handles FB scopes automatically
      // Email permission requires App Review approval from Facebook
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          logAuthError("CredentialsProvider.authorize", new Error("Missing credentials"), {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password
          })
          return null
        }
        
        // Rate limiting - protect against brute force login attacks
        const rateLimitResult = RateLimiters.auth(`signin:${credentials.email}`);
        if (!rateLimitResult.allowed) {
          logAuthError("CredentialsProvider.authorize", new Error("Rate limit exceeded"), {
            email: credentials.email,
            retryAfter: rateLimitResult.retryAfter
          })
          return null
        }
        
        try {
          const dbUser = await db.select().from(users).where(eq(users.email, credentials.email)).then(rows => rows[0])
          if (!dbUser || !dbUser.password) {
            logAuthError("CredentialsProvider.authorize", new Error("User not found or no password"), {
              email: credentials.email,
              userExists: !!dbUser,
              hasPassword: !!dbUser?.password
            })
            return null
          }

          // Check if account is locked
          if (dbUser.lockedUntil && new Date(dbUser.lockedUntil) > new Date()) {
            logAuthError("CredentialsProvider.authorize", new Error("Account is locked"), {
              email: credentials.email,
              lockedUntil: dbUser.lockedUntil
            })
            return null
          }

          // 🆕 Email Verification Check (warning only, not blocking)
          // You can make this blocking by returning null
          if (!dbUser.emailVerified) {
            console.log("⚠️ User email not verified:", credentials.email)
            // Optional: return null to block unverified users from signing in
            // For now, we allow it but log a warning
          }

          const { comparePasswords } = await import("@/lib/utils")
          const valid = await comparePasswords(credentials.password, dbUser.password)
          
          if (!valid) {
            // Increment failed login attempts
            const failedAttempts = (dbUser.failedLoginAttempts || 0) + 1
            const maxAttempts = 5
            
            if (failedAttempts >= maxAttempts) {
              // Lock account for 15 minutes
              const lockUntil = new Date(Date.now() + 15 * 60 * 1000)
              await db.update(users)
                .set({ 
                  failedLoginAttempts: failedAttempts,
                  lockedUntil: lockUntil 
                })
                .where(eq(users.id, dbUser.id))
              
              logAuthError("CredentialsProvider.authorize", new Error("Account locked due to too many failed attempts"), {
                email: credentials.email,
                failedAttempts,
                lockedUntil: lockUntil
              })
            } else {
              // Just increment failed attempts
              await db.update(users)
                .set({ failedLoginAttempts: failedAttempts })
                .where(eq(users.id, dbUser.id))
              
              logAuthError("CredentialsProvider.authorize", new Error("Invalid password"), {
                email: credentials.email,
                failedAttempts
              })
            }
            return null
          }

          // Reset failed login attempts on successful login
          if (dbUser.failedLoginAttempts && dbUser.failedLoginAttempts > 0) {
            await db.update(users)
              .set({ 
                failedLoginAttempts: 0,
                lockedUntil: null 
              })
              .where(eq(users.id, dbUser.id))
          }

          return {
            id: String(dbUser.id), // تحويل إلى string لتوافق NextAuth
            email: dbUser.email,
            name: dbUser.username || dbUser.email.split('@')[0],
            image: dbUser.image ?? undefined,
          } as any
        } catch (error) {
          logAuthError("CredentialsProvider.authorize", error, {
            email: credentials.email
          })
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      console.log("🔐 JWT Callback:", {
        hasAccount: !!account,
        hasUser: !!user,
        userEmail: user?.email,
        currentTokenId: token.id
      })
      
      // Persist the OAuth access_token and/or the user id to the token right after signin
      if (account && user && user.email) {
        try {
          const dbUser = await db.select().from(users).where(eq(users.email, user.email)).then(rows => rows[0])
          console.log("👤 DB User found in JWT:", {
            found: !!dbUser,
            userId: dbUser?.id,
            email: dbUser?.email
          })
          
          if (dbUser) {
            token.role = dbUser.role
            token.id = dbUser.id
            token.username = dbUser.username || user.name || user.email?.split('@')[0]
            token.email = dbUser.email
            console.log("✅ Token updated with user ID:", token.id)
          } else {
            token.email = user.email
            token.username = user.name || user.email?.split('@')[0]
            token.role = "user" // default role
            console.log("⚠️ No DB user found - token.id will be undefined")
            // Note: id will be undefined for users not in database 
          }
        } catch (error) {
          logAuthError("jwt callback", error, {
            hasUser: !!user,
            hasAccount: !!account,
            userEmail: user?.email
          })
          // Use user data from OAuth as fallback
          token.email = user.email
          token.username = user.name || user.email?.split('@')[0]
          token.role = "user"
        }
      }
      
      // For existing tokens, ensure we have the data
      if (!account && token.email && !token.id) {
        try {
          const dbUser = await db.select().from(users).where(eq(users.email, token.email as string)).then(rows => rows[0])
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.username = dbUser.username || token.username
          }
        } catch (error) {
          logAuthError("jwt callback - token refresh", error, {
            tokenEmail: token.email,
            hasId: !!token.id
          })
        }
      }
      
      return token
    },
    async session({ session, token }) { 
      console.log("🎫 Session Callback:", {
        hasToken: !!token,
        tokenId: token?.id,
        tokenEmail: token?.email
      })
      
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as number
        session.user.role = (token.role as "super_admin" | "viewer" | "user") || "user"
        session.user.username = (token.username as string) || session.user.name || "User"
        session.user.email = (token.email as string) || session.user.email || ""
        
        console.log("✅ Session user set:", {
          id: session.user.id,
          email: session.user.email,
          hasId: !!session.user.id
        })
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth providers (Google & Facebook)
      if (account?.provider === "google" || account?.provider === "facebook") {
        const providerName = account.provider === "google" ? "Google" : "Facebook"
        console.log(`🔑 SignIn Callback (${providerName}):`, {
          email: user.email,
          providerId: account.providerAccountId
        })
        
        try {
          if (!user.email) {
            console.log("❌ No email provided")
            return false
          }
          
          // فحص إذا كان المستخدم موجود
          const existingUser = await db.select()
            .from(users)
            .where(eq(users.email, user.email))
            .then(rows => rows[0])
          
          if (existingUser) {
            console.log("✅ Existing user found:", {
              userId: existingUser.id,
              email: existingUser.email
            })
            
            // Update last login time and IP (will be done in jwt callback)
            return true // مستخدم موجود، السماح بالدخول
          }
          
          console.log("📝 Creating new user...")
          
          // إنشاء مستخدم جديد
          const newUserData: any = {
            email: user.email,
            username: user.name || user.email?.split('@')[0] || "User",
            image: user.image,
            provider: account.provider,
            emailVerified: new Date(),
            role: "user",
          }
          
          // Add provider-specific ID
          if (account.provider === "google") {
            newUserData.googleId = account.providerAccountId
          } else if (account.provider === "facebook") {
            newUserData.facebookId = account.providerAccountId
          }
          
          const [newUser] = await db.insert(users).values(newUserData).returning()
          
          console.log("✅ New user created:", {
            userId: newUser.id,
            email: newUser.email,
            provider: account.provider
          })
          
          // إنشاء سجل الحساب (accounts)
          await db.insert(accounts).values({
            userId: newUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          })
          
          console.log("✅ Account record created")
          
          // إنشاء سلة تسوق للمستخدم الجديد
          await db.insert(cart).values({ 
            userId: newUser.id,
            totalAmount: "0.00"
          })
          
          console.log("✅ Cart created for new user")
          
          return true
        } catch (error) {
          logAuthError(`signIn callback - ${providerName}`, error, {
            userEmail: user.email,
            providerId: account.providerAccountId
          })
          return false
        }
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`
        return redirectUrl
      }

      // Allows callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }

      // Respect provided callbackUrl (relative or absolute)
      try {
        const parsed = new URL(url, baseUrl)
        if (parsed.origin === baseUrl) {
          return parsed.toString()
        }
      } catch (error) {
        logAuthError("redirect callback", error, {
          url,
          baseUrl
        })
      }

      // Default to Arabic home as app default locale
      const fallback = `${baseUrl}/ar`
      return fallback
    }
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24 * 30,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  debug: isDevelopment,
}

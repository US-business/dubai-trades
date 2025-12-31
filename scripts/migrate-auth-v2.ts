/**
 * Database Migration Script for Auth System v2
 * 
 * This script adds:
 * 1. Facebook OAuth support (facebookId column)
 * 2. Last login tracking (lastLoginAt, lastLoginIp)
 * 3. Auth Audit Logs table for security monitoring
 * 
 * Run: npx tsx scripts/migrate-auth-v2.ts
 */

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { sql } from "drizzle-orm"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

// Create database connection
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in .env.local")
  process.exit(1)
}

const client = postgres(connectionString)
const db = drizzle(client)

async function migrate() {
  console.log("🚀 Starting Auth System v2 Migration...")
  console.log("=" .repeat(60))

  try {
    // 1. Add new columns to users table
    console.log("\n📝 Step 1: Adding new columns to users table...")
    
    try {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);
      `)
      console.log("✅ Users table columns added successfully")
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("ℹ️  Columns already exist, skipping...")
      } else {
        throw error
      }
    }

    // 2. Create auth_audit_logs table
    console.log("\n📝 Step 2: Creating auth_audit_logs table...")
    
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS auth_audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(50) NOT NULL,
          email VARCHAR(100),
          ip_address VARCHAR(45),
          user_agent TEXT,
          success BOOLEAN NOT NULL DEFAULT true,
          failure_reason TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `)
      console.log("✅ auth_audit_logs table created successfully")
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("ℹ️  Table already exists, skipping...")
      } else {
        throw error
      }
    }

    // 3. Create indexes for better query performance
    console.log("\n📝 Step 3: Creating indexes...")
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS auth_audit_user_id_idx 
        ON auth_audit_logs(user_id);
      `)
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS auth_audit_action_idx 
        ON auth_audit_logs(action);
      `)
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS auth_audit_created_at_idx 
        ON auth_audit_logs(created_at);
      `)
      
      console.log("✅ Indexes created successfully")
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("ℹ️  Indexes already exist, skipping...")
      } else {
        throw error
      }
    }

    // 4. Verify migration
    console.log("\n📝 Step 4: Verifying migration...")
    
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('facebook_id', 'last_login_at', 'last_login_ip');
    `)
    
    const resultArray = Array.isArray(result) ? result : []
    console.log(`✅ Found ${resultArray.length}/3 new columns in users table`)
    
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'auth_audit_logs'
      );
    `)
    
    const tableCheckArray = Array.isArray(tableCheck) ? tableCheck : []
    if (tableCheckArray[0]?.exists) {
      console.log("✅ auth_audit_logs table exists")
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ Migration completed successfully!")
    console.log("\n📊 Summary:")
    console.log("  • Added facebook_id column to users table")
    console.log("  • Added last_login_at column to users table")
    console.log("  • Added last_login_ip column to users table")
    console.log("  • Created auth_audit_logs table")
    console.log("  • Created indexes for performance")
    console.log("\n🔐 Next steps:")
    console.log("  1. Add FACEBOOK_CLIENT_ID to your .env.local")
    console.log("  2. Add FACEBOOK_CLIENT_SECRET to your .env.local")
    console.log("  3. Configure Facebook OAuth in developers.facebook.com")
    console.log("  4. Test Facebook login functionality")
    console.log("  5. Monitor auth_audit_logs for security events")
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    console.error("\n🔧 Please fix the error and try again")
    process.exit(1)
  }
}

// Run migration
migrate()
  .then(async () => {
    console.log("\n👋 Migration script finished")
    await client.end()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error("\n💥 Fatal error:", error)
    await client.end()
    process.exit(1)
  })

/**
 * Migration Script: Add Email Verification and Account Security Features
 * 
 * This script adds:
 * 1. Email verification tokens table
 * 2. Failed login attempts tracking
 * 3. Account lockout mechanism
 * 
 * Run with: tsx scripts/migrate-auth-enhancements.ts
 */

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting auth enhancements migration...\n');

  try {
    // 1. Add email verification tokens table
    console.log('📧 Creating email_verification_tokens table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ email_verification_tokens table created\n');

    // 2. Add account security fields to users table
    console.log('🔒 Adding security fields to users table...');
    
    // Check if columns already exist
    const failedAttemptsExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='failed_login_attempts';
    `);

    if (!failedAttemptsExists || failedAttemptsExists.length === 0) {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
        ADD COLUMN locked_until TIMESTAMP;
      `);
      console.log('✅ Security fields added to users table\n');
    } else {
      console.log('ℹ️  Security fields already exist in users table\n');
    }

    // 3. Create indexes for better performance
    console.log('⚡ Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
      ON email_verification_tokens(token);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
      ON email_verification_tokens(user_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_email_verified 
      ON users(email_verified);
    `);
    console.log('✅ Indexes created\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - Email verification tokens table created');
    console.log('   - Account security fields added');
    console.log('   - Performance indexes created');
    console.log('\n✅ Database is ready for enhanced authentication features!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n👋 Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });

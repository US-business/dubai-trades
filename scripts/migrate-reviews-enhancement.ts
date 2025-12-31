#!/usr/bin/env tsx

/**
 * Migration script to add enhanced review features:
 * 1. Add verifiedPurchase, helpfulCount, notHelpfulCount, updatedAt to reviews table
 * 2. Create reviewVotes table for helpful/not helpful voting
 * 3. Create sellerResponses table for seller responses to reviews
 */

import { db } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('🚀 Starting Reviews Enhancement Migration...')

  try {
    // 1. Add new columns to reviews table
    console.log('📝 Adding new columns to reviews table...')
    
    await db.execute(sql`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `)

    // 2. Create review_votes table
    console.log('📝 Creating review_votes table...')
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS review_votes (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id)
      )
    `)

    // 3. Create indexes for review_votes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS review_votes_review_id_idx ON review_votes(review_id);
      CREATE INDEX IF NOT EXISTS review_votes_user_id_idx ON review_votes(user_id);
    `)

    // 4. Create seller_responses table
    console.log('📝 Creating seller_responses table...')
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS seller_responses (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        seller_id INTEGER NOT NULL REFERENCES users(id),
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // 5. Create indexes for seller_responses
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS seller_responses_review_id_idx ON seller_responses(review_id);
      CREATE INDEX IF NOT EXISTS seller_responses_seller_id_idx ON seller_responses(seller_id);
    `)

    // 6. Update verified_purchase for existing reviews based on order history
    console.log('🔍 Updating verified_purchase status for existing reviews...')
    
    await db.execute(sql`
      UPDATE reviews 
      SET verified_purchase = true 
      WHERE EXISTS (
        SELECT 1 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        WHERE o.user_id = reviews.user_id 
        AND oi.product_id = reviews.product_id 
        AND o.status = 'completed'
      )
    `)

    // 7. Set updated_at to created_at for existing reviews
    await db.execute(sql`
      UPDATE reviews 
      SET updated_at = created_at 
      WHERE updated_at IS NULL
    `)

    console.log('✅ Reviews Enhancement Migration completed successfully!')
    
    // Display summary
    const reviewsCount = await db.execute(sql`SELECT COUNT(*) as count FROM reviews`)
    const verifiedCount = await db.execute(sql`SELECT COUNT(*) as count FROM reviews WHERE verified_purchase = true`)
    
    console.log(`📊 Migration Summary:`)
    console.log(`   - Total reviews: ${Array.isArray(reviewsCount) ? reviewsCount[0]?.count || 0 : 0}`)
    console.log(`   - Verified purchases: ${Array.isArray(verifiedCount) ? verifiedCount[0]?.count || 0 : 0}`)
    console.log(`   - New tables created: review_votes, seller_responses`)
    console.log(`   - Enhanced features available: ✓ Purchase verification ✓ Voting ✓ Seller responses ✓ Filtering`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this script is called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export { main as migrateReviewsEnhancement }

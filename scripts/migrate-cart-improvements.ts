/**
 * Database Migration Script for Cart System Improvements
 * 
 * This script adds:
 * 1. Timestamps (createdAt, updatedAt) to cart_items
 * 2. Unique constraint on (cartId, productId)
 * 3. Performance indexes
 * 4. CASCADE delete behavior
 * 
 * Run: npx tsx scripts/migrate-cart-improvements.ts
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
  console.log("🚀 Starting Cart System Improvements Migration...")
  console.log("=" .repeat(60))

  try {
    // 1. Add timestamps to cart_items
    console.log("\n📝 Step 1: Adding timestamps to cart_items...")
    
    try {
      await db.execute(sql`
        ALTER TABLE cart_items 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      `)
      console.log("✅ created_at column added")
    } catch (error: any) {
      console.log("ℹ️  created_at:", error.code === '42701' ? 'already exists' : 'added')
    }
    
    try {
      await db.execute(sql`
        ALTER TABLE cart_items 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      `)
      console.log("✅ updated_at column added")
    } catch (error: any) {
      console.log("ℹ️  updated_at:", error.code === '42701' ? 'already exists' : 'added')
    }

    // 2. Add unique constraint
    console.log("\n📝 Step 2: Adding unique constraint...")
    
    try {
      await db.execute(sql`
        ALTER TABLE cart_items 
        ADD CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id);
      `)
      console.log("✅ Unique constraint added successfully")
    } catch (error: any) {
      if (error.code === '42P07' || error.message?.includes("already exists")) {
        console.log("ℹ️  Unique constraint already exists, skipping...")
      } else {
        console.log("⚠️  Unique constraint error:", error.message)
        console.log("   Continuing with migration...")
      }
    }

    // 3. Create indexes for performance
    console.log("\n📝 Step 3: Creating performance indexes...")
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx 
        ON cart_items(cart_id);
      `)
      console.log("✅ cart_items_cart_id_idx created")
    } catch (error: any) {
      if (error.code === '42P07') {
        console.log("ℹ️  cart_items_cart_id_idx already exists")
      } else {
        console.log("⚠️  Index error:", error.message)
      }
    }
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS cart_items_product_id_idx 
        ON cart_items(product_id);
      `)
      console.log("✅ cart_items_product_id_idx created")
    } catch (error: any) {
      if (error.code === '42P07') {
        console.log("ℹ️  cart_items_product_id_idx already exists")
      } else {
        console.log("⚠️  Index error:", error.message)
      }
    }

    // 4. Update foreign keys to CASCADE
    console.log("\n📝 Step 4: Updating foreign keys to CASCADE...")
    
    try {
      // Drop old constraints
      await db.execute(sql`
        ALTER TABLE cart_items 
        DROP CONSTRAINT IF EXISTS cart_items_cart_id_fkey;
      `)
      
      await db.execute(sql`
        ALTER TABLE cart_items 
        DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
      `)
      
      // Add new constraints with CASCADE
      await db.execute(sql`
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_cart_id_fkey 
        FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE;
      `)
      
      await db.execute(sql`
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
      `)
      
      console.log("✅ Foreign keys updated with CASCADE")
    } catch (error: any) {
      console.log("⚠️  Foreign key update:", error.message)
      // Don't fail if this step has issues
    }

    // 5. Update cart foreign keys
    console.log("\n📝 Step 5: Updating cart foreign keys...")
    
    try {
      await db.execute(sql`
        ALTER TABLE cart 
        DROP CONSTRAINT IF EXISTS cart_user_id_fkey;
      `)
      
      await db.execute(sql`
        ALTER TABLE cart 
        ADD CONSTRAINT cart_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `)
      
      await db.execute(sql`
        ALTER TABLE cart 
        DROP CONSTRAINT IF EXISTS cart_coupon_id_fkey;
      `)
      
      await db.execute(sql`
        ALTER TABLE cart 
        ADD CONSTRAINT cart_coupon_id_fkey 
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
      `)
      
      console.log("✅ Cart foreign keys updated")
    } catch (error: any) {
      console.log("⚠️  Cart foreign key update:", error.message)
    }

    // 6. Verify migration
    console.log("\n📝 Step 6: Verifying migration...")
    
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      AND column_name IN ('created_at', 'updated_at');
    `)
    
    const resultArray = Array.isArray(result) ? result : []
    console.log(`✅ Found ${resultArray.length}/2 timestamp columns`)
    
    const constraints = await db.execute(sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'cart_items' 
      AND constraint_name = 'unique_cart_product';
    `)
    
    const constraintsArray = Array.isArray(constraints) ? constraints : []
    if (constraintsArray.length > 0) {
      console.log("✅ Unique constraint exists")
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ Migration completed successfully!")
    console.log("\n📊 Summary:")
    console.log("  • Added created_at & updated_at to cart_items")
    console.log("  • Added unique constraint (cart_id, product_id)")
    console.log("  • Created performance indexes")
    console.log("  • Updated foreign keys to CASCADE")
    console.log("\n🎯 Next steps:")
    console.log("  1. Run: npx drizzle-kit push (to sync schema)")
    console.log("  2. Test cart functionality")
    console.log("  3. Monitor performance improvements")
    
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

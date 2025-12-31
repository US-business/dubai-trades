/**
 * Wishlist Merge Lock Manager
 * Prevents race conditions during wishlist merge operations
 * Created: 2025-11-08
 */

class WishlistMergeLock {
  private locks: Map<number, boolean> = new Map()
  private mergeTimestamps: Map<number, number> = new Map()
  private readonly LOCK_TIMEOUT = 10000 // 10 seconds
  private readonly COOLDOWN_PERIOD = 5000 // 5 seconds between merges

  /**
   * Attempt to acquire a lock for a user's wishlist merge
   */
  async acquire(userId: number): Promise<boolean> {
    // Check if already locked
    if (this.locks.get(userId)) {
      console.log(`🔒 Wishlist merge lock already held for user ${userId}`)
      return false
    }

    // Check if merge was too recent
    const lastMerge = this.mergeTimestamps.get(userId)
    if (lastMerge && (Date.now() - lastMerge) < this.COOLDOWN_PERIOD) {
      console.log(`⏱️ Wishlist merge cooldown active for user ${userId}`)
      return false
    }

    // Acquire lock
    this.locks.set(userId, true)
    console.log(`✅ Wishlist merge lock acquired for user ${userId}`)

    // Auto-release after timeout
    setTimeout(() => {
      if (this.locks.get(userId)) {
        console.warn(`⚠️ Auto-releasing stale wishlist lock for user ${userId}`)
        this.release(userId)
      }
    }, this.LOCK_TIMEOUT)

    return true
  }

  /**
   * Release the lock for a user
   */
  release(userId: number): void {
    this.locks.delete(userId)
    this.mergeTimestamps.set(userId, Date.now())
    console.log(`🔓 Wishlist merge lock released for user ${userId}`)
  }

  /**
   * Check if a lock is held
   */
  isLocked(userId: number): boolean {
    return this.locks.get(userId) || false
  }

  /**
   * Force release all locks (use with caution)
   */
  releaseAll(): void {
    this.locks.clear()
    console.log('🔓 All wishlist merge locks released')
  }
}

// Singleton instance
export const wishlistMergeLock = new WishlistMergeLock()

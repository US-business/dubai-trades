/**
 * Simple In-Memory Rate Limiter
 * Protects authentication endpoints from brute force attacks
 */

import { getClientIP as getClientIPHelper } from './request-helpers';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.store = new Map();
    this.startCleanup();
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP, email, etc.)
   * @param config - Rate limit configuration
   * @returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(
    identifier: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      };
    }

    // Create new entry or reset if window expired
    if (!entry || entry.resetTime < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      this.store.set(identifier, newEntry);

      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxAttempts) {
      // Block if configured
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs;
        this.store.set(identifier, entry);

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.blockedUntil,
          retryAfter: Math.ceil(config.blockDurationMs / 1000),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: config.maxAttempts - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup expired entries every 5 minutes
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        // Remove if window expired and not blocked
        if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop cleanup interval (for testing or shutdown)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Pre-configured rate limiters for different use cases
export const RateLimiters = {
  /**
   * For authentication attempts (signin, register)
   * 5 attempts per 15 minutes, then block for 15 minutes
   */
  auth: (identifier: string) =>
    rateLimiter.check(identifier, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes after limit
    }),

  /**
   * For password reset requests
   * 3 attempts per hour, then block for 1 hour
   */
  passwordReset: (identifier: string) =>
    rateLimiter.check(identifier, {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
    }),

  /**
   * For general API calls
   * 100 attempts per minute
   */
  api: (identifier: string) =>
    rateLimiter.check(identifier, {
      maxAttempts: 100,
      windowMs: 60 * 1000, // 1 minute
    }),

  /**
   * Reset rate limit for identifier
   */
  reset: (identifier: string) => rateLimiter.reset(identifier),

  /**
   * Clear all rate limits
   */
  clear: () => rateLimiter.clear(),
};

/**
 * Get client IP address from request
 * Re-exported from request-helpers for backward compatibility
 */
export const getClientIP = getClientIPHelper;

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(
  retryAfter: number,
  lang: 'ar' | 'en' = 'en'
) {
  const minutes = Math.ceil(retryAfter / 60);
  return {
    error: lang === 'ar'
      ? `تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة مرة أخرى بعد ${minutes} دقيقة`
      : `Too many registration attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}`,
    retryAfter,
    code: 'RATE_LIMIT_EXCEEDED',
  };
}

export default rateLimiter;

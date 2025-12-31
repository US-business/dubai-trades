/**
 * Request Helper Utilities
 * Utility functions for extracting information from Request objects
 */

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check various proxy headers
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  return "unknown"
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown"
}

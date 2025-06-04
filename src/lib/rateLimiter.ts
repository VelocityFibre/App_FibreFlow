/**
 * Rate Limiter for Database Operations
 * 
 * Prevents excessive API calls and protects against abuse.
 * Uses in-memory storage with sliding window algorithm.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed under rate limit
   */
  isAllowed(
    identifier: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
    const now = Date.now();
    const resetTime = now + config.windowMs;

    const entry = this.storage.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.storage.set(key, {
        count: 1,
        resetTime
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime
      };
    }

    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment counter
    entry.count++;
    this.storage.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string, config: RateLimitConfig): void {
    const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
    this.storage.delete(key);
  }

  /**
   * Get current usage for identifier
   */
  getUsage(identifier: string, config: RateLimitConfig): {
    count: number;
    remaining: number;
    resetTime: number;
  } | null {
    const key = config.keyGenerator ? config.keyGenerator(identifier) : identifier;
    const entry = this.storage.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }

    return {
      count: entry.count,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.storage.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Database query operations
  DATABASE_READ: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (userId: string) => `db_read:${userId}`
  },
  
  // Database write operations (more restrictive)
  DATABASE_WRITE: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (userId: string) => `db_write:${userId}`
  },

  // Bulk operations (very restrictive)
  DATABASE_BULK: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (userId: string) => `db_bulk:${userId}`
  },

  // Authentication operations
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (identifier: string) => `auth:${identifier}`
  },

  // File upload operations
  FILE_UPLOAD: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (userId: string) => `upload:${userId}`
  },

  // Real-time subscriptions
  REALTIME_SUBSCRIBE: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (userId: string) => `realtime:${userId}`
  }
} as const;

/**
 * Rate limit decorator for database operations
 */
export function withRateLimit<T extends any[], R>(
  config: RateLimitConfig,
  getUserId: (...args: T) => string
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (...args: T): Promise<R> {
      const userId = getUserId(...args);
      const result = rateLimiter.isAllowed(userId, config);

      if (!result.allowed) {
        const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000);
        throw new Error(
          `Rate limit exceeded. Try again in ${resetIn} seconds.`
        );
      }

      // Add rate limit headers to response if in browser environment
      if (typeof window !== 'undefined' && (window as any).__RATE_LIMIT_DEBUG) {
        console.log(`Rate limit: ${result.remaining} remaining, resets at ${new Date(result.resetTime)}`);
      }

      return method.apply(this, args);
    };
  };
}

/**
 * Check rate limit manually
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  return rateLimiter.isAllowed(identifier, config);
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string, config: RateLimitConfig): void {
  rateLimiter.reset(identifier, config);
}

/**
 * Get current usage
 */
export function getRateLimitUsage(
  identifier: string,
  config: RateLimitConfig
): { count: number; remaining: number; resetTime: number } | null {
  return rateLimiter.getUsage(identifier, config);
}

/**
 * Rate limited wrapper for async functions
 */
export async function withRateLimitCheck<T>(
  identifier: string,
  config: RateLimitConfig,
  operation: () => Promise<T>
): Promise<T> {
  const result = rateLimiter.isAllowed(identifier, config);

  if (!result.allowed) {
    const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000);
    throw new Error(
      `Rate limit exceeded. Try again in ${resetIn} seconds.`
    );
  }

  return operation();
}

// Export singleton instance for advanced usage
export { rateLimiter };

// Clean up on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    rateLimiter.destroy();
  });
}
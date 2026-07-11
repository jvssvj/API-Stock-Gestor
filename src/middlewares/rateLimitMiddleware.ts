import { NextFunction, Request, Response } from "express";

interface RateLimitOptions {
  windowMs: number
  max: number
  message: string
}

interface RateLimitBucket {
  count: number
  resetAt: number
}

const createRateLimiter = ({ windowMs, max, message }: RateLimitOptions) => {
  const buckets = new Map<string, RateLimitBucket>()

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || "unknown"}:${req.path}`
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      res.setHeader("X-RateLimit-Limit", String(max))
      res.setHeader("X-RateLimit-Remaining", String(max - 1))
      return next()
    }

    if (bucket.count >= max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000)
      res.setHeader("Retry-After", String(retryAfterSeconds))
      return res.status(429).json({ message })
    }

    bucket.count += 1
    res.setHeader("X-RateLimit-Limit", String(max))
    res.setHeader("X-RateLimit-Remaining", String(Math.max(max - bucket.count, 0)))
    return next()
  }
}

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Muitas requisições. Tente novamente em alguns minutos.",
})

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Muitas tentativas. Tente novamente em alguns minutos.",
})

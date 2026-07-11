import { NextFunction, Request, Response } from "express";

export const securityHeadersMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'")
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin")
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()")
  res.setHeader("Referrer-Policy", "no-referrer")
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  next()
}

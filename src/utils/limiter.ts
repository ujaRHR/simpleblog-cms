import rateLimit from "koa-ratelimit";

const cache = new Map();

export const rateLimiter = rateLimit({
  driver: "memory",
  db: cache,
  duration: 60 * 60 * 1000,
  max: 100,
  id: (ctx: any) => ctx.ip,
  errorMessage: "Too many requests. Please try again later."
});

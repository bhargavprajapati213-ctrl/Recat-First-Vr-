// Simple in-memory rate limiter: at most `max` requests per IP per `windowMs`.
// Fine for a single server; use a shared store (e.g. Redis) if you run several instances.
export function rateLimit({ max, windowMs, message }) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(ip);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      res.set('Retry-After', String(Math.ceil((windowMs - (now - recent[0])) / 1000)));
      return res.status(429).json({ ok: false, error: message });
    }
    recent.push(now);
    hits.set(req.ip, recent);
    next();
  };
}

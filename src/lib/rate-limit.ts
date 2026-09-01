/**
 * Rate limiter en mémoire, adapté à un déploiement mono-instance (VPS avec
 * un seul process Node). Pour un déploiement multi-instance, remplacer par
 * un backend partagé (Redis) — l'interface ci-dessous resterait identique.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

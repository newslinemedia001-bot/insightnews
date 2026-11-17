/**
 * Authorisation for the admin-only API routes.
 *
 * A shared secret must never be reachable from a client component: Next.js
 * inlines anything referenced by browser code into the public JavaScript
 * bundle, where Netlify's secret scanner (rightly) finds it.
 *
 * Machine callers - cron jobs, the Netlify scheduled function, an external
 * trigger - keep authenticating with `x-api-key` (or a Bearer token) taken
 * from `RSS_API_KEY`. The admin pages call the same routes from the site's own
 * origin and are accepted on that basis, so no key is ever sent to a browser.
 */

/** Timing-safe-ish comparison that does not leak the key length in logs. */
function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
        return false;
    }
    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

/** True when the request carries the shared server-side key. */
export function hasApiKey(request) {
    const validApiKey = process.env.RSS_API_KEY;
    if (!validApiKey) return false;

    const apiKey = request.headers.get('x-api-key');
    if (apiKey && safeEqual(apiKey, validApiKey)) return true;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return safeEqual(authHeader.slice('Bearer '.length).trim(), validApiKey);
    }

    return false;
}

/** True when a browser is calling the route on this site's own origin. */
export function isSameOriginRequest(request) {
    const origin = request.headers.get('origin');
    if (!origin) return false;

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (!host) return false;

    try {
        return new URL(origin).host === host.split(',')[0].trim();
    } catch {
        return false;
    }
}

/** Machine key holders and the site's own admin pages may use the routes. */
export function isAuthorizedAdminRequest(request) {
    return hasApiKey(request) || isSameOriginRequest(request);
}

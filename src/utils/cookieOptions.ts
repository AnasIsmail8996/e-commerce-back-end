import { CookieOptions } from "express";

const isProd = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN?.trim();

// Dev: proxy → same-origin dev URLs → SameSite=Lax works (no Secure needed)
// Prod: cross-origin → SameSite=None + Secure=true required
// Override via SAME_SITE env var if needed
const sameSite = (process.env.SAME_SITE as "lax" | "none" | "strict" | undefined)
    ?? (isProd ? "none" : "lax");

const secure = isProd;

const baseCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    // In dev without a domain, cookies are scoped to origin (scheme+host+port)
    // Setting domain to localhost makes them available across all localhost ports
    ...(!isProd ? { domain: "localhost" } : {}),
    ...(cookieDomain ? { domain: cookieDomain } : {}),
});

export const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...baseCookieOptions(),
    maxAge: 15 * 60 * 1000, // 15 minutes
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...baseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const getClearCookieOptions = (): CookieOptions => ({
    ...baseCookieOptions(),
    maxAge: 0,
});

import { CookieOptions } from "express";

const isProd =
  process.env.NODE_ENV === "production" || !!process.env.VERCEL;

// If COOKIE_DOMAIN is set in env (e.g. ".vercel.app"), the cookie is
// shared across every subdomain of that domain so the auth works
// between the api/client/admin vercel.app deployments.
const cookieDomain = process.env.COOKIE_DOMAIN
  ? process.env.COOKIE_DOMAIN
  : undefined;

const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  ...(cookieDomain ? { domain: cookieDomain } : {}),
});

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: 15 * 60 * 1000,
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const getClearCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: 0,
});

import { CookieOptions } from "express";

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
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
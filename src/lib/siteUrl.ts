import { DEFAULT_SITE_URL } from "../../site.config.mjs";

/**
 * Canonical public origin of the site (no trailing slash).
 * Set VITE_SITE_URL to change it; falls back to the documented production host.
 */
const raw = import.meta.env?.VITE_SITE_URL as string | undefined;

export const SITE_URL = (raw && raw.trim() !== "" && raw !== "undefined" ? raw : DEFAULT_SITE_URL).replace(
  /\/+$/,
  "",
);

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

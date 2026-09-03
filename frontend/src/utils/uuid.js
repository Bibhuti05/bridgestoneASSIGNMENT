/**
 * UUID utility module.
 *
 * Manages a persistent user UUID stored in a cookie and provides a helper to
 * register/identify the user with the backend on application startup.
 */

const COOKIE_NAME = "user_uuid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 365 days in seconds
const COOKIE_PATH = "/";

/**
 * Parse all document cookies and return them as a plain object keyed by cookie
 * name.
 *
 * @returns {Record<string, string>}
 */
function parseCookies() {
  const cookies = {};

  if (!document?.cookie) {
    return cookies;
  }

  document.cookie.split(";").forEach((entry) => {
    const [name, ...rest] = entry.split("=");
    const trimmedName = name.trim();
    if (trimmedName) {
      cookies[trimmedName] = decodeURIComponent(rest.join("="));
    }
  });

  return cookies;
}

/**
 * Retrieve the user UUID from the cookie jar.
 *
 * @returns {string | undefined}
 */
function getCookieUUID() {
  return parseCookies()[COOKIE_NAME];
}

/**
 * Set a cookie with the given name, value, max-age, and path.
 *
 * @param {string} name
 * @param {string} value
 * @param {number} maxAge - seconds until the cookie expires
 * @param {string} path
 */
function setCookie(name, value, maxAge, path) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=${path}`;
}

/**
 * Return the current user UUID. If no UUID cookie exists yet a new one is
 * generated with `crypto.randomUUID()` and persisted as a cookie before being
 * returned.
 *
 * @returns {string} The user UUID
 */
export function getUserId() {
  let uuid = getCookieUUID();

  if (!uuid) {
    uuid = crypto.randomUUID();
    setCookie(COOKIE_NAME, uuid, COOKIE_MAX_AGE, COOKIE_PATH);
  }

  return uuid;
}

/**
 * Ensure a user UUID exists and register/identify the user with the backend.
 *
 * 1. Reads the UUID from the cookie (generating one if absent).
 *
 */
const DEFAULT_API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api')
).replace(/\/+$/, '');

export async function initUser(baseUrl = DEFAULT_API_URL) {
  const uuid = getUserId();

  try {
    const response = await fetch(`${baseUrl}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ uuid }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `User registration failed (${response.status}): ${text || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[initUser] Failed to register user:", error);
    throw error;
  }
}

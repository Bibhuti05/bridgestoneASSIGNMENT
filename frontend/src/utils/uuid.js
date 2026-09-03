const STORAGE_KEY = "user_uuid";
const COOKIE_NAME = "user_uuid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 365 days
const COOKIE_PATH = "/";

function parseCookies() {
  const cookies = {};
  if (typeof document === "undefined" || !document.cookie) return cookies;

  document.cookie.split(";").forEach((entry) => {
    const [name, ...rest] = entry.split("=");
    const trimmedName = name.trim();
    if (trimmedName) {
      cookies[trimmedName] = decodeURIComponent(rest.join("="));
    }
  });
  return cookies;
}

function getCookieUUID() {
  return parseCookies()[COOKIE_NAME];
}

function setCookie(name, value, maxAge, path) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=${path}; SameSite=Lax`;
}

export function getUserId() {
  let uuid = null;

  // 1. Primary: read from localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      uuid = window.localStorage.getItem(STORAGE_KEY);
    } catch {}
  }

  // 2. Fallback: check cookie if not in localStorage
  if (!uuid) {
    uuid = getCookieUUID();
  }

  // 3. If still absent, generate new UUID
  if (!uuid) {
    uuid = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Persist to localStorage (primary) and cookie (secondary)
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, uuid);
    } catch {}
  }
  setCookie(COOKIE_NAME, uuid, COOKIE_MAX_AGE, COOKIE_PATH);

  return uuid;
}

const DEFAULT_API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001/api" : "/api")
).replace(/\/+$/, "");

export async function initUser(baseUrl = DEFAULT_API_URL) {
  const uuid = getUserId();

  try {
    const response = await fetch(`${baseUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-uuid": uuid,
      },
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

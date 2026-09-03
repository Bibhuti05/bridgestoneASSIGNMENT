export const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api')
).replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  let response;

  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error(`Network error while calling ${url}: ${networkError.message}`);
  }

  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.message || body?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function fetchVideos() {
  return request("/videos", { method: "GET" });
}

export async function likeVideo(videoId) {
  return request("/like", {
    method: "POST",
    body: JSON.stringify({ videoId }),
  });
}

export async function shareVideo(videoId, platform) {
  return request("/share", {
    method: "POST",
    body: JSON.stringify({ videoId, platform }),
  });
}

export async function registerUser(uuid) {
  return request("/user", {
    method: "POST",
    body: JSON.stringify({ uuid }),
  });
}

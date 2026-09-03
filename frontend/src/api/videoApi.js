/**
 * Video API service layer.
 *
 * All functions communicate with the backend at `BASE_URL` and include cookies
 * via `credentials: 'include'` so the server can identify the user.
 */

const BASE_URL = "http://localhost:3001/api";

/**
 * Internal helper that wraps `fetch` with consistent error handling and
 * cookie-based credentials.
 *
 * @param {string} endpoint - API path (e.g. "/videos")
 * @param {RequestInit} [options={}] - Extra fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
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
    // Response may not contain JSON (e.g. 204 No Content)
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.message || body?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

/**
 * Fetch the list of videos.
 *
 * @returns {Promise<object[]>} Array of video objects
 */
export async function fetchVideos() {
  return request("/videos", { method: "GET" });
}

/**
 * Like (or toggle like on) a video.
 *
 * @param {string} videoId - The ID of the video to like
 * @returns {Promise<{ likes: number, isLiked: boolean }>}
 */
export async function likeVideo(videoId) {
  return request("/like", {
    method: "POST",
    body: JSON.stringify({ videoId }),
  });
}

/**
 * Share a video on a specific platform.
 *
 * @param {string} videoId  - The ID of the video to share
 * @param {string} platform - Target platform (e.g. "twitter", "facebook")
 * @returns {Promise<{ shares: number, platform: string }>}
 */
export async function shareVideo(videoId, platform) {
  return request("/share", {
    method: "POST",
    body: JSON.stringify({ videoId, platform }),
  });
}

/**
 * Register or identify a user by UUID.
 *
 * @param {string} uuid - The user's UUID
 * @returns {Promise<{ message: string, user: object }>}
 */
export async function registerUser(uuid) {
  return request("/user", {
    method: "POST",
    body: JSON.stringify({ uuid }),
  });
}

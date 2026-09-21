/**
 * Auth identity is tab-scoped (sessionStorage)
 * Tabs share localStorage, so a single localStorage token forced one account
 * across the whole browser; sessionStorage keeps each tab independent.
 */

function clearLegacyLocalAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    // ignore
  }
}

/** Move a pre-existing shared localStorage session into this tab once. */
function migrateLegacyAuthIfNeeded() {
  try {
    if (sessionStorage.getItem("token") && sessionStorage.getItem("user")) {
      return;
    }
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) return;

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", rawUser);
    clearLegacyLocalAuth();
  } catch {
    // ignore
  }
}

export function getCurrentUser() {
  migrateLegacyAuthIfNeeded();
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  migrateLegacyAuthIfNeeded();
  return sessionStorage.getItem("token") || "";
}

export function setAuthSession({ token, user } = {}) {
  if (token) sessionStorage.setItem("token", token);
  else sessionStorage.removeItem("token");

  if (user) sessionStorage.setItem("user", JSON.stringify(user));
  else sessionStorage.removeItem("user");

  // Drop any previous shared-browser login so it cannot overwrite this tab.
  clearLegacyLocalAuth();
}

export function clearAuthSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  clearLegacyLocalAuth();
}

export function normalizeRole(role = "") {
  if (role === "PRINCIPAL") return "SUPER_ADMIN";
  return role;
}

export function getUserRole() {
  return normalizeRole(getCurrentUser()?.role || "");
}

export function getSchoolId() {
  const schoolId = getCurrentUser()?.schoolId;
  if (!schoolId) return "";
  if (typeof schoolId === "string") return schoolId.trim();
  if (typeof schoolId === "object") {
    const raw =
      schoolId._id ??
      schoolId.id ??
      (typeof schoolId.toHexString === "function"
        ? schoolId.toHexString()
        : null);
    if (raw != null && raw !== "") {
      return String(raw).trim();
    }
    const asString =
      typeof schoolId.toString === "function" ? schoolId.toString() : "";
    if (asString && asString !== "[object Object]") {
      return asString.trim();
    }
    return "";
  }
  return String(schoolId).trim();
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}

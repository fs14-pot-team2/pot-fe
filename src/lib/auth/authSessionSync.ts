export const AUTH_SESSION_CHANGE_KEY = "pot:auth-session-change";

export function getAuthSessionChange() {
  try {
    return localStorage.getItem(AUTH_SESSION_CHANGE_KEY);
  } catch {
    return null;
  }
}

export function publishAuthSessionChange() {
  try {
    const changeId = crypto.randomUUID();

    localStorage.setItem(AUTH_SESSION_CHANGE_KEY, changeId);

    return changeId;
  } catch {
    return null;
  }
}

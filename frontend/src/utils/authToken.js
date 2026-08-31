// Helpers for reading the stored user and knowing when its JWT has expired.
// The backend signs tokens with a 30-day expiry.

export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// Returns the stored user, or null if there is none / the token has expired.
// Clears the stale entry as a side effect so the app starts logged out.
export const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.token || isTokenExpired(user.token)) {
      localStorage.removeItem('userInfo');
      return null;
    }
    return user;
  } catch {
    localStorage.removeItem('userInfo');
    return null;
  }
};

export const clearStoredUser = () => {
  try {
    localStorage.removeItem('userInfo');
  } catch {
    /* ignore */
  }
};

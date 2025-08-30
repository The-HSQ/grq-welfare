import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'strict' as const,
  path: '/'
};

// Cookie keys
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData'
} as const;

// Token management
export const setAccessToken = (token: string) => {
  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, token, COOKIE_CONFIG);
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
};

export const setRefreshToken = (token: string) => {
  Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, token, COOKIE_CONFIG);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
};

// User data management
export const setUserData = (userData: any) => {
  Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(userData), COOKIE_CONFIG);
};

export const getUserData = (): any => {
  const userData = Cookies.get(COOKIE_KEYS.USER_DATA);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  }
  return null;
};

// Clear all auth cookies
export const clearAuthCookies = () => {
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: '/' });
  Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN, { path: '/' });
  Cookies.remove(COOKIE_KEYS.USER_DATA, { path: '/' });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

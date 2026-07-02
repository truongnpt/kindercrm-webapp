export const ACTIVE_SCHOOL_COOKIE = 'kinder_active_school_id';

export const activeSchoolCookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

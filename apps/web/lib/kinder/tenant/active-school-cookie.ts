import { cookies } from 'next/headers';

const ACTIVE_SCHOOL_COOKIE = 'kinder_active_school_id';

export async function getActiveSchoolIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_SCHOOL_COOKIE)?.value ?? null;
}

export async function setActiveSchoolIdCookie(schoolId: string) {
  const store = await cookies();
  store.set(ACTIVE_SCHOOL_COOKIE, schoolId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export { ACTIVE_SCHOOL_COOKIE };

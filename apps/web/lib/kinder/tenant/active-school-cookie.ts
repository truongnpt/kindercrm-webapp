import { cookies } from 'next/headers';

import {
  ACTIVE_SCHOOL_COOKIE,
  activeSchoolCookieOptions,
} from './active-school-cookie.constants';

export async function getActiveSchoolIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_SCHOOL_COOKIE)?.value ?? null;
}

export async function setActiveSchoolIdCookie(schoolId: string) {
  const store = await cookies();
  store.set(ACTIVE_SCHOOL_COOKIE, schoolId, activeSchoolCookieOptions);
}

export { ACTIVE_SCHOOL_COOKIE };

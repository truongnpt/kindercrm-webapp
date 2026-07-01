import 'server-only';

import { randomBytes } from 'node:crypto';

const CHARSET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';

export function generateSecurePassword(length = 12) {
  const bytes = randomBytes(length);
  let password = '';

  for (let index = 0; index < length; index += 1) {
    password += CHARSET[bytes[index]! % CHARSET.length];
  }

  return password;
}

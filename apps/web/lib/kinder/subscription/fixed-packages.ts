export const FIXED_PACKAGE_CODES = ['free', 'starter', 'pro'] as const;

export type FixedPackageCode = (typeof FIXED_PACKAGE_CODES)[number];

export const FIXED_PACKAGE_DESCRIPTIONS: Record<FixedPackageCode, string> = {
  free: 'Dùng thử và bắt đầu với trường mầm non quy mô nhỏ.',
  starter: 'Cho trường mầm non đang mở rộng quy mô và nhiều lớp.',
  pro: 'Hệ thống trường nhiều chi nhánh, quota cao.',
};

export function isFixedPackageCode(code: string): code is FixedPackageCode {
  return FIXED_PACKAGE_CODES.includes(code as FixedPackageCode);
}

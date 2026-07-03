import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  Shield,
  User,
} from 'lucide-react';

import pathsConfig from '~/config/paths.config';
import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

export const PLATFORM_NAV_ITEMS = [
  {
    href: pathsConfig.platform.home,
    labelKey: 'kinder:platform.nav.dashboard',
    icon: LayoutDashboard,
    end: true,
    roles: ['super_admin', 'support', 'billing'] as PlatformAdminRole[],
  },
  {
    href: pathsConfig.platform.schools,
    labelKey: 'kinder:platform.nav.schools',
    icon: Building2,
    end: false,
    roles: ['super_admin', 'support'] as PlatformAdminRole[],
  },
  {
    href: pathsConfig.platform.packages,
    labelKey: 'kinder:platform.nav.packages',
    icon: Package,
    end: false,
    roles: ['super_admin', 'billing'] as PlatformAdminRole[],
  },
  {
    href: pathsConfig.platform.admins,
    labelKey: 'kinder:platform.nav.admins',
    icon: Shield,
    end: false,
    roles: ['super_admin'] as PlatformAdminRole[],
  },
  {
    href: pathsConfig.platform.auditLogs,
    labelKey: 'kinder:platform.nav.audit',
    icon: ClipboardList,
    end: false,
    roles: ['super_admin', 'support', 'billing'] as PlatformAdminRole[],
  },
  {
    href: pathsConfig.platform.account,
    labelKey: 'kinder:platform.nav.account',
    icon: User,
    end: true,
    roles: ['super_admin', 'support', 'billing'] as PlatformAdminRole[],
  },
] as const;

export function getPlatformNavItems(role: PlatformAdminRole) {
  return PLATFORM_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

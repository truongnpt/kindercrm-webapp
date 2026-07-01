import type { z } from 'zod';

import type { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import {
  hasPackageFeature,
  type PackageFeature,
} from '~/lib/kinder/subscription/features';
import type { Package } from '~/lib/kinder/types';

const PATH_FEATURES: Array<{ path: string; feature: PackageFeature }> = [
  { path: pathsConfig.app.crm, feature: 'crm' },
  { path: pathsConfig.app.students, feature: 'students' },
  { path: pathsConfig.app.classes, feature: 'classes' },
  { path: pathsConfig.app.finance, feature: 'finance' },
  { path: pathsConfig.app.attendance, feature: 'attendance' },
  { path: pathsConfig.app.staff, feature: 'staff' },
  { path: pathsConfig.app.dailyReports, feature: 'daily_reports' },
  { path: pathsConfig.app.menu, feature: 'meal_menu' },
  { path: pathsConfig.app.inventory, feature: 'inventory' },
  { path: pathsConfig.app.health, feature: 'health_management' },
  { path: pathsConfig.app.ai, feature: 'ai_assistant' },
];

function isPathAllowed(path: string, pkg: Package | null | undefined) {
  const match = PATH_FEATURES.find((entry) => entry.path === path);

  if (!match) {
    return true;
  }

  return hasPackageFeature(pkg, match.feature);
}

export function getKinderNavigationConfig(pkg: Package | null | undefined) {
  const filteredRoutes = navigationConfig.routes.map((group) => {
    if (!('children' in group)) {
      return group;
    }

    return {
      ...group,
      children: group.children.filter((item) => isPathAllowed(item.path, pkg)),
    };
  });

  return {
    ...navigationConfig,
    routes: filteredRoutes,
  } satisfies z.infer<typeof NavigationConfigSchema>;
}

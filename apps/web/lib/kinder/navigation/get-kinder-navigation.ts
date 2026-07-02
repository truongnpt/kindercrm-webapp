import type { z } from 'zod';

import type { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import { navigationConfig } from '~/config/navigation.config';
import { hasPermission } from '~/lib/kinder/permissions/check-permission';
import { getModuleByPath } from '~/lib/kinder/permissions/module-registry';
import type { KinderPermission } from '~/lib/kinder/permissions/permission-keys';
import {
  hasPackageFeature,
} from '~/lib/kinder/subscription/package-features';
import type { Package, SchoolSubscription } from '~/lib/kinder/types';

function isPathAllowed(
  path: string,
  pkg: Package | null | undefined,
  subscription?: SchoolSubscription | null,
  permissions?: ReadonlySet<KinderPermission>,
) {
  const module = getModuleByPath(path);

  if (module) {
    if (!hasPackageFeature(pkg, module.packageFeature, subscription)) {
      return false;
    }

    if (permissions && !hasPermission(permissions, module.viewPermission)) {
      return false;
    }

    return true;
  }

  return true;
}

export function getKinderNavigationConfig(
  pkg: Package | null | undefined,
  subscription?: SchoolSubscription | null,
  permissions?: ReadonlySet<KinderPermission>,
) {
  const filteredRoutes = navigationConfig.routes
    .map((group) => {
      if (!('children' in group)) {
        return group;
      }

      return {
        ...group,
        children: group.children.filter((item) =>
          isPathAllowed(item.path, pkg, subscription, permissions),
        ),
      };
    })
    .filter((group) => {
      if ('divider' in group) {
        return true;
      }

      if ('children' in group) {
        return group.children.length > 0;
      }

      return true;
    });

  return {
    ...navigationConfig,
    routes: filteredRoutes,
  } satisfies z.infer<typeof NavigationConfigSchema>;
}

import {
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Package,
  School,
  Soup,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.dashboard',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
      },
      {
        label: 'common:routes.crm',
        path: pathsConfig.app.crm,
        Icon: <Users className={iconClasses} />,
      },
      {
        label: 'common:routes.students',
        path: pathsConfig.app.students,
        Icon: <GraduationCap className={iconClasses} />,
      },
      {
        label: 'common:routes.classes',
        path: pathsConfig.app.classes,
        Icon: <School className={iconClasses} />,
      },
      {
        label: 'common:routes.finance',
        path: pathsConfig.app.finance,
        Icon: <Wallet className={iconClasses} />,
      },
      {
        label: 'common:routes.attendance',
        path: pathsConfig.app.attendance,
        Icon: <CalendarCheck className={iconClasses} />,
      },
      {
        label: 'common:routes.staff',
        path: pathsConfig.app.staff,
        Icon: <UserCog className={iconClasses} />,
      },
      {
        label: 'common:routes.dailyReports',
        path: pathsConfig.app.dailyReports,
        Icon: <ClipboardList className={iconClasses} />,
      },
      {
        label: 'common:routes.menu',
        path: pathsConfig.app.menu,
        Icon: <Soup className={iconClasses} />,
      },
      {
        label: 'common:routes.inventory',
        path: pathsConfig.app.inventory,
        Icon: <Package className={iconClasses} />,
      },
      {
        label: 'common:routes.health',
        path: pathsConfig.app.health,
        Icon: <HeartPulse className={iconClasses} />,
      },
      {
        label: 'common:routes.ai',
        path: pathsConfig.app.ai,
        Icon: <Sparkles className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.school',
        path: pathsConfig.app.settingsSchool,
        Icon: <Building2 className={iconClasses} />,
      },
      {
        label: 'common:routes.campuses',
        path: pathsConfig.app.settingsCampuses,
        Icon: <Landmark className={iconClasses} />,
      },
      {
        label: 'common:routes.subscription',
        path: pathsConfig.app.settingsSubscription,
        Icon: <CreditCard className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});

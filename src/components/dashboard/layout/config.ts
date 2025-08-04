import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'users', title: 'User Management', href: paths.dashboard.users, icon: 'users', adminOnly: true },
  { key: 'taskTypes', title: 'Task Types', href: paths.dashboard.taskTypes, icon: 'list', adminOnly: true },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];

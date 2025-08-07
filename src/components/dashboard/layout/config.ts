import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'tasks', title: 'Tasks', href: paths.dashboard.tasks, icon: 'check-square', adminOnly: true },
  { key: 'myTasks', title: 'My Tasks', href: paths.dashboard.myTasks, icon: 'check-square' },
  { key: 'messages', title: 'Messages', href: paths.dashboard.messages, icon: 'chat-circle' },
  { key: 'timekeeping', title: 'Timekeeping', href: paths.dashboard.timekeeping, icon: 'clock' },
  { key: 'users', title: 'User Management', href: paths.dashboard.users, icon: 'users', adminOnly: true },
  { key: 'taskTypes', title: 'Task Types', href: paths.dashboard.taskTypes, icon: 'list', adminOnly: true },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];

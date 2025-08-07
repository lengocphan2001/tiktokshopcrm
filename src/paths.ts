export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    users: '/dashboard/users',
    taskTypes: '/dashboard/task-types',
    tasks: '/dashboard/tasks',
    myTasks: '/dashboard/my-tasks',
    messages: '/dashboard/messages',
    timekeeping: '/dashboard/timekeeping',
  },
} as const;

import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { UserManagement } from '@/components/dashboard/users/user-management';

export const metadata = { title: `User Management | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <UserManagement />;
} 
 
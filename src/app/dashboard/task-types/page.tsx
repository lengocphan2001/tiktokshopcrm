import * as React from 'react';
import { TaskTypeManagement } from '@/components/dashboard/task-types/task-type-management';
import { AdminGuard } from '@/components/auth/admin-guard';

export default function TaskTypesPage(): React.JSX.Element {
  return (
    <AdminGuard>
      <TaskTypeManagement />
    </AdminGuard>
  );
} 
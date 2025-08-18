'use client';

import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function UserManagement() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Management</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            User management features coming soon
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This section will include user verification, KYC management, and
            account controls
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

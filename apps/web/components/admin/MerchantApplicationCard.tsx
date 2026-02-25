'use client';

import { Calendar, Mail, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { MerchantApplication } from '@/lib/types/admin';

interface MerchantApplicationCardProps {
  application: MerchantApplication;
  onClick: (application: MerchantApplication) => void;
}

const statusVariants = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  revoked: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function MerchantApplicationCard({
  application,
  onClick,
}: MerchantApplicationCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(application)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {application.display_name}
              </h3>
              <p className="text-sm text-gray-600">@{application.slug}</p>
            </div>
            <Badge
              variant="outline"
              className={statusVariants[application.verification_status]}
            >
              {application.verification_status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{application.user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Applied {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
            {application.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{application.location}</span>
              </div>
            )}
          </div>

          {application.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {application.bio}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

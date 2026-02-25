'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MerchantApplicationCard } from './MerchantApplicationCard';
import { MerchantApplicationModal } from './MerchantApplicationModal';
import { MerchantApplicationFilters } from './MerchantApplicationFilters';
import { useMerchantApplications } from '@/hooks/use-admin';
import type { MerchantApplication } from '@/lib/types/admin';

export function MerchantApplications() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] =
    useState<MerchantApplication | null>(null);

  const { data: applications, isLoading, error } = useMerchantApplications(
    activeFilter === 'all' ? undefined : activeFilter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Failed to load merchant applications. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Merchant Applications</h2>
        <MerchantApplicationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {!applications || applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">
            No merchant applications found
            {activeFilter !== 'all' && ` with status "${activeFilter}"`}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <MerchantApplicationCard
              key={application.id}
              application={application}
              onClick={setSelectedApplication}
            />
          ))}
        </div>
      )}

      {selectedApplication && (
        <MerchantApplicationModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/hooks/use-admin';
import type { AuditLogEntry } from '@/lib/types/audit';

interface AuditLogViewerProps {
  className?: string;
}

export function AuditLogViewer({ className }: AuditLogViewerProps) {
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    limit: 50,
    offset: 0,
  });

  const { data, isLoading, error } = useAuditLogs(filters);

  const formatAction = (action: string) => {
    return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  if (error) {
    return (
      <div className={`p-4 text-red-600 ${className}`}>
        Error loading audit logs: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-4 items-center">
        <h2 className="text-xl font-semibold">Admin Audit Log</h2>
        
        <select
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
          className="px-3 py-1 border rounded"
        >
          <option value="">All Actions</option>
          <option value="merchant_approved">Merchant Approved</option>
          <option value="merchant_rejected">Merchant Rejected</option>
          <option value="merchant_revoked">Merchant Revoked</option>
          <option value="token_minted">Token Minted</option>
          <option value="token_burned">Token Burned</option>
        </select>

        <select
          value={filters.targetType}
          onChange={(e) => handleFilterChange('targetType', e.target.value)}
          className="px-3 py-1 border rounded"
        >
          <option value="">All Types</option>
          <option value="merchant">Merchant</option>
          <option value="token_operation">Token Operation</option>
          <option value="escrow">Escrow</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-4 text-center">Loading audit logs...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Admin</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Target</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {data?.logs?.map((log: AuditLogEntry) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {formatDate(log.performed_at)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {log.admin_user?.full_name || log.admin_user?.email || 'Unknown'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {log.target_type}
                      {log.target_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {log.target_id.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {!!log.metadata.reason && (
                        <div><strong>Reason:</strong> {String(log.metadata.reason)}</div>
                      )}
                      {!!log.metadata.amount && (
                        <div><strong>Amount:</strong> {String(log.metadata.amount)}</div>
                      )}
                      {!!log.metadata.token && (
                        <div><strong>Token:</strong> {String(log.metadata.token)}</div>
                      )}
                      {!!log.metadata.display_name && (
                        <div><strong>Merchant:</strong> {String(log.metadata.display_name)}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.total > filters.limit && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, data.total)} of {data.total} entries
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
                  disabled={filters.offset === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(filters.offset + filters.limit)}
                  disabled={filters.offset + filters.limit >= data.total}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
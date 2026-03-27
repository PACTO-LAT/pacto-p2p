# Admin Audit Logging

This document describes the comprehensive audit logging system implemented for admin actions in the Pacto P2P platform.

## Overview

The audit logging system tracks all administrative actions including merchant approvals/rejections/revocations, token minting/burning, and dispute resolutions. Each action is logged with complete context including who performed it, when, why, and from where.

## Database Schema

### `admin_audit_logs` Table

```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Supported Actions

- `merchant_approved` - Merchant application approved
- `merchant_rejected` - Merchant application rejected  
- `merchant_revoked` - Merchant status revoked
- `token_minted` - Tokens minted
- `token_burned` - Tokens burned
- `dispute_resolved` - Dispute resolved (future)

### Target Types

- `merchant` - Merchant-related actions
- `token_operation` - Token mint/burn operations
- `escrow` - Escrow/dispute actions
- `user` - User-related actions

## Implementation

### Core Services

#### `AuditService`
- `logAdminAction()` - Records audit entries
- `getAuditLogs()` - Retrieves audit logs with filtering
- `getAuditLogsCount()` - Gets total count for pagination

#### Updated `AdminService`
All admin operations now accept an `auditContext` parameter:
- `mintTokens()` - Logs token minting
- `burnTokens()` - Logs token burning  
- `approveMerchant()` - Logs merchant approval
- `rejectMerchant()` - Logs merchant rejection
- `revokeMerchant()` - Logs merchant revocation

### API Routes

#### `/api/admin/merchants/[id]` (PATCH)
Updated to capture and log merchant status changes with optional reason.

#### `/api/admin/tokens` (POST)
New route for token operations with full audit logging.

#### `/api/admin/audit-logs` (GET)
New route for retrieving audit logs with filtering and pagination.

### Frontend Integration

#### Updated Hooks
- `useApproveMerchant()` - Now accepts reason parameter
- `useRejectMerchant()` - Now accepts reason parameter  
- `useRevokeMerchant()` - Now accepts reason parameter
- `useMintTokens()` - Updated to use API route
- `useBurnTokens()` - Updated to use API route
- `useAuditLogs()` - New hook for audit log retrieval

#### Components
- `AuditLogViewer` - Admin dashboard component for viewing audit logs

## Security Features

### Row Level Security (RLS)
- Only admins can read audit logs
- No direct write access - inserts only via service role

### Request Context Capture
- IP address extraction from headers
- User agent logging
- Admin user identification

### Metadata Storage
Action-specific context stored in JSONB:
- Merchant actions: reason, merchant_slug, display_name
- Token operations: token, amount, recipient/address, memo, transaction_hash

## Usage Examples

### Logging a Merchant Approval
```typescript
await AdminService.approveMerchant(merchantId, {
  adminUserId: 'admin-uuid',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  reason: 'All documents verified'
});
```

### Retrieving Audit Logs
```typescript
const logs = await AuditService.getAuditLogs({
  action: 'merchant_approved',
  limit: 50,
  offset: 0
});
```

### Frontend Usage
```typescript
const approveMerchant = useApproveMerchant();
await approveMerchant.mutateAsync({
  id: merchantId,
  reason: 'Documents verified successfully'
});
```

## Migration

Run the migration to create the audit logs table:
```bash
supabase db push
```

The migration file is located at:
`supabase/migrations/20241227_create_admin_audit_logs.sql`

## Compliance Benefits

1. **Full Accountability** - Every admin action is tracked with user attribution
2. **Audit Trail** - Complete history of administrative decisions
3. **Compliance Ready** - Structured logging suitable for regulatory requirements
4. **Forensic Analysis** - IP addresses and user agents for security investigations
5. **Operational Insights** - Analytics on admin activity patterns

## Future Enhancements

- Dispute resolution logging (when feature is implemented)
- Automated alerts for suspicious admin activity
- Export functionality for compliance reporting
- Integration with external audit systems
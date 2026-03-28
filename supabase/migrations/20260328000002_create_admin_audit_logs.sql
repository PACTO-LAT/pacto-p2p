-- Create admin_audit_logs table for tracking all admin actions
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

-- Create index for efficient querying
CREATE INDEX idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_target_type ON admin_audit_logs(target_type);
CREATE INDEX idx_admin_audit_logs_performed_at ON admin_audit_logs(performed_at DESC);

-- Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON admin_audit_logs 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- No direct write policy - inserts only via service role
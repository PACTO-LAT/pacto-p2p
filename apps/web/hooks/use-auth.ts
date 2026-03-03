// Re-export from the shared AuthProvider context.
// All components that call useAuth() share the same user state,
// so updates (e.g. avatar upload) reflect immediately everywhere.
export { useAuth } from '@/providers/auth-provider';

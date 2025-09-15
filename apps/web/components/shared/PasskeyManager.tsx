'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitTransactionXDR } from '@/lib/passkey-actions';
import { usePasskeyWallet } from '@/hooks/use-passkey-wallet';

export function PasskeyManager() {
  const [xdr, setXdr] = useState('');
  const [fee, setFee] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { isConfigured, busy, connectPasskey } = usePasskeyWallet();

  const onSubmit = async () => {
    if (!xdr) return;
    setSubmitting(true);
    try {
      const feeNum = fee ? Number(fee) : undefined;
      const res = await submitTransactionXDR(xdr, feeNum);
      toast.success('Transaction submitted', { description: JSON.stringify(res).slice(0, 140) + '…' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Submission failed', { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const ensureConnected = async () => {
    try {
      await connectPasskey();
      toast.success('Passkey connected');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Passkey connect failed', { description: message });
    }
  };

  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="text-foreground">Passkey Manager</CardTitle>
        <CardDescription>Connect passkey wallet and submit Soroban XDR via Launchtube</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={ensureConnected} disabled={busy}>
            {busy ? 'Connecting…' : 'Connect Passkey Wallet'}
          </Button>
          {!isConfigured && (
            <div className="text-xs text-muted-foreground">Passkeys not configured</div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="passkey-xdr" className="text-sm text-muted-foreground">Transaction XDR</label>
          <Textarea id="passkey-xdr" value={xdr} onChange={(e) => setXdr(e.target.value)} rows={6} placeholder="Paste transaction XDR" />
        </div>

        <div className="space-y-2">
          <label htmlFor="passkey-fee" className="text-sm text-muted-foreground">Fee (stroops, optional)</label>
          <input
            id="passkey-fee"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full bg-transparent border rounded px-3 py-2 text-sm"
            inputMode="numeric"
            placeholder="e.g. 100" />
        </div>

        <Button onClick={onSubmit} disabled={!xdr || submitting}>
          {submitting ? 'Submitting…' : 'Submit via Launchtube'}
        </Button>
      </CardContent>
    </Card>
  );
}



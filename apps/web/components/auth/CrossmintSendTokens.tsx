'use client';

import { useCrossmintWallet } from '@/hooks/use-crossmint-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CrossmintSendTokens() {
  const { isWalletConnected, balance, sendTokens } = useCrossmintWallet();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    hash: string;
    explorerLink: string;
  } | null>(null);

  const allTokens = Object.keys(balance);
  
  console.log('CrossmintSendTokens - balance object:', balance);
  console.log('CrossmintSendTokens - allTokens:', allTokens);

  const handleSend = async () => {
    if (!toAddress || !amount || !selectedToken) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance[selectedToken])) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSending(true);
    
    // Show initial toast
    toast.info('Processing transaction... This may take a few moments.');

    try {
      console.log('Selected token:', selectedToken);
      
      // Use the token symbol directly with Crossmint's wallet.send() method
      const result = await sendTokens(toAddress, amount, selectedToken);
      
      // Store transaction info
      setLastTransaction(result);
      
      toast.success(`Transaction sent! Hash: ${result.hash}`, {
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(result.explorerLink, '_blank')
        }
      });
      
      // Reset form
      setToAddress('');
      setAmount('');
      setSelectedToken('');
      setMemo('');
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect your Crossmint wallet to send tokens.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to-address">Recipient Address</Label>
          <Input
            id="to-address"
            placeholder="Enter Stellar address (G...)"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            disabled={isSending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken} disabled={isSending}>
            <SelectTrigger>
              <SelectValue placeholder="Select token to send" />
            </SelectTrigger>
            <SelectContent>
              {allTokens.length > 0 ? (
                allTokens.map((token) => {
                  const tokenBalance = parseFloat(balance[token]);
                  const hasBalance = tokenBalance > 0;
                  
                  return (
                    <SelectItem key={token} value={token} disabled={!hasBalance}>
                      {token} {!hasBalance && '(No balance)'}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="no-tokens" disabled>
                  No tokens found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSending}
          />
          {selectedToken && (
            <p className="text-xs text-muted-foreground">
              Available: {balance[selectedToken]} {selectedToken}
              {parseFloat(balance[selectedToken]) === 0 && (
                <span className="text-destructive ml-1">(No balance available)</span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="memo">Memo (Optional)</Label>
          <Input
            id="memo"
            placeholder="Enter memo for this transaction"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isSending}
          />
          <p className="text-xs text-muted-foreground">
            Optional memo to include with the transaction
          </p>
        </div>

        <Button 
          onClick={handleSend} 
          disabled={isSending || !toAddress || !amount || !selectedToken}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Tokens
            </>
          )}
        </Button>
        
        {isSending && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              This may take a few moments. Please check your email for confirmation if required.
            </p>
          </div>
        )}

        {lastTransaction && (
          <div className="mt-4 p-4 bg-muted/50 border border-border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Last Transaction</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Hash:</span>
                <code className="ml-2 text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">
                  {lastTransaction.hash}
                </code>
              </div>
              <div>
                <a
                  href={lastTransaction.explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  View on Explorer →
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
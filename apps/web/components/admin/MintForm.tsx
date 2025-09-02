'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MintFormData } from '@/lib/types/admin';

interface MintFormProps {
  formData: MintFormData;
  onFormChange: (data: MintFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function MintForm({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
}: MintFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Mint Tokens
        </CardTitle>
        <CardDescription>
          Issue new stablecoin tokens to a recipient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mint-token">Token</Label>
            <Select
              value={formData.token}
              onValueChange={(value) =>
                onFormChange({ ...formData, token: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select token to mint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRCX">
                  CRCX - Costa Rican Colón Token
                </SelectItem>
                <SelectItem value="MXNX">MXNX - Mexican Peso Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mint-amount">Amount</Label>
            <Input
              id="mint-amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                onFormChange({ ...formData, amount: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mint-recipient">Recipient Address</Label>
            <Input
              id="mint-recipient"
              placeholder="GDXXX...XXXX"
              value={formData.recipient}
              onChange={(e) =>
                onFormChange({ ...formData, recipient: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mint-memo">Memo (Optional)</Label>
            <Textarea
              id="mint-memo"
              placeholder="Reason for minting..."
              value={formData.memo}
              onChange={(e) =>
                onFormChange({ ...formData, memo: e.target.value })
              }
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Minting...' : 'Mint Tokens'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

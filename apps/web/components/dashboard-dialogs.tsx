import { FileText } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DashboardEscrow } from '@/lib/types';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrow: DashboardEscrow | null;
  onUpload: (escrow: DashboardEscrow, file: File) => void;
}

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrow: DashboardEscrow | null;
  onCreate: (escrow: DashboardEscrow, reason: string) => void;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  escrow,
  onUpload,
}: ReceiptDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (escrow && selectedFile) {
      onUpload(escrow, selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-gradient">
            Upload Payment Receipt
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sube la prueba de tu pago fiat para continuar el proceso de escrow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receipt">Archivo de Recibo</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="input-glass"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
              <FileText className="w-4 h-4" />
              <span className="text-sm">{selectedFile.name}</span>
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="w-full btn-emerald"
          >
            Subir Recibo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DisputeDialog({
  open,
  onOpenChange,
  escrow,
  onCreate,
}: DisputeDialogProps) {
  const [disputeReason, setDisputeReason] = useState('');

  const handleCreate = () => {
    if (escrow && disputeReason.trim()) {
      onCreate(escrow, disputeReason);
      setDisputeReason('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setDisputeReason('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-gradient">
            Crear Disputa
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Si hay un problema con este trade, puedes crear una disputa para
            resolución
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la Disputa</Label>
            <Textarea
              id="reason"
              placeholder="Describe el problema con este trade..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
              className="input-glass"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!disputeReason.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white border border-red-600 rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
          >
            Crear Disputa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

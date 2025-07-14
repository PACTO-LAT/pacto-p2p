import { useEscrowContext } from '@/lib/contexts/escrow-context';
import type { Escrow } from '@/lib/types';

export function useEscrowSelection() {
  const { selectedEscrow, setSelectedEscrow, clearSelectedEscrow } =
    useEscrowContext();

  const selectEscrow = (escrow: Escrow) => {
    setSelectedEscrow(escrow);
  };

  const isEscrowSelected = (escrowId: string) => {
    return selectedEscrow?.engagementId === escrowId;
  };

  const hasSelectedEscrow = () => {
    return selectedEscrow !== null;
  };

  return {
    selectedEscrow,
    selectEscrow,
    clearSelectedEscrow,
    isEscrowSelected,
    hasSelectedEscrow,
  };
}

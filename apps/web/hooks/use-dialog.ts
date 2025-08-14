import { useCallback, useState } from 'react';

interface DialogState<T = unknown> {
  isOpen: boolean;
  selectedItem: T | null;
}

interface UseDialogReturn<T> {
  dialogState: DialogState<T>;
  openDialog: (item?: T) => void;
  closeDialog: () => void;
  setSelectedItem: (item: T | null) => void;
}

export function useDialog<T = unknown>(): UseDialogReturn<T> {
  const [dialogState, setDialogState] = useState<DialogState<T>>({
    isOpen: false,
    selectedItem: null,
  });

  const openDialog = useCallback((item?: T) => {
    setDialogState({
      isOpen: true,
      selectedItem: item || null,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({
      isOpen: false,
      selectedItem: null,
    });
  }, []);

  const setSelectedItem = useCallback((item: T | null) => {
    setDialogState((prev) => ({
      ...prev,
      selectedItem: item,
    }));
  }, []);

  return {
    dialogState,
    openDialog,
    closeDialog,
    setSelectedItem,
  };
}

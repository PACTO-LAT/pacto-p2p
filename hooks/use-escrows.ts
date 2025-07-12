"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { EscrowsService } from "@/lib/services/escrows"
import type { CreateEscrowData } from "@/lib/types"

export function useUserEscrows(userId?: string) {
  return useQuery({
    queryKey: ["user-escrows", userId],
    queryFn: () => (userId ? EscrowsService.getUserEscrows(userId) : Promise.resolve([])),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  })
}

export function useCreateEscrow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (escrowData: CreateEscrowData) => EscrowsService.createEscrow(escrowData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-escrows"] })
    },
  })
}

export function useUpdateEscrowStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ escrowId, status }: { escrowId: string; status: any }) =>
      EscrowsService.updateEscrowStatus(escrowId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-escrows"] })
    },
  })
}

export function useUploadReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ escrowId, file }: { escrowId: string; file: File }) =>
      EscrowsService.uploadPaymentReceipt(escrowId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-escrows"] })
    },
  })
}

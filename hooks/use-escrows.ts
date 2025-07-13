"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEscrowData, Escrow } from "@/lib/types";
import { useInitializeTrade } from "./use-trades";
import { useRouter } from "next/navigation";
import {
  GetEscrowsFromIndexerByRoleParams,
  GetEscrowsFromIndexerBySignerParams,
  useFundEscrow,
  useGetEscrowsFromIndexerByRole,
  useGetEscrowsFromIndexerBySigner,
} from "@trustless-work/escrow";
import { toast } from "sonner";
import useGlobalAuthenticationStore from "@/store/wallet.store";
interface UseEscrowsByRoleQueryParams
  extends GetEscrowsFromIndexerByRoleParams {
  enabled?: boolean;
}

interface UseEscrowsBySignerQueryParams
  extends GetEscrowsFromIndexerBySignerParams {
  enabled?: boolean;
}

export const useEscrowsByRoleQuery = ({
  role,
  roleAddress,
  isActive = true,
  page,
  orderDirection,
  orderBy,
  startDate,
  endDate,
  maxAmount,
  minAmount,
  title,
  engagementId,
  status,
  type,
  enabled = true,
}: UseEscrowsByRoleQueryParams) => {
  const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole();

  return useQuery({
    queryKey: [
      "escrows",
      roleAddress,
      role,
      isActive,
      page,
      orderDirection,
      orderBy,
      startDate,
      endDate,
      maxAmount,
      minAmount,
      title,
      engagementId,
      status,
      type,
    ],
    queryFn: async (): Promise<Escrow[]> => {
      const escrows = await getEscrowsByRole({
        role,
        roleAddress,
        isActive,
        page,
        orderDirection,
        orderBy,
        startDate,
        endDate,
        maxAmount,
        minAmount,
        title,
        engagementId,
        status,
        type,
        validateOnChain: true,
      });

      if (!escrows) {
        throw new Error("Failed to fetch escrows");
      }

      return escrows;
    },
    enabled: enabled && !!roleAddress && !!role,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEscrowsBySignerQuery = ({
  signer,
  isActive = true,
  page,
  orderDirection,
  orderBy,
  startDate,
  endDate,
  maxAmount,
  minAmount,
  title,
  engagementId,
  status,
  type,
  enabled = true,
}: UseEscrowsBySignerQueryParams) => {
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();

  return useQuery({
    queryKey: [
      "escrows",
      signer,
      isActive,
      page,
      orderDirection,
      orderBy,
      startDate,
      endDate,
      maxAmount,
      minAmount,
      title,
      engagementId,
      status,
      type,
    ],
    queryFn: async () => {
      const escrows = await getEscrowsBySigner({
        signer,
        isActive,
        page,
        orderDirection,
        orderBy,
        startDate,
        endDate,
        maxAmount,
        minAmount,
        title,
        engagementId,
        status,
        type,
        validateOnChain: true,
      });

      if (!escrows) {
        throw new Error("Failed to fetch escrows");
      }

      return escrows;
    },
    enabled: enabled && !!signer,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

export function useCreateEscrow(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { initializeTrade } = useInitializeTrade();

  return useMutation({
    mutationFn: async (escrowData: CreateEscrowData) => {
      const escrow = await initializeTrade(escrowData);

      return Promise.all([escrow]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      router.push("/dashboard/escrows");
      toast.success("Escrow created successfully");
      // Call the optional callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useReportPayment() {
  const queryClient = useQueryClient();
  const { reportPayment } = useInitializeTrade();

  return useMutation({
    mutationFn: ({ escrow, evidence }: { escrow: Escrow; evidence: string }) =>
      reportPayment(escrow, evidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Payment reported successfully");
    },
  });
}

export function useDepositFunds() {
  const { fundEscrow } = useFundEscrow();
  const { address } = useGlobalAuthenticationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrow }: { escrow: Escrow }) =>
      fundEscrow(
        {
          contractId: escrow.contractId || "",
          amount: escrow.amount,
          signer: address,
        },
        "single-release"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Funds deposited successfully");
    },
  });
}

export function useDisputeEscrow() {
  const { disputeEscrow } = useInitializeTrade();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrow }: { escrow: Escrow }) => disputeEscrow(escrow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
      toast.success("Escrow disputed successfully");
    },
  });
}

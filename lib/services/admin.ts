import { createServerClient } from "@/lib/supabase"
import { StellarService } from "./stellar"
import type { TokenOperation } from "@/lib/types"

export class AdminService {
  static async mintTokens(
    token: string,
    amount: number,
    recipient: string,
    memo?: string,
    createdBy?: string,
  ): Promise<TokenOperation> {
    const supabase = createServerClient()

    // Create operation record
    const { data: operation, error: insertError } = await supabase
      .from("token_operations")
      .insert({
        operation_type: "mint",
        token,
        amount,
        stellar_address: recipient,
        memo,
        created_by: createdBy,
        status: "pending",
      })
      .select()
      .single()

    if (insertError) throw insertError

    try {
      // Execute minting on Stellar
      const txHash = await StellarService.mintToken(
        "ISSUER_ADDRESS", // Replace with actual issuer
        amount,
        token,
        recipient,
      )

      // Update operation with success
      const { data: updatedOperation, error: updateError } = await supabase
        .from("token_operations")
        .update({
          transaction_hash: txHash,
          status: "completed",
        })
        .eq("id", operation.id)
        .select()
        .single()

      if (updateError) throw updateError
      return updatedOperation
    } catch (error) {
      // Update operation with failure
      await supabase
        .from("token_operations")
        .update({
          status: "failed",
        })
        .eq("id", operation.id)

      throw error
    }
  }

  static async burnTokens(
    token: string,
    amount: number,
    address: string,
    memo?: string,
    createdBy?: string,
  ): Promise<TokenOperation> {
    const supabase = createServerClient()

    // Create operation record
    const { data: operation, error: insertError } = await supabase
      .from("token_operations")
      .insert({
        operation_type: "burn",
        token,
        amount,
        stellar_address: address,
        memo,
        created_by: createdBy,
        status: "pending",
      })
      .select()
      .single()

    if (insertError) throw insertError

    try {
      // Execute burning on Stellar
      const txHash = await StellarService.burnToken(address, amount, token)

      // Update operation with success
      const { data: updatedOperation, error: updateError } = await supabase
        .from("token_operations")
        .update({
          transaction_hash: txHash,
          status: "completed",
        })
        .eq("id", operation.id)
        .select()
        .single()

      if (updateError) throw updateError
      return updatedOperation
    } catch (error) {
      // Update operation with failure
      await supabase
        .from("token_operations")
        .update({
          status: "failed",
        })
        .eq("id", operation.id)

      throw error
    }
  }

  static async getTokenOperations(): Promise<TokenOperation[]> {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("token_operations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getPlatformStats() {
    const supabase = createServerClient()

    const [usersResult, listingsResult, escrowsResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("listings").select("id", { count: "exact" }).eq("status", "active"),
      supabase.from("escrows").select("fiat_amount").eq("status", "completed"),
    ])

    const totalVolume = escrowsResult.data?.reduce((sum, escrow) => sum + escrow.fiat_amount, 0) || 0

    return {
      totalUsers: usersResult.count || 0,
      activeListings: listingsResult.count || 0,
      totalVolume,
      completedTrades: escrowsResult.data?.length || 0,
    }
  }
}

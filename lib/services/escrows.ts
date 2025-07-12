import { supabase } from "@/lib/supabase"
import type { Escrow, CreateEscrowData } from "@/lib/types"

export class EscrowsService {
  static async getUserEscrows(userId: string): Promise<Escrow[]> {
    const { data, error } = await supabase
      .from("escrows")
      .select(`
        *,
        buyer:buyer_id(id, email, stellar_address, reputation_score),
        seller:seller_id(id, email, stellar_address, reputation_score),
        listing:listings(*),
        milestones:escrow_milestones(*)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createEscrow(escrowData: CreateEscrowData): Promise<Escrow> {
    // Generate escrow ID
    const escrowId = `ESC${Date.now().toString().slice(-6)}`

    const { data, error } = await supabase
      .from("escrows")
      .insert({
        id: escrowId,
        ...escrowData,
      })
      .select(`
        *,
        buyer:buyer_id(id, email, stellar_address, reputation_score),
        seller:seller_id(id, email, stellar_address, reputation_score),
        listing:listings(*)
      `)
      .single()

    if (error) throw error

    // Create initial milestones
    await this.createEscrowMilestones(escrowId)

    return data
  }

  static async updateEscrowStatus(escrowId: string, status: Escrow["status"]): Promise<Escrow> {
    const { data, error } = await supabase
      .from("escrows")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", escrowId)
      .select(`
        *,
        buyer:buyer_id(id, email, stellar_address, reputation_score),
        seller:seller_id(id, email, stellar_address, reputation_score),
        listing:listings(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async uploadPaymentReceipt(escrowId: string, file: File): Promise<string> {
    const fileName = `receipts/${escrowId}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage.from("escrow-receipts").upload(fileName, file)

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("escrow-receipts").getPublicUrl(fileName)

    // Update escrow with receipt URL
    await supabase
      .from("escrows")
      .update({
        payment_receipt_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", escrowId)

    return publicUrl
  }

  static async updateMilestone(
    escrowId: string,
    milestoneNumber: number,
    status: "completed" | "failed",
  ): Promise<void> {
    const { error } = await supabase
      .from("escrow_milestones")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("escrow_id", escrowId)
      .eq("milestone_number", milestoneNumber)

    if (error) throw error
  }

  private static async createEscrowMilestones(escrowId: string): Promise<void> {
    const milestones = [
      { milestone_number: 1, name: "Escrow Created" },
      { milestone_number: 2, name: "Fiat Payment Sent" },
      { milestone_number: 3, name: "Payment Confirmed" },
      { milestone_number: 4, name: "Tokens Released" },
    ]

    const { error } = await supabase.from("escrow_milestones").insert(
      milestones.map((milestone) => ({
        escrow_id: escrowId,
        ...milestone,
      })),
    )

    if (error) throw error

    // Mark first milestone as completed
    await this.updateMilestone(escrowId, 1, "completed")
  }
}

export interface TrustlessWorkContract {
  id: string;
  milestone_marker: string;
  release_signer: string;
  receiver: string;
  approver: string;
  service_provider: string;
  dispute_resolver: string;
  platform: string;
  amount: number;
  token: string;
  status: 'created' | 'milestone_marked' | 'approved' | 'released' | 'disputed';
}

export class TrustlessWorkService {
  static async createEscrowContract(
    buyer: string,
    seller: string,
    amount: number,
    token: string
  ): Promise<TrustlessWorkContract> {
    // Mock contract creation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      id: `tw_${Date.now()}`,
      milestone_marker: buyer,
      release_signer: buyer,
      receiver: buyer,
      approver: seller,
      service_provider: seller,
      dispute_resolver: 'PLATFORM_RESOLVER',
      platform: 'STELLAR_OTC_PLATFORM',
      amount,
      token,
      status: 'created',
    };
  }

  static async markMilestone(contractId: string): Promise<void> {
    // Mock milestone marking
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Milestone marked for contract: ${contractId}`);
  }

  static async approveRelease(contractId: string): Promise<void> {
    // Mock release approval
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Release approved for contract: ${contractId}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async releaseTokens(_contractId: string): Promise<string> {
    // Mock token release
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return `release_${Date.now()}`;
  }

  static async createDispute(
    contractId: string,
    reason: string
  ): Promise<void> {
    // Mock dispute creation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(
      `Dispute created for contract: ${contractId}, reason: ${reason}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getContractStatus(
    _contractId: string
  ): Promise<TrustlessWorkContract['status']> {
    // Mock status retrieval
    await new Promise((resolve) => setTimeout(resolve, 500));
    return 'created';
  }
}

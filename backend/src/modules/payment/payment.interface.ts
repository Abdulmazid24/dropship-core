/**
 * Payment Provider Interface
 * All payment providers must implement this interface
 * This enables easy addition of new payment providers without changing existing code
 */
export interface IPaymentProvider {
    /**
     * Initialize payment session
     * @param amount - Amount in smallest currency unit (e.g., cents)
     * @param currency - Currency code (USD, BDT, etc.)
     * @param metadata - Additional data (orderId, userId, etc.)
     * @returns Payment session data including client secret or redirect URL
     */
    createPaymentIntent(
        amount: number,
        currency: string,
        metadata: Record<string, any>
    ): Promise<{
        paymentId: string;
        clientSecret?: string;
        redirectUrl?: string;
        providerPaymentId: string;
    }>;

    /**
     * Verify payment status
     * @param paymentId - Payment ID from our system
     * @param providerPaymentId - Payment ID from payment provider
     * @returns Payment verification result
     */
    verifyPayment(
        paymentId: string,
        providerPaymentId: string
    ): Promise<{
        success: boolean;
        status: 'PENDING' | 'COMPLETED' | 'FAILED';
        transactionId: string;
        providerResponse: any;
    }>;

    /**
     * Process refund
     * @param paymentId - Payment ID from our system
     * @param amount - Refund amount (optional, defaults to full amount)
     * @returns Refund result
     */
    refundPayment(
        paymentId: string,
        amount?: number
    ): Promise<{
        success: boolean;
        refundId: string;
        amount: number;
    }>;

    /**
     * Verify webhook signature
     * @param payload - Webhook payload
     * @param signature - Webhook signature
     * @returns Is signature valid
     */
    verifyWebhookSignature(payload: any, signature: string): boolean;

    /**
     * Handle webhook event
     * @param event - Webhook event data
     * @returns Processed event data
     */
    handleWebhook(event: any): Promise<{
        type: string;
        paymentId: string;
        status: string;
        data: any;
    }>;
}

/**
 * Payment Provider Factory
 * Factory pattern to get the appropriate payment provider
 */
export class PaymentProviderFactory {
    private static providers: Map<string, IPaymentProvider> = new Map();

    /**
     * Register a payment provider
     */
    static registerProvider(name: string, provider: IPaymentProvider): void {
        this.providers.set(name.toUpperCase(), provider);
    }

    /**
     * Get payment provider by name
     */
    static getProvider(name: string): IPaymentProvider {
        const provider = this.providers.get(name.toUpperCase());
        if (!provider) {
            throw new Error(`Payment provider ${name} not found`);
        }
        return provider;
    }

    /**
     * Get all registered providers
     */
    static getAllProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}

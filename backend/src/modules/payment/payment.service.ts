import { PaymentProviderFactory } from './payment.interface';
import { StripeProvider } from './providers/stripe.provider';
import { SSLCommerzProvider } from './providers/sslcommerz.provider';

/**
 * Initialize and register all payment providers
 * This setup makes it easy to add new payment providers
 * Just create a new provider class and register it here
 */
export function initializePaymentProviders(): void {
    // Register Stripe
    PaymentProviderFactory.registerProvider('STRIPE', new StripeProvider());

    // Register SSLCommerz
    PaymentProviderFactory.registerProvider('SSLCOMMERZ', new SSLCommerzProvider());

    console.log('✅ Payment providers initialized:', PaymentProviderFactory.getAllProviders());
}

/**
 * Get payment provider based on currency or user preference
 * This is a smart routing function that can be customized
 */
export function getRecommendedProvider(currency: string): string {
    // Bangladesh currency -> SSLCommerz
    if (currency.toUpperCase() === 'BDT') {
        return 'SSLCOMMERZ';
    }

    // Default to Stripe for international
    return 'STRIPE';
}

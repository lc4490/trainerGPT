import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { email, paymentMethodId } = await req.json();  // Extract email and payment method ID from the request

        // Create or retrieve the customer from Stripe
        const customer = await stripe.customers.create({
            email,
            payment_method: paymentMethodId,  // Set the default payment method
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create a subscription for the customer using a price ID
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: process.env.STRIPE_PRICE_ID,  // Your subscription price ID from Stripe dashboard
                },
            ],
            payment_behavior: 'default_incomplete',  // Starts subscription in incomplete status until payment is confirmed
            expand: ['latest_invoice.payment_intent'],  // Expands to get payment intent details
        });

        // Return the client_secret to confirm payment on the frontend
        const paymentIntent = subscription.latest_invoice.payment_intent;

        return NextResponse.json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating Stripe subscription:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { email } = await req.json();  // Extract email from the request

        // Check if a customer with this email already exists
        let customer = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        if (customer.data.length === 0) {
            // Create a new customer if one doesn't exist
            customer = await stripe.customers.create({
                email,
            });
        } else {
            customer = customer.data[0];
        }

        // Create a subscription for the customer using the price ID from Stripe
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: process.env.STRIPE_PRICE_ID,  // Your subscription price ID from the Stripe dashboard
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

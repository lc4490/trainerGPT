import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { amount } = await req.json();  // Extract amount from request body

        // Create a PaymentIntent with automatic payment methods enabled
        const paymentIntent = await stripe.paymentIntents.create({
            amount,  // amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,  // Enable automatic payment methods (Apple Pay, Google Pay, etc.)
            },
        });

        // Return the client_secret to the frontend
        return NextResponse.json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating Stripe payment intent:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

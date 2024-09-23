import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { subscriptionId, cancelAtPeriodEnd = false } = await req.json();  // Extract subscription ID and option for when to cancel

        // Cancel the subscription
        const cancellation = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: cancelAtPeriodEnd,  // Set to true to cancel at the end of the billing period, or false to cancel immediately
        });

        return NextResponse.json({ success: true, cancellation });
    } catch (error) {
        console.error('Error cancelling subscription:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

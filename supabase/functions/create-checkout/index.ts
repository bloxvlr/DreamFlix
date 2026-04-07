import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { plan, user_id, email } = await req.json()

    // Mapping des plans vers tes Price IDs Stripe
    const prices = {
      'GOLD': 'price_1TJHcH1DXMfXUZ6e526cQ60M', 
      'DIAMANT': 'price_1TJe721DXMfXUZ6eygr7DMSP', 
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        { price: prices[plan], quantity: 1 },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success.html?plan=${plan}`,
      cancel_url: `${req.headers.get('origin')}/subscriptions.html`,
      metadata: {
        user_id: user_id,
        plan: plan
      }
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

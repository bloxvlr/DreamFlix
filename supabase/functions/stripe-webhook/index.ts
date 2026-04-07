import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '' 
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature || '',
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata.user_id
      const plan = session.metadata.plan

      // Mise à jour du profil dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_type: plan, 
          stripe_customer_id: session.customer 
        })
        .eq('id', userId)

      if (error) throw error
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

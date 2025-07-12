import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

// Supabase server client para acceder a la tabla de perfiles
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  const { user_id, email } = body

  // Busca si el usuario ya tiene stripe_customer_id
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user_id)
    .single()

  let customerId = profile?.stripe_customer_id

  // Si no tiene, crea cliente en Stripe
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_id: user_id },
    })

    customerId = customer.id

    // Guarda en Supabase
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user_id)
  }

  // Crea el SetupIntent
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
  })

  return NextResponse.json({ clientSecret: setupIntent.client_secret })
}


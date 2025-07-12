import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  const { user_id } = body

  // Busca el stripe_customer_id en la tabla profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user_id)
    .single()

  if (error || !profile?.stripe_customer_id) {
    return NextResponse.json({ hasPaymentMethod: false }, { status: 200 })
  }

  // Consulta Stripe para obtener métodos de pago guardados
  const paymentMethods = await stripe.paymentMethods.list({
    customer: profile.stripe_customer_id,
    type: 'card',
  })

  const hasPaymentMethod = paymentMethods.data.length > 0

  return NextResponse.json({ hasPaymentMethod })
}

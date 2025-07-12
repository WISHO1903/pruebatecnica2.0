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

  if (!user_id) {
    return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })
  }

  // 1. Buscar stripe_customer_id en Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user_id)
    .single()

  if (error || !profile?.stripe_customer_id) {
    return NextResponse.json({
      hasPaymentMethod: false,
      cards: [],
      message: 'No se encontró el cliente en Supabase.',
    })
  }

  const customerId = profile.stripe_customer_id

  try {
    // 2. Obtener métodos de pago de tipo tarjeta
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    const cards = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
    }))

    return NextResponse.json({
      hasPaymentMethod: cards.length > 0,
      cards,
    })
  } catch (err: any) {
    console.error('[Stripe Error]', err.message)
    return NextResponse.json({ error: 'Error al consultar Stripe' }, { status: 500 })
  }
}
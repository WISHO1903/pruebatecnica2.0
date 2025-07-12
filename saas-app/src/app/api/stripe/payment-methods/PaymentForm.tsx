'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ user }: { user: any }) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    console.log('[🔄] Iniciando submit')

    try {
      // Paso 1: obtener SetupIntent
      const res = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
        }),
      })

      if (!res.ok) {
        throw new Error(` Error al obtener SetupIntent (${res.status})`)
      }

      const { clientSecret } = await res.json()
      console.log('SetupIntent recibido:', clientSecret)

      // Paso 2: Confirmar con Stripe
      const result = await stripe?.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements?.getElement(CardElement)!,
        },
      })

      console.log(' Resultado Stripe:', result)

      if (result?.error) {
        console.error('Error en confirmCardSetup:', result.error.message)
        setMessage(result.error.message || 'Error al guardar método de pago')
        setLoading(false)
        return
      }

      // Paso 3: Notificar a N8N
      await fetch('https://elwichopato.app.n8n.cloud/webhook-test/742cfae3-1619-454c-8e55-5585dc820734', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          mensaje: 'El usuario ha guardado un método de pago exitosamente',
        }),
      })

      setMessage('Método de pago guardado')
    } catch (err: any) {
      console.error('Error inesperado:', err.message || err)
      setMessage('Error inesperado: ' + (err.message || ''))
    } finally {
      setLoading(false)
      console.log(' Finalizó proceso')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-4 border rounded bg-white shadow"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Guardar Método de Pago</h2>

      {/*Datos básicos del usuario */}
      <div className="mb-4 text-sm text-gray-700">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* Para debug opcional: mostrar todo el objeto */}
      {/* <pre className="bg-gray-100 text-xs p-2 rounded overflow-x-auto mb-4">
        {JSON.stringify(user, null, 2)}
      </pre> */}

      <CardElement className="p-2 border rounded mb-4" />
      <button
        type="submit"
        disabled={loading || !stripe}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
      >
        {loading ? 'Guardando...' : 'Guardar tarjeta'}
      </button>
      {message && (
        <p className="mt-4 text-center text-gray-700">{message}</p>
      )}
    </form>
  )
}

export default function PaymentForm({ user }: { user: any }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm user={user} />
    </Elements>
  )
}

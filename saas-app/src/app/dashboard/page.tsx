'use client'

import useUser from '../hooks/useUsers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import PaymentForm from '../api/stripe/payment-methods/PaymentForm'

export default function DashboardPage() {
  const { session } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean | null>(null)
  const [view, setView] = useState<'welcome' | 'account' | 'add-payment'>('welcome')
  const [cards, setCards] = useState<any[]>([])

  // Verificar sesión
  useEffect(() => {
    if (session === undefined) return
    if (!session) {
      router.push('/auth')
      return
    }
    setLoading(false)
  }, [session, router])

  // Verificar método de pago al cambiar a vista "account"
  useEffect(() => {
    if (!session || loading || view !== 'account') return

    const checkPaymentMethod = async () => {
      console.log('[📡] Consultando método de pago...')
      try {
        const res = await fetch('/api/stripe/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: session.user.id }),
        })

        const data = await res.json()
        setHasPaymentMethod(data.hasPaymentMethod)
        setCards(data.cards || [])
        console.log('[✅] Método de pago:', data)
      } catch (err) {
        console.error('[❌] Error al obtener método de pago:', err)
        setHasPaymentMethod(null)
        setCards([])
      }
    }

    checkPaymentMethod()
  }, [view, session, loading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (session === undefined || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-xl">Verificando sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white">
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-700">Mi App SaaS</h1>
          <div className="space-x-2">
            <button
              onClick={() => setView('welcome')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Bienvenido
            </button>
            <button
              onClick={() => setView('account')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Cuenta
            </button>
            <button
              onClick={() => setView('add-payment')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Agregar Método de Pago
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        {view === 'welcome' && (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Bienvenido, {session?.user?.email}!
            </h2>
            <p className="text-gray-600 mb-6">Gracias por usar nuestra aplicación.</p>
          </>
        )}

        {view === 'account' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalles de la cuenta</h2>

            <div className="mb-4 bg-white shadow rounded p-4">
              <p className="mb-2 font-bold text-gray-800"><strong>Email:</strong> {session?.user?.email}</p>
              <p className="mb-2 font-bold text-gray-800"><strong>ID de usuario:</strong> {session?.user?.id}</p>
            </div>

            <div className="mt-4">
              {hasPaymentMethod === null ? (
                <p className="text-gray-500">Verificando método de pago...</p>
              ) : hasPaymentMethod ? (
                <p className="text-green-600 font-semibold">
                  ✅ Ya tienes un método de pago registrado.
                </p>
              ) : (
                <p className="text-red-600 font-semibold">
                  ❌ No tienes ningún método de pago registrado.
                </p>
              )}
            </div>

            {cards.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-700 mb-2">Tarjetas guardadas:</h3>
                {cards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
                  >
                    <p className="text-sm text-gray-800">
                      💳 {card.brand?.toUpperCase()} •••• {card.last4}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expira {card.exp_month}/{card.exp_year}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'add-payment' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Agregar Método de Pago</h2>
            {session?.user && <PaymentForm user={session.user} />}
          </>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Mi App SaaS. Todos los derechos reservados.
      </footer>
    </div>
  )
}

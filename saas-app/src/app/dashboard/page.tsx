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

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        router.push('/auth')
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  useEffect(() => {
    const checkPaymentMethod = async () => {
      if (!session) return
      const res = await fetch('/api/stripe/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id }),
      })
      const data = await res.json()
      setHasPaymentMethod(data.hasPaymentMethod)
    }
    if (session) {
      checkPaymentMethod()
    }
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
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
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Hola, {session && session.user ? session.user.email : ''}
        </h2>
        <p className="text-gray-600 mb-6">Gracias por usar nuestra aplicación.</p>

        {/* Estado del método de pago */}
        {hasPaymentMethod === null ? (
          <p className="text-gray-500 mb-4">Verificando método de pago...</p>
        ) : hasPaymentMethod ? (
          <p className="text-green-600 font-semibold mb-4">
             Ya tienes un método de pago registrado.
          </p>
        ) : (
          <p className="text-red-600 font-semibold mb-4">
             Aún no tienes ningún método de pago registrado.
          </p>
        )}

        {/* Formulario de Stripe */}
        <div className="mt-8">
          {session && session.user && <PaymentForm user={session.user} />}
        </div>
      </main>

      {/* Footer opcional */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Mi App SaaS. Todos los derechos reservados.
      </footer>
    </div>
  )
}

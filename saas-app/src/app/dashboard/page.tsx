'use client'

import useUser from '../hooks/useUsers'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function DashboardPage() {
  const { session } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session === null) {
      // Si ya sabemos que no hay sesión, redirigimos
      router.push('/auth')
    } else if (session) {
      // Si hay sesión, dejamos de cargar
      setLoading(false)
    }
    // No redirigimos hasta saber
  }, [session, router])

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">¡Bienvenido!</h1>
      <p className="text-gray-600 mb-8">Has iniciado sesión correctamente.</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
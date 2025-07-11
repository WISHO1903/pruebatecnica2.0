'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function useUser() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    session,
    isAuthenticated: !!session,
  }
}
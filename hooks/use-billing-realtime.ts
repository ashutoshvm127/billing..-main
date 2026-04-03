'use client'

import { useEffect } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export function useBillingRealtime(
  userId: string | undefined,
  tables: Array<'invoices' | 'payments' | 'quotes' | 'reports' | 'user_permissions'>,
  onChange: () => void
) {
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    const channel = supabase.channel(`billing-realtime-${userId}-${tables.join('-')}`)

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onChange()
        }
      )
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, tables.join('|'), onChange])
}

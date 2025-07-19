'use client'

import { Button } from '@/components/ui/button'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { LogIn, LogOut, Loader2 } from 'lucide-react'

export default function LoginButtonSupabase() {
  const { user, loading, signInWithGoogle, signOut } = useSupabaseAuth()

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <Button variant="outline" size="sm" onClick={signOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={signInWithGoogle}>
      <LogIn className="w-4 h-4 mr-2" />
      Sign In (Supabase)
    </Button>
  )
}


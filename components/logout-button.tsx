'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Slot } from '@radix-ui/react-slot'

interface LogoutButtonProps {
  asChild?: boolean
  children?: React.ReactNode
}

export function LogoutButton({ asChild, children }: LogoutButtonProps) {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (asChild) {
    return (
      <Slot onClick={logout}>
        {children}
      </Slot>
    )
  }

  return <Button onClick={logout}>{children ?? 'Logout'}</Button>
}

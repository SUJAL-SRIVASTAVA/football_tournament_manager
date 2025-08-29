'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Home, Calendar, Trophy, Settings, LogIn, LogOut, User, Shield } from 'lucide-react'

export function MobileNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setProfile(profile)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = '/'
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/matches', label: 'Matches', icon: Calendar },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ...(profile?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin', icon: Settings }] : []),
    ...(user && profile?.role !== 'ADMIN' ? [{ href: '/request-admin', label: 'Request Admin', icon: Shield }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Auth buttons */}
        {user ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        ) : (
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
              pathname === '/login'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  )
}


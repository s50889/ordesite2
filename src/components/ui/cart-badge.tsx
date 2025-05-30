'use client'

import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'

interface CartBadgeProps {
  className?: string
  showText?: boolean
}

export function CartBadge({ className, showText = false }: CartBadgeProps) {
  const { items } = useCart()
  const { isAuthenticated, loading } = useAuth()
  const itemCount = items.length

  return (
    <span
      className={cn(
        "relative inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 group",
        className
      )}
    >
      <ShoppingCart className="w-5 h-5" />
      {showText && <span className="ml-2">カート</span>}
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      {!isAuthenticated && !loading && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
      )}
      {showText && (
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
      )}
    </span>
  )
} 
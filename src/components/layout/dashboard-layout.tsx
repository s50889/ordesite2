'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: 'customer' | 'sales' | 'admin'
}

export function DashboardLayout({ children, userRole = 'admin' }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // ユーザーの役割を取得
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentUserRole(profile.role)
        
        // 一般ユーザーの場合はホームページにリダイレクト
        if (profile.role === 'customer') {
          router.push('/')
          return
        }
      } else {
        // プロフィールが見つからない場合もホームページにリダイレクト
        router.push('/')
        return
      }
      
      setLoading(false)
    }

    checkUserRole()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: Home, roles: ['sales', 'admin'] },
    { name: '製品カタログ', href: '/products', icon: Package, roles: ['sales', 'admin'] },
    { name: '注文管理', href: '/admin/orders', icon: BarChart, roles: ['sales', 'admin'] },
    { name: '顧客管理', href: '/admin/customers', icon: Users, roles: ['sales', 'admin'] },
    { name: '配送管理', href: '/admin/shipping', icon: MapPin, roles: ['sales', 'admin'] },
    { name: 'システム設定', href: '/admin/settings', icon: Settings, roles: ['admin'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(currentUserRole || 'admin')
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 管理者・営業以外はアクセス不可
  if (currentUserRole === 'customer' || !currentUserRole) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* モバイルサイドバー */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-semibold">管理画面</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 px-2 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="p-4 border-t">
            <div className="text-sm text-gray-600 mb-2">
              役割: {currentUserRole === 'admin' ? '管理者' : '営業'}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </nav>
      </div>

      {/* デスクトップサイドバー */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <nav className="flex flex-col flex-1 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <span className="text-xl font-semibold">管理画面</span>
          </div>
          <div className="flex-1 px-2 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="p-4 border-t">
            <div className="text-sm text-gray-600 mb-2">
              役割: {currentUserRole === 'admin' ? '管理者' : '営業'}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </nav>
      </div>

      {/* メインコンテンツ */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-4 text-xl font-semibold">管理画面</span>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 
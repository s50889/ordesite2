'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CartBadge } from '@/components/ui/cart-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  User,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock,
  Settings,
  ChevronDown,
  Sparkles,
  Zap,
  Shield,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Menu as DropdownMenu, Transition } from '@headlessui/react'

interface NavbarProps {
  children: React.ReactNode
}

export function Navbar({ children }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // 管理者権限をチェック
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(profile?.role === 'admin')
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const baseNavigation = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: '製品カタログ', href: '/products', icon: Package },
    { name: 'お問い合わせ', href: '/contact', icon: MessageCircle },
    { name: '注文履歴', href: '/orders', icon: Clock },
  ]
  
  const adminNavigation = [
    { name: '管理ダッシュボード', href: '/admin', icon: Settings },
    { name: '製品管理', href: '/admin/products', icon: Package },
    { name: 'カテゴリ管理', href: '/admin/categories', icon: Package },
    { name: '注文管理', href: '/admin/orders', icon: ShoppingCart },
    { name: 'ユーザー管理', href: '/admin/users', icon: User },
    { name: 'システム設定', href: '/admin/settings', icon: Settings },
    { name: 'レポート', href: '/admin/reports', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/50" 
            : "bg-white shadow-sm border-b border-slate-200"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* ロゴ */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-3">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
                <div className="flex flex-col">
                  <motion.span 
                    className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.02 }}
                  >
                    Tatsumi Order site
                  </motion.span>
                  <span className="text-xs text-slate-500 font-medium">Industrial Solutions</span>
                </div>
              </Link>
              
              {/* メインナビゲーション */}
              <div className="hidden md:flex gap-1">
                {baseNavigation.map((item) => (
                  <motion.div key={item.name} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                    <Link 
                      href={item.href} 
                      className={cn(
                        'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        pathname === item.href
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                      {pathname === item.href && (
                        <motion.div
                          className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full"
                          layoutId="activeIndicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          style={{ x: '-50%' }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
                
                {/* 管理者用ドロップダウン */}
                {isAdmin && (
                  <div className="relative">
                    <DropdownMenu as="div" className="relative">
                      <DropdownMenu.Button 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-all duration-200"
                        onMouseEnter={() => setAdminMenuOpen(true)}
                        onMouseLeave={() => setAdminMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        管理メニュー
                        <motion.div
                          animate={{ rotate: adminMenuOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </DropdownMenu.Button>
                      
                      <AnimatePresence>
                        {adminMenuOpen && (
                          <DropdownMenu.Items
                            static
                            className="absolute left-0 mt-2 w-56 origin-top-left"
                            onMouseEnter={() => setAdminMenuOpen(true)}
                            onMouseLeave={() => setAdminMenuOpen(false)}
                          >
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="bg-white rounded-xl shadow-xl border border-slate-200/50 py-2 backdrop-blur-md"
                            >
                              {adminNavigation.map((item, index) => (
                                <DropdownMenu.Item key={item.name}>
                                  {({ active }: { active: boolean }) => (
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <Link
                                        href={item.href}
                                        className={cn(
                                          'flex items-center gap-3 px-4 py-2 text-sm mx-2 rounded-lg transition-all duration-200',
                                          active ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                                        )}
                                        onClick={() => setAdminMenuOpen(false)}
                                      >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                      </Link>
                                    </motion.div>
                                  )}
                                </DropdownMenu.Item>
                              ))}
                            </motion.div>
                          </DropdownMenu.Items>
                        )}
                      </AnimatePresence>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
            
            {/* 右側アイコンメニュー */}
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/cart">
                  <CartBadge />
                </Link>
              </motion.div>
              
              {user ? (
                <DropdownMenu as="div" className="relative">
                  <DropdownMenu.Button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-200">
                    <motion.div
                      className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </motion.div>
                  </DropdownMenu.Button>
                  
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <DropdownMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-xl border border-slate-200/50 py-2 backdrop-blur-md">
                      <div className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                        <div className="font-medium text-slate-900">{user.email}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3" />
                          {isAdmin ? '管理者' : 'ユーザー'}
                        </div>
                      </div>
                      
                      <DropdownMenu.Item>
                        {({ active }) => (
                          <Link 
                            href="/profile" 
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-sm mx-2 rounded-lg transition-all duration-200',
                              active ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' : 'text-slate-700'
                            )}
                          >
                            <User className="w-4 h-4" />
                            プロフィール
                          </Link>
                        )}
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Item>
                        {({ active }) => (
                          <Link 
                            href="/orders" 
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-sm mx-2 rounded-lg transition-all duration-200',
                              active ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' : 'text-slate-700'
                            )}
                          >
                            <Clock className="w-4 h-4" />
                            注文履歴
                          </Link>
                        )}
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Item>
                        {({ active }) => (
                          <Link 
                            href="/dashboard/shipping-addresses" 
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-sm mx-2 rounded-lg transition-all duration-200',
                              active ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' : 'text-slate-700'
                            )}
                          >
                            <MapPin className="w-4 h-4" />
                            配送先管理
                          </Link>
                        )}
                      </DropdownMenu.Item>
                      
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <DropdownMenu.Item>
                          {({ active }) => (
                            <button 
                              onClick={handleLogout} 
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-2 text-sm mx-2 rounded-lg transition-all duration-200',
                                active ? 'bg-red-50 text-red-700' : 'text-slate-700'
                              )}
                            >
                              <LogOut className="w-4 h-4" />
                              ログアウト
                            </button>
                          )}
                        </DropdownMenu.Item>
                      </div>
                    </DropdownMenu.Items>
                  </Transition>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login">
                      <Button size="sm" variant="outline" className="border-slate-300 hover:border-blue-500 hover:text-blue-600">
                        ログイン
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/register">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                        新規登録
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}
              
              {/* モバイルメニューボタン */}
              <motion.button
                className="md:hidden p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* モバイルメニュー */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-slate-200"
            >
              <div className="px-4 py-4 space-y-2">
                {baseNavigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        pathname === item.href
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                {isAdmin && (
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">
                      管理メニュー
                    </div>
                    {adminNavigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (baseNavigation.length + index) * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      <main className="pt-16">{children}</main>
    </div>
  )
} 
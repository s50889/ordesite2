'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ArrowUp,
  Heart,
  Star,
  Rocket,
  Globe,
  Users,
  Award,
  ChevronRight,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube
} from 'lucide-react'

export function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-500' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' }
  ]

  const quickLinks = [
    { href: '/products', label: '製品カタログ', icon: Rocket },
    { href: '/contact', label: 'お問い合わせ', icon: Mail },
    { href: '/company', label: '会社概要', icon: Users },
    { href: '/login', label: 'ログイン', icon: Star },
    { href: '/signup', label: '新規登録', icon: Star }
  ]

  const companyInfo = [
    { icon: Phone, label: '079-234-9200', subtext: '月～土 8:00-17:00' },
    { icon: Mail, label: 'info@tatsumisangyo.co.jp', subtext: '24時間受付' },
    { icon: MapPin, label: '兵庫県姫路市飾磨区英賀甲1944-2', subtext: '〒672-8078' },
    { icon: Clock, label: currentTime.toLocaleTimeString('ja-JP'), subtext: '現在時刻' }
  ]

  return (
    <>
      {/* メインフッター */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
        {/* 背景パターン */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)'
          }}></div>
        </div>
        
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* 浮遊する装飾要素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          {/* メインコンテンツ */}
          <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
            {/* ブランドセクション */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Tatsumi Order Site
                  </h3>
                </div>
                
                <p className="text-slate-300 leading-relaxed max-w-md text-lg">
                  工業資材のプロフェッショナルとして、お客様の製造現場を最適化し、
                  <span className="text-blue-400 font-semibold">生産性向上</span>をサポートします。
                </p>
              </motion.div>
            </div>

            {/* クイックリンク */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h4 className="text-xl font-bold text-white flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-blue-400" />
                クイックアクセス
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link 
                      href={link.href} 
                      className="group flex items-center text-slate-300 hover:text-white transition-all duration-300"
                    >
                      <link.icon className="w-4 h-4 mr-3 text-blue-400 group-hover:text-blue-300" />
                      <span className="group-hover:text-blue-300">{link.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* 連絡先情報 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h4 className="text-xl font-bold text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-400" />
                お問い合わせ
              </h4>
              <div className="space-y-4">
                {companyInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-300">
                      <info.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{info.label}</p>
                      <p className="text-sm text-slate-400">{info.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ソーシャルメディア */}
              <div className="pt-4">
                <h5 className="text-sm font-semibold text-slate-400 mb-3">フォローする</h5>
                <div className="flex space-x-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-400 ${social.color} transition-all duration-300 hover:bg-white/20`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ボトムセクション */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-slate-400">
                <Heart className="w-4 h-4 text-red-400" />
                <span>&copy; 2024 Tatsumi Order Site. Made with love in Japan.</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  利用規約
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  品質保証
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* トップに戻るボタン */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-blue-500/25 transition-all duration-300"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
} 
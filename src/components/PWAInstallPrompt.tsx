'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWAがすでにインストールされているかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // インストールプロンプトを延期
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // 最後に表示した時間を確認
      const lastShown = localStorage.getItem('pwaInstallPromptLastShown')
      const now = new Date().getTime()
      const oneDayInMs = 24 * 60 * 60 * 1000
      
      if (!lastShown || now - parseInt(lastShown) > oneDayInMs) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 3000) // 3秒後に表示
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // インストールプロンプトを表示
    deferredPrompt.prompt()
    
    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    
    setDeferredPrompt(null)
    handleClose()
  }

  const handleClose = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwaInstallPromptLastShown', new Date().getTime().toString())
  }

  if (isInstalled || !showInstallPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:max-w-md z-50"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">アプリをインストール</h3>
                  <p className="text-sm text-blue-100">ホーム画面に追加して快適に利用</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900">オフラインでも利用可能</h4>
                  <p className="text-sm text-slate-600">
                    インターネット接続がなくても基本機能が使えます
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900">素早くアクセス</h4>
                  <p className="text-sm text-slate-600">
                    ホーム画面からワンタップで起動できます
                  </p>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                今すぐインストール
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-slate-300"
              >
                後で
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 
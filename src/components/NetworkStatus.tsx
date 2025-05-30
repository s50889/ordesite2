'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // 初期状態をチェック
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // 3秒後に自動的に非表示
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Service Workerの同期状態も監視
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_STATUS') {
          // Service Workerからの同期状態を受信
          console.log('Sync status:', event.data.status)
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showStatus) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed top-16 left-1/2 transform -translate-x-1/2 z-[60] px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg flex items-center gap-2 md:gap-3',
          isOnline 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            <span className="text-sm md:text-base font-medium text-green-800">オンラインに復帰しました</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            <span className="text-sm md:text-base font-medium text-red-800">オフラインです</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 
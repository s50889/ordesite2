'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker登録成功:', registration.scope)
            
            // アップデートがある場合の処理
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 新しいバージョンが利用可能
                    if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          },
          (error) => {
            console.error('Service Worker登録失敗:', error)
          }
        )
      })
    }
  }, [])

  return null
} 
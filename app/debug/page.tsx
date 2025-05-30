'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // カテゴリを取得
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')

      if (catError) {
        console.error('カテゴリ取得エラー:', catError)
      }

      // 製品を取得
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*')

      if (prodError) {
        console.error('製品取得エラー:', prodError)
      }

      setCategories(categoriesData || [])
      setProducts(productsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <pre className="bg-slate-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <pre className="bg-slate-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(products, null, 2)}
        </pre>
      </div>
    </div>
  )
} 
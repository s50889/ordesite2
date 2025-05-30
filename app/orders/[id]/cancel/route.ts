import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id: orderId } = await params
  // 注文取得
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('status, customer_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 })
  }

  // すでにキャンセル済み、またはキャンセル不可ステータスの場合は拒否
  if (order.status === 'cancelled' || order.status === 'shipped' || order.status === 'delivered') {
    return NextResponse.json({ error: 'この注文はキャンセルできません' }, { status: 400 })
  }

  // 自分の注文か、管理者のみ許可
  if (order.customer_id !== user.id) {
    // 管理者権限チェック
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }
  }

  // キャンセル処理
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return NextResponse.json({ error: 'キャンセル処理に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 
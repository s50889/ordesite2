// メール送信のヘルパー関数

interface EmailData {
  order_id?: string
  order_number?: string
  customer_name?: string
  shipping_name?: string
  shipping_email?: string
  shipping_postal_code?: string
  shipping_prefecture?: string
  shipping_city?: string
  shipping_address?: string
  created_at?: string
  requested_at?: string
  delivery_date?: string
  status?: string
  note?: string
  order_lines?: Array<{
    product?: { name: string }
    product_name?: string
    quantity: number
    note?: string
  }>
}

interface ContactData {
  name: string
  email: string
  company?: string
  phone?: string
  type?: string
  message: string
}

// 注文確認メールを送信
export async function sendOrderConfirmationEmail(orderData: EmailData, recipientEmail: string) {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order_confirmation',
        to: recipientEmail,
        data: orderData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'メール送信に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('注文確認メール送信エラー:', error)
    throw error
  }
}

// お問い合わせ受信メールを送信（管理者宛て）
export async function sendContactInquiryEmail(contactData: ContactData, adminEmail: string) {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact_inquiry',
        to: adminEmail,
        data: contactData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'メール送信に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('お問い合わせメール送信エラー:', error)
    throw error
  }
}

// お問い合わせ自動返信メールを送信（お客様宛て）
export async function sendContactAutoReplyEmail(contactData: ContactData) {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact_auto_reply',
        to: contactData.email,
        data: contactData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'メール送信に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('お問い合わせ自動返信メール送信エラー:', error)
    throw error
  }
}

// ステータス更新メールを送信
export async function sendStatusUpdateEmail(statusData: EmailData, recipientEmail: string) {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'status_update',
        to: recipientEmail,
        data: statusData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'メール送信に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('ステータス更新メール送信エラー:', error)
    throw error
  }
} 
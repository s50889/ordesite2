import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { createClient } from '@supabase/supabase-js'

// SendGridの設定は動的に行うため、ここでは初期化しない

interface EmailRequest {
  type: 'order_confirmation' | 'contact_inquiry' | 'contact_auto_reply' | 'status_update'
  to: string
  data: any
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { type, to, data } = body

    console.log('メール送信リクエスト:', { type, to, data })

    // 環境変数の確認
    console.log('環境変数チェック:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY
    })

    // サーバーサイド用のSupabaseクライアント（サービスロールキー使用）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .single()

    console.log('サイト設定取得結果:', { settings, settingsError })

    if (settingsError || !settings) {
      console.error('サイト設定取得エラー:', settingsError)
      return NextResponse.json(
        { error: 'サイト設定が見つかりません' },
        { status: 500 }
      )
    }

    // SendGrid APIキーの設定（データベースから取得した値を優先）
    const sendgridApiKey = settings.sendgrid_api_key || process.env.SENDGRID_API_KEY
    if (!sendgridApiKey) {
      return NextResponse.json(
        { error: 'SendGrid APIキーが設定されていません' },
        { status: 500 }
      )
    }

    // SendGrid APIキーを設定
    sgMail.setApiKey(sendgridApiKey)

    let emailContent: {
      subject: string
      html: string
      text: string
    }

    // メールタイプに応じてコンテンツを生成
    switch (type) {
      case 'order_confirmation':
        emailContent = generateOrderConfirmationEmail(data, settings)
        break
      case 'contact_inquiry':
        emailContent = generateContactInquiryEmail(data, settings)
        break
      case 'contact_auto_reply':
        emailContent = generateContactAutoReplyEmail(data, settings)
        break
      case 'status_update':
        emailContent = generateStatusUpdateEmail(data, settings)
        break
      default:
        return NextResponse.json(
          { error: '無効なメールタイプです' },
          { status: 400 }
        )
    }

    // 送信者情報を決定（メールタイプに応じて）
    let fromEmail: string
    let fromName: string

    if (type === 'contact_inquiry' || type === 'contact_auto_reply') {
      // お問い合わせメールの場合
      fromEmail = settings.contact_from_email || settings.from_email || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'
      fromName = settings.contact_from_name || settings.from_name || settings.site_name || 'オーダーサイト'
    } else {
      // 注文関連メールの場合
      fromEmail = settings.from_email || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'
      fromName = settings.from_name || settings.site_name || 'オーダーサイト'
    }

    // SendGridでメール送信
    const msg = {
      to: to,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    }

    await sgMail.send(msg)

    // 通知ログに記録
    await supabase.from('notification_logs').insert({
      notification_type: type,
      recipient_email: to,
      subject: emailContent.subject,
      body: emailContent.html,
      status: 'sent',
      sent_at: new Date().toISOString(),
      order_id: type === 'order_confirmation' || type === 'status_update' ? data.order_id : null
    })

    return NextResponse.json({ success: true, message: 'メールを送信しました' })

  } catch (error) {
    console.error('メール送信エラー:', error)
    
    // エラーログを記録
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase.from('notification_logs').insert({
      notification_type: 'error',
      recipient_email: 'system',
      subject: 'メール送信エラー',
      body: JSON.stringify(error),
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'メール送信に失敗しました' },
      { status: 500 }
    )
  }
}

// 注文確認メールのコンテンツ生成
function generateOrderConfirmationEmail(orderData: any, settings: any) {
  const subject = `【${settings.site_name || 'オーダーサイト'}】ご注文確認 - 注文番号: ${orderData.order_number}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ご注文確認</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .order-info { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .order-items { margin-top: 20px; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${settings.site_name || 'オーダーサイト'}</h1>
          <h2>ご注文ありがとうございます</h2>
        </div>
        
        <p>${orderData.customer_name || orderData.shipping_name} 様</p>
        
        <p>この度は、${settings.site_name || '弊社'}をご利用いただき、誠にありがとうございます。<br>
        ご注文を確認いたしましたので、詳細をお知らせいたします。</p>
        
        <div class="order-info">
          <h3>ご注文情報</h3>
          <p><strong>注文番号:</strong> ${orderData.order_number}</p>
          <p><strong>注文日時:</strong> ${new Date(orderData.created_at || orderData.requested_at).toLocaleString('ja-JP')}</p>
          <p><strong>お届け先:</strong><br>
          ${orderData.shipping_name}<br>
          〒${orderData.shipping_postal_code}<br>
          ${orderData.shipping_prefecture}${orderData.shipping_city}${orderData.shipping_address}</p>
          
          <div class="order-items">
            <h4>ご注文商品</h4>
            ${orderData.order_lines?.map((item: any) => `
              <div class="item">
                <strong>${item.product?.name || item.product_name}</strong><br>
                数量: ${item.quantity}個
                ${item.note ? `<br>備考: ${item.note}` : ''}
              </div>
            `).join('') || ''}
          </div>
        </div>
        
        <p>商品の準備が整い次第、発送のご連絡をさせていただきます。<br>
        配送予定日数: ${settings.estimated_delivery_days || 3}日程度</p>
        
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        
        <div class="footer">
          <p><strong>${settings.site_name || 'オーダーサイト'}</strong></p>
          ${settings.contact_email ? `<p>Email: ${settings.contact_email}</p>` : ''}
          ${settings.contact_phone ? `<p>Tel: ${settings.contact_phone}</p>` : ''}
          ${settings.contact_address ? `<p>住所: ${settings.contact_address}</p>` : ''}
          ${settings.business_hours ? `<p>営業時間: ${settings.business_hours}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
【${settings.site_name || 'オーダーサイト'}】ご注文確認

${orderData.customer_name || orderData.shipping_name} 様

この度は、${settings.site_name || '弊社'}をご利用いただき、誠にありがとうございます。
ご注文を確認いたしましたので、詳細をお知らせいたします。

■ご注文情報
注文番号: ${orderData.order_number}
注文日時: ${new Date(orderData.created_at || orderData.requested_at).toLocaleString('ja-JP')}

■お届け先
${orderData.shipping_name}
〒${orderData.shipping_postal_code}
${orderData.shipping_prefecture}${orderData.shipping_city}${orderData.shipping_address}

■ご注文商品
${orderData.order_lines?.map((item: any) => 
  `・${item.product?.name || item.product_name} × ${item.quantity}個${item.note ? ` (備考: ${item.note})` : ''}`
).join('\n') || ''}

商品の準備が整い次第、発送のご連絡をさせていただきます。
配送予定日数: ${settings.estimated_delivery_days || 3}日程度

ご不明な点がございましたら、お気軽にお問い合わせください。

${settings.site_name || 'オーダーサイト'}
${settings.contact_email ? `Email: ${settings.contact_email}` : ''}
${settings.contact_phone ? `Tel: ${settings.contact_phone}` : ''}
  `
  
  return { subject, html, text }
}

// お問い合わせ受信メールのコンテンツ生成
function generateContactInquiryEmail(contactData: any, settings: any) {
  const subject = `【${settings.site_name || 'オーダーサイト'}】お問い合わせを受信しました`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>お問い合わせ受信</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .contact-info { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${settings.site_name || 'オーダーサイト'}</h1>
          <h2>お問い合わせを受信しました</h2>
        </div>
        
        <div class="contact-info">
          <h3>お問い合わせ内容</h3>
          <p><strong>お名前:</strong> ${contactData.name}</p>
          <p><strong>メールアドレス:</strong> ${contactData.email}</p>
          ${contactData.company ? `<p><strong>会社名:</strong> ${contactData.company}</p>` : ''}
          ${contactData.phone ? `<p><strong>電話番号:</strong> ${contactData.phone}</p>` : ''}
          <p><strong>お問い合わせ種別:</strong> ${contactData.type || '一般的なお問い合わせ'}</p>
          <p><strong>受信日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
          
          <h4>お問い合わせ内容:</h4>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${contactData.message}</div>
        </div>
        
        <p>上記のお問い合わせを受信いたしました。<br>
        内容を確認の上、担当者よりご連絡させていただきます。</p>
        
        <div class="footer">
          <p>このメールは自動送信されています。</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
【${settings.site_name || 'オーダーサイト'}】お問い合わせを受信しました

■お問い合わせ内容
お名前: ${contactData.name}
メールアドレス: ${contactData.email}
${contactData.company ? `会社名: ${contactData.company}` : ''}
${contactData.phone ? `電話番号: ${contactData.phone}` : ''}
お問い合わせ種別: ${contactData.type || '一般的なお問い合わせ'}
受信日時: ${new Date().toLocaleString('ja-JP')}

お問い合わせ内容:
${contactData.message}

上記のお問い合わせを受信いたしました。
内容を確認の上、担当者よりご連絡させていただきます。

このメールは自動送信されています。
  `
  
  return { subject, html, text }
}

// お問い合わせ自動返信メールのコンテンツ生成（お客様宛て）
function generateContactAutoReplyEmail(contactData: any, settings: any) {
  const subject = `【${settings.site_name || 'オーダーサイト'}】お問い合わせありがとうございます`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>お問い合わせ自動返信</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .contact-info { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${settings.site_name || 'オーダーサイト'}</h1>
          <h2>お問い合わせありがとうございます</h2>
        </div>
        
        <p>${contactData.name} 様</p>
        
        <p>この度は、${settings.site_name || '弊社'}にお問い合わせいただき、誠にありがとうございます。<br>
        以下の内容でお問い合わせを受け付けいたしました。</p>
        
        <div class="contact-info">
          <h3>お問い合わせ内容</h3>
          <p><strong>お名前:</strong> ${contactData.name}</p>
          <p><strong>メールアドレス:</strong> ${contactData.email}</p>
          ${contactData.company ? `<p><strong>会社名:</strong> ${contactData.company}</p>` : ''}
          ${contactData.phone ? `<p><strong>電話番号:</strong> ${contactData.phone}</p>` : ''}
          <p><strong>お問い合わせ種別:</strong> ${contactData.type || '一般的なお問い合わせ'}</p>
          <p><strong>受付日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
          
          <h4>お問い合わせ内容:</h4>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${contactData.message}</div>
        </div>
        
        <p>内容を確認の上、担当者より2営業日以内にご連絡させていただきます。<br>
        お急ぎの場合は、お電話にてお問い合わせください。</p>
        
        <div class="footer">
          <p><strong>${settings.site_name || 'オーダーサイト'}</strong></p>
          ${settings.contact_email ? `<p>Email: ${settings.contact_email}</p>` : ''}
          ${settings.contact_phone ? `<p>Tel: ${settings.contact_phone}</p>` : ''}
          ${settings.contact_address ? `<p>住所: ${settings.contact_address}</p>` : ''}
          ${settings.business_hours ? `<p>営業時間: ${settings.business_hours}</p>` : ''}
          <br>
          <p style="font-size: 12px; color: #999;">このメールは自動送信されています。このメールに返信されても対応できませんのでご了承ください。</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
【${settings.site_name || 'オーダーサイト'}】お問い合わせありがとうございます

${contactData.name} 様

この度は、${settings.site_name || '弊社'}にお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けいたしました。

■お問い合わせ内容
お名前: ${contactData.name}
メールアドレス: ${contactData.email}
${contactData.company ? `会社名: ${contactData.company}` : ''}
${contactData.phone ? `電話番号: ${contactData.phone}` : ''}
お問い合わせ種別: ${contactData.type || '一般的なお問い合わせ'}
受付日時: ${new Date().toLocaleString('ja-JP')}

お問い合わせ内容:
${contactData.message}

内容を確認の上、担当者より2営業日以内にご連絡させていただきます。
お急ぎの場合は、お電話にてお問い合わせください。

${settings.site_name || 'オーダーサイト'}
${settings.contact_email ? `Email: ${settings.contact_email}` : ''}
${settings.contact_phone ? `Tel: ${settings.contact_phone}` : ''}

このメールは自動送信されています。このメールに返信されても対応できませんのでご了承ください。
  `
  
  return { subject, html, text }
}

// ステータス更新メールのコンテンツ生成
function generateStatusUpdateEmail(statusData: any, settings: any) {
  const subject = `【${settings.site_name || 'オーダーサイト'}】注文ステータス更新 - 注文番号: ${statusData.order_number}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>注文ステータス更新</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .status-info { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${settings.site_name || 'オーダーサイト'}</h1>
          <h2>注文ステータスが更新されました</h2>
        </div>
        
        <p>${statusData.customer_name || statusData.shipping_name} 様</p>
        
        <p>ご注文のステータスが更新されましたのでお知らせいたします。</p>
        
        <div class="status-info">
          <h3>注文情報</h3>
          <p><strong>注文番号:</strong> ${statusData.order_number}</p>
          <p><strong>現在のステータス:</strong> <span class="status-badge" style="background-color: #e3f2fd; color: #1976d2;">${statusData.status}</span></p>
          ${statusData.delivery_date ? `<p><strong>配送予定日:</strong> ${new Date(statusData.delivery_date).toLocaleDateString('ja-JP')}</p>` : ''}
          ${statusData.note ? `<p><strong>備考:</strong> ${statusData.note}</p>` : ''}
        </div>
        
        <p>引き続きよろしくお願いいたします。</p>
        
        <div class="footer">
          <p><strong>${settings.site_name || 'オーダーサイト'}</strong></p>
          ${settings.contact_email ? `<p>Email: ${settings.contact_email}</p>` : ''}
          ${settings.contact_phone ? `<p>Tel: ${settings.contact_phone}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
【${settings.site_name || 'オーダーサイト'}】注文ステータス更新

${statusData.customer_name || statusData.shipping_name} 様

ご注文のステータスが更新されましたのでお知らせいたします。

■注文情報
注文番号: ${statusData.order_number}
現在のステータス: ${statusData.status}
${statusData.delivery_date ? `配送予定日: ${new Date(statusData.delivery_date).toLocaleDateString('ja-JP')}` : ''}
${statusData.note ? `備考: ${statusData.note}` : ''}

引き続きよろしくお願いいたします。

${settings.site_name || 'オーダーサイト'}
${settings.contact_email ? `Email: ${settings.contact_email}` : ''}
${settings.contact_phone ? `Tel: ${settings.contact_phone}` : ''}
  `
  
  return { subject, html, text }
} 
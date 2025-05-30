export interface ShippingAddress {
  postalCode: string
  prefecture: string
  city: string
  address1: string
  address2?: string
  recipientName: string
  recipientCompany?: string
  recipientPhone: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  display_order: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface Product {
  id: string
  sku: string | null
  name: string | null
  description: string | null
  category_id: string | null
  category?: Category
  specs: string | null
  image_url: string | null
  stock_quantity: number | null
  is_active: boolean | null
  moq: number | null
  created_at: string | null
  updated_at: string | null
}

export interface CartItem {
  productId: string
  product: {
    id: string
    sku: string
    name: string
    specs: string | null
    image_url: string | null
    moq: number
    category?: Category
  }
  quantity: number
  note?: string
}

export interface OrderFormData {
  shippingAddress: ShippingAddress
  items: Array<{
    productId: string
    quantity: number
    note?: string
  }>
}

export interface User {
  id: string
  email: string
  role: 'customer' | 'sales' | 'admin'
  name: string | null
  company_name: string | null
}

export interface EmailNotification {
  order_id: string
  order_date: string
  customer_name: string
  customer_email: string
  total_qty: number
  shipping_address: ShippingAddress
  items: Array<{
    sku: string
    name: string
    quantity: number
    note?: string
  }>
} 
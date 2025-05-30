import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getOrderStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: '受付待ち',
    processing: '手配中',
    shipped: '出荷済',
    completed: '完了',
  }
  return statusLabels[status] || status
}

export function getUserRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    customer: '顧客',
    sales: '営業担当',
    admin: '管理者',
  }
  return roleLabels[role] || role
}

// UUID生成関数（ブラウザとNode.js両方で動作）
export function generateUUID(): string {
  // ブラウザ環境でcrypto.randomUUIDが利用可能な場合
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // フォールバック: 疑似UUID生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
} 
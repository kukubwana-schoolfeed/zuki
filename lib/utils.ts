import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatZMW(amount: number): string {
  return `K${amount.toLocaleString('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function generateOrderNumber(sequence: number): string {
  return `ZUKI-${String(sequence).padStart(4, '0')}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getWhatsAppLink(number: string, message?: string): string {
  const clean = number.replace(/\D/g, '')
  const encoded = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${clean}${encoded ? `?text=${encoded}` : ''}`
}

export const ORDER_STATUS_STEPS = [
  { key: 'pending',     label: 'Pending',     description: 'Order received' },
  { key: 'confirmed',   label: 'Confirmed',   description: 'Baker confirmed' },
  { key: 'in_progress', label: 'In Progress', description: 'Being made' },
  { key: 'ready',       label: 'Ready',       description: 'Ready for collection' },
  { key: 'collected',   label: 'Collected',   description: 'Order complete' },
] as const

export const OCCASIONS = [
  'Birthday', 'Wedding', 'Anniversary', 'Baby Shower',
  'Graduation', 'Corporate', 'Engagement', 'Other',
]

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  airtel:        'Airtel Money',
  mtn:           'MTN Mobile Money',
  zamtel:        'Zamtel Kwacha',
  bank_transfer: 'Bank Transfer',
}

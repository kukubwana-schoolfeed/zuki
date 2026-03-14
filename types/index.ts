export type UserRole = 'admin' | 'baker' | 'client'
export type BakeryStatus = 'pending' | 'approved' | 'suspended'
export type DeliveryOption = 'pickup' | 'delivery' | 'both'
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'collected' | 'cancelled'
export type PaymentMethod = 'airtel' | 'mtn' | 'zamtel' | 'bank_transfer'
export type PaymentType = 'deposit' | 'balance' | 'full'
export type PaymentStatus = 'pending' | 'proof_submitted' | 'confirmed' | 'failed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface Bakery {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  status: BakeryStatus
  deposit_percent: number
  min_notice_hours: number
  rush_order_enabled: boolean
  rush_fee_zmw: number
  delivery_option: DeliveryOption
  delivery_fee_zmw: number
  max_orders_per_day: number
  refund_policy_enabled: boolean
  refund_policy_text: string | null
  whatsapp_number: string | null
  accepts_airtel: boolean
  accepts_mtn: boolean
  accepts_zamtel: boolean
  accepts_bank: boolean
  airtel_number: string | null
  mtn_number: string | null
  zamtel_number: string | null
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  created_at: string
}

export interface MenuItem {
  id: string
  bakery_id: string
  name: string
  description: string | null
  base_price_zmw: number
  image_url: string | null
  is_available: boolean
  flavor_options: string[]
  filling_options: string[]
  frosting_options: string[]
  size_options: string[]
  tier_options: string[]
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  bakery_id: string
  client_id: string
  menu_item_id: string
  selected_flavor: string | null
  selected_filling: string | null
  selected_frosting: string | null
  selected_size: string | null
  selected_tiers: string | null
  custom_description: string | null
  special_instructions: string | null
  occasion: string | null
  dedication_message: string | null
  pickup_or_delivery: 'pickup' | 'delivery'
  delivery_address: string | null
  requested_date: string
  pickup_time: string | null
  is_rush_order: boolean
  base_price_zmw: number
  rush_fee_zmw: number
  delivery_fee_zmw: number
  total_price_zmw: number
  deposit_amount_zmw: number
  balance_amount_zmw: number
  status: OrderStatus
  created_at: string
  confirmed_at: string | null
  ready_at: string | null
  collected_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
}

export interface Payment {
  id: string
  order_id: string
  payment_type: PaymentType
  method: PaymentMethod
  amount_zmw: number
  status: PaymentStatus
  transaction_reference: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  order_id: string
  bakery_id: string
  client_id: string
  rating: number
  comment: string | null
  baker_reply: string | null
  baker_replied_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

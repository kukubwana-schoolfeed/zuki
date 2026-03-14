# 🎂 ZUKI — BUILD INSTRUCTIONS
> Step-by-step guide to building, running, and deploying the Zuki platform from scratch.
> Read CLAUDE.md first. This file tells you HOW to build. CLAUDE.md tells you WHAT to build.

---

## BEFORE YOU START

Keep both files open as you build:
- `CLAUDE.md` — full spec, design laws, database schema, feature details
- `BUILD_INSTRUCTIONS.md` — this file, the execution guide

Golden rules:
- Never skip a step. Each one sets up the next.
- Run `npm run build` before every Vercel deployment to catch TypeScript errors early.
- Check the Design Laws in CLAUDE.md Section 3 before touching any UI.
- Test on mobile as you go — not just at the end.

---

## PHASE 1 — PROJECT SETUP

### Step 1.1 — Prerequisites

Make sure these are installed:

```bash
node --version    # Must be 18.17 or higher
npm --version     # 9+ recommended
git --version     # Any recent version
```

Install global CLIs:

```bash
npm install -g vercel
npm install -g supabase
```

---

### Step 1.2 — Create the Next.js Project

```bash
npx create-next-app@latest zuki \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias="@/*"

cd zuki
```

---

### Step 1.3 — Install All Dependencies

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Animation
npm install framer-motion

# AI
npm install @anthropic-ai/sdk

# PDF Generation
npm install @react-pdf/renderer

# Charts
npm install recharts

# Forms + Validation
npm install react-hook-form @hookform/resolvers zod

# Date handling
npm install date-fns react-day-picker

# Email
npm install resend

# Utilities
npm install nanoid slugify clsx tailwind-merge class-variance-authority

# Icons
npm install lucide-react

# shadcn/ui base radix primitives
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-avatar @radix-ui/react-progress
npm install @radix-ui/react-toast @radix-ui/react-popover
npm install tailwindcss-animate
```

Initialise shadcn/ui:

```bash
npx shadcn@latest init
# Choose: Default style, Zinc base color, CSS variables: Yes
```

Add components:

```bash
npx shadcn@latest add button card input select dialog toast tabs badge
npx shadcn@latest add dropdown-menu avatar progress popover calendar
npx shadcn@latest add separator skeleton sheet
```

---

### Step 1.4 — Configure Tailwind

Replace `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zuki: {
          cream:       '#FFFAF8',
          pink:        '#F4A7B9',
          'pink-deep': '#E07A93',
          blue:        '#5B8DEF',
          'blue-deep': '#3A6FD8',
          charcoal:    '#2D2D2D',
          muted:       '#8A8A8A',
          border:      '#F0E8E8',
          success:     '#6BCB8B',
          warning:     '#F6C85F',
          error:       '#F47B7B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        zuki:     '0 4px 24px rgba(244, 167, 185, 0.15)',
        'zuki-lg':'0 8px 40px rgba(244, 167, 185, 0.25)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

### Step 1.5 — Global CSS

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;
}

@layer base {
  * { @apply border-zuki-border; }
  body { @apply bg-zuki-cream text-zuki-charcoal font-body antialiased; }
  h1, h2, h3, h4 { @apply font-display; }
}

@layer utilities {
  .blob { @apply absolute rounded-full blur-3xl opacity-20 pointer-events-none; }
  .zuki-gradient {
    background: linear-gradient(135deg, #FFFAF8 0%, #FDE8EE 50%, #EEF2FF 100%);
  }
  .text-gradient {
    @apply bg-gradient-to-r from-zuki-pink-deep to-zuki-blue bg-clip-text text-transparent;
  }
}

html { scroll-behavior: smooth; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #FFFAF8; }
::-webkit-scrollbar-thumb { background: #F4A7B9; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #E07A93; }
```

---

### Step 1.6 — Root Layout

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Zuki — Every cake, perfectly placed.',
  description: 'The bakery platform built for Zambia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-zuki-cream min-h-screen">{children}</body>
    </html>
  )
}
```

---

### Step 1.7 — TypeScript Types

Create `types/index.ts`:

```ts
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
  bank_branch: string | null
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
```

---

### Step 1.8 — Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@zuki.app

# Admin
ADMIN_EMAIL=admin@zuki.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mobile Money (scaffold — fill when API keys are ready)
AIRTEL_MONEY_API_KEY=
AIRTEL_MONEY_API_SECRET=
AIRTEL_MONEY_BASE_URL=https://openapi.airtel.africa

MTN_MOMO_API_KEY=
MTN_MOMO_API_SECRET=
MTN_MOMO_SUBSCRIPTION_KEY=
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com

ZAMTEL_API_KEY=
ZAMTEL_API_SECRET=
ZAMTEL_BASE_URL=
```

---

## PHASE 2 — SUPABASE SETUP

### Step 2.1 — Create the Project

1. Go to [supabase.com](https://supabase.com) → New project named `zuki`
2. Save your database password
3. Region: `eu-west-2` (London — closest to Zambia)
4. Wait ~2 minutes for it to spin up

### Step 2.2 — Get Your Keys

Dashboard → Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2.3 — Run the Schema

Go to SQL Editor → New query. Paste and run the full schema from `CLAUDE.md` Section 5.

Then run this extra query for notifications:

```sql
CREATE TABLE notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

### Step 2.4 — Enable Row Level Security

Run this in SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Bakeries
CREATE POLICY "Public can view approved bakeries" ON bakeries FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners can view own bakery" ON bakeries FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update own bakery" ON bakeries FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated can create bakery" ON bakeries FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Menu items
CREATE POLICY "Public can view available menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Baker can manage own menu items" ON menu_items FOR ALL USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- Orders
CREATE POLICY "Clients can view own orders" ON orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Bakers can view bakery orders" ON orders FOR SELECT USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);
CREATE POLICY "Bakers can update bakery orders" ON orders FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- Payments
CREATE POLICY "Clients can create payments" ON payments FOR INSERT WITH CHECK (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id)
);
CREATE POLICY "Order participants can view payments" ON payments FOR SELECT USING (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);
CREATE POLICY "Bakers can update payment status" ON payments FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);

-- Messages
CREATE POLICY "Order participants can read messages" ON messages FOR SELECT USING (
  auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
);
CREATE POLICY "Order participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() = (SELECT client_id FROM orders WHERE id = order_id) OR
    auth.uid() = (SELECT owner_id FROM bakeries WHERE id = (SELECT bakery_id FROM orders WHERE id = order_id))
  )
);

-- Reviews
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can leave one review per collected order" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = client_id AND
  (SELECT status FROM orders WHERE id = order_id) = 'collected'
);
CREATE POLICY "Bakers can reply to reviews" ON reviews FOR UPDATE USING (
  auth.uid() = (SELECT owner_id FROM bakeries WHERE id = bakery_id)
);

-- AI sessions
CREATE POLICY "Users manage own AI sessions" ON ai_sessions FOR ALL USING (auth.uid() = user_id);
```

### Step 2.5 — Enable Realtime

Dashboard → Database → Replication. Enable realtime for: `messages`, `orders`, `notifications`

### Step 2.6 — Create Storage Buckets

Dashboard → Storage → New bucket:

1. **`bakery-assets`** — Public: true, Max: 10MB
2. **`generated-pdfs`** — Public: false, Max: 20MB

Run storage policies:

```sql
CREATE POLICY "Public can view bakery assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'bakery-assets');

CREATE POLICY "Authenticated can upload bakery assets"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'bakery-assets' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Bakers can access own PDFs"
  ON storage.objects FOR ALL USING (
    bucket_id = 'generated-pdfs' AND auth.role() = 'authenticated'
  );
```

---

## PHASE 3 — SUPABASE CLIENT SETUP

### Step 3.1 — Browser Client (`lib/supabase/client.ts`)

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 3.2 — Server Client (`lib/supabase/server.ts`)

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### Step 3.3 — Middleware (`middleware.ts`)

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && (
    path.startsWith('/dashboard') ||
    path.startsWith('/baker') ||
    path.startsWith('/admin')
  )) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (path.startsWith('/admin')) {
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/baker/:path*', '/admin/:path*'],
}
```

### Step 3.4 — Auth Helpers (`lib/auth.ts`)

```ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, avatar_url')
    .eq('id', user.id)
    .single()
  return profile
}
```

---

## PHASE 4 — UTILITY HELPERS

Create `lib/utils.ts`:

```ts
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
```

---

## PHASE 5 — DESIGN SYSTEM COMPONENTS

Build all of these before any pages. Every page uses them.

### ZukiButton (`components/zuki/ZukiButton.tsx`)

```tsx
'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ZukiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const ZukiButton = forwardRef<HTMLButtonElement, ZukiButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-body font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary:   'bg-zuki-pink text-white hover:bg-zuki-pink-deep focus:ring-zuki-pink',
      secondary: 'bg-zuki-blue text-white hover:bg-zuki-blue-deep focus:ring-zuki-blue',
      ghost:     'bg-transparent text-zuki-charcoal border border-zuki-border hover:bg-zuki-cream hover:border-zuki-pink focus:ring-zuki-pink',
      danger:    'bg-zuki-error text-white hover:opacity-90 focus:ring-zuki-error',
    }
    const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : children}
      </motion.button>
    )
  }
)
ZukiButton.displayName = 'ZukiButton'
```

### ZukiCard (`components/zuki/ZukiCard.tsx`)

```tsx
'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ZukiCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function ZukiCard({ children, className, hover = false, onClick }: ZukiCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(244,167,185,0.2)' } : undefined}
      transition={{ duration: 0.2 }}
      className={cn('bg-white rounded-2xl border border-zuki-border shadow-sm', hover && 'cursor-pointer', className)}
    >
      {children}
    </motion.div>
  )
}
```

### ZukiBadge (`components/zuki/ZukiBadge.tsx`)

```tsx
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed:   { label: 'Confirmed',   className: 'bg-green-50 text-green-700 border-green-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready:       { label: 'Ready',       className: 'bg-purple-50 text-purple-700 border-purple-200' },
  collected:   { label: 'Collected',   className: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-50 text-red-700 border-red-200' },
}

export function ZukiBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  )
}
```

### ZukiStepper (`components/zuki/ZukiStepper.tsx`)

```tsx
'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ORDER_STATUS_STEPS } from '@/lib/utils'
import type { OrderStatus } from '@/types'

export function ZukiStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-2xl border border-red-200">
        <span className="text-red-600 font-medium text-sm">Order Cancelled</span>
      </div>
    )
  }

  const steps = ORDER_STATUS_STEPS
  const currentIndex = steps.findIndex(s => s.key === status)

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isActive = index === currentIndex
        const isLast = index === steps.length - 1

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${isComplete ? 'bg-zuki-success border-zuki-success text-white'
                    : isActive ? 'bg-zuki-pink border-zuki-pink text-white'
                    : 'bg-white border-zuki-border text-zuki-muted'}`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
              <span className={`text-[10px] font-medium whitespace-nowrap
                ${isActive ? 'text-zuki-pink' : isComplete ? 'text-zuki-success' : 'text-zuki-muted'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-8 mx-1 mb-4 transition-all ${isComplete ? 'bg-zuki-success' : 'bg-zuki-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### ZukiSkeleton (`components/zuki/ZukiSkeleton.tsx`)

```tsx
import { cn } from '@/lib/utils'

export function ZukiSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-zuki-border rounded-xl', className)} />
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zuki-border p-5 space-y-3">
      <div className="flex justify-between">
        <ZukiSkeleton className="h-4 w-24" />
        <ZukiSkeleton className="h-6 w-20 rounded-full" />
      </div>
      <ZukiSkeleton className="h-5 w-40" />
      <ZukiSkeleton className="h-4 w-32" />
    </div>
  )
}
```

### VerifiedBadge (`components/zuki/VerifiedBadge.tsx`)

```tsx
export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0" title="Verified by Zuki">
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="white"/>
      <path d="M10 10 L22 10 L10 22 L22 22"
        stroke="#2D2D2D" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
```

### AIBubble (`components/zuki/AIBubble.tsx`)

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import type { AIMessage } from '@/types'

export function AIBubble({ context }: { context?: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg: AIMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], context }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-zuki-pink rounded-full shadow-zuki-lg flex items-center justify-center text-white"
        aria-label="Open Zuki AI"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] bg-white rounded-3xl shadow-zuki-lg border border-zuki-border flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zuki-border bg-zuki-cream">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zuki-pink rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">Zuki AI</p>
                  <p className="text-xs text-zuki-muted">Ask me anything</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-zuki-muted hover:text-zuki-charcoal transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-zuki-muted text-sm">Hi! I'm your Zuki assistant. Ask me anything about baking, orders, or your bakery.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-zuki-pink text-white rounded-br-sm'
                      : 'bg-zuki-cream text-zuki-charcoal rounded-bl-sm border border-zuki-border'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zuki-cream border border-zuki-border px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 bg-zuki-pink rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-zuki-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2 rounded-2xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-zuki-pink rounded-2xl flex items-center justify-center text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## PHASE 6 — API ROUTES

### AI Chat (`app/api/ai/chat/route.ts`)

```ts
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, context } = await req.json()

  const systemPrompt = `You are Zuki AI, a warm and knowledgeable assistant built into Zuki — a cake ordering platform for Zambia.

You help bakers and clients with:
- Baking questions (recipes, techniques, substitutions, troubleshooting, flavour combinations)
- Platform questions (how to place orders, track status, manage payments)
- Business insights for bakers (pricing, order management, customer service)
- Generating sales summaries and report insights when given data
- Any general question the user has

Always be warm, friendly, and encouraging. Speak like a knowledgeable, helpful friend. Keep responses concise and practical.
${context ? `\nCurrent context:\n${context}` : ''}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.slice(-10),
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ reply })
}
```

### AI Report Generation (`app/api/ai/generate-report/route.ts`)

```ts
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bakeryName, period, ordersData } = await req.json()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Generate a professional sales summary for bakery: ${bakeryName}, Period: ${period}, Data: ${JSON.stringify(ordersData)}

Return JSON ONLY — no markdown, no extra text:
{
  "summary": { "totalOrders": number, "totalRevenue": number, "averageOrderValue": number, "completedOrders": number, "cancelledOrders": number },
  "topItems": [{ "name": string, "count": number, "revenue": number }],
  "paymentMethods": [{ "method": string, "count": number, "total": number }],
  "highlights": [string],
  "recommendations": [string]
}`
    }]
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const report = JSON.parse(text)
    return NextResponse.json({ report })
  } catch {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
```

### Payment Confirmation (`app/api/payments/confirm/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paymentId, orderId } = await req.json()

  await supabase.from('payments').update({
    status: 'confirmed',
    confirmed_by: user.id,
    confirmed_at: new Date().toISOString(),
  }).eq('id', paymentId)

  const { data: order } = await supabase
    .from('orders')
    .select('client_id, order_number')
    .eq('id', orderId)
    .single()

  if (order) {
    await supabase.from('notifications').insert({
      user_id: order.client_id,
      title: 'Payment Confirmed',
      body: `Your payment for order ${order.order_number} has been confirmed.`,
      link: `/dashboard/orders/${orderId}`,
    })
  }

  return NextResponse.json({ success: true })
}
```

### Order Status Update (`app/api/orders/status/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types'

const NOTIFS: Record<OrderStatus, { title: string; body: (n: string) => string }> = {
  confirmed:   { title: '🎂 Order Confirmed!',     body: n => `Order ${n} confirmed by your baker.` },
  in_progress: { title: '👩‍🍳 Baking has started!',  body: n => `Your baker has started on order ${n}.` },
  ready:       { title: '✅ Your order is ready!',  body: n => `Order ${n} is ready for collection.` },
  collected:   { title: '🎉 Order complete!',       body: n => `Order ${n} collected. Enjoy!` },
  cancelled:   { title: 'Order Cancelled',          body: n => `Order ${n} has been cancelled.` },
  pending:     { title: 'Order Received',           body: n => `Order ${n} received.` },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, status, pickupTime, cancellationReason } = await req.json()

  const updateData: Record<string, unknown> = { status }
  if (pickupTime) updateData.pickup_time = pickupTime
  if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString()
  if (status === 'ready') updateData.ready_at = new Date().toISOString()
  if (status === 'collected') updateData.collected_at = new Date().toISOString()
  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
    updateData.cancellation_reason = cancellationReason
  }

  const { data: order, error } = await supabase
    .from('orders').update(updateData).eq('id', orderId)
    .select('client_id, order_number').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (order) {
    const notif = NOTIFS[status as OrderStatus]
    await supabase.from('notifications').insert({
      user_id: order.client_id,
      title: notif.title,
      body: notif.body(order.order_number),
      link: `/dashboard/orders/${orderId}`,
    })
  }

  return NextResponse.json({ success: true })
}
```

### Scaffold Mobile Money Routes

Create these three files — same content, different paths:
- `app/api/payments/airtel/route.ts`
- `app/api/payments/mtn/route.ts`
- `app/api/payments/zamtel/route.ts`

```ts
import { NextResponse } from 'next/server'
// TODO: Implement when API keys are available
export async function POST() {
  return NextResponse.json(
    { message: 'API integration pending. Use manual confirmation flow.' },
    { status: 501 }
  )
}
```

---

## PHASE 7 — EMAIL HELPER

Create `lib/email.ts`:

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBakeryApprovedEmail(to: string, bakeryName: string, slug: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `🎂 Welcome to Zuki! ${bakeryName} is now live.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E07A93;">You're approved! 🎉</h1>
        <p>Welcome to Zuki, <strong>${bakeryName}</strong>! Your bakery is now live on the platform.</p>
        <p>Your public storefront:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/bakery/${slug}"
          style="display: inline-block; padding: 12px 24px; background: #F4A7B9; color: white; border-radius: 12px; text-decoration: none; margin: 8px 0;">
          View Your Storefront
        </a>
        <p>Log in to complete your menu and start taking orders.</p>
        <p style="color: #8A8A8A; font-size: 14px;">— The Zuki Team</p>
      </div>
    `,
  })
}

export async function sendOrderStatusEmail(to: string, orderNumber: string, status: string, bakerName: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Order ${orderNumber} update — ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D2D2D;">Your order has been updated</h2>
        <p>Order <strong>${orderNumber}</strong> from <strong>${bakerName}</strong> is now: <strong>${status}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
          style="display: inline-block; padding: 12px 24px; background: #F4A7B9; color: white; border-radius: 12px; text-decoration: none;">
          View Order
        </a>
      </div>
    `,
  })
}
```

---

## PHASE 8 — PAGES BUILD ORDER

Build pages in this exact sequence to avoid dependency issues:

### 8.1 Auth Pages
- `/sign-up` — role selector (Client / Baker), full name, email, phone, password. On submit: create auth user + insert profile. Baker → `/baker/onboarding`. Client → `/dashboard`.
- `/sign-in` — email + password. On success: check role, redirect to correct dashboard or `/baker/pending`.

### 8.2 Baker Onboarding (`/baker/onboarding`)
3-step form:
1. Bakery name, description, logo, cover photo
2. Deposit %, notice hours, rush orders, delivery option, WhatsApp, refund policy
3. Payment methods and account details

On submit: insert bakery (status: `pending`), redirect to `/baker/pending`, email admin.

### 8.3 Baker Pending Screen (`/baker/pending`)
Friendly locked screen shown until admin approves. Warm message, sign out button, no access to other features.

### 8.4 Admin Panel
- `/admin` — platform stats + pending bakeries alert
- `/admin/bakeries` — table with filter tabs: All / Pending / Approved / Suspended
- `/admin/bakeries/[id]` — full detail, Approve / Suspend buttons, sends email on approval

### 8.5 Landing Page (`/`)
Full marketing page — see CLAUDE.md Section 7.1 for all sections. Use Framer Motion `whileInView` on every section. Blobs, gradient mesh on hero, asymmetric layouts, strong Playfair Display headlines.

### 8.6 Browse Bakeries (`/bakeries`)
Search + grid of approved bakery cards. Each card: cover, logo, name + VerifiedBadge, rating, CTA.

### 8.7 Bakery Storefront (`/bakery/[slug]`)
Hero, about, menu grid, reviews with baker replies, order CTAs.

### 8.8 Menu Management (`/baker/menu`)
CRUD for menu items. Each item has: name, description, base price, and editable option lists for flavor/filling/frosting/size/tiers.

### 8.9 Order Placement (`/bakery/[slug]/order`)
3-step form: Customise → Delivery & Date → Review & Pay. See CLAUDE.md Section 7.3 for full spec.

### 8.10 Client Dashboard
- `/dashboard` — active orders with stepper
- `/dashboard/orders/[id]` — order detail, WhatsApp button, in-app chat, payment status
- `/dashboard/history` — past orders, leave review prompt

### 8.11 Baker Order Management
- `/baker/orders` — kanban + list view toggle
- `/baker/orders/[id]` — full detail, status updates, payment confirmation, chat, PDF receipt

### 8.12 Baker Settings Pages
- `/baker/storefront` — edit bakery profile
- `/baker/availability` — calendar + blocked dates + max per day
- `/baker/settings` — all business settings

### 8.13 Baker Analytics Dashboard (`/baker`)
Stats cards + Recharts charts: orders by day (Line), revenue by week (Bar), popular items (horizontal Bar), status breakdown (Pie/Donut).

### 8.14 Baker Reports (`/baker/reports`)
Date range selector → calls `/api/ai/generate-report` → renders PDF via `@react-pdf/renderer` → download. Individual order receipts list.

### 8.15 Reviews
After status reaches `collected`, client sees "Leave a Review" in their order history. Baker can reply from their order detail view. Both shown on public storefront.

---

## PHASE 9 — REAL-TIME CHAT

### OrderChat (`components/chat/OrderChat.tsx`)

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'

export function OrderChat({ orderId, currentUserId }: { orderId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('messages').select('*').eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data) })

    const channel = supabase.channel(`chat-${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `order_id=eq.${orderId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim()) return
    await supabase.from('messages').insert({ order_id: orderId, sender_id: currentUserId, content: input.trim() })
    setInput('')
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-2xl border border-zuki-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
              msg.sender_id === currentUserId
                ? 'bg-zuki-pink text-white rounded-br-sm'
                : 'bg-zuki-cream border border-zuki-border text-zuki-charcoal rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-zuki-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message..."
          className="flex-1 px-4 py-2 rounded-2xl border border-zuki-border bg-zuki-cream text-sm focus:outline-none focus:ring-2 focus:ring-zuki-pink/30"
        />
        <button onClick={send} className="px-4 py-2 bg-zuki-pink text-white rounded-2xl text-sm font-medium hover:bg-zuki-pink-deep transition-colors">
          Send
        </button>
      </div>
    </div>
  )
}
```

### WhatsAppRedirect (`components/chat/WhatsAppRedirect.tsx`)

```tsx
import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export function WhatsAppRedirect({ whatsappNumber, orderNumber }: { whatsappNumber: string; orderNumber: string }) {
  const link = getWhatsAppLink(whatsappNumber, `Hi! I'm following up on my Zuki order ${orderNumber}.`)
  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity w-fit">
      <MessageCircle className="w-4 h-4" />
      Continue on WhatsApp
    </a>
  )
}
```

---

## PHASE 10 — NOTIFICATION BELL

Create `components/layout/NotificationBell.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/types'

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    supabase.from('notifications').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setNotifications(data) })

    const channel = supabase.channel(`notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => { setNotifications(prev => [payload.new as Notification, ...prev]) })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function markRead(id: string, link?: string | null) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    if (link) { setOpen(false); router.push(link) }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-2xl hover:bg-zuki-cream transition-colors">
        <Bell className="w-5 h-5 text-zuki-charcoal" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-zuki-pink rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-zuki-lg border border-zuki-border z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zuki-border">
            <p className="font-display font-semibold text-sm">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0
              ? <p className="text-center text-zuki-muted text-sm py-8">No notifications yet</p>
              : notifications.map(n => (
                <button key={n.id} onClick={() => markRead(n.id, n.link)}
                  className={`w-full text-left px-4 py-3 hover:bg-zuki-cream transition-colors border-b border-zuki-border last:border-0 ${!n.is_read ? 'bg-zuki-pink/5' : ''}`}>
                  <p className={`text-sm font-medium ${!n.is_read ? 'text-zuki-charcoal' : 'text-zuki-muted'}`}>{n.title}</p>
                  <p className="text-xs text-zuki-muted mt-0.5 line-clamp-2">{n.body}</p>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## PHASE 11 — VERCEL DEPLOYMENT

### Step 11.1 — Pre-flight Check

```bash
npm run build
# Fix every TypeScript error before proceeding
```

### Step 11.2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Zuki commit"
git branch -M main
git remote add origin https://github.com/yourusername/zuki.git
git push -u origin main
```

### Step 11.3 — Deploy

```bash
vercel
```

Or: [vercel.com](https://vercel.com) → Import Project → select GitHub repo.

### Step 11.4 — Environment Variables on Vercel

Dashboard → Project → Settings → Environment Variables.

Add every variable from `.env.local`. Set for Production, Preview, and Development.

Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL: `https://zuki.vercel.app`

### Step 11.5 — Update Supabase Auth Settings

Supabase → Authentication → URL Configuration:
- Site URL: `https://zuki.vercel.app`
- Redirect URLs: add `https://zuki.vercel.app/auth/callback`

### Step 11.6 — Custom Domain

Vercel → Project → Domains → Add your domain. Follow DNS instructions.

---

## PHASE 12 — PRE-LAUNCH CHECKLIST

Go through every item before going live:

**Design**
- [ ] Playfair Display + DM Sans loading correctly everywhere
- [ ] Brand colors consistent across all pages — no cold white, always cream
- [ ] Framer Motion scroll animations on all landing/marketing sections
- [ ] Hover states on all buttons, cards, and interactive elements
- [ ] Skeleton loaders on every data-fetching component
- [ ] Empty states are beautiful — never broken or plain
- [ ] Verified badge showing next to all approved baker names
- [ ] Mobile layout at 375px, 390px, 430px
- [ ] Baker sidebar → bottom tab bar on mobile
- [ ] AI bubble → full-screen panel on mobile

**Auth & Access**
- [ ] Sign up works for both client and baker roles
- [ ] Sign in redirects correctly per role
- [ ] Baker sees pending screen until approved — cannot access any features
- [ ] Admin protected — only ADMIN_EMAIL can access `/admin`
- [ ] Sign out works from all dashboards

**Core Flows**
- [ ] Baker onboarding completes and sets status to pending
- [ ] Admin approval sends welcome email and unlocks baker dashboard
- [ ] Order form submits correctly — all fields saved to DB
- [ ] Order number generates as `ZUKI-0001` format
- [ ] Date picker blocks unavailable dates and enforces min notice
- [ ] Payment reference submission works
- [ ] Baker can confirm payment — client gets notification
- [ ] Order status updates correctly through all 5 stages
- [ ] Client gets in-app notification on every status change
- [ ] Notification bell updates in real time
- [ ] Real-time chat works between baker and client
- [ ] WhatsApp redirect opens correct link with pre-filled message
- [ ] AI bubble responds correctly for both roles
- [ ] AI has order context when opened from order detail page
- [ ] Baker can generate and download PDF sales report
- [ ] Review submission works after collected status
- [ ] Baker can reply to review — reply shows on storefront
- [ ] Browse Bakeries shows all approved bakeries with verified badge

**Data Security**
- [ ] Clients cannot see other clients' orders
- [ ] Bakers cannot see other bakeries' orders
- [ ] Payment details only visible to order participants
- [ ] Admin-only routes fully protected

**Performance**
- [ ] Lighthouse Performance score 90+
- [ ] All images using Next.js `<Image>` with lazy loading
- [ ] No `select *` queries anywhere in production code
- [ ] `npm run build` completes with zero errors and zero warnings

---

_Built with 🩷 for Zambian bakers. Zuki — Every cake, perfectly placed._

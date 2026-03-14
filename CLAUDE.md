# 🎂 ZUKI — Bakery Order Management Platform
> CLAUDE.md — Full Project Specification, Design Laws & Build Instructions

---

## 1. WHAT IS ZUKI?

Zuki is a warm, cozy **multi-tenant bakery order management platform** built for the Zambian market. It connects bakers with their clients in a friendly, professional environment where:

- Clients browse a bakery's storefront, build a custom cake order, and pay via local mobile money or bank transfer
- Bakers manage every order from placement to collection with full control over pricing, availability, and delivery
- A Claude-powered AI assistant floats on every page to help with baking questions, order queries, and document generation
- Platform admins approve new bakery signups and oversee the ecosystem

**Tagline:** _Every cake, perfectly placed._
**Market:** Zambia 🇿🇲
**Currency:** ZMW (Zambian Kwacha) only
**Brand:** Warm & cozy — White (#FFFAF8) + Pink (#F4A7B9) + Blue accent (#5B8DEF)

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + magic link) |
| File Storage | Supabase Storage (PDFs only — no image uploads in v1) |
| Backend | Next.js API Routes (Vercel Serverless Functions) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| PDF Generation | `@react-pdf/renderer` |
| Deployment | Vercel (frontend + API) + Supabase (DB + storage) |
| Email | Resend (transactional emails) |

---

## 3. DESIGN LAWS — NON-NEGOTIABLE

> These rules apply to every single page, component, and interaction. Never violate them. When in doubt, refer back here.

### LAW 1 — TYPOGRAPHY (Biggest impact, most ignored)
- **Display/Headline font:** `Playfair Display` or `Cormorant Garamond` — elegant, warm, editorial. Used for all headings, hero text, and brand moments.
- **Body font:** `DM Sans` or `Nunito` — clean, friendly, highly readable at small sizes.
- **Never use:** Arial, Inter, Roboto, system-ui, or any generic sans-serif as a headline font.
- Font sizes must create strong hierarchy. Hero headings: `5xl–7xl`. Section headings: `3xl–4xl`. Body: `base–lg`.
- Letter-spacing on headings: slightly wide (`tracking-wide`). Body: default.

### LAW 2 — MOTION & MICRO-INTERACTIONS
- Every page must have **scroll-triggered fade-ins** using Framer Motion (`whileInView`, `initial: { opacity: 0, y: 30 }`, `animate: { opacity: 1, y: 0 }`).
- Buttons: subtle scale on hover (`hover:scale-105`), smooth color transitions (`transition-all duration-300`).
- Page transitions: fade between routes using Framer Motion `AnimatePresence`.
- Cards: lift on hover with shadow deepening (`hover:shadow-xl hover:-translate-y-1`).
- Order status steps: animated progress indicator, not static badges.
- Loading states: skeleton loaders that pulse — never raw spinners.
- The site must feel **alive**. Static = cheap. Motion = premium.

### LAW 3 — COLOR WITH INTENTION
```
--zuki-cream:   #FFFAF8   (primary background — warm white, not cold white)
--zuki-pink:    #F4A7B9   (primary brand color — warm rose pink)
--zuki-pink-deep: #E07A93 (hover states, active elements)
--zuki-blue:    #5B8DEF   (accent — used sparingly for CTAs, links, highlights)
--zuki-blue-deep: #3A6FD8 (hover on blue elements)
--zuki-charcoal: #2D2D2D  (primary text)
--zuki-muted:   #8A8A8A   (secondary text, labels)
--zuki-border:  #F0E8E8   (soft borders, dividers)
--zuki-success: #6BCB8B   (confirmed, paid, ready states)
--zuki-warning: #F6C85F   (pending states)
--zuki-error:   #F47B7B   (cancelled, failed states)
```
- **Rule:** Pink dominates. Blue accents sparingly (max 2–3 elements per page). Cream breathes.
- Never use more than 3 colors on a single component.
- White space is a design element — use it generously.

### LAW 4 — SPATIAL COMPOSITION
- **Break the grid deliberately.** Not everything stacks in straight columns.
- Hero sections: overlapping elements, diagonal text placement, image breaking out of its container.
- Cards: slight rotation on hover (`hover:rotate-1`), staggered grid gaps.
- Sections alternate: full-bleed background → white → full-bleed pink tint.
- Use asymmetric layouts: text left-heavy one section, right-heavy the next.
- Generous padding: `py-24` minimum on section spacing. Never cramped.
- Decorative elements: soft circles, blobs, and dots in pink/blue at low opacity as background accents.

### LAW 5 — ATMOSPHERE & DEPTH
- The background is **never plain white.** Use `#FFFAF8` (warm cream) as the base.
- Hero sections: subtle gradient mesh — pink fading to cream, soft blue glow on one corner.
- Cards have: `bg-white`, soft `shadow-sm`, `rounded-2xl`, `border border-[#F0E8E8]`.
- On hover: shadow deepens to `shadow-lg`, slight lift.
- Decorative blobs: absolutely positioned `div`s with `blur-3xl opacity-20` in pink or blue behind hero sections and feature blocks.
- Textures: a very subtle noise texture overlay (CSS `filter: url(#noise)` or a tiny SVG pattern) on hero sections at ~3% opacity adds richness.
- Depth hierarchy: background (cream) → surface (white cards) → elevated (modals, dropdowns with deeper shadow).

### LAW 6 — PHOTOGRAPHY & IMAGERY
- Every bakery's storefront and cake listings **must prominently feature their uploaded images**.
- Image containers: always use `object-cover`, `rounded-2xl`, and a soft overlay gradient at the bottom for text legibility.
- Fallback illustrations: when no image is uploaded, use a beautiful SVG cake illustration placeholder — **never a grey box**.
- Inspo image uploads by clients: shown as polaroid-style thumbnails with a slight rotation in the order detail view.
- The hero of the Zuki landing page: use a high-quality stock image of a beautiful cake (sourced from Unsplash API or statically included).

### LAW 7 — PERFORMANCE
- All images: Next.js `<Image>` component with `lazy` loading, `sizes` prop set correctly.
- Code splitting: every route is its own chunk (Next.js App Router handles this by default).
- Fonts: loaded via `next/font` — never from a CDN link in `<head>`.
- No unnecessary npm packages. Audit before adding any dependency.
- Supabase queries: always select only the columns you need. Never `select *` in production queries.
- Skeleton loaders on every data-fetching component so the UI never looks broken while loading.

---

## 4. USER ROLES

### 4.1 Platform Admin (Zuki)
- Approves or rejects new bakery signups
- Can suspend/reactivate bakery accounts
- Views platform-wide stats: total bakeries, total orders, total revenue processed
- Single admin account (hardcoded or env-based email)

### 4.2 Baker
- Has a bakery profile/account — **fully locked until Zuki admin approves the account**
- Manages their public storefront (name, logo, description, photos)
- Adds WhatsApp number to profile — clients are redirected here from in-app chat for reference photos
- Creates and manages their cake menu (items with base price, customisation options)
- Can publicly reply to client reviews on their storefront
- Sets business settings:
  - Deposit % required (e.g. 50% upfront)
  - Minimum order notice (hours/days in advance)
  - Rush order option toggle + rush fee (ZMW)
  - Refund policy toggle + policy text (shown to clients before ordering)
  - Delivery options: pickup only / baker delivers / both
  - Delivery fee (if delivering)
  - Availability calendar (block off specific dates)
  - Max orders per day
  - Payment methods accepted (Airtel / MTN / Zamtel / Bank Transfer)
  - Bank/mobile money account details
- Receives and manages orders (full order lifecycle)
- Verifies payments by checking client's submitted transaction reference number
- Messages clients via in-app chat
- Generates PDF reports (sales summary, individual order receipts)
- Has a dashboard with analytics
- Is a full small business management system — not just an order inbox

### 4.3 Client
- Creates a personal account
- Browses bakery storefronts via the Browse Bakeries page or a direct bakery link
- Places orders directly from a bakery's storefront
- Describes cake in detail via text box + structured dropdowns (no image uploads in v1)
- Can tap a WhatsApp button inside the order chat to be redirected to the baker's WhatsApp for sharing reference photos
- Tracks order status in real time
- Messages their baker via in-app chat
- Enters transaction reference number as payment proof (no screenshot upload)
- Can see baker's refund policy before and after placing an order
- Leaves a star rating + review after order is collected
- Views their order history

---

## 5. DATABASE SCHEMA

```sql
-- PROFILES (extends Supabase auth.users)
profiles (
  id uuid references auth.users primary key,
  role text check (role in ('admin', 'baker', 'client')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
)

-- BAKERIES
bakeries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  slug text unique not null,           -- for public URL: zuki.com/bakery/slug
  description text,
  logo_url text,
  cover_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'suspended')),
  -- Business settings
  deposit_percent integer default 50,  -- % required upfront
  min_notice_hours integer default 48, -- minimum hours before pickup
  rush_order_enabled boolean default false,
  rush_fee_zmw numeric default 0,
  delivery_option text default 'pickup' check (delivery_option in ('pickup', 'delivery', 'both')),
  delivery_fee_zmw numeric default 0,
  max_orders_per_day integer default 10,
  -- Payment methods
  accepts_airtel boolean default true,
  accepts_mtn boolean default true,
  accepts_zamtel boolean default true,
  accepts_bank boolean default true,
  airtel_number text,
  mtn_number text,
  zamtel_number text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  whatsapp_number text,               -- baker's WhatsApp for client redirect
  refund_policy_enabled boolean default false,
  refund_policy_text text,             -- shown to clients before ordering
  created_at timestamptz default now()
)

-- BAKERY BLOCKED DATES
bakery_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  bakery_id uuid references bakeries(id),
  blocked_date date not null
)

-- MENU ITEMS
menu_items (
  id uuid primary key default gen_random_uuid(),
  bakery_id uuid references bakeries(id),
  name text not null,
  description text,
  base_price_zmw numeric not null,
  image_url text,
  is_available boolean default true,
  -- Customisation options stored as JSONB arrays
  flavor_options jsonb default '[]',    -- ["Vanilla", "Chocolate", "Red Velvet", ...]
  filling_options jsonb default '[]',   -- ["Buttercream", "Cream Cheese", ...]
  frosting_options jsonb default '[]',  -- ["Fondant", "Whipped Cream", ...]
  size_options jsonb default '[]',      -- ["6 inch", "8 inch", "10 inch", ...]
  tier_options jsonb default '[]',      -- ["1 tier", "2 tiers", "3 tiers"]
  created_at timestamptz default now()
)

-- ORDERS
orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,   -- human-readable: ZK-2024-0001
  bakery_id uuid references bakeries(id),
  client_id uuid references profiles(id),
  menu_item_id uuid references menu_items(id),
  -- Cake specs
  selected_flavor text,
  selected_filling text,
  selected_frosting text,
  selected_size text,
  selected_tiers text,
  custom_description text,             -- free text box
  special_instructions text,
  -- Occasion
  occasion text,                       -- "Birthday", "Wedding", "Anniversary", etc.
  dedication_message text,             -- "Happy Birthday Sarah!"
  -- Logistics
  pickup_or_delivery text check (pickup_or_delivery in ('pickup', 'delivery')),
  delivery_address text,
  requested_date date not null,
  pickup_time time,                    -- set by baker
  is_rush_order boolean default false,
  -- Pricing
  base_price_zmw numeric not null,
  rush_fee_zmw numeric default 0,
  delivery_fee_zmw numeric default 0,
  total_price_zmw numeric not null,
  deposit_amount_zmw numeric not null,
  balance_amount_zmw numeric not null,
  -- Status
  status text default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'ready', 'collected', 'cancelled')),
  -- Timestamps
  created_at timestamptz default now(),
  confirmed_at timestamptz,
  ready_at timestamptz,
  collected_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text
)

-- ORDER IMAGES (inspo/reference photos)
order_images (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  url text not null,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
)

-- PAYMENTS
payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  payment_type text check (payment_type in ('deposit', 'balance', 'full')),
  method text check (method in ('airtel', 'mtn', 'zamtel', 'bank_transfer')),
  amount_zmw numeric not null,
  status text default 'pending' check (status in ('pending', 'proof_submitted', 'confirmed', 'failed')),
  -- Manual confirmation flow (no image upload — reference number only)
  transaction_reference text,          -- client enters ref number from mobile money
  confirmed_by uuid references profiles(id),
  confirmed_at timestamptz,
  -- For future API integration
  gateway_transaction_id text,
  gateway_response jsonb,
  created_at timestamptz default now()
)

-- MESSAGES (in-app chat per order)
messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  sender_id uuid references profiles(id),
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
)

-- REVIEWS
reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) unique,
  bakery_id uuid references bakeries(id),
  client_id uuid references profiles(id),
  rating integer check (rating between 1 and 5),
  comment text,
  baker_reply text,                    -- baker's public reply shown on storefront
  baker_replied_at timestamptz,
  created_at timestamptz default now()
)

-- AI CHAT SESSIONS (per user, persisted)
ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  messages jsonb default '[]',         -- array of {role, content} objects
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

---

## 6. APPLICATION ROUTES & PAGES

### Public Routes
```
/                          → Zuki landing page (marketing)
/bakeries                  → Browse all approved bakeries
/sign-up                   → Client or Baker registration
/sign-in                   → Login
/bakery/[slug]             → Public bakery storefront
/bakery/[slug]/order       → Order placement page
```

### Client Dashboard (`/dashboard/...`)
```
/dashboard                 → My orders overview
/dashboard/orders/[id]     → Order detail + chat + payment
/dashboard/history         → Past orders + leave review
/dashboard/profile         → Edit profile
```

### Baker Dashboard (`/baker/...`)
```
/baker                     → Analytics dashboard
/baker/orders              → Order management (Kanban + list view)
/baker/orders/[id]         → Order detail + chat + set pickup time + update status
/baker/menu                → Manage cake menu items
/baker/storefront          → Edit public storefront
/baker/availability        → Calendar + blocked dates + max per day
/baker/settings            → Business settings (deposit %, payments, delivery, rush orders)
/baker/reports             → Generate PDF reports
```

### Admin (`/admin/...`)
```
/admin                     → Platform overview stats
/admin/bakeries            → All bakeries (filter: pending / approved / suspended)
/admin/bakeries/[id]       → Bakery detail + approve/suspend action
```

---

## 7. KEY FEATURES — DETAILED SPECS

### 7.1 Bakery Storefront (Public)
- Hero: bakery cover photo, logo overlaid, bakery name in Playfair Display
- "About" section with baker's description
- Menu grid: cake cards with photo, name, starting price ("From K350")
- Reviews section: star rating average + individual reviews
- "Order Now" CTA on each cake card → goes to order form
- Shareable URL: `zuki.vercel.app/bakery/[slug]`

### 7.3 Order Placement Flow
**Step 1 — Cake Customisation:**
- Dropdown selectors: Flavor, Filling, Frosting, Size, Tiers (all set by baker in their menu)
- Free text box: "Describe your cake" (design requests, additional details)
- Occasion selector: Birthday / Wedding / Anniversary / Baby Shower / Corporate / Other
- Dedication message field: "What should it say on the cake?"
- Special instructions (allergies, dietary requirements)
- **No image uploads** — client describes everything in text. WhatsApp redirect available in chat after order is placed.

**Step 2 — Delivery & Date:**
- Pickup or Delivery toggle (based on baker's settings)
- If delivery: address field + delivery fee shown
- Date picker (blocks out baker's unavailable dates, enforces min notice)
- Rush order toggle (if baker has enabled it) — shows rush fee
- Baker's refund policy shown here if enabled

**Step 3 — Order Summary & Payment:**
- Full price breakdown: base + rush fee + delivery fee = total
- Deposit amount shown prominently
- Payment method selector: Airtel Money / MTN MoMo / Zamtel / Bank Transfer
- Payment instructions shown for selected method (number/account details from baker's profile)
- Client enters their **transaction reference number** only — no screenshot upload
- Submit order → status becomes "Pending"

### 7.3 Order Lifecycle & Status
```
PENDING        → Order submitted, awaiting baker confirmation + payment verification
CONFIRMED      → Baker confirms order + deposit payment verified
IN_PROGRESS    → Baker has started making the cake
READY          → Cake is ready for pickup/delivery
COLLECTED      → Order complete
CANCELLED      → Cancelled by baker or client (with reason)
```
- Status displayed as a **beautiful animated progress stepper** in both baker and client views
- Baker triggers each transition manually (except Pending → comes from client)
- Baker sets the **pickup time** when confirming the order
- Client receives **in-app notification + email** at each status change

### 7.4 Payment System (Manual Confirmation Flow)
> Designed to integrate with Airtel/MTN/Zamtel APIs when API keys are available.

**Client side:**
1. Selects payment method
2. Sees the bakery's payment details (e.g. "Send to Airtel: 0971 234 567, Account Name: Lulu's Cakes")
3. Makes payment on their phone
4. Returns to app, enters **transaction reference number** from their mobile money confirmation SMS
5. Submits — payment status: "Proof Submitted"

**Baker side:**
1. Sees the transaction reference number in the order detail
2. Manually checks it against their mobile money statement
3. Clicks "Confirm Payment" → payment status: "Confirmed"
4. Order status can then move to "Confirmed"

**Future API integration:**
- API routes `/api/payments/airtel`, `/api/payments/mtn`, `/api/payments/zamtel` are scaffolded
- When API keys are provided, swap manual flow for automated push payment + callback webhook in `lib/payments.ts`

### 7.5 In-App Messaging + WhatsApp Redirect
- Per-order chat between baker and client
- Real-time with Supabase Realtime subscriptions
- Baker sees unread message count badge on order cards
- Client sees unread count on their order
- Simple, clean chat UI: bubbles, timestamps, read receipts
- **WhatsApp button** pinned at the top of every order chat — opens `https://wa.me/{baker_whatsapp_number}` in a new tab. Label: "Continue on WhatsApp" — used for sharing reference photos, voice notes, or anything outside the app
- Baker sets their WhatsApp number in their profile settings

### 7.6 Claude AI Assistant
**Placement:** Floating chat bubble — bottom-right corner on every page. Expands to a chat panel (400px wide, 600px tall) on click.

**System prompt context injected per user role:**

For **bakers:**
```
You are Zuki AI, a friendly assistant built into the Zuki bakery platform.
You help bakers with:
- Baking questions (recipes, techniques, ingredient substitutions, troubleshooting)
- Business questions (pricing, how to use the platform, order management)
- Generating summaries when asked (you will receive order/sales data as context)
- Any general question the baker has
Always be warm, friendly, and encouraging. Speak like a knowledgeable baking friend.
Current baker context: {bakerName}, {totalOrdersThisMonth}, {revenueThisMonth}
```

For **clients:**
```
You are Zuki AI, a friendly assistant on the Zuki bakery platform.
You help clients with:
- Understanding cake options (flavors, fillings, frostings, sizes)
- Baking and cake questions
- Questions about their orders
- Any general question they have
Always be warm, friendly, and fun. You love cakes and celebrations.
Current order context (if viewing an order): {orderDetails}
```

**PDF Generation via AI:**
- Baker clicks "Generate Sales Summary" in Reports page
- Selects date range
- App fetches order data from Supabase
- Sends data to Claude with prompt: "Generate a professional sales summary for a bakery named {name} for {period}. Data: {JSON}. Return structured data for PDF generation."
- Claude returns structured summary
- `@react-pdf/renderer` generates and downloads the PDF

**AI capabilities:**
- Baking Q&A (techniques, recipes, substitutions, troubleshooting)
- Order-specific questions (client can ask about their current order)
- Sales summaries and business insights for bakers
- General knowledge — anything the user asks
- Platform how-to questions

### 7.7 Baker Analytics Dashboard
**Cards (top row):**
- Total orders this month
- Revenue this month (ZMW)
- Pending orders (action needed)
- Average rating

**Charts:**
- Orders by day (last 30 days) — line chart
- Revenue by week (last 3 months) — bar chart
- Most popular menu items — horizontal bar chart
- Order status breakdown — donut chart

**Order Management:**
- Kanban view: columns for each status (Pending / Confirmed / In Progress / Ready)
- List view: sortable table with filters (date, status, client name)
- Quick actions on each card: update status, view detail, message client

### 7.8 PDF Reports (Baker Only)
Generated via `@react-pdf/renderer` on the server:

**1. Sales Summary Report:**
- Date range selector
- Total orders, total revenue, average order value
- Breakdown by payment method
- Top 5 cake items ordered
- Order list table (order number, client, item, amount, date, status)
- Zuki + bakery branding

**2. Individual Order Receipt:**
- Order number and date
- Client details
- Cake specifications
- Price breakdown
- Payment status
- Baker's contact details

### 7.9 Reviews & Baker Replies
- Triggered after order reaches "Collected" status
- Client sees "Leave a Review" prompt in their order history
- 1–5 star rating + optional comment
- Displayed publicly on bakery storefront
- **Baker can post a public reply** to any review — shown below the client's review on the storefront (Google Reviews style)
- Baker cannot delete reviews (platform integrity)
- Average rating shown on storefront and baker dashboard

### 7.10 Admin Panel
- Simple, functional (no need to be fancy — internal tool)
- Table of all bakeries with status badge
- Filter by: Pending / Approved / Suspended
- Bakery detail: owner info, signup date, total orders, total revenue
- Action buttons: Approve ✓ / Suspend ✗ / Reactivate
- Email sent to baker on approval: "Welcome to Zuki! Your bakery is now live."
- Platform stats: total bakeries, total orders, total revenue processed

---

## 8. COMPONENT LIBRARY — DESIGN TOKENS

```tsx
// tailwind.config.ts additions
colors: {
  zuki: {
    cream: '#FFFAF8',
    pink: '#F4A7B9',
    'pink-deep': '#E07A93',
    blue: '#5B8DEF',
    'blue-deep': '#3A6FD8',
    charcoal: '#2D2D2D',
    muted: '#8A8A8A',
    border: '#F0E8E8',
    success: '#6BCB8B',
    warning: '#F6C85F',
    error: '#F47B7B',
  }
}

fontFamily: {
  display: ['Playfair Display', 'serif'],
  body: ['DM Sans', 'sans-serif'],
}
```

**Reusable components to build:**
- `<ZukiButton>` — pink primary, blue secondary, ghost variant. Scale on hover, smooth transition.
- `<ZukiCard>` — white, rounded-2xl, soft shadow, lifts on hover
- `<ZukiBadge>` — status badges with color per status
- `<ZukiInput>` — custom styled, pink focus ring
- `<ZukiSelect>` — custom dropdown with pink accent
- `<ZukiStepper>` — animated order status progress stepper
- `<ZukiAvatar>` — user/bakery avatar with fallback initials
- `<ZukiSkeleton>` — pulse loading states
- `<AIBubble>` — floating Claude chat button + panel

---

## 9. ANIMATIONS SPEC

```tsx
// Framer Motion defaults to use consistently

// Page entrance
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// Scroll-triggered section reveal
const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
}

// Staggered card grid
const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } }
}

// Card lift
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }
}

// Status step transition
const stepVariants = {
  inactive: { scale: 0.95, opacity: 0.5 },
  active: { scale: 1.05, opacity: 1 },
  complete: { scale: 1, opacity: 1 }
}
```

---

## 10. ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Resend (email)
RESEND_API_KEY=

# Admin
ADMIN_EMAIL=

# App
NEXT_PUBLIC_APP_URL=https://zuki.vercel.app

# Mobile Money (scaffold now, fill when API access obtained)
AIRTEL_MONEY_API_KEY=
AIRTEL_MONEY_API_SECRET=
AIRTEL_MONEY_BASE_URL=

MTN_MOMO_API_KEY=
MTN_MOMO_API_SECRET=
MTN_MOMO_SUBSCRIPTION_KEY=
MTN_MOMO_BASE_URL=

ZAMTEL_API_KEY=
ZAMTEL_API_SECRET=
ZAMTEL_BASE_URL=
```

---

## 11. PROJECT STRUCTURE

```
zuki/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing page
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── bakery/[slug]/
│   │       ├── page.tsx                # Public storefront
│   │       └── order/page.tsx          # Order placement
│   ├── (client)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── orders/[id]/page.tsx
│   │       ├── history/page.tsx
│   │       └── profile/page.tsx
│   ├── (baker)/
│   │   └── baker/
│   │       ├── page.tsx                # Analytics dashboard
│   │       ├── orders/
│   │       │   ├── page.tsx            # Order management
│   │       │   └── [id]/page.tsx
│   │       ├── menu/page.tsx
│   │       ├── storefront/page.tsx
│   │       ├── availability/page.tsx
│   │       ├── settings/page.tsx
│   │       └── reports/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx
│   │       └── bakeries/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   └── api/
│       ├── ai/chat/route.ts            # Claude chat endpoint
│       ├── ai/generate-report/route.ts # AI PDF generation
│       ├── payments/
│       │   ├── confirm/route.ts        # Baker confirms payment
│       │   ├── airtel/route.ts         # (scaffolded)
│       │   ├── mtn/route.ts            # (scaffolded)
│       │   └── zamtel/route.ts         # (scaffolded)
│       ├── orders/route.ts
│       └── pdf/generate/route.ts
├── components/
│   ├── ui/                             # shadcn/ui base components
│   ├── zuki/                           # Zuki custom components
│   │   ├── ZukiButton.tsx
│   │   ├── ZukiCard.tsx
│   │   ├── ZukiBadge.tsx
│   │   ├── ZukiInput.tsx
│   │   ├── ZukiStepper.tsx
│   │   ├── ZukiSkeleton.tsx
│   │   └── AIBubble.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── BakerSidebar.tsx
│   │   ├── ClientNav.tsx
│   │   └── Footer.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── OrderStatusStepper.tsx
│   │   ├── OrderForm/
│   │   │   ├── Step1Customise.tsx
│   │   │   ├── Step2Delivery.tsx
│   │   │   └── Step3Payment.tsx
│   │   └── PaymentConfirmation.tsx
│   ├── chat/
│   │   ├── OrderChat.tsx
│   │   └── WhatsAppRedirect.tsx       # Button linking to baker's WhatsApp
│   ├── storefront/
│   │   ├── BakeryHero.tsx
│   │   ├── MenuGrid.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── ReviewReply.tsx            # Baker's public reply to a review
│   │   ├── CakeCard.tsx
│   │   └── VerifiedBadge.tsx          # Z-in-circle badge for approved bakers
│   └── dashboard/
│       ├── StatsCards.tsx
│       ├── RevenueChart.tsx
│       ├── OrdersKanban.tsx
│       └── PopularItemsChart.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── claude.ts                       # Anthropic client + helpers
│   ├── payments.ts                     # Payment logic
│   ├── pdf.ts                          # PDF generation helpers
│   ├── email.ts                        # Resend email helpers
│   └── utils.ts
├── hooks/
│   ├── useOrders.ts
│   ├── useChat.ts
│   ├── useAI.ts
│   └── useBakery.ts
├── types/
│   └── index.ts                        # All TypeScript types
├── CLAUDE.md                           # This file
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## 12. BUILD ORDER (for Claude Code)

Build in this order to avoid dependency issues:

1. **Setup:** Init Next.js, install dependencies, configure Tailwind with Zuki tokens, set up Supabase project + schema, configure env vars
2. **Auth:** Sign up / sign in pages, Supabase auth, role-based middleware, onboarding flow (baker vs client)
3. **Design system:** Build all `zuki/` components, set up Framer Motion, fonts, global styles
4. **Landing page:** Full marketing page for Zuki with beautiful design
5. **Baker onboarding:** Bakery profile creation form → pending approval state
6. **Admin panel:** Approve/reject bakeries
7. **Bakery storefront:** Public page at `/bakery/[slug]`
8. **Menu management:** Baker creates/edits cake menu items
9. **Order placement:** Full 4-step order form on storefront
10. **Payment flow:** Manual confirmation (proof upload + baker verify)
11. **Order management:** Baker kanban + order detail + status updates
12. **Client dashboard:** Order tracking + status stepper
13. **In-app messaging:** Real-time chat per order
14. **AI assistant:** Floating bubble + Claude API integration + context injection
15. **Availability:** Baker calendar + blocked dates
16. **Analytics dashboard:** Charts and stats for baker
17. **PDF reports:** Sales summary + order receipts
18. **Reviews:** Post-collection rating flow
19. **Notifications:** Email via Resend on status changes
20. **Polish:** Animations, micro-interactions, performance audit, mobile responsiveness

---

## 13. MOBILE RESPONSIVENESS

- Every page must be **fully responsive** — mobile first.
- Baker dashboard: sidebar collapses to bottom tab bar on mobile
- Order form: full-screen steps on mobile
- Chat: full-screen modal on mobile
- AI bubble: stays bottom-right, panel goes full-screen on mobile
- Tables: scroll horizontally or collapse to card view on mobile

---

## 14. SUPABASE ROW LEVEL SECURITY (RLS)

Enable RLS on all tables. Key policies:

- `bakeries`: owners can update their own. Admin can update all. Public can read approved ones.
- `orders`: clients can read their own. Bakers can read orders for their bakery. 
- `messages`: only order participants (client + baker) can read/write.
- `payments`: clients can insert proof. Bakers can confirm. Both can read their own.
- `reviews`: clients can insert (once per order). Public can read.
- `profiles`: users can update their own only.

---

## 15. FINAL NOTES FOR CLAUDE CODE

- **Always refer back to the Design Laws (Section 3)** before building any UI component or page.
- Every component should feel like it belongs to the Zuki brand.
- When in doubt on a design decision: **warmer, softer, more generous spacing**.
- The AI assistant is a **core feature** — not an afterthought. Make it delightful to use.
- The platform is for **Zambian bakers** — keep language friendly, warm, and local.
- Order numbers must be human-readable: **`ZUKI-0001`** format (sequential, padded to 4 digits).
- The Zuki logo is a **Z inside a thin pink circle** — clean, no fill inside the circle, charcoal Z stroke, pink ring. Used in navbar, favicon, loading screens, and the verified badge next to approved baker names.
- The **verified badge** next to baker names on the storefront and browse page is a small pink circle with a white Z inside — like a platform trust mark. Only approved bakeries show this.
- Always handle loading, empty, and error states gracefully with beautiful UI.
- Test RLS policies thoroughly — data privacy between bakers and clients is critical.
- No image uploads in v1 — clients describe cakes in text, WhatsApp handles photo sharing.
- When mobile money API keys are eventually provided, the payment routes are already scaffolded — just implement the API calls in `lib/payments.ts`.
- Bakers are locked out of all features until admin approves their account — show a clear, friendly "Your bakery is under review" screen.

---

_Built with 🩷 for Zambian bakers. Zuki — Every cake, perfectly placed._

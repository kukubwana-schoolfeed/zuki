'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { Star, ChefHat, Shield, MessageCircle, ArrowRight, Check } from 'lucide-react'

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
}

const transition = { duration: 0.6, ease: 'easeOut' as const }

const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zuki-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="blob w-96 h-96 bg-zuki-pink top-20 -right-20" />
        <div className="blob w-80 h-80 bg-zuki-blue top-40 -left-20" />
        <div className="blob w-64 h-64 bg-zuki-pink-deep bottom-20 right-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zuki-pink/10 text-zuki-pink-deep rounded-full text-sm font-medium mb-6"
            >
              🇿🇲 Zambia&apos;s Bakery Platform
            </motion.span>

            <h1 className="font-display text-6xl lg:text-7xl font-bold text-zuki-charcoal leading-tight mb-6">
              Every cake,{' '}
              <span className="text-gradient">perfectly</span>{' '}
              placed.
            </h1>

            <p className="text-zuki-muted text-xl leading-relaxed mb-10 max-w-lg">
              Order beautiful custom cakes from the best local bakers in Zambia. From birthdays to weddings — made with love, delivered with joy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/bakeries">
                <ZukiButton size="lg" className="w-full sm:w-auto">
                  Browse Bakeries
                  <ArrowRight className="w-5 h-5 ml-2" />
                </ZukiButton>
              </Link>
              <Link href="/sign-up?role=baker">
                <ZukiButton variant="ghost" size="lg" className="w-full sm:w-auto">
                  Join as a Baker
                </ZukiButton>
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {['L', 'A', 'M', 'C'].map((initial, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-zuki-pink flex items-center justify-center text-white text-sm font-bold border-2 border-white">
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-zuki-muted mt-0.5">Loved by 200+ clients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative"
          >
            {/* Cake illustration */}
            <div className="relative w-full aspect-square max-w-xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-zuki-pink/20 via-white to-zuki-blue/10 rounded-3xl" />
              <div className="absolute inset-4 bg-white rounded-2xl shadow-zuki flex items-center justify-center">
                <div className="text-center">
                  {/* Simple cake SVG illustration */}
                  <svg viewBox="0 0 240 240" className="w-48 h-48 mx-auto" fill="none">
                    {/* Plate */}
                    <ellipse cx="120" cy="210" rx="90" ry="12" fill="#F0E8E8" />
                    {/* Bottom tier */}
                    <rect x="50" y="160" width="140" height="50" rx="8" fill="#F4A7B9" />
                    <rect x="50" y="155" width="140" height="10" rx="4" fill="#E07A93" />
                    {/* Middle tier */}
                    <rect x="70" y="110" width="100" height="50" rx="8" fill="#FDDDE6" />
                    <rect x="70" y="105" width="100" height="10" rx="4" fill="#F4A7B9" />
                    {/* Top tier */}
                    <rect x="90" y="65" width="60" height="45" rx="8" fill="#F4A7B9" />
                    <rect x="90" y="60" width="60" height="10" rx="4" fill="#E07A93" />
                    {/* Decorations on bottom tier */}
                    <circle cx="75" cy="180" r="6" fill="#FFFAF8" />
                    <circle cx="95" cy="175" r="4" fill="#5B8DEF" />
                    <circle cx="115" cy="182" r="6" fill="#FFFAF8" />
                    <circle cx="135" cy="175" r="4" fill="#5B8DEF" />
                    <circle cx="155" cy="180" r="6" fill="#FFFAF8" />
                    <circle cx="175" cy="175" r="4" fill="#5B8DEF" />
                    {/* Decorations on middle tier */}
                    <circle cx="88" cy="130" r="5" fill="#FFFAF8" />
                    <circle cx="108" cy="125" r="3" fill="#E07A93" />
                    <circle cx="128" cy="130" r="5" fill="#FFFAF8" />
                    <circle cx="148" cy="125" r="3" fill="#E07A93" />
                    {/* Candles */}
                    <rect x="112" y="42" width="6" height="20" rx="3" fill="#F6C85F" />
                    <rect x="122" y="38" width="6" height="24" rx="3" fill="#F4A7B9" />
                    <rect x="132" y="44" width="6" height="18" rx="3" fill="#5B8DEF" />
                    {/* Flames */}
                    <ellipse cx="115" cy="40" rx="3" ry="4" fill="#F6C85F" />
                    <ellipse cx="125" cy="36" rx="3" ry="4" fill="#F47B7B" />
                    <ellipse cx="135" cy="42" rx="3" ry="4" fill="#F6C85F" />
                    {/* Stars */}
                    <text x="30" y="80" fontSize="16" fill="#F4A7B9" opacity="0.6">✦</text>
                    <text x="190" y="60" fontSize="12" fill="#5B8DEF" opacity="0.6">✦</text>
                    <text x="195" y="140" fontSize="10" fill="#F4A7B9" opacity="0.5">✦</text>
                    <text x="20" y="150" fontSize="14" fill="#5B8DEF" opacity="0.4">✦</text>
                  </svg>
                  <p className="font-display text-lg font-semibold text-zuki-charcoal mt-4">Your dream cake awaits</p>
                  <p className="text-zuki-muted text-sm">Freshly baked, just for you</p>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-8 top-1/3 bg-white rounded-2xl shadow-zuki p-3 border border-zuki-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zuki-success/20 rounded-xl flex items-center justify-center">
                    <Check className="w-4 h-4 text-zuki-success" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zuki-charcoal">Order Confirmed</p>
                    <p className="text-[10px] text-zuki-muted">ZUKI-0042</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-8 bottom-1/3 bg-white rounded-2xl shadow-zuki p-3 border border-zuki-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zuki-pink/20 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-zuki-pink fill-zuki-pink" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zuki-charcoal">5 Stars!</p>
                    <p className="text-[10px] text-zuki-muted">Amazing quality</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
            transition={transition}
            className="text-center mb-16"
          >
            <span className="text-zuki-pink text-sm font-medium tracking-wide uppercase mb-3 block">Simple process</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-zuki-charcoal mb-4">
              Order your perfect cake in minutes
            </h2>
            <p className="text-zuki-muted text-lg max-w-2xl mx-auto">
              From browsing to biting — our platform makes ordering custom cakes effortless.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'Browse Bakeries',
                desc: 'Explore approved local bakers, view their menus, and read real reviews from other cake lovers.',
              },
              {
                step: '02',
                icon: '🎂',
                title: 'Customise Your Order',
                desc: 'Choose flavours, sizes, frostings, and describe exactly what you want. Share ideas via WhatsApp too.',
              },
              {
                step: '03',
                icon: '✅',
                title: 'Pay & Collect',
                desc: 'Pay via Airtel Money, MTN MoMo, Zamtel, or bank transfer. Track your order in real time.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="relative"
              >
                <div className="bg-zuki-cream rounded-3xl p-8 h-full border border-zuki-border hover:border-zuki-pink hover:shadow-zuki transition-all duration-300">
                  <span className="text-5xl font-display font-bold text-zuki-pink/20 absolute top-6 right-8">{item.step}</span>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-display text-xl font-bold text-zuki-charcoal mb-3">{item.title}</h3>
                  <p className="text-zuki-muted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zuki-cream relative overflow-hidden">
        <div className="blob w-96 h-96 bg-zuki-pink left-0 top-20" />
        <div className="blob w-64 h-64 bg-zuki-blue right-10 bottom-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={sectionVariants}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            transition={transition}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-zuki-charcoal mb-4">
              Built for Zambian bakers
            </h2>
            <p className="text-zuki-muted text-lg max-w-2xl mx-auto">
              Everything you need to run a modern bakery business — from order management to mobile money payments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ChefHat, color: 'bg-zuki-pink/10 text-zuki-pink', title: 'Smart Order Management', desc: 'Kanban boards, status tracking, and automatic client notifications at every step.' },
              { icon: Shield, color: 'bg-zuki-blue/10 text-zuki-blue', title: 'Verified Bakeries Only', desc: 'Every baker on Zuki is manually verified by our team. Shop with confidence.' },
              { icon: MessageCircle, color: 'bg-green-100 text-green-600', title: 'WhatsApp Integration', desc: 'Share reference photos directly via WhatsApp — no upload limits, no fuss.' },
              { icon: Star, color: 'bg-yellow-100 text-yellow-600', title: 'Real Reviews', desc: 'Honest ratings from real clients. Bakers can reply publicly — full transparency.' },
              { icon: ({ className }: { className: string }) => <span className={`text-2xl ${className}`}>💳</span>, color: '', title: 'Mobile Money Payments', desc: 'Airtel Money, MTN MoMo, Zamtel Kwacha, and bank transfer — all supported.' },
              { icon: ({ className }: { className: string }) => <span className={`text-2xl ${className}`}>✨</span>, color: '', title: 'AI Baking Assistant', desc: 'Get baking tips, recipe ideas, and order help from Zuki AI — available 24/7.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-zuki-border hover:shadow-zuki hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-zuki-charcoal mb-2">{feature.title}</h3>
                <p className="text-zuki-muted text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Baker CTA */}
      <section className="py-24 bg-zuki-charcoal relative overflow-hidden">
        <div className="blob w-96 h-96 bg-zuki-pink right-0 top-0" style={{ opacity: 0.08 }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            variants={sectionVariants}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            transition={transition}
          >
            <span className="text-zuki-pink text-sm font-medium tracking-wide uppercase mb-4 block">For bakers</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to grow your bakery?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join Zuki and get your own professional storefront, order management tools, analytics dashboard, and a direct line to clients across Zambia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up?role=baker">
                <ZukiButton size="lg">
                  Start Your Bakery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </ZukiButton>
              </Link>
              <Link href="/bakeries">
                <ZukiButton variant="ghost" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                  Browse Bakeries
                </ZukiButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

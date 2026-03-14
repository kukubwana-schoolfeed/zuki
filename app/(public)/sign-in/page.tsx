'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'

function ZukiLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
      <path d="M10 10 L22 10 L10 22 L22 22" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      if (signInError.message.toLowerCase().includes('invalid login credentials') ||
          signInError.message.toLowerCase().includes('email not confirmed')) {
        setError('Invalid email or password. If you recently signed up, your account may still be pending admin approval — you\'ll receive an email once approved.')
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }

    if (data.user) {
      // Ensure profile exists with correct role (handles admin detection server-side)
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const { role } = await res.json()

      router.refresh()
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'baker') {
        const { data: bakery } = await supabase
          .from('bakeries')
          .select('status')
          .eq('owner_id', data.user.id)
          .single()
        if (!bakery) {
          router.push('/baker/onboarding')
        } else if (bakery.status === 'approved') {
          router.push('/baker')
        } else {
          router.push('/baker/pending')
        }
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-zuki-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob w-80 h-80 bg-zuki-pink -top-20 -right-20" />
      <div className="blob w-64 h-64 bg-zuki-blue -bottom-20 -left-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-3xl shadow-zuki-lg border border-zuki-border p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ZukiLogo />
            </div>
            <h1 className="font-display text-3xl font-bold text-zuki-charcoal">Welcome back</h1>
            <p className="text-zuki-muted mt-2">Sign in to your Zuki account</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zuki-charcoal mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zuki-charcoal mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-2xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink transition-all"
              />
            </div>
            <ZukiButton type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </ZukiButton>
          </form>

          <p className="text-center text-sm text-zuki-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-zuki-pink hover:text-zuki-pink-deep font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

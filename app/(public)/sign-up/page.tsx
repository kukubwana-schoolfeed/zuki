'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { ChefHat, User } from 'lucide-react'

function ZukiLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
      <path d="M10 10 L22 10 L10 22 L22 22" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function SignUpForm() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'baker' ? 'baker' : 'client'

  const [role, setRole] = useState<'client' | 'baker'>(initialRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, phone },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      // Email confirmation required — session won't exist until they verify
      setSuccess('Account created! Check your email to verify, then sign in.')
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      // Session exists (email confirmation disabled) — create profile server-side
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, role }),
      })
      const { role: assignedRole } = await res.json()

      router.refresh()
      if (assignedRole === 'admin') {
        router.push('/admin')
      } else if (assignedRole === 'baker') {
        router.push('/baker/onboarding')
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
            <h1 className="font-display text-3xl font-bold text-zuki-charcoal">Create your account</h1>
            <p className="text-zuki-muted mt-2">Join Zambia&apos;s bakery platform</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'client'
                  ? 'border-zuki-pink bg-zuki-pink/5'
                  : 'border-zuki-border hover:border-zuki-pink/50'
              }`}
            >
              <User className={`w-6 h-6 ${role === 'client' ? 'text-zuki-pink' : 'text-zuki-muted'}`} />
              <span className={`text-sm font-medium ${role === 'client' ? 'text-zuki-pink' : 'text-zuki-muted'}`}>
                I want to order cakes
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole('baker')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'baker'
                  ? 'border-zuki-pink bg-zuki-pink/5'
                  : 'border-zuki-border hover:border-zuki-pink/50'
              }`}
            >
              <ChefHat className={`w-6 h-6 ${role === 'baker' ? 'text-zuki-pink' : 'text-zuki-muted'}`} />
              <span className={`text-sm font-medium ${role === 'baker' ? 'text-zuki-pink' : 'text-zuki-muted'}`}>
                I&apos;m a baker
              </span>
            </button>
          </div>

          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zuki-charcoal mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-2xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink transition-all"
              />
            </div>
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
              <label className="block text-sm font-medium text-zuki-charcoal mb-2">
                Phone Number <span className="text-zuki-muted font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0971 234 567"
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
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-2xl border border-zuki-border bg-zuki-cream focus:outline-none focus:ring-2 focus:ring-zuki-pink/30 focus:border-zuki-pink transition-all"
              />
            </div>
            <ZukiButton type="submit" loading={loading} className="w-full mt-2">
              {role === 'baker' ? 'Create Baker Account' : 'Create Account'}
            </ZukiButton>
          </form>

          <p className="text-center text-sm text-zuki-muted mt-6">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-zuki-pink hover:text-zuki-pink-deep font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { Clock, Mail, CheckCircle } from 'lucide-react'

export default function BakerPendingPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-zuki-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob w-80 h-80 bg-zuki-pink -top-20 right-0" />
      <div className="blob w-64 h-64 bg-zuki-blue bottom-0 left-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative"
      >
        <div className="bg-white rounded-3xl shadow-zuki-lg border border-zuki-border p-8 text-center">
          <div className="w-20 h-20 bg-zuki-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-zuki-pink" />
          </div>

          <h1 className="font-display text-3xl font-bold text-zuki-charcoal mb-3">
            You&apos;re in the queue!
          </h1>
          <p className="text-zuki-muted text-lg mb-8 leading-relaxed">
            Your bakery application is being reviewed by the Zuki team. We&apos;ll be in touch within 24–48 hours.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { icon: CheckCircle, label: 'Application submitted', done: true },
              { icon: Mail, label: 'Review in progress', done: false },
              { icon: CheckCircle, label: 'Bakery goes live', done: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${item.done ? 'bg-zuki-success/10' : 'bg-zuki-cream'}`}>
                <item.icon className={`w-5 h-5 ${item.done ? 'text-zuki-success' : 'text-zuki-muted'}`} />
                <span className={`text-sm font-medium ${item.done ? 'text-zuki-charcoal' : 'text-zuki-muted'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-zuki-muted mb-6">
            You&apos;ll receive an email at your registered address when your bakery is approved.
          </p>

          <ZukiButton variant="ghost" onClick={handleSignOut} className="w-full">
            Sign Out
          </ZukiButton>
        </div>
      </motion.div>
    </div>
  )
}

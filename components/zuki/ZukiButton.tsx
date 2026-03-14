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
        {...(props as object)}
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

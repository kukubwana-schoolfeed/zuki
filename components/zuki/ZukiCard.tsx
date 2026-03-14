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

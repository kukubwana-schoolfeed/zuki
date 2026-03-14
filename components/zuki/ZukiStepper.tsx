'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ORDER_STATUS_STEPS } from '@/lib/utils'
import type { OrderStatus } from '@/types'

export function ZukiStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-2xl border border-red-200">
        <span className="w-2 h-2 rounded-full bg-zuki-error" />
        <span className="text-red-600 font-medium text-sm">Order Cancelled</span>
      </div>
    )
  }

  const steps = ORDER_STATUS_STEPS
  const currentIndex = steps.findIndex(s => s.key === status)

  return (
    <div className="flex items-start overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isActive = index === currentIndex
        const isLast = index === steps.length - 1

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${isComplete
                    ? 'bg-zuki-success border-zuki-success text-white'
                    : isActive
                    ? 'bg-zuki-pink border-zuki-pink text-white'
                    : 'bg-white border-zuki-border text-zuki-muted'}`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
              <span className={`text-[10px] font-medium whitespace-nowrap text-center
                ${isActive ? 'text-zuki-pink' : isComplete ? 'text-zuki-success' : 'text-zuki-muted'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-8 mx-1 mb-5 transition-all flex-shrink-0 ${isComplete ? 'bg-zuki-success' : 'bg-zuki-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

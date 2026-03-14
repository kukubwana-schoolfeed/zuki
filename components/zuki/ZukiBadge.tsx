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

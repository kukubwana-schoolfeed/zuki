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
      <ZukiSkeleton className="h-4 w-28" />
    </div>
  )
}

export function BakeryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
      <ZukiSkeleton className="h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <ZukiSkeleton className="h-6 w-3/4" />
        <ZukiSkeleton className="h-4 w-full" />
        <ZukiSkeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden">
      <ZukiSkeleton className="h-48 rounded-none" />
      <div className="p-4 space-y-2">
        <ZukiSkeleton className="h-5 w-3/4" />
        <ZukiSkeleton className="h-4 w-full" />
        <ZukiSkeleton className="h-6 w-24" />
      </div>
    </div>
  )
}

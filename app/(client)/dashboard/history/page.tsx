'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ZukiBadge } from '@/components/zuki/ZukiBadge'
import { ZukiButton } from '@/components/zuki/ZukiButton'
import { formatZMW } from '@/lib/utils'
import { format } from 'date-fns'
import { Star } from 'lucide-react'
import Link from 'next/link'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [reviews, setReviews] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState<{ orderId: string; bakeryId: string } | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('orders')
        .select('*, bakeries(name, slug), menu_items(name)')
        .eq('client_id', user.id)
        .in('status', ['collected', 'cancelled'])
        .order('created_at', { ascending: false })

      setOrders(data || [])

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('order_id')
        .eq('client_id', user.id)

      const reviewMap: Record<string, boolean> = {}
      reviewData?.forEach(r => { reviewMap[r.order_id] = true })
      setReviews(reviewMap)
      setLoading(false)
    }
    load()
  }, [supabase])

  async function submitReview() {
    if (!reviewForm) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('reviews').insert({
      order_id: reviewForm.orderId,
      bakery_id: reviewForm.bakeryId,
      client_id: user.id,
      rating,
      comment: comment.trim() || null,
    })

    setReviews(prev => ({ ...prev, [reviewForm.orderId]: true }))
    setReviewForm(null)
    setComment('')
    setRating(5)
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-zuki-muted">Loading history...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold text-zuki-charcoal mb-2">Order History</h1>
      <p className="text-zuki-muted mb-8">Your past orders and reviews</p>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-zuki-muted">No past orders yet</p>
          <Link href="/bakeries" className="text-zuki-pink hover:text-zuki-pink-deep text-sm font-medium mt-4 block">
            Browse bakeries →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-zuki-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-zuki-pink">{order.order_number}</p>
                  <h3 className="font-display font-bold text-zuki-charcoal">{order.bakeries?.name}</h3>
                  <p className="text-sm text-zuki-muted">{order.menu_items?.name}</p>
                </div>
                <ZukiBadge status={order.status} />
              </div>

              <div className="flex items-center justify-between text-sm pb-3 border-b border-zuki-border">
                <span className="text-zuki-muted">{format(new Date(order.requested_date), 'dd MMM yyyy')}</span>
                <span className="font-bold text-zuki-charcoal">{formatZMW(order.total_price_zmw)}</span>
              </div>

              {/* Review section */}
              {order.status === 'collected' && (
                <div className="mt-3">
                  {reviews[order.id] ? (
                    <p className="text-sm text-zuki-success flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Review submitted
                    </p>
                  ) : reviewForm?.orderId === order.id ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-zuki-charcoal mb-2">Your rating</p>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <button key={i} onClick={() => setRating(i)}>
                              <Star className={`w-6 h-6 transition-colors ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience (optional)"
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-zuki-border bg-zuki-cream text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zuki-pink/30"
                      />
                      <div className="flex gap-2">
                        <ZukiButton onClick={submitReview} loading={submitting} size="sm">Submit Review</ZukiButton>
                        <ZukiButton variant="ghost" size="sm" onClick={() => setReviewForm(null)}>Cancel</ZukiButton>
                      </div>
                    </div>
                  ) : (
                    <ZukiButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setReviewForm({ orderId: order.id, bakeryId: order.bakery_id })}
                    >
                      <Star className="w-4 h-4 mr-1" /> Leave a Review
                    </ZukiButton>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

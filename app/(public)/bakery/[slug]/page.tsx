import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VerifiedBadge } from '@/components/zuki/VerifiedBadge'
import { AIBubble } from '@/components/zuki/AIBubble'
import Image from 'next/image'
import { Star, MapPin, Clock, Truck } from 'lucide-react'
import { formatZMW } from '@/lib/utils'
import type { Bakery, MenuItem, Review } from '@/types'

interface PageProps {
  params: { slug: string }
}

async function getBakeryData(slug: string) {
  const supabase = await createClient()
  const { data: bakery } = await supabase
    .from('bakeries')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()
  if (!bakery) return null

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('bakery_id', bakery.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles:client_id(full_name, avatar_url)')
    .eq('bakery_id', bakery.id)
    .order('created_at', { ascending: false })

  return { bakery: bakery as Bakery, menuItems: menuItems || [], reviews: reviews || [] }
}

export default async function BakeryStorefront({ params }: PageProps) {
  const data = await getBakeryData(params.slug)
  if (!data) notFound()

  const { bakery, menuItems, reviews } = data
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-zuki-cream">
      <Navbar />

      {/* Hero */}
      <div className="pt-16">
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-zuki-pink/30 to-zuki-blue/20 flex items-center justify-center overflow-hidden">
          {bakery.cover_url ? (
            <Image src={bakery.cover_url} alt={bakery.name} fill className="object-cover" />
          ) : (
            <div className="text-8xl opacity-30">🎂</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-8 mb-8 flex items-end gap-5 relative">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-zuki-border shadow-zuki flex items-center justify-center overflow-hidden flex-shrink-0">
              {bakery.logo_url ? (
                <Image src={bakery.logo_url} alt={bakery.name} fill className="object-cover" />
              ) : (
                <span className="font-display font-bold text-3xl text-zuki-pink">{bakery.name.charAt(0)}</span>
              )}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-3xl font-bold text-zuki-charcoal">{bakery.name}</h1>
                <VerifiedBadge size={20} />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{avgRating}</span>
                    <span className="text-sm text-zuki-muted">({reviews.length} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-zuki-muted">
                  <MapPin className="w-3.5 h-3.5" /> Zambia
                </div>
                <div className="flex items-center gap-1 text-sm text-zuki-muted">
                  <Clock className="w-3.5 h-3.5" />
                  {bakery.min_notice_hours}h notice needed
                </div>
                {(bakery.delivery_option === 'delivery' || bakery.delivery_option === 'both') && (
                  <div className="flex items-center gap-1 text-sm text-zuki-muted">
                    <Truck className="w-3.5 h-3.5" /> Delivers
                  </div>
                )}
              </div>
            </div>
          </div>

          {bakery.description && (
            <div className="bg-white rounded-2xl border border-zuki-border p-6 mb-8">
              <h2 className="font-display font-bold text-lg text-zuki-charcoal mb-2">About</h2>
              <p className="text-zuki-muted leading-relaxed">{bakery.description}</p>
            </div>
          )}

          {/* Refund policy */}
          {bakery.refund_policy_enabled && bakery.refund_policy_text && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8">
              <h3 className="font-medium text-yellow-800 text-sm mb-1">Refund Policy</h3>
              <p className="text-yellow-700 text-sm">{bakery.refund_policy_text}</p>
            </div>
          )}

          {/* Menu */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-zuki-charcoal mb-6">Our Cakes</h2>
            {menuItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-zuki-border">
                <div className="text-4xl mb-3">🎂</div>
                <p className="text-zuki-muted">Menu coming soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {menuItems.map((item: MenuItem) => (
                  <CakeCard key={item.id} item={item} bakerySlug={bakery.slug} />
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-display text-2xl font-bold text-zuki-charcoal">Reviews</h2>
                {avgRating && (
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= parseFloat(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                    <span className="text-sm font-medium ml-1">{avgRating}/5</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {reviews.map((review: Review & { profiles: { full_name: string; avatar_url: string | null } }) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-zuki-border p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-zuki-pink flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {review.profiles?.full_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-medium text-zuki-charcoal text-sm">{review.profiles?.full_name || 'Client'}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-zuki-muted text-sm leading-relaxed">{review.comment}</p>}
                    {review.baker_reply && (
                      <div className="mt-3 pl-4 border-l-2 border-zuki-pink">
                        <p className="text-xs font-medium text-zuki-pink mb-1">Baker&apos;s reply</p>
                        <p className="text-zuki-muted text-sm">{review.baker_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <AIBubble context={`Viewing bakery: ${bakery.name}. Specialises in custom cakes.`} />
    </div>
  )
}

function CakeCard({ item, bakerySlug }: { item: MenuItem; bakerySlug: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden hover:shadow-zuki hover:-translate-y-1 transition-all duration-300">
      <div className="h-44 bg-gradient-to-br from-zuki-pink/10 to-zuki-cream flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="text-5xl">🎂</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-zuki-charcoal mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-zuki-muted text-xs line-clamp-2 mb-3">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-zuki-charcoal">From {formatZMW(item.base_price_zmw)}</span>
          <Link href={`/bakery/${bakerySlug}/order?item=${item.id}`}>
            <button className="px-3 py-1.5 bg-zuki-pink text-white rounded-xl text-xs font-medium hover:bg-zuki-pink-deep transition-colors">
              Order Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

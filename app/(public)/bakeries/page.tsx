import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { VerifiedBadge } from '@/components/zuki/VerifiedBadge'
import { Star, MapPin } from 'lucide-react'
type BakeryCard = { id: string; name: string; slug: string; description: string | null; logo_url: string | null; cover_url: string | null; status: string; created_at: string }

async function getBakeries() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bakeries')
    .select('id, name, slug, description, logo_url, cover_url, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  return data || []
}

async function getBakeryRating(bakeryId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('bakery_id', bakeryId)
  if (!data || data.length === 0) return null
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return { avg: avg.toFixed(1), count: data.length }
}

export default async function BakeriesPage() {
  const bakeries = await getBakeries()

  return (
    <div className="min-h-screen bg-zuki-cream">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl font-bold text-zuki-charcoal mb-4">
              Browse Bakeries
            </h1>
            <p className="text-zuki-muted text-lg max-w-2xl mx-auto">
              Discover amazing local bakers across Zambia. Every bakery is verified by our team.
            </p>
          </div>

          {bakeries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎂</div>
              <h3 className="font-display text-2xl font-bold text-zuki-charcoal mb-2">No bakeries yet</h3>
              <p className="text-zuki-muted mb-8">Be the first to join Zuki!</p>
              <Link href="/sign-up?role=baker"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zuki-pink text-white rounded-2xl font-medium hover:bg-zuki-pink-deep transition-colors">
                Join as a Baker
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bakeries.map((bakery: BakeryCard) => (
                <BakeryCard key={bakery.id} bakery={bakery} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function BakeryCard({ bakery }: { bakery: BakeryCard }) {
  return (
    <Link href={`/bakery/${bakery.slug}`}>
      <div className="bg-white rounded-2xl border border-zuki-border overflow-hidden hover:shadow-zuki hover:-translate-y-1 transition-all duration-300 h-full">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-br from-zuki-pink/20 to-zuki-blue/10 relative flex items-center justify-center">
          {bakery.cover_url ? (
            <Image src={bakery.cover_url} alt={bakery.name} fill className="object-cover" />
          ) : (
            <div className="text-6xl">🎂</div>
          )}
          {/* Logo */}
          <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-2xl bg-white border-2 border-zuki-border shadow-sm flex items-center justify-center overflow-hidden">
            {bakery.logo_url ? (
              <Image src={bakery.logo_url} alt={bakery.name} fill className="object-cover" />
            ) : (
              <span className="font-display font-bold text-xl text-zuki-pink">
                {bakery.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 pt-10">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-zuki-charcoal">{bakery.name}</h3>
              <VerifiedBadge size={16} />
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-zuki-muted">New bakery</span>
          </div>
          {bakery.description && (
            <p className="text-zuki-muted text-sm line-clamp-2 leading-relaxed">{bakery.description}</p>
          )}
          <div className="mt-4 pt-3 border-t border-zuki-border flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-zuki-muted">
              <MapPin className="w-3 h-3" /> Zambia
            </span>
            <span className="text-xs font-medium text-zuki-pink">View Bakery →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

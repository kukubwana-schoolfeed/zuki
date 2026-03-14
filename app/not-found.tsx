import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zuki-cream flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🎂</div>
        <h1 className="font-display text-4xl font-bold text-zuki-charcoal mb-4">Page not found</h1>
        <p className="text-zuki-muted text-lg mb-8">This page doesn&apos;t exist — but we have cake!</p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zuki-pink text-white rounded-2xl font-medium hover:bg-zuki-pink-deep transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  )
}

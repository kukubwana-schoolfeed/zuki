import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-zuki-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#F4A7B9" strokeWidth="2" fill="none" />
                <path d="M10 10 L22 10 L10 22 L22 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span className="font-display font-bold text-xl">Zuki</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Every cake, perfectly placed. Connecting Zambian bakers with cake lovers across the country.
            </p>
            <p className="text-zuki-pink text-sm mt-4 font-medium">🇿🇲 Made for Zambia</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-white/80">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: '/bakeries', label: 'Browse Bakeries' },
                { href: '/sign-up', label: 'Order a Cake' },
                { href: '/sign-up?role=baker', label: 'Join as Baker' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/50 hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-white/80">Support</h4>
            <ul className="space-y-2">
              {[
                { href: '#', label: 'Help Center' },
                { href: '#', label: 'Contact Us' },
                { href: '#', label: 'Privacy Policy' },
                { href: '#', label: 'Terms of Service' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/50 hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2024 Zuki. All rights reserved.</p>
          <p className="text-white/40 text-sm">Built with 🩷 for Zambian bakers</p>
        </div>
      </div>
    </footer>
  )
}

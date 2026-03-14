import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

export function WhatsAppRedirect({
  whatsappNumber,
  orderNumber,
}: {
  whatsappNumber: string
  orderNumber: string
}) {
  const link = getWhatsAppLink(
    whatsappNumber,
    `Hi! I'm following up on my Zuki order ${orderNumber}. I'd like to share some reference photos.`
  )
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity w-fit"
    >
      <MessageCircle className="w-4 h-4" />
      Continue on WhatsApp
    </a>
  )
}

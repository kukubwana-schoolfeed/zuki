import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

export async function sendBakeryApprovedEmail(to: string, bakeryName: string, slug: string) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `🎂 Welcome to Zuki! ${bakeryName} is now live.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FFFAF8; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 50%; border: 2px solid #F4A7B9; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px; font-weight: bold; color: #2D2D2D;">Z</span>
          </div>
        </div>
        <h1 style="color: #E07A93; font-size: 28px; margin-bottom: 16px;">You're approved! 🎉</h1>
        <p style="color: #2D2D2D; font-size: 16px; line-height: 1.6;">Welcome to Zuki, <strong>${bakeryName}</strong>! Your bakery is now live on the platform and clients can start ordering from you.</p>
        <div style="margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/bakery/${slug}"
            style="display: inline-block; padding: 14px 28px; background: #F4A7B9; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Your Storefront →
          </a>
        </div>
        <p style="color: #2D2D2D; font-size: 15px; line-height: 1.6;">Log in to complete your menu, set your availability, and start taking orders. If you have any questions, our support team is here to help.</p>
        <hr style="border: none; border-top: 1px solid #F0E8E8; margin: 32px 0;" />
        <p style="color: #8A8A8A; font-size: 13px;">— The Zuki Team<br><em>Every cake, perfectly placed.</em></p>
      </div>
    `,
  })
}

export async function sendBakeryRejectedEmail(to: string, bakeryName: string) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Your Zuki application — ${bakeryName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
        <h2 style="color: #2D2D2D;">Thank you for applying to Zuki</h2>
        <p>Unfortunately, we're unable to approve <strong>${bakeryName}</strong> at this time. Please ensure your bakery profile is complete and reach out to our support team for more information.</p>
        <p style="color: #8A8A8A; font-size: 13px;">— The Zuki Team</p>
      </div>
    `,
  })
}

export async function sendOrderStatusEmail(to: string, orderNumber: string, status: string, bakerName: string) {
  const statusMessages: Record<string, string> = {
    confirmed:   'Your baker has confirmed your order and is getting ready to bake!',
    in_progress: 'Your baker has started creating your cake.',
    ready:       'Your cake is ready! Time to pick it up.',
    collected:   'Your order is complete. We hope you loved it!',
    cancelled:   'Unfortunately, your order has been cancelled.',
  }

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Order ${orderNumber} — ${status.replace('_', ' ')}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #FFFAF8; padding: 40px; border-radius: 16px;">
        <h2 style="color: #2D2D2D;">Your order has been updated</h2>
        <p>Order <strong>${orderNumber}</strong> from <strong>${bakerName}</strong>:</p>
        <p style="font-size: 18px; color: #F4A7B9; font-weight: 600;">${statusMessages[status] || `Status: ${status}`}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
          style="display: inline-block; padding: 12px 24px; background: #F4A7B9; color: white; border-radius: 12px; text-decoration: none; margin: 16px 0;">
          View Order
        </a>
        <p style="color: #8A8A8A; font-size: 13px;">— The Zuki Team</p>
      </div>
    `,
  })
}

// Payment processing logic
// Manual confirmation flow is live. Mobile money API integrations scaffolded below.

export async function initiateAirtelPayment(
  amount: number,
  phoneNumber: string,
  reference: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // TODO: Implement when AIRTEL_MONEY_API_KEY is available
  // const baseUrl = process.env.AIRTEL_MONEY_BASE_URL
  // const apiKey = process.env.AIRTEL_MONEY_API_KEY
  return { success: false, error: 'Airtel Money API integration pending' }
}

export async function initiateMTNPayment(
  amount: number,
  phoneNumber: string,
  reference: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // TODO: Implement when MTN_MOMO_API_KEY is available
  return { success: false, error: 'MTN Mobile Money API integration pending' }
}

export async function initiateZamtelPayment(
  amount: number,
  phoneNumber: string,
  reference: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // TODO: Implement when ZAMTEL_API_KEY is available
  return { success: false, error: 'Zamtel Kwacha API integration pending' }
}

export function getPaymentInstructions(
  method: string,
  bakery: {
    airtel_number?: string | null
    mtn_number?: string | null
    zamtel_number?: string | null
    bank_name?: string | null
    bank_account_name?: string | null
    bank_account_number?: string | null
  }
): { title: string; instructions: string[] } {
  switch (method) {
    case 'airtel':
      return {
        title: 'Airtel Money',
        instructions: [
          `Send to: ${bakery.airtel_number || 'Not set'}`,
          'Open your Airtel Money app or dial *778#',
          'Select "Send Money"',
          'Enter the number above and the exact amount',
          'Note your transaction reference number',
        ],
      }
    case 'mtn':
      return {
        title: 'MTN Mobile Money',
        instructions: [
          `Send to: ${bakery.mtn_number || 'Not set'}`,
          'Open your MTN MoMo app or dial *303#',
          'Select "Transfer"',
          'Enter the number above and the exact amount',
          'Note your transaction reference number',
        ],
      }
    case 'zamtel':
      return {
        title: 'Zamtel Kwacha',
        instructions: [
          `Send to: ${bakery.zamtel_number || 'Not set'}`,
          'Open your Zamtel app or dial *422#',
          'Select "Send Money"',
          'Enter the number above and the exact amount',
          'Note your transaction reference number',
        ],
      }
    case 'bank_transfer':
      return {
        title: 'Bank Transfer',
        instructions: [
          `Bank: ${bakery.bank_name || 'Not set'}`,
          `Account Name: ${bakery.bank_account_name || 'Not set'}`,
          `Account Number: ${bakery.bank_account_number || 'Not set'}`,
          'Transfer the exact amount',
          'Note your transaction/reference number',
        ],
      }
    default:
      return { title: 'Payment', instructions: [] }
  }
}

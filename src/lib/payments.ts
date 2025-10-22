/**
 * Payment Integration Library for MTN Mobile Money and Airtel Money
 * Rwanda implementation
 */

import axios from 'axios'

// Payment provider types
export type PaymentProvider = 'momo' | 'airtel'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type PaymentPurpose = 'verified_listing' | 'premium_verified_listing' | 'listing_refresh' | 'listing_extension' | 'unlimited_contact_access' | 'contact_unlock'

export interface PaymentRequest {
  amount: number
  phoneNumber: string
  purpose: PaymentPurpose
  provider: PaymentProvider
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  externalReference?: string
  status: PaymentStatus
  message?: string
  error?: string
}

// MTN Mobile Money Configuration
const MOMO_CONFIG = {
  baseUrl: process.env.MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com',
  subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY || '',
  apiUser: process.env.MOMO_API_USER || '',
  apiKey: process.env.MOMO_API_KEY || '',
  environment: process.env.MOMO_ENVIRONMENT || 'sandbox', // sandbox or production
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/payments/callback/momo'
}

// Airtel Money Configuration
const AIRTEL_CONFIG = {
  baseUrl: process.env.AIRTEL_API_URL || 'https://openapiuat.airtel.africa',
  clientId: process.env.AIRTEL_CLIENT_ID || '',
  clientSecret: process.env.AIRTEL_CLIENT_SECRET || '',
  environment: process.env.AIRTEL_ENVIRONMENT || 'staging', // staging or production
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/payments/callback/airtel'
}

/**
 * Get MTN MoMo access token
 */
async function getMoMoAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `${MOMO_CONFIG.baseUrl}/collection/token/`,
      {},
      {
        headers: {
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
          Authorization: `Basic ${Buffer.from(`${MOMO_CONFIG.apiUser}:${MOMO_CONFIG.apiKey}`).toString('base64')}`
        }
      }
    )
    return response.data.access_token
  } catch (error: any) {
    console.error('MoMo token error:', error.response?.data || error.message)
    throw new Error('Failed to get MoMo access token')
  }
}

/**
 * Get Airtel Money access token
 */
async function getAirtelAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `${AIRTEL_CONFIG.baseUrl}/auth/oauth2/token`,
      {
        client_id: AIRTEL_CONFIG.clientId,
        client_secret: AIRTEL_CONFIG.clientSecret,
        grant_type: 'client_credentials'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.access_token
  } catch (error: any) {
    console.error('Airtel token error:', error.response?.data || error.message)
    throw new Error('Failed to get Airtel access token')
  }
}

/**
 * Initiate MTN MoMo payment
 */
async function initiateMoMoPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('Getting MoMo access token...')
    const accessToken = await getMoMoAccessToken()
    const referenceId = generateReferenceId() // UUID v4 for MTN MoMo
    const transactionId = generateTransactionId() // Readable ID for our records
    
    // MTN MoMo sandbox only supports EUR, not RWF
    // For production, you would use RWF
    const currency = MOMO_CONFIG.environment === 'sandbox' ? 'EUR' : 'RWF'
    
    const paymentPayload = {
      amount: request.amount.toString(),
      currency: currency,
      externalId: transactionId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: formatPhoneNumber(request.phoneNumber)
      },
      payerMessage: getPaymentMessage(request.purpose),
      payeeNote: `KigaliCribs - ${request.purpose}`
    }

    console.log('MoMo payment payload:', JSON.stringify(paymentPayload, null, 2))
    console.log('MoMo X-Reference-Id (UUID):', referenceId)
    console.log('MoMo Currency (sandbox uses EUR):', currency)
    console.log('MoMo API URL:', `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`)
    console.log('MoMo environment:', MOMO_CONFIG.environment)
    
    const response = await axios.post(
      `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
      paymentPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': MOMO_CONFIG.environment,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('MoMo response:', response.status, response.data)

    return {
      success: true,
      transactionId: referenceId, // Use UUID for status checks
      externalReference: transactionId,
      status: 'pending',
      message: 'Payment initiated successfully'
    }
  } catch (error: any) {
    console.error('MoMo payment error:', error.response?.data || error.message)
    console.error('MoMo error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    })
    return {
      success: false,
      status: 'failed',
      error: error.response?.data?.message || error.message || 'Payment initiation failed'
    }
  }
}

/**
 * Initiate Airtel Money payment
 */
async function initiateAirtelPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const accessToken = await getAirtelAccessToken()
    const referenceId = generateReferenceId()
    
    const response = await axios.post(
      `${AIRTEL_CONFIG.baseUrl}/merchant/v1/payments/`,
      {
        reference: referenceId,
        subscriber: {
          country: 'RW',
          currency: 'RWF',
          msisdn: formatPhoneNumber(request.phoneNumber)
        },
        transaction: {
          amount: request.amount,
          country: 'RW',
          currency: 'RWF',
          id: referenceId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': 'RW',
          'X-Currency': 'RWF'
        }
      }
    )

    return {
      success: response.data.status?.success || false,
      transactionId: response.data.data?.transaction?.id,
      externalReference: referenceId,
      status: response.data.status?.success ? 'pending' : 'failed',
      message: response.data.status?.message || 'Payment initiated'
    }
  } catch (error: any) {
    console.error('Airtel payment error:', error.response?.data || error.message)
    return {
      success: false,
      status: 'failed',
      error: error.response?.data?.message || 'Payment initiation failed'
    }
  }
}

/**
 * Check MTN MoMo payment status
 */
export async function checkMoMoPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    const accessToken = await getMoMoAccessToken()
    
    const response = await axios.get(
      `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': MOMO_CONFIG.environment,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey
        }
      }
    )

    const status = response.data.status
    if (status === 'SUCCESSFUL') return 'completed'
    if (status === 'FAILED') return 'failed'
    if (status === 'PENDING') return 'processing'
    return 'pending'
  } catch (error: any) {
    console.error('MoMo status check error:', error.response?.data || error.message)
    return 'failed'
  }
}

/**
 * Check Airtel Money payment status
 */
export async function checkAirtelPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  try {
    const accessToken = await getAirtelAccessToken()
    
    const response = await axios.get(
      `${AIRTEL_CONFIG.baseUrl}/standard/v1/payments/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Country': 'RW',
          'X-Currency': 'RWF'
        }
      }
    )

    const status = response.data.status?.code
    if (status === 'TS' || status === '200') return 'completed' // Transaction Successful
    if (status === 'TF') return 'failed' // Transaction Failed
    if (status === 'TP') return 'processing' // Transaction Pending
    return 'pending'
  } catch (error: any) {
    console.error('Airtel status check error:', error.response?.data || error.message)
    return 'failed'
  }
}

/**
 * Mock payment function for development
 */
async function initiateMockPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const referenceId = generateReferenceId()
  const transactionId = generateTransactionId()
  
  // Simulate different scenarios based on phone number
  const phone = request.phoneNumber
  
  if (phone.includes('111')) {
    // Simulate failure for testing
    return {
      success: false,
      status: 'failed',
      error: 'Mock payment failed - test phone number ends with 111'
    }
  }
  
  if (phone.includes('000')) {
    // Simulate network error for testing
    throw new Error('Mock network error - test phone number ends with 000')
  }
  
  // Default success case
  return {
    success: true,
    transactionId: referenceId,
    externalReference: transactionId,
    status: 'pending',
    message: 'Mock payment initiated successfully. In development mode.'
  }
}

/**
 * Check if we should use mock mode
 */
function shouldUseMockMode(): boolean {
  // Use mock mode if explicitly enabled OR if required env vars are missing
  const mockModeEnabled = process.env.PAYMENT_MOCK_MODE === 'true'
  const hasRequiredEnvVars = (
    (MOMO_CONFIG.subscriptionKey && MOMO_CONFIG.apiUser && MOMO_CONFIG.apiKey) ||
    (AIRTEL_CONFIG.clientId && AIRTEL_CONFIG.clientSecret)
  )
  
  console.log('Payment mode check:', {
    mockModeEnabled,
    hasRequiredEnvVars,
    momoConfigured: !!(MOMO_CONFIG.subscriptionKey && MOMO_CONFIG.apiUser && MOMO_CONFIG.apiKey),
    airtelConfigured: !!(AIRTEL_CONFIG.clientId && AIRTEL_CONFIG.clientSecret)
  })
  
  return mockModeEnabled || !hasRequiredEnvVars
}

/**
 * Main payment initiation function
 */
export async function initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Check if we should use mock mode
  if (shouldUseMockMode()) {
    console.log('Using mock payment mode - check environment variables or set PAYMENT_MOCK_MODE=false')
    return await initiateMockPayment(request)
  }
  
  if (request.provider === 'momo') {
    return await initiateMoMoPayment(request)
  } else if (request.provider === 'airtel') {
    return await initiateAirtelPayment(request)
  } else {
    return {
      success: false,
      status: 'failed',
      error: 'Invalid payment provider'
    }
  }
}

/**
 * Mock payment status check for development
 */
async function checkMockPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simulate payment completion after 30 seconds (for testing)
  const transactionTime = parseInt(transactionId.split('-')[1]) || Date.now()
  const elapsed = Date.now() - transactionTime
  
  if (elapsed > 30000) { // 30 seconds
    return 'completed'
  } else if (elapsed > 15000) { // 15 seconds
    return 'processing'
  } else {
    return 'pending'
  }
}

/**
 * Check payment status (provider-agnostic)
 */
export async function checkPaymentStatus(
  transactionId: string,
  provider: PaymentProvider
): Promise<PaymentStatus> {
  // Check if we should use mock mode
  if (shouldUseMockMode()) {
    console.log('Using mock payment status check')
    return await checkMockPaymentStatus(transactionId)
  }
  
  if (provider === 'momo') {
    return await checkMoMoPaymentStatus(transactionId)
  } else if (provider === 'airtel') {
    return await checkAirtelPaymentStatus(transactionId)
  } else {
    return 'failed'
  }
}

// Helper functions
function generateReferenceId(): string {
  // Generate a proper UUID v4 for MTN MoMo compatibility
  return crypto.randomUUID()
}

function generateTransactionId(): string {
  // Generate a readable transaction ID for our internal use
  return `KIGCR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If it starts with 250, keep as is
  if (cleaned.startsWith('250')) {
    return cleaned
  }
  
  // If it starts with 0, replace with 250
  if (cleaned.startsWith('0')) {
    return '250' + cleaned.substring(1)
  }
  
  // Otherwise, assume it's missing country code
  return '250' + cleaned
}

function getPaymentMessage(purpose: PaymentPurpose): string {
  const messages: Record<PaymentPurpose, string> = {
    verified_listing: 'Verified Property Listing (6 months)',
    premium_verified_listing: 'Premium Verified Listing (6 months + Featured)',
    listing_refresh: 'Refresh Property Listing (7 days)',
    listing_extension: 'Extend Listing Validity (3 months)',
    unlimited_contact_access: 'Unlimited Contact Access',
    contact_unlock: 'Unlock Property Contact'
  }
  return messages[purpose] || 'KigaliCribs Payment'
}

// Pricing configuration (in RWF)
export const PRICING: Record<PaymentPurpose, number> = {
  verified_listing: 30000, // 6 months validity, requires admin approval
  premium_verified_listing: 50000, // 6 months + featured (30 days) + priority (90 days)
  listing_refresh: 10000, // Bump to top for 7 days
  listing_extension: 10000, // Extend validity by 3 months
  unlimited_contact_access: 10000, // Unlimited property contact unlocks (for tenants)
  contact_unlock: 0 // Deprecated - will be replaced by free limits + unlimited access
}

export function getPricing(purpose: PaymentPurpose): number {
  return PRICING[purpose] || 0
}

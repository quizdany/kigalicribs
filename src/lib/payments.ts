/**
 * Payment Integration Library for MTN Mobile Money and Airtel Money
 * Rwanda implementation
 */

import axios from 'axios'

// Payment provider types
export type PaymentProvider = 'momo' | 'airtel'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type PaymentPurpose = 'premium_monthly' | 'premium_yearly' | 'contact_unlock' | 'featured_listing'

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
    const accessToken = await getMoMoAccessToken()
    const referenceId = generateReferenceId()
    
    const response = await axios.post(
      `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
      {
        amount: request.amount.toString(),
        currency: 'RWF',
        externalId: referenceId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formatPhoneNumber(request.phoneNumber)
        },
        payerMessage: getPaymentMessage(request.purpose),
        payeeNote: `KigaliCribs - ${request.purpose}`
      },
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

    return {
      success: true,
      transactionId: referenceId,
      externalReference: referenceId,
      status: 'pending',
      message: 'Payment initiated successfully'
    }
  } catch (error: any) {
    console.error('MoMo payment error:', error.response?.data || error.message)
    return {
      success: false,
      status: 'failed',
      error: error.response?.data?.message || 'Payment initiation failed'
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
 * Main payment initiation function
 */
export async function initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
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
 * Check payment status (provider-agnostic)
 */
export async function checkPaymentStatus(
  transactionId: string,
  provider: PaymentProvider
): Promise<PaymentStatus> {
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
    premium_monthly: 'Premium Monthly Subscription',
    premium_yearly: 'Premium Yearly Subscription',
    contact_unlock: 'Unlock Property Contact',
    featured_listing: 'Featured Property Listing'
  }
  return messages[purpose] || 'KigaliCribs Payment'
}

// Pricing configuration
export const PRICING = {
  premium_monthly: 5000, // RWF
  premium_yearly: 50000, // RWF
  contact_unlock: 500, // RWF per property
  featured_listing: 10000 // RWF per week
}

export function getPricing(purpose: PaymentPurpose): number {
  return PRICING[purpose] || 0
}

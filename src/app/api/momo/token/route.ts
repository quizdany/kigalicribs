import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY || 'dummy_subscription_key';
  const apiUser = process.env.MOMO_API_USER || 'dummy_api_user';
  const apiKey = process.env.MOMO_API_KEY || 'dummy_api_key';
  const targetEnv = process.env.MOMO_TARGET_ENV || 'sandbox';
  const momoBaseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com/collection/v1_0';

  // Get access token
  const auth = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');
  try {
    const res = await fetch(`${momoBaseUrl}/token/`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to get access token', details: await res.text() }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    return NextResponse.json({ error: 'Exception getting access token', details: error }, { status: 500 });
  }
} 
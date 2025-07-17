import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY || 'dummy_subscription_key';
  const targetEnv = process.env.MOMO_TARGET_ENV || 'sandbox';
  const momoBaseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com/collection/v1_0';

  const { access_token, referenceId } = await req.json();

  try {
    const res = await fetch(`${momoBaseUrl}/requesttopay/${referenceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Target-Environment': targetEnv,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to get payment status', details: await res.text() }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Exception getting payment status', details: error }, { status: 500 });
  }
} 
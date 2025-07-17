import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY || 'dummy_subscription_key';
  const targetEnv = process.env.MOMO_TARGET_ENV || 'sandbox';
  const momoBaseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com/collection/v1_0';

  const { access_token, amount, currency, externalId, payer, payerMessage } = await req.json();
  // Dynamically import uuid to avoid ESM/CJS issues
  const { v4: uuidv4 } = await import('uuid');
  const referenceId = uuidv4();

  try {
    const res = await fetch(`${momoBaseUrl}/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': targetEnv,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: payer,
        },
        payerMessage,
        payeeNote: payerMessage,
      }),
    });
    if (res.status !== 202) {
      return NextResponse.json({ error: 'Failed to initiate payment', details: await res.text() }, { status: 500 });
    }
    return NextResponse.json({ referenceId });
  } catch (error) {
    return NextResponse.json({ error: 'Exception initiating payment', details: error }, { status: 500 });
  }
} 
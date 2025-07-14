import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TEMP: Test OpenAI connection
export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello!' }],
      max_tokens: 20,
    });
    const aiResponse = completion.choices[0].message?.content || '';
    return NextResponse.json({ success: true, aiResponse });
  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

async function fetchKigaliMarketData(location: string, propertyType: string) {
  try {
    const url = `https://www.house.rw/property-for-rent?location=${encodeURIComponent(location)}&type=${encodeURIComponent(propertyType)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const prices: number[] = [];
    $('.property-listing .price').each((_, el) => {
      const text = $(el).text().replace(/[^\d]/g, '');
      if (text) prices.push(Number(text));
    });
    if (prices.length === 0) return null;
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { avg, count: prices.length, source: url };
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyFeatures, locationDetails } = body;
    const [location] = locationDetails.split(',');
    const typeMatch = propertyFeatures.match(/type: ([^,]+)/i);
    const propertyType = typeMatch ? typeMatch[1] : 'Apartment';

    const marketData = await fetchKigaliMarketData(location, propertyType);
    let marketTrends = '';
    if (marketData) {
      marketTrends = `Based on ${marketData.count} recent listings for ${propertyType}s in ${location}, the average price is RWF ${marketData.avg}. Source: ${marketData.source}`;
    } else {
      marketTrends = `No recent public data found for ${propertyType}s in ${location}.`;
    }

    const prompt = `You are an expert real estate analyst for Kigali, Rwanda.\n\nProperty Features: ${propertyFeatures}\nLocation Details: ${locationDetails}\nMarket Trends: ${marketTrends}\n\nBased on this information, suggest a fair monthly rental price (in RWF) and explain your reasoning.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful real estate pricing assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    const aiResponse = completion.choices[0].message?.content || '';
    const priceMatch = aiResponse.match(/(RWF|Frw|RwF)?\s?(\d{4,})/);
    const suggestedPrice = priceMatch ? Number(priceMatch[2]) : null;
    const priceJustification = aiResponse;

    return NextResponse.json({ suggestedPrice, priceJustification });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get fair price.' }, { status: 500 });
  }
} 
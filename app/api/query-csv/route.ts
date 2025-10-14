import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from '@/db/supabase-direct'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  const { query } = await request.json()

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 })
  }

  try {
    const allCustomers = await db.getCustomers()
    const customerData = JSON.stringify(allCustomers, null, 2)

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a helpful assistant that answers questions about customer data.

Here is the customer data:

${customerData}

Question: ${query}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Error querying LLM:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}

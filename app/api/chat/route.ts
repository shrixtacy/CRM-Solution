import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 })
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    
    // Convert messages to Gemini format
    const lastMessage = messages[messages.length - 1]
    const prompt = lastMessage.content

    const result = await model.generateContent(prompt)
    const response = await result.response
    const reply = response.text()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}

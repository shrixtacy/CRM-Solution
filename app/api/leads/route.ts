import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/supabase-direct'

export async function GET() {
  try {
    const allLeads = await db.getLeads()
    return NextResponse.json(allLeads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, source, referralSource, priority, notes } = body

    if (!name || !source) {
      return NextResponse.json({ error: 'Name and source are required' }, { status: 400 })
    }

    const newLead = await db.insertLead({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      source,
      referral_source: referralSource || null,
      priority: priority || 'medium',
      notes: notes || null,
      status: 'new'
    })

    return NextResponse.json(newLead[0])
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}



import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/supabase-direct'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, priority, notes, followUpDate, followUpNotes } = body

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (notes !== undefined) updateData.notes = notes
    if (followUpDate) updateData.follow_up_date = new Date(followUpDate)
    if (followUpNotes !== undefined) updateData.follow_up_notes = followUpNotes

    updateData.updated_at = new Date()

    const updatedLead = await db.updateLead(params.id, updateData)

    if (!updatedLead || updatedLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(updatedLead[0])
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedLead = await db.deleteLead(params.id)

    if (!deletedLead || deletedLead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}



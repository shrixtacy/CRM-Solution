'use client'

import { useState } from 'react'
import { LeadsGrid } from './leads-grid'
import { AddLeadButton } from './lead-tracker-interactive'

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  source: string
  referral_source?: string
  status: string
  priority: string
  notes?: string
  follow_up_date?: string
  follow_up_notes?: string
}

interface LeadTrackerWrapperProps {
  initialLeads: Lead[]
}

export function LeadTrackerWrapper({ initialLeads, showButton = true }: LeadTrackerWrapperProps & { showButton?: boolean }) {
  const [leads, setLeads] = useState(initialLeads)

  const handleLeadAdded = async () => {
    try {
      // Refresh the leads data
      const response = await fetch('/api/leads')
      if (response.ok) {
        const newLeads = await response.json()
        setLeads(newLeads)
      }
    } catch (error) {
      console.error('Error refreshing leads:', error)
    }
  }

  return (
    <>
      {showButton && <AddLeadButton onLeadAdded={handleLeadAdded} />}
      <LeadsGrid leads={leads} onLeadAdded={handleLeadAdded} />
    </>
  )
}

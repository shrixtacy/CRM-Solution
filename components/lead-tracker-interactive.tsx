'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { AddLeadModal } from "./add-lead-modal"

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

interface LeadTrackerInteractiveProps {
  lead: Lead
  onStatusChange: (leadId: string, newStatus: string) => void
  onFollowUp: (leadId: string) => void
}

export function LeadCard({ lead, onStatusChange, onFollowUp }: LeadTrackerInteractiveProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return
    
    setIsUpdating(true)
    try {
      await onStatusChange(lead.id, newStatus)
    } catch (error) {
      console.error('Error updating lead status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFollowUp = async () => {
    try {
      await onFollowUp(lead.id)
    } catch (error) {
      console.error('Error setting follow-up:', error)
    }
  }

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800', 
    interested: 'bg-green-100 text-green-800',
    converted: 'bg-purple-100 text-purple-800'
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  }

  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{lead.name}</p>
          {lead.company && (
            <p className="text-sm text-gray-600">{lead.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
            {lead.status}
          </Badge>
          <Badge className={priorityColors[lead.priority as keyof typeof priorityColors]}>
            {lead.priority}
          </Badge>
        </div>
      </div>
      
      {lead.notes && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {lead.notes}
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <select 
          value={lead.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isUpdating}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
          <option value="converted">Converted</option>
        </select>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleFollowUp}
          disabled={isUpdating}
        >
          <Bell className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

export function AddLeadButton({ onLeadAdded }: { onLeadAdded: () => void }) {
  return (
    <AddLeadModal onLeadAdded={onLeadAdded} />
  )
}

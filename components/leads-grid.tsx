'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Phone, Mail, Building } from "lucide-react"

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

interface LeadsGridProps {
  leads: Lead[]
  onLeadAdded?: () => void
}

export function LeadsGrid({ leads }: LeadsGridProps) {
  const [leadsState, setLeadsState] = useState(leads)

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setLeadsState(prev => 
          prev.map(lead => 
            lead.id === leadId ? { ...lead, status: newStatus } : lead
          )
        )
      } else {
        console.error('Failed to update lead status')
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const handleFollowUp = async (leadId: string) => {
    try {
      // For now, just show an alert - you can implement a modal later
      alert(`Set follow-up reminder for lead ${leadId}`)
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

  if (leadsState.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-lg">No leads found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or add a new lead</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leadsState.map((lead) => (
        <Card key={lead.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{lead.name}</CardTitle>
                {lead.company && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {lead.company}
                  </p>
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
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {lead.email && (
                <p className="text-sm flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {lead.email}
                </p>
              )}
              {lead.phone && (
                <p className="text-sm flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {lead.phone}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Source: {lead.source}
                {lead.referral_source && ` (${lead.referral_source})`}
              </p>
              {lead.follow_up_date && (
                <p className="text-sm text-blue-600">
                  Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {lead.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {lead.notes}
              </p>
            )}

            <div className="flex gap-2">
              <select 
                defaultValue={lead.status}
                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="converted">Converted</option>
              </select>
              
              <button 
                onClick={() => handleFollowUp(lead.id)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <Bell className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

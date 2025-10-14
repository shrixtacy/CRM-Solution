'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Bell, Phone, Mail, Building, Search, Filter, Plus, 
  Download, Settings, Users, MoreHorizontal, Eye
} from "lucide-react"
import { AddLeadModal } from "@/components/add-lead-modal"

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


export default function LeadTrackerPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [resultsPerPage, setResultsPerPage] = useState('10')

  useEffect(() => {
    // Fetch leads data
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads')
        if (response.ok) {
          const data = await response.json()
          setLeads(data)
        }
      } catch (error) {
        console.error('Error fetching leads:', error)
      }
    }
    fetchLeads()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(lead => lead.id))
    }
  }

  const handleExport = () => {
    console.log('Exporting leads...')
    // Implement export functionality
  }

  const handleLeadAdded = () => {
    // Refresh leads data when a new lead is added
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/leads')
        if (response.ok) {
          const data = await response.json()
          setLeads(data)
        }
      } catch (error) {
        console.error('Error fetching leads:', error)
      }
    }
    fetchLeads()
  }

  const handleFilter = () => {
    console.log('Opening filter options...')
    // Implement filter functionality
  }

  const handleGroupBy = () => {
    console.log('Opening group by options...')
    // Implement group by functionality
  }

  const handleBulkActions = () => {
    console.log('Opening bulk actions...')
    // Implement bulk actions functionality
  }

  const handleCustomizeTable = () => {
    console.log('Opening table customization...')
    // Implement table customization
  }

  const handleQuickAction = (action: string, leadId: string) => {
    console.log(`Performing ${action} on lead ${leadId}`)
    // Implement quick actions
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Update local state immediately for instant UI response
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    )

    // Then update the database in the background
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        console.error('Failed to update lead status')
        // Revert the change if API call failed
        setLeads(prev => 
          prev.map(lead => 
            lead.id === leadId ? { ...lead, status: lead.status } : lead
          )
        )
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
      // Revert the change if API call failed
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId ? { ...lead, status: lead.status } : lead
        )
      )
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })
  
  return (
    <div className="min-h-screen bg-black w-full">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Lead Tracker</h1>
            <p className="text-gray-400">Manage and track your sales pipeline</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <AddLeadModal onLeadAdded={handleLeadAdded} />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleFilter}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleGroupBy}
            >
              <Users className="w-4 h-4 mr-2" />
              Group by
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleBulkActions}
            >
              <Settings className="w-4 h-4 mr-2" />
              Bulk actions
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleCustomizeTable}
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize table
            </Button>
      </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                className={viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}
                onClick={() => setViewMode('list')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                className={viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}
                onClick={() => setViewMode('grid')}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            </div>
            </div>

        {/* Search and Results */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
      </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>Showing</span>
            <Select value={resultsPerPage} onValueChange={setResultsPerPage}>
              <SelectTrigger className="w-16 h-8 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>of {filteredLeads.length} results</span>
          </div>
        </div>

        {/* Leads Table */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="p-4 text-left">
                      <Checkbox 
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-gray-600" 
                      />
                    </th>
                    <th className="p-4 text-left text-gray-300 font-medium">LEADS NAME</th>
                    <th className="p-4 text-left text-gray-300 font-medium">QUICK ACTIONS</th>
                    <th className="p-4 text-left text-gray-300 font-medium">EMAIL</th>
                    <th className="p-4 text-left text-gray-300 font-medium">STATUS</th>
                    <th className="p-4 text-left text-gray-300 font-medium">NEXT ACTIVITY</th>
                    <th className="p-4 text-left text-gray-300 font-medium">TAGS</th>
                    <th className="p-4 text-left text-gray-300 font-medium">SALES OWNER</th>
                    <th className="p-4 text-left">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                          className="border-gray-600" 
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{lead.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => handleQuickAction('reminder', lead.id)}
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => handleQuickAction('call', lead.id)}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => handleQuickAction('email', lead.id)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => handleQuickAction('company', lead.id)}
                          >
                            <Building className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => handleQuickAction('more', lead.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {lead.email || 'No email'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Select 
                          value={lead.status} 
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-600 text-white text-sm hover:bg-gray-700 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600 z-50">
                            <SelectItem value="new" className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                New
                              </div>
                            </SelectItem>
                            <SelectItem value="contacted" className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Contacted
                              </div>
                            </SelectItem>
                            <SelectItem value="interested" className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Interested
                              </div>
                            </SelectItem>
                            <SelectItem value="converted" className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Converted
      </div>
                            </SelectItem>
                            <SelectItem value="pending" className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                Pending
                </div>
                            </SelectItem>
                            <SelectItem value="rejected" className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Rejected
              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{Math.floor(Math.random() * 1000) + 100}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm">+ Click to add</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">Artiflow Agency</span>
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleQuickAction('more', lead.id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
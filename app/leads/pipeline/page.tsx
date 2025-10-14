import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Gift,
  Phone,
  ShoppingCart,
  FileText,
  CheckSquare
} from "lucide-react"
import { db } from "@/db/supabase-direct"
import { unstable_noStore as noStore } from 'next/cache'

export const revalidate = 0

async function getLeads() {
  noStore()
  const data = await db.getLeads()
  return data
}

interface Checklist {
  leadId: string
  welcomeOfferSent: boolean
  introCallDone: boolean
  firstPurchaseMade: boolean
  contractSigned: boolean
  onboardingComplete: boolean
}

async function getChecklists(): Promise<Checklist[]> {
  noStore()
  // For now, return empty array since we don't have checklist data yet
  // You can implement this later when you add checklist functionality
  return []
}

const statusStages = [
  { key: 'new', label: 'New', color: 'bg-blue-100 text-blue-800', icon: Users },
  { key: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: Phone },
  { key: 'interested', label: 'Interested', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  { key: 'converted', label: 'Converted', color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
]

const checklistItems = [
  { key: 'welcomeOfferSent', label: 'Welcome Offer Sent', icon: Gift },
  { key: 'introCallDone', label: 'Intro Call Done', icon: Phone },
  { key: 'firstPurchaseMade', label: 'First Purchase Made', icon: ShoppingCart },
  { key: 'contractSigned', label: 'Contract Signed', icon: FileText },
  { key: 'onboardingComplete', label: 'Onboarding Complete', icon: CheckSquare }
]

export default async function LeadPipelinePage() {
  const leads = await getLeads()
  const checklists = await getChecklists()

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status)
  }

  const getChecklistForLead = (leadId: string) => {
    return checklists.find(checklist => checklist.leadId === leadId)
  }

  const getChecklistProgress = (checklist: Checklist) => {
    const totalItems = checklistItems.length
    const completedItems = [
      checklist.welcomeOfferSent,
      checklist.introCallDone,
      checklist.firstPurchaseMade,
      checklist.contractSigned,
      checklist.onboardingComplete
    ].filter(Boolean).length

    return Math.round((completedItems / totalItems) * 100)
  }

  const getOverallStats = () => {
    const totalLeads = leads.length
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
    
    const totalChecklists = checklists.length
    const completedOnboardings = checklists.filter(checklist => checklist.onboardingComplete).length
    const onboardingRate = totalChecklists > 0 ? Math.round((completedOnboardings / totalChecklists) * 100) : 0

    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      totalChecklists,
      completedOnboardings,
      onboardingRate
    }
  }

  const stats = getOverallStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lead Pipeline & Onboarding</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Total Leads</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Converted</p>
            </div>
            <p className="text-2xl font-bold">{stats.convertedLeads}</p>
            <p className="text-xs text-muted-foreground">{stats.conversionRate}% conversion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Onboarding</p>
            </div>
            <p className="text-2xl font-bold">{stats.completedOnboardings}</p>
            <p className="text-xs text-muted-foreground">{stats.onboardingRate}% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Active Pipeline</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalLeads - stats.convertedLeads}</p>
            <p className="text-xs text-muted-foreground">leads in pipeline</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Lead Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusStages.map((stage) => {
            const stageLeads = getLeadsByStatus(stage.key)
            return (
              <Card key={stage.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <stage.icon className="w-5 h-5" />
                    {stage.label}
                    <Badge className={stage.color}>
                      {stageLeads.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          {lead.company && (
                            <p className="text-sm text-gray-600">{lead.company}</p>
                          )}
                        </div>
                        <Badge className={`text-xs ${stage.color}`}>
                          {lead.priority}
                        </Badge>
                      </div>
                      {lead.notes && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {lead.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No leads in this stage
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Onboarding Checklist</h2>
        <div className="grid gap-4">
          {leads.map((lead) => {
            const checklist = getChecklistForLead(lead.id)
            if (!checklist) return null

            const progress = getChecklistProgress(checklist)

            return (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{lead.name}</CardTitle>
                      {lead.company && (
                        <p className="text-sm text-gray-600">{lead.company}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-lg font-bold">{progress}%</p>
                    </div>
                  </div>
                  <Progress value={progress} className="w-full" />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {checklistItems.map((item) => (
                      <div key={item.key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={checklist[item.key as keyof typeof checklist] as boolean}
                          className="w-4 h-4"
                          readOnly
                        />
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
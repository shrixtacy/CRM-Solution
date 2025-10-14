import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  Plus,
  Search
} from "lucide-react"
import { unstable_noStore as noStore } from 'next/cache'

export const revalidate = 0

interface Reminder {
  id: string
  leadId: string
  title: string
  description: string
  reminderDate: string
  type: 'call' | 'email' | 'meeting' | 'other'
  isCompleted: boolean
  createdAt: string
  reminderNotes?: string
  lead: {
    name: string
    company?: string
  }
}

async function getReminders(): Promise<Reminder[]> {
  noStore()
  // For now, return empty array since we don't have reminders data yet
  // You can implement this later when you add reminders functionality
  return []
}

const reminderTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: CalendarIcon,
  other: Bell
}

const reminderTypeColors = {
  call: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',
  meeting: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800'
}

export default async function FollowUpRemindersPage() {
  const reminders = await getReminders()

  const getRemindersByDate = () => {
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    return {
      overdue: reminders.filter(r => {
        const date = new Date(r.reminderDate)
        return date < today && !r.isCompleted
      }),
      today: reminders.filter(r => {
        const date = new Date(r.reminderDate)
        return date.toDateString() === today.toDateString() && !r.isCompleted
      }),
      tomorrow: reminders.filter(r => {
        const date = new Date(r.reminderDate)
        return date.toDateString() === tomorrow.toDateString() && !r.isCompleted
      }),
      upcoming: reminders.filter(r => {
        const date = new Date(r.reminderDate)
        return date > today && date <= nextWeek && !r.isCompleted
      })
    }
  }

  const getReminderStatus = (reminder: Reminder) => {
    const date = new Date(reminder.reminderDate)
    const today = new Date()
    if (reminder.isCompleted) return 'completed'
    if (date < today) return 'overdue'
    if (date.toDateString() === today.toDateString()) return 'today'
    if (date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()) return 'tomorrow'
    return 'upcoming'
  }

  const getReminderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'today': return 'bg-orange-100 text-orange-800'
      case 'tomorrow': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const dateReminders = getRemindersByDate()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Follow-up Reminders</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium">Overdue</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{dateReminders.overdue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-medium">Today</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{dateReminders.today.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-medium">Tomorrow</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{dateReminders.tomorrow.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">This Week</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{dateReminders.upcoming.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search reminders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
          <option value="converted">Converted</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.map((reminder) => {
          const status = getReminderStatus(reminder)
          const IconComponent = reminderTypeIcons[reminder.type as keyof typeof reminderTypeIcons]
          
          return (
            <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={reminder.isCompleted}
                      className="w-4 h-4"
                      readOnly
                    />
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{reminder.lead.name}</p>
                        {reminder.lead.company && (
                          <p className="text-sm text-gray-600">{reminder.lead.company}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(reminder.reminderDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reminder.reminderDate).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={reminderTypeColors[reminder.type as keyof typeof reminderTypeColors]}>
                        {reminder.type}
                      </Badge>
                      <Badge className={getReminderStatusColor(status)}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {reminder.reminderNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{reminder.reminderNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {reminders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No reminders found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or add a new reminder</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
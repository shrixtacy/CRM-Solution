"use client"

import { BarChart, Users, Inbox, MessageSquare, User, Briefcase, UserPlus, ClipboardList, Bell, Package, Receipt, Phone, PhoneCall, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { handleSignOut } from "@/lib/actions"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  }
]

const aiToolsItems = [
  {
    title: "AI Campaign",
    url: "/email-campaign",
    icon: Inbox,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "AI Calling",
    url: "/ai-calling",
    icon: Phone,
  },
  {
    title: "AI Call Report",
    url: "/ai-call-report",
    icon: PhoneCall,
  }
]

const inventorySalesItems = [
  {
    title: "Business",
    url: "/business",
    icon: Briefcase,  
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Sales & Invoicing",
    url: "/sales",
    icon: Receipt,
  }
]

const leadsItems = [
  {
    title: "Lead Tracker",
    url: "/leads/tracker",
    icon: UserPlus,
  },
  {
    title: "Lead Pipeline & Checklist",
    url: "/leads/pipeline",
    icon: ClipboardList,
  },
  {
    title: "Follow-up Reminders",
    url: "/leads/reminders",
    icon: Bell,
  },
  {
    title: "AI Lead Generation",
    url: "/leads",
    icon: Users, 
  }
]

function CollapsibleSection({ 
  title, 
  items, 
  isOpen, 
  onToggle 
}: { 
  title: string
  items: Array<{ title: string; url: string; icon: React.ComponentType<{ className?: string }> }>
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel 
        className="cursor-pointer flex items-center justify-between hover:bg-gray-100 rounded-md p-2 -mx-2"
        onClick={onToggle}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </SidebarGroupLabel>
      {isOpen && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  )
}

function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <button className="w-full text-left">Sign Out</button>
    </form>
  )
}

export function AppSidebar() {
  const [aiToolsOpen, setAiToolsOpen] = useState(true)
  const [inventorySalesOpen, setInventorySalesOpen] = useState(true)
  const [leadsOpen, setLeadsOpen] = useState(true)

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <CollapsibleSection
          title="AI Tools"
          items={aiToolsItems}
          isOpen={aiToolsOpen}
          onToggle={() => setAiToolsOpen(!aiToolsOpen)}
        />
        
        <CollapsibleSection
          title="Inventory & Sales"
          items={inventorySalesItems}
          isOpen={inventorySalesOpen}
          onToggle={() => setInventorySalesOpen(!inventorySalesOpen)}
        />
        
        <CollapsibleSection
          title="Leads & Onboarding System"
          items={leadsItems}
          isOpen={leadsOpen}
          onToggle={() => setLeadsOpen(!leadsOpen)}
        />
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full">
              <User />
              <span>Profile</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

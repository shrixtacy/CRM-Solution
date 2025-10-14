import { BarChart, Users, Inbox, MessageSquare, User, Link, Briefcase, UserPlus, ClipboardList, Bell } from "lucide-react"
import { signOut } from "@/auth"

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
  },
  {
    title: "Business",
    url: "/business",
    icon: Briefcase,  
  },
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
    title: "AI Lead Generation",
    url: "/leads",
    icon: Users, 
  },
  {
    title: "A/B Testing",
    url: "https://ab-thumbnail.vercel.app/",
    icon: Link,
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
  }
]

function SignOutButton() {
  async function handleSignOut() {
    'use server'
    await signOut()
  }

  return (
    <form action={handleSignOut}>
      <button className="w-full text-left">Sign Out</button>
    </form>
  )
}

export function AppSidebar() {
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
        
        <SidebarGroup>
          <SidebarGroupLabel>Leads & Onboarding System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {leadsItems.map((item) => (
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

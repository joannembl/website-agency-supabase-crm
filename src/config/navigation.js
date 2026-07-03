import { Home, Users, LayoutDashboard, Monitor, Briefcase, FileText, CheckSquare, DollarSign, BarChart3, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { name: 'Dashboard', label: 'Dashboard', icon: Home, description: 'Daily command center' },
  { name: 'Prospects', label: 'Prospects', icon: Users, description: 'Lead database and prospect list' },
  { name: 'Pipeline', label: 'Pipeline', icon: LayoutDashboard, description: 'Kanban sales pipeline' },
  { name: 'Demo Websites', label: 'Demo Websites', icon: Monitor, description: 'Demo site production and status tracking' },
  { name: 'Clients', label: 'Clients', icon: Briefcase, description: 'Active clients and account records' },
  { name: 'Proposals', label: 'Proposals', icon: FileText, description: 'Proposal generation and tracking' },
  { name: 'Tasks', label: 'Tasks', icon: CheckSquare, description: 'Team task management' },
  { name: 'Revenue', label: 'Revenue', icon: DollarSign, description: 'MRR and sales metrics' },
  { name: 'Analytics', label: 'Analytics', icon: BarChart3, description: 'Performance reporting' },
  { name: 'Settings', label: 'Settings', icon: Settings, description: 'Team, permissions, and app settings' },
]

export const DEFAULT_NAV = 'Dashboard'

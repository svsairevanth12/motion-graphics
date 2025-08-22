'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FolderOpen,
  Template,
  Settings,
  Plus,
  Brain
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
  },
  {
    name: 'Templates',
    href: '/dashboard/templates',
    icon: Template,
  },
  {
    name: 'AI Demo',
    href: '/dashboard/ai-demo',
    icon: Brain,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-card border-r border-border p-4">
      <div className="space-y-2">
        <Button asChild className="w-full justify-start">
          <Link href="/editor/create">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
        
        <div className="pt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Button
                key={item.name}
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

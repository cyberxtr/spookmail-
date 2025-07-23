import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Megaphone, 
  Settings, 
  UserCog, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  Skull
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Email Checks', href: '/email-checks', icon: Mail },
  { name: 'Broadcasts', href: '/broadcasts', icon: Megaphone },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Admins', href: '/admins', icon: UserCog },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [location] = useLocation()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] })
    },
  })

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="spooky-card flex grow flex-col gap-y-5 overflow-y-auto border-r border-border/50 px-6 pb-4">
          {/* Logo/Header */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center spooky-shadow">
                <Skull className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SpookMail</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a className={cn(
                        "group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "spooky-gradient text-white spooky-shadow"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}>
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        {item.name}
                      </a>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Bottom actions */}
            <div className="mt-auto space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark mode
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border lg:hidden" />

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold capitalize">
                {navigation.find(nav => nav.href === location)?.name || 'Dashboard'}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
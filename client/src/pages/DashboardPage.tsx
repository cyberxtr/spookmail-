import { useQuery } from '@tanstack/react-query'
import { defaultQueryFn } from '@/lib/queryClient'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { Users, Mail, TrendingUp, UserPlus, BarChart } from 'lucide-react'

export function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: defaultQueryFn,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Users",
      value: formatNumber(dashboardData.totalUsers || 0),
      change: formatPercentage(dashboardData.trends?.newUsers || 0),
      icon: Users,
      trend: dashboardData.trends?.newUsers > 0 ? 'positive' : dashboardData.trends?.newUsers < 0 ? 'negative' : 'neutral'
    },
    {
      title: "Email Checks",
      value: formatNumber(dashboardData.currentPeriodStats?.totalChecks || 0),
      change: formatPercentage(dashboardData.trends?.totalChecks || 0),
      icon: Mail,
      trend: dashboardData.trends?.totalChecks > 0 ? 'positive' : dashboardData.trends?.totalChecks < 0 ? 'negative' : 'neutral'
    },
    {
      title: "Valid Emails",
      value: formatNumber(dashboardData.currentPeriodStats?.validEmails || 0),
      change: formatPercentage(dashboardData.trends?.validEmails || 0),
      icon: BarChart,
      trend: dashboardData.trends?.validEmails > 0 ? 'positive' : dashboardData.trends?.validEmails < 0 ? 'negative' : 'neutral'
    },
    {
      title: "New Referrals",
      value: formatNumber(dashboardData.currentPeriodStats?.newReferrals || 0),
      change: formatPercentage(dashboardData.trends?.newReferrals || 0),
      icon: UserPlus,
      trend: dashboardData.trends?.newReferrals > 0 ? 'positive' : dashboardData.trends?.newReferrals < 0 ? 'negative' : 'neutral'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your SpookMail bot performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="spooky-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`text-xs flex items-center ${
                stat.trend === 'positive' ? 'text-green-500' : 
                stat.trend === 'negative' ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} from last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="spooky-card">
          <CardHeader>
            <CardTitle>Recent Email Checks</CardTitle>
            <CardDescription>Latest email verifications</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentChecks && dashboardData.recentChecks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentChecks.slice(0, 5).map((check: any) => (
                  <div key={check.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{check.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Quality: {check.qualityScore}/100
                      </p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      check.isValid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {check.isValid ? 'Valid' : 'Invalid'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent checks</p>
            )}
          </CardContent>
        </Card>

        <Card className="spooky-card">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.dailyStats && dashboardData.dailyStats.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.dailyStats.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span>{day.newUsers} users</span>
                      <span>{day.totalChecks} checks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No activity data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
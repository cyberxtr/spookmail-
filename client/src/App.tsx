import { Route, Switch } from 'wouter'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { EmailChecksPage } from './pages/EmailChecksPage'
import { BroadcastsPage } from './pages/BroadcastsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdminsPage } from './pages/AdminsPage'
import { LoadingSpinner } from './components/ui/loading-spinner'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" size="lg" />
          <p className="text-muted-foreground">Loading SpookMail Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/email-checks" component={EmailChecksPage} />
        <Route path="/broadcasts" component={BroadcastsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/admins" component={AdminsPage} />
        <Route>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground">The requested page could not be found.</p>
          </div>
        </Route>
      </Switch>
    </DashboardLayout>
  )
}

export default App
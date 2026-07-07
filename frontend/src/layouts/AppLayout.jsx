import { Navigate, Outlet } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import { CompanyProvider, useCompany } from '@/context/CompanyContext'
import { Skeleton } from '@/components/ui/skeleton'

function LayoutShell() {
  const { company, loading } = useCompany()

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-5 pt-10">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!company) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background">
      <main className="pb-[calc(var(--bottom-nav-height)+1.5rem)]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

/**
 * Layout compartilhado das telas autenticadas: container mobile-first
 * (máx. 448px), conteúdo com respiro para a navegação inferior fixa.
 */
function AppLayout() {
  return (
    <CompanyProvider>
      <LayoutShell />
    </CompanyProvider>
  )
}

export default AppLayout

import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import { Toaster } from './components/ui/toaster'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionListPage from './pages/TransactionListPage'
import GraphsPage from './pages/GraphsPage'
import TaxRadarPage from './pages/TaxRadarPage'
import MorePage from './pages/MorePage'
import DebtorsPage from './pages/DebtorsPage'
import WhatsAppSettingsPage from './pages/WhatsAppSettingsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/register" element={<Navigate to="/cadastro" replace />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lancar" element={<TransactionsPage />} />
          <Route path="/historico" element={<TransactionListPage />} />
          <Route path="/graficos" element={<GraphsPage />} />
          <Route path="/impostos" element={<TaxRadarPage />} />
          <Route path="/mais" element={<MorePage />} />
          <Route path="/mais/devedores" element={<DebtorsPage />} />
          <Route path="/mais/alertas" element={<WhatsAppSettingsPage />} />
          <Route path="/mais/configuracoes" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App

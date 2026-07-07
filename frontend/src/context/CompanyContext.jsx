import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listCompanies } from '@/services/companyService'

const CompanyContext = createContext(null)

/**
 * Carrega as empresas do usuário uma única vez e expõe a empresa ativa
 * (a primeira da lista) para todas as telas do app.
 */
export function CompanyProvider({ children }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listCompanies()
      setCompanies(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      companies,
      company: companies[0] ?? null,
      loading,
      refresh,
    }),
    [companies, loading, refresh],
  )

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de <CompanyProvider>')
  }
  return context
}

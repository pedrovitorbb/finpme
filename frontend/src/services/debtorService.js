import api from './api'

export async function listDebtors(companyId, status) {
  const { data } = await api.get(`/api/v1/companies/${companyId}/debtors`, {
    params: status ? { status } : undefined,
  })
  return data
}

export async function getDebtorSummary(companyId) {
  const { data } = await api.get(`/api/v1/companies/${companyId}/debtors/summary`)
  return data
}

export async function createDebtor(companyId, debtor) {
  const { data } = await api.post(`/api/v1/companies/${companyId}/debtors`, debtor)
  return data
}

export async function markDebtorAsPaid(companyId, id) {
  const { data } = await api.post(`/api/v1/companies/${companyId}/debtors/${id}/mark-paid`)
  return data
}

export async function deleteDebtor(companyId, id) {
  await api.delete(`/api/v1/companies/${companyId}/debtors/${id}`)
}

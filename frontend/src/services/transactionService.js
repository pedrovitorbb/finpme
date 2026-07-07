import api from './api'

export async function listTransactions(companyId, filters) {
  const { data } = await api.get(`/api/v1/companies/${companyId}/transactions`, {
    params: filters,
  })
  return data
}

export async function createTransaction(companyId, data) {
  const { data: responseData } = await api.post(
    `/api/v1/companies/${companyId}/transactions`,
    data,
  )
  return responseData
}

export async function updateTransaction(companyId, id, data) {
  const { data: responseData } = await api.patch(
    `/api/v1/companies/${companyId}/transactions/${id}`,
    data,
  )
  return responseData
}

export async function deleteTransaction(companyId, id) {
  const { data } = await api.delete(`/api/v1/companies/${companyId}/transactions/${id}`)
  return data
}

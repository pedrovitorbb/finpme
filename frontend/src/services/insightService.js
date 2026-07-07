import api from './api'

export async function getLatestInsights(companyId) {
  const { data } = await api.get(`/api/v1/companies/${companyId}/insights`)
  return data
}

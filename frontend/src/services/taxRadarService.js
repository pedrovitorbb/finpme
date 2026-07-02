import api from './api'

export async function getTaxRadar(companyId) {
  const { data } = await api.get(`/api/v1/companies/${companyId}/tax-radar`)
  return data
}

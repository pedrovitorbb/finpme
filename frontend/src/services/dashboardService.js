import api from './api'

export async function getDashboard(companyId, year, month) {
  const { data } = await api.get(`/api/v1/companies/${companyId}/dashboard`, {
    params: { year, month },
  })
  return data
}

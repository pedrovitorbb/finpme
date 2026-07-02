import api from './api'

export async function listCompanies() {
  const { data } = await api.get('/api/v1/companies')
  return data
}

export async function getCompany(id) {
  const { data } = await api.get(`/api/v1/companies/${id}`)
  return data
}

export async function registerByCnpj(cnpj, taxRegimeOverride) {
  const { data } = await api.post('/api/v1/companies/cnpj', { cnpj, taxRegimeOverride })
  return data
}

export async function registerManual(data) {
  const { data: responseData } = await api.post('/api/v1/companies/manual', data)
  return responseData
}

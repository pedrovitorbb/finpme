import api from './api'

export async function login(email, password) {
  const { data } = await api.post('/api/v1/auth/login', { email, password })
  localStorage.setItem('finpme_token', data.token)
  return data.user
}

export async function register(name, email, password) {
  const { data } = await api.post('/api/v1/auth/register', { name, email, password })
  localStorage.setItem('finpme_token', data.token)
  return data.user
}

export function logout() {
  localStorage.removeItem('finpme_token')
  window.location.href = '/login'
}

export function getToken() {
  return localStorage.getItem('finpme_token')
}

export function isAuthenticated() {
  return !!getToken()
}

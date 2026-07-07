import api from './api'

const TOKEN_KEY = 'finpme_token'
const USER_KEY = 'finpme_user'

function storeSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ name: data.name, email: data.email, plan: data.plan }),
  )
}

export async function login(email, password) {
  const { data } = await api.post('/api/v1/auth/login', { email, password })
  storeSession(data)
  return data
}

export async function register(name, email, password, mixesPersonalBusiness = false) {
  const { data } = await api.post('/api/v1/auth/register', {
    name,
    email,
    password,
    mixesPersonalBusiness,
  })
  storeSession(data)
  return data
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.location.href = '/login'
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getToken()
}

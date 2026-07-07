import api from './api'

export async function getNotificationSettings() {
  const { data } = await api.get('/api/v1/notifications/settings')
  return data
}

export async function updateNotificationSettings(settings) {
  const { data } = await api.patch('/api/v1/notifications/settings', settings)
  return data
}

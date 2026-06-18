import axios from 'axios'
import { auth } from './firebase'
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000', timeout: 30000 })
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) { const token = await user.getIdToken(); config.headers.Authorization = `Bearer ${token}` }
  return config
})
api.interceptors.response.use(res => res, err => { return Promise.reject(new Error(err.response?.data?.detail ?? err.message ?? 'Error')) })
export default api

import { createHttpClient, envApiUrl } from './http'

const API = createHttpClient({
  baseURL: envApiUrl('VITE_POSITIONS_API_URL', 'http://localhost:4000/api'),
  withAuth: true,
})

export default API

import { createHttpClient, envApiUrl } from './http'

const AnalyticsAPI = createHttpClient({
  baseURL: envApiUrl('VITE_ANALYTICS_API_URL', 'http://localhost:7000/api'),
  withAuth: true,
})

export default AnalyticsAPI

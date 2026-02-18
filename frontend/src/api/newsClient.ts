import { createHttpClient, envApiUrl } from './http'

const NewsAPI = createHttpClient({
  baseURL: envApiUrl('VITE_NEWS_API_URL', 'http://localhost:6500/api'),
  withAuth: true,
})

export default NewsAPI

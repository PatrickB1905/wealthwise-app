import { createHttpClient, envApiUrl } from './http'

const MarketAPI = createHttpClient({
  baseURL: envApiUrl('VITE_MARKET_API_URL', 'http://localhost:5000/api'),
  withAuth: true,
})

export default MarketAPI

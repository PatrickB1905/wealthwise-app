import { ENV } from '../config/env'
import { createHttpClient } from './http'

const AnalyticsAPI = createHttpClient(ENV.ANALYTICS_API_URL)

export default AnalyticsAPI

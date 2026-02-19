import { ENV } from '../config/env'
import { createHttpClient } from './http'

const MarketDataAPI = createHttpClient(ENV.MARKET_DATA_API_URL)

export default MarketDataAPI

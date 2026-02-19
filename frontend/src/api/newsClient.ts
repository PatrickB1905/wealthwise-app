import { ENV } from '../config/env'
import { createHttpClient } from './http'

const NewsAPI = createHttpClient(ENV.NEWS_API_URL)

export default NewsAPI

import { ENV } from '../config/env'
import { createHttpClient } from './http'

const API = createHttpClient(ENV.POSITIONS_API_URL)

export default API

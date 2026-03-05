import { ENV } from '@shared/lib/env';
import { createHttpClient } from './http';

const API = createHttpClient(ENV.POSITIONS_API_URL);

export default API;

import { ENV } from '@shared/lib/env';
import { createHttpClient } from '@shared/lib/http';

const AnalyticsAPI = createHttpClient(ENV.ANALYTICS_API_URL);

export default AnalyticsAPI;

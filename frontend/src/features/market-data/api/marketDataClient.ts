import { ENV } from '@shared/lib/env';
import { createHttpClient } from '@shared/lib/http';

const MarketDataAPI = createHttpClient(ENV.MARKET_DATA_API_URL);

export default MarketDataAPI;

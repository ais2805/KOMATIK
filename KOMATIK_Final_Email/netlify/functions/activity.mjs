import { makeApi } from '../../server/api.mjs';
export default makeApi('activity');
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:240}};

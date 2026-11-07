import { makeApi } from '../../server/api.mjs';
export default makeApi('teacher');
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:60}};

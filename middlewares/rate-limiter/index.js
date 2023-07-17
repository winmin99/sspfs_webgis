import { RateLimiterPostgres } from 'rate-limiter-flexible';
import postgresql from '../postgresql/index';

/**
 * @link https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#login-endpoint-protection
 * @type {{duration: number, storeType: string, inmemoryBlockOnConsumed: number, blockDuration: number, inmemoryBlockDuration: number, keyPrefix: string, storeClient: Pool, points: number, tableName: string}}
 */
const rateLimiterOptions = {
  // Basic options
  storeClient: postgresql.pool,
  storeType: postgresql.pool.constructor.name,
  points: 100, // Number of points
  duration: 1, // Per second(s)

  // Custom options
  tableName: 'private.sys_rtl',
  keyPrefix: 'sys_rtl', // must be unique for limiters with different purpose

  inmemoryBlockOnConsumed: 301,
  inmemoryBlockDuration: 60,
  // TODO: 개선: https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#login-endpoint-protection
  blockDuration: 60, // Block for 10 seconds if consumed more than `points`
};

const rateLimiterPostgres = new RateLimiterPostgres(rateLimiterOptions, function (err) {
  if (err) {
    // log or/and process exit
  } else {
    // table checked/created
  }
});

export default function (req, res, next) {
  rateLimiterPostgres
    .consume(req.ip)
    .then(function () {
      // There were enough points to consume
      next();
    })
    .catch(function (rejectResponse) {
      if (rejectResponse instanceof Error) {
        // Some Postgres error
        // Never happen if `insuranceLimiter` set up
        // Decide what to do with it in other case
      } else {
        // Can't consume
        // If there is no error, rateLimiterRedis promise rejected with number of ms before next request allowed
        // consumed and remaining points
        const secs = Math.round(rejectResponse.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).send('Too Many Requests');
      }
    });
}

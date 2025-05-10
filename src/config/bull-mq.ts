import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const redisURL = new URL(
  process.env.BULL_MQ_REDIS_URL || 'redis://localhost:6379',
);
export const redisURLWithFamily = `${redisURL}?family=0`;

const bullMqConfig = {
  family: 0,
  host: redisURL.hostname,
  port: Number(redisURL.port),
  username: redisURL.username,
  password: redisURL.password,
};

export default bullMqConfig;

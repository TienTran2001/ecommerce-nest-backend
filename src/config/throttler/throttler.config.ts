import { registerAs } from '@nestjs/config';

export const THROTTLER_CONFIG = 'throttler';

export default registerAs(THROTTLER_CONFIG, () => ({
  ttl: parseInt(process.env.THROTTLER_TTL ?? '1000', 10),
  limit: parseInt(process.env.THROTTLER_LIMIT ?? '60', 10),
}));

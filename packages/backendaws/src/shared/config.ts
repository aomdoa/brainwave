/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { UserConfig } from '@brainwave/shared'

export const config = {
  TABLE_NAME: process.env.DYNAMODB_TABLE ?? 'brainwave',
  REGION: process.env.AWS_REGION ?? 'ca-central-1',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dave',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '6h',
  NAME_MIN_LENGTH: parseInt(process.env.NAME_MIN_LENGTH ?? '5'),
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH ?? '12'),
}

export function getUserConfig(): UserConfig {
  return {
    minNameLength: config.NAME_MIN_LENGTH,
    minPasswordLength: config.PASSWORD_MIN_LENGTH,
  }
}

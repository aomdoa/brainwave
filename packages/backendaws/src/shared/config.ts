/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { UserConfig } from '@brainwave/shared'

export const config = {
  TABLE_NAME: process.env.DYNAMODB_TABLE ?? 'brainwave',
  REGION: process.env.AWS_REGION ?? 'ca-central-1',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dave',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '6h',
}

export function getSchemaConfig(): UserConfig {
  return {
    minNameLength: parseInt(process.env.NAME_MIN_LENGTH ?? '5'),
    minPasswordLength: parseInt(process.env.PASSWORD_MIN_LENGTH ?? '12'),
  }
}

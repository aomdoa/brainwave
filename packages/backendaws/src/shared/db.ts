/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { config } from './config'

const isLocal = process.env.NODE_ENV === 'development'

const client = new DynamoDBClient({
  region: config.REGION,
  ...(isLocal && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  }),
})

export const db = DynamoDBDocumentClient.from(client)
export default db

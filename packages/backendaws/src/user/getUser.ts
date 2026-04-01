/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { UserClientRecord, userClientSchema } from '@brainwave/shared'
import { config, db, error } from '../shared'

export default async function getUser(pk: string): Promise<UserClientRecord> {
  console.log('Getting user with pk:', pk)
  const result = await db.send(
    new GetCommand({
      TableName: config.config.TABLE_NAME,
      Key: {
        pk,
        sk: 'PROFILE',
      },
    })
  )

  if (!result.Item) {
    throw new error.ValidationError('User not found')
  }

  console.dir(result.Item)
  const user = userClientSchema.parse(result.Item)
  return user
}

/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'
import { db, config, error, jwt } from '../shared'

export default async function loginUser({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<{ token: string }> {
  if (email == null || password == null) {
    throw new error.ValidationError('Please provide the email and password')
  }

  const users = await db.send(
    new QueryCommand({
      TableName: config.config.TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
      Limit: 1,
    })
  )
  if (!users.Count || users.Count !== 1) {
    throw new error.ValidationError('Invalid email or password')
  }
  const user = users.Items![0]

  const isValid = bcrypt.compareSync(password, user.password)
  if (!isValid) {
    throw new error.ValidationError('Invalid email or password')
  }

  const token = jwt.signToken({ pk: user.pk }, user.authLength ?? config.config.JWT_EXPIRES_IN)
  return { token }
}

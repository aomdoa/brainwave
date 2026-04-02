/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'
import { ulid } from 'ulid'
import { userClientSchema, userCreateSchema } from '@brainwave/shared'
import { config, db, error } from '../shared'

export default async function createUser(body: unknown) {
  // parse and validate input
  const schema = userCreateSchema(config.getUserConfig())
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new error.ValidationError('Invalid input', parsed.error)
  }
  const { name, email, password, isConfirmed, authLength } = parsed.data

  // verify email is unique
  const existing = await db.send(
    new QueryCommand({
      TableName: config.config.TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
      Limit: 1,
    })
  )
  if (existing.Count && existing.Count > 0) {
    throw new error.ConflictError('User already exists')
  }

  // add user
  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(password, salt)
  const userId = ulid()
  const now = new Date().toISOString()
  const item = {
    pk: `USER#${userId}`,
    sk: 'PROFILE',
    userId,
    name,
    email,
    password: hashedPassword,
    isConfirmed: isConfirmed ?? false,
    authLength: authLength ?? '6h',
    createdAt: now,
    updatedAt: now,
  }
  await db.send(
    new PutCommand({
      TableName: config.config.TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk)',
    })
  )

  const returnSchema = userClientSchema.parse(item)
  return returnSchema
}

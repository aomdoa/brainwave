import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
  region: 'ca-central-1',
  endpoint: 'http://localhost:8000',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
})

async function setup() {
  // Check if table already exists
  const { TableNames } = await client.send(new ListTablesCommand({}))
  if (TableNames?.includes('brainwave')) {
    console.log('Table already exists, skipping creation')
    return
  }

  await client.send(
    new CreateTableCommand({
      TableName: 'brainwave',
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'pk',       AttributeType: 'S' },
        { AttributeName: 'sk',       AttributeType: 'S' },
        { AttributeName: 'email',    AttributeType: 'S' },
        { AttributeName: 'oauthKey', AttributeType: 'S' },
        { AttributeName: 'thoughtId',AttributeType: 'S' },
        { AttributeName: 'endpoint', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'OAuthIndex',
          KeySchema: [{ AttributeName: 'oauthKey', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'ThoughtIndex',
          KeySchema: [{ AttributeName: 'thoughtId', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'EndpointIndex',
          KeySchema: [{ AttributeName: 'endpoint', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
    })
  )

  console.log('Table and GSIs created successfully')
}

setup().catch(console.error)

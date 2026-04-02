/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { loginUser, createUser, getUser } from './user'
import { checkLive, checkReady } from './health'
import { jwt, error, config } from './shared'

function response(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  }
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event?.requestContext?.http?.method
  if (!method) {
    console.error('Unexpected event shape:', JSON.stringify(event, null, 2))
    throw new Error('Missing HTTP method')
  } else if (method === 'OPTIONS') {
    console.log('Received OPTIONS request, returning 200 for CORS preflight')
    return response(200, {})
  }

  const path = event.rawPath
  const authHeader = event.headers['authorization']
  const token = authHeader?.split(' ')[1] ?? undefined

  try {
    const body = event.body
      ? JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body)
      : {}
    // no auth
    if (method === 'GET') {
      if (path === '/health/live') {
        const status = checkLive()
        return response(200, status)
      } else if (path === '/health/ready') {
        const status = checkReady()
        return response(200, status)
      } else if (path === '/user/config') {
        const userConfig = config.getUserConfig()
        return response(200, userConfig)
      }
    } else if (method === 'POST') {
      if (path === '/user/login') {
        const token = await loginUser(body)
        return response(200, token)
      } else if (path === '/user') {
        const result = await createUser(body)
        return response(201, result)
      }
    }

    // auth required for all other routes - verify token
    if (!token) {
      throw new error.ValidationError('Missing token')
    }

    let pk: string
    try {
      pk = jwt.verifyToken(token)
    } catch {
      throw new error.ForbiddenError('Invalid token')
    }

    if (path === '/user' && method === 'GET') {
      const user = await getUser(pk)
      return response(200, user)
    }

    return response(404, { message: 'Not found' })
  } catch (err) {
    console.dir(err)
    const appError = err as error.AppError
    const status = appError.status ?? 500
    const expose = appError.expose ?? false
    if (expose) {
      const details = typeof appError.toJSON === 'function' ? appError.toJSON() : { message: (err as Error).message }
      return response(status, details)
    } else {
      return response(status, { message: 'Internal Server Error' })
    }
  }
}

import { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda'
import { loginUser, createUser, getUser } from './user'
import { jwt, error } from './shared'

function response(statusCode: number, body: unknown): CloudFrontRequestResult {
  return {
    status: String(statusCode),
    headers: {
      'content-type': [{ key: 'Content-Type', value: 'application/json' }],
      'access-control-allow-origin': [{ key: 'Access-Control-Allow-Origin', value: '*' }],
    },
    body: JSON.stringify(body),
  }
}

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request
  const method = request.method
  const path = request.uri
  const authHeader = request.headers['authorization']?.[0]?.value
  const token = authHeader?.split(' ')[1] ?? undefined

  try {
    const body = request.body?.data
      ? JSON.parse(Buffer.from(request.body.data, request.body.encoding === 'base64' ? 'base64' : 'utf8').toString())
      : {}

    // no auth
    if (path === '/user/login' && method === 'POST') {
      const token = await loginUser(body)
      return response(200, token)
    }

    if (path === '/user' && method === 'POST') {
      const result = await createUser(body)
      return response(201, result)
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

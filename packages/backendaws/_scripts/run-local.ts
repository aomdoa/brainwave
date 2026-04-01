import { handler } from '../src/index'

// Mimics the shape of a CloudFront event so the handler runs identically to prod
function makeEvent(method: string, path: string, body?: unknown, token?: string) {
  const bodyStr = body ? JSON.stringify(body) : ''
  return {
    Records: [
      {
        cf: {
          request: {
            method,
            uri: path,
            headers: token ? { authorization: [{ key: 'Authorization', value: `Bearer ${token}` }] } : {},
            body: body
              ? {
                  inputTruncated: false,
                  action: 'read-only',
                  encoding: 'text',
                  data: bodyStr,
                }
              : undefined,
          },
        },
      },
    ],
  }
}

async function create() {
  const [, , method = 'POST', path = '/user'] = process.argv
  const body = {
    name: 'David Test 2',
    email: 'david2@test.com',
    password: 'supersecret123',
    confirmPassword: 'supersecret123',
  }

  console.log(`\n→ ${method} ${path}`)
  console.log('Body:', JSON.stringify(body, null, 2))

  const result = await handler(makeEvent(method, path, body) as any)
  console.log('\nResponse:', JSON.stringify(result, null, 2))
}

async function login() {
  const [, , method = 'POST', path = '/user/login'] = process.argv
  const body = {
    email: 'david2@test.com',
    password: 'supersecret123',
  }

  console.log(`\n→ ${method} ${path}`)
  console.log('Body:', JSON.stringify(body, null, 2))

  const result = await handler(makeEvent(method, path, body) as any)
  console.log('\nResponse:', JSON.stringify(result, null, 2))
}

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwayI6IlVTRVIjMDFLTjRKMEpKOTNEWTJYSDFQVDI0QVhWMUoiLCJpYXQiOjE3NzUwNTcxNDQsImV4cCI6MTc3NTA3ODc0NH0.sO_9D5qcq0KApTrhsA24fdiimhJXwJMrz4HgY2kz018'
async function getUser() {
  const [, , method = 'GET', path = '/user'] = process.argv

  console.log(`\n→ ${method} ${path}`)
  console.log(`Token: ${token}`)

  const result = await handler(makeEvent(method, path, undefined, token) as any)
  console.log('\nResponse:', JSON.stringify(result, null, 2))
}

//create().catch(console.error)
//login().catch(console.error)
getUser().catch(console.error)

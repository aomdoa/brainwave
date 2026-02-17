/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Express } from 'express'
import { createUser } from '../services/user.service'

export function registerAuthRoutes(app: Express): void {
  app.post('/register', async (req, res, next) => {
    try {
      await createUser(req.body)
      return res.json({ message: 'User registered successfully' })
    } catch (err) {
      return next(err)
    }
  })

  app.post('/login', (_req, res) => {
    // const username = req.body.username
    // const password = req.body.password
    // Placeholder for login logic
    res.json({ message: 'Login endpoint - not implemented yet' })
  })
}

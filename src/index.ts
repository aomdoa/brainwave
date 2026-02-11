/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express from 'express'
import { config } from './config'

const app = express()

app.get('/', (_req, res) => {
  res.json({ message: 'Brainwave is alive!' })
})

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})

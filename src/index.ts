/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express from 'express'

const app = express()

app.get('/', (_req, res) => {
  res.json({ message: 'Brainwave is alive!' })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

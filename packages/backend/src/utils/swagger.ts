/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import YAML from 'yamljs'
import SwaggerParser from '@apidevtools/swagger-parser'
import { config } from './config'

export async function setupSwagger(app: express.Express) {
  const docsDir = path.join(__dirname, '../docs')
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.yaml'))
  let combinedSpec: any = {
    openapi: '3.0.0',
    servers: [
      {
        url: config.DOCS_BASE,
      },
    ],
    info: { title: 'Brainwave API', version: '1.0.0', description: 'Welcome to the Brainwave API' },
    paths: {},
    components: { schemas: {}, securitySchemes: {} },
  }

  // merge the files
  for (const file of files) {
    const filePath = path.join(docsDir, file)
    const doc = YAML.load(filePath)

    combinedSpec.paths = { ...combinedSpec.paths, ...doc.paths }
    if (doc.components) {
      combinedSpec.components.schemas = { ...combinedSpec.components.schemas, ...(doc.components.schemas || {}) }
      combinedSpec.components.securitySchemes = {
        ...combinedSpec.components.securitySchemes,
        ...(doc.components.securitySchemes || {}),
      }
    }
  }

  const dereferencedSpec = await SwaggerParser.dereference(combinedSpec)
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(dereferencedSpec, {
      customSiteTitle: 'Brainwave API',
      swaggerOptions: {
        docExpansion: 'none',
      },
    })
  )
}

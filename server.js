import express from 'express'

import { initMiddleware } from './src/middleware.js'
import { initRoutes } from './src/router.js'

const app = express()

initMiddleware(app)
initRoutes(app)

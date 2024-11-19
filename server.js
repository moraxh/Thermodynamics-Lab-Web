import express from 'express'

import './utils/dotenv.js'
import { initLiveReload } from './utils/livereload.js'
import { initMiddleware } from './src/middleware.js'
import { initRoutes } from './src/router.js'

const app = express()

initLiveReload(app)
initMiddleware(app)
initRoutes(app)

import express from 'express'
import favicon from 'serve-favicon'
import expressLayouts from 'express-ejs-layouts'

import { locpath } from '../utils/locpath.js'

export const initMiddleware = (app) => {
  // Static files
  app.use('/public', express.static(locpath.public_('')))

  // Express layouts
  app.use(expressLayouts)

  // Favicon
  app.use(favicon(locpath.public_('favicon.ico')))

  // Use view engine
  app.set('view engine', 'ejs')

  // Set views directory
  app.set('views', locpath.view(''))
}

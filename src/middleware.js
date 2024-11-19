import path from 'node:path'
import express from 'express'
import favicon from 'serve-favicon'
import expressLayouts from 'express-ejs-layouts'

export const initMiddleware = (app) => {
  // Static files
  app.use('/public', express.static(path.join(process.cwd(), 'public')))

  // Express layouts
  app.use(expressLayouts)

  // Favicon
  app.use(favicon(path.join(process.cwd(), 'public', 'favicon.ico')))

  // Use view engine
  app.set('view engine', 'ejs')

  // Set views directory
  app.set('views', path.join(process.cwd(), 'src/views'))
}

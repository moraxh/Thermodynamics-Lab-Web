import dotenv from 'dotenv'
import process from 'node:process'

dotenv.config()

const port = process.env.PORT || 3000

export const initRoutes = (app) => {
  app.get('/', (req, res) => {
    return res.render('pages/home', { title: 'Laboratorio de Sistemas Termodinamicos' })
  })

  app.get('/us', (req, res) => {
    return res.render('pages/us', { title: 'Laboratorio de Sistemas Termodinamicos' })
  })
  
  app.get('/publications', (req, res) => {
    return res.render('pages/publications', { title: 'Laboratorio de Sistemas Termodinamicos' })
  })

  app.use((req, res) => {
    // TODO -- Redirect to a 404 page
    res.status(404).send('Page not found')
  })

  app.listen(port, () => {
    console.log('Server listening on http://localhost:' + port)
  })
}

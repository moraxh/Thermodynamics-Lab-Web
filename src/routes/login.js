import express from 'express'
export const loginRouter = express.Router()

loginRouter.get('/', (req, res) => res.render('pages/login', { title: 'Login', layout: 'layouts/empty' }))

loginRouter.post('/', (req, res) => {
  res.redirect('/')
})

loginRouter.get('/logout', (req, res) => {
  res.redirect('/')
})

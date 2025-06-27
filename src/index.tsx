import { Hono } from 'hono'
import { renderer } from './renderer'
import api from './api'
import App from './App'

const app = new Hono()

app.route('/api', api)

app.use(renderer)

app.get('/', (c) => {
  return c.render(<App />)
})

app.get('*', (c) => {
  return c.render(<App />)
})

export default app

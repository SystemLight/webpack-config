import axios from 'axios'
import './style.styl'

import routes from './routes'

axios.get('/api/demo').then(({data}) => {
  console.log('hello', data)
  console.log(routes)
})

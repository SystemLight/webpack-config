import axios from 'axios'
import './style.styl'

import route from './routes/index'

console.log('12333555')
console.log(route)
axios.get('/api/demo').then(({data}) => {
  console.log('hello', data)
})

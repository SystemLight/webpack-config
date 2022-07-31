import axios from 'axios'
import './style.styl'

axios.get('/api/demo').then(({data}) => {
  console.log('hello', data)
})

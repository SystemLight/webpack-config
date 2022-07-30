import axios from 'axios'
import './style.css'

axios.get('/api/demo').then(({data}) => {
  console.log('hello', data)
})

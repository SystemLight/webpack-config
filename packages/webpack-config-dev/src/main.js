import axios from 'axios'

axios.get('/api/demo').then(({data}) => {
  console.log('hello', data)
})

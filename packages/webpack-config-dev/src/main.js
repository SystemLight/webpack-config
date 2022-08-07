import axios from 'axios'
// import './style.styl'
import {createApp} from 'vue'
import routes from './routes'

const app = createApp()
app.mount('#app')

axios.get('/api/demo').then(({data}) => {
  console.log('hello', data)
  console.log(routes)
})

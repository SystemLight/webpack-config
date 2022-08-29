// import axios from 'axios'

// import(/* webpackPrefetch: true */ './foo').then((foo)=>{
//   console.log(foo)
// })
// // axios.get('/api/demo').then(({data}) => {
// //   console.log('hello', data)
// // })

let a = () => import(/* webpackChunkName: "axios" */ /* webpackPrefetch: true */ 'axios')
let v = () => import(/* webpackChunkName: "vue" */ /* webpackPrefetch: true */ 'vue')

let btn = document.createElement('button')
btn.innerText = '按钮'
btn.onclick = function () {
  a().then((foo) => {
    console.log(foo)
  })
}

document.body.append(btn)

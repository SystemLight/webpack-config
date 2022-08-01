/**
 * 渲染vue路由
 * @param {{name:string,exact:boolean,path:string,component:string}} route
 * @param {FileInfo} info
 * @return {*}
 */
function vueRouteRender(route, info) {
  console.log('vue render')
  return {
    name: route.name,
    path: route.path,
    component: 'a'
  }
}

module.exports = {
  vueRouteRender
}

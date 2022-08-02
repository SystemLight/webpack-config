/**
 * 渲染vue路由
 * @param {Routes[]?} routes
 * @return {string}
 */
function vueRoutesRender(routes) {
  return loadRoutes(routes).replace(/(^\[)|(]$)/g, '')
}

function loadRoutes(routes) {
  let routesStr = '['
  for (let route of routes) {
    routesStr += `{
      name: '${route.name}',
      path: '${route.path}',
      component: require('${route.component}'),
      children: ${loadRoutes(route.routes)}
    },`
  }
  routesStr += ']'
  return routesStr
}

module.exports = vueRoutesRender

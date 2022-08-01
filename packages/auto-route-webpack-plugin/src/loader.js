const {NS, routesTag, routesTagMatch} = require('./constant')

function loader(source) {
  const loaderContext = this
  let routes = loaderContext[NS]
  source = source.replace(routesTagMatch, `${routesTag}\n${routes}`)
  return source
}

module.exports = loader

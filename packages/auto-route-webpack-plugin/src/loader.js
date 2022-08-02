const {NS, routesTag, routesTagMatch} = require('./constant')
const schema = require('./loader-schema.json')

function loader(source) {
  const loaderContext = this
  const options = loaderContext.getOptions(schema)

  let routes = loaderContext[NS]
  source = source.replace(routesTagMatch, `${routesTag}\n${routes}`)

  if (options['debug']) {
    console.log(routes)
  }

  return source
}

module.exports = loader

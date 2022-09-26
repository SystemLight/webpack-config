import {NS, routesTag, routesTagMatch} from './constant'

const schema = require('./schema.json').definitions.LoaderOptions

function loader(source) {
  // @ts-ignore
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

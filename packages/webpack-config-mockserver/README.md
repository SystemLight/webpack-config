# @systemlight/webpack-config-mockserver

[![NPM version](https://img.shields.io/npm/v/@systemlight/webpack-config-mockserver.svg)](https://www.npmjs.com/package/@systemlight/webpack-config-mockserver)

> Webpack configure mock server middleware.

### Usage

- `mock/index.js`

```javascript
const mocks = [
  // #auto-mock
]

module.exports = mocks
```

- `webpack.config.js`

```javascript
const webpack5RecommendConfig = require('@systemlight/webpack-config')
const {mockServer} = require('@systemlight/webpack-config-mockserver')

module.exports = (env, argv) => new webpack5RecommendConfig(env, argv, {
  enableMock: true,
  mockServer: mockServer
})
  .build()
  .toConfig()
```

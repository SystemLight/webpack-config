const {wcf} = require('../src/main')

wcf({
  buildConfigCallback(config) {
    config.value = {
      mode: 'development',
      stats: false,
      devtool: false,
      infrastructureLogging: {
        level: 'log'
      },
      externals: [
        {
          react: {}
        }
      ],
      output: {
        clean: true,
        library: {
          type: 'var',
          name: 'a',
          export: 'a'
        }
      },
      context: '.',
      resolve: {
        alias: {
          '@': 'src/'
        }
      },
      module: {
        rules: [
          {
            test: '',
            use: [
              {
                loader: '',
                options: {}
              }
            ]
          }
        ]
      },
      plugins: [new MyPlugin()]
    }
  }
})

# @systemlight/webpack-config

> Webpack common configuration.

### 支持环境

- [x] webpack
- [x] babel
- [x] mockjs
- [x] typescript
- [x] less
- [ ] scss
- [x] postcss
- [x] react
- [ ] vue2

### Usage

```bash
npm i @systemlight/webpack-config --save-dev
yarn add @systemlight/webpack-config -D
```

in `webpack.config.js`

```js
module.exports = (env, argv) => require('@systemlight/webpack-config')(env, argv).toConfig();
```

in `package.json`

```json
{
    "scripts": {
        "dev": "webpack serve --mode development",
        "build": "webpack --mode production"
    }
}
```

### 约定

- mocks文件夹中的脚本可以生成mock数据

in `mocks/index.js`

```js
const mocks = [
    {
        url: '/api/oauth/login',
        type: 'post',
        response: (req, res) => {
            return {
                code: 20000,
                data: {
                    token: 'token'
                }
            };
        }
    },
    {
        url: '/api/users/me',
        type: 'get',
        response: (req, res) => {
            return {
                code: 20000,
                data: {
                    name: 'admin',
                    avatar: 'https://pic4.zhimg.com/v2-bd8ac878e4886e6e41c8accd0b10625f_is.jpg',
                    roles: ['admin']
                }
            };
        }
    }
];

module.exports = {
    mocks
};
```

- public文件夹会被复制到目标编译文件中

- template.ejs会替换HtmlWebpackPlugin的默认模板

### 可选配置

#### Babel

- react

```shell
npm i @babel/core @babel/preset-env @babel/preset-react -D

or

npm i @systemlight/fabric -D
```

in `babel.config.js`

```js
module.exports = function (api) {
    api.cache(true);

    return {
        comments: true,
        presets: [
            [
                '@babel/env',
                {
                    targets: {
                        ie: '11',
                        edge: '17',
                        firefox: '60',
                        chrome: '67',
                        safari: '11.1'
                    },
                    useBuiltIns: 'usage',
                    modules: false,
                    corejs: {
                        'version': 3,
                        'proposals': true
                    }
                }
            ],
            '@babel/react'
        ]
    };
};
```

- vue

#### TypeScript

```shell
npm i typescript -D

or

npm i @systemlight/fabric -D
```

```json
{
  "include": [
    "src/**/*",
    "types/**/*",
    "tests/**/*"
  ],
  "exclude": [
    "src/assets/**/*",
    "src/styles/**/*",
    "node_modules/**/*",
    "**/*.spec.ts"
  ],
  "compilerOptions": {
    // 配置：https://www.typescriptlang.org/zh/tsconfig，Node版本V12.18.3
    "target": "es2019",
    "module": "esNext",
    "allowJs": false,
    "jsx": "react",
    "declaration": false,
    "sourceMap": true,
    "removeComments": false,
    "noEmit": false,
    "isolatedModules": false,
    "strict": true,
    "noImplicitAny": false,
    "suppressImplicitAnyIndexErrors": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": false,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  }
}
```

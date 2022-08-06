# @systemlight/auto-route-webpack-plugin

[![NPM version](https://img.shields.io/npm/v/@systemlight/auto-route-webpack-plugin.svg)](https://www.npmjs.com/package/@systemlight/auto-route-webpack-plugin)

> Webpack plug-in that traverses the directory to generate information.

- [灵感来源](https://v3.umijs.org/zh-CN/docs/convention-routing)

## 路由规则

### 默认文件忽略规则

- 以 . 或 _ 开头的文件或目录
- 以 d.ts 结尾的类型定义文件
- 包含 test、spec、e2e 的测试文件（适用于 .js、.jsx 和 .tsx 文件）
- components 和 component 目录
- utils 和 util 目录
- 不是 .js、.jsx、.ts 或 .tsx 文件

### 动态路由

约定 [] 包裹的文件或文件夹为动态路由。

比如：

```
src/pages/users/[id].tsx 会成为 /users/:id
src/pages/users/[id]/settings.tsx 会成为 /users/:id/settings
```

约定 [ $] 包裹的文件或文件夹为动态可选路由

### 嵌套路由

约定目录下有 _layout.tsx 时会生成嵌套路由，以 _layout.tsx 为该目录的 layout

## 使用方法

配置webpack

```javascript
// 内置了一个vue路由渲染器
const {AutoRouteWebpackPlugin, vueRoutesRender} = require('@systemlight/auto-route-webpack-plugin')

module.exports = {
    ...

    plugins: [
      new AutoRouteWebpackPlugin({
        targetPath: './src/views',
        importPath: '@/views',
        loaderTest: /routes\/index\.js$/,
        routesRender: vueRoutesRender
      })
    ]

  ...
}
```

配置vue.config.js

```javascript
const {AutoRouteWebpackPlugin, vueRoutesRender} = require('@systemlight/auto-route-webpack-plugin')

{
  configureWebpack:{
    plugins: [
      new AutoRouteWebpackPlugin({
        targetPath: './src/views',
        importPath: '@/views',
        loaderTest: /routes\/index\.js$/,
        routesRender: vueRoutesRender
      })
    ]
  }
}
```

routes 文件添加标记

```javascript
// https://v3.router.vuejs.org/zh/api/
const router = new VueRouter({
  base: '/',
  mode: 'history',
  routes: [
    // @auto-routes
    {
      name: '404',
      path: '/:pathMatch(.*)',
      alias: '/404',
      component: Code404
    }
  ]
})

export default router
```

## 配置参数

- targetPath：扫描文件的路径，根据此目录下的文件生成路由
- importPath：导入的前缀路径，如@/views
- publicPath：目录的访问前缀
- ignores：通用忽略正则表达式数组
- ignoreFiles：文件忽略正则表达式数组
- ignoreFolders：文件夹忽略正则表达式数组
- renderRoute：渲染路由函数
- loaderTest：用于路由注入位置，文件内需要包含`// @auto-routes`标记用来替换生成的路由

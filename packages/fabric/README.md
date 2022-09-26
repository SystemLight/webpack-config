# @systemlight/fabric

[![NPM version](https://img.shields.io/npm/v/@systemlight/fabric.svg)](https://www.npmjs.com/package/@systemlight/fabric)

> 一个包含 prettier，eslint，stylelint 的配置文件合集

## Usage

### 安装

```shell
npm i @systemlight/fabric --save-dev
yarn add @systemlight/fabric -D
```

### prettier

in `.prettierrc.js`

```javascript
const fabric = require('@systemlight/fabric')

module.exports = {
  ...fabric.prettier,
}
```

in `package.json`

```json
{
  "lint:prettier": "prettier -w \"src/**/*.{vue,js,jsx,ts,tsx}\"",
  "lint:m:prettier": "prettier -w \"packages/**/*.{vue,js,jsx,ts,tsx}\""
}
```

### eslint

in `.eslintrc.js`

```javascript
module.exports = {
  extends: [require.resolve('@systemlight/fabric/dist/eslint')]
}
```

in `package.json`

```json
{
  "lint:eslint-check": "eslint --ext vue,js,jsx,ts,tsx \"src/**.{vue,js,jsx,ts,tsx}\"",
  "lint:eslint": "eslint --fix --ext vue,js,jsx,ts,tsx \"src/**.{vue,js,jsx,ts,tsx}\"",
  "lint:m:eslint-check": "eslint --ext vue,js,jsx,ts,tsx \"packages/*/src/**.{vue,js,jsx,ts,tsx}\"",
  "lint:m:eslint": "eslint --fix --ext vue,js,jsx,ts,tsx \"packages/*/src/**.{vue,js,jsx,ts,tsx}\""
}
```

### stylelint

in `.stylelintrc.js`

```javascript
module.exports = {
  extends: [require.resolve('@systemlight/fabric/dist/stylelint')]
}
```

in `package.json`

```json
{
  "lint:eslint-check": "eslint --ext vue,js,jsx,ts,tsx \"src/**.{vue,js,jsx,ts,tsx}\"",
  "lint:eslint": "eslint --fix --ext vue,js,jsx,ts,tsx \"src/**.{vue,js,jsx,ts,tsx}\"",
  "lint:m:eslint-check": "eslint --ext vue,js,jsx,ts,tsx \"packages/*/src/**.{vue,js,jsx,ts,tsx}\"",
  "lint:m:eslint": "eslint --fix --ext vue,js,jsx,ts,tsx \"packages/*/src/**.{vue,js,jsx,ts,tsx}\""
}
```

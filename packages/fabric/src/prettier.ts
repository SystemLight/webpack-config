import type {Config} from 'prettier'

// https://prettier.io/docs/en/options.html
let prettierConfig: Config = {
  printWidth: 120,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'none',
  bracketSpacing: false,
  bracketSameLine: true,
  arrowParens: 'always',
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'strict',
  vueIndentScriptAndStyle: false,
  endOfLine: 'crlf',
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: false,
  overrides: [
    {
      files: ['.prettierrc'],
      options: {
        parser: 'json'
      }
    },
    {
      files: '*.ejs',
      options: {
        parser: 'html'
      }
    }
  ]
}

export default prettierConfig

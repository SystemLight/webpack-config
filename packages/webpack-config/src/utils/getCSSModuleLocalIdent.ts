/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')
 */

import * as path from 'node:path'

import loaderUtils from 'loader-utils'
import type {LoaderContext} from 'webpack'

export function getLocalIdent(context: LoaderContext<any>, localIdentName: string, localName: string) {
  // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
  const fileNameOrFolder = context.resourcePath.match(/index\.module\.(css|s[ca]ss|less|styl(us)?)$/)
    ? '[folder]'
    : '[name]'

  // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
  const hash = loaderUtils.getHashDigest(
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    'md5',
    'base64',
    5
  )

  // Use loaderUtils to find the file or folder name
  const className = loaderUtils.interpolateName(context, fileNameOrFolder + '_' + localName + '__' + hash)

  // Remove the .module that appears in every classname when based on the file and replace all "." with "_".
  return className.replace('.module_', '_').replace(/\./g, '_')
}

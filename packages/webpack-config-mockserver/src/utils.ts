/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url: string) {
  let search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  let obj = {}
  let searchArr = search.split('&')
  searchArr.forEach((v) => {
    let index = v.indexOf('=')
    if (index !== -1) {
      obj[v.substring(0, index)] = v.substring(index + 1, v.length)
    }
  })
  return obj
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments deepClone')
  }
  let targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

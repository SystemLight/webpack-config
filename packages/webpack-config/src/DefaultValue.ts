import type {Dict} from './interface/Webpack5RecommendConfigOptions'

export type DefaultValueClassOptions<T = any> = {
  [K in keyof T]: DefaultValueClass<T[K]>
}

type InitValueFactory = (self: Dict) => any

export class DefaultValueClass<T = any> {
  constructor(private initValueFactory: InitValueFactory) {}

  val(self: Dict): T {
    return this.initValueFactory(self)
  }

  reset(initValueFactory: InitValueFactory) {
    this.initValueFactory = initValueFactory
  }
}

export function DefaultValueMap<T extends object>(obj: T): DefaultValueClassOptions<T> {
  let newObj: any = {}
  for (let key in obj) {
    newObj[key] = DefaultValue(() => obj[key])
  }
  return newObj
}

function DefaultValue<T = any>(initValueFactory: InitValueFactory) {
  return new DefaultValueClass<T>(initValueFactory)
}

DefaultValue.target = Symbol('DefaultValueTarget')

DefaultValue.wrap = function <T extends object = any> (target: T) {
  return new Proxy<T>(target, {
    get(target: any, p: string | symbol): any {
      if (typeof p === 'symbol') {
        if (p === DefaultValue.target) {
          return target
        }
        return undefined
      }

      return DefaultValue.unpackProperty(target, p)
    },
    set(): boolean {
      return false
    }
  })
}

DefaultValue.unpack = function <T extends object = any> (obj): T {
  let newObj: any = {}

  if (DefaultValue.isProxy(obj)) {
    obj = obj[DefaultValue.target]
  }

  for (let key in obj) {
    newObj[key] = DefaultValue.unpackProperty(obj, key)
  }

  return newObj
}

DefaultValue.unpackProperty = function (obj: Dict, key: string) {
  if (DefaultValue.is(obj[key])) {
    return obj[key].val(obj)
  }
  return obj[key]
}

/**
 * 判断给定的值或者对应对象的指定属性下的值是否为默认值
 * @param args - [值] [对象（代理对象|普通对象），键名]
 */
DefaultValue.is = function (...args): boolean {
  if (args.length === 1) {
    return args[0] instanceof DefaultValueClass
  }

  if (args.length === 2) {
    if (DefaultValue.isProxy(args[0])) {
      return args[0][DefaultValue.target][args[1]] instanceof DefaultValueClass
    }

    return args[0][args[1]] instanceof DefaultValueClass
  }

  throw TypeError('Incorrect number of formal parameters')
}

DefaultValue.isProxy = function (obj) {
  return !!obj[DefaultValue.target]
}

export default DefaultValue

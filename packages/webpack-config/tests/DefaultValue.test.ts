import DefaultValue, {DefaultValueMap} from '@/DefaultValue'

describe('DefaultValue', () => {
  test('操作 DefaultValue 值', () => {
    let context = {}

    let dv = DefaultValue((self) => {
      expect(self).toBe(context)
      return 'value'
    })

    // 获取基础值
    expect(dv.val(context)).toBe('value')

    // DefaultValue类型判断
    expect(DefaultValue.is(dv)).toBeTruthy()
    expect(DefaultValue.is(dv.val(context))).toBeFalsy()

    // 重置默认基础值
    dv.reset(() => 233)
    expect(dv.val({})).toBe(233)
  })

  test('操作 DefaultValue Map', () => {
    let sourceVal = {
      name: 'zyp',
      age: 12
    }
    let dvOptions = DefaultValueMap(sourceVal)
    let userOptions = {
      name: 'zyp'
    }
    let mergeOptions = Object.assign(dvOptions, userOptions)

    expect(DefaultValue.is(mergeOptions, 'name')).toBeFalsy()
    expect(DefaultValue.is(mergeOptions, 'age')).toBeTruthy()

    // 拆包属性
    expect(DefaultValue.unpackProperty(mergeOptions, 'name')).toBe('zyp')
    expect(DefaultValue.unpackProperty(mergeOptions, 'age')).toBe(12)

    // 拆包完整对象
    let unpackOptions = DefaultValue.unpack(mergeOptions)
    expect(unpackOptions).toEqual(sourceVal)

    expect(DefaultValue.isProxy(mergeOptions)).toBeFalsy()
    expect(DefaultValue.isProxy(unpackOptions)).toBeFalsy()

    // 封包 DefaultValue 代理对象
    let proxyOptions = DefaultValue.wrap(dvOptions)
    expect(DefaultValue.isProxy(proxyOptions)).toBeTruthy()

    // 拆包 DefaultValue 代理对象
    expect(DefaultValue.unpack(proxyOptions)).toEqual(sourceVal)
  })
})

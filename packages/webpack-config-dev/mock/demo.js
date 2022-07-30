module.exports = [
  {
    url: '/api/demo',
    type: 'get',
    response: (req) => {
      return {
        code: 200,
        msg: 'ok'
      }
    }
  }
]

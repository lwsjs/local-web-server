import koaRange from 'koa-range'

class Range {
  description () {
    return 'Support for HTTP Range Requests.'
  }

  middleware () {
    return koaRange
  }
}

export default Range

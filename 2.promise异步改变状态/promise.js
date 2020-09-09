const STATUS = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED'
}

class Promise {
  constructor(executor) {
    this.status = STATUS.PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallbacks = []   // 存放成功的回调
    this.onRejectedCallbacks = []   // 存放失败的回调
    const resolve = val => {
      if(this.status === STATUS.PENDING) {
        this.status = STATUS.FULFILLED
        this.value = val
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if(this.status === STATUS.PENDING) {
        this.status = STATUS.REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch(e) {
      // 出错走失败逻辑
      reject(e)
    }
  }
  
  then(onFulfilled, onRejected) {
    if(this.status === STATUS.FULFILLED) {
      onFulfilled(this.value)
    }
    if(this.status === STATUS.REJECTED) {
      onRejected(this.reason)
    }
    if(this.status === STATUS.PENDING) {
      // 装饰模式 切片编程
      this.onResolvedCallbacks.push(() => {   // todo..
        onFulfilled(this.value)
      })
      this.onRejectedCallbacks.push(() => {   // todo..
        onRejected(this.reason)
      })
    }
  }
}


module.exports = Promise
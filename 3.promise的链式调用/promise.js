const STATUS = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED'
}

// 这里也有相应的 Promise A+ 规范
function resolvePromise(x, promise2, resolve, reject) {
  if (promise2 === x) { // 如果是自己的话，自己调自己会死循环
    return reject(new TypeError('出错了'))
  }
  // 看 x 是普通值还是 promsie，如果是 promise 要采用他的状态
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    /*
    p.then(r => {
      return new Promise((resolve, reject) => {
        reject(100)
        resolve
        throw new Eroor()
        // 所以这3种状态都要增加开关
      })
    })
    */
   // 为了上面这种情况 不会在一个 Promsie 中 同时调用 resolve 和 reject 都有效，内部状态改变了就不能变了，增加 called 这个开关
  //  这里的reject和 resolve 参数是then方法内部 隐藏创建的那个新的 promise 的
    let called   
    try {
      // x可以使一个对象或者函数
      let then = x.then; // 就看一下这个对象是否有 then 方法
      if (typeof then === 'function') {
        // then 是函数 我就认为这个x是一个promise
        //  如果x是promise 那么久采用他的状态
        // 为什么要用这种方式执行呢，为了确保then的唯一性，就是上面定义的那个，因为如果重新取的话，可能别人的会修改，如Object.defineProperty 修改
        then.call(x, function(y) {   // 调用返回的promise，用他的结果 作为下一次then的结果
          if(called) return
          called = true
          resolvePromise(y, promise2, resolve, reject)   // 递归调用
        }, function(r) {  
          if(called) return
          called = true
          reject(r)
        })
      } else {
        resolve(x) // 此时x 就是一个普通对象
      }
    } catch (e) {
      if(called) return
      called = true
      reject(e)   // 取then时抛出错误
    }
  } else {
    resolve(x) // x 是一个原始数据类型， 不是promise
  }

  // 不是 promise 直接就调用 resolve

}

class Promise {
  constructor(executor) {
    this.status = STATUS.PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallbacks = [] // 存放成功的回调
    this.onRejectedCallbacks = [] // 存放失败的回调
    const resolve = val => {
      if (this.status === STATUS.PENDING) {
        this.status = STATUS.FULFILLED
        this.value = val
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status === STATUS.PENDING) {
        this.status = STATUS.REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      // 出错走失败逻辑
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === STATUS.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(x, promise2, resolve, reject)
          } catch (e) {
            // 出错走失败逻辑
            reject(e)
          }
        })
      }
      if (this.status === STATUS.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(x, promise2, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      if (this.status === STATUS.PENDING) {
        // 装饰模式 切片编程
        this.onResolvedCallbacks.push(() => { // todo..
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(x, promise2, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push(() => { // todo..
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(x, promise2, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    })
    return promise2

  }
}


module.exports = Promise
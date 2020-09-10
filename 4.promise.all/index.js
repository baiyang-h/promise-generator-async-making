const Promise = require('./promise')


/**
 * 1. Promise 是一个类，类中的构造函数需要传入一个 excutor 默认就会执行
 * 2. excutor中有两个参数，分别是 resolve ，reject
 * 3. 默认创建一个 promise 状态就是 pending、fulfilled、rejected，promise 有三个状态
 * 4. 调用成功和失败时，需要传递一个成功的原因和失败的原因
 * 5. 如果已经成功了就不能失败了
 * 6. 每一个 promise 实例都有一个 then 方法
 * 7. 如果抛出异常按照失败来处理
 */

/**
 * promise 的链式调用问题
 * 1. 如果then方法中（成功或者失败）返回的不是一个promise，会将这个值传递给外层下一次then的成功结果
 * 2. 如果执行then方法中的方法出错了，抛出异常，走下一个then的失败
 * 3. 如果返回的是一个promise，会用这个promise的结果作为下一次then的成功或者失败
 * 
 * 1. 出错会失败   2. 返回的promise
 * 
 * then 方法为什么可以链式调用 每次调用then都返回一个新的promise
 * catch 就是 then 的别名， 没有成功只有失败（找最近的优先处理，处理不了找下一层）
 */


//  判断是否是一个 promise
function isPromise(val) {
  return val && (typeof val.then == 'function')
}

Promise.all = function(promises) {
  return new Promise((resolve, reject) => {
    let result = []
    let times = 0
    function processData(index, val) {
      result[index] = val
      if(++times === promises.length) {
        resolve(result)
      }
    }

    for(let i=0; i<promises.length; i++) {
      let p = promises[i]
      if(isPromise(p)) {
        p.then(data => {
          processData(i, data)
        }, reject)
      } else {
        processData(i, p)   // 普通值
      }
    }
  })
}


const p1 = new Promise(resolve => {
  resolve(111)
})
const p2 = new Promise(resolve => {
  setTimeout(() => {
    resolve(222)
  }, 2000)
})
Promise.all([1, p1, p2]).then(r => {
  console.log(r)
})
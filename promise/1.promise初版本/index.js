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



let p = new Promise((resolve, reject) => {
  resolve(111)
  // reject(222)
  // throw new Error(333)
})
p.then(data => {
  console.log('success', data)
}, reason => {
  console.log('fail', reason)
})
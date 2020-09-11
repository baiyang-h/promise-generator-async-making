// abort 方法就是  不要 promise 这次成功的结果了,, 即中断，

// 超时处理

let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功了')
  }, 3000)
})

// 做一个包装，在这个包装函数中，新创建一个 promise。在该实例上定义一个 abort 中断方法
function wrap(p1) {   // p1 是用户的， 我在内部在构建一个 promise 和 用户传入的组成一队
  let abort
  let p2 = new Promise((resolve, reject) => {
    abort = reject
  })
  // 谁先触发
  let newP = Promise.race([p1, p2])    // 如果 p2 失败了就马上失败了
  newP.abort = abort
  return newP
}


let p2 = wrap(p1)   // 包装一下
p2.then(r => {
  console.log(r)
}).catch(e => {
  console.log(e)
})


setTimeout(() => {
  // 如果超过两面就让这个promise失败掉
  p2.abort('错误信息')  // 中断。 其实就是执行 reject
}, 2000)


/*
其实就是下面这个意思，将 reject 赋值给一个变量，等要在调用的地方，调用这个变量，那么 promise 的 pendding 状态就改变了
因为 new Promise()  不调用resolve 或 reject 的话，一直是 pendding 状态
let a
let p = new Promise((reslove, reject) => {
  a = reject
})

// 3秒后， p 状态变为 reject
setTimeout(() => {
  a()  
}, 3000)

*/

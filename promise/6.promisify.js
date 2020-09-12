const fs = require('fs')

// 可以直接用 fs 的 promise 形式
// const fs = require('fs/promises')



// 将 node 的方法 转化为 promise形式
function promisify(fn) {   // 高阶函数
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, function(err, data) {
        if(err) return reject(err)
        resolve(data)
      })
    })
  }
}

const readFile = promisify(fs.readFile)     // 怎么将node的api 转化成 promise api
readFile('./package.json', 'utf8').then(data => {
  console.log(data)
})




// 比如将 fs 中的所有方法转为 promise 形式
function promisifyAll(target) {
  Reflect.ownKeys(target).forEach(key => {
    target[key+'Async'] = promisify(target[key])
  }) 
  return target
}

let obj = promisifyAll(fs)
obj.readFileAsync('./package.json', 'utf8').then(data => {
  console.log(data)
})

// 现在 node 的 util 中已经内置了 promisify 方法了

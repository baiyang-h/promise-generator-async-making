let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(111)
  }, 1000)
})

let p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(222)
  }, 3000)
})

function* gen() {
  let a = yield p1
  console.log(a)
  let b = yield p2
  console.log(b)
  return b
}

let g = gen()
// let { value, done } = g.next() 
// value.then(r => {
//   let { value, done } = g.next(r) 
//   value.then(r => {
//     g.next(r)
//     console.log(g.next())
//   })
// })

function co(it) { //  异步迭代采用函数的方式
  return new Promise((resolve, reject) => {
    function step(data) {
      let {
        value,
        done
      } = it.next(data)
      if (!done) {
        Promise.resolve(value).then(data => {
          step(data) //  递归调用  it.next(r)  将值传给 next
        }, reject)
      } else {
        resolve(value) // 将最终的结果抛出去
      }
    }
    step()
  })
}

co(g).then(r => {
  console.log('co s', r)   // 直接得到的是 生成器的 最后 结果
}).catch(e => {
  console.log('co e', e)
})
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

// 可以在babel 中进行 转义 查看到结果， 核心内容 就是和 generator 转义的是一样的
// 应用层面其实还是 generator
// 所以 async+await 就是 generator 的语法糖
async function g() {
  let p11 = await p1
  console.log(p11)
  let p22 = await p2
  console.log(p22)
  return p22
}

g()
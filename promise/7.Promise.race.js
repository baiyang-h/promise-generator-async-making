Promise.race = function(promises) {
  return new Promise((resolve, reject) => {
    for(let i=0; i<promises.length; i++) {
      let currentVal = promises[i]
      if(currentVal && currentVal.then == 'function') {
        currentVal.then(resolve, reject)
      } else {
        resolve(currentVal)
      }
    }
  })
}

let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(111)
  }, 1000)
})

let p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(111)
  }, 2000)
})

Promise.race([1, p1, p2]).then(r => {
  console.log(r)
}).catch(e => {
  console.log(e)
})
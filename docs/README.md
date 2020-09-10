# Promise

Promise 是解决异步编程的一种方案，他解决了哪些问题？

1. 异步方案，如异步并发问题（`Promise.all`）等
2. 解决回调地狱问题（上一个的输出是下一个的输入，链式操作）
3. 错误处理非常方便 catch 方法

所谓 Promise ，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。等到处于某个时间点，这些存储的结果将会被调用。

Promise 对象有以下两个特点。

（1） 对象的状态不受外界影响。Promise 对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和 `rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能：从 `pending` 变为 `fulfilled` 和从 `pending` 变为 `rejected`。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 `resolved`（已定型）。

Promise 也有一些缺点。

1. 首先，无法取消 Promise，一旦新建它就会立即执行，无法中途取消。
2. 其次，如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。
3. 第三，当处于 `pending` 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。
4. 原理依旧是基于回调函数实现的 Promise

## 基本用法

ES6规定，规定 Promise 对象是一个构造函数，用来生成 Promise 实例。

```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});

```

```js
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

也可以对 `resolve(p1)` 传入一个 Promsie 实例，他会使当前自己的状态失效，状态根据 p1 的状态老改变

```js
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)    // p2 的状态 由 p1 来决定
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))   // 打印的是这个
// Error: fail
```

上面代码中，`p1` 是一个 Promise，3s 之后变为 `rejected`。`p2` 的状态在1s之后改变，`resolve`方法返回的是 `p1`。**由于 `p2` 返回的是另一个 Promise，导致 `p2` 自己的状态无效了，由 `p1`的状态决定 `p2` 的状态**。所以被 catch 捕获。



### Promise.prototype.then()

Promise 实例具有 `then`方法，也就是说，`then`方法是定义在原型对象 `Promise.prototype` 上的。他的作用是为 Promise 实例添加状态改变时的回调函数。

方法返回的是一个新的 `Promsie` 实例（注意，不是原来那个 Promise 实例）。因此可以使用链式写法。

```js
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function (comments) {
  console.log("resolved: ", comments);
}, function (err){
  console.log("rejected: ", err);
});
```

第一个`then`方法指定的回调函数，返回的是另一个`Promise`对象。这时，第二个`then`方法指定的回调函数，就会等待这个新的`Promise`对象状态发生变化。如果变为`resolved`，就调用第一个回调函数，如果状态变为`rejected`，就调用第二个回调函数。



### Promise.prototype.catch()

`Promise.prototype.catch()`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。

```js
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // 处理 getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error);
});
```

下面是一个例子。

```js
const promise = new Promise(function(resolve, reject) {
  throw new Error('test');
});
promise.catch(function(error) {
  console.log(error);
});
// Error: test
```

上面代码中，`promise`抛出一个错误，就被`catch()`方法指定的回调函数捕获。注意，上面的写法与下面两种写法是等价的。

```js
// 写法一
const promise = new Promise(function(resolve, reject) {
  try {
    throw new Error('test');
  } catch(e) {
    reject(e);
  }
});
promise.catch(function(error) {
  console.log(error);
});

// 写法二
const promise = new Promise(function(resolve, reject) {
  reject(new Error('test'));
});
promise.catch(function(error) {
  console.log(error);
});
```

Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个`catch`语句捕获。

```js
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });

// 其实就是下面的简写
promise
  .then(function(data) { //cb
    // success
  }, null)
	.....then().
  .then(null, function(err) {
    // error
  })
```

其实简写就是 `then` 只写第一个回调，第二个参数回调不写，会默认往下传递，知道最后可以被捕获到的第二个参数回调截止。

`catch()`方法返回的也是一个 Promise 实例，所以后面可以接着调用 `then` 方法。如果没有报错，则会跳过`catch()`方法。

```js
new Promise(resolve => {
  throw new Error(123)
})
.catch(function(error) {
  //  '可以写返回的值  状态已经是 fulfilled'
  return 2222
})

console.log(p)   // Promise {<fulfilled>: 2222}

p.then(function(r) {
  console.log(r);   // 2222
});
```

上面的代码，中间的 `catch`， 捕获到了错误

```js
Promise.resolve()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function() {
  console.log('carry on');
});
```

上面的代码因为没有报错，跳过了`catch()`方法，直接执行后面的`then()`方法。此时，要是`then()`方法里面报错，就与前面的`catch()`无关了。



### Promise.prototype.finally()

`finally()`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

上面代码中，不管`promise`最后的状态，在执行完`then`或`catch`指定的回调函数以后，都会执行`finally`方法指定的回调函数。

`finally`方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 Promise 状态到底是`fulfilled`还是`rejected`。这表明，`finally`方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。

`finally`本质上是`then`方法的特例。

```js
promise
.finally(() => {
  // 语句
});

// 等同于
promise
.then(
  result => {
    // 语句
    return result;
  },
  error => {
    // 语句
    throw error;
  }
);
```

它的实现也很简单。

```js
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
```

从上面的实现还可以看到，`finally`方法总是会返回原来的值。



### Promise.all

`Promise.all()`方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.all([p1, p2, p3]);
```

上面代码中，`Promise.all()`方法接受一个数组作为参数，`p1`、`p2`、`p3`都是 Promise 实例，如果不是，就会先调用下面讲到的`Promise.resolve`方法，将参数转为 Promise 实例，再进一步处理。另外，`Promise.all()`方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例。

`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。

（1）只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。

（2）只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。



注意，如果作为参数的 Promise 实例，自己定义了`catch`方法，那么它一旦被`rejected`，并不会触发`Promise.all()`的`catch`方法。

```js
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
```

如果`p2`没有自己的`catch`方法，就会调用`Promise.all()`的`catch`方法。



### Promise.race()

`Promise.race()`方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给`p`的回调函数。



### Promise.allSettled()

`Promise.allSettled()`方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只有等到所有这些参数实例都返回结果，不管是`fulfilled`还是`rejected`，包装实例才会结束。该方法由 [ES2020](https://github.com/tc39/proposal-promise-allSettled) 引入。

```js
const promises = [
  fetch('/api-1'),
  fetch('/api-2'),
  fetch('/api-3'),
];

await Promise.allSettled(promises);
removeLoadingIndicator();
```



### Promise.resolve()

有时需要将现有对象转为 Promise 对象，`Promise.resolve()`方法就起到这个作用。

```js
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```



`Promise.resolve`方法的参数分成四种情况。

**（1）参数是一个 Promise 实例**

如果参数是 Promise 实例，那么`Promise.resolve`将不做任何修改、原封不动地返回这个实例。

**（2）参数是一个`thenable`对象**

`thenable`对象指的是具有`then`方法的对象，比如下面这个对象。

```js
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};

let p1 = Promise.resolve(thenable);
p1.then(function(value) {
  console.log(value);  // 42
});
```

`Promise.resolve`方法会将这个对象转为 Promise 对象，然后就立即执行`thenable`对象的`then`方法。

上面代码中，`thenable`对象的`then`方法执行后，对象`p1`的状态就变为`resolved`，从而立即执行最后那个`then`方法指定的回调函数，输出 42。

**（3）参数不是具有`then`方法的对象，或根本就不是对象**

如果参数是一个原始值，或者是一个不具有`then`方法的对象，则`Promise.resolve`方法返回一个新的 Promise 对象，状态为`resolved`。

```js
const p = Promise.resolve('Hello');

p.then(function (s){
  console.log(s)
});
// Hello
```

**（4）不带有任何参数**

`Promise.resolve()`方法允许调用时不带参数，直接返回一个`resolved`状态的 Promise 对象。

```js
const p = Promise.resolve();

p.then(function () {
  // ...
});
```



### Promise.reject()

`Promise.reject(reason)`方法也会返回一个新的 Promise 实例，该实例的状态为`rejected`。

```js
const p = Promise.reject('出错了');
// 等同于
const p = new Promise((resolve, reject) => reject('出错了'))

p.then(null, function (s) {
  console.log(s)
});
// 出错了
```

注意，`Promise.reject()`方法的参数，会原封不动地作为`reject`的理由，变成后续方法的参数。这一点与`Promise.resolve`方法不一致。



## 初步实现Promsie

现在我们来初步实现一个 Promise，具体Promise的实现有一个 [Promsie A+ 规范](https://www.baidu.com/link?url=oeHFauhDH_mIpXz679j9yojGn_3fl4WQK6XN2yOlYyZXNxWqtWXAsZYpdrCtmfG4&wd=&eqid=9eaace95000111c8000000055f587b80)，这里暂时只列出一部分：

1. Promise 是一个类，类中的构造函数需要传入一个 `excutor` 默认就会执行

2. `excutor`中有两个参数，分别是 `resolve` ，`reject`
3. 默认创建一个 promise 状态就是 `pending`、`fulfilled`、`rejected`，promise 有三个状态
4. 调用成功和失败时，需要传递一个成功的原因和失败的原因
5. 如果已经成功了就不能失败了
6. 每一个 promise 实例都有一个 `then` 方法
7. 如果抛出异常按照失败来处理

```js
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
```

```js
const STATUS = {      // Promise 内部存在3种状态，pending、fulfilled、rejected
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED'
}

class Promise {
  constructor(executor) {
    this.status = STATUS.PENDING     // 默认是 pending 状态
    this.value = undefined
    this.reason = undefined
    const resolve = val => {
      if(this.status === STATUS.PENDING) {   // 只有内部状态是pending，才能改变状态，当改变之后就不会变了
        this.status = STATUS.FULFILLED
        this.value = val
      }
    }
    const reject = reason => {
      if(this.status === STATUS.PENDING) {  // 只有内部状态是 pending，才能改变状态，当改变之后就不会变了
        this.status = STATUS.REJECTED
        this.reason = reason
      }
    }
    try {
      executor(resolve, reject)    // 默认初始化会执行，这是一个同步任务
    } catch(e) {
      // 出错走失败逻辑
      reject(e)
    }
  }
  
  then(onFulfilled, onRejected) {
    if(this.status === STATUS.FULFILLED) {   // 内部状态是 fulfilled 时
      onFulfilled(this.value)
    }
    if(this.status === STATUS.REJECTED) {    // 内部状态是 rejected 时
      onRejected(this.reason)
    }
  }
}


module.exports = Promise
```



## Promise的异步改变状态

ok 现在同步执行确实实现了初步功能，但是当我改为异步改变状态时，就存在问题了？

```js
let p = new Promise((resolve, reject) => {
	setTimeout(() => {
      resolve(111)
  }, 1000)  
})
p.then(data => {
  console.log('success', data)
}, reason => {
  console.log('fail', reason)
})
```

所以我们要开始进行新改造，当执行异步改变Promise的状态时，`setTimeout(() => {resolve(111)}, 1000)`时，因为是一个宏任务，所以要等执行栈全部执行完才会执行宏任务，即改变状态。而此时会先执行 `then`方法，而此时的状态为 `pending`，所以我们将相应的回调搜集起来，等到 `resolve(111)`改变状态时，再调用存储的所有的回调函数。

而像上面是同步执行的，所以首先改变了状态，当执行`then`方法时已经改变了状态了，所以直接执行相关回调函数了。

```js
class Promise {
  constructor(executor) {
    ......
+   this.onResolvedCallbacks = []   // 存放成功的回调
+   this.onRejectedCallbacks = []   // 存放失败的回调
    const resolve = val => {
      if(this.status === STATUS.PENDING) {   // 只有内部状态是pending，才能改变状态，当改变之后就不会变了
        ......
+       this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if(this.status === STATUS.PENDING) {  // 只有内部状态是 pending，才能改变状态，当改变之后就不会变了
        ......
+     	this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
  }
  
  then(onFulfilled, onRejected) {
    	......
+      if(this.status === STATUS.PENDING) {
+     // 装饰模式 切片编程
+      this.onResolvedCallbacks.push(() => {   // todo..
+        onFulfilled(this.value)
+      })
+      this.onRejectedCallbacks.push(() => {   // todo..
+        onRejected(this.reason)
+      })
    }
  }
}
```



## Promise的链式调用

根据Promise A+规范，Promise的链式调用问题：

1. 如果then方法中（成功或者失败）返回的不是一个promise，会将这个值传递给外层下一次then的成功结果
2. 如果执行then方法中的方法出错了，抛出异常，走下一个then的失败
3. 如果返回的是一个promise，会用这个promise的结果作为下一次then的成功或者失败

首先我们先对上面的代码再进行完成，`then`方法返回的是一个 Promise 实例，并且执行`then`方法的参数，他的两个参数都是函数，执行函数得到 `onFulfilled`和 `onRejected`方法的结果。

主要试讲之前的代码，全都放入一个Promsie实例中，并且对之前的执行代码增加上 `try..catch(e)`语句。执行完`onFulfilled`函数后，通过`resolve(x)`将取到的值作为下一次 `then`的成功结果传递。同时将当前新创建的 Promise 状态改为 `fulfilled`，只有在捕获到异常错误时，才调用 `reject`将错误信息传递给下一个`then`方法的第二个函数的参数作为`reason`结果

```js
then(onFulfilled, onRejected) {

  let promise2 = new Promise((resolve, reject) => {
    if(this.status === STATUS.FULFILLED) {
      try {
        let x = onFulfilled(this.value)
        resolve(x)
      } catch(e) {
        // 出错走失败逻辑
        reject(e)
      }
    }
    if(this.status === STATUS.REJECTED) {
      try {
        let x = onRejected(this.reason)
        resolve(x)
      } catch(e) {
        reject(e)
      }
    }
    if(this.status === STATUS.PENDING) {
      // 装饰模式 切片编程
      this.onResolvedCallbacks.push(() => {   // todo..
        try {
          let x = onFulfilled(this.value)
          resolve(x)
        } catch(e) {
          reject(e)
        }
      })
      this.onRejectedCallbacks.push(() => {   // todo..
        try {
          let x = onRejected(this.reason)
          resolve(x)
        } catch(e) {
          reject(e)
        }
      })
    }
  })
  return promise2

}


```

但是现在我们要考虑一件事，如果`let x = onRejected(this.reason)`得到的值还是一个 Promise 实例，该怎么办呢？此时我们定义一个方法，来做一些处理并进行递归操作。

根据 Promise A+ 中的规范，这个`then` 的调用必须在一个新的栈中，所以我们要加上一个异步方式，可以有 `Process.nextTick`、`MutationObserver`、`setTimeout`、`setImmediate`等，我们这里就暂时用 `setTimeout`。

```js
then(onFulfilled, onRejected) {

    let promise2 = new Promise((resolve, reject) => {
      if(this.status === STATUS.FULFILLED) {
+       setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
+           resolvePromise(x, promise2, resolve, reject)
          } catch(e) {
            // 出错走失败逻辑
            reject(e)
          }
+       })
      }
      if(this.status === STATUS.REJECTED) {
+       setTimeout(() => {
          try {
            let x = onRejected(this.reason)
+           resolvePromise(x, promise2, resolve, reject)
          } catch(e) {
            reject(e)
          }
+       })
      }
      if(this.status === STATUS.PENDING) {
        // 装饰模式 切片编程
        this.onResolvedCallbacks.push(() => {   // todo..
+         setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
+             resolvePromise(x, promise2, resolve, reject)
            } catch(e) {
              reject(e)
            }
+         })
        })
        this.onRejectedCallbacks.push(() => {   // todo..
+         setTimeout(() => {
            try {
              let x = onRejected(this.reason)
+             resolvePromise(x, promise2, resolve, reject)
            } catch(e) {
              reject(e)
            }
+         })
        })
      }
    })
    return promise2

  }
```

现在让我们来看下 `onFulfilled` 或者 `onRejected` 方法执行的返回结果，可能这个结果还是一个 promise 或者 是本身等情况时的操作，现在我们申明一个 `resolvePromise` 函数，来对此做一些处理。

```js
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
```

首先对返回的值进行判断是否是自己本身，如果是自己本身的话就抛出错误，因为如果是自己本身会导致死循环递归

```js
if (promise2 === x) { // 如果是自己的话，自己调自己会死循环
  return reject(new TypeError('出错了'))
}
```

然后我们再进一步的判断是否是一个对象或者是一个函数,如果不是，则表示 x 是一个原始类型，不是 promise，则直接 `resolve(x)`

```js
if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
 ......
} else {
  resolve(x)
}
```

ok,我们继续执行下面的步骤，如果 `x.then` 是一个函数的话，那么可以确定这是一个 promise 对象（其实还可以更严格），我们先将 x 对象中的 `then`方法保留起来，便于下面 `then.call(x, ()=>{}, ()=> {})` 调用，那么这里为什么要这样执行 `then` 方法，而不`x.then(()=>{}, ()=>{})` 这样执行呢？为的是避免重新进行取 `then` 这个值，确保就是一开始那个 then，唯一性，因为可能别人的 promise 会将自己写的then 方法修改，如 `Object.defineProperty(promsie.prototype, 'then', {})`等，所以这里确保其唯一性，使用 `call` 方法。

同时如果 `promise.then` 执行后返回的不是一个promsie 实例，那么就是一个普通对象，则直接 `resolve(x)`，如果返回的是一个 promise，那该怎么办？所以我们在内部进行递归调用 `resolvePromise` 直到不是 promsie，取到最终值，而这个函数接受4个参数，第一个为 `then` 方法的参数，即函数返回的结果。第二个参数是最开始 `then` 方法返回的那个 promise2，第三个参数是该promise2中的  `resolve`，第四个参数是 promise2中的  `reject`。

```js
let called   
try {
  let then = x.then; // 就看一下这个对象是否有 then 方法
  if (typeof then === 'function') {
		// 调用返回的promise，用他的结果 作为下一次then的结果
    then.call(x, function(y) {   // 成功的回调
      if(called) return
      called = true
      resolvePromise(y, promise2, resolve, reject)   // 递归调用
    }, function(r) {     // 失败的回调
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
```

其中对于 `try catch`，如果我们捕获到异常的话，就要`reject(e)`。这里我们增加了一个 `called` 开关，主要是针对以下场景，其中 then 中返回的是Promise的情况时，内部还同时执行改变了多次状态，这是不被允许的，所以增加一个开关，当状态改变后，就不能再被触发调用这两个回调了

```js
p.then(r => {
  return new Promise((resolve, reject) => {
    reject(100)
    resolve
    throw new Eroor()
    // 所以这3种状态都要增加开关
  })
})
```

最终我们执行以下代码，会返回promise时递归执行，输出最后的状态结果

```js
let p = new Promise((resolve, reject) => {
  setTimeout(() =>{
    resolve(111)
  }, 1000)
}).then(r => {
  // throw new Error('err')
  // return 100
  
  return new Promise((resolve, reject) => {
    resolve(222)
  }).then(r => {
    return new Promise((resolve, reject) => {
      resolve(3333333)
    })
    
    /*
    return new Promise((resolve, reject) => {
    	resolve(new Promise(xxx))
  	})
    */
    
    
  }, e => {})
}).then(r => {
  console.log(r)     // 等待 输出 3333333
}, err => {
  console.log(err)
})
```

现在接着处理下一种情况，`then` 中不传入回调函数，会直接跳过，一直往下，直到找到最近可调用的回调函数位置

```js
const p = new Promise((resolve, reject) => {
  resolve('ok')
})
.then()
.then()
.then()
.then(r => {   // 跳过一个个then，直到此次才执行
  console.log(r)
})

// 可以把他理解成，其实内部就是如下执行的
const p = new Promise((resolve, reject) => {
  resolve('ok')
})
.then(r => {
  return r
})
.then(r => {
  return r
})
.then(r => {
  return r
})
.then(r => {   // 跳过一个个then，直到此次才执行
  console.log(r)
})
```

此时只要在 `then` 方法中写上以下两句话就可以了：

```js
then() {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : data => data
	onRejected = typeof onRejected === 'function' ? onRejected : err => {throw err}
  ......
}
```

加上以上两句话后，我们就可以再定义 `catch` 方法了

```js
catch(err) {  // 默认没有成功  只有失败
  return this.then(null, err)
}
```



## Promise 测试

测试时调用一个插件来查看自己编写的 promise 是否符合规范，首先增加上一个 defer 方法

```js
Promise.defer = Promise.deferred = function() {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject
  })
  return dfd
}
```

```bash
npm install promises-aplus-tests -g --force
```

执行

```bash
promises-aplus-tests promise.js  
```



## Promsie.resolve

```js
// Promise.resolve 可以等待一个 promise 执行完毕
Promise.resolve('123').then(r => {
  console.log(r)
})

Promise.resolve(new Promise(resolve =< {
  resolve('123')
})).then(r => {
  console.log(r)
})
```

这是一个静态方法，现在我们来写这个方法，他也直接返回一个 promise

```js
static resolve(val) {
  return new Promise((resolve, reject) => {
    resolve(val)
  })
}
```

但是现在我们要考虑到如果传入的参数val也是一个promise，那该怎么办？我们需要在 resolve 方法中加上对传入参数是否是 promise 的判断，如果传入的参数还是 promsie，那么当该promise的状态改变时，如 `resolve('123')`，因为没有异步，所以会执行他的 `then`方法，而又因为该 promsie 的 `then` 方法第一个参数是 一开始传入的 `resolve`，所以 执行时会将`this.value` 为 '123'传入，所以  `Promise((resolve, reject) => { resolve(val) })` 这个的状态改变了

```js
const resolve = val => {
  ......
  if(val instanceof Promise) {    // 是promise 就继续递归解析
    return val.then(resolve, reject)
  }
}
```



## Promise.reject

```js
Promise.reject(p).catch(err => {
  console.log(err)
})
```



```js
static reject(reason) {    // 失败的 promise
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}
```



## Promise.all

```js
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
```

我们先贴出源码部分，然后来进行说明

```js
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
```

首先 `Promsie.all` 是一个静态方法，

1. 他也是返回一个 promise 对象，传入的参数是一个数组。
2. 实例的 then 方法中的第一个函数的参数可以获取到 `Promise.all` 中传入的所有值
3. 要等待所有`Promise.all`中的任务全部完成才改变状态，才能获取最终所有值
4. 只要其中一个任务出错，就reject了

`promises` 就是 `Promise.all` 中传入的数组，我们暂时把他称为任务，`result`存储的就是每个任务的值（不是promise就直接是本身，是promise就取它的resolve的值），用于执行完所有任务后返回的`then(r => r)`这个`r`，他是一个数组。

`times` 是一个计数器，只有计数器 === promises 的长度时，才表示所有任务都执行好了，才会改变promise的状态。

先来看这个for循环

```js
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
```

如果任务不是promise的话，则直接传入他本身这个值，如果是一		个promise对象，则调用他的then方法，得到值之后传入

`processData` 函数。

现在我们来讲一下 `processData` 函数，这个函数用于将值都保存到一个数组中，并且增加一个判断，只有当所有任务执行好之后才执行 `resolve`。

```js
// 方案1  xxxx 错误
function processData(index, val) {
  result[index] = val
  if(result.length === promises.length) {
    resolve(result)
  }
}

// 方案2
function processData(index, val) {
  result[index] = val
  if(++times === promises.length) {
    resolve(result)
  }
}
```

为什么我们不使用方案1呢？如果`Promise.all([p1, p2, 1])`  因为微任务的原因，前面两个会后执行，先操作 `1`，这会导致 `result[index] = val`, 直接index 就是2， `result.length` 长度直接是3了，直接会 `resolve` 了，这是不正确的，所以我们使用完成一个任务就加一的形式，知道和任务数相匹配，才执行 `resolve`



## Promise.finally

`Promsie.finally`这个方法，不管怎么样都会调用


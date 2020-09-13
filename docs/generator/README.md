# Generator

## 基本概念

Generator 函数有多种理解角度。语法上，首先可以把它理解成，Generator 函数是一个状态机，封装了多个内部状态。

执行 Generator 函数会返回一个遍历器对象，也就是说，Generator 函数除了状态机，还有一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

形式上，Generator 函数是一个普通函数，但是有两个特征。一是，`function` 关键字与函数名之间有一个星号；二是，函数体内部使用 `yield`表达式，定义不同的内部状态。

```js
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';   // 一直执行到return语句（如果没有return语句，就执行到函数结束）
}

var hw = helloWorldGenerator();
```

上面代码定义了一个 Generator 函数`helloWorldGenerator`，它内部有两个`yield`表达式（`hello`和`world`），即该函数有三个状态：hello，world 和 return 语句（结束执行）。

然后，Generator 函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象

下一步，必须调用遍历器对象的`next`方法，使得指针移向下一个状态。也就是说，每次调用`next`方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一个`yield`表达式（或`return`语句）为止。换言之，Generator 函数是分段执行的，`yield`表达式是暂停执行的标记，而`next`方法可以恢复执行。

```js
hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```

总结一下，调用 Generator 函数，返回一个遍历器对象，代表 Generator 函数的内部指针。以后，每次调用遍历器对象的`next`方法，就会返回一个有着`value`和`done`两个属性的对象。`value`属性表示当前的内部状态的值，是`yield`表达式后面那个表达式的值；`done`属性是一个布尔值，表示是否遍历结束。



## 模拟一个 generator

```js
function gen$(context) {
  switch(context.prev=context.next) {
    case 0:
      context.next = 1
      return 1
    case 1:
      context.next = 2
      return 2
    case 2:
      context.next = 3
      return 3
    case 3:
      context.stop()
      return 100
  }
} 

let gen = function() {
  const context = {
    prev: 0,     // 当前要运行的
    next: 0,    // 下一次要运行的
    done: false,  // 是否完成运行
    stop() {
      this.done = true   // 更改完成状态
    }
  }
  return {
    next() {
      return {
        value: gen$(context),  //  将上下文传入
        done: context.done
      }
    }
  }
}


let it = gen()
console.log(it.next())    // {value: 1, done: false}
console.log(it.next())    // {value: 2, done: false}
console.log(it.next())    // {value: 3, done: false}
console.log(it.next())    // {value: undefined, done: true}
```

设置一个`gen`函数，该函数返回一个对象，对象中有`next`方法，我们调用 `next`方法就能得到一个对象，该对象有 `value` 和 `done` 两个属性，`value` 为值，`done` 表示是否遍历已经结束。其中我们还在 `gen` 函数中声明了一个 `context` 变量，通过调用 `next` 取值时，来改变 `context`中的值。 `gen` 方法执行后会形成一个闭包。

至于具体改变 `content` 中的属性值，则是在`$gen`函数中。每次调用 next 就会进行下一步的操作，直到最后结束，调用 `context.stop` 方法来改变 `context`中的 `done` 为 `true`，表示已经遍历结束。



我们通过 babel 转义的话，其代码也和上面写的类似，如下：

```js

function* gen() {
  yield 1
  var a = 1
  yield 2
  var b = 2
  yield 3
  return 100
}

// 通过 babel 转义
// switch case  => babel 编译后就是把一个函数分成多个 case 采用指针的方式向下移动

function gen() {
  var a, b;
  return regeneratorRuntime.wrap(function gen$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 1;

        case 2:
          a = 1;     // 会将内容拆分到相应的地方
          _context.next = 5;
          return 2;

        case 5:
          b = 2;
          _context.next = 8;
          return 3;

        case 8:
          return _context.abrupt("return", 100);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}
```

其内部核心就是使用 `switch case` 来做到根据每次调用 `next`方法，然后 执行下一步操作，直到完成所有的 迭代内容，其中 我们在babel的编译代码中可以看到，每次`yield` 前面的代码都会在其对应的 `case` 中。



## async

其实`async+await` 内部原理就是用的 `generator`的原理，他只是 `generator`的一个语法糖。

```js
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
```

我们来看一下，他的babel转义的代码是怎么样的

```js
"use strict";

//  就是上面 2 文件中 写到的 step 方法
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var p1 = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(111);
  }, 1000);
});
var p2 = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(222);
  }, 3000);
});

function g() {
  return _g.apply(this, arguments);
}

function _g() {
  _g = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var p11, p22;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return p1;

          case 2:
            p11 = _context.sent;
            console.log(p11);
            _context.next = 6;
            return p2;

          case 6:
            p22 = _context.sent;
            console.log(p22);
            return _context.abrupt("return", p22);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _g.apply(this, arguments);
}
```

可以看到其中核心处的代码和 `generator` 的 babel 转义代码是一样的
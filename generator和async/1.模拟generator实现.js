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

/*

function* gen() {
  yield 1
  var a = 1
  yield 2
  var b = 2
  yield 3
  return 100
}

通过 babel 转义
switch case  => babel 编译后就是把一个函数分成多个 case 采用指针的方式向下移动

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


*/

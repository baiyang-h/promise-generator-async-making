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
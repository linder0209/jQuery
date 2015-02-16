(function (global, factory) {

  // 大体上是执行该方法，期间加入了一些对 CommonJS AMD的判断
  factory(global);

  // Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function (window, noGlobal) {

  // src/core.js start
  // 用到的变量或方法，比如 slice concat

  var
  // Use the correct document accordingly with window argument (sandbox)
    document = window.document,

    version = "2.1.3",

  // Define a local copy of jQuery
  // 构建jQuery对象
    jQuery = function (selector, context) {
      // The jQuery object is actually just the init constructor 'enhanced'
      // Need init if jQuery is called (just allow error to be thrown if not included)
      return new jQuery.fn.init(selector, context);
    };

  // jQuery对象原型
  jQuery.fn = jQuery.prototype = {
    constructor: jQuery
    // 一些常用方法，比如 toArray, get, pushStack, each, map, slice, first, last, eq, end 等
  };

  // jQuery 扩展函数extend
  jQuery.extend = jQuery.fn.extend = function () {
  };

  // 在jQuery上扩展静态属性和方法，即工具类函数 Utilities
  jQuery.extend({
    // 有以下属性和方法
    /**
     * expando jQuery 唯一的标示
     * isReady 页面是否加载完
     * error 抛出错误对象
     * noop 空函数
     * isFunction
     * isArray
     * isNumeric
     * isPlainObject 是否是 Plain Object
     * isEmptyObject
     * type 返回变量数据类型，包括 null undefined object function string number boolean 等
     * globalEval 执行脚本代码，如果是严格模式，利用严格模式执行，否则调用eval函数
     * camelCase 替换成驼峰写法，比如 set-name 转换为 setName
     * nodeName(elem, name) 判断elem元素的nodeName与给定的name是否一样
     * each 遍历对象或类数组，并执行传入的fn，如果遍历的时候返回false，则结束遍历
     * trim 去掉文本前后空格
     * makeArray 组合成数组
     * inArray(elem, arr, i)  判断元素elem是否在arr中，arr是数组或类数组
     * merge 合并
     * grep (elems, callback, invert) 过滤数据（callback返回值不等于invert的保留）
     * map 类似于 JavaScript原生的 map 但 不会返回返回值等于null的数据
     * guid A global GUID counter for objects
     * proxy 代理绑定，比如 var proxy = jQuery.proxy(function(){},this); 在调用proxy的时候，this将会指向绑定时候的this，而不是执行环境的this
     * now Date.now 函数引用
     * support 为其他项目初始了改属性
     */
  });

  // Populate the class2type map
  jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
  });

  function isArraylike(obj) {
    /* code */
  }

  // src/core.js end

  // 定义 Sizzle 用来处理遍历DOM元素
  // src/selector-sizzle.js start
  var Sizzle;
  /* code */

  jQuery.find = Sizzle;
  jQuery.expr = Sizzle.selectors;
  jQuery.expr[":"] = jQuery.expr.pseudos;
  jQuery.unique = Sizzle.uniqueSort;
  jQuery.text = Sizzle.getText;
  jQuery.isXMLDoc = Sizzle.isXML;
  jQuery.contains = Sizzle.contains;
  // src/selector-sizzle.js end

  // 提供遍历DOM元素方法，比如 find filter not 等
  // src/traversing.js start
  /* code */
  // src/traversing.js end

  // 创建 jQuery 回调函数
  // src/callbacks.js start
  jQuery.Callbacks = function (options) {
    /* code */
  };
  // src/callbacks.js end

  // 创建 Deferred promise 异步处理函数
  // src/deferred.js start
  jQuery.extend({
    Deferred: function (func) {
      /* code */
    },
    // Deferred helper
    when: function (subordinate /* , ..., subordinateN */) {
      /* code */
    }
  });
  // src/deferred.js end

  // ready 的定义和处理
  // src/core/ready.js start
  // The deferred used on DOM ready
  var readyList;
  jQuery.fn.ready = function (fn) {
    // Add the callback
    jQuery.ready.promise().done(fn);
    return this;
  };
  /* code */
  // src/core/ready.js end

  // jQuery 数据处理，包括绑定数据，删除数据，缓存等
  // src/data.js start
  /* code */
  // src/data.js end

   //队列 queue
  // src/queue.js start
  jQuery.extend({
    queue: function (elem, type, data) {},
    dequeue: function (elem, type) {},
    _queueHooks: function (elem, type) {}
  });

  jQuery.fn.extend({
    queue: function (type, data) {},
    dequeue: function (type) {},
    clearQueue: function (type) {},
    promise: function (type, obj) {}
  });
  // src/queue.js end

  // 延迟操作
  // src/queue/delay.js

  //属性操作，包括arrt class prop val
  // src/attributes.js start

  //事件处理 jQuery event
  // src/event.js
  // src/event/alias.js

  // DOM元素操作，比如html text append 等
  // src/manipulation.js start

  var init = jQuery.fn.init = function( selector, context ) {
    /* code */
    return jQuery.makeArray( selector, this );
  };

  // Give the init function the jQuery prototype for later instantiation
  init.prototype = jQuery.fn;

  // src/manipulation.js end

  //DOM 元素包裹
  // src/wrap.js

  //css 处理
  // src/css.js start
  /* code */
  // src/css.js end

  // 动画效果
  // src/effects.js start
  /* code */
  // src/effects.js end

  //jQuery Ajax
  // src/ajax.js

  // jQuery 序列
  // src/serialize.js

  // DOM 元素大小
  // src/dimensions.js

  // jQuery 不赞成的用法
  // src/deprecated.js

  // jQuery AMD 的写法
  // src/exports/amd.js

  // jQuery 全局变量
  // src/exports/global.js

  return jQuery;

}));

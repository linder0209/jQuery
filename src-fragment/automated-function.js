(function( global, factory ) {
  /* code */
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
  /* code */
}));


(function () { /* code */ } ()); // 推荐使用这个，具体原因，本人目前不太清楚，待研究
(function () { /* code */ })();


/**
 * 下面的实现本来是当点击不同的a时，显示其在DOM中的顺序
 * 但这样实现是错误的，原因是当用户点击a时才给i赋值，而由于此时循环已执行完，i的值是elems.length，
 * 所以说无论点击那个连接，最终显示的都是I am link #10（如果有10个a元素的话）
 */
var elems = document.getElementsByTagName('a');
for (var i = 0; i < elems.length; i++) {
  elems[i].addEventListener('click', function (e) {
    e.preventDefault();
    console.info('I am link #' + i);
  }, 'false');
}

/**
 * 下面的写法是正确的，因为我们采用了自执行函数，在给每个a添加点击事件时，
 * 自执行函数表达式闭包内部i的值作为lockedInIndex存在，在循环执行结束以后，尽管最后i的值变成了a元素总数（例如10），
 * 但闭包内部的lockedInIndex值是没有改变，因为他已经执行完毕了。所以当点击连接的时候，结果是正确的
 */
var elems = document.getElementsByTagName('a');
for (var i = 0; i < elems.length; i++) {
  (function (lockedInIndex) {
    elems[i].addEventListener('click', function (e) {
      e.preventDefault();
      alert('I am link #' + lockedInIndex);
    }, 'false');
  }(i));

  //以下写法也是正确的，但是相对来说，上面的代码更具可读性
  elems[i].addEventListener('click', (function (lockedInIndex) {
    return function (e) {
      e.preventDefault();
      alert('I am link #' + lockedInIndex);
    };
  }(i)), 'false');
}
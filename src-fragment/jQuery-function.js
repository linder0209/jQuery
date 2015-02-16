(function (global, factory) {
  /* code */
}(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
  var jQuery = function (selector, context) {
    // The jQuery object is actually just the init constructor 'enhanced'
    // Need init if jQuery is called (just allow error to be thrown if not included)
    // 调用中间 函数 fn，此处相当于 return new jQuery.prototype.init(selector, context);
    return new jQuery.fn.init(selector, context);
  };

  jQuery.fn = jQuery.prototype = {
    constructor: jQuery
    /* code */
  };

  var init = jQuery.fn.init = function (selector, context) {
    /* code */
    return jQuery.makeArray(selector, this);
  };

  // Give the init function the jQuery prototype for later instantiation
  // 这里 init.prototype 被 jQuery.fn （即jQuery.prototype）覆盖，
  // 即 init.prototype 指向 jQuery.prototype，所以 new jQuery.fn.init(selector, context); 时，this 是指向jQuery实例，即jQuery.prototype
  // 如果没有这句话设置，调用 new jQuery.fn.init(selector, context);时，this是指向jQuery.prototype.init的构造函数constructor，即jQuery类的。
  init.prototype = jQuery.fn;
}));
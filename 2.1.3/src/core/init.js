// Initialize a jQuery object
define([
  "../core",
  "./var/rsingleTag",
  "../traversing/findFilter"
], function (jQuery, rsingleTag) {

  // A central reference to the root jQuery(document)
  var rootjQuery,

  // A simple way to check for HTML strings
  // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
  // Strict HTML recognition (#11290: must start with <)
  // 该正则表达式匹配形如: '<div>This is a tag</div>' 或 '#demo-1'，即html tag开头或#id结尾的内容，|表达式的优先级最低
    rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,//这里用到了贪婪匹配，如 (<[\w\W]+>)会匹配尽可能多的字符

    init = jQuery.fn.init = function (selector, context) {
      var match, elem;

      // HANDLE: $(""), $(null), $(undefined), $(false)
      // 没有选择器，则直接返回
      if (!selector) {
        return this;
      }

      // Handle HTML strings
      if (typeof selector === "string") {
        //$('<div>'),$('<div/>')
        if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
          // Assume that strings that start and end with <> are HTML and skip the regex check
          // 这种情况不用检测正则表达式，效率更高
          match = [null, selector, null];
        //$(' <div>This is a outer Div<div>This is a inner div.<p>Text</p></div></div><script>console.info(123);<\/script>End')
        } else {
          match = rquickExpr.exec(selector);
        }

        // Match html or make sure no context is specified for #id
        if (match && (match[1] || !context)) {

          // HANDLE: $(html) -> $(array)
          if (match[1]) {//这里match[1]指匹配的html，比如<div>This is a tag</div>
            context = context instanceof jQuery ? context[0] : context;

            // Option to run scripts is true for back-compat
            // Intentionally let the error be thrown if parseHTML is not present
            jQuery.merge(this, jQuery.parseHTML(
              match[1],
              context && context.nodeType ? context.ownerDocument || context : document,
              true
            ));

            // HANDLE: $(html, props)
            if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
              for (match in context) {
                // Properties of context are called as methods if possible
                // $('<div></div>',{click:function(e){console.info(e);}}).appendTo(document.body).text('Please Click It.');
                if (jQuery.isFunction(this[match])) {
                  this[match](context[match]);

                  // ...and otherwise set as attributes
                } else {
                  //$('<div>属性name的值为china</div>',{name:'china'}).appendTo(document.body);
                  this.attr(match, context[match]);
                }
              }
            }

            return this;

            // HANDLE: $(#id)
          } else {//$('#div1');
            elem = document.getElementById(match[2]);

            // Support: Blackberry 4.6
            // gEBID returns nodes no longer in the document (#6963)
            if (elem && elem.parentNode) {
              // Inject the element directly into the jQuery object
              this.length = 1;
              this[0] = elem;
            }

            this.context = document;
            this.selector = selector;
            return this;
          }

          // HANDLE: $(expr, $(...))
          // $('.class1'); 或者 $('.class1', $(document.body));
        } else if (!context || context.jquery) {
          return ( context || rootjQuery ).find(selector);

          // HANDLE: $(expr, context)
          // (which is just equivalent to: $(context).find(expr)
        } else {//$('#div1',document.body); $('.class1',document.body);
          return this.constructor(context).find(selector);
        }

        // HANDLE: $(DOMElement)
      } else if (selector.nodeType) {
        this.context = this[0] = selector;
        this.length = 1;
        return this;

        // HANDLE: $(function)
        // Shortcut for document ready
      } else if (jQuery.isFunction(selector)) {
        return typeof rootjQuery.ready !== "undefined" ?
          rootjQuery.ready(selector) :
          // Execute immediately if ready is not present
          selector(jQuery);
      }

      if (selector.selector !== undefined) {
        //$($({key:1}));
        this.selector = selector.selector;
        this.context = selector.context;
      }

      //处理传入的是对象，比如数组或Object等 $([1,2,3]);
      return jQuery.makeArray(selector, this);
    };

  // Give the init function the jQuery prototype for later instantiation
  init.prototype = jQuery.fn;

  // Initialize central reference
  rootjQuery = jQuery(document);

  return init;

});

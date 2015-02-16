jQuery.extend = jQuery.fn.extend = function() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},// 常见用法 jQuery.extend( obj1, obj2 )，此时，target为obj1
    i = 1,
    length = arguments.length,
    deep = false;//是否深度 extend

  // Handle a deep copy situation
  // 假如第一个参数是 Boolean，比如 jQuery.extend( true, obj1, obj2 );
  if ( typeof target === "boolean" ) {
    deep = target;

    // Skip the boolean and the target
    target = arguments[ i ] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  // 处理特殊情况，实际上是jQuery尽量采用了容错功能，比如 jQuery.extend( 'linder' , {name: 'linder'})
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // Extend jQuery itself if only one argument is passed
  // 如果只传递一个参数，则表示是对本身的扩展，比如 jQuery.extend(obj)，或 jQuery.fn.extend( obj )，这时this指向jQuery或jQuery.fn
  if ( i === length ) {
    target = this;
    i--;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) { // 防止自引用
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        // 如果是深copy，并且被copy的是一个 plain object 或者 是一个 Array
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {//copy 的属性是一个数组
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          // 递归调用
          target[ name ] = jQuery.extend( deep, clone, copy );

          // Don't bring in undefined values
          // 上面递归调用的时候，如果 copy 不是 plain object 或 Array 时，直接copy
        } else if ( copy !== undefined ) {//浅copy
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};
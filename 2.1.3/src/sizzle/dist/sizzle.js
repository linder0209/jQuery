/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function (window) {

  var i,//循环变量
    support,//浏览器兼容性
    Expr,//选择器实体，用来处理不同的选择器，如 ID　关系符、过滤器以及伪类
    getText,
    isXML,//是否为XML
    tokenize,//词法解析，生成token序列
    compile,//编译函数
    select,// 一个选择器编译函数，用来处理浏览器不支持 querySelectorAll 的情况，或者其他选择器（不是浏览器本身的，比如 :input 等）
    outermostContext,
    sortInput,
    hasDuplicate,

  // Local document vars
    setDocument,//set document，并初始化一些函数方法
    document,
    docElem,
    documentIsHTML,
    rbuggyQSA,
    rbuggyMatches,
    matches,
    contains,

  // Instance-specific data
    expando = "sizzle" + 1 * new Date(),
    preferredDoc = window.document,
    dirruns = 0,
    done = 0,
    classCache = createCache(),
    tokenCache = createCache(),
    compilerCache = createCache(),
    sortOrder = function (a, b) {
      if (a === b) {
        hasDuplicate = true;
      }
      return 0;
    },

  // General-purpose constants
    MAX_NEGATIVE = 1 << 31,

  // Instance methods
    hasOwn = ({}).hasOwnProperty,
    arr = [],
    pop = arr.pop,
    push_native = arr.push,
    push = arr.push,
    slice = arr.slice,
  // Use a stripped-down indexOf as it's faster than native
  // http://jsperf.com/thor-indexof-vs-for/5
    indexOf = function (list, elem) {
      var i = 0,
        len = list.length;
      for (; i < len; i++) {
        if (list[i] === elem) {
          return i;
        }
      }
      return -1;
    },

    booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

  // Regular expressions

  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
    whitespace = "[\\x20\\t\\r\\n\\f]",//空白正则表达式
  // http://www.w3.org/TR/css3-syntax/#characters
    characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

  // Loosely modeled on CSS identifier characters
  // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
    identifier = characterEncoding.replace("w", "w#"),

  // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
  // 属性表达式，简单的分析一下，
  // attributes = "\\[[\\x20\\t\\r\\n\\f]*((?:\\\\.|[\\w-]|[^\\x00-\\xa0])+)(?:[\\x20\\t\\r\\n\\f]*([*^$|!~]?=)[\\x20\\t\\r\\n\\f]*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|((?:\\\\.|[\\w#-]|[^\\x00-\\xa0])+))|)[\\x20\\t\\r\\n\\f]*\\]"
    /**
     * 注意 (?:pattern) 是不捕获匹配
     * \\[   以[开头
     * [\\x20\\t\\r\\n\\f]*   零个或多个空白
     * ((?:\\\\.|[\\w-]|[^\\x00-\\xa0])+)  属性名，属性名不包含\\x00-\\xa0，但包含 - . 和 \
     * (?:[\\x20\\t\\r\\n\\f]*([*^$|!~]?=)  零个或多个空白，以 [*^$|!~] 任一个开头，或没有，然后是 =
     * [\\x20\\t\\r\\n\\f]*   零个或多个空白
     * (?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|((?:\\\\.|[\\w#-]|[^\\x00-\\xa0])+))|) 以 '' 或 "" 包含的属性值，或者直接属性值，最后 |) 不知道是啥意思
     * [\\x20\\t\\r\\n\\f]*   零个或多个空白
     * \\]  以]结尾
     */
    attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
        // Operator (capture 2)
      "*([*^$|!~]?=)" + whitespace +
        // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
      "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
      "*\\]",

  //伪选择符
    pseudos = ":(" + characterEncoding + ")(?:\\((" +
        // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
        // 1. quoted (capture 3; capture 4 or capture 5)
      "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
        // 2. simple (capture 6)
      "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
        // 3. anything else (capture 2)
      ".*" +
      ")\\)|)",

  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
    rwhitespace = new RegExp(whitespace + "+", "g"),//空白正则表达式
    rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),//以空白开头以空白结尾的正则表达式

    rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),//带,号的空白
    rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),//带>+~的选择器表达式

    rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),//=开头的正则表达式

    rpseudo = new RegExp(pseudos),
    ridentifier = new RegExp("^" + identifier + "$"),

  //一些正则表达式常量
    matchExpr = {
      "ID": new RegExp("^#(" + characterEncoding + ")"),
      "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
      "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
      "ATTR": new RegExp("^" + attributes),
      "PSEUDO": new RegExp("^" + pseudos),
      "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
      "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
      "bool": new RegExp("^(?:" + booleans + ")$", "i"),
      // For use in libraries implementing .is()
      // We use this for POS matching in `select`
      "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
      whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
    },

    rinputs = /^(?:input|select|textarea|button)$/i,//input正则表达式
    rheader = /^h\d$/i,

    rnative = /^[^{]+\{\s*\[native \w/,//例如，ab{ [native b，用来测试函数是否存在

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
  // id class or tag 正则表达式
    rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

    rsibling = /[+~]/,//兄弟正则表达式
    rescape = /'|\\/g,//包含 ,或\正则表达式

  // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
    funescape = function (_, escaped, escapedWhitespace) {
      var high = "0x" + escaped - 0x10000;
      // NaN means non-codepoint
      // Support: Firefox<24
      // Workaround erroneous numeric interpretation of +"0x"
      return high !== high || escapedWhitespace ?
        escaped :
        high < 0 ?
          // BMP codepoint
          String.fromCharCode(high + 0x10000) :
          // Supplemental Plane codepoint (surrogate pair)
          String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
    },

  // Used for iframes
  // See setDocument()
  // Removing the function wrapper causes a "Permission Denied"
  // error in IE
    unloadHandler = function () {
      setDocument();
    };

  // Optimize for push.apply( _, NodeList )
  try {
    push.apply(
      (arr = slice.call(preferredDoc.childNodes)),
      preferredDoc.childNodes
    );
    // Support: Android<4.0
    // Detect silently failing push.apply
    arr[preferredDoc.childNodes.length].nodeType;
  } catch (e) {
    push = {
      apply: arr.length ?

        // Leverage slice if possible
        function (target, els) {
          push_native.apply(target, slice.call(els));
        } :

        // Support: IE<9
        // Otherwise append directly
        function (target, els) {
          var j = target.length,
            i = 0;
          // Can't trust NodeList.length
          while ((target[j++] = els[i++])) {
          }
          target.length = j - 1;
        }
    };
  }

  /**
   * Sizzle 构造函数，jQuery.find函数指向Sizzle，也就是说调用jQuery.find，实际上就是调用Sizzle
   * @param selector 选择器表达式
   * @param context 上下文
   * @param results
   * @param seed
   * @returns {*}
   * @constructor
   */
  function Sizzle(selector, context, results, seed) {
    var match, elem, m, nodeType,
    // QSA vars
      i, groups, old, nid, newContext, newSelector;

    /**
     * 实际上这里很少会调用 setDocument(context)来重新设置document，
     * 只有当context的ownerDocument为空并且context不等于当前的document时
     * 举个例子，比如页面中有个iframe，id为iframe1，当context为 document.getElementById('iframe1').contentDocument 时，
     * 由于此时的上下文交给了iframe中的 contentDocument，即document发生了改变，所以会重新设置document
     * 这里需要注意的是，document只是个普通的变量，不是指 window.document
     */
    if (( context ? context.ownerDocument || context : preferredDoc ) !== document) {
      setDocument(context);
    }

    context = context || document;
    //查询结果集
    results = results || [];
    nodeType = context.nodeType;
    /**
     * nodeType取值
     Node.ELEMENT_NODE (1) 元素element
     Node.ATTRIBUTE_NODE (2) 属性attr
     Node.TEXT_NODE (3) 文本text
     Node.CDATA_SECTION_NODE (4)
     Node.ENTITY_REFERENCE_NODE(5)
     Node.ENTITY_NODE (6)
     Node.PROCESSING_INSTRUCTION_NODE (7)
     Node.COMMENT_NODE (8) 注释comments
     Node.DOCUMENT_NODE (9) 文档document
     Node.DOCUMENT_TYPE_NODE (10)
     Node.DOCUMENT_FRAGMENT_NODE (11)
     Node.NOTATION_NODE (12)
     */
    //如果没传入选择器表达式或者传入的选择器表达器类型不是string 或者 nodeType不等于 [1,9,11]
    if (typeof selector !== "string" || !selector ||
      nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {

      return results;
    }

    //文档是HTML并且没有传入候选集seed
    if (!seed && documentIsHTML) {

      // Try to shortcut find operations when possible (e.g., not under DocumentFragment)
      // rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      // 快速匹配最常用的单一 id tag class
      // rquickExpr 捕获组1:id 捕获组2:tag 捕获组3:class
      if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
        // Speed-up: Sizzle("#ID") id 分支
        if ((m = match[1])) {
          if (nodeType === 9) {//Context is a document
            elem = context.getElementById(m);
            // Check parentNode to catch when Blackberry 4.6 returns
            // nodes that are no longer in the document (jQuery #6963)
            if (elem && elem.parentNode) {
              // Handle the case where IE, Opera, and Webkit return items
              // by name instead of ID
              if (elem.id === m) {
                results.push(elem);
                return results;
              }
            } else {
              return results;
            }
          } else {
            // Context is not a document
            // 得到上下文所属document,然后调用document.getElementById,并判断得到的elem是否属于contains并且看看elem的id属性是否等于m
            if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
              contains(context, elem) && elem.id === m) {
              results.push(elem);
              return results;
            }
          }

          // Speed-up: Sizzle("TAG") tag 分支
        } else if (match[2]) {
          push.apply(results, context.getElementsByTagName(selector));
          return results;

          // Speed-up: Sizzle(".CLASS") class 分支
        } else if ((m = match[3]) && support.getElementsByClassName) {
          push.apply(results, context.getElementsByClassName(m));
          return results;
        }
      }

      // QSA path
      //支持 querySelectorAll，这里support.qsa为true表示支持 querySelectorAll，并且不存在兼容性问题时
      if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
        nid = old = expando;//定义一个临时id
        newContext = context;
        newSelector = nodeType !== 1 && selector;

        // qSA works strangely on Element-rooted queries
        // We can work around this by specifying an extra ID on the root
        // and working up from there (Thanks to Andrew Dupont for the technique)
        // IE 8 doesn't work on object elements
        //这里会把selector修正为包含 [id='xx']格式的selector，便于解析
        if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
          groups = tokenize(selector);//词法解析生成token序列

          if ((old = context.getAttribute("id"))) {
            nid = old.replace(rescape, "\\$&");//替换转义特殊字符
          } else {
            context.setAttribute("id", nid);
          }
          nid = "[id='" + nid + "'] ";

          i = groups.length;
          //重新整理为带id的选择符表达式，便于查询
          while (i--) {
            groups[i] = nid + toSelector(groups[i]);
          }
          newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
          newSelector = groups.join(",");
        }

        if (newSelector) {
          try {
            push.apply(results,
              newContext.querySelectorAll(newSelector)
            );
            return results;
          } catch (qsaError) {
          } finally {
            if (!old) {//删除自动设置的id
              context.removeAttribute("id");
            }
          }
        }
      }
    }

    // All others
    // 原生方法不可用时，或是其他选择器时，即不是浏览器本身支持的，比如 :input等调用以下方法处理
    return select(selector.replace(rtrim, "$1"), context, results, seed);
  }

  /**
   * 公共函数，创建键值缓存数据，可以借用该函数实现开发中的缓存数据，
   * cache除了作为内部函数，还可以作为变量，用来存储缓存数据
   * Create key-value caches of limited size
   * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
   *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
   *  deleting the oldest entry
   */
  function createCache() {
    var keys = [];

    function cache(key, value) {
      // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
      if (keys.push(key + " ") > Expr.cacheLength) {
        // Only keep the most recent entries
        delete cache[keys.shift()];
      }
      return (cache[key + " "] = value);
    }

    return cache;
  }

  /**
   * Mark a function for special use by Sizzle
   * @param {Function} fn The function to mark
   */
  function markFunction(fn) {
    fn[expando] = true;
    return fn;
  }

  /**
   * 使用 element来测试兼容性问题
   * Support testing using an element
   * @param {Function} fn Passed the created div and expects a boolean result
   */
  function assert(fn) {
    var div = document.createElement("div");

    try {
      return !!fn(div);
    } catch (e) {
      return false;
    } finally {
      // Remove from its parent by default
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
      // release memory in IE
      div = null;
    }
  }

  /**
   * Adds the same handler for all of the specified attrs
   * @param {String} attrs Pipe-separated list of attributes
   * @param {Function} handler The method that will be applied
   */
  function addHandle(attrs, handler) {
    var arr = attrs.split("|"),
      i = attrs.length;

    while (i--) {
      Expr.attrHandle[arr[i]] = handler;
    }
  }

  /**
   * Checks document order of two siblings
   * @param {Element} a
   * @param {Element} b
   * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
   */
  function siblingCheck(a, b) {
    var cur = b && a,
      diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
        ( ~b.sourceIndex || MAX_NEGATIVE ) -
        ( ~a.sourceIndex || MAX_NEGATIVE );

    // Use IE sourceIndex if available on both nodes
    if (diff) {
      return diff;
    }

    // Check if b follows a
    if (cur) {
      while ((cur = cur.nextSibling)) {
        if (cur === b) {
          return -1;
        }
      }
    }

    return a ? 1 : -1;
  }

  /**
   * Returns a function to use in pseudos for input types
   * @param {String} type
   */
  function createInputPseudo(type) {
    return function (elem) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && elem.type === type;
    };
  }

  /**
   * Returns a function to use in pseudos for buttons
   * @param {String} type
   */
  function createButtonPseudo(type) {
    return function (elem) {
      var name = elem.nodeName.toLowerCase();
      return (name === "input" || name === "button") && elem.type === type;
    };
  }

  /**
   * Returns a function to use in pseudos for positionals
   * @param {Function} fn
   */
  function createPositionalPseudo(fn) {
    return markFunction(function (argument) {
      argument = +argument;
      return markFunction(function (seed, matches) {
        var j,
          matchIndexes = fn([], seed.length, argument),
          i = matchIndexes.length;

        // Match elements found at the specified indexes
        while (i--) {
          if (seed[(j = matchIndexes[i])]) {
            seed[j] = !(matches[j] = seed[j]);
          }
        }
      });
    });
  }

  /**
   * Checks a node for validity as a Sizzle context
   * @param {Element|Object=} context
   * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
   */
  function testContext(context) {
    return context && typeof context.getElementsByTagName !== "undefined" && context;
  }

  // Expose support vars for convenience
  support = Sizzle.support = {};

  /**
   * Detects XML nodes
   * @param {Element|Object} elem An element or a document
   * @returns {Boolean} True iff elem is a non-HTML XML node
   */
  isXML = Sizzle.isXML = function (elem) {
    // documentElement is verified for cases where it doesn't yet exist
    // (such as loading iframes in IE - #4833)
    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
  };

  /**
   * Sets document-related variables once based on the current document
   * @param {Element|Object} [doc] An element or document object to use to set the document
   * @returns {Object} Returns the current document
   */
  setDocument = Sizzle.setDocument = function (node) {
    var hasCompare, parent,
      doc = node ? node.ownerDocument || node : preferredDoc;

    // If no document and documentElement is available, return
    if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
      return document;
    }

    // Set our document
    //设置全局的document为当前doc
    document = doc;
    docElem = doc.documentElement;
    //document所属的window
    parent = doc.defaultView;

    // Support: IE>8
    // If iframe document is assigned to "document" variable and if iframe has been reloaded,
    // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
    // IE6-8 do not support the defaultView property so parent will be undefined
    // 所以要在unload的时候重新 setDocument()
    if (parent && parent !== parent.top) {
      // IE11 does not have attachEvent, so all must suffer
      if (parent.addEventListener) {
        parent.addEventListener("unload", unloadHandler, false);
      } else if (parent.attachEvent) {
        parent.attachEvent("onunload", unloadHandler);
      }
    }

    /* Support tests
     ---------------------------------------------------------------------- */
    documentIsHTML = !isXML(doc);

    /* Attributes
     ---------------------------------------------------------------------- */

    // Support: IE<8
    // Verify that getAttribute really returns attributes and not properties
    // (excepting IE8 booleans)
    // 兼容性问题，测试 getAttribute 方法是否为标准用法，对于获取class属性值
    // IE6 和 IE7 是利用 div.getAttribute("className")来获取的，标准的是用 div.getAttribute("class")获取的
    support.attributes = assert(function (div) {
      div.className = "i";
      //检查如果 div.getAttribute("className") 返回 null，说明getAttribute是标准用法
      return !div.getAttribute("className");
    });

    /* getElement(s)By*
     ---------------------------------------------------------------------- */

    // Check if getElementsByTagName("*") returns only elements
    //检查 getElementsByTagName("*") 返回的是否包含文本类型的元素，对于IE < 9 会返回包含文本类型的元素，即 div.getElementsByTagName("*").length 的值为1
    support.getElementsByTagName = assert(function (div) {
      div.appendChild(doc.createComment(""));
      return !div.getElementsByTagName("*").length;
    });

    // Support: IE<9
    // function getElementsByClassName() { [native code] }  正则表达式来检测该方法（函数是否存在）
    // 检测浏览器是否支持 getElementsByClassName
    support.getElementsByClassName = rnative.test(doc.getElementsByClassName);

    // Support: IE<10
    // Check if getElementById returns elements by name
    // The broken getElementById methods don't pick up programatically-set names,
    // so use a roundabout getElementsByName test
    // 检查getElementById是否能通过 getElementsByName 返回元素，IE < 10 是不标准的，所以 support.getById 是 false
    support.getById = assert(function (div) {
      docElem.appendChild(div).id = expando;
      return !doc.getElementsByName || !doc.getElementsByName(expando).length;
    });

    // ID find and filter
    // 标准用法
    if (support.getById) {
      Expr.find["ID"] = function (id, context) {
        if (typeof context.getElementById !== "undefined" && documentIsHTML) {
          var m = context.getElementById(id);
          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          // 检查 nodes节点是否临时创建的
          return m && m.parentNode ? [m] : [];
        }
      };
      Expr.filter["ID"] = function (id) {
        //将转义字符转回字符串
        var attrId = id.replace(runescape, funescape);
        return function (elem) {
          return elem.getAttribute("id") === attrId;
        };
      };
    } else {
      // Support: IE6/7
      // getElementById is not reliable as a find shortcut
      //IE6,7的getElementById因为会根据name返回元素，所以是不能用原生getElementById方法获取元素的。故需要删除
      delete Expr.find["ID"];

      Expr.filter["ID"] = function (id) {
        var attrId = id.replace(runescape, funescape);
        return function (elem) {
          var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
          return node && node.value === attrId;
        };
      };
    }

    // Tag
    Expr.find["TAG"] = support.getElementsByTagName ?
      function (tag, context) {
        if (typeof context.getElementsByTagName !== "undefined") {
          return context.getElementsByTagName(tag);

          // DocumentFragment nodes don't have gEBTN
        } else if (support.qsa) {
          return context.querySelectorAll(tag);
        }
      } :

      function (tag, context) {
        var elem,
          tmp = [],
          i = 0,
        // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
          results = context.getElementsByTagName(tag);

        // Filter out possible comments
        if (tag === "*") {
          while ((elem = results[i++])) {
            if (elem.nodeType === 1) {// 过滤掉其他的nodes，只保留标签元素
              tmp.push(elem);
            }
          }

          return tmp;
        }
        return results;
      };

    // Class
    Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
      if (documentIsHTML) {
        return context.getElementsByClassName(className);
      }
    };

    /* QSA/matchesSelector
     ---------------------------------------------------------------------- */

    // QSA and matchesSelector support

    // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
    rbuggyMatches = [];

    // qSa(:focus) reports false when true (Chrome 21)
    // We allow this because of a bug in IE8/9 that throws an error
    // whenever `document.activeElement` is accessed on an iframe
    // So, we allow :focus to pass through QSA all the time to avoid the IE error
    // See http://bugs.jquery.com/ticket/13378
    rbuggyQSA = [];

    // 当浏览器支持方法 querySelectorAll 时，处理一些兼容性问题，并且把查询分析器表达式放到 rbuggyQSA 中
    if ((support.qsa = rnative.test(doc.querySelectorAll))) {
      // Build QSA regex
      // Regex strategy adopted from Diego Perini
      assert(function (div) {
        // Select is set to empty string on purpose
        // This is to test IE's treatment of not explicitly
        // setting a boolean content attribute,
        // since its presence should be enough
        // http://bugs.jquery.com/ticket/12359
        docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a>" +
        "<select id='" + expando + "-\f]' msallowcapture=''>" +
        "<option selected=''></option></select>";

        // Support: IE8, Opera 11-12.16
        // Nothing should be selected when empty strings follow ^= or $= or *=
        // The test attribute must be unknown in Opera but "safe" for WinRT
        // http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
        // 检测是否可以使用 *^$ 来查询属性值
        if (div.querySelectorAll("[msallowcapture^='']").length) {
          rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
        }

        // Support: IE8
        // Boolean attributes and "value" are not treated correctly
        // 如果不支持 div.querySelectorAll("[selected]") 则需要把 booleans 中定义的放到查询分析器rbuggyQSA中
        if (!div.querySelectorAll("[selected]").length) {
          rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
        }

        // Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
        if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
          rbuggyQSA.push("~=");
        }

        // Webkit/Opera - :checked should return selected option elements
        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
        // IE8 throws error here and will not see later tests
        if (!div.querySelectorAll(":checked").length) {
          rbuggyQSA.push(":checked");
        }

        // Support: Safari 8+, iOS 8+
        // https://bugs.webkit.org/show_bug.cgi?id=136851
        // In-page `selector#id sibing-combinator selector` fails
        if (!div.querySelectorAll("a#" + expando + "+*").length) {
          rbuggyQSA.push(".#.+[+~]");
        }
      });

      assert(function (div) {
        // Support: Windows 8 Native Apps
        // The type and name attributes are restricted during .innerHTML assignment
        var input = doc.createElement("input");
        input.setAttribute("type", "hidden");
        div.appendChild(input).setAttribute("name", "D");

        // Support: IE8
        // Enforce case-sensitivity of name attribute
        if (div.querySelectorAll("[name=d]").length) {
          rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
        }

        // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
        // IE8 throws error here and will not see later tests
        if (!div.querySelectorAll(":enabled").length) {
          rbuggyQSA.push(":enabled", ":disabled");
        }

        // Opera 10-11 does not throw on post-comma invalid pseudos
        div.querySelectorAll("*,:x");
        rbuggyQSA.push(",.*:");
      });
    }

    // 当浏览器支持方法 docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector 时，
    // 处理一些兼容性问题，并且设置 rbuggyMatches
    if ((support.matchesSelector = rnative.test((matches = docElem.matches ||
      docElem.webkitMatchesSelector ||
      docElem.mozMatchesSelector ||
      docElem.oMatchesSelector ||
      docElem.msMatchesSelector)))) {

      assert(function (div) {
        // Check to see if it's possible to do matchesSelector
        // on a disconnected node (IE 9)
        support.disconnectedMatch = matches.call(div, "div");

        // This should fail with an exception
        // Gecko does not error, returns false instead
        matches.call(div, "[s!='']:x");
        rbuggyMatches.push("!=", pseudos);
      });
    }

    rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
    rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

    /* Contains
     ---------------------------------------------------------------------- */
    // compareDocumentPosition 是用来确定两个node位置的，node A node B 可能有以下位置
    /**
     *
     Bits
     (compareDocumentPosition 返回值)         Number        Meaning
     000000                                     0              元素一致
     000001                                     1              节点在不同的文档（或者一个在文档之外）
     000010                                     2              节点 B 在节点 A 之前
     000100                                     4              节点 A 在节点 B 之前
     001000                                     8              节点 B 包含节点 A
     010000                                     16             节点 A 包含节点 B
     100000                                     32             浏览器的私有使用
     * 对于IE是调用 contains 来实现的，但没有compareDocumentPosition功能强大
     */
    hasCompare = rnative.test(docElem.compareDocumentPosition);

    // Element contains another
    // Purposefully does not implement inclusive descendent
    // As in, an element does not contain itself
    // 利用 compareDocumentPosition 或 contains来判断两个node元素是否为包含关系
    contains = hasCompare || rnative.test(docElem.contains) ?
      function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
          bup = b && b.parentNode;
        return a === bup || !!( bup && bup.nodeType === 1 && (
            adown.contains ?
              adown.contains(bup) :
            a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
          ));
      } :
      function (a, b) {
        if (b) {
          while ((b = b.parentNode)) {
            if (b === a) {
              return true;
            }
          }
        }
        return false;
      };

    /* Sorting
     ---------------------------------------------------------------------- */

    // Document order sorting
    // 节点元素排序函数
    sortOrder = hasCompare ?
      function (a, b) {

        // Flag for duplicate removal
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }

        // Sort on method existence if only one input has compareDocumentPosition
        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
        if (compare) {
          return compare;
        }

        // Calculate position if both inputs belong to the same document
        compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
          a.compareDocumentPosition(b) :

          // Otherwise we know they are disconnected
          1;

        // Disconnected nodes
        if (compare & 1 ||
          (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {

          // Choose the first element that is related to our preferred document
          if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
            return -1;
          }
          if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
            return 1;
          }

          // Maintain original order
          return sortInput ?
            ( indexOf(sortInput, a) - indexOf(sortInput, b) ) :
            0;
        }

        return compare & 4 ? -1 : 1;
      } :
      function (a, b) {
        // Exit early if the nodes are identical
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }

        var cur,
          i = 0,
          aup = a.parentNode,
          bup = b.parentNode,
          ap = [a],
          bp = [b];

        // Parentless nodes are either documents or disconnected
        if (!aup || !bup) {
          return a === doc ? -1 :
            b === doc ? 1 :
              aup ? -1 :
                bup ? 1 :
                  sortInput ?
                    ( indexOf(sortInput, a) - indexOf(sortInput, b) ) :
                    0;

          // If the nodes are siblings, we can do a quick check
        } else if (aup === bup) {
          return siblingCheck(a, b);
        }

        // Otherwise we need full lists of their ancestors for comparison
        cur = a;
        while ((cur = cur.parentNode)) {
          ap.unshift(cur);
        }
        cur = b;
        while ((cur = cur.parentNode)) {
          bp.unshift(cur);
        }

        // Walk down the tree looking for a discrepancy
        while (ap[i] === bp[i]) {
          i++;
        }

        return i ?
          // Do a sibling check if the nodes have a common ancestor
          siblingCheck(ap[i], bp[i]) :

          // Otherwise nodes in our document sort first
          ap[i] === preferredDoc ? -1 :
            bp[i] === preferredDoc ? 1 :
              0;
      };

    return doc;
  };

  Sizzle.matches = function (expr, elements) {
    return Sizzle(expr, null, null, elements);
  };

  Sizzle.matchesSelector = function (elem, expr) {
    // Set document vars if needed
    if (( elem.ownerDocument || elem ) !== document) {
      setDocument(elem);
    }

    // Make sure that attribute selectors are quoted
    expr = expr.replace(rattributeQuotes, "='$1']");

    if (support.matchesSelector && documentIsHTML &&
      ( !rbuggyMatches || !rbuggyMatches.test(expr) ) &&
      ( !rbuggyQSA || !rbuggyQSA.test(expr) )) {

      try {
        var ret = matches.call(elem, expr);

        // IE 9's matchesSelector returns false on disconnected nodes
        if (ret || support.disconnectedMatch ||
            // As well, disconnected nodes are said to be in a document
            // fragment in IE 9
          elem.document && elem.document.nodeType !== 11) {
          return ret;
        }
      } catch (e) {
      }
    }

    return Sizzle(expr, document, null, [elem]).length > 0;
  };

  Sizzle.contains = function (context, elem) {
    // Set document vars if needed
    if (( context.ownerDocument || context ) !== document) {
      setDocument(context);
    }
    return contains(context, elem);
  };

  Sizzle.attr = function (elem, name) {
    // Set document vars if needed
    if (( elem.ownerDocument || elem ) !== document) {
      setDocument(elem);
    }

    var fn = Expr.attrHandle[name.toLowerCase()],
    // Don't get fooled by Object.prototype properties (jQuery #13807)
      val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
        fn(elem, name, !documentIsHTML) :
        undefined;

    return val !== undefined ?
      val :
      support.attributes || !documentIsHTML ?
        elem.getAttribute(name) :
        (val = elem.getAttributeNode(name)) && val.specified ?
          val.value :
          null;
  };

  Sizzle.error = function (msg) {
    throw new Error("Syntax error, unrecognized expression: " + msg);
  };

  /**
   * Document sorting and removing duplicates
   * @param {ArrayLike} results
   */
  Sizzle.uniqueSort = function (results) {
    var elem,
      duplicates = [],
      j = 0,
      i = 0;

    // Unless we *know* we can detect duplicates, assume their presence
    hasDuplicate = !support.detectDuplicates;
    sortInput = !support.sortStable && results.slice(0);
    results.sort(sortOrder);

    if (hasDuplicate) {
      while ((elem = results[i++])) {
        if (elem === results[i]) {
          j = duplicates.push(i);
        }
      }
      while (j--) {
        results.splice(duplicates[j], 1);
      }
    }

    // Clear input after sorting to release objects
    // See https://github.com/jquery/sizzle/pull/225
    sortInput = null;

    return results;
  };

  /**
   * Utility function for retrieving the text value of an array of DOM nodes
   * @param {Array|Element} elem
   */
  getText = Sizzle.getText = function (elem) {
    var node,
      ret = "",
      i = 0,
      nodeType = elem.nodeType;

    if (!nodeType) {
      // If no nodeType, this is expected to be an array
      while ((node = elem[i++])) {
        // Do not traverse comment nodes
        ret += getText(node);
      }
    } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
      // Use textContent for elements
      // innerText usage removed for consistency of new lines (jQuery #11153)
      if (typeof elem.textContent === "string") {
        return elem.textContent;
      } else {
        // Traverse its children
        for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
          ret += getText(elem);
        }
      }
    } else if (nodeType === 3 || nodeType === 4) {
      return elem.nodeValue;
    }
    // Do not include comment or processing instruction nodes

    return ret;
  };

  //选择器实体，用来处理不同的选择器
  //用来处理关系符、过滤器以及伪类
  Expr = Sizzle.selectors = {

    // Can be adjusted by the user
    cacheLength: 50,

    createPseudo: markFunction,

    match: matchExpr,

    attrHandle: {},

    find: {},//设置通过ID TAG 和CLASS来查询元素，见 setDocument

    relative: {
      ">": {dir: "parentNode", first: true},
      " ": {dir: "parentNode"},
      "+": {dir: "previousSibling", first: true},
      "~": {dir: "previousSibling"}
    },

    preFilter: {
      "ATTR": function (match) {
        match[1] = match[1].replace(runescape, funescape);

        // Move the given value to match[3] whether quoted or unquoted
        match[3] = ( match[3] || match[4] || match[5] || "" ).replace(runescape, funescape);

        if (match[2] === "~=") {
          match[3] = " " + match[3] + " ";
        }

        return match.slice(0, 4);
      },

      "CHILD": function (match) {
        /* matches from matchExpr["CHILD"]
         1 type (only|nth|...)
         2 what (child|of-type)
         3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
         4 xn-component of xn+y argument ([+-]?\d*n|)
         5 sign of xn-component
         6 x of xn-component
         7 sign of y-component
         8 y of y-component
         */
        match[1] = match[1].toLowerCase();

        if (match[1].slice(0, 3) === "nth") {
          // nth-* requires argument
          if (!match[3]) {
            Sizzle.error(match[0]);
          }

          // numeric x and y parameters for Expr.filter.CHILD
          // remember that false/true cast respectively to 0/1
          match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
          match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

          // other types prohibit arguments
        } else if (match[3]) {
          Sizzle.error(match[0]);
        }

        return match;
      },

      "PSEUDO": function (match) {
        var excess,
          unquoted = !match[6] && match[2];

        if (matchExpr["CHILD"].test(match[0])) {
          return null;
        }

        // Accept quoted arguments as-is
        if (match[3]) {
          match[2] = match[4] || match[5] || "";

          // Strip excess characters from unquoted arguments
        } else if (unquoted && rpseudo.test(unquoted) &&
            // Get excess from tokenize (recursively)
          (excess = tokenize(unquoted, true)) &&
            // advance to the next closing parenthesis
          (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

          // excess is a negative index
          match[0] = match[0].slice(0, excess);
          match[2] = unquoted.slice(0, excess);
        }

        // Return only captures needed by the pseudo filter method (type and argument)
        return match.slice(0, 3);
      }
    },

    filter: {

      "TAG": function (nodeNameSelector) {
        var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
        return nodeNameSelector === "*" ?
          function () {
            return true;
          } :
          function (elem) {
            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
          };
      },

      "CLASS": function (className) {
        var pattern = classCache[className + " "];

        return pattern ||
          (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
          classCache(className, function (elem) {
            return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
          });
      },

      "ATTR": function (name, operator, check) {
        return function (elem) {
          var result = Sizzle.attr(elem, name);

          if (result == null) {
            return operator === "!=";
          }
          if (!operator) {
            return true;
          }

          result += "";

          return operator === "=" ? result === check :
            operator === "!=" ? result !== check :
              operator === "^=" ? check && result.indexOf(check) === 0 :
                operator === "*=" ? check && result.indexOf(check) > -1 :
                  operator === "$=" ? check && result.slice(-check.length) === check :
                    operator === "~=" ? ( " " + result.replace(rwhitespace, " ") + " " ).indexOf(check) > -1 :
                      operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
                        false;
        };
      },

      "CHILD": function (type, what, argument, first, last) {
        var simple = type.slice(0, 3) !== "nth",
          forward = type.slice(-4) !== "last",
          ofType = what === "of-type";

        return first === 1 && last === 0 ?

          // Shortcut for :nth-*(n)
          function (elem) {
            return !!elem.parentNode;
          } :

          function (elem, context, xml) {
            var cache, outerCache, node, diff, nodeIndex, start,
              dir = simple !== forward ? "nextSibling" : "previousSibling",
              parent = elem.parentNode,
              name = ofType && elem.nodeName.toLowerCase(),
              useCache = !xml && !ofType;

            if (parent) {

              // :(first|last|only)-(child|of-type)
              if (simple) {
                while (dir) {
                  node = elem;
                  while ((node = node[dir])) {
                    if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                      return false;
                    }
                  }
                  // Reverse direction for :only-* (if we haven't yet done so)
                  start = dir = type === "only" && !start && "nextSibling";
                }
                return true;
              }

              start = [forward ? parent.firstChild : parent.lastChild];

              // non-xml :nth-child(...) stores cache data on `parent`
              if (forward && useCache) {
                // Seek `elem` from a previously-cached index
                outerCache = parent[expando] || (parent[expando] = {});
                cache = outerCache[type] || [];
                nodeIndex = cache[0] === dirruns && cache[1];
                diff = cache[0] === dirruns && cache[2];
                node = nodeIndex && parent.childNodes[nodeIndex];

                while ((node = ++nodeIndex && node && node[dir] ||

                  // Fallback to seeking `elem` from the start
                (diff = nodeIndex = 0) || start.pop())) {

                  // When found, cache indexes on `parent` and break
                  if (node.nodeType === 1 && ++diff && node === elem) {
                    outerCache[type] = [dirruns, nodeIndex, diff];
                    break;
                  }
                }

                // Use previously-cached element index if available
              } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                diff = cache[1];

                // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
              } else {
                // Use the same loop as above to seek `elem` from the start
                while ((node = ++nodeIndex && node && node[dir] ||
                (diff = nodeIndex = 0) || start.pop())) {

                  if (( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff) {
                    // Cache the index of each encountered element
                    if (useCache) {
                      (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
                    }

                    if (node === elem) {
                      break;
                    }
                  }
                }
              }

              // Incorporate the offset, then check against cycle size
              diff -= last;
              return diff === first || ( diff % first === 0 && diff / first >= 0 );
            }
          };
      },

      "PSEUDO": function (pseudo, argument) {
        // pseudo-class names are case-insensitive
        // http://www.w3.org/TR/selectors/#pseudo-classes
        // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
        // Remember that setFilters inherits from pseudos
        var args,
          fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
            Sizzle.error("unsupported pseudo: " + pseudo);

        // The user may use createPseudo to indicate that
        // arguments are needed to create the filter function
        // just as Sizzle does
        if (fn[expando]) {
          return fn(argument);
        }

        // But maintain support for old signatures
        if (fn.length > 1) {
          args = [pseudo, pseudo, "", argument];
          return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
            markFunction(function (seed, matches) {
              var idx,
                matched = fn(seed, argument),
                i = matched.length;
              while (i--) {
                idx = indexOf(seed, matched[i]);
                seed[idx] = !( matches[idx] = matched[i] );
              }
            }) :
            function (elem) {
              return fn(elem, 0, args);
            };
        }

        return fn;
      }
    },

    pseudos: {
      // Potentially complex pseudos
      "not": markFunction(function (selector) {
        // Trim the selector passed to compile
        // to avoid treating leading and trailing
        // spaces as combinators
        var input = [],
          results = [],
          matcher = compile(selector.replace(rtrim, "$1"));

        return matcher[expando] ?
          markFunction(function (seed, matches, context, xml) {
            var elem,
              unmatched = matcher(seed, null, xml, []),
              i = seed.length;

            // Match elements unmatched by `matcher`
            while (i--) {
              if ((elem = unmatched[i])) {
                seed[i] = !(matches[i] = elem);
              }
            }
          }) :
          function (elem, context, xml) {
            input[0] = elem;
            matcher(input, null, xml, results);
            // Don't keep the element (issue #299)
            input[0] = null;
            return !results.pop();
          };
      }),

      "has": markFunction(function (selector) {
        return function (elem) {
          return Sizzle(selector, elem).length > 0;
        };
      }),

      "contains": markFunction(function (text) {
        text = text.replace(runescape, funescape);
        return function (elem) {
          return ( elem.textContent || elem.innerText || getText(elem) ).indexOf(text) > -1;
        };
      }),

      // "Whether an element is represented by a :lang() selector
      // is based solely on the element's language value
      // being equal to the identifier C,
      // or beginning with the identifier C immediately followed by "-".
      // The matching of C against the element's language value is performed case-insensitively.
      // The identifier C does not have to be a valid language name."
      // http://www.w3.org/TR/selectors/#lang-pseudo
      "lang": markFunction(function (lang) {
        // lang value must be a valid identifier
        if (!ridentifier.test(lang || "")) {
          Sizzle.error("unsupported lang: " + lang);
        }
        lang = lang.replace(runescape, funescape).toLowerCase();
        return function (elem) {
          var elemLang;
          do {
            if ((elemLang = documentIsHTML ?
                elem.lang :
              elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

              elemLang = elemLang.toLowerCase();
              return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
            }
          } while ((elem = elem.parentNode) && elem.nodeType === 1);
          return false;
        };
      }),

      // Miscellaneous
      "target": function (elem) {
        var hash = window.location && window.location.hash;
        return hash && hash.slice(1) === elem.id;
      },

      "root": function (elem) {
        return elem === docElem;
      },

      "focus": function (elem) {
        return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
      },

      // Boolean properties
      "enabled": function (elem) {
        return elem.disabled === false;
      },

      "disabled": function (elem) {
        return elem.disabled === true;
      },

      "checked": function (elem) {
        // In CSS3, :checked should return both checked and selected elements
        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
        var nodeName = elem.nodeName.toLowerCase();
        return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
      },

      "selected": function (elem) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
          elem.parentNode.selectedIndex;
        }

        return elem.selected === true;
      },

      // Contents
      "empty": function (elem) {
        // http://www.w3.org/TR/selectors/#empty-pseudo
        // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
        //   but not by others (comment: 8; processing instruction: 7; etc.)
        // nodeType < 6 works because attributes (2) do not appear as children
        for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
          if (elem.nodeType < 6) {
            return false;
          }
        }
        return true;
      },

      "parent": function (elem) {
        return !Expr.pseudos["empty"](elem);
      },

      // Element/input types
      "header": function (elem) {
        return rheader.test(elem.nodeName);
      },

      "input": function (elem) {
        return rinputs.test(elem.nodeName);
      },

      "button": function (elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === "button" || name === "button";
      },

      "text": function (elem) {
        var attr;
        return elem.nodeName.toLowerCase() === "input" &&
          elem.type === "text" &&

            // Support: IE<8
            // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
          ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
      },

      // Position-in-collection
      "first": createPositionalPseudo(function () {
        return [0];
      }),

      "last": createPositionalPseudo(function (matchIndexes, length) {
        return [length - 1];
      }),

      "eq": createPositionalPseudo(function (matchIndexes, length, argument) {
        return [argument < 0 ? argument + length : argument];
      }),

      "even": createPositionalPseudo(function (matchIndexes, length) {
        var i = 0;
        for (; i < length; i += 2) {
          matchIndexes.push(i);
        }
        return matchIndexes;
      }),

      "odd": createPositionalPseudo(function (matchIndexes, length) {
        var i = 1;
        for (; i < length; i += 2) {
          matchIndexes.push(i);
        }
        return matchIndexes;
      }),

      "lt": createPositionalPseudo(function (matchIndexes, length, argument) {
        var i = argument < 0 ? argument + length : argument;
        for (; --i >= 0;) {
          matchIndexes.push(i);
        }
        return matchIndexes;
      }),

      "gt": createPositionalPseudo(function (matchIndexes, length, argument) {
        var i = argument < 0 ? argument + length : argument;
        for (; ++i < length;) {
          matchIndexes.push(i);
        }
        return matchIndexes;
      })
    }
  };

  Expr.pseudos["nth"] = Expr.pseudos["eq"];

  // Add button/input type pseudos
  for (i in {radio: true, checkbox: true, file: true, password: true, image: true}) {
    Expr.pseudos[i] = createInputPseudo(i);
  }
  for (i in {submit: true, reset: true}) {
    Expr.pseudos[i] = createButtonPseudo(i);
  }

  // Easy API for creating new setFilters
  //注意以下的写法，Expr.setFilters 是 setFilters的一个实例，拥有了Expr.pseudos中的方法
  function setFilters() {
  }

  setFilters.prototype = Expr.filters = Expr.pseudos;
  Expr.setFilters = new setFilters();

  /**
   * 处理选择器表达式，返回token序列，格式为：{value:'匹配到的表达式', type:'对应的Token类型，有CLASS，ID，TAG等', matches:'正则匹配到的结果，是一数组格式'}
   * 比如：
   * 词法分析过程为
   * 首先判断是否为带,号的空白（处理选择器表达式分组），
   * 然后再判断是否是带>+~的选择器表达式，再处理Expr.filter
   * @type {Function}
   */
  tokenize = Sizzle.tokenize = function (selector, parseOnly) {
    /**
     * matched 是否匹配到
     * match 匹配的结果
     * tokens 每个token序列
     * type token类型
     * soFar 表示目前还未分析的字符串
     * groups 根据选择器表达式 , 号来分组，是一二维数组
     * preFilters 前置过滤器，正则匹配到的内容的一个预处理
     * cached  缓存的token
     */
    var matched, match, tokens, type,
      soFar, groups, preFilters,
      cached = tokenCache[selector + " "];

    if (cached) {
      return parseOnly ? 0 : cached.slice(0);//这样写是防止引用，因为[].slice(0)返回新的对象
    }

    soFar = selector;
    /**
     * 假设选择器表达式为 #demo > p ~ div.button-panel > :button,#text_panel:first-child，那么词法分析后，group的值为
     * [
     [
     {
       "value": "#demo",
       "type": "ID",
       "matches": ["demo"]
     },
     {
       "value": " > ",
       "type": ">"
     },
     {
       "value": "p",
       "type": "TAG",
       "matches": ["p"]
     },
     {
       "value": " ~ ",
       "type": "~"
     },
     {
       "value": "div",
       "type": "TAG",
       "matches": ["div"]
     },
     {
       "value": ".button-panel",
       "type": "CLASS",
       "matches": ["button-panel"]
     },
     {
       "value": " > ",
       "type": ">"
     },
     {
       "value": ":button",
       "type": "PSEUDO",
       "matches": [
         "button",
         null
       ]
     }
     ],
     [
     {
       "value": "#text_panel",
       "type": "ID",
       "matches": ["text_panel"]
     },
     {
       "value": ":first-child",
       "type": "CHILD",
       "matches": [
         "first",
         "child",
         null,
         null,
         null,
         null,
         null,
         null
       ]
     }
     ]
     ]
     */
    groups = [];
    preFilters = Expr.preFilter;

    //依次检测选择器表达式
    while (soFar) {

      // Comma and first run
      // 带,号的空白并且是初次运行（处理选择器表达式分组）
      if (!matched || (match = rcomma.exec(soFar))) {
        if (match) {
          // Don't consume trailing commas as valid
          soFar = soFar.slice(match[0].length) || soFar;
        }
        //开始一个新的token分组
        groups.push((tokens = []));
      }

      matched = false;

      // Combinators
      // 是否是带>+~的选择器表达式
      if ((match = rcombinators.exec(soFar))) {
        matched = match.shift();
        tokens.push({
          value: matched,
          // Cast descendant combinators to space
          type: match[0].replace(rtrim, " ")
        });
        soFar = soFar.slice(matched.length);
      }

      // Filters
      //这里开始分析以下Token ： TAG CLASS ATTR  CHILD PSEUDO
      for (type in Expr.filter) {
        //对于 ATTR  CHILD PSEUDO 需要调用preFilters来预处理 match = preFilters[type](match)))
        if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] ||
          (match = preFilters[type](match)))) {
          matched = match.shift();
          tokens.push({
            value: matched,
            type: type,
            matches: match
          });
          soFar = soFar.slice(matched.length);
        }
      }

      //如果没有匹配到，说明选择器表达式有错误，将会中断，并抛出异常
      if (!matched) {
        break;
      }
    }

    // Return the length of the invalid excess
    // if we're just parsing
    // Otherwise, throw an error or return tokens
    //如果无法解析词法，则抛出错误，否则放到tokenCache缓存中，并返回该tokens
    return parseOnly ?
      soFar.length :
      soFar ?
        Sizzle.error(selector) :
        // Cache the tokens
        tokenCache(selector, groups).slice(0);//调用slice(0)生成新的对象，而不是原先引用的
  };

  function toSelector(tokens) {
    var i = 0,
      len = tokens.length,
      selector = "";
    for (; i < len; i++) {
      selector += tokens[i].value;
    }
    return selector;
  }

  function addCombinator(matcher, combinator, base) {
    var dir = combinator.dir,
      checkNonElements = base && dir === "parentNode",
      doneName = done++;

    return combinator.first ?
      // Check against closest ancestor/preceding element
      function (elem, context, xml) {
        while ((elem = elem[dir])) {
          if (elem.nodeType === 1 || checkNonElements) {
            return matcher(elem, context, xml);
          }
        }
      } :

      // Check against all ancestor/preceding elements
      function (elem, context, xml) {
        var oldCache, outerCache,
          newCache = [dirruns, doneName];

        // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
        if (xml) {
          while ((elem = elem[dir])) {
            if (elem.nodeType === 1 || checkNonElements) {
              if (matcher(elem, context, xml)) {
                return true;
              }
            }
          }
        } else {
          while ((elem = elem[dir])) {
            if (elem.nodeType === 1 || checkNonElements) {
              outerCache = elem[expando] || (elem[expando] = {});
              if ((oldCache = outerCache[dir]) &&
                oldCache[0] === dirruns && oldCache[1] === doneName) {

                // Assign to newCache so results back-propagate to previous elements
                return (newCache[2] = oldCache[2]);
              } else {
                // Reuse newcache so results back-propagate to previous elements
                outerCache[dir] = newCache;

                // A match means we're done; a fail means we have to keep checking
                if ((newCache[2] = matcher(elem, context, xml))) {
                  return true;
                }
              }
            }
          }
        }
      };
  }

  function elementMatcher(matchers) {
    return matchers.length > 1 ?
      function (elem, context, xml) {
        var i = matchers.length;
        while (i--) {
          if (!matchers[i](elem, context, xml)) {
            return false;
          }
        }
        return true;
      } :
      matchers[0];
  }

  function multipleContexts(selector, contexts, results) {
    var i = 0,
      len = contexts.length;
    for (; i < len; i++) {
      Sizzle(selector, contexts[i], results);
    }
    return results;
  }

  function condense(unmatched, map, filter, context, xml) {
    var elem,
      newUnmatched = [],
      i = 0,
      len = unmatched.length,
      mapped = map != null;

    for (; i < len; i++) {
      if ((elem = unmatched[i])) {
        if (!filter || filter(elem, context, xml)) {
          newUnmatched.push(elem);
          if (mapped) {
            map.push(i);
          }
        }
      }
    }

    return newUnmatched;
  }

  function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
    if (postFilter && !postFilter[expando]) {
      postFilter = setMatcher(postFilter);
    }
    if (postFinder && !postFinder[expando]) {
      postFinder = setMatcher(postFinder, postSelector);
    }
    return markFunction(function (seed, results, context, xml) {
      var temp, i, elem,
        preMap = [],
        postMap = [],
        preexisting = results.length,

      // Get initial elements from seed or context
        elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),

      // Prefilter to get matcher input, preserving a map for seed-results synchronization
        matcherIn = preFilter && ( seed || !selector ) ?
          condense(elems, preMap, preFilter, context, xml) :
          elems,

        matcherOut = matcher ?
          // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
          postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

            // ...intermediate processing is necessary
            [] :

            // ...otherwise use results directly
            results :
          matcherIn;

      // Find primary matches
      if (matcher) {
        matcher(matcherIn, matcherOut, context, xml);
      }

      // Apply postFilter
      if (postFilter) {
        temp = condense(matcherOut, postMap);
        postFilter(temp, [], context, xml);

        // Un-match failing elements by moving them back to matcherIn
        i = temp.length;
        while (i--) {
          if ((elem = temp[i])) {
            matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
          }
        }
      }

      if (seed) {
        if (postFinder || preFilter) {
          if (postFinder) {
            // Get the final matcherOut by condensing this intermediate into postFinder contexts
            temp = [];
            i = matcherOut.length;
            while (i--) {
              if ((elem = matcherOut[i])) {
                // Restore matcherIn since elem is not yet a final match
                temp.push((matcherIn[i] = elem));
              }
            }
            postFinder(null, (matcherOut = []), temp, xml);
          }

          // Move matched elements from seed to results to keep them synchronized
          i = matcherOut.length;
          while (i--) {
            if ((elem = matcherOut[i]) &&
              (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {

              seed[temp] = !(results[temp] = elem);
            }
          }
        }

        // Add elements to results, through postFinder if defined
      } else {
        matcherOut = condense(
          matcherOut === results ?
            matcherOut.splice(preexisting, matcherOut.length) :
            matcherOut
        );
        if (postFinder) {
          postFinder(null, results, matcherOut, xml);
        } else {
          push.apply(results, matcherOut);
        }
      }
    });
  }

  function matcherFromTokens(tokens) {
    var checkContext, matcher, j,
      len = tokens.length,
      leadingRelative = Expr.relative[tokens[0].type],
      implicitRelative = leadingRelative || Expr.relative[" "],
      i = leadingRelative ? 1 : 0,

    // The foundational matcher ensures that elements are reachable from top-level context(s)
      matchContext = addCombinator(function (elem) {
        return elem === checkContext;
      }, implicitRelative, true),
      matchAnyContext = addCombinator(function (elem) {
        return indexOf(checkContext, elem) > -1;
      }, implicitRelative, true),
      matchers = [function (elem, context, xml) {
        var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
            (checkContext = context).nodeType ?
              matchContext(elem, context, xml) :
              matchAnyContext(elem, context, xml) );
        // Avoid hanging onto element (issue #299)
        checkContext = null;
        return ret;
      }];

    for (; i < len; i++) {
      if ((matcher = Expr.relative[tokens[i].type])) {
        matchers = [addCombinator(elementMatcher(matchers), matcher)];
      } else {
        matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

        // Return special upon seeing a positional matcher
        if (matcher[expando]) {
          // Find the next relative operator (if any) for proper handling
          j = ++i;
          for (; j < len; j++) {
            if (Expr.relative[tokens[j].type]) {
              break;
            }
          }
          return setMatcher(
            i > 1 && elementMatcher(matchers),
            i > 1 && toSelector(
              // If the preceding token was a descendant combinator, insert an implicit any-element `*`
              tokens.slice(0, i - 1).concat({value: tokens[i - 2].type === " " ? "*" : ""})
            ).replace(rtrim, "$1"),
            matcher,
            i < j && matcherFromTokens(tokens.slice(i, j)),
            j < len && matcherFromTokens((tokens = tokens.slice(j))),
            j < len && toSelector(tokens)
          );
        }
        matchers.push(matcher);
      }
    }

    return elementMatcher(matchers);
  }

  function matcherFromGroupMatchers(elementMatchers, setMatchers) {
    var bySet = setMatchers.length > 0,
      byElement = elementMatchers.length > 0,
      superMatcher = function (seed, context, xml, results, outermost) {
        var elem, j, matcher,
          matchedCount = 0,
          i = "0",
          unmatched = seed && [],
          setMatched = [],
          contextBackup = outermostContext,
        // We must always have either seed elements or outermost context
          elems = seed || byElement && Expr.find["TAG"]("*", outermost),
        // Use integer dirruns iff this is the outermost matcher
          dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
          len = elems.length;

        if (outermost) {
          outermostContext = context !== document && context;
        }

        // Add elements passing elementMatchers directly to results
        // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
        // Support: IE<9, Safari
        // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
        for (; i !== len && (elem = elems[i]) != null; i++) {
          if (byElement && elem) {
            j = 0;
            while ((matcher = elementMatchers[j++])) {
              if (matcher(elem, context, xml)) {
                results.push(elem);
                break;
              }
            }
            if (outermost) {
              dirruns = dirrunsUnique;
            }
          }

          // Track unmatched elements for set filters
          if (bySet) {
            // They will have gone through all possible matchers
            if ((elem = !matcher && elem)) {
              matchedCount--;
            }

            // Lengthen the array for every element, matched or not
            if (seed) {
              unmatched.push(elem);
            }
          }
        }

        // Apply set filters to unmatched elements
        matchedCount += i;
        if (bySet && i !== matchedCount) {
          j = 0;
          while ((matcher = setMatchers[j++])) {
            matcher(unmatched, setMatched, context, xml);
          }

          if (seed) {
            // Reintegrate element matches to eliminate the need for sorting
            if (matchedCount > 0) {
              while (i--) {
                if (!(unmatched[i] || setMatched[i])) {
                  setMatched[i] = pop.call(results);
                }
              }
            }

            // Discard index placeholder values to get only actual matches
            setMatched = condense(setMatched);
          }

          // Add matches to results
          push.apply(results, setMatched);

          // Seedless set matches succeeding multiple successful matchers stipulate sorting
          if (outermost && !seed && setMatched.length > 0 &&
            ( matchedCount + setMatchers.length ) > 1) {

            Sizzle.uniqueSort(results);
          }
        }

        // Override manipulation of globals by nested matchers
        if (outermost) {
          dirruns = dirrunsUnique;
          outermostContext = contextBackup;
        }

        return unmatched;
      };

    return bySet ?
      markFunction(superMatcher) :
      superMatcher;
  }

  /**
   * 编译函数
   * @type {Function}
   */
  compile = Sizzle.compile = function (selector, match /* Internal Use Only */) {
    var i,
      setMatchers = [],
      elementMatchers = [],
      cached = compilerCache[selector + " "];

    if (!cached) {
      // Generate a function of recursive functions that can be used to check each element
      if (!match) {
        match = tokenize(selector);
      }
      i = match.length;
      while (i--) {
        cached = matcherFromTokens(match[i]);
        if (cached[expando]) {
          setMatchers.push(cached);
        } else {
          elementMatchers.push(cached);
        }
      }

      // Cache the compiled function
      cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));

      // Save selector and tokenization
      cached.selector = selector;
    }
    return cached;
  };

  /**
   *  http://blog.csdn.net/songzheng_741/article/details/25704159
   * 用来处理浏览器不支持 querySelectorAll 的情况或者处理低级别的选择器，也就是浏览器不支持的选择符，比如 :button 等
   * 该方法处理效率比浏览器支持的选择器低，因此在考虑性能的时候，尽量使用CSS3选择器，即浏览器原生的选择器
   * A low-level selection function that works with Sizzle's compiled
   *  selector functions
   * @param {String|Function} selector A selector or a pre-compiled
   *  selector function built with Sizzle.compile
   * @param {Element} context
   * @param {Array} [results]
   * @param {Array} [seed] A set of elements to match against
   */
  select = Sizzle.select = function (selector, context, results, seed) {
    var i, tokens, token, type, find,
      compiled = typeof selector === "function" && selector,
      match = !seed && tokenize((selector = compiled.selector || selector));

    results = results || [];

    // Try to minimize operations if there is no seed and only one group
    if (match.length === 1) {//如果只匹配到一个，即没有,号的情况

      // Take a shortcut and set the context if the root selector is an ID
      tokens = match[0] = match[0].slice(0);
      //如果第一个是ID，并且是context是window.document，并且是HTML，下一个表达式是相关联的表达式（> + ~ 或空白）
      //则调用id来快速查找
      if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
        support.getById && context.nodeType === 9 && documentIsHTML &&
        Expr.relative[tokens[1].type]) {

        //Expr.find["ID"] 通过 id 查询元素， 见setDocument
        context = ( Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [] )[0];
        if (!context) {//如果context这个元素（selector第一个id选择器）都不存在就不用查找了
          return results;

          // Precompiled matchers will still verify ancestry, so step up a level
          //如果有compile，那么取context为父节点
        } else if (compiled) {
          context = context.parentNode;
        }

        selector = selector.slice(tokens.shift().value.length);//去掉id选择器
      }

      // Fetch a seed set for right-to-left matching
      //"needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
      //如果存在needsContext中的表达式，则不需要处理，否则需要处理
      i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
      //从右向左处理
      while (i--) {
        token = tokens[i];

        // Abort if we hit a combinator
        if (Expr.relative[(type = token.type)]) {
          break;
        }
        //如果有浏览器本身的查询器，即 getElementById getElementsByClassName getElementsByName 或 getElementsByTagName，就用浏览器提供的接口
        if ((find = Expr.find[type])) {
          // Search, expanding context for leading sibling combinators
          //尝试一下能否通过这个搜索器搜到符合条件的初始集合seed
          if ((seed = find(
              token.matches[0].replace(runescape, funescape),
              rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
            ))) {

            // If seed is empty or no tokens remain, we can return early
            tokens.splice(i, 1);//删除第i条数据，也就是最后一条token
            selector = seed.length && toSelector(tokens);
            if (!selector) {
              push.apply(results, seed);
              return results;
            }
            //已经找到了符合条件的seed集合，此时前边还有其他规则，跳出去
            break;
          }
        }
      }
    }

    // Compile and execute a filtering function if one is not provided
    // Provide `match` to avoid retokenization if we modified the selector above
    /**
     * 交由compile来生成一个称为终极匹配器，见 Sizzle.compile
     * 通过这个匹配器过滤seed，把符合条件的结果放到results里边
     * 生成编译函数 var superMatcher =  compile( selector, match )
     * 执行 superMatcher(seed,context,!documentIsHTML,results,rsibling.test(selector) && testContext(context.parentNode) || context)
     */
    ( compiled || compile(selector, match) )(
      seed,
      context,
      !documentIsHTML,
      results,
      rsibling.test(selector) && testContext(context.parentNode) || context
    );
    return results;
  };

  // One-time assignments

  // Sort stability
  support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

  // Support: Chrome 14-35+
  // Always assume duplicates if they aren't passed to the comparison function
  support.detectDuplicates = !!hasDuplicate;

  // Initialize against the default document
  setDocument();

  // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
  // Detached nodes confoundingly follow *each other*
  support.sortDetached = assert(function (div1) {
    // Should return 1, but returns 4 (following)
    return div1.compareDocumentPosition(document.createElement("div")) & 1;
  });

  // Support: IE<8
  // Prevent attribute/property "interpolation"
  // http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
  if (!assert(function (div) {
      div.innerHTML = "<a href='#'></a>";
      return div.firstChild.getAttribute("href") === "#";
    })) {
    addHandle("type|href|height|width", function (elem, name, isXML) {
      if (!isXML) {
        return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
      }
    });
  }

  // Support: IE<9
  // Use defaultValue in place of getAttribute("value")
  if (!support.attributes || !assert(function (div) {
      div.innerHTML = "<input/>";
      div.firstChild.setAttribute("value", "");
      return div.firstChild.getAttribute("value") === "";
    })) {
    addHandle("value", function (elem, name, isXML) {
      if (!isXML && elem.nodeName.toLowerCase() === "input") {
        return elem.defaultValue;
      }
    });
  }

  // Support: IE<9
  // Use getAttributeNode to fetch booleans when getAttribute lies
  if (!assert(function (div) {
      return div.getAttribute("disabled") == null;
    })) {
    addHandle(booleans, function (elem, name, isXML) {
      var val;
      if (!isXML) {
        return elem[name] === true ? name.toLowerCase() :
          (val = elem.getAttributeNode(name)) && val.specified ?
            val.value :
            null;
      }
    });
  }

  // EXPOSE
  if (typeof define === "function" && define.amd) {
    define(function () {
      return Sizzle;
    });
    // Sizzle requires that there be a global window in Common-JS like environments
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = Sizzle;
  } else {
    window.Sizzle = Sizzle;
  }
  // EXPOSE

})(window);

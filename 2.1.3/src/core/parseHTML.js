define([
  "../core",
  "./var/rsingleTag",
  "../manipulation" // buildFragment
], function (jQuery, rsingleTag) {

  /**
   * 解析html
   * @param data string of html
   * @param context (optional): If specified, the fragment will be created in this context, defaults to document
   * @param keepScripts (optional): If true, will include scripts passed in the html string
   * @returns {*} 返回各标签生成的node节点
   */
  jQuery.parseHTML = function (data, context, keepScripts) {
    if (!data || typeof data !== "string") {
      return null;
    }
    if (typeof context === "boolean") {
      keepScripts = context;
      context = false;
    }
    context = context || document;

    //rsingleTag=/^<(\w+)\s*\/?>(?:<\/\1>|)$/，用来匹配形如 <div></div>  <div/>  或者 <div> ，注意正则表达式中，最后一个 | 表示 或者为空，
    //如果去掉| 则不能正确匹配，只能匹配<div></div>
    var parsed = rsingleTag.exec(data),
      scripts = !keepScripts && [];

    // Single tag
    // 如果是单一的标签，则直接调用createElement创建
    if (parsed) {
      return [context.createElement(parsed[1])];
    }

    //利用context.createDocumentFragment()创建nodes节点
    parsed = jQuery.buildFragment([data], context, scripts);

    if (scripts && scripts.length) {
      jQuery(scripts).remove();
    }

    return jQuery.merge([], parsed.childNodes);
  };

  return jQuery.parseHTML;

});

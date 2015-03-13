define([
	"./core",
	"sizzle"
], function( jQuery, Sizzle ) {

jQuery.find = Sizzle;//jQuery 选择器查询引擎
jQuery.expr = Sizzle.selectors;//jQuery 选择器实体对象
jQuery.expr[":"] = jQuery.expr.pseudos;//伪类处理
jQuery.unique = Sizzle.uniqueSort;//元素排序，并删除重复的元素
jQuery.text = Sizzle.getText;//获取元素text内容，包括子孙节点的内容
jQuery.isXMLDoc = Sizzle.isXML;//判断是否为xml文档
jQuery.contains = Sizzle.contains;//两个元素是否为包含关系

});

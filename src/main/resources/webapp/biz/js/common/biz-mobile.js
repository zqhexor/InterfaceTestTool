/**
 * 提供业务的AppMobile插件
 */
define(["require"],function(require) {
	var BizMobile = (function(){
		return{
			openNative:function(data,err){
				execute("openNative", [data], err);
			},invokeIPU:function(pageAction,pageParam,err){
				execute("openIPUFromOtherApp",[pageAction,pageParam],err);
			},openRN:function(pageAction,callback){
				storageCallback("openRN",callback);
				execute("openRN", [pageAction]);
			}
		};
	})();
	
	var WadeMobile;
	function execute(action, args, error, success) {
		/*循环依赖,懒加载*/
		if(!WadeMobile){
			WadeMobile = require("wadeMobile")
		}
        return WadeMobile.execute(action, args, error, success)
	}
	function storageCallback(action,callback,isEscape,isBase64) {
		/*循环依赖,懒加载*/
		if(!WadeMobile){
			WadeMobile = require("wadeMobile")
		}
		WadeMobile.callback.storageCallback(action,callback,isEscape,isBase64)
	}
	
	return BizMobile;
});
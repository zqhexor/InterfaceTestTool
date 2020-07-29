/**
 * 此JS文件匹配mobile_client.js,用于分离出终端调用和web调用的逻辑.
 * 浏览器访问应用时,动态引用mobile_browser.js文件;终端访问应用时,动态引用mobile_client.js文件.
 */
define(["browserTool","jcl"],function(browserTool,Wade) {
	var Mobile = new function() {
		/******************系统功能**********************/
		/*判断是否App*/
		this.isApp = function(){
			return false;
		};
		/*关闭应用 */
		this.closeApp = function() {
			window.opener=null;
			window.open('','_self');
	        window.close();
		};
		/******************数据请求**********************/
		/*调用服务*/
		this.dataRequest = function(action, param, callback, err) {
			browserTool.ajax.post(action, param, callback, err);
		};
		/******************页面跳转**********************/
		/*页面跳转,url为跳转目标*/
		this.openUrl = function(url, callback, title, buttons, styles, err) {
			browserTool.redirect.toUrl(url);
		};
		/*页面跳转,param为打开页面时调用接口的参数*/
		this.openPage = function(pageName, param, err) {
			var url = browserTool.ServerPath;
			url += "?action=" + pageName;
			var params;
			if (param) {
				params = {data:param};
			}
			browserTool.redirect.postPage(url, params);
			/* 
			 * get方式不适用了
			 * var url = browserTool.redirect.buildUrl(pageName,
			 * param.toString()); browserTool.redirect.toUrl(url);
			 */
		};
		this.loadPage = function(pageName, param, err){
			alert('浏览器不实现');
		};

		/*页面跳转,param为打开页面的映射数据*/
		this.openTemplate = function(pageName, param, err) {
			var url = browserTool.ServerPath;
			url += "?action=" + pageName;
			var params = null;
			if (param) {
				params = {data:param,isContext:true};
			}
			browserTool.redirect.postPage(url, params);
		};

		this.loadTemplate = function(pageAction, param, err){
			alert('浏览器不实现');
		};

		/*将模板转换成html源码*/
		this.getTemplate = function(action, param, callback, err) {
			browserTool.ajax.html(action, param, callback, err, null, true);
		};
		/*将Page转换成html源码*/
		this.getPage = function(action, param, callback, err) {
			browserTool.ajax.html(action, param, callback, err);
		};
		/*回退到前一个界面*/
		this.back = function(){
			history.go(-1);
		};
		/*设置back监听事件*/
		this.onBack = function(callback){
			uiPage.onBack(callback);
		};
		/*设置监听回调*/
		this.setBackCallListener = function(callback){
			alert('浏览器不实现');
		}
		/*触发事件的回退，同onBack联合使用*/
		this.backWithCallback = function(result,pageName,err){
			alert('浏览器不实现');
		};
		/******************基础UI**********************/
		/*打开loading对话框*/
		this.loadingStart = function(message,title){
			browserTool.browser.loadingStart(message,title);
		};
		/*关闭加载中对话框*/
		this.loadingStop = function(){
			browserTool.browser.loadingStop();
		};
		this.confirm = function(j, k, h, i){
			browserTool.browser.confirm(j, k, h, i);
		};
		/*弹出提示气泡*/
		this.tip = function(msg,type){
			browserTool.browser.tip(msg,type);
		};
		this.alert = function(msg,title,callback){
			browserTool.browser.alert(msg,title,callback);
		};
		/******************内存缓存**********************/
		this.setMemoryCache = function(key, value){
			browserTool.browser.setMemoryCache(key, value);
		};
		this.getMemoryCache = function(callback,key, value){
			browserTool.browser.getMemoryCache(callback,key, value);
		};
		this.removeMemoryCache = function(key){
			browserTool.browser.removeMemoryCache(key);
		};
		this.clearMemoryCache = function(){
			browserTool.browser.clearMemoryCache();
		};
		/******************离线缓存**********************/
		this.setOfflineCache = function(key, value,isEncrypt){
			browserTool.browser.setOfflineCache(key, value,isEncrypt);
		};
		this.getOfflineCache = function(callback, key, value,isEncrypt){
			browserTool.browser.getOfflineCache(callback, key, value,isEncrypt);
		};
		this.removeOfflineCache = function(key){
			browserTool.browser.removeOfflineCache(key);
		};
		this.clearOfflineCache = function(){
			browserTool.browser.clearOfflineCache();
		};
		/******************扩展UI**********************/
		var windowCallback;//关闭窗口时的回调函数
		var windowFlag = false;//关闭窗口的标识
		/*打开窗口*/
		this.openWindow = function(pageAction, param, callback) {
			if(param){
				param = {data:param} //转换json格式
			}
			var url = browserTool.redirect.buildUrl(pageAction, null, true);
			browserTool.redirect.openPostWindow(pageAction + new Date(), url, param);
			windowCallback = callback;
			windowFlag = true;
		};
		/*关闭窗口*/
		this.closeWindow = function(result) {
			if(typeof(result) != "string"){
				result = result.toString();
			}
			if (windowFlag&&windowCallback) {//windowFlag标识可以防止递归关闭所有窗口
				if(result){//返回值为空不执行回调
					windowCallback(result);
				}
				windowFlag = false;
			} else if(window.opener){
				window.opener.closeWindow(result);
				window.close();
			}
		};
		window.closeWindow = this.closeWindow;//让方法全局化,提供给window.opener调用

		var dialogCallback;//关闭对话框时的回调函数
		window.dialogFlag = false;//用于控制不能多次打开对话框
		/*打开对话框*/
		this.openDialog = function(pageAction, param, callback) {
			if(window.opener&&window.opener.dialogFlag){
				var err = "存在已打开的窗口";
				alert(err);
				throw err;
			}
			if(param){
				param = {data:param} //转换json格式
			}
			var url = browserTool.redirect.buildUrl(pageAction, null, true);
			browserTool.redirect.openPostWindow(pageAction, url, param);
			dialogCallback = callback;
			window.dialogFlag = true;
		};
		/*关闭对话框*/
		this.closeDialog = function(result) {
			if (window.opener) {
				window.opener.closeDialog(result);
				window.close();
			} else if(dialogCallback) {
				window.dialogFlag = false;
				if(result){//返回值为空不执行回调
					dialogCallback(result);
				}
			}
		};
		window.closeDialog = this.closeDialog;//让方法全局化,提供给window.opener调用
		
		/*打开侧滑菜单*/
		this.openSlidingMenu = function(action,param,callback,type){//type:left|right
			alert("浏览器不实现");
		}
		/*关闭侧滑菜单*/
		this.closeSlidingMenu = function(result){
			alert("浏览器不实现");
		}
		/******************本地数据库操作**********************/
		this.execSQL = function(dbName,sql,bindArgs,limit,offset,callback,err){
			alert("浏览器不实现");
		};
		this.insert = function(dbName,table,datas,callback,err){
			alert("浏览器不实现");
		};
		this.delete = function(dbName,table,condSQL,conds,callback,err){
			alert("浏览器不实现");
		};
		this.update = function(dbName,table,datas,condSQL,conds,callback,err){
			alert("浏览器不实现");
		};
		this.select = function(dbName,table,columns,condSQL,conds,limit,offset,callback,err){
			alert("浏览器不实现");
		};
		//查询第一行数据,效率高
		this.selectFirst = function(dbName,table,columns,condSQL,conds,callback,err){
			alert("浏览器不实现");
		};
		this.openNative = function(data,err){
			alert("浏览器不实现");
		}
		// 设置手势锁
		this.setScreenLock = function(dataParam,callback,err) {
			alert("浏览器不实现手势锁功能");
		}
		// 获取手势锁状态
		this.getScreenLockState = function(callback) {
			alert("浏览器不实现获取手势锁状态功能");
		}
		// 解锁
		this.screenUnlock = function(forgetPageAction,callback,err){
			alert("浏览器不实现解锁功能");
		}
		// 打开小键盘
		this.openKeyboard = function(value,err){
			alert("浏览器不实现打开小键盘");
		}
		// 初始化NFC
		this.initNfc = function(data,err){
			alert("浏览器不支持NFC功能");
		}
	}
	
	return Mobile;
});

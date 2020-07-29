/**
 * 此JS文件匹配mobile_browser.js,用于分离出终端调用和web调用的逻辑.
 * 终端访问应用时,动态引用mobile_client.js文件;浏览器访问应用时,动态引用mobile_browser.js文件.
 */
define(["wadeMobile","clientTool"],function(WadeMobile,clientTool) {
	var Mobile = new function() {
		/******************系统功能**********************/
		/*判断是否App*/
		this.isApp = function(){
			return WadeMobile.isApp();
		};
		/*关闭应用*/
		this.closeApp = function() {
			WadeMobile.close(false);
		};
		/******************数据请求**********************/
		/*调用服务*/
		this.dataRequest = function(action, param, callback, err, headers) {
			param = param ? param : "";
			headers = headers ? headers : "";
			WadeMobile.dataRequest(callback, action, param.toString(), null, null, null, err,headers.toString());
		};
		/*调用指定服务端地址服务*/
		this.dataRequestWithHost = function(url, action, param, callback, err, headers) {
			param = param ? param : "";
			headers = headers ? headers : "";
			WadeMobile.dataRequestWithHost(callback, url, action, param.toString(), null, null, null, err,headers.toString());
		};
		/******************页面跳转**********************/
		/*页面跳转,url为跳转目标*/
		this.openUrl = function(url, callback, title, buttons, styles, err) {
			WadeMobile.openUrl(url, callback, title, buttons, styles, err);
		};
		this.loadUrl = function(url, err) {
			WadeMobile.loadUrl(url, err);
		};
		/*页面跳转,param为打开页面时调用接口的参数*/
		this.openPage = function(pageAction, param, err) {
			param = param ? param : "";
			WadeMobile.openPage(pageAction, param.toString(), err);
		};
		this.loadPage = function(pageAction, param, err){
			param = param ? param : "";
			WadeMobile.loadPage(pageAction, param.toString(), err);
		};
		/*页面跳转,param为打开页面的映射数据*/
		this.openTemplate = function(pageAction, param, err) {
			param = param ? param : "";
			WadeMobile.openTemplate(pageAction, param.toString(), err);
		};
		this.loadTemplate = function(pageAction, param, err){
			param = param ? param : "";
			WadeMobile.loadTemplate(pageAction, param.toString(), err);
		};
		/*将模板转换成html源码*/
		this.getTemplate = function(action,param,callback,err){
			param = param ? param : "";
			if(typeof(param) != "string"){
				param = param.toString();
			}
			WadeMobile.getTemplate(callback,action,param,err);
		};
		/*将Page转换成html源码*/
		this.getPage = function(action, param, callback, err){
			param = param ? param : "";
			if(typeof(param) != "string"){
				param = param.toString();
			}
			WadeMobile.getPage(callback,action,param,err);
		};
		/*回退到前一个界面*/
		this.back = function(tag,err){
			WadeMobile.back(tag,err);
		};
		/*设置back监听事件*/
		this.onBack = function(callback){
			this.setBackCallListener(function(e){
				var data = e.data;
				callback(data);
			});
		};
		/**back回调事件监听开始**/
		/*设置back监听回调*/
		this.setBackCallListener = function(callback){
			document.addEventListener("backCall", function(e){
				callback(e.data);
			});
		}
		/**back回调事件监听结束**/
		/*触发事件的回退，同onBack联合使用*/
		this.backWithCallback = function(data,tag,err){
			WadeMobile.backWithCallback(data,tag,err);
		};
		/******************基础UI**********************/
		/*打开loading对话框*/
		this.loadingStart = function(message,title){
			WadeMobile.loadingStart(message,title);
		};
		/*关闭加载中对话框*/
		this.loadingStop = function(){
			WadeMobile.loadingStop();
		};
		/*弹出确认对话框*/
		this.confirm = function(){
			alert("confirm待开发……");
		};
		/*弹出提示气泡*/
		this.tip = function(msg,type){
			if(type==undefined){
				type = 1;
			}
			WadeMobile.tip(msg, type);
		};
		/*弹出提示框*/
		this.alert = function(msg, title, callback) {
			WadeMobile.alert(msg, title, callback);
		};
		/******************内存缓存**********************/
		this.setMemoryCache = function(key, value){
			if (clientTool.tool.isDataMap(key)) {
				WadeMobile.setMemoryCache(key.map);
			} else {
				WadeMobile.setMemoryCache(key, value);
			}
		};
		this.getMemoryCache = function(callback,key,defValue){
			WadeMobile.getMemoryCache(callback,key,defValue);
		};
		this.removeMemoryCache = function(key){
			WadeMobile.removeMemoryCache(key);
		};
		this.clearMemoryCache = function(){
			WadeMobile.clearMemoryCache();
		};
		/******************离线缓存**********************/
		this.setOfflineCache = function(key, value,isEncrypt){
			if (clientTool.tool.isDataMap(key)) {
				WadeMobile.setOfflineCache(key.map, value,isEncrypt);
			} else {
				WadeMobile.setOfflineCache(key, value,isEncrypt);
			}
		};
		this.getOfflineCache = function(callback, key, value,isEncrypt){
			WadeMobile.getOfflineCache(callback, key, value,isEncrypt);
		};
		this.removeOfflineCache = function(key){
			WadeMobile.removeOfflineCache(key);
		};
		this.clearOfflineCache = function(){
			WadeMobile.clearOfflineCache();
		};
		/******************扩展UI**********************/
		this.openDialog = function(pageAction,param,callback,width,height){
			param = param ? param : "";
			width = width ? width : 0.5;//默认0.5
			height = height ? height : 0.5;
			WadeMobile.openDialog(callback,pageAction,param.toString(),width,height);
		};
		this.closeDialog = function(result){
			WadeMobile.closeDialog(result);
		};
		this.openWindow = function(pageAction,param,callback){
			param = param ? param : "";
			WadeMobile.openWindow(callback,pageAction,param.toString());
		};
		this.closeWindow = function(result){
			if(typeof(result) == "undefined" || result == null){
				WadeMobile.closeWindow();
				return;
			}
			if(typeof(result) != "string"){
				result = result.toString();
			}
			WadeMobile.closeWindow(result);
		};
		/*打开侧滑菜单*/
		this.openSlidingMenu = function(action,param,callback,type){//type:left|right
			type = type?type:"left";
			param = param ? param : "";
			if(type=="left"){
				WadeMobile.openSlidingMenu(callback,action,param,0.5,1,0,0);
			}else{
				WadeMobile.openSlidingMenu(callback,action,param,0.5,1,1,0);
			}
		}
		/*关闭侧滑菜单*/
		this.closeSlidingMenu = function(result){
			WadeMobile.closeSlidingMenu(result);
		}
		/******************本地数据库操作**********************/
		this.execSQL = function(dbName,sql,bindArgs,limit,offset,callback,err){
			WadeMobile.execSQL(dbName,sql,bindArgs,limit,offset,callback,err);
		};
		this.insert = function(dbName,table,datas,callback,err){
			WadeMobile.insert(dbName,table,datas,callback,err);
		};
		this.delete = function(dbName,table,condSQL,conds,callback,err){
			WadeMobile.delete(dbName,table,condSQL,conds,callback,err);
		};
		this.update = function(dbName,table,datas,condSQL,conds,callback,err){
			WadeMobile.update(dbName,table,datas,condSQL,conds,callback,err);
		};
		this.select = function(dbName,table,columns,condSQL,conds,limit,offset,callback,err){
			WadeMobile.select(dbName,table,columns,condSQL,conds,limit,offset,callback,err);
		};
		//查询第一行数据,效率高
		this.selectFirst = function(dbName,table,columns,condSQL,conds,callback,err){
			WadeMobile.selectFirst(dbName,table,columns,condSQL,conds,callback,err);
		};
		// 设置手势锁
		this.setScreenLock = function(dataParam,callback,err) {
			WadeMobile.setScreenLock(dataParam.toString(),callback,err);
		}
		// 获取手势锁状态
		this.getScreenLockState = function(callback) {
			WadeMobile.getScreenLockState(callback);
		}
		// 解锁
		this.screenUnlock = function(forgetPageAction,callback,err){
			WadeMobile.screenUnlock(forgetPageAction,callback,err);
		}
		// 打开小键盘
		this.openKeyboard = function(value,err){
			WadeMobile.openKeyboard(value,err);
		}
		this.openNative = function(data,err){
			WadeMobile.openNative(data.toString(),err);
		}
		// 初始化NFC
		this.initNfc = function(data,err){
			WadeMobile.initNfc(data.toString(),err);
		}
		
	};
	
	return Mobile;
});


/**
 * 与客户端交互的基础API
 */
define(["jcl", "mobileExpand","bizMobileExpand"],function(Wade, mobileExpand, bizMobileExpand) {
	//终端类型,a为android,i为ios
	var deviceType = (function(){
		/*
		IpuMobile/i1/android/00/2.0/Hybrid
        userAgent格式
        i1版本规范:
        标识符/规范版本号/终端类型(ios,android,wp)/终端型号(平板，或尺寸,00表示默认)/框架版本号/结尾标识符
        */
		var sUserAgent = window.navigator.userAgent;
		//          标识符     规范1  类型2 型号3  框架4 结尾标识符
		var re = /IpuMobile\/(.*)\/(.*)\/(.*)\/(.*)\/Hybrid/ig
		var arrMessages = re.exec(sUserAgent);
		if(arrMessages && arrMessages[1] =="i1" ){
			if(arrMessages[2] == "android"){
				return "a";
			}else if(arrMessages[2] == "ios"){
				return "i"
			}else if(arrMessages[2] == "wp"){
				return "w";
			}else{
				return null;
			}
		}else{
			return null;
		}
	})();
	if(!window["TerminalType"]){
		window["TerminalType"] = deviceType;
	}
	var terminalType = window["TerminalType"];
	WadeMobile = (function(){
        return{
        	isAndroid:function(){
        		return terminalType=='a';
        	},isIOS:function(){
        		return terminalType=='i';
        	},isWP:function(){
        		return terminalType=='w';
        	},isApp:function(){//判断是否是APP应用
				return !!terminalType;
        	},getSysInfo:function(callback,key,err){//TELNUMBER|IMEI|IMSI|SDKVERSION|OSVERSION|PLATFORM|SIMNUMBER
				WadeMobile.callback.storageCallback("getSysInfo",callback);
				execute("getSysInfo", [key],err);
			},close:function(confirm,err){
				if(typeof(confirm)!="boolean"){
					confirm = true;
				}
				execute("close", [confirm],err);
			},httpRequest:function(callback,requestUrl,encode,conTimeout,readTimeout,err){
				if(terminalType=="i"){
					requestUrl = encodeURIComponent(requestUrl);
				}
				WadeMobile.callback.storageCallback("httpRequest",callback);
				execute("httpRequest", [requestUrl,encode,conTimeout,readTimeout],err);
			},dataRequest:function(callback,dataAction,param,encode,conTimeout,readTimeout,err,headers){
				WadeMobile.callback.storageCallback("dataRequest",callback);
				execute("dataRequest", [dataAction,param,encode,conTimeout,readTimeout,headers],err);
			},dataRequestWithHost:function(callback,url,dataAction,param,encode,conTimeout,readTimeout,err,headers){
				WadeMobile.callback.storageCallback("dataRequestWithHost",callback);
				execute("dataRequestWithHost", [url,dataAction,param,encode,conTimeout,readTimeout,headers],err);
			},openUrl:function(url, callback, title, buttons, styles, err){
				WadeMobile.callback.storageCallback("openUrl", callback);
				execute("openUrl", [encodeURIComponent(url), title, buttons, styles],err);
			},openPage:function(action,data,err){
				execute("openPage", [action,data],err);
			},openTemplate:function(action,context,err){
				execute("openTemplate", [action,context],err);
			},loadPage:function(action,data,err){
				execute("loadPage", [action,data],err);
			},loadTemplate:function(action,context,err){
				execute("loadTemplate", [action,context],err);
			},back:function(tag,err){
				execute("back",[tag],err);
			},backWithCallback:function(data,tag,err){
				execute("backWithCallback",[data,tag],err);
			},getPage:function(callback,action,param,err){
				WadeMobile.callback.storageCallback("getPage",callback);
				execute("getPage", [action,param],err);
			},getTemplate:function(callback,action,context,err){
				WadeMobile.callback.storageCallback("getTemplate",callback);
				execute("getTemplate", [action,context],err);
			},storageDataByThread:function(dataAction,param,waitoutTime,err){
				execute("storageDataByThread", [dataAction,param,waitoutTime],err);
			},openDialog:function(callback,pageAction,param,width,height,err){
				WadeMobile.callback.storageCallback("openDialog",callback);
				execute("openDialog", [pageAction,param,width,height],err);
			},closeDialog:function(result,state,err){
				execute("closeDialog", [result,state],err);
			},openWindow:function(callback,pageAction,param,err){
				WadeMobile.callback.storageCallback("openWindow",callback);
				execute("openWindow", [pageAction,param],err);
			},closeWindow:function(result,state,err){
				execute("closeWindow", [result,state],err);
			},openSlidingMenu:function(callback,action,param,width,height,leftMargin,topMargin,err){
				WadeMobile.callback.storageCallback("openSlidingMenu",callback);
				execute("openSlidingMenu", [action,param,width,height,leftMargin,topMargin],err);
			},closeSlidingMenu:function(result,state,err){
				execute("closeSlidingMenu", [result,state],err);
			}
		};
	})();
	//自定义的按钮点击事件
		WadeMobile.customEvents =(function()
		{
			return {
				cancelEvent:function(){
	        		var param = Wade.DataMap();
					param.put("title","取消成功！");
					param.put("content","已经取消了！");
					param.put("alertType",1);
					param.put("cancelable",true);
					param.put("imageID",0);
					WadeMobile.sweetAlert(param);
	        	},confirmEvent:function(){
					var param = Wade.DataMap();
	        		param.put("title","确认成功！");
					param.put("content","成功完成了任务！");
					param.put("alertType",2);
					param.put("cancelable",true);
					param.put("imageID",0);
					WadeMobile.sweetAlert(param);
				},nextEvent:function(){
					var param = Wade.DataMap();
	        		param.put("title","加载成功！");
					param.put("content","");
					param.put("alertType",2);
					param.put("cancelable",true);
					param.put("imageID",0);
					WadeMobile.sweetAlert(param);
				}
			};
		})();
	//全局变量
	var callbackId = 0;
	var callbacks = {};//用来存放成功和失败的js回调函数
	var callbackDefine = {};//用来存放自定义的js回调函数
	var globalErrorKey = null;//全局错误关键字,定位错误
	
	/*绝大多数情况下,success回调函数是用不上的,有需要回调函数的时候异步方式传入取值*/
	var isAlert = true;//防止反复弹出alert
	var execute = function(action, args, error, success){
        args = stringify(args);
		if(terminalType=="a"){
			androidExecute(action, args, error, success);
		}else if(terminalType=="i"){
			iosExecute(action, args, error, success);
		}else if(terminalType=="w"){
			winphoneExecute(action, args, error, success);
		}else{
			if(isAlert){
				isAlert = false
				alert(action+"无终端类型");
			}else{
				console.log(action+"无终端类型");
			}
		}
	};
	
	WadeMobile.execute = execute;
	
	var androidExecute = function(action, args, error, success){
		//执行android方法时，带入到android底层的key值为，回调方法实际的key值 + 用于在top上索引本iframe的WadeMobile的唯一标识。
		//在android底层，如果发现回调函数的key值包含这个特殊的串。那么将解析这个key。并且取出加回调函数key的后半部分，作为在top上索引本iframe相对应的WadeMobile对象的唯一依据。
		var tmpKey = action+callbackId++;
		if(window._WadeMobileSet_Key_ != undefined){
			tmpKey += window._WadeMobileSet_Key_;
		}
        var callbackKey = globalErrorKey = tmpKey;
        if (success || error) {
    		callbacks[callbackKey] = {success:success, error:error};
        }
        if(WadeMobile.debug){
        	//alert("准备调用"+action+" 参数:"+args);
        	console.log("action:"+action+" param:"+args);
        }
        PluginManager.exec(action, callbackKey, args);
        globalErrorKey = null;
	};
 
    var iosExecute = function(action, args, error, success){
        var callbackKey = globalErrorKey = action+callbackId++;
        if (success || error) {
            callbacks[callbackKey] = {success:success, error:error};
        }
        if(WadeMobile.debug){
            //alert("准备调用"+action+" 参数:"+args);
            console.log("action:"+action+" param:"+args);
        }

        var WADE_SCHEME = "wade://";
        var url = WADE_SCHEME+action+"?param="+encodeURIComponent(args)+"&callback="+callbackKey;
        //一个动作请求客户端的最大数量，超过会造成请求覆盖
        var limitAction = 10;
        var ifrmName = "WADE_FRAME_"+(callbackId%limitAction);
        var ifrm = document.getElementById(ifrmName);
        if(!ifrm){
            var ifrm = document.createElement("iframe");
            ifrm.setAttribute("id",ifrmName);
            ifrm.setAttribute("width","0");
            ifrm.setAttribute("height","0");
            ifrm.setAttribute("border","0");
            ifrm.setAttribute("frameBorder","0");
            ifrm.setAttribute("name",ifrmName);
            document.body.appendChild(ifrm);
        }
        document.getElementById(ifrmName).contentWindow.location = encodeURIComponent(url);
        //document.getElementById(ifrmName).src = encodeURI(url);//无法处理&符号
        globalErrorKey = null;
	};
	
	var winphoneExecute = function(action, args, error, success){
        var callbackKey = globalErrorKey = action+callbackId++;
        if (success || error) {
    		callbacks[callbackKey] = {success:success, error:error};
        }
        if(WadeMobile.debug){
        	//alert("准备调用"+action+" 参数:"+args);
        	console.log("action:"+action+" param:"+args);
        }
      	window.external.Notify(stringify([action, callbackKey, args])); //[action, callbackKey, args]
      	globalErrorKey = null;
	};
	
	WadeMobile.callback = (function(){
		return{
			success:function(callbackKey, message) {
				if(typeof message == "undefined"){
					return;
				}
			    if (callbacks[callbackKey]) {
	                if (callbacks[callbackKey].success) {
	                	if(typeof callbacks[callbackKey].success==="function"){
	                		var func = callbacks[callbackKey].success;
	                		func(message);
	                	}else{
	                		_eval(callbacks[callbackKey].success+"('"+message+"','"+callbackKey+"')");
	                	}
	                }
	                if (callbacks[callbackKey]) {
	                	delete callbacks[callbackKey];
	                }
			    }
			},error:function(callbackKey, message, isEncode) {
				if(typeof message == "undefined"){
					return;
				}
        		if(isEncode){
        			message = decodeURIComponent(message);
        		}
			    if (callbacks[callbackKey]) {
		            if (callbacks[callbackKey].error) {
		                if(typeof callbacks[callbackKey].error==="function"){
		                	var func = callbacks[callbackKey].error;
		                	func(message);
	                	}else{
	                		_eval(callbacks[callbackKey].error+"('"+message+"','"+callbackKey+"')");
	                	}
		            }
			        if (callbacks[callbackKey]) {
			            delete callbacks[callbackKey];
			        }
			    }else{
			    	alert(message);
			    }
			},storageCallback:function(action,callback){
				var callbackKey = action+callbackId;
				if (callback) {
		            callbackDefine[callbackKey] = {callback:callback};
		        }
			},execCallback:function(callbackKey, data){
				globalErrorKey = callbackKey;
				var callbackItem = callbackDefine[callbackKey];
				if (callbackItem) {
					data = data=="null"?null:data;
					if(data){
						if(WadeMobile.isIOS()){
							/*IOS需要decode*/
							data = decodeURIComponent(data);
						}
					}
		            if (callbackItem.callback) {
		                if(typeof callbackItem.callback==="function"){
		                	var func = callbackItem.callback;
		                	func(data);
	                	}else{
	                		_eval(callbackItem.callback+"('"+data+"','"+callbackKey+"')");
	                	}
		            }
		           
		            if (callbackItem) {
			            delete callbackDefine[callbackKey];
		            }
			        
			    }
				globalErrorKey = null;
			}
		};
	})();
	
	/**物理按键监听start**/
	WadeMobile.setKeyListener = function(key, callback){
		if(key=="back"){
			document.addEventListener("back", callback, false);
		}else if(key=="menu"){
			document.addEventListener("menu", callback, false);
		}else if(key=="home"){
			document.addEventListener("home", callback, false);
		}
	}
	
	WadeMobile.event = (function(){
		if(WadeMobile.isApp()){
			// Create the event.
			var backEvent = document.createEvent('Event');
			var menuEvent = document.createEvent('Event');
			var homeEvent = document.createEvent('Event');
			return {
				back:function(){
					backEvent.initEvent("back", true, true);
					document.dispatchEvent(backEvent);
				},menu:function(){
					menuEvent.initEvent("menu", true, true);
				    document.dispatchEvent(menuEvent);
				},home:function(){
					homeEvent.initEvent("home", true, true);
				    document.dispatchEvent(homeEvent);
				}
			};
		}
	})();
	/**物理按键监听end**/
	
	WadeMobile.backevent = (function(){
		if(WadeMobile.isApp()){
			return {
				backCall:function(data){
					var backCallEvent = document.createEvent('Event');
					backCallEvent.initEvent("backCall",true,true);
					backCallEvent.data = data;
					document.dispatchEvent(backCallEvent);
				}
			};
		}
	})();
	
	/* 通用插件事件触发函数,建议name ipu开头,如 ipuPush，不要出现字母外特殊字符 */
	WadeMobile.triggerEvent = function(name, data){
		var event = document.createEvent('Event');
		event.initEvent(name, true, true);
		event.data = data;
		document.dispatchEvent(event);
	}
	
	/* 通用监听插件事件函数 */
	WadeMobile.listenerEvent = function(name, callBack){
		document.addEventListener(name, function(e){
			callBack(e.data, e);
		}, false);
	}
	
	
	/************公共方法**************/
	/**
	 * @param {String}  errorMessage   错误信息
	 * @param {String}  scriptURI      错误文件
	 * @param {Long}    lineNumber     错误行号
	 */
	window.onerror = function(errorMessage, scriptURI, lineNumber) {
		var msgArray = new Array();
		if (errorMessage)
			msgArray.push("错误信息:" + errorMessage);
		if (lineNumber)
			msgArray.push("错误行号:" + lineNumber);
		if (globalErrorKey)
			msgArray.push("错误关键字:" + globalErrorKey);
		if (scriptURI)
			msgArray.push("错误文件:" + scriptURI);
		var msg = msgArray.join("\t\n");
		console.log(msg);
		alert(msg);
	};
    /**
     * 重写alert方法，解决在iOS7以上不可点击问题
     * @param name
     */
	/**/
    window.alert = function(name){
    	
        var iframe = document.createElement("IFRAME");
        iframe.style.display="none";
        iframe.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(iframe);
        window.frames[window.frames.length-1].window.alert(name);
        iframe.parentNode.removeChild(iframe);
    }
	
	//动态执行js方法
	function _eval(code,action){
		if(WadeMobile.debug){
			alert(code);
		}
		var func = eval(code);
		if(typeof func==="function"){
			func();
		}
	}
	//格式转换方法
	function stringify(args) {
	    if (typeof JSON == "undefined") {
	        var s = "[";
	        for (var i=0; i<args.length; i++) {
	            if (i > 0) {
	                s = s + ",";
	            }
	            var type = typeof args[i];
	            if ((type == "number") || (type == "boolean")) {
	                s = s + args[i];
	            }
	            else if (args[i] instanceof Array) {
	            	s = s + "[" + args[i] + "]";
	            }
	            else if (args[i] instanceof Object) {
	            	var start = true;
	            	s = s + '{';
	            	for (var name in args[i]) {
	            		if (args[i][name] != null) {
		            		if (!start) {
		            			s = s + ',';
		            		}
		            		s = s + '"' + name + '":';
		            		var nameType = typeof args[i][name];
		            		if ((nameType == "number") || (nameType == "boolean")) {
		            			s = s + args[i][name];
		            		}
		            		else if ((typeof args[i][name]) == 'function') {
			           			// don't copy the functions
		            			s = s + '""'; 
		            		}
		            		else if (args[i][name] instanceof Object) {
		            			s = s + stringify(args[i][name]);
		            		}
		            		else {
		                        s = s + '"' + args[i][name] + '"';            			
		            		}
		                    start=false;
		                 }
	            	} 
	            	s = s + '}';
	            }else {
	                var a = args[i].replace(/\\/g, '\\\\');
	                a = a.replace(/"/g, '\\"');
	                s = s + '"' + a + '"';
	            }
	        }
	        s = s + "]";
	        return s;
	    }else {
	        return JSON.stringify(args);
	    }
	};
	

	Wade.extend(WadeMobile, mobileExpand);//属性合并,mobileExpand累加到WadeMobile中
	Wade.extend(WadeMobile, bizMobileExpand);//属性合并,bizMobileExpand累加到WadeMobile中
	return WadeMobile;
});

//让top对象上，保持有一个当前iframe里面的WadeMobile对象的引用。
//注意：在iframe中，_WadeMobileSet_Key_+时间戳表示一个key，此key作为了在top对象上索引iframe中的WadeMobile的依据。
//将保持引用的key值存入到当前ifame的window对象上。
(function(){
	//屏蔽所有浏览器
	if( window.navigator.userAgent.indexOf("IpuMobile\/") == -1 ) {
		console.log("<WadeMobileSet> \"IpuMobile\/\" string does not exist in the userAgent. return.");
		return;
	}
	
	if(top != window){
		if(top.WadeMobileSet == undefined){
			top.WadeMobileSet = {};
		}
		for(var key in top.WadeMobileSet){
			try{
				if( key.indexOf("_WadeMobileSet_Key_") != -1 && ( !top.WadeMobileSet[key] || ( top.WadeMobileSet[key].canRemoved && top.WadeMobileSet[key].canRemoved() ) ) ){
					console.log("(top set)delete:" + key);
					delete top.WadeMobileSet[key];
					console.log("(top set)delete success :" + key);
				}
			}catch(e){
				console.log("a error(WadeMobile) : " + e);
				console.log("(top set)delete:" + key);
				delete top.WadeMobileSet[key];
				console.log("(top set)delete success :" + key);
			}
		}
		var key = "_WadeMobileSet_Key_" + new Date().getTime();
		window._WadeMobileSet_Key_ = key;
		console.log("in an iframe, window.WadeMobile object is referenced top.WadeMobileSet." + key);
		top.WadeMobileSet[key] = window.WadeMobile;
		window.WadeMobile.canRemoved = function(){
			return !window;
		};
	}
})();
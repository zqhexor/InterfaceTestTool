/**
 * 将一些公共的业务处理放入此对象中
 */
define(["jcl", "mobile", "clientTool"], function (Wade, Mobile, ClientTool) {
    var Common = new function () {
        /*调用服务*/
        this.callSvc = function (action, param, callback, isEscape, error) {
            param = param ? param : new Wade.DataMap();
            error = error ? error : function (x_info, x_code) {
                Mobile.loadingStop();
                if (x_code) {
                    alert("错误编码:[" + x_code + "]\n错误信息:" + x_info);
                } else {
                    alert("错误信息:" + x_info);
                }
                if (x_code == -100) {
                    Mobile.openPage("Login");
                }
            };

            Common.get(function (data) {
                if (typeof data == "string") {
                    data = new Wade.DataMap(data);
                }
                if (data.get(Constant.SESSION_ID)) {
                    param.put(Constant.SESSION_ID, data.get(Constant.SESSION_ID));
                }
                if (data.get(Constant.STAFF_ID)) {
                    param.put(Constant.STAFF_ID, data.get(Constant.STAFF_ID));
                }
                callSvc(action, param, callback, isEscape, error);
            }, [Constant.SESSION_ID, Constant.STAFF_ID]);

            function callSvc(_action, _param, _callback, _isEscape, _error) {
                Mobile.dataRequest(_action, _param, function (resultData) {
                    if (typeof (resultData) == "string") {
                        resultData = new Wade.DataMap(resultData);
                    }
                    var x_resultcode = resultData.get(Constant.X_RESULTCODE);
                    var x_resultinfo = resultData.get(Constant.X_RESULTINFO);
                    if (x_resultcode < 0) {
                        _error(x_resultinfo, x_resultcode);//接口异常则回调报错函数
                    } else {
                        _callback(resultData);
                    }
                }, _error);
            }
        };

        this.openPage = function (action, param, error) {
            param = param ? param : new Wade.DataMap();
            error = error ? error : function (x_info, x_code) {
                Mobile.loadingStop();
                if (x_code) {
                    alert("错误编码:[" + x_code + "]\n错误信息:" + x_info);
                } else {
                    alert("错误信息:" + x_info);
                }
                if (x_code == -100) {
                    Mobile.openPage("Login");
                }
            };

            Common.get(function (data) {
                if (typeof data == "string") {
                    data = new Wade.DataMap(data);
                }
                if (data.get(Constant.SESSION_ID)) {
                    param.put(Constant.SESSION_ID, data.get(Constant.SESSION_ID));
                }
                if (data.get(Constant.STAFF_ID)) {
                    param.put(Constant.STAFF_ID, data.get(Constant.STAFF_ID));
                }
                openPage(action, param, error);
            }, [Constant.SESSION_ID, Constant.STAFF_ID]);

            function openPage(_action, _param, _error) {
                Mobile.openPage(_action, _param, function (errMsg) {
                    if (typeof (errMsg) == "string") {
                        errMsg = new Wade.DataMap(errMsg);
                    }
                    var x_resultcode = errMsg.get("X_RESULTCODE");
                    var x_resultinfo = errMsg.get("X_RESULTINFO");
                    _error(x_resultinfo, x_resultcode);
                });
            }
        };

        this.getPage = function (action, param, callback, error) {
            param = param ? param : new Wade.DataMap();
            error = error ? error : function (x_info, x_code) {
                Mobile.loadingStop();
                if (x_code) {
                    alert("错误编码:[" + x_code + "]\n错误信息:" + x_info);
                } else {
                    alert("错误信息:" + x_info);
                }
                if (x_code == -100) {
                    Mobile.openPage("Index");
                }
            };
            Common.get(function (data) {
                if (typeof data == "string") {
                    data = new Wade.DataMap(data);
                }
                if (data.get(Constant.SESSION_ID)) {
                    param.put(Constant.SESSION_ID, data.get(Constant.SESSION_ID));
                }
                if (data.get(Constant.STAFF_ID)) {
                    param.put(Constant.STAFF_ID, data.get(Constant.STAFF_ID));
                }
                getPage(action, param, callback, error);
            }, [Constant.SESSION_ID, Constant.STAFF_ID]);

            function getPage(_action, _param, _callback, _error) {
                Mobile.getPage(_action, _param, _callback, function (errMsg) {
                    if (typeof (errMsg) == "string") {
                        errMsg = new Wade.DataMap(errMsg);
                    }
                    var x_resultcode = errMsg.get("X_RESULTCODE");
                    var x_resultinfo = errMsg.get("X_RESULTINFO");
                    _error(x_resultinfo, x_resultcode);
                });
            }
        };

        this.closeApp = function () {
            if (confirm("确定要退出应用程序吗?")) {
                Mobile.closeApp();
            }
        };

        this.logoutAccount = function () {
            if (confirm("确定要注销该工号吗?")) {
                Common.remove(Constant.SESSION_ID);
                WadeMobile.clearBackStack();
                Mobile.openTemplate("Home");
            }
        };

        this.put = function (key, value) {
            if (!checkMapKey(key)) {
                return;
            }
            Mobile.setMemoryCache(key, value);
        };
        this.get = function (callback, key, value) {
            if (!checkArrayKey(key)) {
                return;
            }
            Mobile.getMemoryCache(callback, key, value);
        };
        this.remove = function (key) {
            if (!checkArrayKey(key)) {
                return;
            }
            Mobile.removeMemoryCache(key);
        };
        this.clear = function () {
            Mobile.clearMemoryCache();
        };
        this.putLocal = function (key, value) {
            if (!checkMapKey(key)) {
                return;
            }
            Mobile.setOfflineCache(key, value);
        };
        this.getLocal = function (callback, key, value) {
            if (!checkArrayKey(key)) {
                return;
            }
            Mobile.getOfflineCache(callback, key, value);
        };
        this.removeLocal = function (key) {
            if (!checkArrayKey(key)) {
                return;
            }
            Mobile.removeOfflineCache(key);
        };
        this.clearLocal = function () {
            Mobile.clearOfflineCache();
        };
        /*数据库操作*/
        var dbName = "display";
        this.execSQL = function (sql, bindArgs, callback, err) {
            Mobile.execSQL(dbName, sql, bindArgs, callback, err);
        };

        function checkMapKey(key) {
            if (!key || (typeof (key) != "string" && !ClientTool.tool.isDataMap(key))) {
                alert(key + "参数类型异常");
                return false;
            } else {
                return true;
            }
        }

        function checkArrayKey(key) {
            if (!key || (typeof (key) != "string" && !ClientTool.tool.isArray(key))) {
                alert(key + "参数类型异常");
                return false;
            } else {
                return true;
            }
        }
    }

    window.Constant = {
        OPEN_PAGE_KEY: "OPEN_PAGE_KEY",
        STAFF_ID: "STAFF_ID",
        SESSION_ID: "SESSION_ID",
        X_RECORDNUM: "X_RECORDNUM",
        X_RESULTCODE: "X_RESULTCODE",
        X_RESULTINFO: "X_RESULTINFO",
        X_RESULTCAUSE: "X_RESULTCAUSE",
        RETURN_CODE_SUCCESS: "1",
        RETURN_CODE_ERROR: "0",
        RETURN_CODE_KEY: "returnCode",
        RETURN_MSG_KEY: "returnMsg",
        LAST_PASSWORD: "lastPassword"
    }

    return Common;
});
/**
 * 用户管理类
 * currentUserAccount:当前登录用户名 字符串
 * userAccountList：本地存储所有登录用户的列表 DatasetList字符串形式 例如：userAccountList:[{userData},{userData}]
 * userData：DataMap字符串形式
 */
define(["common", "mobile", "wadeMobile", "jcl"], function (Common, Mobile, WadeMobile, Wade) {

  var userManager = {};

  // 本地缓存的key值定义
  userManager.currentUserAccount = "currentUserAccount";//当前登录的用户名
  userManager.userAccountList = "userAccountList";//当前登录多个用户的列表对应的key值

  userManager.userAccount = "userAccount";//用户名
  userManager.passwd = "password";//密码
  userManager.gesturePasswd = "gesturePasswd";//手势锁密码
  userManager.usingGesturePasswd = "usingGesturePasswd"; //是否启用手势锁
  userManager.hasRememberPasswd = "hasRememberPasswd";//是否记住密码。true：记住密码；false：不记录密码
  userManager.hasRememberPasswd_true = "true";
  userManager.hasRememberPasswd_false = "false";

  userManager.currentUserData = null;// 当前登录用户对象，全局变量
  userManager.currentUserGestureValue = null;// 当前登录用户手势锁值，全局变量

  // 获取当前登录的用户对象
  userManager.getCurrentUserData = function (callback) {
    Common.getLocal(function (data) {
      data = typeof (data) == "string" ? Wade.DataMap(data) : data;
      var currentUserAccount = null;
      if (data.get(userManager.currentUserAccount)) {
        currentUserAccount = data.get(userManager.currentUserAccount);
      }
      if (data.get(userManager.userAccountList)) {
        var userAccountList = data.get(userManager.userAccountList);
        userAccountList = typeof (userAccountList) == "string" ? Wade.DatasetList(userAccountList) : userAccountList;
        if (userAccountList.length > 0) {
          var obj;
          for (var i = 0; i < userAccountList.length; i++) {
            obj = userAccountList.get(i);
            obj = typeof (obj) == "string" ? Wade.DataMap(obj) : obj;
            var userAccount = obj.get(userManager.userAccount);
            if (userAccount == currentUserAccount) {
              console.log("获取到已有登录对象：" + obj.toString());
              userManager.currentUserData = obj;
              return callback(obj);
            }
          }
        }
      }
      console.log("未获取到已登录对象");
      return callback(null);
    }, [userManager.currentUserAccount, userManager.userAccountList]);
  };

  // 向本地添加用户数据
  userManager.addUserData = function (userData) {
    Common.getLocal(function (data) {
      var _currentUserAccount = userData.get(userManager.userAccount);
      var _hasRememberPasswd = userData.get(userManager.hasRememberPasswd);
      data = typeof (data) == "string" ? Wade.DataMap(data) : data;
      var has_update_data = false;//true：更新数据；false：新增数据；
      var _userAccountList = Wade.DatasetList();
      if (data.get(userManager.userAccountList)) {
        _userAccountList = data.get(userManager.userAccountList);
        _userAccountList = typeof (_userAccountList) == "string" ? Wade.DatasetList(_userAccountList) : _userAccountList;
        //更新数据
        if (_userAccountList.length > 0) {
          var obj;//循环对象
          for (var i = 0; i < _userAccountList.length; i++) {
            obj = _userAccountList.get(i);
            obj = typeof (obj) == "string" ? Wade.DataMap(obj) : obj;
            var userAccount = obj.get(userManager.userAccount);
            if (_currentUserAccount == userAccount) {
              has_update_data = true;
              //该用户数据已存在，更新数据
              obj.put(userManager.userAccount, userData.get(userManager.userAccount));
              obj.put(userManager.hasRememberPasswd, _hasRememberPasswd);
              if (_hasRememberPasswd == userManager.hasRememberPasswd_true) {
                //记录密码
                obj.put(userManager.passwd, userData.get(userManager.passwd));
              } else if (_hasRememberPasswd == userManager.hasRememberPasswd_false) {
                //不记录密码
                obj.removeKey(userManager.passwd);
              }
              console.log("更新用户对象：" + obj.toString());
              break;
            }
          }
        }
      }
      //新插入用户数据
      if (!has_update_data) {
        var obj = Wade.DataMap();
        obj.put(userManager.hasRememberPasswd, userData.get(userManager.hasRememberPasswd));
        obj.put(userManager.userAccount, _currentUserAccount);
        if (_hasRememberPasswd == userManager.hasRememberPasswd_true) {
          //记录密码
          obj.put(userManager.passwd, userData.get(userManager.passwd));
        } else if (_hasRememberPasswd == userManager.hasRememberPasswd_false) {
          //不记录密码
        }
        console.log("新增用户对象：" + obj.toString());
        _userAccountList.add(obj);
      }

      // 重新放置本地缓存数据
      Common.putLocal(userManager.userAccountList, _userAccountList.toString());
      // 强制更新当前登录用户值
      Common.putLocal(userManager.currentUserAccount, _currentUserAccount);
    }, [userManager.userAccountList]);
  };

  //启用手势锁管理
  userManager.addCurrentUsingGesturePasswd = function (usingGesturePasswd) {
    if(usingGesturePasswd){
      usingGesturePasswd = true;
    }else {

    }
    // Common.putLocal(userManager.usingGesturePasswd, usingGesturePasswd);
    Common.getLocal(function(data) {
      data = typeof(data)=="string"?Wade.DataMap(data):data;
      var currentUserAccount = null;
      if(data.get(userManager.currentUserAccount)){
        currentUserAccount = data.get(userManager.currentUserAccount);
      }
      if(data.get(userManager.userAccountList)){
        var userAccountList = data.get(userManager.userAccountList);
        userAccountList = typeof(userAccountList)=="string"?Wade.DatasetList(userAccountList):userAccountList;
        if(userAccountList.length>0){
          var obj;
          for(var i=0;i<userAccountList.length;i++){
            obj = userAccountList.get(i);
            obj = typeof(obj)=="string"?Wade.DataMap(obj):obj;
            var userAccount = obj.get(userManager.userAccount);
            if(userAccount == currentUserAccount){
              obj.put(userManager.usingGesturePasswd, usingGesturePasswd);
              if(usingGesturePasswd){
                // 开启手势密码
              }else{
                // 关闭手势密码，移除原有密码
                if(userManager.gesturePasswd){
                  obj.removeKey(userManager.gesturePasswd);
                }
              }
              break;
            }
          }
        }
        // 重新放置本地缓存数据
        Common.putLocal(userManager.userAccountList, userAccountList.toString());
      }
    }, [userManager.currentUserAccount,userManager.userAccountList]);
  }

  // 获取当前手势锁值
  userManager.getCurrentUserGestureValue = function(callback){
    if(userManager.currentUserGestureValue != null){
      return callback(userManager.currentUserGestureValue);
    }
    if(userManager.currentUserData != null){
      return callback(userManager.currentUserData.get(userManager.gesturePasswd));
    }
    userManager.getCurrentUserData(function(userData){
      if(userData==null){
        return callback(null);
      }
      return callback(userData.get(userManager.gesturePasswd));
    });
  };

  userManager.addCurrentUserGestureValue = function(value){
    Common.getLocal(function(data) {
      data = typeof(data)=="string"?Wade.DataMap(data):data;
      var currentUserAccount = null;
      if(data.get(userManager.currentUserAccount)){
        currentUserAccount = data.get(userManager.currentUserAccount);
      }
      if(data.get(userManager.userAccountList)){
        var userAccountList = data.get(userManager.userAccountList);
        userAccountList = typeof(userAccountList)=="string"?Wade.DatasetList(userAccountList):userAccountList;
        if(userAccountList.length>0){
          var obj;
          for(var i=0;i<userAccountList.length;i++){
            obj = userAccountList.get(i);
            obj = typeof(obj)=="string"?Wade.DataMap(obj):obj;
            var userAccount = obj.get(userManager.userAccount);
            if(userAccount == currentUserAccount){
              var lastGesturePasswd = obj.get(userManager.gesturePasswd);
              if(lastGesturePasswd){
                console.log("更新手势锁密码，旧密码是："+lastGesturePasswd+",新手势锁密码是："+value);
              }else{
                console.log("新增手势锁密码："+value);
              }
              obj.put(userManager.gesturePasswd, value);
            }
          }
        }
        // 重新放置本地缓存数据
        Common.putLocal(userManager.userAccountList, userAccountList.toString());
      }
    }, [userManager.currentUserAccount,userManager.userAccountList]);
  };

  return userManager;
});
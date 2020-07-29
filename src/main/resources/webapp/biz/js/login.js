require(['jquery', 'ipuUI', 'mobile', 'wadeMobile', 'jcl', 'common', 'userManager', 'vali'], function ($, ipuUI, Mobile, WadeMobile, Wade, Common, userManager, Vali) {
  $(function () {

    // 初始化登录页面
    showCurrentUserData();

    //记住密码
    $(".remember-pwd").click(function () {
      if ($(".remember-pwd").find(".app-icon").hasClass("icon-checkbox-blank-circle-outline")) {
        $(".remember-pwd").find(".app-icon").removeClass("icon-checkbox-blank-circle-outline");
        $(".remember-pwd").find(".app-icon").addClass("icon-checkbox-marked-circle");
      } else {
        $(".remember-pwd").find(".app-icon").addClass("icon-checkbox-blank-circle-outline");
        $(".remember-pwd").find(".app-icon").removeClass("icon-checkbox-marked-circle");
      }
    });

    // 获取焦点，变更底边框颜色
    $(".form-row").focusin(function () {
      $(this).addClass("form-row-focus");
    });

    // 丢失焦点，恢复底边框颜色
    $(".form-row").focusout(function () {
      $(this).removeClass("form-row-focus");
    });

    // 清空输入框
    $(".input-clear").click(function () {
      var row = $(this).parents(".form-row");
      $("input", row).val("");
      $(this).hide();
    });

    //显示隐藏清空按钮
    $(".form-row .form-input").on('keyup blur', checkInput);

    function checkInput() {
      if ($.trim($(this).val()) != "") {
        $(".input-clear", $(this).parents(".form-row")).show();
      } else {
        $(".input-clear", $(this).parents(".form-row")).hide();
      }
    }

    // 获取验证码，倒计时
    $(".send-code").click(function () {
      var params = Wade.DataMap();
      var phone="1353456788";
      params.put("phone",phone);

      if (!$(this).hasClass("time-count")) { // 非倒计时状态，获取验证码
        var total = 60; // 倒计总时长
        var sendBtn = $(this).addClass("time-count");
        var defaultText = sendBtn.text();

        // 向后台请求数据
        Common.callSvc("LoginBean.sendVerificationCode", params, function(result){
          result = typeof(result) == "string" ? Wade.DataMap(result) : result;
          if(result.get(Constant.RETURN_CODE_KEY) == Constant.RETURN_CODE_SUCCESS){
            ipuUI.toast(result.get(Constant.RETURN_MSG_KEY));
            // 登录按钮可用
            $(".ipu-btn").prop("disabled",false);
          }else{
            ipuUI.toast(result.get(Constant.RETURN_MSG_KEY));
            return;
          }
        });

        function updateTimeCount() {
          total--;
          if (total > 0) {
            sendBtn.text(total + "s");
            setTimeout(updateTimeCount, 1000);
          } else {
            sendBtn.text(defaultText).removeClass("time-count");
          }
        }
        updateTimeCount();

        // 验证码输入框可输入
        $("#4a_code").prop("disabled",false);
      }
    });

    // 点登录进入首页
    $(".ipu-btn").click(function () {
      var params = Wade.DataMap();
      var userAccount = $("#4a_name").val();
      var password = $("#4a_password").val();
      var verificationCode = $("#4a_code").val();
      // 校验用户名是否为空
      if(!Vali.isNotNull(userAccount,"用户名")){
        $("#4a_name").val("").focus();
        return;
      }
      // 校验密码是否为空
      if(!Vali.isNotNull(password,"密码")){
        $("#4a_password").val("").focus();
        return;
      }
      // 校验验证码是否为空
      if(!Vali.isNotNull(verificationCode,"验证码")){
        $("#4a_code").val("").focus();
        return;
      }
      params.put(userManager.userAccount, userAccount);
      params.put(userManager.passwd, password);
      params.put("verificationCode", verificationCode);
      params.put(userManager.hasRememberPasswd, $(".remember-pwd").find(".app-icon").hasClass("icon-checkbox-blank-circle-outline") ? userManager.hasRememberPasswd_false : userManager.hasRememberPasswd_true);
      // 加载请求等待样式
      ipuUI.showIndicator();
      // 向后台请求数据
      Common.callSvc("LoginBean.login", params, function (result) {
        result = typeof(result) == "string" ? Wade.DataMap(result) : result;
        if(result.get(Constant.RETURN_CODE_KEY) == Constant.RETURN_CODE_SUCCESS){
          // 用户数据本地保存
          userManager.addUserData(params);
          Common.putLocal(Constant.LAST_PASSWORD, password);
          // 保存主账号数据
          Common.put(Constant.SESSION_ID, result.get("SESSION_ID"));
          Common.put(Constant.STAFF_ID, result.get("USER_ID"));
          Common.put("userAccount", userAccount);
          // 传递至一下页面的参数
          var dataParam = Wade.DataMap();
          dataParam.put("userId", result.get("USER_ID"));
          dataParam.put("userAccount", userAccount);
          dataParam.put("userName", result.get("USER_NAME"));
          dataParam.put("email", result.get("USER_MAIL"));
          dataParam.put("lastPage", "Login");
          // 打开主页
          //Mobile.openTemplate("Index",dataParam);
          ipuUI.toast("登录成功！");
          Mobile.openTemplate("Login",dataParam);
          // 关闭请求等待样式
          ipuUI.hideIndicator();
        }else{
          ipuUI.toast(result.get(Constant.RETURN_MSG_KEY));
          ipuUI.hideIndicator();
        }
      });

    });

    // 手势密码登录
    $("#gesture-pass-login").click(function () {
      //判断是否设置过手势锁
      userManager.getCurrentUserData(function(userData){
        if(userData==null){
          return ;
        }
        var gestureValue = userData.get(userManager.gesturePasswd);
        var usingGesturePasswd = userData.get(userManager.usingGesturePasswd);
        if(usingGesturePasswd&&JSON.parse(usingGesturePasswd)){
          if(gestureValue){
            // 有手势锁样式
            var param = Wade.DataMap();
            var data = Wade.DataMap();
            data.put("loginFlag", "1");
            param.put("data", data);
            Mobile.openTemplate("GestureLockLogin", param);
          }else{
            // 没有手势锁样式
            ipuUI.toast("还未设置手势锁");
          }
        }else{
          // 没有手势锁样式
          ipuUI.toast("还未启用手势锁");
        }
      });
    });

    // 初始化登录用户数据
    function showCurrentUserData() {
      userManager.getCurrentUserData(function (userData) {
        if(userData==null){
          return;
        }
        var _hasRememberPasswd = userData.get(userManager.hasRememberPasswd);
        // 记录密码
        if (_hasRememberPasswd == userManager.hasRememberPasswd_true) {//记录密码
          $(".remember-pwd").find(".app-icon").removeClass("icon-checkbox-blank-circle-outline");
          $(".remember-pwd").find(".app-icon").addClass("icon-checkbox-marked-circle");
          if (userData.get(userManager.userAccount)) {
            $("#4a_name").val(userData.get(userManager.userAccount));
          }
          if (userData.get(userManager.passwd)) {
            // 聚焦到密码末尾
            $("#4a_password").val("").focus().val(userData.get(userManager.passwd));
          }

        } else if (_hasRememberPasswd == userManager.hasRememberPasswd_false) {//不记录密码
          // 不记录密码样式
          $(".remember-pwd").find(".app-icon").addClass("icon-checkbox-blank-circle-outline");
          $(".remember-pwd").find(".app-icon").removeClass("icon-checkbox-marked-circle");
          // 聚焦到用户名
          $("#4a_name").val("").focus();
          $("#4a_password").val("");
        }

      });
    }


  });
});
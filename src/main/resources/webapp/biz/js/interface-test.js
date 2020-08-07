require(['jquery', 'ipuUI', 'mobile', 'wadeMobile', 'jcl', 'common', 'artTemplate'], function ($, ipuUI, Mobile, WadeMobile, Wade, Common, artTemplate) {
  $(function () {
    let publicKey;
    let privateKey;

    // 上传
    $(".upload-btn").click(function () {
      let $node = $(this).parents(".ipu-form-item");
      $node.find(".file")[0].click();
      // $node.find(".file").trigger("click");
      $node.find(".file").on('change', function () {
        let filesList = $node.find(".file")[0].files
        if (filesList.length > 0) {
          $node.find(".file-item").text(filesList[0].name);
          $node.find(".file-area").show();
          if ($node.hasClass("public-key")) {
            publicKey = filesList[0];
          } else {
            privateKey = filesList[0];
          }
        } else {
          $node.find(".file-item").text("");
          $node.find(".file-area").hide();
          if ($node.hasClass("public-key")) {
            publicKey = undefined;
          } else {
            privateKey = undefined;
          }
        }
      })
    });

    // 新增键值对
    $(".request-area").on("click", ".add-sign", function () {
      addRequestItem();
    });

    // 删除键值对
    $(".request-area").on("click", ".delete-sign", function () {
      if($(this).hasClass("clear-sign")){
        $(this).parents(".request-item").find("input").val("");
      }else{
        $(this).parents(".request-item").remove();
      }
      updateRequestItem();
    });

    // 增加一个key、value输入组件
    function addRequestItem() {
      let htmlStr = $("#request-item").html();
      $(".request-area").append(htmlStr);
      updateRequestItem();
    }

    // 更新键值对区域样式
    function updateRequestItem() {
      if ($(".request-area").find(".request-item").size() <= 1) {
        $(".delete-sign").addClass("clear-sign");
      } else {
        $(".delete-sign").removeClass("clear-sign");
      }
    }

    // 键盘检测输入事件
    $(".request-area").on("keyup", "input", function () {
      //当输入一个新的key时,自动的增加一组新的键值对
      if ($(this).parents(".ipu-form-item").nextAll(".ipu-form-item").size() <= 0) {
        addRequestItem();
      }
    });

    // 更新url参数
    /*
    function updateUrl() {
      let type = $("input[name='type']:checked").val();
      if (type === "GET") {
        let text = "";
        for (let i = 0; i < $(".request-item").size(); i++) {
          let key = $(".request-item").eq(i).find("input:eq(0)").val().trim();
          let value = $(".request-item").eq(i).find("input:eq(1)").val().trim();
          if (key != "" && value != "") {
            text += `${key}=${value}&`;
          }
        }
        text = text === "" ? text : text.substring(0, text.length - 1);
        let action = $("#action").val().trim();
        if (action === "") {
          return;
        }
        let index = action.indexOf("?");
        if (index > -1) {
          action = text === "" ? action.substring(0, index) : action.substring(0, index + 1) + text;
        } else {
          action = text === "" ? action : action + "?" + text;
        }
        $("#action").val(action);
      }
    }
    */

    // 删除文件
    $("i.icon-delete").click(function () {
      let $node = $(this).parents(".ipu-form-item");
      $node.find(".file-item").text("");
      $node.find(".file-area").hide();
      if ($node.hasClass("public-key")) {
        publicKey = undefined;
      } else {
        privateKey = undefined;
      }
    });

    // 加密
    $("#isEncrypt").change(function () {
      if ($(this).prop("checked") == true) {
        //封装参数
        let params = Wade.DataMap();
        params.put("publicKey",publicKey);
        //封装key-value
        for (let i = 0; i < $(".request-item").size(); i++) {
          let key = $(".request-item").eq(i).find("input:eq(0)").val().trim();
          let value = $(".request-item").eq(i).find("input:eq(1)").val().trim();
          if (key != "" && value != "") {
            params.put(key, value);
          }
        }
        $("#request-decode").val(params.toString());
        //向后台发送请求
        ipuUI.showIndicator();
        Common.callSvc("CustomerBean.encryptRequest", params, function (result) {
          ipuUI.hideIndicator();
          result = typeof (result) == "string" ? Wade.DataMap(result) : result;
          console.log(result);
          if (result.get(Constant.RETURN_CODE_KEY) == Constant.RETURN_CODE_SUCCESS) {
            console.log("成功!!!");
          } else {
            ipuUI.toast(result.get(Constant.RETURN_MSG_KEY));
          }
        });
      }
    })

    // 解密
    $("#isDecrypt").change(function () {
      if ($(this).prop("checked") == true) {

      }
    })


    // 测试
    $(".common-btn").click(function () {
      //获取当前提交的类型
      let type = $("input[name='type']:checked").val();
      var requestType = "";//请求方式
      if (type === "GET") {
        //设置成get请求
        requestType = "ActionBean.getActionBean";
      } else {
        //设置成post请求
        requestType = "ActionBean.postActionBean";
      }

      //封装参数
      let params = Wade.DataMap();
      params.put("action", $("#action").val());//封装action
      params.put("url", $("#url").val());//封装action
      params.put("isEncrypt", $("#isEncrypt").prop("checked"));//封装是否加密 id++

      //封装key-value
      for (let i = 0; i < $(".request-item").size(); i++) {
        let key = $(".request-item").eq(i).find("input:eq(0)").val().trim();
        let value = $(".request-item").eq(i).find("input:eq(1)").val().trim();
        if (key != "" && value != "") {
          params.put(key, value);
        }
      }
      $("#request-decode").val(params.toString());
      //向后台发送请求
      ipuUI.showIndicator();
      Common.callSvc(requestType, params, function (result) {
        ipuUI.hideIndicator();
        result = typeof (result) == "string" ? Wade.DataMap(result) : result;
        console.log(result);
        if (result.get(Constant.RETURN_CODE_KEY) == Constant.RETURN_CODE_SUCCESS) {
          $("#response-decode").val(result.get("result").toString());
          $("#request-encode").val(result.get("requestEncrypt").toString());
          $("#response-encode").val(result.get("resultEncrypt").toString());
        } else {
          ipuUI.toast(result.get(Constant.RETURN_MSG_KEY));
        }
      });
    });
  });
});

require(['jquery', 'ipuUI', 'mobile', 'wadeMobile', 'jcl', 'common', 'artTemplate'], function ($, ipuUI, Mobile, WadeMobile, Wade, Common, artTemplate) {
  $(function () {
    // 上传
    $("#upload-btn").click(function () {
      $("#file")[0].click();
      // $("#file").trigger("click");
      $("#file").on('change', function () {
        let filesList = $("#file")[0].files
        if (filesList.length > 0) {
          $(".file-item").text(filesList[0].name);
          $(".file-area").show();
        } else {
          $(".file-item").text("");
          $(".file-area").hide();
        }
      })
    });

    // 新增键值对
    $(".request-area").on("click", ".add-sign", function () {
      let htmlStr = $("#request-item").html();
      $(".request-area").append(htmlStr);
      updateRequestItem();
    });

    // 删除键值对
    $(".request-area").on("click", ".delete-sign", function () {
      $(this).parents(".request-item").remove();
      updateRequestItem();
    });

    // 更新键值对区域样式
    function updateRequestItem() {
      if ($(".request-area").find(".request-item").size() <= 1) {
        $(".delete-sign").addClass("ipu-fn-hide");
      } else {
        $(".delete-sign").removeClass("ipu-fn-hide");
      }
      updateUrl();
    }

    // 键盘检测输入事件
    $(".request-area").on("keyup", "input", function () {
      updateUrl();
    });

    // 更新url参数
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

    // 删除文件
    $("i.icon-delete").click(function () {
      $(".file-item").text("");
      $(".file-area").hide();
    });

    // 测试
    $(".common-btn").click(function () {
      console.log(2)
    });
  });
});

require(['jquery', 'ipuUI', 'mobile', 'wadeMobile', 'jcl', 'common', 'artTemplate'], function ($, ipuUI, Mobile, WadeMobile, Wade, Common, artTemplate) {
  $(function () {
    // 上传
    $("#upload-btn").click(function () {
      $("#file")[0].click();
      // $("#file").trigger("click");
      console.log(1)
      $("#file").on('change', function () {
        var filesList = $("#file")[0].files
        if(filesList.length > 0){
          $(".file-item").text(filesList[0].name);
          $(".file-area").show();
        }else{
          $(".file-item").text("");
          $(".file-area").hide();
        }
      })
    });

    // 删除
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

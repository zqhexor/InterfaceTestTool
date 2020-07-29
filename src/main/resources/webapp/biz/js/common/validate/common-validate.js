/**
 * 常用校验
 */
define(['jquery', 'ipuUI'], function ($, ipuUI) {
  var Vali = new function () {

    // 是否为电话号码
    this.isPhoneNumber= function (number) {
      if (!number || typeof number == 'undefined' || number == '') {
        ipuUI.toast('请输入手机号');
        return false;
      }
      var mobileReg = /^((13+\d{9})|(145+\d{8})|(147+\d{8})|(15+\d{9})|(16+\d{9})|(17+\d{9})|(18+\d{9})|(19+\d{9}))$/;
      if(!mobileReg.test(number)){
        ipuUI.toast('手机号格式错误');
        return false;
      }
      return true;
    }

    // 校验空字符
    this.isNotNull = function (testValue, tipText) {
      if (testValue == "") {
        ipuUI.toast('请输入' + tipText + '！');
        return false;
      }
      return true;
    };

    // 校验自然数(0、正整数)
    this.isNaturalNumber = function (testValue, tipText) {
      var reg = /^(0|[1-9][0-9]*)$/;
      if (!reg.test(testValue)) {
        ipuUI.toast(tipText + '必须为数字');
        return false;
      }
      return true;
    };

    // 校验整数(正整数、0、负整数)
    this.isInteger = function (testValue, tipText) {
      var reg = /^(0|-?[1-9][0-9]*)$/;
      if (!reg.test(testValue)) {
        ipuUI.toast(tipText + '必须为整数');
        return false;
      }
      return true;
    };

    // 校验字符串长度
    this.valiLength = function (testValue, tipText, minLength, maxLength) {
      if (testValue < minLength || testValue > maxLength) {
        ipuUI.toast(tipText + '的长度必须在' + minLength + "-" + maxLength + "之间");
        return false;
      }
      return true;
    };

  }

  return Vali;
});
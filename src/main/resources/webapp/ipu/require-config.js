/**
 * baseUrl的优先级:require.config>data-main>html文件路径
 * 如果模块包含如下的字符,不按照baseUrl+paths的方式来寻找模块,而是采用全路径(URL)的方式:
 * 1.如果以".js"结尾
 * 2.如果以"/"开头
 * 3.如果以"http:"或者"https:"开头
 */
require.config({
    paths:{
    	/** ipu框架 **/
      'zepto': 'ipu/lib/zepto/zepto.min-1.1.6',
      'jcl' : 'ipu/frame/base/jcl',
      'base64': 'ipu/frame/mobile/base64',
      'browserTool': 'ipu/frame/mobile/browser-toolkit',
      'clientTool': 'ipu/frame/mobile/client-toolkit',
      'mobileBrowser': 'ipu/frame/mobile/mobile-browser',      // iframe方式加载新页面，依赖ipuUI
      // 'mobileBrowser': 'ipu/frame/mobile/mobile-browser-display', // 页面跳转方式加载新页面
      'mobileClient': 'ipu/frame/mobile/mobile-client',
      'wadeMobile': 'ipu/frame/mobile/wade-mobile',//这里同时会引入expand-mobile和biz-mobile
      'mobile': 'ipu/frame/mobile/mobile',
      'mobileExpand': 'ipu/frame/mobile/expand-mobile',
      'bizMobileExpand': 'biz/js/common/biz-mobile',
		
		
		/** ipuUI **/
    	'jquery': 'ipu/lib/jquery/jquery-2.2.4',
    	'iScroll': 'ipu/lib/iscroll/iscroll',
      'Hammer': 'ipu/lib/hammer/hammer',
		  'FastClick': 'ipu/lib/fastclick/fastclick',
      'ipuUI' : 'ipu/ui/js/ipuUI'

    },
	waitSeconds: 0, // 不限制js加载时长，默认为7s，加载js总时长超过7s会报错 
     //缓存
    urlArgs: "urlArgs="  // +new Date().getTime()
});

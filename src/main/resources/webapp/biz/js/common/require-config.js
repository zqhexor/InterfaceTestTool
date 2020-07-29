require.config({
	paths:{
		'common' : 'biz/js/common/common',
    'artTemplate':'biz/lib/art-template/template-web',
		'dragsort': 'biz/lib/dragsort/jquery.dragsort-0.5.2', // 拖动
		'gp': 'biz/lib/gesture/gesture.password',
    'util' : 'biz/js/common/util',
    'customCarousel':'biz/js/common/carousel/customCarousel', // 自定义轮播组件
    'userManager':'biz/js/common/user/userManager', // 账号管理
    'vali':'biz/js/common/validate/common-validate'  // 自定义校验
	},
	shim:{
        'dragsort': { deps: ['jquery'] }
    },
  waitSeconds: 0,  // 加载时间不限制，默认限制为7s
  // 生产模式，使用缓存，加快效率。默认使用缓存
  urlArgs: "urlArgs="
});
define(["wadeMobile","mobileClient","mobileBrowser"],function(WadeMobile,MobileClient,MobileBrowser){
	if(WadeMobile.isApp()){
		 return MobileClient;
	}else{
		return MobileBrowser;
	}
});
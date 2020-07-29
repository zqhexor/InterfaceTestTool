package com.ai.interfacetest.core.handler;

import com.ai.ipu.server.frame.handle.impl.DefaultExceptionHandler;
import com.ai.ipu.server.servlet.ServletManager;
import com.ai.ipu.server.util.MobileConstant;
import com.ai.ipu.server.util.MobileServerException;

public class IpuExceptionHandler extends DefaultExceptionHandler {
	/**
	 * 页面错误时候重定向操作
	 */
	@Override
	public void pageError(Exception e, String pageAction, String data)
			throws Exception {
		if(MobileServerException.class.isInstance(e)){
			if(MobileConstant.Result.SESSION_ERROR_CODE.equals(((MobileServerException)e).getCode())){
				ServletManager.openPage("SessionErr");
				return;
			}
		}
		super.pageError(e, pageAction, data);	//执行父类的逻辑
	}
}

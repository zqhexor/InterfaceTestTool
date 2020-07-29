package com.ai.interfacetest.core.handler;

import com.ai.ipu.server.frame.handle.impl.DefaultSecurityHandler;

public class IpuSecurityHandler extends DefaultSecurityHandler{

	/**
	 * 重写此方法设置文件加密的密钥
	 */
	@Override
	public String getResKey() throws Exception {
		return "abcdefgh";
	}
}

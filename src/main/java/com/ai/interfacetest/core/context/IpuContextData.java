package com.ai.interfacetest.core.context;

import com.ai.ipu.server.frame.context.impl.DefaultJsonContextData;

@SuppressWarnings("serial")
public class IpuContextData extends DefaultJsonContextData {

	public IpuContextData() {
	}

	// 登录账号
	public String getStaffId() {
		return getData().getString("STAFF_ID");
	}

	public void setStaffId(String staffId) {
		put("STAFF_ID", staffId);
	}

	public String getUserAccount() {
		return getData().getString("userAccount");
	}

	public void setUserAccount(String userAccount) {
		put("userAccount", userAccount);
	}

	public void setSessionId(String sessionId) {
		put("SESSION_ID", sessionId);
	}
}

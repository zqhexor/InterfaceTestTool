package com.ai.interfacetest.core.session;

import com.ai.ipu.cache.ICache;
import com.ai.interfacetest.core.context.IpuContextData;
import com.ai.ipu.server.frame.context.IContextData;
import com.ai.ipu.server.frame.session.ISession;
import com.ai.ipu.server.frame.session.impl.AbstractSessionManager;
import com.ai.ipu.server.util.MobileUtility;
import com.ailk.common.data.IData;

public class IpuSessionManager extends AbstractSessionManager {

	/**
	 * 自定义校验逻辑:校验客户端的staffId和Session中的是否一致
	 */
	@Override
	public void customVerify(String paramString, IData paramIData, IContextData paramIContextData) throws Exception {
        String staffId = paramIData.getString("STAFF_ID");
        String contextStaffId = ((IpuContextData) paramIContextData).getStaffId();
        if (staffId == null || !staffId.equals(contextStaffId)) {
            MobileUtility.error("非法操作，请重新登陆!", SESSION_ERROR_CODE);
        }
	}
	@Override
	public String createSession(IContextData contextData) {
		destorySession();
		return super.createSession(contextData);
	}

    public IContextData getSessionData(String sessionId){
        try {
            ICache cache = getSessionCache();

            ISession session = (ISession)cache.get(sessionId);
            if (session == null) {
                this.error("会话对象为空,请重新登录");
            }

            IContextData contextData = session.getContextData();
            return contextData;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}

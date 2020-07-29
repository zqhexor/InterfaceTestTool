package com.ai.interfacetest.core.bean;

import com.ai.interfacetest.core.context.IpuContextData;
import com.ai.interfacetest.util.Constant;
import com.ai.ipu.server.frame.bean.AbstractBean;
import com.ailk.common.data.IData;
import com.ailk.common.data.impl.DataMap;

public class IpuAppBean extends AbstractBean {
	@Override
	protected IpuContextData getContextData() throws Exception {
		return (IpuContextData)(getContext().getContextData());
	}

    /**
     * 构建返回数据对象，默认操作成功
     *
     * @return
     */
    protected IData createReturnData() {
        IData data = new DataMap();
        // 默认操作成功
        data.put(Constant.RETURN_CODE_KEY, Constant.ReturnCode.SUCCESS);
        data.put(Constant.RETURN_MESSAGE_KEY, "操作成功");
        return data;
    }


    /**
     * 构建操作失败对象
     *
     * @return
     */
    protected IData createErrorReturnData(IData data) {
        data.put(Constant.RETURN_CODE_KEY, Constant.ReturnCode.FAIL);
        data.put(Constant.RETURN_MESSAGE_KEY, "操作失败");
        return data;
    }

    /**
     * 创建成功消息
     *
     * @return
     */
    protected IData createSuccessMsg(IData data, String msg) {
        data.put(Constant.RETURN_CODE_KEY, Constant.ReturnCode.SUCCESS);
        data.put(Constant.RETURN_MESSAGE_KEY, msg);
        return data;
    }

    /**
     * 创建失败消息
     *
     * @return
     */
    public IData createErrorMsg(IData data, String msg) {
        data.put(Constant.RETURN_CODE_KEY, Constant.ReturnCode.FAIL);
        data.put(Constant.RETURN_MESSAGE_KEY, msg);
        return data;
    }
}

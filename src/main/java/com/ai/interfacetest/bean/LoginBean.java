package com.ai.interfacetest.bean;


import com.ai.interfacetest.core.bean.IpuAppBean;
import com.ai.interfacetest.core.context.IpuContextData;
import com.ai.interfacetest.core.session.IpuSessionManager;
import com.ai.interfacetest.util.Constant;
import com.ailk.common.data.IData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoginBean extends IpuAppBean {
    private static final Logger logger= LoggerFactory.getLogger(LoginBean.class);
    /**
     * 邮箱后缀列表
     */
    private static final String[] MAIL_SUFFIX_ARR = {"@asiainfo.com",
            "@asiainfo-sec.com"};

    /**
     * 登录
     *
     * @param param
     * @return
     * @throws Exception
     */
    public IData login(IData param) throws Exception {
        //创建返回对象
        IData resultData = createReturnData();
        //模拟验证码校验
        String verificationCode = param.getString("verificationCode");
        boolean validateResult = false;
        if(verificationCode!=null&&!("").equals(verificationCode)){
            validateResult= true;
        }
        if(!validateResult){
            resultData.put(Constant.RETURN_CODE_KEY, Constant.ReturnCode.FAIL);
            resultData.put(Constant.RETURN_MESSAGE_KEY, "验证码错误！");
            return resultData;
        }

        //模拟返回数据
        String userId = "10086";

        //生成context对象
        IpuContextData contextData = new IpuContextData();
        contextData.setStaffId(userId);
        contextData.setUserAccount(param.getString("userAccount"));
        String sessionId = IpuSessionManager.getInstance().createSession(contextData);

        //返回前端数据
        resultData.put("SESSION_ID", sessionId);
        resultData.put("USER_ID", userId);// 员工号
        resultData = createSuccessMsg(resultData, "登录成功！");
        return resultData;

    }


    /**
     * 发送验证码
     * @param param
     * @return
     * @throws Exception
     */
    public IData sendVerificationCode(IData param) throws Exception {
        //创建返回对象
        IData resultData = createReturnData();
        // 模拟发送验证码，并放置session对象中
        String phone = param.getString("phone");
        logger.debug("模拟发送验证码到"+phone);
        boolean resultFlag= true;
        if (resultFlag) {
            return createSuccessMsg(resultData,"发送验证码成功");
        } else {
            return createErrorMsg(resultData,"发送验证码失败");
        }
    }

}

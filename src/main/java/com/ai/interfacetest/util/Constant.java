package com.ai.interfacetest.util;

public class Constant {
    // 这里的SESSION_ID必须大写。框架要求
    public static final String SESSION_ID = "SESSION_ID";

    // 返回状态
    public static final String RETURN_CODE_KEY = "returnCode";
    // 返回消息
    public static final String RETURN_MESSAGE_KEY = "returnMsg";

    // 返回状态值
    public static class ReturnCode {
        /**
         * 成功
         */
        public static final String SUCCESS = "1";
        /**
         * 失败
         */
        public static final String FAIL = "0";
    }

    //请求外部接口的方法名
    public static final String METHOD_NAME ="METHOD_NAME";

    //请求外部接口的参数
    public static final String PARAM_DATA = "PARAM_DATA";

    //返回数据
    public static final String RETURN_DATA = "RETURN_DATA";

    public static final String DATA = "data";
    public static final String KEY = "key";

}

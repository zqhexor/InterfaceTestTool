package com.ai.interfacetest;

import com.ai.ipu.basic.util.IpuBaseException;
import com.ai.ipu.restful.boot.IpuRestApplication;

/**
 * 启动类
 * 启动的时候需要指定参数--server.port=8080
 */
public class IpuServerDemoStart {
    public final static String EXCEPTION_MESSAGES_CONFIG = "exception_messages";

    public static void main(String[] args) {
        /*注册dubbo异常信息编码配置*/
        IpuBaseException.registerCode(EXCEPTION_MESSAGES_CONFIG);
        /*启动SpringBoot服务*/
        IpuRestApplication.start(args);
    }
}

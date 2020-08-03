package com.ai.interfacetest.tool;

import com.ai.ipu.basic.cipher.DES;
import com.ai.ipu.basic.cipher.RSA;
import com.ai.ipu.server.servlet.ServletManager;
import com.ailk.common.data.IData;
import com.alibaba.fastjson.JSON;

import java.security.Key;

/**
 * 提供加密/解密方法的工具类
 */
public class SecurityTool {

    /**
     * 把结果进行加密
     * @param resultData
     * @return
     */
    public String encrypt(IData resultData) throws Exception {
        Key resKey = DES.getKey(ServletManager.getSecurityHandle().getResKey());
            String strMi = DES.encryptString(resKey, JSON.toJSONString(resultData));
        return strMi;
    }

    /**
     * 把结果进行解密
     * @param resultData
     * @return
     */
    public IData decrypt(IData resultData) {

        return null;
    }

}

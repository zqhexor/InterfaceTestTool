package com.ai.interfacetest.tool;

import com.ai.ipu.basic.cipher.DES;
import com.ai.ipu.basic.cipher.RSA;
import com.ai.ipu.server.servlet.ServletManager;
import com.ailk.common.data.IData;
import com.alibaba.fastjson.JSON;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.security.Key;
import java.security.interfaces.RSAPublicKey;

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
     * 把DES加密的key通过公钥加密
     * @param key
     * @return
     * @throws FileNotFoundException
     */
    public String keyEncrypt(Key key) throws Exception {
        //获取公钥的输入流
        InputStream in = new FileInputStream("");
        //加载公钥对象
        RSAPublicKey publicKey = RSA.loadPublicKey(in);
        //加密
        RSA.encrypt(publicKey,key.toString());

        return "";
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

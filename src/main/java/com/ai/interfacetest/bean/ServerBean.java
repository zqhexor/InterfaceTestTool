package com.ai.interfacetest.bean;

import com.ai.interfacetest.core.bean.IpuAppBean;
import com.ai.interfacetest.util.Constant;
import com.ai.ipu.basic.cipher.DES;
import com.ai.ipu.basic.cipher.RSA;
import com.ailk.common.data.IData;
import com.ailk.common.data.impl.DataMap;
import com.alibaba.fastjson.JSON;

import javax.crypto.SecretKey;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.security.interfaces.RSAPrivateKey;

/**
 * 用于模拟服务器的Bean
 *  对请求数据解密(解密后控制台输出)
 *  对响应数据加密(加密后回显)
 */
public class ServerBean extends IpuAppBean {


    /**
     * 对请求进行解密
     * @param param
     * @return
     */
    public IData decodeRequest(IData param) throws Exception {
        //获取请求中被加密的randomDesKey
        String encryptDesKey = param.getString(Constant.KEY);
        //获取请求中的 私钥文件
        File privateKey = (File) param.get("privateKey");
        InputStream in = new FileInputStream(privateKey);
        //使用私钥对其解密,获得用于生产secretKey的randomKey
        String decryptDesKey = RSA.decrypt(getPrivateKey(in), encryptDesKey);
        //获得真正加密数据的key即secretkey
        SecretKey secretKey = DES.getKey(decryptDesKey);
        //获得加密后的数据
        String encryptData = param.getString(Constant.DATA);
        //用secretKey对加密数据进行解密,获取原始数据
        String primevalData = DES.decryptString(secretKey, encryptData);
        IData resultData = JSON.parseObject(primevalData, IData.class);
        //--------------------------------------------------------------------------------测试2开始:primevalData的内容是否正确
        System.out.println(primevalData);
        System.out.println(resultData.toString());
        //--------------------------------------------------------------------------------测试2结束
        return resultData;
    }


    public IData encryptResponse(IData param){
        return null;
    }

    //获取私钥
    private RSAPrivateKey getPrivateKey(InputStream in) throws Exception {
        RSAPrivateKey privateKey = RSA.loadPrivateKey(in);
        return privateKey;
    }

}

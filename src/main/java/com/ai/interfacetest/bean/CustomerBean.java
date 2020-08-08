package com.ai.interfacetest.bean;

import com.ai.interfacetest.core.bean.IpuAppBean;
import com.ai.interfacetest.util.Constant;
import com.ai.interfacetest.util.SpringContextUtils;
import com.ai.ipu.basic.cipher.DES;
import com.ai.ipu.basic.cipher.RSA;
import com.ai.ipu.restful.boot.IpuRestApplication;
import com.ailk.common.data.IData;
import com.alibaba.fastjson.JSON;
import org.springframework.core.env.Environment;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.security.interfaces.RSAPublicKey;
import java.util.Map;

/**
 * 用于模拟客户端的Bean
 * 对请求进行加密(请求加密后回显)
 * 对响应进行解密(响应解密后回显)
 */
public class CustomerBean extends IpuAppBean {

    private static final ThreadLocal<String> randomDesKeyThreadLocal =
            new ThreadLocal<String>();
    private static final ThreadLocal<SecretKey> secretKeyThreadLocal =
            new ThreadLocal<SecretKey>();

    static {
        try {
            String randomDesKey = String.valueOf(89999999 * Math.random() + 10000000);
            randomDesKeyThreadLocal.set(randomDesKey);//生成随机Des密钥
            secretKeyThreadLocal.set(DES.getKey(randomDesKey));//弥补使用不方便
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 对请求进行加密的方法
     *
     * @return
     */
    public IData encryptRequest(IData param) throws Exception {
        //创建加密后的数据
        String encryptData = "无效返回数据!";
        Object publickey =  param.get("publickey");
        //--------------------------------------------------------------------------------测试1开始:param的内容是否正确
        System.out.println("param内容:"+param.toString());
        System.out.println(JSON.toJSON(param));
        //--------------------------------------------------------------------------------测试1结束
        if (param != null) {
            //对请求数据进行加密(使用了经过DES.getKey处理过的randomDesKey,取名为secretKey)
            encryptData = DES.encryptString(secretKeyThreadLocal.get(), param.toString());
        }
        //获取公钥文件
        String publickeyString =  param.getString("publickey");
        //对加密数据的secretKey的基准key即randomDesKey,使用公钥加密
        String encryptDesKey = RSA.encrypt(getPublicKey(publickeyString), randomDesKeyThreadLocal.get());//todo visio没有写RSA加密key的步骤
        //创建返回对象
        IData resultData = createReturnData();
        //存入加密后 的请求数据
        resultData.put(Constant.DATA, encryptData);
        //存入加密后的,用于解密请求数据的key
        resultData.put(Constant.KEY, encryptDesKey);
        return resultData;
    }

    /**
     * 对响应进行解密的方法
     *
     * @return
     */
    public IData decodeResponse(IData param) {
        return null;
    }


    /**
     * 获取RAS公钥的方法
     * @return
     */
    private RSAPublicKey getPublicKey(String publickeyString) throws Exception {
        RSAPublicKey publicKey = RSA.loadPublicKey(publickeyString);
        return publicKey;
    }
}

package demo;

import com.ai.ipu.basic.cipher.DES;
import com.ai.ipu.basic.log.ILogger;
import com.ai.ipu.basic.log.IpuLoggerFactory;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
public class DESDemo {

    @Test
    public void test1(){
//        String key = "325m@#$rt4vt";
        String key = "123456789012345";//加密的密钥
        try {
            String strMi = DES.encryptString(DES.getKey(key), "中文测试abc_123");
            System.out.println("strMi : " + strMi);
            String strMing = DES.decryptString(DES.getKey(key), strMi);
            System.out.println("strMi : " + strMing);
        } catch (Exception var4) {
            throw new RuntimeException("算法错误");
        }
        /**
         * 测试结果:
         *  1.key是用于加密数据的 密钥
         *      1.1 key的长度最小为8位,最大无明确值,前端应该设定为8-12最佳
         *  2.plainText是需要加密的数据
         *  3.DES算法用于生产随机的一个私钥
         *
         */
    }

}

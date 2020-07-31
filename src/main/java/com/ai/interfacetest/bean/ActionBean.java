package com.ai.interfacetest.bean;

import com.ai.interfacetest.core.bean.IpuAppBean;
import com.ailk.common.data.IData;
import com.alibaba.fastjson.JSON;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Set;

/**
 * 用于测试接口的Bean,
 *  模拟浏览器向指定的接口发起请求
 *  获取接口的返回值,封装后回显到页面
 */
public class ActionBean extends IpuAppBean {

    /**
     * 模拟Get请求的提交
     * @param param
     * @return
     * @throws Exception
     */
    public IData getActionBean(IData param) throws Exception {

        //从param中拿走action
        String action = (String) param.remove("action");

        //从param中拿走isEncrypt
        Boolean isEncrypt = Boolean.parseBoolean((String) param.remove("isEncrypt"));

        //至此param中剩下的全是参数了
        StringBuilder url = new StringBuilder();//拼凑到action之后的参数
        //遍历测试页面提交过来的参数列表
        param.forEach((key,value) -> {
//            System.out.println(key + ":" + value);
            url.append(key + "=" + value + "&");
        });

        //去掉url末尾的&
        url.delete(url.length() - 1,url.length());

        //判断action中是否已经有?拼接的参数了
        if (action.indexOf('?') < 0 ){
            //没有,url首位插入?
            url.insert(0,"?");
        }else {
            //有,url首位插入&
            url.insert(0,"&");
        }

        //把url添加到Action之后
        action += url;

        //创建Rest请求工具
        RestTemplate restTemplate = new RestTemplate();
        //发送get请求
        String result = restTemplate.getForObject(action, String.class);

        //创建返回对象
        IData resultData = createReturnData();

        //把返回值封装到resultDate中
        resultData.put("result",result);

        return resultData;
    }

    /**
     * 模拟Post请求的提交
     * @param param
     * @return
     * @throws Exception
     */
    public IData postActionBean(IData param) throws Exception {

        //从param中拿走action
        String action = (String) param.remove("action");

        //从param中拿走isEncrypt
        Boolean isEncrypt = Boolean.parseBoolean((String) param.remove("isEncrypt"));

        //创建Rest请求工具
        RestTemplate restTemplate = new RestTemplate();

        //设置请求数据的格式,以方便亚信内部以IData的格式接收
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        //测试页面提交过来的参数再次封装起来
        MultiValueMap<String,String> myParams = new LinkedMultiValueMap<>();
        myParams.add("data", JSON.toJSONString(param));

        //封装请求内容
        HttpEntity<MultiValueMap<String, String> > requestEntity = new HttpEntity<> (myParams, headers);

        //发送post请求
        String result = restTemplate.postForObject(action, requestEntity,String.class);

        //创建返回对象
        IData resultData = createReturnData();

        //把返回值封装到resultDate中
        resultData.put("result",result);

        return resultData;
    }




}
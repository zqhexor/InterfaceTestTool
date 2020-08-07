package com.ai.interfacetest.controller;

import com.ai.interfacetest.core.bean.IpuAppBean;
import com.ai.interfacetest.util.SpringContextUtils;
import com.ailk.common.data.IData;
import com.ailk.common.data.impl.DataMap;
import com.alibaba.fastjson.JSON;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

public class TestController extends IpuAppBean {

    public String test1(IData param) throws Exception{

        //设置请求数据的格式
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        //封装参数
        MultiValueMap<String, String> params= new LinkedMultiValueMap<>();
        params.add("data", JSON.toJSONString(param));

        //封装请求内容
        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params,headers);

        System.out.println("test1的param:"+param);
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForObject("http://localhost:8080/InterfaceTestTool/mobiledata?action=Test.t2",requestEntity,String.class);

        return "参数获取测试";
    }

    public String test2(IData param) throws Exception{



        return "访问到了test2!";
    }

}

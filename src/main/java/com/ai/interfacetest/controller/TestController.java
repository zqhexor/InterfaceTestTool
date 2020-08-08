package com.ai.interfacetest.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Controller
@RequestMapping("test")
public class TestController{

    //http://localhost:8080/InterfaceTestTool/test/test1
    @RequestMapping("test1")
    @ResponseBody
    public String test1(){
        return "test1";
    }

    @RequestMapping("test2")
    @ResponseBody
    public String test2(@RequestParam("file") MultipartFile file){

        return "test2";
    }



}

package com.ai.interfacetest;

import com.ai.ipu.server.tool.FileEncryptToolRest;
import com.ai.ipu.server.tool.VersionToolRest;

public class IpuPackge {

    public static void main(String[] args) {
        fileEncrypt();
        fileVersion();
    }

    static void fileEncrypt() {
        String isDebug = "true";
        String filterPaths = "";
        String[] params = new String[]{isDebug,filterPaths};
        FileEncryptToolRest.main(params);
    }

    static void fileVersion(){
        String isDebug = "true";
        String filterPaths = "upload|setup|.gitignore|.DS_Store";
        String[] params = new String[]{isDebug, filterPaths};
        VersionToolRest.main(params);
    }
}

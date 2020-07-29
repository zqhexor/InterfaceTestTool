package com.ai.interfacetest.dao;

import com.ai.ipu.database.dao.impl.AbstractBizDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author zhouyf3 (zhouyf3@asiainfo.com)
 * @team IPU
 * @since 2018/8/2 11:07
 */
public class CommonDao extends AbstractBizDao {
    public static final Logger log = LoggerFactory.getLogger(CommonDao.class.getClass());

    public CommonDao(String connName) throws IOException {
        super(connName);
    }

    /**
     * 查询-查询结果返回0或这多条数据
     * @param data where后查询条件
     * @return
     * @throws Exception
     */
    public List<Map<String , Object>> selectByCond(String tableName, Map<String, Object> data) throws Exception {
        List<Map<String, Object>> list = new ArrayList<>();
        list = dao.selectByCond(tableName, data);
        return list;
    }

    /**
     * 查询-查询结果返回0或单条数据
     * @param tableName
     * @param data
     * @return
     * @throws Exception
     */
    public Map<String , Object> select(String tableName, Map<String, Object> data) throws Exception {
        return dao.select(tableName, data);
    }

    /**
     * 新增数据
     * @param tableName
     * @param data
     * @return
     * @throws Exception
     */
    public int insert(String tableName, Map<String, Object> data) throws Exception {
        return dao.insert(tableName, data);
    }

    /**
     * 更新数据
     * @param tableName
     * @param data
     * @return
     * @throws Exception
     */
    public int update(String tableName, Map<String, Object> data) throws Exception {
        return dao.update(tableName, data);
    }

    /**
     *
     * @param tableName
     * @param data 更新数据
     * @param condition where过滤条件
     * @return
     * @throws Exception
     */
    public int updateByCond(String tableName, Map<String, Object> data, Map<String , Object> condition) throws Exception {
        return dao.updateByCond(tableName, data, condition);
    }


}

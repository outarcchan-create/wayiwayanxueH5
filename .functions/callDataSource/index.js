
// 云函数入口文件
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env: tcb.getCurrentEnv()
});

// 数据源配置
const DATA_SOURCES = {
  'wywh5_activity': {
    tableName: 'wywh5_activity',
    primaryKey: 'activity_id'
  },
  'wywh5_task': {
    tableName: 'wywh5_task',
    primaryKey: 'task_id'
  },
  'wywh5_question': {
    tableName: 'wywh5_question',
    primaryKey: 'question_id'
  },
  'wywh5_user_activity': {
    tableName: 'wywh5_user_activity',
    primaryKey: 'user_activity_id'
  },
  'wywh5_user_task': {
    tableName: 'wywh5_user_task',
    primaryKey: 'user_task_id'
  },
  'wywh5_user_profile': {
    tableName: 'wywh5_user_profile',
    primaryKey: 'user_id'
  }
};

/**
 * 数据源操作云函数
 * 支持对各种数据模型的增删改查操作
 */
exports.main = async (event, context) => {
  const { dataSourceName, methodName, params, data } = event;
  
  try {
    // 验证数据源
    if (!DATA_SOURCES[dataSourceName]) {
      throw new Error(`数据源 ${dataSourceName} 不存在`);
    }
    
    const { tableName, primaryKey } = DATA_SOURCES[dataSourceName];
    const db = app.database();
    const collection = db.collection(tableName);
    
    let result;
    
    switch (methodName) {
      case 'list':
        // 列表查询
        result = await listDocuments(collection, params);
        break;
        
      case 'get':
        // 获取单个文档
        result = await getDocument(collection, params, primaryKey);
        break;
        
      case 'create':
        // 创建文档
        result = await createDocument(collection, data);
        break;
        
      case 'update':
        // 更新文档
        result = await updateDocument(collection, params, data, primaryKey);
        break;
        
      case 'delete':
        // 删除文档
        result = await deleteDocument(collection, params, primaryKey);
        break;
        
      default:
        throw new Error(`不支持的操作方法: ${methodName}`);
    }
    
    return {
      success: true,
      data: result,
      message: '操作成功'
    };
    
  } catch (error) {
    console.error('数据源操作失败:', error);
    return {
      success: false,
      error: error.message,
      message: '操作失败'
    };
  }
};

/**
 * 列表查询
 */
async function listDocuments(collection, params = {}) {
  const { filter = {}, sort = {}, limit = 20, offset = 0 } = params;
  
  let query = collection;
  
  // 应用过滤条件
  if (Object.keys(filter).length > 0) {
    query = query.where(filter);
  }
  
  // 应用排序
  if (Object.keys(sort).length > 0) {
    query = query.orderBy(sort);
  }
  
  // 应用分页
  if (limit > 0) {
    query = query.limit(limit);
  }
  
  if (offset > 0) {
    query = query.skip(offset);
  }
  
  const { data } = await query.get();
  return data;
}

/**
 * 获取单个文档
 */
async function getDocument(collection, params = {}, primaryKey) {
  const { filter = {}, id } = params;
  
  if (id) {
    // 根据主键ID查询
    const { data } = await collection.doc(id).get();
    return data;
  } else if (Object.keys(filter).length > 0) {
    // 根据过滤条件查询
    const { data } = await collection.where(filter).limit(1).get();
    return data.length > 0 ? data[0] : null;
  } else {
    throw new Error('必须提供ID或过滤条件');
  }
}

/**
 * 创建文档
 */
async function createDocument(collection, data) {
  if (!data) {
    throw new Error('创建文档必须提供数据');
  }
  
  // 添加创建时间
  const documentData = {
    ...data,
    created_time: new Date().toISOString(),
    updated_time: new Date().toISOString()
  };
  
  const { id } = await collection.add(documentData);
  
  // 返回创建的文档
  const { data: result } = await collection.doc(id).get();
  return result;
}

/**
 * 更新文档
 */
async function updateDocument(collection, params = {}, data, primaryKey) {
  const { filter = {}, id } = params;
  
  if (!data) {
    throw new Error('更新文档必须提供数据');
  }
  
  // 添加更新时间
  const updateData = {
    ...data,
    updated_time: new Date().toISOString()
  };
  
  if (id) {
    // 根据主键ID更新
    await collection.doc(id).update(updateData);
    
    // 返回更新后的文档
    const { data: result } = await collection.doc(id).get();
    return result;
  } else if (Object.keys(filter).length > 0) {
    // 根据过滤条件更新
    const { data: docs } = await collection.where(filter).get();
    
    if (docs.length === 0) {
      throw new Error('未找到要更新的文档');
    }
    
    // 批量更新
    const batch = collection.where(filter);
    await batch.update(updateData);
    
    // 返回更新后的第一个文档
    const { data: result } = await collection.where(filter).limit(1).get();
    return result.length > 0 ? result[0] : null;
  } else {
    throw new Error('必须提供ID或过滤条件');
  }
}

/**
 * 删除文档
 */
async function deleteDocument(collection, params = {}, primaryKey) {
  const { filter = {}, id } = params;
  
  if (id) {
    // 根据主键ID删除
    await collection.doc(id).remove();
    return { deleted: true, id };
  } else if (Object.keys(filter).length > 0) {
    // 根据过滤条件删除
    const { data: docs } = await collection.where(filter).get();
    
    if (docs.length === 0) {
      throw new Error('未找到要删除的文档');
    }
    
    // 批量删除
    await collection.where(filter).remove();
    
    return { deleted: true, count: docs.length };
  } else {
    throw new Error('必须提供ID或过滤条件');
  }
}

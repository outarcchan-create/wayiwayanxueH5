
// 云开发AI小助手生成的云函数代码
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env: tcb.getCurrentEnv()
});
const db = app.database();

/**
 * 数据源调用云函数
 * 支持对各种数据模型的CRUD操作
 */
exports.main = async (event, context) => {
  const {
    dataSourceName,
    methodName,
    params = {}
  } = event;

  try {
    // 验证参数
    if (!dataSourceName) {
      throw new Error('数据源名称不能为空');
    }

    if (!methodName) {
      throw new Error('方法名不能为空');
    }

    // 根据数据源名称确定集合名
    const collectionName = getCollectionName(dataSourceName);
    if (!collectionName) {
      throw new Error(`不支持的数据源: ${dataSourceName}`);
    }

    const collection = db.collection(collectionName);
    let result;

    switch (methodName) {
      case 'list':
        result = await handleList(collection, params);
        break;
      case 'get':
        result = await handleGet(collection, params);
        break;
      case 'create':
        result = await handleCreate(collection, params);
        break;
      case 'update':
        result = await handleUpdate(collection, params);
        break;
      case 'delete':
        result = await handleDelete(collection, params);
        break;
      default:
        throw new Error(`不支持的方法: ${methodName}`);
    }

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('数据调用失败:', error);
    return {
      success: false,
      message: error.message || '操作失败'
    };
  }
};

/**
 * 根据数据源名称获取集合名
 */
function getCollectionName(dataSourceName) {
  const mapping = {
    'wywh5_activity': 'wywh5_activity',
    'wywh5_task': 'wywh5_task',
    'wywh5_question': 'wywh5_question',
    'wywh5_user_activity': 'wywh5_user_activity',
    'wywh5_user_task': 'wywh5_user_task',
    'wywh5_user_profile': 'wywh5_user_profile'
  };
  return mapping[dataSourceName];
}

/**
 * 处理列表查询
 */
async function handleList(collection, params) {
  const {
    filter = {},
    sort = {},
    limit = 100,
    offset = 0
  } = params;

  let query = collection;

  // 应用过滤条件
  if (Object.keys(filter).length > 0) {
    query = query.where(filter);
  }

  // 应用排序 - 修复排序语法
  if (Object.keys(sort).length > 0) {
    Object.keys(sort).forEach(field => {
      const order = sort[field];
      if (order === 1 || order === -1) {
        query = query.orderBy(field, order === 1 ? 'asc' : 'desc');
      }
    });
  }

  // 应用分页
  if (offset > 0) {
    query = query.skip(offset);
  }
  if (limit > 0) {
    query = query.limit(limit);
  }

  const result = await query.get();
  return result.data || [];
}

/**
 * 处理单条查询
 */
async function handleGet(collection, params) {
  const {
    filter
  } = params;

  if (!filter || Object.keys(filter).length === 0) {
    throw new Error('查询条件不能为空');
  }

  const result = await collection.where(filter).get();
  return result.data && result.data.length > 0 ? result.data[0] : null;
}

/**
 * 处理创建操作
 */
async function handleCreate(collection, params) {
  const {
    data
  } = params;

  if (!data) {
    throw new Error('创建数据不能为空');
  }

  // 添加创建时间
  if (!data.created_time) {
    data.created_time = new Date().toISOString();
  }

  const result = await collection.add(data);
  return {
    _id: result.id,
    ...data
  };
}

/**
 * 处理更新操作
 */
async function handleUpdate(collection, params) {
  const {
    filter,
    data
  } = params;

  if (!filter || Object.keys(filter).length === 0) {
    throw new Error('更新条件不能为空');
  }

  if (!data) {
    throw new Error('更新数据不能为空');
  }

  // 添加更新时间
  if (!data.updated_time) {
    data.updated_time = new Date().toISOString();
  }

  const result = await collection.where(filter).update(data);
  return result;
}

/**
 * 处理删除操作
 */
async function handleDelete(collection, params) {
  const {
    filter
  } = params;

  if (!filter || Object.keys(filter).length === 0) {
    throw new Error('删除条件不能为空');
  }

  const result = await collection.where(filter).remove();
  return result;
}

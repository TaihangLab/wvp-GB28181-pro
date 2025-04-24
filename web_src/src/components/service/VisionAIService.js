import axios from 'axios';

// 创建专用于visionAI模块的axios实例
const visionAIAxios = axios.create({
  baseURL: 'http://192.168.1.101:8000',
  timeout: 15000,
  withCredentials: false  // 将withCredentials设置为false，避免CORS错误
});

// 添加请求拦截器
visionAIAxios.interceptors.request.use(
  config => {
    // 这里可以添加token等通用请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['access-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
visionAIAxios.interceptors.response.use(
  response => {
    // 转换响应数据为前端期望的格式
    // 前端期望格式: { code: 0, data: [...], total: ... }
    const originalData = response.data;
    
    // 如果已经是期望的格式，直接返回
    if (originalData && (originalData.code !== undefined)) {
      return response;
    }
    
    // 否则，转换数据格式
    const transformedData = {
      code: 0, // 成功状态码
      msg: 'success',
      data: [], // 默认空数组
      total: 0  // 默认总数为0
    };
    
    // 检查是否包含models数组（模型列表接口）
    if (originalData && originalData.models) {
      transformedData.data = originalData.models.map(model => {
        return {
          id: model.id,
          name: model.name,
          version: model.version,
          description: model.description,
          // 转换model_status布尔值为字符串
          model_status: model.model_status ? 'loaded' : 'unloaded',
          // 转换usage_status布尔值为字符串
          usage_status: model.usage_status ? 'using' : 'unused',
          created_at: model.created_at,
          updated_at: model.updated_at
        };
      });
      transformedData.total = originalData.total || transformedData.data.length;
    } 
    // 检查是否包含单个模型详情（获取模型详情接口）
    else if (originalData && originalData.model) {
      const model = originalData.model;
      transformedData.data = {
        id: model.id,
        name: model.name,
        version: model.version,
        description: model.description,
        // 转换status布尔值为字符串
        model_status: model.status ? 'loaded' : 'unloaded',
        // 转换usage_status布尔值为字符串
        usage_status: model.usage_status ? 'using' : 'unused',
        created_at: model.created_at,
        updated_at: model.updated_at,
        // 添加模型配置信息
        config: model.model_metadata,
        // 添加服务器元数据
        server_metadata: model.server_metadata,
        // 添加模型配置
        model_config: model.model_config,
        // 相关技能
        skill_classes: model.skill_classes
      };
      
      // 如果包含success字段（更新模型接口）
      if (originalData.success !== undefined) {
        transformedData.code = originalData.success ? 0 : -1;
        transformedData.msg = originalData.success ? '更新成功' : '更新失败';
      }
    }
    // 检查是否为加载/卸载/删除模型的响应
    else if (originalData && originalData.success !== undefined) {
      transformedData.code = originalData.success ? 0 : -1;
      transformedData.msg = originalData.message || (originalData.success ? 'success' : 'failed');
      if (originalData.status !== undefined) {
        transformedData.data = {
          status: originalData.status
        };
      }
    }
    // 其他情况，保持原样
    else {
      transformedData.data = originalData;
    }
    
    // 替换原始响应数据
    response.data = transformedData;
    
    return response;
  },
  error => {
    // 处理响应错误
    if (error.response && error.response.status === 401) {
      // 处理认证失败
      console.log('认证失败，请重新登录');
    }
    return Promise.reject(error);
  }
);

// 模型服务API
export const modelAPI = {
  // 获取模型列表
  getModelList(params) {
    // 转换前端参数为后端API所需格式
    const apiParams = { ...params };
    
    // 处理模型名称搜索参数
    if (params.name) {
      apiParams.query_name = params.name;
      delete apiParams.name;
    }
    
    // 处理使用状态筛选参数
    if (params.usage_status) {
      apiParams.query_used = params.usage_status === 'using' ? true : false;
      delete apiParams.usage_status;
    }
    
    return visionAIAxios.get('/api/v1/models/list', { params: apiParams });
  },
  
  // 获取模型详情
  getModelDetail(modelId) {
    return visionAIAxios.get(`/api/v1/models/${modelId}`);
  },

  // 更新模型信息
  updateModel(modelId, modelData) {
    return visionAIAxios.put(`/api/v1/models/${modelId}`, modelData);
  },

  // 删除模型
  deleteModel(modelId) {
    return visionAIAxios.delete(`/api/v1/models/${modelId}`);
  },

  // 批量删除模型
  batchDeleteModels(ids) {
    return visionAIAxios.delete('/api/v1/models/batch', { data: { ids } });
  },

  // 加载模型
  loadModel(modelId) {
    return visionAIAxios.post(`/api/v1/models/${modelId}/load`);
  },

  // 卸载模型
  unloadModel(modelId) {
    return visionAIAxios.post(`/api/v1/models/${modelId}/unload`);
  }
};

export default {
  modelAPI
}; 
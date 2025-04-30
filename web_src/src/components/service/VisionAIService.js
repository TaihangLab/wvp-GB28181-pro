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
    
    // 如果是批量删除技能或模型的响应（包含detail字段），直接返回不进行转换
    if (originalData && originalData.detail && originalData.success !== undefined) {
      return response;
    }
    
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
    // 检查是否包含技能列表数据（技能列表接口）
    else if (originalData && originalData.skill_classes) {
      transformedData.data = originalData.skill_classes;
      transformedData.total = originalData.total || transformedData.data.length;
      
      // 添加分页信息
      if (originalData.page) transformedData.page = originalData.page;
      if (originalData.limit) transformedData.limit = originalData.limit;
      if (originalData.pages) transformedData.pages = originalData.pages;
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
    // 检查是否为设备列表数据（获取技能关联设备列表接口）
    else if (originalData && Array.isArray(originalData.devices)) {
      transformedData.data = originalData.devices.map(device => {
        return {
          id: device.id || device.device_id,
          name: device.name || device.device_name || '未命名设备',
          camera_uuid: device.camera_uuid || device.device_id || '-',
          location: device.location || '-',
          status: device.status || false
        };
      });
      transformedData.total = transformedData.data.length;
    }
    // 检查是否为直接返回的设备数组（技能实例关联设备接口）
    else if (originalData && Array.isArray(originalData) && originalData.length > 0 
            && (originalData[0].camera_uuid !== undefined || originalData[0].deviceId !== undefined)) {
      transformedData.data = originalData.map(device => {
        return {
          id: device.id,
          name: device.name || '未命名设备',
          camera_uuid: device.camera_uuid || device.deviceId || device.gb_id || '-',
          location: device.location || '-',
          status: device.status || false,
          // 保留可能有用的额外字段
          tags: device.tags,
          camera_type: device.camera_type
        };
      });
      transformedData.total = originalData.length;
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
    return visionAIAxios.delete('/api/v1/models/batch-delete', { data: { model_ids: ids } });
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

// 添加技能服务API
export const skillAPI = {
  // 获取技能列表
  getSkillList(params = {}) {
    // 处理分页参数和查询参数
    const apiParams = { ...params };
    
    // 处理技能名称搜索参数
    if (params.name) {
      apiParams.query_name = params.name;
      delete apiParams.name;
    }
    
    // 处理技能类型参数
    if (params.type) {
      apiParams.query_type = params.type;
      delete apiParams.type;
    }
    
    // 处理状态筛选参数
    if (params.status !== undefined) {
      // 将状态字符串转换为布尔值: 'published' -> true, 'unpublished' -> false
      apiParams.status = params.status === 'published';
      // 或者直接传递布尔值
      if (typeof params.status === 'boolean') {
        apiParams.status = params.status;
      }
    }
    
    // 处理分页参数 - 确保page和limit被正确传递
    if (params.page) {
      apiParams.page = params.page;
    }
    
    if (params.limit) {
      apiParams.limit = Math.min(params.limit, 100); // 限制最大为100条
    }
    
    return visionAIAxios.get('/api/v1/skill-classes', { params: apiParams });
  },
  
  // 获取技能详情
  getSkillDetail(skillClassId) {
    return visionAIAxios.get(`/api/v1/skill-classes/${skillClassId}`);
  },

  // 删除技能
  deleteSkill(skillClassId) {
    return visionAIAxios.delete(`/api/v1/skill-classes/${skillClassId}`);
  },

  // 批量删除技能
  batchDeleteSkills(ids) {
    return visionAIAxios.delete('/api/v1/skill-classes/batch-delete', { data: { skill_class_ids: ids } });
  },

  // 导入技能
  importSkill(skillData) {
    return visionAIAxios.post('/api/v1/skill-classes', skillData);
  },

  // 更新技能
  updateSkill(skillClassId, skillData) {
    return visionAIAxios.put(`/api/v1/skill-classes/${skillClassId}`, skillData);
  },
  
  // 上传技能图片
  uploadSkillImage(skillClassId, imageFile) {
    if (!imageFile || !skillClassId) {
      console.error('上传图片失败: 缺少必要参数', { skillClassId, imageFile: !!imageFile });
      return Promise.reject(new Error('缺少必要参数'));
    }
    
    console.log('准备上传图片到服务器:', skillClassId, imageFile.name, imageFile.type, imageFile.size);
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // 设置请求头
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // 添加上传进度事件
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('上传进度:', percentCompleted + '%');
      }
    };
    
    return visionAIAxios.post(`/api/v1/skill-classes/${skillClassId}/image`, formData, config)
      .then(response => {
        console.log('图片上传成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('图片上传请求失败:', error);
        throw error;
      });
  },
  
  /**
   * 获取技能关联的设备列表
   * @param {string|number} skillClassId - 技能类ID
   * @returns {Promise} 包含设备列表的Promise对象
   * 返回的设备数据包含: name(设备名称), camera_uuid(设备ID), location(位置), status(状态)
   */
  getSkillDevices(skillClassId) {
    if (!skillClassId) {
      console.error('获取技能关联设备失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }
    
    return visionAIAxios.get(`/api/v1/skill-classes/${skillClassId}/devices`);
  },
  
  /**
   * 获取技能实例关联的设备列表
   * @param {string|number} instanceId - 技能实例ID
   * @returns {Promise} 包含设备列表的Promise对象
   * 返回的设备数据包含: name(设备名称), camera_uuid(设备ID), location(位置), status(状态)
   */
  getSkillInstanceDevices(instanceId) {
    if (!instanceId) {
      console.error('获取技能实例关联设备失败: 缺少实例ID');
      return Promise.reject(new Error('缺少技能实例ID'));
    }
    
    return visionAIAxios.get(`/api/v1/skill-instances/${instanceId}/devices`);
  }
};

export default {
  modelAPI,
  skillAPI
}; 
import axios from 'axios';

// 创建专用于visionAI模块的axios实例
const visionAIAxios = axios.create({
  baseURL: 'http://192.168.1.106:8000',
  timeout: 15000,
  withCredentials: false,  // 将withCredentials设置为false，避免CORS错误
});

// 自定义参数序列化函数
visionAIAxios.defaults.paramsSerializer = function (params) {
  // 自定义参数序列化逻辑，确保数组以多个同名参数形式传递
  const queryParams = [];

  for (const key in params) {
    if (params[key] !== undefined) {
      if (Array.isArray(params[key])) {
        // 对于数组参数，使用重复的键名传递每个值
        params[key].forEach(value => {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        });
      } else {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
      }
    }
  }

  return queryParams.join('&');
};

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
    // 检查是否是特殊API，需要保留原始数据结构
    const isSpecialApi = 
      response.config.url.includes('/api/v1/cameras/wvp/gb28181_list') ||
      response.config.url.includes('/api/v1/cameras/wvp/push_list') ||
      response.config.url.includes('/api/v1/cameras/wvp/proxy_list') ||
      /\/api\/v1\/cameras\/\d+$/.test(response.config.url); // 匹配摄像头详情接口
      
    // 检查是否是删除摄像头请求（DELETE方法 + 摄像头ID路径）
    const isDeleteCameraRequest = 
      response.config.method === 'delete' && 
      /\/api\/v1\/cameras\/\d+$/.test(response.config.url);
      
    // 检查是否是批量删除摄像头请求
    const isBatchDeleteRequest = 
      response.config.method === 'post' && 
      response.config.url.includes('/api/v1/cameras/batch-delete');
      
    if (isSpecialApi || isDeleteCameraRequest || isBatchDeleteRequest) {
      console.log('特殊API接口返回原始数据:', response.config.method, response.config.url);
      
      // 对于删除操作，添加一个标准格式的包装层，方便前端处理
      if (isDeleteCameraRequest) {
        // 如果原始响应中没有code字段，添加一个
        const originalData = response.data;
        
        // 如果响应数据还不是对象，或已经有code字段，则不做处理
        if (typeof originalData !== 'object' || originalData.code !== undefined) {
          return response;
        }
        
        // 添加code字段，基于success状态
        if (originalData.success !== undefined) {
          originalData.code = originalData.success ? 0 : -1;
          originalData.msg = originalData.message || (originalData.success ? '操作成功' : '操作失败');
        } else if (response.status >= 200 && response.status < 300) {
          // HTTP成功状态码，假定操作成功
          originalData.code = 0;
          originalData.msg = '操作成功';
          originalData.success = true;
        }
      }
      
      // 对于批量删除操作，进行类似处理
      if (isBatchDeleteRequest) {
        const originalData = response.data;
        
        // 如果响应数据还不是对象，则不做处理
        if (typeof originalData !== 'object') {
          return response;
        }
        
        // 如果已经有success_ids和failed_ids字段，确保有code字段便于统一处理
        if (originalData.success_ids !== undefined || originalData.failed_ids !== undefined) {
          if (originalData.code === undefined) {
            // 根据success字段或操作结果推断code
            if (originalData.success !== undefined) {
              originalData.code = originalData.success ? 0 : -1;
            } else if (originalData.success_ids && originalData.success_ids.length > 0) {
              originalData.code = 0; // 至少有一个成功，视为成功
            } else {
              originalData.code = -1; // 都失败，视为失败
            }
          }
          
          // 确保有消息字段
          if (!originalData.msg && !originalData.message) {
            originalData.msg = originalData.success ? '批量删除成功' : '批量删除部分失败';
          }
        }
        // 如果是简单的success/message格式，转换为包含success_ids/failed_ids的格式
        else if (originalData.success !== undefined) {
          originalData.code = originalData.success ? 0 : -1;
          originalData.msg = originalData.message || (originalData.success ? '批量删除成功' : '批量删除失败');
          
          // 尝试从请求数据中获取删除的ID列表
          try {
            const requestData = JSON.parse(response.config.data);
            const cameraIds = requestData.camera_ids || [];
            
            if (originalData.success) {
              // 如果操作成功，所有ID都视为成功
              originalData.success_ids = cameraIds;
              originalData.failed_ids = [];
              originalData.success_count = cameraIds.length;
              originalData.failed_count = 0;
            } else {
              // 如果操作失败，所有ID都视为失败
              originalData.success_ids = [];
              originalData.failed_ids = cameraIds;
              originalData.success_count = 0;
              originalData.failed_count = cameraIds.length;
            }
          } catch (error) {
            console.error('解析批量删除请求数据出错:', error);
            // 确保至少有空数组
            originalData.success_ids = originalData.success_ids || [];
            originalData.failed_ids = originalData.failed_ids || [];
          }
        }
      }
      
      return response;
    }
    
    // 转换响应数据为前端期望的格式
    // 前端期望格式: { code: 0, data: [...], total: ... }
    const originalData = response.data;

    // 如果是批量删除技能或模型的响应（包含detail字段），直接返回不进行转换
    if (originalData && originalData.detail && originalData.success !== undefined) {
      return response;
    }

    // 如果是批量删除摄像头的响应（包含success_ids和failed_ids字段），直接返回不进行转换
    if (originalData && (originalData.success_ids !== undefined || originalData.failed_ids !== undefined)) {
      // 增加一个code字段方便前端统一处理
      if (originalData.code === undefined) {
        originalData.code = originalData.success ? 0 : -1;
      }
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

    // 检查是否为通用操作响应（包含success和message字段的简单响应）
    if (originalData && originalData.success !== undefined && originalData.message !== undefined) {
      transformedData.code = originalData.success ? 0 : -1;
      transformedData.msg = originalData.message;

      // 处理摄像头更新或添加响应
      if (originalData.camera) {
        transformedData.data = originalData.camera;
      } else if (originalData.status !== undefined) {
        transformedData.data = {
          status: originalData.status
        };
      }
    }
    // 检查是否为标签创建响应
    else if (originalData && originalData.success !== undefined && originalData.tag) {
      transformedData.code = originalData.success ? 0 : -1;
      transformedData.msg = originalData.success ? '创建标签成功' : '创建标签失败';
      transformedData.data = originalData.tag;
    }
    // 检查是否包含models数组（模型列表接口）
    else if (originalData && originalData.models) {
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
    // 检查是否为单个模型详情（获取模型详情接口）
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

      // 处理摄像头更新响应
      if (originalData.camera) {
        transformedData.data = originalData.camera;
      } else if (originalData.status !== undefined) {
        transformedData.data = {
          status: originalData.status
        };
      }
    }

    // 检查是否为摄像头列表数据（获取AI摄像头列表接口）
    else if (originalData && originalData.cameras && response.config.url.includes('/api/v1/cameras/ai/list')) {
      transformedData.data = originalData.cameras.map(camera => {
        console.log(response.config.url)
        return {
          id: camera.id,
          name: camera.name || '未命名摄像头',
          camera_uuid: camera.camera_uuid || '-',
          location: camera.location || '-',
          status: camera.status || false,
          tags: camera.tags || [],
          camera_type: camera.camera_type || '-',
          skill_names: camera.skill_names || [],
        };
      });
      transformedData.total = originalData.total || transformedData.data.length;

      // 添加分页信息
      if (originalData.page) transformedData.page = originalData.page;
      if (originalData.limit) transformedData.limit = originalData.limit;
      if (originalData.pages) transformedData.pages = originalData.pages;
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

  // 获取AI任务技能类列表
  getAITaskSkillClasses(params = {}) {
    // 处理分页参数和查询参数
    const apiParams = { ...params };
    
    // 处理分页参数
    if (params.page) {
      apiParams.page = params.page;
    }

    if (params.limit) {
      apiParams.limit = Math.min(params.limit, 100); // 限制最大为100条
    }
    
    // 处理查询参数
    if (params.query) {
      apiParams.query = params.query;
    }
    
    // 处理状态筛选，默认获取启用状态的技能
    if (params.status !== undefined) {
      apiParams.status = params.status;
    } else {
      apiParams.status = true; // 默认获取启用的技能
    }
    
    return visionAIAxios.get('/api/v1/ai-tasks/skill-classes', { params: apiParams });
  },

  // 创建AI任务（系统会自动创建技能实例）
  createAITask(taskData) {
    // 验证必要参数
    if (!taskData.camera_id || !taskData.skill_class_id) {
      console.error('创建AI任务失败: 缺少必要参数', { 
        camera_id: taskData.camera_id, 
        skill_class_id: taskData.skill_class_id 
      });
      return Promise.reject(new Error('缺少必要参数: 摄像头ID和技能类ID必须提供'));
    }
    
    // 创建任务数据对象
    const data = {
      ...taskData,
      // 确保运行时段格式正确
      running_period: taskData.running_period || {
        enabled: true,
        periods: [
          {
            start: "00:00",
            end: "23:59"
          }
        ]
      },
      // 确保电子围栏格式正确
      electronic_fence: taskData.electronic_fence || {
        enabled: false,
        points: []
      },
      // 默认状态为启用
      status: taskData.status !== undefined ? taskData.status : true
    };
    
    console.log('创建AI任务请求数据:', data);
    
    // 发送创建AI任务请求
    return visionAIAxios.post('/api/v1/ai-tasks', data);
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
  },

  // 获取AI任务技能详情
  getAITaskSkillDetail(skillClassId) {
    return visionAIAxios.get(`/api/v1/ai-tasks/skill-classes/${skillClassId}`);
  }
};

// 摄像头服务API
export const cameraAPI = {
  /**
   * 获取视觉AI平台中已添加的摄像头列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码，从1开始
   * @param {number} [params.limit=10] - 每页记录数，最大100条
   * @param {string} [params.name] - 按摄像头名称过滤（模糊匹配）
   * @param {string} [params.location] - 按设备来源地点过滤（模糊匹配）
   * @param {Array|string} [params.tags] - 按标签过滤，可传入数组或单个字符串
   * @param {boolean} [params.match_all] - 多标签过滤时是否需要匹配所有标签（true为AND逻辑，false为OR逻辑）
   * @returns {Promise} 包含摄像头列表的Promise对象
   */
  getCameraList(params = {}) {
    // 处理查询和分页参数
    const apiParams = { ...params };

    // 处理分页参数 - 确保page和limit被正确传递
    if (!apiParams.page) {
      apiParams.page = 1; // 默认第1页
    }

    if (!apiParams.limit) {
      apiParams.limit = 10; // 默认每页10条
    } else {
      apiParams.limit = Math.min(params.limit, 100); // 限制最大为100条
    }

    // tags参数保持原样，由paramsSerializer处理数组格式
    // 不再对标签数组进行特殊处理

    console.log('API调用参数:', apiParams);

    return visionAIAxios.get('/api/v1/cameras/ai/list', { params: apiParams });
  },

  /**
   * 获取国标设备列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码
   * @param {number} [params.count=20] - 每页记录数
   * @param {string} [params.query] - 搜索关键词（按设备名称和ID查询）
   * @param {string} [params.status] - 设备状态筛选
   * @returns {Promise} 包含国标设备列表的Promise对象
   */
  getGb28181List(params = {}) {
    // 处理查询和分页参数
    const apiParams = { ...params };

    // 设置默认值
    if (!apiParams.page) {
      apiParams.page = 1; // 默认第1页
    }

    if (!apiParams.count) {
      apiParams.count = 20; // 默认每页20条
    }

    return visionAIAxios.get('/api/v1/cameras/wvp/gb28181_list', { params: apiParams });
  },

  /**
   * 获取推流设备列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码
   * @param {number} [params.count=20] - 每页记录数
   * @param {string} [params.query] - 搜索关键词（按设备名称和ID查询）
   * @param {boolean} [params.pushing] - 是否正在推流
   * @returns {Promise} 包含推流设备列表的Promise对象
   */
  getPushStreamList(params = {}) {
    // 处理查询和分页参数
    const apiParams = { ...params };

    // 设置默认值
    if (!apiParams.page) {
      apiParams.page = 1; // 默认第1页
    }

    if (!apiParams.count) {
      apiParams.count = 20; // 默认每页20条
    }

    return visionAIAxios.get('/api/v1/cameras/wvp/push_list', { params: apiParams });
  },

  /**
   * 获取拉流设备列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码
   * @param {number} [params.count=20] - 每页记录数
   * @param {string} [params.query] - 搜索关键词（按设备名称和ID查询）
   * @param {boolean} [params.pulling] - 是否正在拉流
   * @returns {Promise} 包含拉流设备列表的Promise对象
   */
  getProxyStreamList(params = {}) {
    // 处理查询和分页参数
    const apiParams = { ...params };

    // 设置默认值
    if (!apiParams.page) {
      apiParams.page = 1; // 默认第1页
    }

    if (!apiParams.count) {
      apiParams.count = 20; // 默认每页20条
    }

    return visionAIAxios.get('/api/v1/cameras/wvp/proxy_list', { params: apiParams });
  },

  /**
   * 获取所有标签列表
   * @returns {Promise} 获取结果的Promise对象，包含所有标签信息
   */
  getAllTags() {
    return visionAIAxios.get('/api/v1/cameras/tags/list');
  },

  /**
   * 更新摄像头信息
   * @param {string|number} cameraId - 摄像头ID
   * @param {Object} cameraData - 要更新的摄像头数据，只需提供需要更新的字段
   * @returns {Promise} 更新结果的Promise对象，包含更新后的摄像头信息和操作结果
   */
  updateCamera(cameraId, cameraData) {
    if (!cameraId) {
      console.error('更新摄像头失败: 缺少摄像头ID');
      return Promise.reject(new Error('缺少摄像头ID'));
    }

    return visionAIAxios.put(`/api/v1/cameras/${cameraId}`, cameraData);
  },

  /**
   * 添加新摄像头到AI平台
   * @param {Object} cameraData - 摄像头数据，包含必要的设备标识信息
   * @param {string} cameraData.name - 摄像头名称
   * @param {string} cameraData.location - 摄像头位置
   * @param {boolean} cameraData.status - 摄像头状态
   * @param {Array} cameraData.tags - 摄像头标签
   * @param {string} cameraData.camera_type - 摄像头类型，支持 'gb28181'、'proxy_stream'、'push_stream'
   * @param {string} [cameraData.deviceId] - GB28181设备的国标编号，camera_type为'gb28181'时必填
   * @param {string} [cameraData.channelId] - GB28181设备的通道编号，camera_type为'gb28181'时必填
   * @param {string} [cameraData.gb_id] - GB28181设备的国标编号，通常与deviceId相同
   * @param {string} [cameraData.app] - 代理流或推流设备的应用名，camera_type为'proxy_stream'或'push_stream'时必填
   * @param {string} [cameraData.stream] - 代理流或推流设备的流ID，camera_type为'proxy_stream'或'push_stream'时必填
   * @param {string} [cameraData.proxy_id] - 代理流设备的代理ID，camera_type为'proxy_stream'时必填
   * @param {string} [cameraData.push_id] - 推流设备的推流ID，camera_type为'push_stream'时必填
   * @returns {Promise} 添加结果的Promise对象
   * 返回数据格式:
   * {
   *   "success": true,
   *   "camera": {
   *     "id": "51",
   *     "camera_uuid": "c9411735-6f64-4217-b865-c45d6d58d820",
   *     "name": "前门摄像头",
   *     "location": "大楼前门",
   *     "tags": [],
   *     "status": true,
   *     "camera_type": "gb28181",
   *     "skill_names": [],
   *     "deviceId": "34020000001320000001",
   *     "channelId": "34020000001320000001",
   *     "gb_id": "34020000001320000001",
   *     "app": null,
   *     "stream": null,
   *     "proxy_id": null,
   *     "push_id": null
   *   },
   *   "message": null
   * }
   */
  addCameraToAI(cameraData) {
    if (!cameraData) {
      console.error('添加摄像头失败: 缺少摄像头数据');
      return Promise.reject(new Error('缺少摄像头数据'));
    }

    // 创建请求数据的副本，避免修改原始对象
    const requestData = { ...cameraData };
    
    // 确保基本字段存在且有效
    requestData.name = requestData.name || '';
    requestData.location = requestData.location || '';
    requestData.status = requestData.status !== false; // 默认为true
    requestData.tags = Array.isArray(requestData.tags) ? requestData.tags : [];
    
    // 默认值填充
    requestData.app = requestData.app || '';
    requestData.stream = requestData.stream || '';
    requestData.deviceId = requestData.deviceId || '';
    requestData.channelId = requestData.channelId || ''; // 确保channelId字段存在
    requestData.gb_id = requestData.gb_id || '';
    requestData.proxy_id = requestData.proxy_id || '';
    requestData.push_id = requestData.push_id || '';
    requestData.camera_uuid = requestData.camera_uuid || '';

    // 验证必填字段
    if (!requestData.name || !requestData.camera_type) {
      console.error('添加摄像头失败: 缺少必填字段(name或camera_type)');
      return Promise.reject(new Error('缺少必填字段(name或camera_type)'));
    }

    // 确保所有ID字段都是字符串类型
    Object.keys(requestData).forEach(key => {
      if (key.includes('id') || key.includes('Id') || key === 'camera_uuid') {
        if (requestData[key] !== null && requestData[key] !== undefined && typeof requestData[key] !== 'string') {
          requestData[key] = String(requestData[key]);
        }
      }
    });

    // 根据不同的摄像头类型验证和处理对应的必填字段
    switch (requestData.camera_type) {
      case 'gb28181':
        if (!requestData.deviceId) {
          console.error('添加GB28181摄像头失败: 缺少deviceId字段');
          return Promise.reject(new Error('添加GB28181摄像头失败: 缺少deviceId字段'));
        }
        
        // 确保gb_id字段存在
        requestData.gb_id = requestData.gb_id || requestData.deviceId;
        
        // 确保channelId字段存在，如果不存在，使用deviceId作为默认值
        requestData.channelId = requestData.channelId || requestData.deviceId;
        break;
        
      case 'proxy_stream':
        // 确保app和stream字段存在且非null
        requestData.app = requestData.app || 'live';
        if (requestData.app === null) requestData.app = 'live';
        
        if (!requestData.stream || requestData.stream === null) {
          requestData.stream = `stream_${Date.now()}`;
          console.log('自动生成stream值:', requestData.stream);
        }
        
        if (!requestData.proxy_id) {
          console.error('添加代理流摄像头失败: 缺少proxy_id字段');
          return Promise.reject(new Error('添加代理流摄像头失败: 缺少proxy_id字段'));
        }
        break;
        
      case 'push_stream':
        // 确保app和stream字段存在且非null
        requestData.app = requestData.app || 'live';
        if (requestData.app === null) requestData.app = 'live';
        
        if (!requestData.stream || requestData.stream === null) {
          requestData.stream = `stream_${Date.now()}`;
          console.log('自动生成stream值:', requestData.stream);
        }
        
        if (!requestData.push_id) {
          console.error('添加推流摄像头失败: 缺少push_id字段');
          return Promise.reject(new Error('添加推流摄像头失败: 缺少push_id字段'));
        }
        break;
        
      default:
        console.error(`添加摄像头失败: 不支持的摄像头类型 ${requestData.camera_type}`);
        return Promise.reject(new Error(`不支持的摄像头类型 ${requestData.camera_type}`));
    }

    console.log('发送到API的数据:', requestData);

    // 最后一次确保关键字段不为null或undefined
    ['app', 'stream', 'proxy_id', 'push_id'].forEach(key => {
      if (requestData[key] === null || requestData[key] === undefined) {
        if (key === 'app') {
          requestData[key] = 'live';
        } else if (key === 'stream') {
          requestData[key] = `stream_${Date.now()}`;
        } else if (requestData.camera_type === 'proxy_stream' && key === 'proxy_id') {
          requestData[key] = requestData.camera_uuid || '';
        } else if (requestData.camera_type === 'push_stream' && key === 'push_id') {
          requestData[key] = requestData.camera_uuid || '';
        }
      }
    });
    
    return visionAIAxios.post('/api/v1/cameras', requestData);
  },

  /**
   * 添加新摄像头（旧API，保留兼容性）
   * @param {Object} cameraData - 摄像头数据
   * @returns {Promise} 添加结果的Promise对象
   */
  addCamera(cameraData) {
    if (!cameraData) {
      console.error('添加摄像头失败: 缺少摄像头数据');
      return Promise.reject(new Error('缺少摄像头数据'));
    }

    return visionAIAxios.post('/api/v1/cameras/ai', cameraData);
  },

  /**
   * 删除摄像头
   * @param {string|number} cameraId - 摄像头ID
   * @returns {Promise} 删除结果的Promise对象，包含成功状态和消息
   */
  deleteCamera(cameraId) {
    if (!cameraId) {
      console.error('删除摄像头失败: 缺少摄像头ID');
      return Promise.reject(new Error('缺少摄像头ID'));
    }

    // 确保cameraId是字符串类型
    if (typeof cameraId !== 'string') {
      cameraId = String(cameraId);
    }

    // 打印删除请求信息，帮助调试
    console.log(`删除摄像头: 正在发送请求删除ID为 ${cameraId} 的摄像头`);
    
    return visionAIAxios.delete(`/api/v1/cameras/${cameraId}`)
      .then(response => {
        // 打印原始响应，帮助调试
        console.log(`删除摄像头 ${cameraId} 响应:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`删除摄像头 ${cameraId} 错误:`, error);
        
        // 增强错误信息
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误响应数据:', error.response.data);
          
          // 如果有具体错误信息，附加到错误对象
          if (error.response.data && (error.response.data.message || error.response.data.error)) {
            error.detailedMessage = error.response.data.message || error.response.data.error;
          }
        }
        
        throw error;
      });
  },

  /**
   * 创建新标签
   * @param {Object} tagData - 标签数据
   * @param {string} tagData.name - 标签名称(必填)
   * @param {string} [tagData.description] - 标签描述(可选)
   * @returns {Promise} 创建结果的Promise对象，包含新创建的标签信息
   */
  createTag(tagData) {
    if (!tagData || !tagData.name) {
      console.error('创建标签失败: 缺少标签名称');
      return Promise.reject(new Error('缺少标签名称'));
    }

    return visionAIAxios.post('/api/v1/cameras/tags', tagData);
  },

  /**
   * 批量删除摄像头
   * @param {Array<number|string>} cameraIds - 摄像头ID列表
   * @returns {Promise} 删除结果的Promise对象，包含成功和失败的ID列表
   * 返回数据格式:
   * {
   *   "success": boolean,
   *   "message": string,
   *   "success_ids": Array<number>,
   *   "failed_ids": Array<number>,
   *   "total": number,
   *   "success_count": number,
   *   "failed_count": number
   * }
   */
  batchDeleteCameras(cameraIds) {
    if (!cameraIds || !Array.isArray(cameraIds) || cameraIds.length === 0) {
      console.error('批量删除摄像头失败: 缺少有效的摄像头ID列表');
      return Promise.reject(new Error('缺少有效的摄像头ID列表'));
    }

    // 打印请求信息，帮助调试
    console.log(`批量删除摄像头: 正在发送请求删除 ${cameraIds.length} 个摄像头`, cameraIds);
    
    return visionAIAxios.post('/api/v1/cameras/batch-delete', { camera_ids: cameraIds })
      .then(response => {
        // 打印原始响应，帮助调试
        console.log(`批量删除摄像头响应:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`批量删除摄像头错误:`, error);
        
        // 增强错误信息
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误响应数据:', error.response.data);
          
          // 如果有具体错误信息，附加到错误对象
          if (error.response.data && (error.response.data.message || error.response.data.error)) {
            error.detailedMessage = error.response.data.message || error.response.data.error;
          }
        }
        
        throw error;
      });
  },

  /**
   * 更新标签
   * @param {string|number} tagId - 标签ID
   * @param {Object} tagData - 标签数据
   * @param {string} tagData.name - 标签名称
   * @param {string} [tagData.description] - 标签描述
   * @returns {Promise} 更新结果的Promise对象，包含更新后的标签信息
   */
  updateTag(tagId, tagData) {
    if (!tagId) {
      console.error('更新标签失败: 缺少标签ID');
      return Promise.reject(new Error('缺少标签ID'));
    }

    if (!tagData || !tagData.name) {
      console.error('更新标签失败: 缺少标签名称');
      return Promise.reject(new Error('缺少标签名称'));
    }

    return visionAIAxios.put(`/api/v1/cameras/tags/${tagId}`, tagData);
  },

  /**
   * 删除标签
   * @param {string|number} tagId - 标签ID
   * @returns {Promise} 删除结果的Promise对象，包含成功状态和消息
   */
  deleteTag(tagId) {
    if (!tagId) {
      console.error('删除标签失败: 缺少标签ID');
      return Promise.reject(new Error('缺少标签ID'));
    }

    return visionAIAxios.delete(`/api/v1/cameras/tags/${tagId}`);
  },

  /**
   * 获取单个AI摄像头信息
   * @param {string} cameraId 摄像头ID
   * @returns {Promise} 返回包含摄像头详细信息的响应
   */
  getCameraDetail(cameraId) {
    return visionAIAxios.get(`/api/v1/cameras/${cameraId}`);
  }
};

export default {
  modelAPI,
  skillAPI,
  cameraAPI
}; 
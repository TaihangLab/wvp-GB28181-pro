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
    const isSpecialApi =  /\/api\/v1\/cameras\/\d+$/.test(response.config.url) || // 匹配摄像头详情接口
                         /\/api\/v1\/ai-tasks\/camera\/id\/\d+$/.test(response.config.url) || // 匹配摄像头关联任务接口
                         /\/api\/v1\/ai-tasks\/\d+$/.test(response.config.url); // 匹配AI任务详情接口
      

      
    if (isSpecialApi) {
      console.log('特殊API接口返回原始数据:', response.config.method, response.config.url);
      
    
      
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

    // 检查是否为摄像头列表数据（获取AI摄像头列表接口）
    if (response.config.url.includes('/api/v1/cameras/ai/list')) {
      // 适配不同的数据结构
      if (originalData && originalData.cameras) {
        // 直接包含cameras字段的情况
        transformedData.data = originalData.cameras.map(camera => {
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
      // 处理嵌套格式 {data: {cameras: [...], total: n}}
      else if (originalData && originalData.data && originalData.data.cameras) {
        transformedData.data = originalData.data.cameras.map(camera => {
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
        transformedData.total = originalData.data.total || transformedData.data.length;
        
        // 添加分页信息
        if (originalData.data.page) transformedData.page = originalData.data.page;
        if (originalData.data.limit) transformedData.limit = originalData.data.limit;
        if (originalData.data.pages) transformedData.pages = originalData.data.pages;
      }
      else {
        console.error('无法解析摄像头列表数据格式:', originalData);
        // 使用空数组
        transformedData.data = [];
        transformedData.total = 0;
      }
    }

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


  // 获取AI任务技能详情
  getAITaskSkillDetail(skillClassId) {
    return visionAIAxios.get(`/api/v1/ai-tasks/skill-classes/${skillClassId}`);
  },

  // 获取AI任务详情
  getAITaskDetail(taskId) {
    if (!taskId) {
      console.error('获取AI任务详情失败: 缺少任务ID');
      return Promise.reject(new Error('缺少任务ID'));
    }
    return visionAIAxios.get(`/api/v1/ai-tasks/${taskId}`);
  },

  // 更新AI任务
  updateAITask(taskId, taskData) {
    if (!taskId) {
      console.error('更新AI任务失败: 缺少任务ID');
      return Promise.reject(new Error('缺少任务ID'));
    }
    console.log('更新AI任务请求数据:', taskData);
    return visionAIAxios.put(`/api/v1/ai-tasks/${taskId}`, taskData);
  },

  // 删除AI任务
  deleteAITask(taskId) {
    if (!taskId) {
      console.error('删除AI任务失败: 缺少任务ID');
      return Promise.reject(new Error('缺少任务ID'));
    }
    console.log('删除AI任务:', taskId);
    return visionAIAxios.delete(`/api/v1/ai-tasks/${taskId}`);
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
   * 获取单个AI摄像头信息
   * @param {string} cameraId 摄像头ID
   * @returns {Promise} 返回包含摄像头详细信息的响应
   */
  getCameraDetail(cameraId) {
    return visionAIAxios.get(`/api/v1/cameras/${cameraId}`);
  },

  /**
   * 更新摄像头信息
   * @param {string|number} cameraId 摄像头ID
   * @param {Object} updateData 需要更新的摄像头数据
   * @returns {Promise} 包含更新结果的Promise对象
   */
  updateCamera(cameraId, updateData) {
    if (!cameraId) {
      console.error('更新摄像头失败: 缺少摄像头ID');
      return Promise.reject(new Error('缺少摄像头ID'));
    }

    console.log('更新摄像头数据:', cameraId, updateData);
    
    return visionAIAxios.put(`/api/v1/cameras/${cameraId}`, updateData);
  },
  
  /**
   * 获取摄像头关联的AI任务
   * @param {string|number} cameraId 摄像头ID
   * @returns {Promise} 包含摄像头关联的AI任务列表的Promise对象
   */
  getCameraAITasks(cameraId) {
    if (!cameraId) {
      console.error('获取摄像头关联任务失败: 缺少摄像头ID');
      return Promise.reject(new Error('缺少摄像头ID'));
    }
    
    return visionAIAxios.get(`/api/v1/ai-tasks/camera/id/${cameraId}`);
  }
};

export default {
  modelAPI,
  skillAPI,
  cameraAPI
}; 
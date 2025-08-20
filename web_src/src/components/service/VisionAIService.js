import axios from 'axios';

// 创建专用于visionAI模块的axios实例
const visionAIAxios = axios.create({
  baseURL: 'http://192.168.26.213:8000',
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

// 添加响应拦截器（只处理认证等通用错误）
visionAIAxios.interceptors.response.use(
  response => {
    // 直接返回原始响应，不进行任何数据转换
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

// 通用响应处理函数
const handleSimpleResponse = (response, apiName) => {
  const originalData = response.data;
  
  // 如果已经是期望的格式，直接返回
  if (originalData && originalData.code !== undefined) {
    return response;
  }

  // 转换为前端期望的格式
  const transformedData = {
    code: 0, // 成功状态码
    msg: 'success',
    data: {},
    total: 0
  };

  // 检查是否为通用操作响应
  if (originalData && originalData.success !== undefined) {
    transformedData.code = originalData.success ? 0 : -1;
    transformedData.msg = originalData.message || (originalData.success ? 'success' : 'failed');
    transformedData.data = originalData;
  } else {
    // 保持原数据
    transformedData.data = originalData;
  }

  // 替换原始响应数据
  response.data = transformedData;
  
  console.log(`${apiName}响应转换完成:`, response.data);
  return response;
};

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

    return visionAIAxios.get('/api/v1/models/list', { params: apiParams })
      .then(response => {
        // 单独处理模型列表接口的响应数据转换
        const originalData = response.data;
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
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
        } else {
          // 如果没有models字段，保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('模型列表响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取模型列表失败:', error);
        throw error;
      });
  },

  // 获取模型详情
  getModelDetail(modelId) {
    return visionAIAxios.get(`/api/v1/models/${modelId}`)
      .then(response => {
        // 单独处理模型详情接口的响应数据转换
        const originalData = response.data;
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: {},
          total: 0
        };

        // 检查是否为单个模型详情
        if (originalData && originalData.model) {
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
        } else {
          // 如果没有model字段，保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('模型详情响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取模型详情失败:', error);
        throw error;
      });
  },

  // 更新模型信息
  updateModel(modelId, modelData) {
    return visionAIAxios.put(`/api/v1/models/${modelId}`, modelData)
      .then(response => handleSimpleResponse(response, '更新模型'))
      .catch(error => {
        console.error('更新模型失败:', error);
        throw error;
      });
  },

  // 删除模型
  deleteModel(modelId) {
    return visionAIAxios.delete(`/api/v1/models/${modelId}`)
      .then(response => handleSimpleResponse(response, '删除模型'))
      .catch(error => {
        console.error('删除模型失败:', error);
        throw error;
      });
  },

  // 批量删除模型
  batchDeleteModels(ids) {
    return visionAIAxios.delete('/api/v1/models/batch-delete', { data: { model_ids: ids } })
      .then(response => {
        // 单独处理批量删除模型接口的响应数据转换
        const originalData = response.data;
        
        // 如果是批量删除模型的响应（包含detail字段），直接返回不进行转换
        if (originalData && originalData.detail && originalData.success !== undefined) {
          return response;
        }
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: {},
          total: 0
        };

        // 检查是否为通用操作响应
        if (originalData && originalData.success !== undefined) {
          transformedData.code = originalData.success ? 0 : -1;
          transformedData.msg = originalData.message || (originalData.success ? 'success' : 'failed');
          transformedData.data = originalData;
        } else {
          // 保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('批量删除模型响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('批量删除模型失败:', error);
        throw error;
      });
  },

  // 加载模型
  loadModel(modelId) {
    return visionAIAxios.post(`/api/v1/models/${modelId}/load`)
      .then(response => handleSimpleResponse(response, '加载模型'))
      .catch(error => {
        console.error('加载模型失败:', error);
        throw error;
      });
  },

  // 卸载模型
  unloadModel(modelId) {
    return visionAIAxios.post(`/api/v1/models/${modelId}/unload`)
      .then(response => handleSimpleResponse(response, '卸载模型'))
      .catch(error => {
        console.error('卸载模型失败:', error);
        throw error;
      });
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

    return visionAIAxios.get('/api/v1/skill-classes', { params: apiParams })
      .then(response => {
        // 单独处理技能列表接口的响应数据转换
        const originalData = response.data;
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: [], // 默认空数组
          total: 0  // 默认总数为0
        };

        // 检查是否包含技能列表数据
        if (originalData && originalData.skill_classes) {
          transformedData.data = originalData.skill_classes;
          transformedData.total = originalData.total || transformedData.data.length;

          // 添加分页信息
          if (originalData.page) transformedData.page = originalData.page;
          if (originalData.limit) transformedData.limit = originalData.limit;
          if (originalData.pages) transformedData.pages = originalData.pages;
        } else {
          // 如果没有skill_classes字段，保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('技能列表响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取技能列表失败:', error);
        throw error;
      });
  },

  // 热加载技能类
  reloadSkillClasses() {
    return visionAIAxios.post('/api/v1/skill-classes/reload')
      .then(response => handleSimpleResponse(response, '热加载技能类'))
      .catch(error => {
        console.error('热加载技能类失败:', error);
        throw error;
      });
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

    return visionAIAxios.get('/api/v1/ai-tasks/skill-classes', { params: apiParams })
      .then(response => {
        // 单独处理AI任务技能类列表接口的响应数据转换
        const originalData = response.data;
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: [], // 默认空数组
          total: 0  // 默认总数为0
        };

        // 检查是否包含技能列表数据
        if (originalData && originalData.skill_classes) {
          transformedData.data = originalData.skill_classes;
          transformedData.total = originalData.total || transformedData.data.length;

          // 添加分页信息
          if (originalData.page) transformedData.page = originalData.page;
          if (originalData.limit) transformedData.limit = originalData.limit;
          if (originalData.pages) transformedData.pages = originalData.pages;
        } else {
          // 如果没有skill_classes字段，保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('AI任务技能类列表响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取AI任务技能类列表失败:', error);
        throw error;
      });
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
    return visionAIAxios.post('/api/v1/ai-tasks', data)
      .then(response => handleSimpleResponse(response, '创建AI任务'))
      .catch(error => {
        console.error('创建AI任务失败:', error);
        throw error;
      });
  },

  // 获取技能详情
  getSkillDetail(skillClassId) {
    return visionAIAxios.get(`/api/v1/skill-classes/${skillClassId}`)
      .then(response => handleSimpleResponse(response, '获取技能详情'))
      .catch(error => {
        console.error('获取技能详情失败:', error);
        throw error;
      });
  },

  // 删除技能
  deleteSkill(skillClassId) {
    return visionAIAxios.delete(`/api/v1/skill-classes/${skillClassId}`)
      .then(response => handleSimpleResponse(response, '删除技能'))
      .catch(error => {
        console.error('删除技能失败:', error);
        throw error;
      });
  },

  // 批量删除技能
  batchDeleteSkills(ids) {
    return visionAIAxios.delete('/api/v1/skill-classes/batch-delete', { data: { skill_class_ids: ids } })
      .then(response => {
        // 单独处理批量删除技能接口的响应数据转换
        const originalData = response.data;
        
        // 如果是批量删除技能的响应（包含detail字段），直接返回不进行转换
        if (originalData && originalData.detail && originalData.success !== undefined) {
          return response;
        }
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: {},
          total: 0
        };

        // 检查是否为通用操作响应
        if (originalData && originalData.success !== undefined) {
          transformedData.code = originalData.success ? 0 : -1;
          transformedData.msg = originalData.message || (originalData.success ? 'success' : 'failed');
          transformedData.data = originalData;
        } else {
          // 保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('批量删除技能响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('批量删除技能失败:', error);
        throw error;
      });
  },

  // 导入技能
  importSkill(skillData) {
    return visionAIAxios.post('/api/v1/skill-classes', skillData)
      .then(response => handleSimpleResponse(response, '导入技能'))
      .catch(error => {
        console.error('导入技能失败:', error);
        throw error;
      });
  },

  // 更新技能
  updateSkill(skillClassId, skillData) {
    return visionAIAxios.put(`/api/v1/skill-classes/${skillClassId}`, skillData)
      .then(response => handleSimpleResponse(response, '更新技能'))
      .catch(error => {
        console.error('更新技能失败:', error);
        throw error;
      });
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
        return handleSimpleResponse(response, '上传技能图片');
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

    return visionAIAxios.get(`/api/v1/skill-classes/${skillClassId}/devices`)
      .then(response => handleSimpleResponse(response, '获取技能关联设备'))
      .catch(error => {
        console.error('获取技能关联设备失败:', error);
        throw error;
      });
  },


  // 获取AI任务技能详情
  getAITaskSkillDetail(skillClassId) {
    return visionAIAxios.get(`/api/v1/ai-tasks/skill-classes/${skillClassId}`)
      .then(response => handleSimpleResponse(response, '获取AI任务技能详情'))
      .catch(error => {
        console.error('获取AI任务技能详情失败:', error);
        throw error;
      });
  },

  // 获取AI任务详情
  getAITaskDetail(taskId) {
    if (!taskId) {
      console.error('获取AI任务详情失败: 缺少任务ID');
      return Promise.reject(new Error('缺少任务ID'));
    }
    return visionAIAxios.get(`/api/v1/ai-tasks/${taskId}`)
      .then(response => handleSimpleResponse(response, '获取AI任务详情'))
      .catch(error => {
        console.error('获取AI任务详情失败:', error);
        throw error;
      });
  },

  // 更新AI任务
  updateAITask(taskId, taskData) {
    if (!taskId) {
      console.error('更新AI任务失败: 缺少任务ID');
      return Promise.reject(new Error('缺少任务ID'));
    }
    console.log('更新AI任务请求数据:', taskData);
    return visionAIAxios.put(`/api/v1/ai-tasks/${taskId}`, taskData)
      .then(response => handleSimpleResponse(response, '更新AI任务'))
      .catch(error => {
        console.error('更新AI任务失败:', error);
        throw error;
      });
  },

  // 删除AI任务
  deleteAITask(taskId) {
    if (!taskId) {
      console.error('删除AI任务失败: 缺少任务ID');
      return Promise.reject(new Error('缺少任务ID'));
    }
    console.log('删除AI任务:', taskId);
    return visionAIAxios.delete(`/api/v1/ai-tasks/${taskId}`)
      .then(response => handleSimpleResponse(response, '删除AI任务'))
      .catch(error => {
        console.error('删除AI任务失败:', error);
        throw error;
      });
  },

  /**
   * 创建多模态大模型技能
   * @param {Object} skillData - 技能数据
   * @param {string} skillData.skill_name - 技能名称
   * @param {string} skillData.skill_id - 技能ID
   * @param {string} skillData.application_scenario - 应用场景 (video_analysis/image_processing)
   * @param {Array} skillData.skill_tags - 技能标签数组
   * @param {string} [skillData.skill_icon] - 技能图标MinIO对象名称
   * @param {string} skillData.skill_description - 技能描述
   * @param {string} skillData.prompt_template - 提示词模板
   * @param {Array} skillData.output_parameters - 输出参数配置
   * @param {Object} [skillData.alert_conditions] - 预警条件配置
   * @returns {Promise} 包含创建结果的Promise对象
   */
  createLlmSkill(skillData) {
    // 验证必要参数
    if (!skillData.skill_name || !skillData.skill_id) {
      console.error('创建多模态技能失败: 缺少必要参数', {
        skill_name: skillData.skill_name,
        skill_id: skillData.skill_id
      });
      return Promise.reject(new Error('缺少必要参数: 技能名称和技能ID必须提供'));
    }

    // 数据格式处理
    const data = {
      skill_name: skillData.skill_name,
      skill_id: skillData.skill_id,
      application_scenario: skillData.application_scenario || 'video_analysis',
      skill_tags: skillData.skill_tags || [],
      skill_icon: skillData.skill_icon || null,
      skill_description: skillData.skill_description || '',
      prompt_template: skillData.prompt_template || '',
      output_parameters: skillData.output_parameters || [],
      alert_conditions: skillData.alert_conditions || null
    };

    console.log('创建多模态大模型技能请求数据:', data);

    return visionAIAxios.post('/api/v1/llm-skills/skill-classes', data);
  },

  /**
   * 上传技能图标
   * @param {File} iconFile - 图标文件
   * @param {string} [skillId] - 技能ID（用于文件命名）
   * @returns {Promise} 包含上传结果的Promise对象
   */
  uploadLlmSkillIcon(iconFile, skillId = null) {
    if (!iconFile) {
      console.error('上传技能图标失败: 缺少图标文件');
      return Promise.reject(new Error('缺少图标文件'));
    }

    console.log('准备上传技能图标:', iconFile.name, iconFile.type, iconFile.size);

    // 创建FormData对象
    const formData = new FormData();
    formData.append('icon', iconFile);
    if (skillId) {
      formData.append('skill_id', skillId);
    }

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

    return visionAIAxios.post('/api/v1/llm-skills/upload/skill-icon', formData, config)
      .then(response => {
        console.log('技能图标上传成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('技能图标上传失败:', error);
        throw error;
      });
  },

  /**
   * 预览测试多模态技能
   * @param {File} testImage - 测试图片
   * @param {string} promptTemplate - 提示词模板
   * @param {string} [systemPrompt] - 系统提示词
   * @param {Array} [outputParameters] - 输出参数配置
   * @returns {Promise} 包含测试结果的Promise对象
   */
  previewTestLlmSkill(testImage, promptTemplate, systemPrompt = null, outputParameters = null) {
    if (!testImage || !promptTemplate) {
      console.error('预览测试技能失败: 缺少必要参数');
      return Promise.reject(new Error('缺少测试图片或提示词模板'));
    }

    console.log('准备预览测试技能:', testImage.name, promptTemplate);

    // 创建FormData对象
    const formData = new FormData();
    formData.append('test_image', testImage);
    formData.append('prompt_template', promptTemplate);
    
    if (systemPrompt) {
      formData.append('system_prompt', systemPrompt);
    }
    
    if (outputParameters && outputParameters.length > 0) {
      formData.append('output_parameters', JSON.stringify(outputParameters));
    }

    // 设置请求头
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000  // 为AI分析设置1分钟超时
    };

    return visionAIAxios.post('/api/v1/llm-skills/skill-classes/preview-test', formData, config)
      .then(response => {
        console.log('技能预览测试成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('技能预览测试失败:', error);
        throw error;
      });
  },



  /**
   * 获取多模态LLM技能列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码，从1开始
   * @param {number} [params.limit=10] - 每页记录数，最大100条
   * @param {string} [params.type_filter] - 技能类型过滤（如：multimodal_llm等）
   * @param {boolean} [params.status] - 状态过滤（true-启用，false-禁用）
   * @param {string} [params.name] - 按技能名称搜索（模糊匹配）
   * @returns {Promise} 包含技能列表的Promise对象
   */
  getLlmSkillList(params = {}) {
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

    console.log('获取多模态技能列表API调用参数:', apiParams);

    return visionAIAxios.get('/api/v1/llm-skills/skill-classes', { params: apiParams })
      .then(response => {
        console.log('获取多模态技能列表成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取多模态技能列表失败:', error);
        throw error;
      });
  },

  /**
   * 获取多模态LLM技能详情
   * @param {string} skillId - 技能业务ID
   * @returns {Promise} 包含技能详细信息的Promise对象
   */
  getLlmSkillDetail(skillId) {
    if (!skillId) {
      console.error('获取技能详情失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('获取多模态技能详情, skill_id:', skillId);

    return visionAIAxios.get(`/api/v1/llm-skills/skill-classes/${skillId}`)
      .then(response => {
        console.log('获取多模态技能详情成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取多模态技能详情失败:', error);
        throw error;
      });
  },

  /**
   * 更新多模态技能
   * @param {string} skillId - 技能业务ID
   * @param {Object} skillData - 技能数据
   * @returns {Promise} 包含更新结果的Promise对象
   */
  updateLlmSkill(skillId, skillData) {
    if (!skillId) {
      console.error('更新多模态技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('更新多模态技能, skill_id:', skillId, '数据:', skillData);

    return visionAIAxios.put(`/api/v1/llm-skills/skill-classes/${skillId}`, skillData)
      .then(response => {
        console.log('更新多模态技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('更新多模态技能失败:', error);
        throw error;
      });
  },

  /**
   * 发布多模态技能
   * @param {string} skillId - 技能业务ID
   * @returns {Promise} 包含发布结果的Promise对象
   */
  publishLlmSkill(skillId) {
    if (!skillId) {
      console.error('发布多模态技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('发布多模态技能, skill_id:', skillId);

    return visionAIAxios.post(`/api/v1/llm-skills/skill-classes/${skillId}/publish`)
      .then(response => {
        console.log('发布多模态技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('发布多模态技能失败:', error);
        throw error;
      });
  },

  /**
   * 下架多模态技能
   * @param {string} skillId - 技能业务ID
   * @returns {Promise} 包含下架结果的Promise对象
   */
  unpublishLlmSkill(skillId) {
    if (!skillId) {
      console.error('下架多模态技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('下架多模态技能, skill_id:', skillId);

    return visionAIAxios.post(`/api/v1/llm-skills/skill-classes/${skillId}/unpublish`)
      .then(response => {
        console.log('下架多模态技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('下架多模态技能失败:', error);
        throw error;
      });
  },

  /**
   * 删除单个多模态技能
   * @param {string} skillId - 技能业务ID
   * @returns {Promise} 包含删除结果的Promise对象
   */
  deleteLlmSkill(skillId) {
    if (!skillId) {
      console.error('删除多模态技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('删除多模态技能, skill_id:', skillId);

    return visionAIAxios.delete(`/api/v1/llm-skills/skill-classes/${skillId}`)
      .then(response => {
        console.log('删除多模态技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('删除多模态技能失败:', error);
        throw error;
      });
  },

  /**
   * 批量删除多模态技能
   * @param {Array} skillIds - 技能业务ID数组
   * @returns {Promise} 包含删除结果的Promise对象
   */
  batchDeleteLlmSkills(skillIds) {
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      console.error('批量删除多模态技能失败: 缺少技能ID数组');
      return Promise.reject(new Error('缺少技能ID数组'));
    }

    console.log('批量删除多模态技能, skill_ids:', skillIds);

    return visionAIAxios.post('/api/v1/llm-skills/skill-classes/batch-delete', skillIds)
      .then(response => {
        console.log('批量删除多模态技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('批量删除多模态技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '批量删除复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
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

    console.log('获取摄像头列表 - API调用参数:', apiParams);

    return visionAIAxios.get('/api/v1/cameras/ai/list', { params: apiParams })
      .then(response => {
        // 单独处理摄像头列表接口的响应数据转换
        const originalData = response.data;
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: [], // 默认空数组
          total: 0  // 默认总数为0
        };

        // 检查是否为摄像头列表数据（获取AI摄像头列表接口）
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

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('摄像头列表响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取摄像头列表失败:', error);
        throw error;
      });
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

    return visionAIAxios.put(`/api/v1/cameras/${cameraId}`, updateData)
      .then(response => handleSimpleResponse(response, '更新摄像头'))
      .catch(error => {
        console.error('更新摄像头失败:', error);
        throw error;
      });
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

// 预警管理API
export const alertAPI = {
  /**
   * 获取实时预警列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码，从1开始
   * @param {number} [params.limit=10] - 每页记录数
   * @param {number} [params.camera_id] - 摄像头ID过滤
   * @param {string} [params.camera_name] - 摄像头名称过滤（模糊匹配）
   * @param {string} [params.alert_type] - 预警类型过滤
   * @param {number} [params.alert_level] - 预警等级过滤（1-4）
   * @param {string} [params.alert_name] - 预警名称过滤（模糊匹配）
   * @param {number} [params.task_id] - 任务ID过滤
   * @param {string} [params.location] - 位置过滤（模糊匹配）
   * @param {number} [params.status] - 状态过滤（1-待处理, 2-处理中, 3-已处理）
   * @param {string} [params.start_date] - 开始日期（YYYY-MM-DD）
   * @param {string} [params.end_date] - 结束日期（YYYY-MM-DD）
   * @param {string} [params.start_time] - 开始时间（HH:MM:SS）
   * @param {string} [params.end_time] - 结束时间（HH:MM:SS）
   * @returns {Promise} 包含预警列表的Promise对象
   */
  getRealTimeAlerts(params = {}) {
    // 处理查询和分页参数
    const apiParams = { ...params };

    // 处理分页参数
    if (!apiParams.page) {
      apiParams.page = 1; // 默认第1页
    }

    if (!apiParams.limit) {
      apiParams.limit = 10; // 默认每页10条
    }

    // 处理日期时间参数
    if (apiParams.startDate) {
      apiParams.start_date = apiParams.startDate;
      delete apiParams.startDate;
    }

    if (apiParams.endDate) {
      apiParams.end_date = apiParams.endDate;
      delete apiParams.endDate;
    }

    // 处理预警等级映射
    if (apiParams.warningLevel) {
      const levelMap = {
        'level1': 1,
        'level2': 2,
        'level3': 3,
        'level4': 4
      };
      apiParams.alert_level = levelMap[apiParams.warningLevel];
      delete apiParams.warningLevel;
    }

    // 处理预警类型映射
    if (apiParams.warningType) {
      const typeMap = {
        'safety_helmet': 'safety_helmet_detection',
        'safety_belt': 'safety_belt_detection',
        'protective_clothing': 'protective_clothing_detection',
        'unauthorized_personnel': 'personnel_intrusion_detection',
        'smoking': 'smoke_fire_detection',
        'high_altitude': 'high_altitude_work_detection'
      };
      apiParams.alert_type = typeMap[apiParams.warningType];
      delete apiParams.warningType;
    }

    // 处理技能类型映射
    if (apiParams.warningSkill) {
      apiParams.alert_type = apiParams.warningSkill;
      delete apiParams.warningSkill;
    }

    // 处理预警名称
    if (apiParams.warningName) {
      apiParams.alert_name = apiParams.warningName;
      delete apiParams.warningName;
    }

    // 处理状态映射
    if (apiParams.statusFilter) {
      const statusMap = {
        'pending': 1,
        'processing': 2,
        'completed': 3
      };
      apiParams.status = statusMap[apiParams.statusFilter];
      delete apiParams.statusFilter;
    }

    console.log('获取实时预警列表 - API调用参数:', apiParams);

    return visionAIAxios.get('/api/v1/alerts/real-time', { params: apiParams })
      .then(response => {
        // 单独处理实时预警接口的响应数据转换
        const originalData = response.data;
        
        // 如果已经是期望的格式，直接返回
        if (originalData && originalData.code !== undefined) {
          return response;
        }

        // 转换为前端期望的格式
        const transformedData = {
          code: 0, // 成功状态码
          msg: 'success',
          data: [], // 默认空数组
          total: 0  // 默认总数为0
        };

        // 检查是否包含预警列表数据（实时预警接口）
        if (originalData && originalData.alerts) {
          transformedData.data = originalData.alerts;
          transformedData.total = originalData.total || transformedData.data.length;

          // 添加分页信息
          if (originalData.page) transformedData.page = originalData.page;
          if (originalData.limit) transformedData.limit = originalData.limit;
          if (originalData.pages) transformedData.pages = originalData.pages;
          if (originalData.pagination) {
            transformedData.pagination = originalData.pagination;
          }
        } else {
          // 如果没有alerts字段，保持原数据
          transformedData.data = originalData;
        }

        // 替换原始响应数据
        response.data = transformedData;
        
        console.log('实时预警列表响应转换完成:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取实时预警列表失败:', error);
        throw error;
      });
  },

  /**
   * 更新预警状态
   * @param {number} alertId - 预警ID
   * @param {Object} updateData - 更新数据
   * @param {number} [updateData.status] - 状态（1-待处理, 2-处理中, 3-已处理）
   * @param {string} [updateData.processing_notes] - 处理备注
   * @param {string} [updateData.processed_by] - 处理人
   * @returns {Promise} 包含更新结果的Promise对象
   */
  updateAlertStatus(alertId, updateData) {
    if (!alertId) {
      console.error('更新预警状态失败: 缺少预警ID');
      return Promise.reject(new Error('缺少预警ID'));
    }

    console.log('更新预警状态:', alertId, updateData);

    return visionAIAxios.put(`/api/v1/alerts/${alertId}/status`, updateData);
  },

  /**
   * 批量更新预警状态
   * @param {Array} alertIds - 预警ID数组
   * @param {Object} updateData - 更新数据
   * @returns {Promise} 包含批量更新结果的Promise对象
   */
  batchUpdateAlertStatus(alertIds, updateData) {
    if (!alertIds || alertIds.length === 0) {
      console.error('批量更新预警状态失败: 缺少预警ID');
      return Promise.reject(new Error('缺少预警ID'));
    }

    console.log('批量更新预警状态:', alertIds, updateData);

    return visionAIAxios.put('/api/v1/alerts/batch-update', {
      alert_ids: alertIds,
      ...updateData
    });
  },

  /**
   * 删除预警
   * @param {number} alertId - 预警ID
   * @returns {Promise} 包含删除结果的Promise对象
   */
  deleteAlert(alertId) {
    if (!alertId) {
      console.error('删除预警失败: 缺少预警ID');
      return Promise.reject(new Error('缺少预警ID'));
    }

    console.log('删除预警:', alertId);

    return visionAIAxios.delete(`/api/v1/alerts/${alertId}`);
  },

  /**
   * 批量删除预警
   * @param {Array} alertIds - 预警ID数组
   * @returns {Promise} 包含批量删除结果的Promise对象
   */
  batchDeleteAlerts(alertIds) {
    if (!alertIds || alertIds.length === 0) {
      console.error('批量删除预警失败: 缺少预警ID');
      return Promise.reject(new Error('缺少预警ID'));
    }

    console.log('批量删除预警:', alertIds);

    return visionAIAxios.delete('/api/v1/alerts/batch-delete', {
      data: { alert_ids: alertIds }
    });
  },

  /**
   * 根据ID获取单个预警详情
   * @param {number|string} alertId - 预警ID
   * @returns {Promise} 包含完整的预警详情和处理流程信息的Promise对象
   */
  getAlertDetail(alertId) {
    if (!alertId) {
      console.error('获取预警详情失败: 缺少预警ID');
      return Promise.reject(new Error('缺少预警ID'));
    }

    console.log('获取预警详情:', alertId);

    return visionAIAxios.get(`/api/v1/alerts/${alertId}`);
  },

  /**
   * 创建SSE连接，监听实时预警推送
   * @param {Function} onMessage - 接收到消息时的回调函数
   * @param {Function} onError - 发生错误时的回调函数
   * @param {Function} onClose - 连接关闭时的回调函数
   * @returns {EventSource} SSE连接对象
   */
  createAlertSSEConnection(onMessage, onError, onClose) {
    const sseUrl = `${visionAIAxios.defaults.baseURL}/api/v1/alerts/stream`;
    console.log('创建SSE连接:', sseUrl);
    
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = function() {
      console.log('SSE连接已建立');
    };
    
    eventSource.onmessage = function(event) {
      console.log('收到SSE消息:', event.data);
      
      if (!event.data || event.data.trim() === '') {
        return;
      }
      
      try {
        let jsonData = event.data;
        
        // 如果消息包含 "data: " 前缀，去掉它
        if (jsonData.startsWith('data: ')) {
          jsonData = jsonData.substring(6);
        }
        
        const data = JSON.parse(jsonData);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('解析SSE消息失败:', error);
        if (onMessage) {
          onMessage({ raw: event.data });
        }
      }
    };
    
    eventSource.onerror = function(event) {
      console.log('SSE连接错误:', event);
      if (onError) {
        onError(event);
      }
    };
    
    // 添加关闭方法
    const originalClose = eventSource.close;
    eventSource.close = function() {
      console.log('关闭SSE连接');
      originalClose.call(eventSource);
      if (onClose) {
        onClose();
      }
    };
    
    return eventSource;
  },

  /**
   * 获取SSE连接状态
   * @returns {Promise} 包含SSE状态信息的Promise对象
   */
  getSSEStatus() {
    console.log('获取SSE连接状态');
    return visionAIAxios.get('/api/v1/alerts/sse/status');
  },

  /**
   * 获取当前连接的SSE客户端信息
   * @returns {Promise} 包含连接客户端信息的Promise对象
   */
  getConnectedClients() {
    console.log('获取连接客户端信息');
    return visionAIAxios.get('/api/v1/alerts/connected');
  },

  /**
   * 发送测试预警（仅供调试使用）
   * @returns {Promise} 包含测试结果的Promise对象
   */
  sendTestAlert() {
    console.log('发送测试预警');
    return visionAIAxios.post('/api/v1/alerts/test');
  },

  /**
   * 获取预警统计信息
   * @param {number} [days=7] - 统计天数
   * @returns {Promise} 包含统计信息的Promise对象
   */
  getAlertStatistics(days = 7) {
    console.log('获取预警统计信息，天数:', days);
    return visionAIAxios.get('/api/v1/alerts/statistics', { 
      params: { days } 
    });
  }
};

// 多模态复判技能API
export const reviewSkillAPI = {
  /**
   * 创建多模态复判技能
   * @param {Object} skillData - 技能数据
   * @param {string} skillData.skill_name - 技能名称
   * @param {Array} [skillData.skill_tags] - 技能标签数组
   * @param {string} skillData.description - 技能描述
   * @param {string} skillData.prompt_template - 用户提示词模板
   * @returns {Promise} 包含创建结果的Promise对象
   */
  createReviewSkill(skillData) {
    if (!skillData.skill_name || !skillData.description || !skillData.prompt_template) {
      console.error('创建复判技能失败: 缺少必要参数');
      return Promise.reject(new Error('缺少必要参数：技能名称、描述和提示词模板'));
    }

    console.log('创建多模态复判技能:', skillData);

    return visionAIAxios.post('/api/v1/llm-skill-review/review-skills', skillData)
      .then(response => {
        console.log('创建复判技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('创建复判技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '创建复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 预览测试复判技能
   * @param {File} testImage - 测试图片文件
   * @param {string} userPrompt - 用户提示词
   * @returns {Promise} 包含测试结果的Promise对象
   */
  previewTestReviewSkill(testImage, userPrompt) {
    if (!testImage || !userPrompt) {
      console.error('预览测试复判技能失败: 缺少测试图片或用户提示词');
      return Promise.reject(new Error('缺少测试图片或用户提示词'));
    }

    const formData = new FormData();
    formData.append('test_image', testImage);
    formData.append('user_prompt', userPrompt);

    console.log('预览测试复判技能:', { fileName: testImage.name, userPrompt });

    return visionAIAxios.post('/api/v1/llm-skill-review/review-skills/preview-test', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000  // 为AI分析设置1分钟超时
    })
      .then(response => {
        console.log('预览测试成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('预览测试失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '预览测试失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 更新复判技能
   * @param {string} skillId - 技能ID
   * @param {Object} updateData - 更新数据
   * @param {string} [updateData.skill_name] - 技能名称
   * @param {Array} [updateData.skill_tags] - 技能标签数组
   * @param {string} [updateData.description] - 技能描述
   * @param {string} [updateData.prompt_template] - 用户提示词模板
   * @returns {Promise} 包含更新结果的Promise对象
   */
  updateReviewSkill(skillId, updateData) {
    if (!skillId) {
      console.error('更新复判技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('更新复判技能:', skillId, updateData);

    return visionAIAxios.put(`/api/v1/llm-skill-review/review-skills/${skillId}`, updateData)
      .then(response => {
        console.log('更新复判技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('更新复判技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '更新复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 获取复判技能列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 当前页码，从1开始
   * @param {number} [params.limit=10] - 每页数量，1-100
   * @param {boolean} [params.status] - 技能状态过滤 (true=已上线, false=未上线)
   * @param {string} [params.name] - 技能名称搜索（模糊匹配）
   * @param {string} [params.tag] - 标签过滤，单个标签名称
   * @returns {Promise} 包含技能列表的Promise对象
   */
  getReviewSkillList(params = {}) {
    // 处理查询和分页参数
    const apiParams = { ...params };

    // 处理分页参数
    if (!apiParams.page) {
      apiParams.page = 1; // 默认第1页
    }

    if (!apiParams.limit) {
      apiParams.limit = 10; // 默认每页10条
    } else {
      apiParams.limit = Math.min(params.limit, 100); // 限制最大为100条
    }

    // 处理状态过滤参数
    if (apiParams.status !== undefined) {
      // 如果是字符串，转换为布尔值
      if (typeof apiParams.status === 'string') {
        if (apiParams.status === 'online') {
          apiParams.status = true;
        } else if (apiParams.status === 'offline') {
          apiParams.status = false;
        } else {
          // 其他情况删除该参数
          delete apiParams.status;
        }
      }
    }

    // 处理名称搜索参数
    if (apiParams.name && typeof apiParams.name === 'string') {
      apiParams.name = apiParams.name.trim();
      if (!apiParams.name) {
        delete apiParams.name;
      }
    }

    // 处理标签过滤参数
    if (apiParams.tag && typeof apiParams.tag === 'string') {
      apiParams.tag = apiParams.tag.trim();
      if (!apiParams.tag) {
        delete apiParams.tag;
      }
    }

    // 处理前端传递的其他参数名映射
    if (apiParams.searchKeyword) {
      apiParams.name = apiParams.searchKeyword;
      delete apiParams.searchKeyword;
    }

    if (apiParams.selectedCategory) {
      apiParams.tag = apiParams.selectedCategory;
      delete apiParams.selectedCategory;
    }

    if (apiParams.selectedProvider) {
      if (apiParams.selectedProvider === 'online') {
        apiParams.status = true;
      } else if (apiParams.selectedProvider === 'offline') {
        apiParams.status = false;
      }
      delete apiParams.selectedProvider;
    }

    console.log('获取复判技能列表, 处理后的参数:', apiParams);

    return visionAIAxios.get('/api/v1/llm-skill-review/review-skills', { params: apiParams })
      .then(response => {
        console.log('获取复判技能列表成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取复判技能列表失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '获取复判技能列表失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 获取复判技能详情
   * @param {string} skillId - 技能ID
   * @returns {Promise} 包含技能详情的Promise对象
   */
  getReviewSkillDetail(skillId) {
    if (!skillId) {
      console.error('获取复判技能详情失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('获取复判技能详情:', skillId);

    return visionAIAxios.get(`/api/v1/llm-skill-review/review-skills/${skillId}`)
      .then(response => {
        console.log('获取复判技能详情成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('获取复判技能详情失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '获取复判技能详情失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 发布复判技能（上线）
   * @param {string} skillId - 技能ID
   * @returns {Promise} 包含发布结果的Promise对象
   */
  publishReviewSkill(skillId) {
    if (!skillId) {
      console.error('发布复判技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('发布复判技能:', skillId);

    return visionAIAxios.post(`/api/v1/llm-skill-review/review-skills/${skillId}/publish`)
      .then(response => {
        console.log('发布复判技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('发布复判技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '发布复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 下线复判技能
   * @param {string} skillId - 技能ID
   * @returns {Promise} 包含下线结果的Promise对象
   */
  unpublishReviewSkill(skillId) {
    if (!skillId) {
      console.error('下线复判技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('下线复判技能:', skillId);

    return visionAIAxios.post(`/api/v1/llm-skill-review/review-skills/${skillId}/unpublish`)
      .then(response => {
        console.log('下线复判技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('下线复判技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '下线复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 删除复判技能
   * @param {string} skillId - 技能ID
   * @returns {Promise} 包含删除结果的Promise对象
   */
  deleteReviewSkill(skillId) {
    if (!skillId) {
      console.error('删除复判技能失败: 缺少技能ID');
      return Promise.reject(new Error('缺少技能ID'));
    }

    console.log('删除复判技能:', skillId);

    return visionAIAxios.delete(`/api/v1/llm-skill-review/review-skills/${skillId}`)
      .then(response => {
        console.log('删除复判技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('删除复判技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '删除复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  },

  /**
   * 批量删除复判技能
   * @param {Array} skillIds - 技能ID数组
   * @returns {Promise} 包含批量删除结果的Promise对象
   */
  batchDeleteReviewSkills(skillIds) {
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      console.error('批量删除复判技能失败: 缺少技能ID数组');
      return Promise.reject(new Error('缺少技能ID数组'));
    }

    if (skillIds.length > 50) {
      console.error('批量删除复判技能失败: 一次最多删除50个技能');
      return Promise.reject(new Error('一次最多删除50个技能'));
    }

    console.log('批量删除复判技能, skill_ids:', skillIds);

    return visionAIAxios.post('/api/v1/llm-skill-review/review-skills/batch-delete', skillIds)
      .then(response => {
        console.log('批量删除复判技能成功:', response.data);
        return response;
      })
      .catch(error => {
        console.error('批量删除复判技能失败:', error);
        // 提取后端返回的详细错误信息
        let errorMessage = '批量删除复判技能失败';
        if (error.response && error.response.data) {
          if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      });
  }
};

// ===== 聊天助手相关接口 =====
const chatAssistantAPI = {
  /**
   * 发送聊天消息
   * @param {Object} chatData 聊天数据
   * @param {string} chatData.message 用户消息内容
   * @param {string} [chatData.conversation_id] 会话ID（可选）
   * @param {string} [chatData.system_prompt] 系统提示词（可选）
   * @param {boolean} [chatData.stream=true] 是否流式响应
   * @param {number} [chatData.temperature] 温度参数（可选）
   * @param {number} [chatData.max_tokens] 最大token数（可选）
   * @param {number} [chatData.context_length=10] 上下文长度
   * @param {string} [chatData.model] 指定模型（可选）
   * @returns {Promise} axios响应
   */
  sendChatMessage(chatData) {
    console.log('发送聊天消息:', chatData);
    return visionAIAxios.post('/api/v1/chat/chat', {
      message: chatData.message,
      conversation_id: chatData.conversation_id || null,
      system_prompt: chatData.system_prompt || null,
      stream: chatData.stream !== false, // 默认为true
      temperature: chatData.temperature || null,
      max_tokens: chatData.max_tokens || null,
      context_length: chatData.context_length || 10,
      model: chatData.model || null
    });
  },

  /**
   * 创建流式聊天连接
   * @param {Object} chatData 聊天数据
   * @param {function} onMessage 接收消息回调
   * @param {function} onError 错误回调
   * @param {function} onComplete 完成回调
   * @returns {Promise<Object>} 包含abort方法的控制器对象
   */
  async createChatStream(chatData, onMessage, onError, onComplete) {
    try {
      console.log('创建流式聊天连接:', chatData);
      
      // 创建AbortController用于取消请求
      const abortController = new AbortController();
      
      // 构建JSON请求体（只传入必要的参数）
      const requestBody = {
        message: chatData.message,
        stream: true,
        system_prompt: chatData.system_prompt,
        conversation_id: chatData.conversation_id || null
      };

      // 发起POST请求（使用完整的chat端点）
      const response = await fetch(`${visionAIAxios.defaults.baseURL}/api/v1/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
          // 添加认证头（如果有）
          ...(localStorage.getItem('token') && {
            'access-token': localStorage.getItem('token')
          })
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }

      // 获取流式读取器
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      // 用于存储会话ID的变量
      let conversationId = chatData.conversation_id;

      // 创建返回的控制器对象
      const controller = {
        close: () => {
          abortController.abort();
          reader.cancel();
        }
      };

      // 开始读取流式数据
      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (onComplete) onComplete(fullResponse, conversationId);
              break;
            }

            // 解码数据块
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 处理完整的数据行
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后不完整的行

            for (const line of lines) {
              if (line.trim() === '') continue;
              
              if (line.startsWith('data: ')) {
                const data = line.slice(6); // 去掉 "data: " 前缀
                
                if (data === '[DONE]') {
                  if (onComplete) onComplete(fullResponse, conversationId);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  
                  // 提取会话ID（如果存在）
                  if (parsed.conversation_id && !conversationId) {
                    conversationId = parsed.conversation_id;
                    console.log('获取到新的会话ID:', conversationId);
                  }
                  
                  // 提取消息内容
                  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                    const content = parsed.choices[0].delta.content;
                    fullResponse += content;
                    if (onMessage) onMessage(content, fullResponse, conversationId);
                  }
                } catch (parseError) {
                  console.error('解析JSON数据错误:', parseError, 'data:', data);
                }
              }
            }
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('流式聊天请求被取消');
            return;
          }
          console.error('读取流式数据错误:', error);
          if (onError) onError(error);
        }
      };

      // 开始读取
      readStream();

      return controller;
      
    } catch (error) {
      console.error('创建流式聊天连接失败:', error);
      if (onError) onError(error);
      throw error;
    }
  },

  /**
   * 获取会话列表
   * @param {Object} params 查询参数
   * @param {number} [params.limit=20] 返回会话数量限制
   * @returns {Promise} axios响应
   */
  getChatConversations(params = {}) {
    console.log('获取会话列表:', params);
    return visionAIAxios.get('/api/v1/chat/conversations', { 
      params: {
        limit: params.limit || 20
      }
    });
  },

  /**
   * 获取会话消息
   * @param {string} conversationId 会话ID
   * @param {Object} params 查询参数
   * @param {number} [params.limit=50] 返回消息数量限制
   * @returns {Promise} axios响应
   */
  getChatMessages(conversationId, params = {}) {
    console.log('获取会话消息:', conversationId, params);
    return visionAIAxios.get(`/api/v1/chat/conversations/${conversationId}/messages`, {
      params: {
        limit: params.limit || 50
      }
    });
  },

  /**
   * 删除会话
   * @param {string} conversationId 会话ID
   * @returns {Promise} axios响应
   */
  deleteChatConversation(conversationId) {
    console.log('删除会话:', conversationId);
    return visionAIAxios.delete(`/api/v1/chat/conversations/${conversationId}`);
  },

  /**
   * 清空所有会话
   * @returns {Promise} axios响应
   */
  clearAllChatConversations() {
    console.log('清空所有会话');
    return visionAIAxios.delete('/api/v1/chat/conversations');
  },

  /**
   * 快速聊天（简化接口）
   * @param {Object} chatData 聊天数据
   * @param {string} chatData.message 用户消息内容
   * @param {boolean} [chatData.stream=false] 是否流式响应
   * @param {string} [chatData.system_prompt] 系统提示词（可选）
   * @returns {Promise} axios响应
   */
  quickChat(chatData) {
    console.log('快速聊天:', chatData);
    const formData = new FormData();
    formData.append('message', chatData.message);
    formData.append('stream', chatData.stream || false);
    if (chatData.system_prompt) {
      formData.append('system_prompt', chatData.system_prompt);
    }
    
    return visionAIAxios.post('/api/v1/chat/quick', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 获取可用模型列表
   * @returns {Promise} axios响应
   */
  getChatModels() {
    console.log('获取聊天模型列表');
    return visionAIAxios.get('/api/v1/chat/models');
  },

  /**
   * 健康检查
   * @returns {Promise} axios响应
   */
  checkChatHealth() {
    console.log('聊天助手健康检查');
    return visionAIAxios.get('/api/v1/chat/health');
  },

  // ==================== 分组管理 ====================
  
  /**
   * 创建分组
   * @param {string} name - 分组名称 
   * @returns {Promise}
   */
  createGroup(name) {
    const formData = new FormData();
    formData.append('name', name);
    
    return visionAIAxios.post('/api/v1/chat/groups', formData);
  },
  
  /**
   * 获取分组列表
   * @returns {Promise}
   */
  getGroups() {
    return visionAIAxios.get('/api/v1/chat/groups');
  },
  
  /**
   * 删除分组
   * @param {string} groupId - 分组ID
   * @returns {Promise} 
   */
  deleteGroup(groupId) {
    return visionAIAxios.delete(`/api/v1/chat/groups/${groupId}`);
  },
  
  /**
   * 更新会话分组
   * @param {string} conversationId - 会话ID
   * @param {string|null} groupId - 分组ID，null表示移动到无分组
   * @returns {Promise}
   */
  updateConversationGroup(conversationId, groupId) {
    const formData = new FormData();
    if (groupId) {
      formData.append('group_id', groupId);
    }
    
    return visionAIAxios.put(`/api/v1/chat/conversations/${conversationId}/group`, formData);
  },
  
  /**
   * 获取分组内的对话列表
   * @param {string} groupId - 分组ID
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getGroupConversations(groupId, params = {}) {
    return visionAIAxios.get(`/api/v1/chat/groups/${groupId}/conversations`, { params });
  },
  
  /**
   * 自动生成对话标题
   * @param {string} conversationId - 会话ID
   * @returns {Promise}
   */
  autoGenerateTitle(conversationId) {
    return visionAIAxios.post(`/api/v1/chat/conversations/${conversationId}/auto-title`);
  },
  
  /**
   * 更新会话标题
   * @param {string} conversationId - 会话ID
   * @param {string} title - 新的标题
   * @returns {Promise}
   */
  updateConversationTitle(conversationId, title) {
    const formData = new FormData();
    formData.append('title', title);
    return visionAIAxios.put(`/api/v1/chat/conversations/${conversationId}/title`, formData);
  },

  /**
   * 保存消息到会话（用于手动停止等场景）
   * @param {string} conversationId - 会话ID
   * @param {string} role - 消息角色：user、assistant、system
   * @param {string} content - 消息内容
   * @param {string} [messageId] - 消息ID（可选）
   * @returns {Promise}
   */
  saveMessageToConversation(conversationId, role, content, messageId = null) {
    const formData = new FormData();
    formData.append('role', role);
    formData.append('content', content);
    if (messageId) {
      formData.append('message_id', messageId);
    }
    
    return visionAIAxios.post(`/api/v1/chat/conversations/${conversationId}/save-message`, formData);
  },

  /**
   * 停止生成并保存部分内容（模仿Cursor的停止机制）
   * @param {string} conversationId - 会话ID
   * @param {string} messageId - 助手消息ID
   * @param {string} partialContent - 已生成的部分内容
   * @returns {Promise}
   */
  stopGeneration(conversationId, messageId, partialContent = '') {
    console.log('停止生成并保存:', conversationId, messageId, partialContent.length);
    const formData = new FormData();
    formData.append('message_id', messageId);
    formData.append('partial_content', partialContent);
    
    return visionAIAxios.post(`/api/v1/chat/conversations/${conversationId}/stop-generation`, formData);
  }
};

export default {
  modelAPI,
  skillAPI,
  cameraAPI,
  alertAPI,
  reviewSkillAPI,
  chatAssistantAPI
};

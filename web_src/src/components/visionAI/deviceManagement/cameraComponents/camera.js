import { cameraAPI, skillAPI } from '@/components/service/VisionAIService.js';
import TagEdit from '@/components/dialog/tagEdit';

export default {
  name: 'CameraManagement',
  components: {
    TagEdit
  },
  data() {
    return {
      // 设备树数据
      deviceTree: [
        {
          label: '电力行业',
          children: [
            { label: '监控设备1', status: 'online' },
            { label: '监控设备2', status: 'offline' }
          ]
        },
        {
          label: '油气行业',
          children: [
            { label: '摄像头01', status: 'online' },
            { label: '消防设备', status: 'offline' }
          ]
        }
      ],

      // 搜索关键词
      searchKeyword: '',

      // 标签搜索关键词
      tagSearchKeyword: '',
      
      // 当前选中的筛选标签
      currentFilteredTags: [], 

      // 标签匹配类型：全部(all)或任意(any)
      tagMatchType: 'all',

      // 设备列表数据
      deviceList: [],

      // 原始设备列表数据（用于搜索和刷新）
      originalDeviceList: [],

      // 添加设备对话框
      deviceDialogVisible: false,
      deviceForm: {
        name: '',
        type: '',
        cameraId: null, // 修改为null以确保元素正确绑定
        location: '',
        skills: [],
        tags: []
      },

      // 设备类型选项
      deviceTypes: [
        { label: '国标', value: 'gb28181' },
        { label: '推流', value: 'push' },
        { label: '拉流', value: 'pull' }
      ],

      // 摄像头数据列表
      cameras: [], // 改为空数组，将从API获取数据

      // 新增：国标设备列表相关数据
      gb28181Cameras: [],
      gb28181CamerasLoading: false,
      gb28181CamerasTotal: 0,
      gb28181CamerasPage: 1,
      gb28181CamerasPageSize: 20,
      gb28181CamerasQuery: '',
      
      // 新增：推流设备列表相关数据
      pushStreamCameras: [],
      pushStreamCamerasLoading: false,
      pushStreamCamerasTotal: 0,
      pushStreamCamerasPage: 1,
      pushStreamCamerasPageSize: 20,
      pushStreamCamerasQuery: '',
      
      // 新增：拉流设备列表相关数据
      proxyStreamCameras: [],
      proxyStreamCamerasLoading: false,
      proxyStreamCamerasTotal: 0,
      proxyStreamCamerasPage: 1,
      proxyStreamCamerasPageSize: 20,
      proxyStreamCamerasQuery: '',
      
      // 新增：选中的设备列表
      selectedDevices: [],

      // 添加分页相关的数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,

      // 配置技能对话框
      skillDialogVisible: false,
      skillForm: {
        selectedSkill: '',
        alarmLevel: '二级预警', // 默认预警等级
        status: true,
        timeRanges: [{
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        }],
        frequency: {
          seconds: 1,
          frames: 1
        },
        electronicFence: {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // 默认空白背景图
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        },
        images: []
      },

      // 新增：预警等级选项
      alarmLevelOptions: [
        { value: '一级预警', label: '一级预警', color: '#F56C6C' },
        { value: '二级预警', label: '二级预警', color: '#E6A23C' },
        { value: '三级预警', label: '三级预警', color: '#409EFF' },
        { value: '四级预警', label: '四级预警', color: '#67C23A' }
      ],

      // 可选技能列表 - 删除模拟数据，改为从API获取
      skillOptions: [],

      // 技能列表加载状态
      skillOptionsLoading: false,
      
      // 技能列表总数
      skillOptionsTotal: 0,

      // 当前正在配置的设备ID
      currentDeviceId: null,

      // 配置技能表单验证规则
      rules: {
        selectedSkill: [
          { required: true, message: '请选择技能', trigger: 'change' }
        ],
        alarmLevel: [
          { required: true, message: '请选择预警等级', trigger: 'change' }
        ],
        timeRanges: [
          { required: true, message: '请设置运行时段', trigger: 'change' }
        ],
        frequency: [
          { required: true, message: '请设置抽帧频率', trigger: 'change' }
        ]
      },

      // 拖动事件绑定引用
      boundDragPoint: null,
      boundStopDragPoint: null,

      // 新增：标签相关数据
      tagInputValue: '',
      deviceTags: [],

      // 新增：选择技能对话框
      skillSelectDialogVisible: false,
      skillSelectForm: {
        selectedSkills: [],
        selectedSkill: null // 新增单选字段
      },

      // 新增：当前选中的技能
      currentSkill: null,
      
      // 新增：新标签输入值
      // newTagValue: '',
      // newTagDetail: '',
      
      cameraTypeSpecificFields: {}, // 新增：类型特定字段
      
      // 新增：已选技能缓存
      selectedSkillCache: [],
      
      // 新增：标记是否是新选择的技能
      isNewSkillSelection: false,
      
      // 新增：标记是否显示左侧技能菜单
      showLeftSkillMenu: false,
      
      // 新增：所有标签列表
      allTags: [],
      
      // 可折叠面板激活的项
      activeCollapseNames: [], // 默认不展开
      
      // 添加编辑标签相关数据
      editTagDialogVisible: false,
      editTagForm: {
        id: null,
        name: '',
        description: ''
      },

      // 添加新标签对话框
      addTagDialogVisible: false,
      newTagForm: {
        name: '',
        description: ''
      },

      // 添加地点筛选相关数据
      currentLocationFilter: '',
      allLocations: [], // 存储所有的地点及其计数
      availableTagsCollapsed: false, 
      selectedTagsCollapsed: false, 

      skillDetailDialogVisible: false,
      skillDetailData: null,
    }
  },

  computed: {
    // 根据设备类型过滤摄像头选项
    filteredCameras() {
      if (this.deviceForm.type === 'gb28181') {
        return this.gb28181Cameras;
      } else if (this.deviceForm.type === 'push') {
        return this.pushStreamCameras;
      } else if (this.deviceForm.type === 'pull') {
        return this.proxyStreamCameras;
      } else {
        return [];
      }
    },

    // 过滤后的标签列表（根据搜索关键词）
    filteredTags() {
      // 过滤掉已经选中的标签
      return this.allTags.filter(tag => !this.currentFilteredTags.includes(tag.name));
    },

    // 唯一标签列表 (保留这个计算属性用于兼容性，但主要使用allTags显示)
    uniqueTags() {
      // 收集所有的标签对象
      const allTags = this.deviceList.flatMap(device => device.tags || []);
      
      // 创建一个映射来存储唯一的标签对象（按名称去重）
      const tagMap = new Map();
      
      allTags.forEach(tag => {
        // 如果标签是字符串类型，转换为对象
        const tagObj = typeof tag === 'string' 
          ? { name: tag, detail: '' } 
          : tag;
        
        // 只保留每个标签名称的第一个实例
        if (!tagMap.has(tagObj.name)) {
          tagMap.set(tagObj.name, tagObj);
        }
      });
      
      // 返回唯一标签对象的数组
      return Array.from(tagMap.values());
    },

    // 唯一地点列表
    uniqueLocations() {
      return this.allLocations;
    },
  },

  created() {
    // 获取摄像头列表
    this.fetchCameraList();
    
    // 获取所有标签列表
    this.fetchAllTags();
    
    // 获取所有地点数据
    this.fetchAllLocations();
    
    // 初始化拉流和推流摄像头模拟数据
    this.initMockCameras();
    
    // 初始化地点筛选为空（显示全部）
    this.currentLocationFilter = '';

    // 获取技能类列表
    this.fetchSkillClasses();
  },

  watch: {
    searchKeyword(newValue) {
      if (!newValue) {
        // 如果搜索关键词为空，重新获取摄像头列表数据
        this.fetchCameraList();
      } else {
        // 使用关键词搜索摄像头
        this.fetchCameraList({ name: newValue });
      }
    }
  },

  methods: {
    // 获取摄像头列表数据
    fetchCameraList(params = {}) {
      this.loading = true;
      
      // 合并查询参数
      const queryParams = {
        page: this.currentPage,
        limit: this.pageSize,
        ...params
      };
      
      // 如果搜索关键字匹配标签列表中的标签名称，将其作为标签过滤条件
      if (this.searchKeyword) {
        const matchingTag = this.uniqueTags.find(tag => tag.name === this.searchKeyword);
        if (matchingTag) {
          queryParams.tag = matchingTag.name;
        } else {
          queryParams.name = this.searchKeyword;
        }
      }
      
      // 如果有地点筛选，并且不是通过参数传入的（避免重复添加）
      if (this.currentLocationFilter && !params.location) {
        queryParams.location = this.currentLocationFilter;
      }

      // 在发送请求前，打印出请求参数用于调试
      console.log('发送API请求参数:', queryParams);
      
      cameraAPI.getCameraList(queryParams)
        .then(response => {
          if (response.data.code === 0) {
            console.log('API返回数据:', response.data);
            
            // 将获取的摄像头列表转换为前端所需的设备列表格式
            this.deviceList = response.data.data.map(camera => {
              return {
                id: camera.id,
                name: camera.name,
                status: camera.status ? 'online' : 'offline',
                location: camera.location,
                tags: camera.tags || [],
                skill: Array.isArray(camera.skill_names) ? camera.skill_names.join(', ') : '-',
                camera_type: camera.camera_type,
                config: this.buildConfigFromCamera(camera),
                camera_uuid: camera.camera_uuid,
                deviceId: camera.deviceId,
                gb_id: camera.gb_id
              };
            });
            
            // 保存原始数据，用于重置
            this.originalDeviceList = [...this.deviceList];
            
            // 更新总数和分页信息
            this.total = response.data.total || 0;
            
            // 如果筛选后没有数据，给用户提示
            if (this.deviceList.length === 0 && this.currentLocationFilter) {
              this.$message.info(`没有找到地点为"${this.currentLocationFilter}"的设备`);
            }
            
            // 检查当前页是否有数据，如果当前页没有数据且不是第一页，则回到前一页
            if (this.deviceList.length === 0 && this.currentPage > 1 && this.total > 0) {
              this.currentPage -= 1;
              // 重新获取上一页数据
              this.fetchCameraList();
            }
          } else {
            this.$message.error('获取摄像头列表失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('获取摄像头列表出错:', error);
          this.$message.error('获取摄像头列表失败：' + (error.message || '服务器错误'));
          
          // 如果获取失败，使用空数组
          this.deviceList = [];
          this.originalDeviceList = [];
          this.total = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    // 将摄像头数据转换为配置对象
    buildConfigFromCamera(camera) {
      // 如果不存在技能名称，返回null
      if (!camera.skill_names || camera.skill_names.length === 0) {
        return null;
      }
      
      // 构建配置对象
      const config = {};
      
      // 遍历技能名称，为每个技能创建配置
      camera.skill_names.forEach(skillName => {
        // 创建基本配置
        config[skillName] = {
          status: true, // 默认启用
          alarmLevel: camera.warning_level ? this.getAlarmLevelByValue(camera.warning_level) : '二级预警',
          timeRanges: this.parseRunningPeriod(camera.running_period),
          frequency: {
            seconds: camera.frame_rate || 1,
            frames: 1
          },
          electronicFence: this.parseElectronicFence(camera.electronic_fence)
        };
      });
      
      return config;
    },
    
    // 解析运行时段
    parseRunningPeriod(runningPeriodStr) {
      try {
        // 尝试解析JSON字符串
        const runningPeriod = typeof runningPeriodStr === 'string' ? 
          JSON.parse(runningPeriodStr) : runningPeriodStr;
        
        // 如果是有效对象且包含时间范围
        if (runningPeriod && Array.isArray(runningPeriod.times)) {
          return runningPeriod.times.map(time => ({
            start: new Date(`2024-01-01T${time.start}:00`),
            end: new Date(`2024-01-01T${time.end}:00`)
          }));
        }
      } catch (e) {
        console.error('解析运行时段失败:', e);
      }
      
      // 默认返回全天
      return [{
        start: new Date(2024, 0, 1, 0, 0),
        end: new Date(2024, 0, 1, 23, 59)
      }];
    },
    
    // 解析电子围栏
    parseElectronicFence(fenceStr) {
      try {
        // 尝试解析JSON字符串
        const fence = typeof fenceStr === 'string' ? 
          JSON.parse(fenceStr) : fenceStr;
        
        // 如果是有效对象且包含围栏数据
        if (fence && fence.image) {
          return {
            image: fence.image,
            points: fence.points || [],
            isDrawing: false,
            triggerMode: fence.triggerMode || 'inside',
            sensitivity: fence.sensitivity || 80,
            tempPoints: [],
            draggedPointIndex: -1,
            isDragging: false,
            currentPolygon: []
          };
        }
      } catch (e) {
        console.error('解析电子围栏失败:', e);
      }
      
      // 返回默认围栏配置
      return {
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        points: [],
        isDrawing: false,
        triggerMode: 'inside',
        sensitivity: 80,
        tempPoints: [],
        draggedPointIndex: -1,
        isDragging: false,
        currentPolygon: []
      };
    },
    
    // 根据预警等级值获取预警等级名称
    getAlarmLevelByValue(level) {
      const levelMap = {
        1: '一级预警',
        2: '二级预警',
        3: '三级预警',
        4: '四级预警'
      };
      return levelMap[level] || '二级预警';
    },
    
    // 格式化技能ID为显示名称
    formatSkillIds(skillIds) {
      if (!skillIds || skillIds.length === 0) {
        return '-';
      }
      
      // 这里可以从后端获取技能名称，暂时使用技能ID作为名称
      return skillIds.join(', ');
    },

    // 处理设备类型变化
    handleDeviceTypeChange(type) {
      // 重置已选摄像头
      this.deviceForm.cameraId = null;
      this.cameraTypeSpecificFields = {};
      
      // 根据设备类型加载对应的摄像头列表
      if (type === 'gb28181') {
        this.fetchGb28181Cameras();
      } else if (type === 'push') {
        this.fetchPushStreamCameras();
      } else if (type === 'pull') {
        this.fetchProxyStreamCameras();
      }
    },

    // 获取视觉AI平台中的国标设备列表
    fetchGb28181Cameras() {
      console.log('正在获取国标设备列表...');
      this.gb28181CamerasLoading = true;
      
      // 构建请求参数
      const params = {
        page: this.gb28181CamerasPage,
        count: this.gb28181CamerasPageSize
      };
      
      // 如果有查询条件，添加到请求参数中
      if (this.gb28181CamerasQuery) {
        params.query = this.gb28181CamerasQuery;
      }
      
      // 使用VisionAIService中的方法获取国标设备列表
      cameraAPI.getGb28181List(params)
        .then(response => {
          console.log('获取国标设备列表API响应:', response);
          
          let devicesList = [];
          
          // 1. 检查response.data.data是否存在（标准格式）
          if (response.data && response.data.code === 0 && response.data.data) {
            const responseData = response.data.data;
            
            // 检查是否为{devices:[...], total:n}格式
            if (responseData.devices && Array.isArray(responseData.devices)) {
              devicesList = responseData.devices;
              this.gb28181CamerasTotal = responseData.total || devicesList.length;
            } 
            // 检查是否直接为数组格式
            else if (Array.isArray(responseData)) {
              devicesList = responseData;
              this.gb28181CamerasTotal = devicesList.length;
            }
          } 
          // 2. 检查response.data是否直接是期望的格式
          else if (response.data) {
            // 检查是否为{devices:[...], total:n}格式
            if (response.data.devices && Array.isArray(response.data.devices)) {
              devicesList = response.data.devices;
              this.gb28181CamerasTotal = response.data.total || devicesList.length;
            } 
            // 检查是否直接为数组格式
            else if (Array.isArray(response.data)) {
              devicesList = response.data;
              this.gb28181CamerasTotal = devicesList.length;
            }
          }
          
          // 如果找到了设备列表，则处理它们
          if (devicesList.length > 0) {
            console.log('成功获取国标设备列表:', devicesList);
            
            // 更新国标设备列表
            this.gb28181Cameras = devicesList.map(device => {
              // 先打印出每个设备对象的结构，帮助调试
              console.log('处理设备对象:', device);
              
              return {
                id: device.deviceId || device.id || '', // 使用deviceId或id作为设备的唯一标识
                name: device.name || device.deviceId || device.id || '未命名设备', // 如果名称为空，使用设备ID或显示默认名
                type: 'gb28181',
                status: device.onLine === true || device.status === 'online' ? 'online' : 'offline',
                manufacturer: device.manufacturer || '-',
                model: device.model || '-',
                ip: device.ip || device.hostAddress || '-',
                original_data: device.original_data || device
              };
            });
            
            console.log('处理后的国标设备列表:', this.gb28181Cameras);
          } else {
            console.error('获取国标设备列表失败，无法解析返回的数据格式:', response.data);
            this.$message.error('获取国标设备列表失败，无法解析返回的数据格式');
            this.gb28181Cameras = [];
            this.gb28181CamerasTotal = 0;
          }
        })
        .catch(error => {
          console.error('获取国标设备列表出错:', error);
          this.$message.error('获取国标设备列表失败: ' + (error.message || '未知错误'));
          this.gb28181Cameras = [];
          this.gb28181CamerasTotal = 0;
        })
        .finally(() => {
          this.gb28181CamerasLoading = false;
        });
    },

    // 修改推流设备列表数据处理
    // 获取推流设备列表
    fetchPushStreamCameras() {
      console.log('正在获取推流设备列表...');
      this.pushStreamCamerasLoading = true;
      
      // 构建请求参数
      const params = {
        page: this.pushStreamCamerasPage,
        count: this.pushStreamCamerasPageSize
      };
      
      // 如果有查询条件，添加到请求参数中
      if (this.pushStreamCamerasQuery) {
        params.query = this.pushStreamCamerasQuery;
      }
      
      // 使用VisionAIService中的方法获取推流设备列表
      cameraAPI.getPushStreamList(params)
        .then(response => {
          console.log('获取推流设备列表API响应:', response);
          
          let devicesList = [];
          
          // 参照国标设备处理方式，完善数据格式处理
          // 1. 检查response.data.data是否存在（标准格式）
          if (response.data && response.data.code === 0 && response.data.data) {
            const responseData = response.data.data;
            
            // 2. 检查responseData.devices是否存在（设备列表）
            if (responseData.devices && Array.isArray(responseData.devices)) {
              devicesList = responseData.devices.map(device => {
                // 处理设备名称
                let deviceName = device.gbName || '未命名设备';
                
                // 如果设备本身没有名称，但原始数据中有，则使用原始数据中的名称
                if ((!deviceName || deviceName === '未命名设备') && device.original_data && device.original_data.gbName) {
                  deviceName = device.original_data.gbName;
                }
                
                // 处理推流状态
                let isPushing = device.pushing === true;
                // 对没有指定pushing字段的情况处理
                if (device.pushing === undefined && device.original_data && device.original_data.pushing !== undefined) {
                  isPushing = device.original_data.pushing === true;
                }
                
                return {
                  id: device.id,
                  deviceId: device.gbDeviceId || device.gbId || '',
                  name: deviceName,
                  app: device.app || '',
                  stream: device.stream || '',
                  status: device.status,
                  pushing: isPushing,
                  original_data: device.original_data || {}
                };
              });
              
              // 更新总记录数
              this.pushStreamCamerasTotal = responseData.total || devicesList.length;
            } else if (Array.isArray(responseData)) {
              // 直接是数组的情况
              devicesList = responseData.map(device => {
                return {
                  id: device.id,
                  deviceId: device.gbDeviceId || device.gbId || '',
                  name: device.gbName || '未命名设备',
                  app: device.app || '',
                  stream: device.stream || '',
                  status: device.status,
                  pushing: device.pushing === true,
                  original_data: device.original_data || {}
                };
              });
              
              // 更新总记录数
              this.pushStreamCamerasTotal = devicesList.length;
            }
          } else if (response.data && Array.isArray(response.data.devices)) {
            // 直接在根级别有devices数组
            devicesList = response.data.devices.map(device => {
              return {
                id: device.id,
                deviceId: device.gbDeviceId || device.gbId || '',
                name: device.gbName || '未命名设备',
                app: device.app || '',
                stream: device.stream || '',
                status: device.status,
                pushing: device.pushing === true,
                original_data: device.original_data || {}
              };
            });
            
            // 更新总记录数
            this.pushStreamCamerasTotal = response.data.total || devicesList.length;
          } else if (Array.isArray(response.data)) {
            // 响应直接是数组
            devicesList = response.data.map(device => {
              return {
                id: device.id,
                deviceId: device.gbDeviceId || device.gbId || '',
                name: device.gbName || '未命名设备',
                app: device.app || '',
                stream: device.stream || '',
                status: device.status,
                pushing: device.pushing === true,
                original_data: device.original_data || {}
              };
            });
            
            // 更新总记录数
            this.pushStreamCamerasTotal = devicesList.length;
          }
          
          // 更新设备列表
          this.pushStreamCameras = devicesList;
          console.log('处理后的推流设备列表:', this.pushStreamCameras);
        })
        .catch(error => {
          console.error('获取推流设备列表出错:', error);
          this.$message.error('获取推流设备列表失败: ' + (error.message || '未知错误'));
          this.pushStreamCameras = [];
          this.pushStreamCamerasTotal = 0;
        })
        .finally(() => {
          this.pushStreamCamerasLoading = false;
        });
    },

    // 获取拉流设备列表
    fetchProxyStreamCameras() {
      console.log('正在获取拉流设备列表...');
      this.proxyStreamCamerasLoading = true;
      
      // 构建请求参数
      const params = {
        page: this.proxyStreamCamerasPage,
        count: this.proxyStreamCamerasPageSize
      };
      
      // 如果有查询条件，添加到请求参数中
      if (this.proxyStreamCamerasQuery) {
        params.query = this.proxyStreamCamerasQuery;
      }
      
      // 使用VisionAIService中的方法获取拉流设备列表
      cameraAPI.getProxyStreamList(params)
        .then(response => {
          console.log('获取拉流设备列表API响应:', response);
          
          let devicesList = [];
          
          // 参照推流设备的数据处理逻辑
          // 1. 检查response.data.data是否存在（标准格式）
          if (response.data && response.data.code === 0 && response.data.data) {
            const responseData = response.data.data;
            
            // 2. 检查responseData.devices是否存在（设备列表）
            if (responseData.devices && Array.isArray(responseData.devices)) {
              devicesList = responseData.devices.map(device => {
                // 处理设备名称
                let deviceName = device.gbName || '未命名设备';
                
                // 如果设备本身没有名称，但原始数据中有，则使用原始数据中的名称
                if ((!deviceName || deviceName === '未命名设备') && device.original_data && device.original_data.gbName) {
                  deviceName = device.original_data.gbName;
                }
                
                // 处理拉流状态
                let isPulling = device.pulling === true;
                // 对没有指定pulling字段的情况处理
                if (device.pulling === undefined && device.original_data && device.original_data.pulling !== undefined) {
                  isPulling = device.original_data.pulling === true;
                }
                
                return {
                  id: device.id,
                  deviceId: device.gbDeviceId || device.gbId || '',
                  name: deviceName,
                  app: device.app || '',
                  stream: device.stream || '',
                  srcUrl: device.srcUrl || '',
                  status: device.status,
                  pulling: isPulling,
                  original_data: device.original_data || {}
                };
              });
              
              // 更新总记录数
              this.proxyStreamCamerasTotal = responseData.total || devicesList.length;
            } else if (Array.isArray(responseData)) {
              // 直接是数组的情况
              devicesList = responseData.map(device => {
                return {
                  id: device.id,
                  deviceId: device.gbDeviceId || device.gbId || '',
                  name: device.gbName || '未命名设备',
                  app: device.app || '',
                  stream: device.stream || '',
                  srcUrl: device.srcUrl || '',
                  status: device.status,
                  pulling: device.pulling === true,
                  original_data: device.original_data || {}
                };
              });
              
              // 更新总记录数
              this.proxyStreamCamerasTotal = devicesList.length;
            }
          } else if (response.data && Array.isArray(response.data.devices)) {
            // 直接在根级别有devices数组
            devicesList = response.data.devices.map(device => {
              return {
                id: device.id,
                deviceId: device.gbDeviceId || device.gbId || '',
                name: device.gbName || '未命名设备',
                app: device.app || '',
                stream: device.stream || '',
                srcUrl: device.srcUrl || '',
                status: device.status,
                pulling: device.pulling === true,
                original_data: device.original_data || {}
              };
            });
            
            // 更新总记录数
            this.proxyStreamCamerasTotal = response.data.total || devicesList.length;
          } else if (Array.isArray(response.data)) {
            // 响应直接是数组
            devicesList = response.data.map(device => {
              return {
                id: device.id,
                deviceId: device.gbDeviceId || device.gbId || '',
                name: device.gbName || '未命名设备',
                app: device.app || '',
                stream: device.stream || '',
                srcUrl: device.srcUrl || '',
                status: device.status,
                pulling: device.pushing === true,
                original_data: device.original_data || {}
              };
            });
            
            // 更新总记录数
            this.proxyStreamCamerasTotal = devicesList.length;
          }
          
          // 更新设备列表
          this.proxyStreamCameras = devicesList;
          console.log('处理后的拉流设备列表:', this.proxyStreamCameras);
        })
        .catch(error => {
          console.error('获取拉流设备列表出错:', error);
          this.$message.error('获取拉流设备列表失败: ' + (error.message || '未知错误'));
          this.proxyStreamCameras = [];
          this.proxyStreamCamerasTotal = 0;
        })
        .finally(() => {
          this.proxyStreamCamerasLoading = false;
        });
    },

    // 处理添加设备
    handleAddDevice() {
      this.deviceForm = {
        name: '',
        type: '',
        cameraId: null, // 修改为null以确保下拉框重置
        location: '',
        skills: [],
        tags: []
      };
      this.cameraTypeSpecificFields = {}; // 清空类型特定字段
      this.deviceDialogVisible = true;
    },

    // 新增：表格选择变化处理
    handleSelectionChange(selection) {
      this.selectedDevices = selection.map(item => item.id)
    },

    // 批量删除处理
    handleBatchDelete() {
      if (this.selectedDevices.length === 0) {
        this.$message.warning('请选择要删除的设备')
        return
      }

      this.$confirm(
        `确认删除选中的 ${this.selectedDevices.length} 个设备吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        // 显示加载状态
        this.loading = true;
        
        // 缓存当前选中的设备ID，用于处理结果
        const selectedIds = [...this.selectedDevices];
        
        console.log('准备删除的设备ID:', selectedIds);
        
        // 调用批量删除API
        cameraAPI.batchDeleteCameras(selectedIds)
          .then(response => {
            // 检查响应数据
            const responseData = response.data;
            console.log('批量删除响应:', responseData); // 调试日志
            
            if (responseData) {
              // 获取操作结果，提供默认值防止缺少某些字段
              const successIds = responseData.success_ids || [];
              const failedIds = responseData.failed_ids || [];
              let successCount = responseData.success_count || successIds.length || 0;
              let failedCount = responseData.failed_count || failedIds.length || 0;
              
              // 如果API未返回成功或失败ID列表，则根据success字段判断
              if (successIds.length === 0 && failedIds.length === 0) {
                if (responseData.success === true || responseData.code === 0) {
                  // 如果success为true或code为0但未提供详细ID，则假定所有ID都成功
                  successCount = selectedIds.length;
                  failedCount = 0;
                } else if (responseData.success === false || (responseData.code !== undefined && responseData.code !== 0)) {
                  // 如果success为false或code不为0但未提供详细ID，则假定所有ID都失败
                  successCount = 0;
                  failedCount = selectedIds.length;
                } else {
                  // 其他情况，默认HTTP 200意味着成功
                  successCount = selectedIds.length;
                  failedCount = 0;
                }
              }
              
              // 根据结果显示不同类型的消息提示
              if (successCount > 0) {
                if (failedCount === 0) {
                  this.$message.success(`成功删除 ${successCount} 个摄像头`);
                } else {
                  this.$message.warning(`成功删除 ${successCount} 个摄像头，失败 ${failedCount} 个`);
                }
              } else {
                this.$message.error(responseData.message || responseData.msg || `批量删除失败，${failedCount} 个摄像头删除失败`);
              }
              
              // 无论结果如何，都刷新列表确保数据同步
              this.fetchCameraList();
            } else {
              // 没有响应数据但HTTP状态是成功的，假定操作成功
              if (response.status >= 200 && response.status < 300) {
                this.$message.success(`批量删除操作可能已成功，正在刷新列表`);
                this.fetchCameraList();
              } else {
                this.$message.error('批量删除失败，服务器返回数据异常');
              }
            }
            
            // 清空选中的设备
            this.selectedDevices = [];
          })
          .catch(error => {
            console.error('批量删除出错:', error);
            
            // 尝试提取更详细的错误信息
            let errorMessage = '服务器错误';
            
            if (error.detailedMessage) {
              // 使用响应拦截器增强的错误信息
              errorMessage = error.detailedMessage;
            } else if (error.response && error.response.data) {
              if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              } else if (error.response.data.msg) {
                errorMessage = error.response.data.msg;
              } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            // 显示错误消息
            this.$message.error('批量删除失败：' + errorMessage);
            
            // 记录详细错误信息到控制台
            if (error.response) {
              console.error('错误状态码:', error.response.status);
              console.error('错误响应数据:', error.response.data);
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {
        // 用户点击取消，不做操作
      });
    },

    // 确认添加设备
    confirmAddDevice() {
      // 验证表单
      if (!this.deviceForm.name) {
        this.$message.warning('请输入设备名称');
        return;
      }
      if (!this.deviceForm.type) {
        this.$message.warning('请选择设备类型');
        return;
      }
      
      // 编辑模式下不需要验证摄像头选择
      if (!(this.deviceForm.id !== 0 && !!this.deviceForm.id) && !this.deviceForm.cameraId) {
        this.$message.warning('请选择摄像头');
        return;
      }

      if (this.deviceForm.id !== 0 && !!this.deviceForm.id) {
        // 编辑现有设备
        this.loading = true;
        
        // 准备更新数据
        const updateData = {
          name: this.deviceForm.name,
          // source_name不需要发送到后端，仅用于前端显示
          // 编辑模式下不发送type和camera_uuid，因为不允许修改
          // type: this.deviceForm.type,
          // camera_uuid: this.deviceForm.cameraId,
          location: this.deviceForm.location,
          tags: [...this.deviceForm.tags]
        };
        
        // 调用API更新摄像头
        cameraAPI.updateCamera(this.deviceForm.id, updateData)
          .then(response => {
            // 打印完整的响应数据结构，帮助调试
            console.log('更新摄像头API响应:', response);
            console.log('响应数据结构:', response.data);
            
            // 检查更多可能的成功响应格式
            const isSuccess = 
              (response.data.code === 0) || // 标准成功格式
              (response.data.success === true) || // 兼容成功格式
              (response.status === 200 && !response.data.code && !response.data.error); // 其他可能的成功格式
              
            if (isSuccess) {
              // 尝试获取更新后的摄像头数据，兼容多种响应格式
              let updatedCameraData;
              if (response.data.data) {
                updatedCameraData = response.data.data;
              } else if (response.data.camera) {
                updatedCameraData = response.data.camera;
              } else if (response.data && !response.data.code && !response.data.success) {
                // 可能整个响应就是摄像头数据
                updatedCameraData = response.data;
              }
              
              if (!updatedCameraData || typeof updatedCameraData !== 'object') {
                console.warn('未能从响应中提取摄像头数据，使用本地数据更新:', updatedCameraData);
                // 如果没有返回数据或格式不对，使用本地编辑的数据
                updatedCameraData = {
                  id: this.deviceForm.id,
                  name: this.deviceForm.name,
                  location: this.deviceForm.location,
                  tags: this.deviceForm.tags
                };
              }
              
              // 合并更新的数据和原有数据，确保保留之前的技能配置
              const index = this.deviceList.findIndex(device => device.id === this.deviceForm.id);
              if (index !== -1) {
                const updatedDevice = {
                  ...this.deviceList[index],  // 保留原有数据
                  id: updatedCameraData.id || this.deviceList[index].id,
                  name: updatedCameraData.name || this.deviceForm.name,
                  status: (updatedCameraData.status === true || updatedCameraData.status === 'online') ? 'online' : 'offline',
                  location: updatedCameraData.location || this.deviceForm.location,
                  tags: updatedCameraData.tags || this.deviceForm.tags || [],
                  // 如果返回了skill_names，则使用，否则保留原来的skill值
                  skill: Array.isArray(updatedCameraData.skill_names) 
                    ? updatedCameraData.skill_names.join(', ') 
                    : this.deviceList[index].skill,
                  camera_type: updatedCameraData.camera_type || this.deviceList[index].camera_type,
                  camera_uuid: updatedCameraData.camera_uuid || this.deviceList[index].camera_uuid,
                  deviceId: updatedCameraData.deviceId || this.deviceList[index].deviceId,
                  gb_id: updatedCameraData.gb_id || this.deviceList[index].gb_id
                };
                
                // 更新列表中的设备数据
                this.$set(this.deviceList, index, updatedDevice);
                // 更新原始列表
                this.originalDeviceList = [...this.deviceList];
                
                // 强制刷新整个列表
                this.deviceList = [...this.deviceList];
                
                // 异步刷新设备列表确保与服务器同步
                setTimeout(() => {
                  this.fetchCameraList();
                }, 500);
                
                // 提示用户
                this.$message.warning('数据可能已更新，但请刷新页面以确认');
              }
              
              this.$message.success('设备更新成功');
              // 关闭对话框
              this.deviceDialogVisible = false;
              
              // 刷新设备列表
              this.fetchCameraList();
              
              // 只有在成功时才重置表单
              this.resetDeviceForm();
            } else {
              const errorMsg = response.data.msg || response.data.message || response.data.error || '未知错误';
              console.error('更新设备失败，错误信息:', errorMsg);
              this.$message.error('更新设备失败：' + errorMsg);
              // 失败时不关闭对话框，不重置表单
            }
          })
          .catch(error => {
            console.error('更新设备出错:', error);
            this.$message.error('更新设备失败：' + (error.message || '服务器错误'));
            
            // 添加更多错误信息打印，帮助调试
            if (error.response) {
              console.error('错误响应数据:', error.response.data);
              console.error('错误状态码:', error.response.status);
            }
            
            let errorMessage = '服务器错误';
            
            // 尝试提取详细的错误信息
            if (error.response) {
              if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
              } else if (error.response.data && error.response.data.msg) {
                errorMessage = error.response.data.msg;
              } else if (error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
              } else if (error.message) {
                errorMessage = error.message;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            this.$message.error('更新设备失败：' + errorMessage);
            
            // 使用辅助方法尝试本地更新UI
            this.updateDeviceWithLocalData();
          })
          .finally(() => {
            this.loading = false;
            
            // 如果对话框仍然打开，说明API可能超时但没有返回错误
            // 设置一个短暂延迟，确保前面的代码有机会执行
            setTimeout(() => {
              if (this.deviceDialogVisible && this.deviceForm.id) {
                console.warn('API可能超时或未正确响应，尝试本地更新UI');
                this.updateDeviceWithLocalData();
              }
            }, 500); // 延迟500毫秒检查
          });
      } else {
        // 添加新设备
        this.loading = true;
        
        // 准备新设备数据
        let cameraData = {
          name: this.deviceForm.name || '',
          location: this.deviceForm.location || '',
          status: true, // 默认为在线状态
          tags: this.deviceForm.tags || [],
          camera_type: this.convertCameraType(this.deviceForm.type),
          // 添加其他可能的必填字段，使用空字符串保证类型正确
          app: '',
          stream: '',
          deviceId: '',
          gb_id: '',
          proxy_id: '',
          push_id: '',
          camera_uuid: this.deviceForm.cameraId ? String(this.deviceForm.cameraId) : ''
        };

        // 根据摄像头类型添加特定字段
        switch (cameraData.camera_type) {
          case 'gb28181':
            // 对于国标设备，使用用户输入的deviceId或所选摄像头ID
            cameraData.deviceId = this.cameraTypeSpecificFields.deviceId || String(this.deviceForm.cameraId);
            cameraData.gb_id = this.cameraTypeSpecificFields.deviceId || String(this.deviceForm.cameraId);
            // 添加channelId字段
            cameraData.channelId = this.cameraTypeSpecificFields.channelId || this.cameraTypeSpecificFields.deviceId || String(this.deviceForm.cameraId);
            break;
          case 'proxy_stream':
            // 对于拉流设备，使用用户输入或默认值
            cameraData.app = this.cameraTypeSpecificFields.app || 'live';
            // 为流ID添加时间戳后缀，避免冲突
            if (this.cameraTypeSpecificFields.stream) {
              // 如果用户输入了流ID，添加时间戳后缀以避免冲突
              cameraData.stream = `${this.cameraTypeSpecificFields.stream}`;
            } else {
              // 如果没有输入，使用默认格式
              cameraData.stream = `stream_${Date.now()}`;
            }
            cameraData.proxy_id = this.cameraTypeSpecificFields.proxy_id || String(this.deviceForm.cameraId);
            break;
          case 'push_stream':
            // 对于推流设备，使用用户输入或默认值
            cameraData.app = this.cameraTypeSpecificFields.app || 'live';
            // 为流ID添加时间戳后缀，避免冲突
            if (this.cameraTypeSpecificFields.stream) {
              // 如果用户输入了流ID，添加时间戳后缀以避免冲突
              cameraData.stream = `${this.cameraTypeSpecificFields.stream}`;
            } else {
              // 如果没有输入，使用默认格式
              cameraData.stream = `stream_${Date.now()}`;
            }
            cameraData.push_id = this.cameraTypeSpecificFields.push_id || String(this.deviceForm.cameraId);
            break;
        }

        // 确保所有ID字段都是字符串类型
        Object.keys(cameraData).forEach(key => {
          if (key.includes('id') || key.includes('Id') || key === 'camera_uuid') {
            if (cameraData[key] !== null && cameraData[key] !== undefined && typeof cameraData[key] !== 'string') {
              cameraData[key] = String(cameraData[key]);
            }
          }
        });
        
        console.log('发送到API的摄像头数据:', cameraData);
        
        // 调用API添加摄像头
        cameraAPI.addCameraToAI(cameraData)
          .then(response => {
            const responseData = response.data;
            console.log('API响应数据:', responseData);
            
            // 检查是否成功添加摄像头
            if (responseData.success || responseData.code === 0) {
              // 添加成功，将新摄像头添加到列表最前面
              let newCamera;
              
              // 兼容两种可能的API响应格式
              if (responseData.camera) {
                newCamera = responseData.camera;
              } else if (responseData.data) {
                newCamera = responseData.data;
              }
              
              if (newCamera) {
                // 构建符合列表所需的摄像头对象
                const newDevice = {
                  id: newCamera.id,
                  name: newCamera.name,
                  status: newCamera.status ? 'online' : 'offline',
                  type: this.deviceForm.type,
                  location: newCamera.location,
                  tags: newCamera.tags || [],
                  skill: Array.isArray(newCamera.skill_names) ? newCamera.skill_names.join(', ') : '',
                  camera_type: newCamera.camera_type,
                  deviceId: newCamera.deviceId,
                  gb_id: newCamera.gb_id,
                  app: newCamera.app,
                  stream: newCamera.stream,
                  proxy_id: newCamera.proxy_id,
                  push_id: newCamera.push_id,
                  camera_uuid: newCamera.camera_uuid
                };
                
                // 添加到设备列表最前面
                this.deviceList.unshift(newDevice);
                this.originalDeviceList = [...this.deviceList];
                this.total += 1; // 增加总数
                
                this.$message.success('设备添加成功');
                // 关闭对话框
                this.deviceDialogVisible = false;
                // 重置表单
                this.resetDeviceForm();
              } else {
                // 如果没有返回摄像头数据但操作成功，刷新整个列表
                this.fetchCameraList();
                this.$message.success('设备添加成功');
                // 关闭对话框
                this.deviceDialogVisible = false;
                // 重置表单
                this.resetDeviceForm();
              }
            } else {
              // 添加失败，显示错误信息
              const errorMessage = responseData.message || responseData.msg || '未知错误';
              this.$message.error('添加设备失败：' + errorMessage);
              // 失败时不关闭对话框，不重置表单
            }
          })
          .catch(error => {
            console.error('添加设备出错:', error);
            console.error('错误详情:', error.response ? error.response.data : '无详细信息');
            
            let errorMessage = '服务器错误';
            
            // 尝试提取详细的错误信息
            if (error.response) {
              if (error.response.status === 409) {
                errorMessage = '添加摄像头失败: 该摄像头信息与现有摄像头冲突，请修改应用名称(app)和流ID(stream)';
                
                // 如果有详细的冲突信息
                if (error.response.data && error.response.data.detail) {
                  errorMessage = error.response.data.detail;
                }
              } else if (error.response.status === 422) {
                errorMessage = '请求数据验证失败，请检查输入的摄像头信息是否完整';
                
                // 如果有详细的验证错误信息
                if (error.response.data && error.response.data.errors) {
                  const errors = error.response.data.errors;
                  const errorFields = Object.keys(errors);
                  if (errorFields.length > 0) {
                    const firstError = errors[errorFields[0]];
                    errorMessage = firstError[0] || errorMessage;
                  }
                }
              } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
            }
            
            this.$message.error('添加设备失败：' + errorMessage);
            // 失败时不关闭对话框，不重置表单
          })
          .finally(() => {
            this.loading = false;
            // 移除在finally中的表单重置代码
          });
      }
    },
    
    // 将设备类型转换为API所需的camera_type格式
    convertCameraType(type) {
      const typeMap = {
        'gb28181': 'gb28181',
        'push': 'push_stream',
        'pull': 'proxy_stream'
      };
      return typeMap[type] || type;
    },
    
    // 辅助方法：添加设备到列表中
    addDeviceToList(id, deviceData, cameraName) {
      const newDevice = {
        id: id,
        name: deviceData.name,
        status: deviceData.status ? 'online' : 'offline',
        type: this.deviceForm.type,
        cameraId: deviceData.deviceId || deviceData.proxy_id || deviceData.push_id || deviceData.camera_uuid,
        cameraName: cameraName,
        location: deviceData.location,
        tags: deviceData.tags || [],
        skill: '',
        createTime: new Date().toISOString().split('T')[0],
        config: null,
        camera_type: deviceData.camera_type,
        deviceId: deviceData.deviceId,
        gb_id: deviceData.gb_id,
        app: deviceData.app,
        stream: deviceData.stream,
        proxy_id: deviceData.proxy_id,
        push_id: deviceData.push_id
      };

      // 添加到设备列表
      this.deviceList.unshift(newDevice);
      this.originalDeviceList = [...this.deviceList];
      this.total = this.deviceList.length;
    },

    // 处理页码改变
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchCameraList();
    },

    // 处理每页条数改变
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.fetchCameraList();
    },

    // 刷新功能实现
    handleRefresh() {
      // 清空搜索关键词
      this.searchKeyword = '';
      
      // 保存当前地点筛选
      const currentLocation = this.currentLocationFilter;
      
      // 重置分页
      this.currentPage = 1;
      
      // 根据当前筛选状态重新获取摄像头列表
      if (currentLocation) {
        this.fetchCameraList({ location: currentLocation });
      } else {
        this.fetchCameraList();
      }
      
      // 重新获取标签列表
      this.fetchAllTags();
      
      // 移除不必要的成功提示
      // this.$message.success('刷新成功');
    },
    
    // 添加刷新所有数据的方法（包括地点数据）
    refreshAllData() {
      // 清空搜索关键词
      this.searchKeyword = '';
      // 清空地点筛选
      this.currentLocationFilter = '';
      // 重置分页
      this.currentPage = 1;
      // 重新获取摄像头列表
      this.fetchCameraList();
      // 重新获取标签列表
      this.fetchAllTags();
      // 重新获取所有地点数据
      this.fetchAllLocations();
      this.$message.success('所有数据刷新成功');
    },

    // 处理编辑设备
    handleEdit(row) {
      // 先重置表单，避免上一次的编辑残留
      this.resetDeviceForm();
      
      // 显示加载状态
      this.loading = true;
      
      // 调用API获取完整的摄像头信息
      // 注意：这里的id是AI摄像头的id，不是原本的wvp三种设备的id
      cameraAPI.getCameraDetail(row.id)
        .then(response => {
          // 检查API响应
          if (response.data && (response.data.success || response.data.code === 0)) {
            // 获取摄像头详细数据
            const camera = response.data.camera || response.data.data;
            console.log('获取到摄像头详细信息:', camera);
            
            // 确保ID是数字或合法的字符串类型，不要直接传递给disabled属性
            const cameraId = camera.id ? Number(camera.id) : 0;
            const cameraUuid = camera.camera_uuid ? String(camera.camera_uuid) : '';
            
            // 处理摄像头名称：根据不同设备类型获取合适的摄像头名称
            let sourceName = '';
            if (camera.source_name) {
              // 如果API直接返回了source_name字段，优先使用
              sourceName = camera.source_name;
            } else {
              // 否则根据摄像头类型从不同地方获取摄像头名称
              if (camera.camera_type === 'gb28181') {
                // 国标设备尝试获取原始摄像头名称
                const gbCamera = this.gb28181Cameras.find(c => c.id === camera.camera_uuid);
                if (gbCamera) {
                  sourceName = gbCamera.name;
                }
              } else if (camera.camera_type === 'push_stream') {
                // 推流设备添加应用名和流ID信息
                const pushCamera = this.pushStreamCameras.find(c => c.id === camera.camera_uuid);
                if (pushCamera) {
                  sourceName = `${pushCamera.name} (${camera.app || ''}/${camera.stream || ''})`;
                } else {
                  // 如果找不到原始摄像头，生成一个带有应用名和流ID的名称
                  sourceName = `推流摄像头 (${camera.app || ''}/${camera.stream || ''})`;
                }
              } else if (camera.camera_type === 'proxy_stream') {
                // 拉流设备添加应用名和流ID信息
                const pullCamera = this.proxyStreamCameras.find(c => c.id === camera.camera_uuid);
                if (pullCamera) {
                  sourceName = `${pullCamera.name} (${camera.app || ''}/${camera.stream || ''})`;
                } else {
                  // 如果找不到原始摄像头，生成一个带有应用名和流ID的名称
                  sourceName = `拉流摄像头 (${camera.app || ''}/${camera.stream || ''})`;
                }
              }
            }
            
            // 如果还是没有找到摄像头名称，则使用一个默认名称
            if (!sourceName) {
              sourceName = `摄像头 #${camera.camera_uuid || '未知'}`;
            }
            
            console.log('设置摄像头名称:', sourceName);
            
            // 填充设备表单，确保所有值的类型正确
            this.deviceForm = {
              id: cameraId, // AI摄像头ID，确保是数字类型
              name: camera.name || '', // 使用name字段作为设备名称
              source_name: sourceName, // 设置处理后的摄像头名称
              type: this.convertAPITypeToFormType(camera.camera_type || ''),
              cameraId: cameraUuid, // 原始设备ID，确保是字符串类型
              location: camera.location || '',
              skills: camera.skill_names || [],
              tags: camera.tags || []
            };
            
            // 填充类型特定字段
            this.cameraTypeSpecificFields = {};
            
            // 根据摄像头类型填充特定字段
            if (camera.camera_type === 'gb28181') {
              this.cameraTypeSpecificFields.deviceId = camera.deviceId || '';
              this.cameraTypeSpecificFields.channelId = camera.channelId || '';
            } else if (camera.camera_type === 'push_stream') {
              this.cameraTypeSpecificFields.app = camera.app || '';
              this.cameraTypeSpecificFields.stream = camera.stream || '';
              this.cameraTypeSpecificFields.push_id = camera.push_id || '';
            } else if (camera.camera_type === 'proxy_stream') {
              this.cameraTypeSpecificFields.app = camera.app || '';
              this.cameraTypeSpecificFields.stream = camera.stream || '';
              this.cameraTypeSpecificFields.proxy_id = camera.proxy_id || '';
            }

            // 延迟打开对话框，确保数据已经处理完毕
            this.$nextTick(() => {
              this.deviceDialogVisible = true;
            });
          } else {
            // API返回错误，显示错误消息
            console.warn('获取摄像头详情失败:', response);
            this.$message.error('获取摄像头详情失败：' + ((response.data && response.data.msg) || '未知错误'));
          }
        })
        .catch(error => {
          // 请求出错，显示错误消息
          console.error('获取摄像头详情出错:', error);
          this.$message.error('获取摄像头详情失败：' + (error.message || '服务器错误'));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    // 将API摄像头类型转换为表单类型值
    convertAPITypeToFormType(apiType) {
      const typeMap = {
        'gb28181': 'gb28181',
        'push_stream': 'push',
        'proxy_stream': 'pull'
      };
      return typeMap[apiType] || apiType;
    },
    
    // 使用表格行数据填充表单（当API获取失败时使用）
    fillFormWithRowData(row) {
      // 确保ID是数字、cameraId是字符串类型
      const id = row.id ? Number(row.id) : 0;
      const cameraId = row.cameraId || row.camera_uuid ? String(row.cameraId || row.camera_uuid) : '';
      
      // 处理摄像头名称，与handleEdit方法中的处理逻辑类似
      let sourceName = '';
      if (row.source_name) {
        // 如果已有source_name字段，优先使用
        sourceName = row.source_name;
      } else {
        // 否则根据摄像头类型从不同地方获取摄像头名称
        if (row.type === 'gb28181') {
          // 国标设备尝试获取原始摄像头名称
          const gbCamera = this.gb28181Cameras.find(c => c.id === cameraId);
          if (gbCamera) {
            sourceName = gbCamera.name;
          }
        } else if (row.type === 'push') {
          // 推流设备添加应用名和流ID信息
          const pushCamera = this.pushStreamCameras.find(c => c.id === cameraId);
          if (pushCamera) {
            sourceName = `${pushCamera.name} (${row.app || ''}/${row.stream || ''})`;
          } else {
            // 如果找不到原始摄像头，生成一个带有应用名和流ID的名称
            sourceName = `推流摄像头 (${row.app || ''}/${row.stream || ''})`;
          }
        } else if (row.type === 'pull') {
          // 拉流设备添加应用名和流ID信息
          const pullCamera = this.proxyStreamCameras.find(c => c.id === cameraId);
          if (pullCamera) {
            sourceName = `${pullCamera.name} (${row.app || ''}/${row.stream || ''})`;
          } else {
            // 如果找不到原始摄像头，生成一个带有应用名和流ID的名称
            sourceName = `拉流摄像头 (${row.app || ''}/${row.stream || ''})`;
          }
        }
      }
      
      // 如果还是没有找到摄像头名称，则使用一个默认名称
      if (!sourceName) {
        sourceName = `摄像头 #${cameraId || '未知'}`;
      }
      
      console.log('设置摄像头名称:', sourceName);
      
      this.deviceForm = {
        id: id,
        name: row.name || '', // 使用name字段作为设备名称
        source_name: sourceName, // 设置处理后的摄像头名称
        type: row.type || '',
        cameraId: cameraId,
        location: row.location || '',
        skills: row.skill ? row.skill.split(',').map(s => s.trim()) : [],
        tags: row.tags || []
      };
      
      // 填充类型特定字段
      this.cameraTypeSpecificFields = {};
      
      // 根据设备类型填充特定字段
      if (row.type === 'gb28181') {
        this.cameraTypeSpecificFields.deviceId = row.deviceId || '';
        this.cameraTypeSpecificFields.channelId = row.channelId || row.deviceId || '';
      } else if (row.type === 'push') {
        this.cameraTypeSpecificFields.app = row.app || '';
        this.cameraTypeSpecificFields.stream = row.stream || '';
        this.cameraTypeSpecificFields.push_id = row.push_id || '';
      } else if (row.type === 'pull') {
        this.cameraTypeSpecificFields.app = row.app || '';
        this.cameraTypeSpecificFields.stream = row.stream || '';
        this.cameraTypeSpecificFields.proxy_id = row.proxy_id || '';
        this.cameraTypeSpecificFields.url = row.url || '';
      }
      
      // 延迟打开对话框确保数据已处理
      this.$nextTick(() => {
        this.deviceDialogVisible = true;
      });
    },

    // 处理配置技能
    handleConfigSkill(row) {
      // 设置当前设备ID，用于后续保存
      this.currentDeviceId = row.id;

      // 初始化技能选择表单和缓存
      const currentSkills = row.skill ? row.skill.split(',').map(s => s.trim()) : [];
      this.skillSelectForm = {
        selectedSkills: [...currentSkills]
      };
      this.selectedSkillCache = [...currentSkills];

      // 打开选择技能对话框
      this.skillSelectDialogVisible = true;
    },

    // 关闭选择技能对话框
    closeSkillSelectDialog() {
      this.skillSelectDialogVisible = false;
    },

    // 添加handleSkillSelectChange方法
    handleSkillSelectChange(value) {
      console.log('技能选择变更:', value);
      // 如果是添加了新技能
      if (value.length > this.selectedSkillCache.length) {
        // 找出新添加的技能
        const newSkill = value.find(skill => !this.selectedSkillCache.includes(skill));
        if (newSkill) {
          // 检查是否已经存在该技能，防止重复添加
          if (this.selectedSkillCache.includes(newSkill)) {
            // 如果已经存在，恢复原来的选择状态
            this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
            this.$message.warning(`技能"${newSkill}"已经添加过，不能重复添加`);
            return;
          }
          
          // 暂存当前已选技能，移除新添加的技能
          this.selectedSkillCache = [...value].filter(skill => skill !== newSkill);
          this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
          
          // 配置新添加的技能
          this.configureSkill(newSkill, true);
        }
      } else {
        // 如果是移除了技能，更新缓存
        this.selectedSkillCache = [...value];
      }
    },

    // 确认选择技能
    confirmSkillSelect() {
      // 检查是否有重复技能
      const uniqueSkills = [...new Set(this.selectedSkillCache)];
      if (uniqueSkills.length < this.selectedSkillCache.length) {
        this.$message.warning('技能列表中存在重复技能，已自动去重');
        this.selectedSkillCache = uniqueSkills;
        this.skillSelectForm.selectedSkills = [...uniqueSkills];
      }

      // 检查是否已选择技能
      if (this.selectedSkillCache.length === 0) {
        this.$message.warning('请至少选择一个技能');
        return;
      }

      // 保存选中的技能到设备中
      const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
      if (deviceIndex !== -1) {
        // 获取当前设备
        const currentDevice = this.deviceList[deviceIndex];
        
        // 获取选中技能的完整信息，确保使用正确的技能名称
        const skillNames = this.selectedSkillCache.map(selectedSkill => {
          // 查找技能的完整信息
          const skillInfo = this.skillOptions.find(option => 
            option.value === selectedSkill || option.name_zh === selectedSkill
          );
          
          // 返回中文名称，如果找不到则使用原始值
          return skillInfo ? skillInfo.name_zh : selectedSkill;
        });
        
        console.log('准备保存到设备的技能:', skillNames);
        
        // 准备更新数据
        const updateData = {
          skill_names: skillNames
        };
        
        // 显示加载状态
        this.loading = true;
        
        // 调用API更新摄像头技能
        cameraAPI.updateCamera(this.currentDeviceId, updateData)
          .then(response => {
            if (response.data.code === 0) {
              // 从响应中获取更新后的摄像头数据
              const updatedCameraData = response.data.data;
              
              // 合并更新的数据和原有数据，确保保留之前的配置
              const updatedDevice = {
                ...this.deviceList[deviceIndex],  // 保留原有数据
                id: updatedCameraData.id,
                name: updatedCameraData.name,
                status: updatedCameraData.status ? 'online' : 'offline',
                location: updatedCameraData.location,
                tags: updatedCameraData.tags || [],
                // 使用新的技能名称
                skill: Array.isArray(updatedCameraData.skill_names) 
                  ? updatedCameraData.skill_names.join(', ') 
                  : skillNames.join(', '),
                camera_type: updatedCameraData.camera_type,
                camera_uuid: updatedCameraData.camera_uuid,
                deviceId: updatedCameraData.deviceId,
                gb_id: updatedCameraData.gb_id
              };
              
              // 更新列表中的设备数据
              this.$set(this.deviceList, deviceIndex, updatedDevice);
              // 更新原始列表
              this.originalDeviceList = [...this.deviceList];
              
              this.$message.success('技能选择成功');
            } else {
              this.$message.error('更新技能失败：' + (response.data.msg || '未知错误'));
              
              // 如果API调用失败，仅在前端更新显示
              this.updateDeviceSkillDisplay(deviceIndex, skillNames);
            }
          })
          .catch(error => {
            console.error('更新技能出错:', error);
            this.$message.error('更新技能失败：' + (error.message || '服务器错误'));

            // 在前端更新显示
            this.updateDeviceSkillDisplay(deviceIndex, skillNames);
          })
          .finally(() => {
            this.loading = false;
            // 关闭选择技能对话框
            this.skillSelectDialogVisible = false;
          });
      } else {
        this.$message.error('未找到设备，保存失败');
        this.skillSelectDialogVisible = false;
      }
    },
    
    // 更新设备技能显示
    updateDeviceSkillDisplay(deviceIndex, skillNames) {
      // 更新设备的技能名称显示
      this.$set(this.deviceList[deviceIndex], 'skill', skillNames.join(', '));
      // 更新原始列表
      this.originalDeviceList = [...this.deviceList];
    },

    // 移除已选技能
    removeSelectedSkill(skill) {
      this.skillSelectForm.selectedSkills = this.skillSelectForm.selectedSkills.filter(s => s !== skill);
      this.selectedSkillCache = this.selectedSkillCache.filter(s => s !== skill);
    },

    // 配置单个技能
    configureSkill(skill, isNewSelection = true) {
      // 手动关闭下拉选择框
      document.body.click(); // 触发全局点击，关闭任何打开的下拉菜单
      
      console.log('准备配置技能:', skill);
      
      // 延迟一点打开弹框，确保下拉框已关闭
      setTimeout(() => {
        // 隐藏选择技能对话框，但不关闭
        this.skillSelectDialogVisible = false;

        // 标记当前是否是新选择的技能
        this.isNewSkillSelection = isNewSelection;

        // 初始化技能表单
        this.skillForm = {
          selectedSkill: [skill], // 注意这里是数组
          status: true, // 默认启用
          timeRanges: [{
            start: new Date(2024, 0, 1, 0, 0),
            end: new Date(2024, 0, 1, 23, 59)
          }],
          frequency: {
            seconds: 1,
            frames: 1
          },
          electronicFence: {
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', // 默认空白背景图
            points: [],
            isDrawing: false,
            triggerMode: 'inside',
            sensitivity: 80,
            tempPoints: [],
            draggedPointIndex: -1,
            isDragging: false,
            currentPolygon: []
          },
          images: []
        };

        // 当前选中的技能
        this.currentSkill = skill;

        // 查找设备
        const device = this.deviceList.find(d => d.id === this.currentDeviceId);

        // 如果设备已有配置，则加载已有配置
        if (device && device.config) {
          try {
            // 首先尝试使用技能的中文名称查找配置
            let skillConfig = device.config[skill];
            
            // 如果没有找到，尝试查找其他可能的键名
            if (!skillConfig) {
              // 查找匹配的技能信息
              const skillInfo = this.skillOptions.find(option => 
                option.value === skill || option.name_zh === skill
              );
              
              if (skillInfo) {
                // 使用英文名称尝试查找
                skillConfig = device.config[skillInfo.name];
                
                // 如果还是没找到，尝试其他组合形式
                if (!skillConfig && skillInfo.name_zh) {
                  skillConfig = device.config[skillInfo.name_zh];
                }
              }
            }
            
            // 如果找到了配置，则加载
            if (skillConfig) {
              console.log('找到技能配置:', skillConfig);
              this.loadSkillConfig(skillConfig);
            } else {
              console.log('未找到技能配置，使用默认值');
            }
          } catch (error) {
            console.error('加载配置失败', error);
          }
        }

        // 打开配置技能对话框
        this.skillDialogVisible = true;
      }, 100);
    },

    // 加载技能配置
    loadSkillConfig(config) {
      if (!config) return;
      // 使用深拷贝避免直接引用
      const configCopy = JSON.parse(JSON.stringify(config));

      // 填充表单字段 - 确保正确加载启用状态
      this.skillForm.status = configCopy.status !== undefined ? configCopy.status : true;

      // 加载预警等级
      this.skillForm.alarmLevel = configCopy.alarmLevel || '二级预警';

      // 时间段
      if (configCopy.timeRanges && configCopy.timeRanges.length > 0) {
        this.skillForm.timeRanges = configCopy.timeRanges.map(range => ({
          start: range.start ? new Date(range.start) : new Date(2024, 0, 1, 0, 0),
          end: range.end ? new Date(range.end) : new Date(2024, 0, 1, 23, 59)
        }));
      }

      // 抽帧频率
      if (configCopy.frequency) {
        this.skillForm.frequency = configCopy.frequency;
      }

      // 电子围栏
      if (configCopy.electronicFence) {
        this.skillForm.electronicFence.image = configCopy.electronicFence.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        this.skillForm.electronicFence.triggerMode = configCopy.electronicFence.triggerMode || 'inside';
        this.skillForm.electronicFence.sensitivity = configCopy.electronicFence.sensitivity || 80;

        // 处理点数据 - 兼容旧格式和新格式
        if (configCopy.electronicFence.points) {
          try {
            // 尝试检测数据格式
            const points = configCopy.electronicFence.points;

            if (Array.isArray(points)) {
              if (points.length === 0) {
                this.skillForm.electronicFence.points = [];
              } else if (Array.isArray(points[0])) {
                // 新格式 - 多边形数组
                this.skillForm.electronicFence.points = points;
              } else if (typeof points[0] === 'object' && points[0].hasOwnProperty('x') && points[0].hasOwnProperty('y')) {
                // 旧格式 - 单个多边形
                this.skillForm.electronicFence.points = [points];
              } else {
                this.skillForm.electronicFence.points = [];
              }
            } else {
              this.skillForm.electronicFence.points = [];
            }
          } catch (error) {
            console.error('处理点数据时出错:', error);
            this.skillForm.electronicFence.points = [];
          }
        } else {
          this.skillForm.electronicFence.points = [];
        }
      }

      // 确保currentPolygon是空数组
      this.skillForm.electronicFence.currentPolygon = [];
    },

    // 处理确认配置
    handleConfirm() {
      this.$refs.skillForm.validate((valid) => {
        if (valid) {
          if (this.currentDeviceId && this.currentSkill) {
            // 构建要保存的配置对象
            const config = this.prepareConfigForSave();
            
            // 显示加载状态
            this.loading = true;

            // 找到当前设备
            const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
            if (deviceIndex !== -1) {
              // 确保设备有config对象
              if (!this.deviceList[deviceIndex].config) {
                this.$set(this.deviceList[deviceIndex], 'config', {});
              }

              // 获取当前技能的最佳键名（优先使用API返回的中文名称）
              let skillKey = this.currentSkill;
              
              // 查找匹配的技能信息
              const skillInfo = this.skillOptions.find(option => 
                option.value === this.currentSkill || option.name_zh === this.currentSkill
              );
              
              // 如果找到了匹配的技能信息，使用其中文名称作为键
              if (skillInfo) {
                skillKey = skillInfo.name_zh;
              }
              
              console.log('使用键名保存技能配置:', skillKey);

              // 为特定技能保存配置
              this.$set(this.deviceList[deviceIndex].config, skillKey, config);

              // 准备创建AI任务的数据
              const taskData = {
                // 任务名称，使用设备名称+技能名称的组合
                name: `${this.deviceList[deviceIndex].name}_${skillKey}`,
                // 任务描述
                description: `${this.deviceList[deviceIndex].name}的${skillKey}检测任务`,
                // 预警等级转换为数字
                warning_level: this.getWarningLevelValue(this.skillForm.alarmLevel),
                // 抽帧频率
                frame_rate: this.skillForm.frequency.seconds === 1 ? 
                  this.skillForm.frequency.frames : 
                  1 / this.skillForm.frequency.seconds,
                // 运行时段
                running_period: {
                  enabled: true,
                  periods: this.skillForm.timeRanges.map(range => ({
                    start: this.formatTimeString(range.start),
                    end: this.formatTimeString(range.end)
                  }))
                },
                // 电子围栏配置
                electronic_fence: {
                  enabled: this.skillForm.electronicFence.points.length > 0,
                  points: this.formatFencePoints(this.skillForm.electronicFence.points),
                  trigger_mode: this.skillForm.electronicFence.triggerMode || 'inside',
                  sensitivity: this.skillForm.electronicFence.sensitivity || 80
                },
                // 任务状态
                status: this.skillForm.status,
                // 摄像头ID
                camera_id: parseInt(this.currentDeviceId),
                // 技能类ID
                skill_class_id: skillInfo ? parseInt(skillInfo.id) : null,
                // 自定义技能配置
                skill_custom_config: {
                  params: {}  // 默认为空对象
                }
              };
              
              // 检查是否具有有效的技能类ID
              if (!taskData.skill_class_id) {
                this.$message.error('创建AI任务失败：未找到有效的技能类ID');
                this.loading = false;
                return;
              }
              
              // 检查是否有自定义参数，如果有则添加到请求中
              if (config && config.customParams) {
                taskData.skill_custom_config.params = { ...config.customParams };
              }
              
              console.log('准备创建AI任务:', taskData);
              
              // 调用API创建AI任务
              skillAPI.createAITask(taskData)
                .then(response => {
                  if (response.data && response.data.code === 0) {
                    console.log('AI任务创建成功:', response.data);
                    
                    // 更新设备的技能配置
                    this.updateDeviceSkillConfig(deviceIndex, skillKey, config);
                    
                    this.$message.success('技能配置保存成功');
                    
                    // 如果是新选择的技能，将其添加到已选技能列表中
                    if (this.isNewSkillSelection) {
                      // 添加到已选技能缓存
                      this.selectedSkillCache.push(this.currentSkill);
                    }
                  } else {
                    console.error('创建AI任务失败:', response.data);
                    this.$message.error('创建AI任务失败：' + (response.data.msg || '未知错误'));
                  }
                })
                .catch(error => {
                  console.error('创建AI任务出错:', error);
                  this.$message.error('创建AI任务失败：' + (error.message || '服务器错误'));
                })
                .finally(() => {
                  this.loading = false;
                  // 关闭配置技能对话框
                  this.skillDialogVisible = false;
                  
                  // 重置左侧菜单标志
                  this.showLeftSkillMenu = false;
                  
                  // 更新已选技能列表，与缓存同步
                  this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
                  
                  // 重置新选择标记
                  this.isNewSkillSelection = false;
                  
                  // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
                  if (!this.showLeftSkillMenu) {
                    this.skillSelectDialogVisible = true;
                  }
                });
            } else {
              this.loading = false;
              this.$message.error('未找到设备，保存失败');
              // 关闭配置技能对话框
              this.skillDialogVisible = false;
              
              // 重置左侧菜单标志
              this.showLeftSkillMenu = false;
              
              // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
              if (!this.showLeftSkillMenu) {
                this.skillSelectDialogVisible = true;
              }
            }
          } else {
            this.$message.error('未指定设备ID或技能，保存失败');
            // 关闭配置技能对话框
            this.skillDialogVisible = false;
            
            // 重置左侧菜单标志
            this.showLeftSkillMenu = false;
            
            // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
            if (!this.showLeftSkillMenu) {
              this.skillSelectDialogVisible = true;
            }
          }
        } else {
          return false;
        }
      });
    },
    
    // 更新设备的技能配置
    updateDeviceSkillConfig(deviceIndex, skillKey, config) {
      try {
        // 确保设备有config对象
        if (!this.deviceList[deviceIndex].config) {
          this.$set(this.deviceList[deviceIndex], 'config', {});
        }
        
        // 为特定技能保存配置
        this.$set(this.deviceList[deviceIndex].config, skillKey, config);
        
        // 更新原始列表
        this.originalDeviceList = [...this.deviceList];
        
        // 同时使用API更新摄像头配置
        const updateData = {
          skill_config: {
            [skillKey]: config
          }
        };
        
        cameraAPI.updateCamera(this.deviceList[deviceIndex].id, updateData)
          .then(response => {
            if (response.data.code !== 0) {
              console.warn('更新设备技能配置失败:', response.data.msg);
            }
          })
          .catch(error => {
            console.error('更新设备技能配置出错:', error);
          });
      } catch (error) {
        console.error('更新设备技能配置时出错:', error);
      }
    },
    
    // 获取预警等级的数值
    getWarningLevelValue(levelName) {
      const levelMap = {
        '一级预警': 1,
        '二级预警': 2,
        '三级预警': 3,
        '四级预警': 4
      };
      return levelMap[levelName] || 2; // 默认为二级预警
    },
    
    // 格式化时间为字符串
    formatTimeString(dateObj) {
      if (!dateObj) return '00:00';
      
      try {
        // 如果已经是字符串格式，直接返回
        if (typeof dateObj === 'string') {
          return dateObj;
        }
        
        // 如果是Date对象，转换为HH:mm格式
        if (dateObj instanceof Date) {
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      } catch (error) {
        console.error('格式化时间出错:', error);
      }
      
      return '00:00'; // 默认值
    },
    
    // 格式化电子围栏点
    formatFencePoints(fencePolygons) {
      try {
        if (!fencePolygons || !Array.isArray(fencePolygons) || fencePolygons.length === 0) {
          return [];
        }
        
        // 获取第一个多边形（暂时只支持一个多边形）
        const polygon = fencePolygons[0];
        
        // 转换为API所需格式 [[x1,y1], [x2,y2], ...]
        return polygon.map(point => [Math.round(point.x), Math.round(point.y)]);
      } catch (error) {
        console.error('格式化电子围栏点出错:', error);
        return [];
      }
    },

    // 准备保存的配置数据
    prepareConfigForSave() {
      // 创建一个深拷贝，避免引用原始对象
      const config = JSON.parse(JSON.stringify({
        status: this.skillForm.status,
        alarmLevel: this.skillForm.alarmLevel,
        timeRanges: this.skillForm.timeRanges.map(range => ({
          start: range.start instanceof Date ? range.start.toISOString() : range.start,
          end: range.end instanceof Date ? range.end.toISOString() : range.end
        })),
        frequency: this.skillForm.frequency,
        electronicFence: {
          image: this.skillForm.electronicFence.image,
          points: this.skillForm.electronicFence.points,
          triggerMode: this.skillForm.electronicFence.triggerMode,
          sensitivity: this.skillForm.electronicFence.sensitivity
        }
      }));

      return config;
    },

    // 处理删除单个设备
    handleDelete(row) {
      this.$confirm(
        `确认删除设备 ${row.name} 吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        // 显示加载状态
        this.loading = true;
        
        // 调用API删除摄像头
        cameraAPI.deleteCamera(row.id)
          .then(response => {
            console.log('删除摄像头响应:', response.data);
            
            // 检查响应格式：可能是原始格式或已转换格式
            let isSuccess = false;
            let errorMsg = '';
            
            // 如果有code字段(转换后的格式)
            if (response.data && response.data.code !== undefined) {
              isSuccess = response.data.code === 0;
              errorMsg = response.data.msg || '未知错误';
            } 
            // 如果有success字段(原始格式)
            else if (response.data && response.data.success !== undefined) {
              isSuccess = response.data.success === true;
              errorMsg = response.data.message || response.data.msg || '未知错误';
            }
            // 其他情况：假定HTTP 200状态即为成功
            else if (response.status >= 200 && response.status < 300) {
              isSuccess = true;
              errorMsg = '操作完成，但服务器未返回明确结果';
            }
            
            if (isSuccess) {
              // 删除成功后重新获取当前页数据，保持每页显示的数据量
              this.fetchCameraList();
              this.$message.success('删除成功');
            } else {
              this.$message.error('删除失败：' + errorMsg);
              // 尝试刷新列表，以防服务器实际已删除成功但返回了错误状态
              this.fetchCameraList();
            }
          })
          .catch(error => {
            console.error('删除设备出错:', error);
            
            // 尝试从错误响应中提取更详细的错误信息
            let errorMessage = '服务器错误';
            
            if (error.detailedMessage) {
              // 使用响应拦截器增强的错误信息
              errorMessage = error.detailedMessage;
            } else if (error.response && error.response.data) {
              if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              } else if (error.response.data.msg) {
                errorMessage = error.response.data.msg;
              } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
              }
              
              // 记录错误响应以便调试
              console.error('错误响应数据:', error.response.data);
              console.error('错误状态码:', error.response.status);
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            this.$message.error('删除失败：' + errorMessage);
            
            // 尝试刷新列表，以防服务器实际已删除成功但返回了错误
            setTimeout(() => {
              this.fetchCameraList();
            }, 1000);
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {
        // 用户点击取消，不做操作
      });
    },

    // 处理移除时间段
    removeTimeRange(index) {
      if (this.skillForm.timeRanges.length > 1) {
        this.skillForm.timeRanges.splice(index, 1);
      } else {
        this.$message.warning('至少保留一个时间段');
      }
    },

    // 格式化多边形点坐标为SVG格式
    formatPolygonPoints(points) {
      if (!points || points.length === 0) {
        return '';
      }
      console.log('格式化点坐标:', points);
      return points.map(point => `${point.x},${point.y}`).join(' ');
    },

    // 处理图片点击事件，添加电子围栏点
    handleImageClick(event) {
      if (!this.skillForm.electronicFence.isDrawing) {
        return;
      }

      // 获取点击坐标相对于图片的位置
      const rect = event.target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 添加点到当前围栏
      this.skillForm.electronicFence.currentPolygon.push({ x, y });
    },

    // 开始绘制电子围栏
    startDrawFence() {
      if (this.skillForm.electronicFence.isDrawing) {
        this.completeFence(); // 完成绘制
      } else {
        // 开始绘制
        this.skillForm.electronicFence.isDrawing = true;
        this.skillForm.electronicFence.currentPolygon = [];
      }
    },

    // 完成围栏绘制
    completeFence() {
      const currentPolygon = this.skillForm.electronicFence.currentPolygon;

      // 如果点数不足，提示用户
      if (currentPolygon.length < 3) {
        this.$message.warning('电子围栏至少需要3个点');
        return;
      }

      // 如果需要自动闭合多边形（第一个点和最后一个点不同）
      const firstPoint = currentPolygon[0];
      const lastPoint = currentPolygon[currentPolygon.length - 1];

      // 如果首尾点距离较远，自动闭合
      const distance = Math.sqrt(
        Math.pow(firstPoint.x - lastPoint.x, 2) +
        Math.pow(firstPoint.y - lastPoint.y, 2)
      );

      // 创建深拷贝，避免引用问题
      let finalPolygon = JSON.parse(JSON.stringify(currentPolygon));

      // 自动闭合
      if (distance > 10) { // 距离超过10像素则添加闭合点
        finalPolygon.push({ x: firstPoint.x, y: firstPoint.y });
      }

      // 将完成的多边形添加到points数组
      if (!Array.isArray(this.skillForm.electronicFence.points)) {
        // 如果points不是数组，创建新数组
        this.skillForm.electronicFence.points = [];
      }

      // 如果是第一个多边形，直接设置
      if (this.skillForm.electronicFence.points.length === 0) {
        this.skillForm.electronicFence.points = [finalPolygon];
      } else {
        // 否则添加到数组中
        this.skillForm.electronicFence.points.push(finalPolygon);
      }

      console.log('完成绘制，当前points:', this.skillForm.electronicFence.points);

      // 清空当前多边形并完成绘制
      this.skillForm.electronicFence.currentPolygon = [];
      this.skillForm.electronicFence.isDrawing = false;

      this.$message.success('电子围栏绘制完成，可继续添加更多围栏');
    },

    // 清除电子围栏
    clearFence() {
      this.$confirm('确定要清除当前绘制的所有电子围栏吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.skillForm.electronicFence.points = [];
        this.skillForm.electronicFence.currentPolygon = [];
        this.skillForm.electronicFence.isDrawing = false;
      }).catch(() => { });
    },

    // 取消绘制电子围栏
    cancelDrawFence() {
      this.skillForm.electronicFence.isDrawing = false;
      this.skillForm.electronicFence.currentPolygon = [];
    },

    // 获取多边形颜色
    getPolygonColor(index) {
      // 为不同的多边形设置不同的颜色
      const colors = [
        'rgba(24, 144, 255, 0.2)',
        'rgba(82, 196, 26, 0.2)',
        'rgba(250, 173, 20, 0.2)',
        'rgba(245, 34, 45, 0.2)',
        'rgba(114, 46, 209, 0.2)'
      ];
      return colors[index % colors.length];
    },

    // 处理当前绘制多边形的点击事件
    handleCurrentPointClick(index) {
      // 移除当前多边形中的点
      if (this.skillForm.electronicFence.isDrawing) {
        this.skillForm.electronicFence.currentPolygon.splice(index, 1);
      }
    },

    // 移除单个点
    handlePointClick(polyIndex, pointIndex) {
      if (this.skillForm.electronicFence.isDrawing) {
        // 在绘制模式下，移除点
        if (this.skillForm.electronicFence.points[polyIndex].length > 3) {
          this.skillForm.electronicFence.points[polyIndex].splice(pointIndex, 1);
        } else {
          this.$message.warning('多边形至少需要3个点，无法继续删除');
        }
      }
    },

    // 开始拖动点
    startDragPoint(polyIndex, pointIndex, event) {
      console.log('开始拖动点', polyIndex, pointIndex);

      // 绘制模式下不允许拖动
      if (this.skillForm.electronicFence.isDrawing) {
        return;
      }

      // 设置拖动状态
      this.skillForm.electronicFence.draggedPointIndex = pointIndex;
      this.skillForm.electronicFence.draggedPolyIndex = polyIndex;
      this.skillForm.electronicFence.isDragging = true;

      // 绑定事件处理器到实例方法
      this.boundDragPoint = this.dragPoint.bind(this);
      this.boundStopDragPoint = this.stopDragPoint.bind(this);

      // 添加鼠标移动和抬起事件监听
      document.addEventListener('mousemove', this.boundDragPoint);
      document.addEventListener('mouseup', this.boundStopDragPoint);
    },

    // 拖动点
    dragPoint(event) {
      if (!this.skillForm.electronicFence.isDragging) {
        return;
      }

      const polyIndex = this.skillForm.electronicFence.draggedPolyIndex;
      const pointIndex = this.skillForm.electronicFence.draggedPointIndex;

      if (polyIndex === -1 || pointIndex === -1) {
        return;
      }

      console.log('拖动点', polyIndex, pointIndex);

      // 获取图片元素
      const imgElement = document.querySelector('.fence-image');
      if (!imgElement) {
        return;
      }

      // 计算相对于图片的坐标
      const rect = imgElement.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      // 限制在图片范围内
      x = Math.max(0, Math.min(rect.width, x));
      y = Math.max(0, Math.min(rect.height, y));

      // 使用Vue的响应式更新确保界面更新
      this.$set(this.skillForm.electronicFence.points[polyIndex], pointIndex, { x, y });
    },

    // 停止拖动点
    stopDragPoint() {
      console.log('停止拖动点');

      if (!this.skillForm.electronicFence.isDragging) {
        return;
      }

      // 移除事件监听
      document.removeEventListener('mousemove', this.boundDragPoint);
      document.removeEventListener('mouseup', this.boundStopDragPoint);

      // 重置拖动状态
      this.skillForm.electronicFence.isDragging = false;
      this.skillForm.electronicFence.draggedPointIndex = -1;
      this.skillForm.electronicFence.draggedPolyIndex = -1;
    },

    // 获取点的样式
    getPointStyle(polyIndex, pointIndex) {
      const isDragging = this.skillForm.electronicFence.draggedPolyIndex === polyIndex &&
        this.skillForm.electronicFence.draggedPointIndex === pointIndex;
      return {
        cursor: this.skillForm.electronicFence.isDrawing ? 'pointer' : 'move',
        filter: isDragging ? 'drop-shadow(0 0 4px rgba(24, 144, 255, 0.8))' : 'none'
      };
    },

    // 关闭设备对话框
    closeDeviceDialog() {
      this.deviceDialogVisible = false;
      // 延迟重置表单，确保对话框关闭动画完成
      setTimeout(() => {
        this.resetDeviceForm();
      }, 300);
    },

    // 关闭技能对话框
    closeSkillDialog() {
      this.skillDialogVisible = false;

      // 重新打开选择技能对话框
      this.skillSelectDialogVisible = true;
    },

    // 新增：添加标签
    addTag() {
      if (this.tagInputValue.trim() !== '') {
        // 检查是否已经添加了该标签
        if (this.deviceForm.tags.includes(this.tagInputValue.trim())) {
          this.$message.warning('该标签已添加');
        } else {
        this.deviceForm.tags.push(this.tagInputValue.trim());
        }
        this.tagInputValue = '';
      }
    },

    // 新增：移除标签
    removeTag(index) {
      this.deviceForm.tags.splice(index, 1);
    },

    // 新增：获取标签颜色
    getTagColor(tag) {
      // 判断是否为已选中的标签
      if (this.currentFilteredTags && this.currentFilteredTags.includes(tag)) {
        return '#409EFF'; // 使用主题蓝色作为已选中标签的颜色
      }
      
      // 这里根据标签内容生成不同的颜色
      const colors = [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',  // 基础色
        '#2B87D1', '#41B883', '#D4A017', '#E01F3D', '#606266',  // 深色系
        '#76D0FF', '#95E084', '#FFD666', '#FF9F9F', '#B2B8C2',  // 浅色系
        '#337CCF', '#4CAF50', '#FF9800', '#F44336', '#673AB7',  // Material设计色
        '#1976D2', '#388E3C', '#FFA000', '#D32F2F', '#7B1FA2'   // Material深色
      ];

      // 使用字符串哈希算法生成随机但确定的颜色索引
      const hash = Array.from(tag).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      return colors[Math.abs(hash) % colors.length];
    },

    // 添加时间段
    addTimeRange() {
      if (this.skillForm.timeRanges.length < 3) {
        this.skillForm.timeRanges.push({
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        });
      }
    },

    // 处理关闭对话框
    handleClose() {
      // 重置表单
      this.skillForm = {
        selectedSkill: [],
        status: true,
        timeRanges: [{
          start: new Date(2024, 0, 1, 0, 0),
          end: new Date(2024, 0, 1, 23, 59)
        }],
        frequency: {
          seconds: 1,
          frames: 1
        },
        electronicFence: {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          sensitivity: 80,
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        },
        images: []
      };

      // 清除当前技能
      this.currentSkill = null;

      // 重置新选择标记
      this.isNewSkillSelection = false;

      // 重置左侧菜单标志
      this.showLeftSkillMenu = false;

      // 更新已选技能列表，与缓存同步
      this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];

      // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
      if (!this.showLeftSkillMenu) {
      this.skillSelectDialogVisible = true;
      }
    },

    // 获取技能图标 - 更新为使用技能类型判断图标
    getSkillIcon(skill) {
      // 查找当前技能在技能选项中的配置
      const skillOption = this.skillOptions.find(option => option.value === skill || option.name_zh === skill);
      
      // 根据技能类型返回不同图标
      if (skillOption) {
        switch (skillOption.type) {
          case 'detection':
            return 'el-icon-view';
          case 'classification':
            return 'el-icon-s-grid';
          case 'segmentation':
            return 'el-icon-crop';
          case 'recognition':
            return 'el-icon-receiving';
          case 'tracking':
            return 'el-icon-coordinate';
          default:
            return 'el-icon-cpu';
        }
      }
      
      // 如果没有找到对应的技能配置，使用默认图标映射
      const icons = {
        '安全帽检测': 'el-icon-user',
        '安全带检测': 'el-icon-view',
        'COCO目标检测': 'el-icon-view',
        '管道泄漏': 'el-icon-warning',
        '烟雾识别': 'el-icon-video-camera',
        '明火识别': 'el-icon-bell',
        '人员摔倒': 'el-icon-cpu',
        '人员聚集': 'el-icon-share',
        '人员离岗': 'el-icon-bell',
        '未穿工服': 'el-icon-user'
      };
      
      // 遍历所有可能的名称
      for (const [key, icon] of Object.entries(icons)) {
        if (skill.includes(key)) {
          return icon;
        }
      }
      
      // 默认图标
      return 'el-icon-question';
    },

    // 获取技能渐变色 - 更新为使用技能类型判断渐变色
    getSkillGradient(skill) {
      // 查找当前技能在技能选项中的配置
      const skillOption = this.skillOptions.find(option => option.value === skill || option.name_zh === skill);
      
      // 根据技能类型返回不同渐变色
      if (skillOption) {
        switch (skillOption.type) {
          case 'detection':
            return 'linear-gradient(135deg, #409EFF, #1677ff)';
          case 'classification':
            return 'linear-gradient(135deg, #67C23A, #53a11d)';
          case 'segmentation':
            return 'linear-gradient(135deg, #E6A23C, #d38b1c)';
          case 'recognition':
            return 'linear-gradient(135deg, #F56C6C, #e74c4c)';
          case 'tracking':
            return 'linear-gradient(135deg, #909399, #6e7175)';
          default:
            return 'linear-gradient(135deg, #409EFF, #1677ff)';
        }
      }
      
      // 如果没有找到对应的技能配置，使用默认渐变色映射
      if (skill.includes('安全帽') || skill.includes('人员摔倒')) {
        return 'linear-gradient(135deg, #409EFF, #1677ff)';
      } else if (skill.includes('管道泄漏')) {
        return 'linear-gradient(135deg, #67C23A, #53a11d)';
      } else if (skill.includes('烟雾识别') || skill.includes('未穿工服')) {
        return 'linear-gradient(135deg, #F56C6C, #e74c4c)';
      } else if (skill.includes('明火识别') || skill.includes('人员离岗')) {
        return 'linear-gradient(135deg, #E6A23C, #d38b1c)';
      } else if (skill.includes('人员聚集')) {
        return 'linear-gradient(135deg, #909399, #6e7175)';
      }
      
      // 默认渐变色
      return 'linear-gradient(135deg, #909399, #6e7175)';
    },

    // 按标签筛选设备列表
    filterByTag(tagName) {
      // 直接调用多标签筛选方法，传入单个标签的数组
      this.filterByMultipleTags([tagName]);
    },

    // 获取所有标签列表
    fetchAllTags() {
      this.loading = true;
      
      cameraAPI.getAllTags()
        .then(response => {
          if (response.data.code === 0) {
            // 设置所有标签列表
            this.allTags = response.data.data.tags || [];
            console.log('获取所有标签成功:', this.allTags);
          } else {
            console.error('获取标签列表失败:', response.data.msg);
            this.$message.error('获取标签列表失败：' + (response.data.msg || '未知错误'));
            
            // 如果API调用失败，使用uniqueTags作为后备
            this.allTags = [...this.uniqueTags];
          }
        })
        .catch(error => {
          console.error('获取标签列表出错:', error);
          this.$message.error('获取标签列表失败：' + (error.message || '服务器错误'));
          
          // 如果API调用失败，使用uniqueTags作为后备
          this.allTags = [...this.uniqueTags];
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 添加新标签
    addNewTag() {
      if (this.newTagForm.name.trim() === '') {
        this.$message.warning('标签名称不能为空');
        return;
      }
      
      // 检查是否已存在相同标签
      const existingTag = this.allTags.find(tag => tag.name === this.newTagForm.name.trim());
      if (existingTag) {
        this.$message.warning('该标签已存在');
        return;
      }
      
      // 显示加载状态
      this.loading = true;
      
      // 创建标签数据
      const tagData = {
        name: this.newTagForm.name.trim(),
        description: this.newTagForm.description.trim() || undefined
      };
      
      // 调用API创建标签
      cameraAPI.createTag(tagData)
        .then(response => {
          if (response.data.code === 0) {
            // 创建标签成功
            const newTag = response.data.data;
            this.$message.success('添加标签成功');
            
            // 刷新标签列表
            this.fetchAllTags();
          } else {
            this.$message.error('创建标签失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('创建标签出错:', error);
          this.$message.error('创建标签失败：' + (error.message || '服务器错误'));
        })
        .finally(() => {
          // 关闭对话框
          this.addTagDialogVisible = false;
          
          // 结束加载状态
          this.loading = false;
        });
    },

    // 更新设备标签到服务器
    updateDeviceTag(deviceId, tagObj) {
      // 获取设备当前的所有标签
      const deviceIndex = this.deviceList.findIndex(d => d.id === deviceId);
      if (deviceIndex === -1) return;
      
      const device = this.deviceList[deviceIndex];
      const deviceTags = device.tags || [];
      
      // 准备API所需的标签数据
      const updateData = {
        tags: deviceTags.map(tag => {
          if (typeof tag === 'string') {
            return { name: tag };
          } else {
            return {
              name: tag.name,
              description: tag.detail || tag.description
            };
          }
        })
      };
      
      // 调用更新摄像头API
      cameraAPI.updateCamera(deviceId, updateData)
        .then(response => {
          if (response.data.code !== 0) {
            console.warn('更新设备标签失败:', response.data.msg);
          }
        })
        .catch(error => {
          console.error('更新设备标签出错:', error);
        });
    },

    // 更新设备标签
    updateDeviceWithTag(deviceId, tagObj) {
      // 如果有更新设备标签的API，可以在这里调用
      // 这里仅作为示例，简单地添加到前端数据中
      const deviceIndex = this.deviceList.findIndex(d => d.id === deviceId);
      if (deviceIndex !== -1) {
        const updatedDevice = { ...this.deviceList[deviceIndex] };
        if (!updatedDevice.tags) {
          updatedDevice.tags = [];
        }
        
        // 确保不重复添加相同标签
        const existingTagIndex = updatedDevice.tags.findIndex(
          tag => (typeof tag === 'string' ? tag : tag.name) === tagObj.name
        );
        
        if (existingTagIndex === -1) {
          updatedDevice.tags.push(tagObj);
        }
        
        // 更新设备
        this.$set(this.deviceList, deviceIndex, updatedDevice);
      }
    },

    // 处理左侧技能点击事件
    handleLeftMenuSkillClick(skill) {
      // 设置显示左侧技能菜单标志
      this.showLeftSkillMenu = true;
      
      // 检查技能是否已选
      const skillExists = this.selectedSkillCache.includes(skill);
      
      // 直接打开配置弹框，不经过选择技能对话框
      this.configureSkill(skill, !skillExists);
      
      // 选择技能对话框在这种情况下不需要显示
      this.skillSelectDialogVisible = false;
    },

    // 新增：添加标签
    addSelectedTag(value) {
      if (!value) return;
      
      // 检查是否已经添加了该标签
      if (this.deviceForm.tags.includes(value)) {
        // 已存在的标签不再显示提示
        // this.$message.warning('该标签已添加'); 
        return;
      } else {
        this.deviceForm.tags.push(value);
      }
      
      // 清空选择框
      this.$nextTick(() => {
        this.tagInputValue = '';
      });
    },

    // 清空所有标签
    clearAllTags() {
      this.deviceForm.tags = [];
      this.tagInputValue = '';
      // 移除不必要的成功提示
      // this.$message.success('所有标签已清空');
    },

    // 清空标签筛选
    clearTagFilter() {
      this.currentFilteredTags = [];
      
      // 构建查询参数
      const params = {};
      
      // 如果有地点筛选条件，保留它
      if (this.currentLocationFilter) {
        params.location = this.currentLocationFilter;
        this.fetchCameraList(params);
        
        // 移除不必要的成功提示
        // this.$message.success(`已清除标签筛选，仍保留地点为"${this.currentLocationFilter}"的筛选条件`);
      } else {
        // 如果没有地点筛选，直接获取所有设备
        this.fetchCameraList();
        // 移除不必要的成功提示
        // this.$message.success('已清空所有筛选条件');
      }
    },

    // 添加搜索处理方法
    handleGb28181Search(query) {
      // 保存查询条件
      this.gb28181CamerasQuery = query;
      
      // 如果查询条件变化，重置页码
      if (query) {
        this.gb28181CamerasPage = 1;
      }
      
      // 重新获取设备列表
      this.fetchGb28181Cameras();
    },

    // 初始化拉流和推流摄像头模拟数据
    initMockCameras() {
      // 推流摄像头模拟数据
      const pushCameras = [
        { id: 'push1', name: 'RTMP摄像头1', type: 'push' },
        { id: 'push2', name: 'RTMP摄像头2', type: 'push' },
        { id: 'push3', name: 'HTTP摄像头1', type: 'push' }
      ];
      
      // 拉流摄像头模拟数据
      const pullCameras = [
        { id: 'pull1', name: 'RTSP摄像头1', type: 'pull' },
        { id: 'pull2', name: 'RTSP摄像头2', type: 'pull' },
        { id: 'pull3', name: 'HLS摄像头', type: 'pull' },
        { id: 'pull4', name: 'FLV摄像头', type: 'pull' }
      ];
      
      // 合并模拟数据
      this.cameras = [...pushCameras, ...pullCameras];
    },

    // 处理摄像头选择变更
    handleCameraChange(cameraId) {
      console.log('选择的摄像头ID:', cameraId);
      
      // 如果是国标设备类型并且选择了摄像头
      if (this.deviceForm.type === 'gb28181' && cameraId) {
        // 查找选择的摄像头
        const selectedCamera = this.gb28181Cameras.find(camera => camera.id === cameraId);
        
        if (selectedCamera) {
          console.log('选择了国标设备:', selectedCamera);
          
          // 获取原始数据
          const originalData = selectedCamera.original_data || selectedCamera;
          
          // 自动填充国标设备的特定字段
          this.cameraTypeSpecificFields.deviceId = originalData.deviceId || originalData.id || '';
          this.cameraTypeSpecificFields.channelId = originalData.channelId || originalData.deviceId || originalData.id || '';
          
          // 移除自动填充设备名称的代码
        }
      } 
      // 如果是推流设备类型并且选择了摄像头
      else if (this.deviceForm.type === 'push' && cameraId) {
        // 查找选择的摄像头
        const selectedCamera = this.pushStreamCameras.find(camera => camera.id === cameraId);
        
        if (selectedCamera) {
          console.log('选择了推流设备:', selectedCamera);
          
          // 获取原始数据
          const originalData = selectedCamera.original_data || selectedCamera;
          
          // 自动填充推流设备的特定字段
          this.cameraTypeSpecificFields.app = originalData.app || selectedCamera.app || 'live';
          this.cameraTypeSpecificFields.stream = originalData.stream || selectedCamera.stream || '';
          this.cameraTypeSpecificFields.push_id = selectedCamera.id || '';
          
          // 移除自动填充设备名称的代码
        }
      }
      // 如果是拉流设备类型并且选择了摄像头
      else if (this.deviceForm.type === 'pull' && cameraId) {
        // 查找选择的摄像头
        const selectedCamera = this.proxyStreamCameras.find(camera => camera.id === cameraId);
        
        if (selectedCamera) {
          console.log('选择了拉流设备:', selectedCamera);
          
          // 获取原始数据
          const originalData = selectedCamera.original_data || selectedCamera;
          
          // 自动填充拉流设备的特定字段
          this.cameraTypeSpecificFields.app = originalData.app || selectedCamera.app || 'live';
          this.cameraTypeSpecificFields.stream = originalData.stream || selectedCamera.stream || '';
          this.cameraTypeSpecificFields.proxy_id = selectedCamera.id || '';
          
          // 移除自动填充设备名称的代码
        }
      }
    },

    // 打开编辑标签对话框
    openEditTagDialog(tag) {
      this.editTagForm = {
        id: tag.id,
        name: tag.name,
        description: tag.description || ''
      };
      this.editTagDialogVisible = true;
    },
    
    // 更新标签
    updateTag() {
      if (!this.editTagForm.name.trim()) {
        this.$message.warning('标签名称不能为空');
        return;
      }
      
      // 检查是否已存在相同名称的标签（排除当前编辑的标签）
      const existingTag = this.allTags.find(
        tag => tag.name === this.editTagForm.name.trim() && tag.id !== this.editTagForm.id
      );
      
      if (existingTag) {
        this.$message.warning('该标签名已存在');
        return;
      }
      
      // 显示加载状态
      this.loading = true;
      
      // 准备更新数据
      const updateData = {
        name: this.editTagForm.name.trim(),
        description: this.editTagForm.description.trim() || undefined
      };
      
      // 调用API更新标签
      cameraAPI.updateTag(this.editTagForm.id, updateData)
        .then(response => {
          if (response.data.code === 0) {
            // 刷新标签列表
            this.fetchAllTags();
            this.$message.success('标签更新成功');
          } else {
            // 如果API调用成功但业务逻辑失败，在前端更新
            const tagIndex = this.allTags.findIndex(tag => tag.id === this.editTagForm.id);
            if (tagIndex !== -1) {
              this.$set(this.allTags, tagIndex, {
                ...this.allTags[tagIndex],
                name: updateData.name,
                description: updateData.description
              });
              this.$message.warning('标签已在前端更新，但服务器端更新失败：' + (response.data.msg || '未知错误'));
          } else {
            this.$message.error('更新标签失败：' + (response.data.msg || '未知错误'));
            }
          }
        })
        .catch(error => {
          console.error('更新标签出错:', error);
          this.$message.error('更新标签失败：' + (error.message || '服务器错误'));
          
          // 如果API调用失败，在前端更新
          const tagIndex = this.allTags.findIndex(tag => tag.id === this.editTagForm.id);
          if (tagIndex !== -1) {
            this.$set(this.allTags, tagIndex, {
              ...this.allTags[tagIndex],
              name: updateData.name,
              description: updateData.description
            });
            this.$message.warning('标签已在前端更新，但服务器端不可用');
          }
        })
        .finally(() => {
          this.editTagDialogVisible = false;
          this.loading = false;
        });
    },

    // 确认删除标签
    confirmDeleteTag(tag) {
      this.$confirm(
        `确认删除标签 "${tag.name}" 吗？${tag.camera_count > 0 ? `该标签已被 ${tag.camera_count} 个设备使用，删除后将解除关联。` : ''}`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 显示加载状态
      this.loading = true;
        
        // 调用API删除标签
      cameraAPI.deleteTag(tag.id)
        .then(response => {
          if (response.data.code === 0) {
              // 刷新标签列表
              this.fetchAllTags();
            this.$message.success(`标签 "${tag.name}" 删除成功`);
          } else {
              // 如果API调用成功但业务逻辑失败，在前端更新
              this.allTags = this.allTags.filter(t => t.id !== tag.id);
              this.$message.warning(`标签已在前端删除，但服务器端删除失败：${response.data.msg || '未知错误'}`);
          }
        })
        .catch(error => {
          console.error('删除标签出错:', error);
          this.$message.error('删除标签失败：' + (error.message || '服务器错误'));
            
            // 如果API调用失败，在前端删除
            this.allTags = this.allTags.filter(t => t.id !== tag.id);
            this.$message.warning('标签已在前端删除，但服务器端不可用');
        })
        .finally(() => {
          this.loading = false;
          });
      }).catch(() => {
        // 用户点击取消，不做操作
        });
    },
    
    // 打开添加标签对话框
    openAddTagDialog() {
      this.newTagForm = {
        name: '',
        description: ''
      };
      this.addTagDialogVisible = true;
    },

    // 根据地点筛选设备列表
    filterByLocation(location) {
      // 设置当前地点筛选条件
      this.currentLocationFilter = location;
      
      // 重置分页
      this.currentPage = 1;
      
      // 构建查询参数
      const params = { location: location };
      
      // 如果有标签筛选条件，一并加入
        if (this.currentFilteredTags.length > 0) {
            params.tags = this.currentFilteredTags;
            params.match_all = this.tagMatchType === 'all';
        }
      
      // 调用API进行筛选
        this.fetchCameraList(params);
      
      // 移除不必要的成功提示
      // let message = `已筛选地点为"${location}"的设备`;
      // if (this.currentFilteredTags.length > 0) {
      //   const matchType = this.tagMatchType === 'all' ? "同时包含" : "包含其中之一";
      //   const tagDisplay = this.currentFilteredTags.map(t => `"${t}"`).join("、");
      //   message += `，且${matchType}标签 ${tagDisplay}`;
      // }
      // this.$message.success(message);
      
      // 在控制台输出筛选参数，方便调试
      console.log('正在按地点筛选:', location, '当前标签筛选:', this.currentFilteredTags);
    },
    
    // 获取地点颜色
    getLocationColor(location) {
      // 如果是当前选中的地点，不在这里返回颜色（由模板控制）
      if (this.currentLocationFilter === location) {
        return ''; // 返回空值，由模板的:color属性直接设置为蓝色
      }
      
      // 这里根据地点内容生成不同的颜色
      const colors = [
        '#f0f2f5',  // 默认浅灰色
        '#e6f7ff',  // 浅蓝
        '#f6ffed',  // 浅绿
        '#fffbe6',  // 浅黄
        '#fff2e8',  // 浅橙
        '#fff1f0',  // 浅红
      ];

      // 使用字符串哈希算法生成随机但确定的颜色索引
      const hash = Array.from(location).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      return colors[Math.abs(hash) % colors.length];
    },

    filterAllLocations() {
      this.currentLocationFilter = '';
      
      // 构建查询参数
      const params = {};
      
      // 如果有标签筛选条件，保留它们
      if (this.currentFilteredTags.length > 0) {
        params.tags = this.currentFilteredTags;
        params.match_all = this.tagMatchType === 'all';
        this.fetchCameraList(params);
        
        // 移除不必要的成功提示
        // const matchType = this.tagMatchType === 'all' ? "同时包含" : "包含其中之一";
        // const tagDisplay = this.currentFilteredTags.map(t => `"${t}"`).join("、");
        // this.$message.success(`已清除地点筛选，仍保留${matchType}标签 ${tagDisplay} 的筛选条件`);
      } else {
        // 如果没有标签筛选，直接获取所有设备
        this.fetchCameraList();
        // 移除不必要的成功提示
        // this.$message.success('已清除所有筛选条件');
      }
    },

    // 获取所有地点数据
    fetchAllLocations() {
      this.loading = true;
      
      // 使用不分页的API调用获取所有设备，或指定一个大的页面大小
      const params = {
        page: 1,
        limit: 1000  // 使用一个大的值来尝试获取所有设备
      };
      
      cameraAPI.getCameraList(params)
        .then(response => {
          if (response.data.code === 0) {
            // 统计所有地点数量
            const locationCounts = {};
            
            response.data.data.forEach(camera => {
              const location = camera.location || '未知地点';
              if (!locationCounts[location]) {
                locationCounts[location] = 0;
              }
              locationCounts[location]++;
            });
            
            // 转换为数组格式并排序
            this.allLocations = Object.entries(locationCounts).map(([name, count]) => ({
              name: name,
              count: count
            })).sort((a, b) => {
              // 首先按数量降序排序
              if (b.count !== a.count) {
                return b.count - a.count;
              }
              // 数量相同时按名称升序排序
              return a.name.localeCompare(b.name);
            });
            
            console.log('获取所有地点数据成功，共', this.allLocations.length, '个地点');
            console.log('地点数据详情:', this.allLocations);
                } else {
            console.error('获取所有地点数据失败:', response.data);
            this.$message.error('获取地点数据失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('获取所有地点数据出错:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 按多个标签筛选设备列表
    filterByMultipleTags(tagNames, matchAll = true) {
      if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
        return;
      }
      
      // 重置分页
      this.currentPage = 1;
      
      // 构建查询参数
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        match_all: matchAll,
        tags: tagNames
      };
      
      // 如果有地点筛选条件，一并加入
      if (this.currentLocationFilter) {
        params.location = this.currentLocationFilter;
      }
      
      // 在控制台输出筛选参数，方便调试
      console.log('正在按标签筛选:', tagNames, '匹配所有标签:', matchAll, '当前地点筛选:', this.currentLocationFilter);
      
      this.loading = true;
      
      // 直接调用API
      cameraAPI.getCameraList(params)
        .then(response => {
          if (response.data.code === 0) {
            console.log('筛选API返回数据:', response.data);
            console.log('API请求参数:', response.config.params);
            
            // 将获取的摄像头列表转换为前端所需的设备列表格式
            this.deviceList = response.data.data.map(camera => {
              return {
                id: camera.id,
                name: camera.name,
                status: camera.status ? 'online' : 'offline',
                location: camera.location,
                tags: camera.tags || [],
                skill: Array.isArray(camera.skill_names) ? camera.skill_names.join(', ') : '-',
                camera_type: camera.camera_type,
                config: this.buildConfigFromCamera(camera),
                camera_uuid: camera.camera_uuid,
                deviceId: camera.deviceId,
                gb_id: camera.gb_id
              };
            });
            
            // 保存原始数据，用于重置
            this.originalDeviceList = [...this.deviceList];
            
            // 更新总数
            this.total = response.data.total || 0;
            
            // 只在没有找到结果时显示提示
            if (this.deviceList.length === 0) {
              let message = '';
              const matchType = matchAll ? "同时包含" : "包含其中之一";
              const tagDisplay = tagNames.map(t => `"${t}"`).join("、");
              
              if (this.currentLocationFilter) {
                message = `没有找到地点为"${this.currentLocationFilter}"且${matchType}标签 ${tagDisplay} 的设备`;
              } else {
                message = `没有找到${matchType}标签 ${tagDisplay} 的设备`;
              }
              this.$message.info(message);
            }
            // 去掉成功找到结果的提示
            
          } else {
            this.$message.error('筛选失败：' + (response.data.msg || '未知错误'));
          }
        })
        .catch(error => {
          console.error('筛选出错:', error);
          this.$message.error('筛选失败：' + (error.message || '服务器错误'));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 获取未选择的标签列表
    getAvailableTags() {
      // 过滤掉已选择的标签
      return this.allTags.filter(tag => !this.deviceForm.tags.includes(tag.name));
    },

    // 切换标签筛选
    toggleFilterTag(tagName) {
      if (this.currentFilteredTags.includes(tagName)) {
        // 如果标签已被选中，则移除
        this.removeFilterTag(tagName);
      } else {
        // 如果标签未被选中，则添加
        this.currentFilteredTags.push(tagName);
        // 应用筛选
        this.applyTagFilter();
      }
    },
    
    // 移除筛选标签
    removeFilterTag(tagName) {
      const index = this.currentFilteredTags.indexOf(tagName);
      if (index !== -1) {
        this.currentFilteredTags.splice(index, 1);
        
        // 如果没有选中的标签，清空筛选
        if (this.currentFilteredTags.length === 0) {
          this.clearTagFilter();
        } else {
          // 否则重新应用筛选
          this.applyTagFilter();
        }
      }
    },
    
    // 应用标签筛选
    applyTagFilter() {
      if (this.currentFilteredTags.length === 0) {
            return;
          }
          
      
      // 决定是使用AND还是OR逻辑
      const matchAll = this.tagMatchType === 'all';
      
      // 调用已有的多标签筛选方法
      this.filterByMultipleTags(this.currentFilteredTags, matchAll);
    },

    // 处理标签操作（编辑/删除）
    handleTagAction(command, tag) {
      if (command === 'edit') {
        this.openEditTagDialog(tag);
      } else if (command === 'delete') {
        this.confirmDeleteTag(tag);
      }
    },
    
    toggleAvailableTagsCollapse() {
      this.availableTagsCollapsed = !this.availableTagsCollapsed;
    },
    
    toggleSelectedTagsCollapse() {
      this.selectedTagsCollapsed = !this.selectedTagsCollapsed;
    },

    // 监听表单对话框打开，确保数据已加载
    handleDialogOpened() {
      console.log('对话框已打开，设备表单:', this.deviceForm);
      
      // 如果是编辑模式，需要确保摄像头列表已经加载，并设置当前选中的摄像头
      if (this.deviceForm.id !== 0 && !!this.deviceForm.id) {
        console.log('编辑模式，设备类型:', this.deviceForm.type, '摄像头ID:', this.deviceForm.cameraId);
        
        // 确保根据设备类型加载摄像头列表
        if (this.deviceForm.type === 'gb28181') {
          // 如果国标设备列表为空或未加载，则加载列表
          if (this.gb28181Cameras.length === 0) {
            console.log('正在加载国标设备列表...');
            this.fetchGb28181Cameras();
          }
        } else if (this.deviceForm.type === 'push') {
          // 如果推流设备列表为空或未加载，则加载列表
          if (this.pushStreamCameras.length === 0) {
            console.log('正在加载推流设备列表...');
            this.fetchPushStreamCameras();
          }
        } else if (this.deviceForm.type === 'pull') {
          // 如果拉流设备列表为空或未加载，则加载列表
          if (this.proxyStreamCameras.length === 0) {
            console.log('正在加载拉流设备列表...');
            this.fetchProxyStreamCameras();
          }
        }
      }
      // 如果是新增模式，则根据所选设备类型加载对应的摄像头列表
      else if (this.deviceForm.type) {
        if (this.deviceForm.type === 'gb28181' && this.gb28181Cameras.length === 0) {
          this.fetchGb28181Cameras();
        } else if (this.deviceForm.type === 'push' && this.pushStreamCameras.length === 0) {
          this.fetchPushStreamCameras();
        } else if (this.deviceForm.type === 'pull' && this.proxyStreamCameras.length === 0) {
          this.fetchProxyStreamCameras();
        }
      }
    },

    // 获取摄像头名称
    getCameraNameById(cameraId, type) {
      if (!cameraId) return '未知摄像头';
      
      // 根据设备类型从对应的列表中查找摄像头
      if (type === 'gb28181') {
        const camera = this.gb28181Cameras.find(c => c.id === cameraId);
        if (camera) {
          return camera.name;
        }
      } else if (type === 'push') {
        const camera = this.pushStreamCameras.find(c => c.id === cameraId);
        if (camera) {
          return `${camera.name} (${camera.app || ''}/${camera.stream || ''})`;
        }
      } else if (type === 'pull') {
        const camera = this.proxyStreamCameras.find(c => c.id === cameraId);
        if (camera) {
          return `${camera.name} (${camera.app || ''}/${camera.stream || ''})`;
        }
      } else {
        const camera = this.cameras.find(c => c.id === cameraId);
        if (camera) {
          return camera.name;
        }
      }
      
      // 如果在列表中找不到，则尝试使用设备表单中的名称
      if (this.deviceForm && this.deviceForm.name) {
        // 如果是编辑模式且存在source_name，优先使用source_name
        if (this.deviceForm.id && this.deviceForm.source_name) {
          return this.deviceForm.source_name;
        }
        return this.deviceForm.name;
      }
      
      // 如果都找不到，则返回摄像头ID或默认值
      return cameraId ? `摄像头 #${cameraId}` : '未知摄像头';
    },

    getSelectedCameraIP() {
      const selectedCamera = this.gb28181Cameras.find(camera => camera.id === this.deviceForm.cameraId);
      if (selectedCamera) {
        return selectedCamera.ip || '-';
      }
      return '-';
    },

    getSelectedCameraStatus() {
      const selectedCamera = this.gb28181Cameras.find(camera => camera.id === this.deviceForm.cameraId);
      if (selectedCamera) {
        return selectedCamera.status === 'online';
      }
      return false;
    },

    getSelectedCameraPushingStatus() {
      const selectedCamera = this.pushStreamCameras.find(camera => camera.id === this.deviceForm.cameraId);
      if (selectedCamera) {
        return selectedCamera.pushing;
      }
      return false;
    },

    getSelectedCameraPullingStatus() {
      const selectedCamera = this.proxyStreamCameras.find(camera => camera.id === this.deviceForm.cameraId);
      if (selectedCamera) {
        return selectedCamera.pulling;
      }
      return false;
    },

    // 获取技能类列表
    fetchSkillClasses() {
      this.skillOptionsLoading = true;
      
      // 构建请求参数，只获取启用状态的技能
      const params = {
        page: 1,
        limit: 100, // 设置较大的限制以获取所有技能
        status: true // 只获取启用状态的技能
      };
      
      // 调用API获取技能类列表
      skillAPI.getAITaskSkillClasses(params)
          .then(response => {
          console.log('获取技能类列表API响应:', response.data);
          
          // 检查API返回的数据结构
          if (response.data && response.data.code === 0) {
            // 从data数组中获取技能列表
            const skillClasses = response.data.data || [];
            
            // 将API返回的技能类转换为下拉选项格式
            this.skillOptions = skillClasses.map(skill => ({
              label: `${skill.name_zh} (${skill.name})`,
              value: skill.name_zh, // 使用中文名称作为值
              id: skill.id,
              name: skill.name,
              name_zh: skill.name_zh,
              type: skill.type,
              version: skill.version,
              status: skill.status
            }));
            
            // 记录总数
            this.skillOptionsTotal = response.data.total || this.skillOptions.length;
            
            console.log('成功解析技能列表:', this.skillOptions);
            } else {
            console.error('获取技能类列表失败:', response.data);
            this.$message.error('获取技能类列表失败：' + (response.data.msg || '未知错误'));
              
            // 设置默认空数组
            this.skillOptions = [];
            }
          })
          .catch(error => {
          console.error('获取技能类列表出错:', error);
          this.$message.error('获取技能类列表失败：' + (error.message || '服务器错误'));

          // 设置默认空数组
          this.skillOptions = [];
          })
          .finally(() => {
          this.skillOptionsLoading = false;
        });
    },

    // 重置设备表单
    resetDeviceForm() {
      this.deviceForm = {
        name: '',
        source_name: '', // 清空摄像头名称字段
        type: '',
        cameraId: null, // 修改为null以确保下拉框重置
        location: '',
        skills: [],
        tags: []
      };
      this.cameraTypeSpecificFields = {}; // 清空类型特定字段
    },

    // 在API调用失败情况下，尝试使用本地数据更新UI
    updateDeviceWithLocalData() {
      const index = this.deviceList.findIndex(device => device.id === this.deviceForm.id);
      if (index !== -1) {
        // 创建一个合并了表单数据的更新对象
        const updatedDevice = {
          ...this.deviceList[index],  // 保留原有数据
          name: this.deviceForm.name || this.deviceList[index].name,
          // source_name不需要更新，仅用于前端显示
          location: this.deviceForm.location || this.deviceList[index].location,
          tags: this.deviceForm.tags || this.deviceList[index].tags || []
        };
        
        // 更新本地列表
        this.$set(this.deviceList, index, updatedDevice);
      // 更新原始列表
      this.originalDeviceList = [...this.deviceList];
        
        // 强制刷新整个列表
        this.deviceList = [...this.deviceList];
        
        // 提示用户
        this.$message.warning('数据可能已更新，但请刷新页面以确认');
        
        // 关闭对话框并重置表单
        this.deviceDialogVisible = false;
        this.resetDeviceForm();
        
        return true;
      }
      return false;
    },

    viewSkillDetails() {
      if (!this.currentSkill) {
        this.$message.warning('无法获取当前技能信息');
        return;
      }
      
      // 显示加载状态
      this.skillDetailData = null;
      this.skillDetailDialogVisible = true;
      
      // 获取当前技能名称
      const skillName = this.currentSkill;
      
      // 首先尝试通过API获取所有技能列表
      skillAPI.getAITaskSkillClasses({})
        .then(response => {
          if (response.data && response.data.code === 0) {
            const skillList = response.data.data || [];
            
            // 使用多种条件查找匹配的技能
            const matchedSkill = skillList.find(skill => 
              skill.name === skillName || 
              skill.name_zh === skillName || 
              (skill.aliases && skill.aliases.includes(skillName)) ||
              String(skill.id) === String(skillName)
            );
            
            if (matchedSkill && matchedSkill.id) {
              // 找到了技能ID，调用详情API
              console.log('找到匹配的技能ID:', matchedSkill.id);
              return skillAPI.getAITaskSkillDetail(matchedSkill.id);
            } else {
              // 如果找不到匹配的技能，不提供默认参数
              console.warn('找不到匹配的技能');
              this.skillDetailData = {
                params: {}
              };
              return null;
            }
          } else {
            throw new Error(response.data.msg || '获取技能列表失败');
          }
        })
        .then(response => {
          if (response) {
            if (response.data && (response.data.code === 0 || response.data.success)) {
              // 获取技能详情数据
              const skillDetail = response.data.data;
              
              // 从 default_config 中提取 params 数据
              if (skillDetail.default_config && skillDetail.default_config.params) {
                this.skillDetailData = {
                  id: skillDetail.id,
                  name: skillDetail.name,
                  name_zh: skillDetail.name_zh,
                  params: { ...skillDetail.default_config.params }
                };
                
                // 检查当前设备是否已有该技能的自定义配置
                if (this.currentDeviceId) {
                  const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
                  if (deviceIndex !== -1 && this.deviceList[deviceIndex].config) {
                    const deviceConfig = this.deviceList[deviceIndex].config;
                    // 尝试使用不同的键名查找配置
                    const skillConfig = deviceConfig[skillDetail.name_zh] || deviceConfig[skillDetail.name];
                    
                    if (skillConfig && skillConfig.customParams) {
                      // 如果有自定义参数，优先使用
                      this.skillDetailData.params = { ...skillConfig.customParams };
                    }
                  }
                }
              } else {
                // 如果没有 default_config.params，则不提供默认数据
                this.skillDetailData = {
                  id: skillDetail.id,
                  name: skillDetail.name,
                  name_zh: skillDetail.name_zh,
                  params: skillDetail.params || {}
                };
              }
            } else {
              throw new Error(response.data.msg || '获取技能详情失败');
            }
          }
          // 如果response为null，说明已经设置了默认值，不需要处理
        })
        .catch(error => {
          console.error('获取技能详情出错:', error);
          // 即使出错也显示空的参数对象而不是关闭对话框
          if (!this.skillDetailData) {
            this.skillDetailData = {
              params: {}
            };
          }
        });
    },
    
    // 格式化参数值显示
    formatParamValue(value) {
      if (Array.isArray(value)) {
        return value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    },
    
    // 获取参数对应的提示信息
    getParamTooltip(key) {
      const tooltips = {
        'classes': '模型检测的目标类型',
        'max_det': '最大检测目标数量',
        'iou_thres': 'IOU阈值，用于非极大值抑制',
        'conf_thres': '置信度阈值，控制检测灵敏度',
        'input_size': '输入图像尺寸，格式为宽×高'
      };
      return tooltips[key] || '';
    },
    
    // 保存修改后的技能详情
    saveSkillDetails() {
      if (!this.skillDetailData || !this.skillDetailData.params) {
        this.$message.error('无法保存：未找到技能参数数据');
        return;
      }
      
      // 如果当前正在配置技能，则同步更新到技能配置中
      if (this.currentSkill && this.currentDeviceId) {
        const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
        if (deviceIndex !== -1) {
          // 确保设备有config对象
          if (!this.deviceList[deviceIndex].config) {
            this.$set(this.deviceList[deviceIndex], 'config', {});
          }
          
          // 获取当前技能的最佳键名
          let skillKey = this.currentSkill;
          
          // 查找匹配的技能信息
          const skillInfo = this.skillOptions.find(option => 
            option.value === this.currentSkill || option.name_zh === this.currentSkill
          );
          
          // 如果找到了匹配的技能信息，使用其中文名称作为键
          if (skillInfo) {
            skillKey = skillInfo.name_zh;
          }
          
          // 获取当前配置
          let currentConfig = this.deviceList[deviceIndex].config[skillKey] || {};
          
          // 更新自定义参数
          currentConfig.customParams = { ...this.skillDetailData.params };
          
          // 保存回设备配置
          this.$set(this.deviceList[deviceIndex].config, skillKey, currentConfig);
          
          // 更新原始列表
          this.originalDeviceList = [...this.deviceList];
          
          this.$message.success('技能参数已保存，将在确认技能配置时应用');
        } else {
          this.$message.error('未找到设备，无法保存参数');
        }
      } else {
        this.$message.warning('技能参数已临时保存，但未关联到任何设备');
      }
      
      // 关闭对话框
      this.skillDetailDialogVisible = false;
    },

    // 添加处理单选技能的方法
    handleSingleSkillSelect(value) {
      console.log('选择技能:', value);
      
      if (!value) return;
      
      // 检查是否已经存在该技能
      if (this.selectedSkillCache.includes(value)) {
        this.$message.warning(`技能"${value}"已经添加过，不能重复添加`);
        this.skillSelectForm.selectedSkill = null; // 重置选择
        return;
      }
      
      // 将选择的技能添加到已选技能列表
      this.selectedSkillCache.push(value);
      this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
      
      // 重置单选框
      this.skillSelectForm.selectedSkill = null;
      
      // 自动配置新添加的技能
      this.configureSkill(value, true);
    },
  }
}

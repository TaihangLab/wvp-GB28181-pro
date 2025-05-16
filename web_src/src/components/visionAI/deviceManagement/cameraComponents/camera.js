import { cameraAPI, skillAPI } from '@/components/service/VisionAIService.js';

export default {
  name: 'CameraManagement',
  data() {
    return {
      // 摄像头列表数据
      deviceList: [],
      loading: true,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchKeyword: '',

      // 设备操作相关
      deviceDialogVisible: false,
      deviceForm: {
        name: '',
        source_name: '', // 摄像头原名称，仅前端显示用
        type: '',
        cameraId: null,
        location: '',
        skills: [],
        tags: []
      },

      // 暂存正在配置的技能名称
      tempConfiguredSkill: null,
      
      // 当前选中的技能
      currentSkill: null,
      
      // 当前选中技能的详细信息
      currentSkillInfo: null,
      
      // 当前操作的设备ID
      currentDeviceId: null,
      
      // 已选技能的缓存
      selectedSkillCache: [],

      // 摄像头关联的AI任务
      cameraRelatedTasks: [],
      // 任务加载状态
      taskLoading: false,

      // 摄像头类型筛选 - 新增
      currentCameraTypeFilter: 0,
      cameraTypeMap: {
        0: '全部类型',
        1: '国标设备',
        2: '推流设备',
        3: '拉流设备'
      },
      
      // 技能筛选 - 新增
      currentSkillFilter: '',
      
      // 技能对话框数据
      skillSelectDialogVisible: false,
      skillDialogVisible: false,
      skillForm: {
        status: true,
        alarmLevel: '二级预警',
        frequency: {
          seconds: 3,
          frames: 1
        },
        timeRanges: [
          {
            start: new Date(2024, 0, 1, 0, 0),
            end: new Date(2024, 0, 1, 23, 59)
          }
        ],
        electronicFence: {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          points: [],
          isDrawing: false,
          triggerMode: 'inside',
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        }
      },

      // 预警等级选项
      alarmLevelOptions: [
        { value: '一级预警', label: '一级预警', color: '#F56C6C' },
        { value: '二级预警', label: '二级预警', color: '#E6A23C' },
        { value: '三级预警', label: '三级预警', color: '#409EFF' },
        { value: '四级预警', label: '四级预警', color: '#67C23A' }
      ],

      // 表单验证规则
      rules: {
        name: [
          { max: 50, message: '任务名称不能超过50个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '任务描述不能超过200个字符', trigger: 'blur' }
        ],
        alarmLevel: [
          { required: true, message: '请选择预警等级', trigger: 'change' }
        ],
        frequency: [
          { 
            validator: (rule, value, callback) => {
              if (value.seconds < 1 || value.frames < 1) {
                callback(new Error('抽帧频率不能小于1'));
              } else if (value.seconds > 1 && value.frames > 1) {
                callback(new Error('不支持多秒多帧设置'));
              } else {
                callback();
              }
            }, 
            trigger: 'change' 
          }
        ],
        timeRanges: [
          { 
            validator: (rule, value, callback) => {
              if (value.length === 0) {
                callback(new Error('至少添加一个运行时段'));
              } else {
                for (let i = 0; i < value.length; i++) {
                  if (!value[i].start || !value[i].end) {
                    callback(new Error('请设置完整的时间范围'));
                    return;
                  }
                }
                callback();
              }
            }, 
            trigger: 'change' 
          }
        ]
      },
      
      // 技能选择相关
      skillSelectForm: {
        selectedSkill: '',
        selectedSkills: []
      },
      
      // 技能搜索关键词
      skillSearchKeyword: '',

      // 技能状态过滤
      skillStatusFilter: 'all',

      // 技能选项
      skillOptions: [],
      skillOptionsLoading: false,
      skillOptionsTotal: 0,
      
      // 是否显示左侧技能菜单（替代下拉框）
      showLeftSkillMenu: false,
      
      // 技能详情对话框
      skillDetailDialogVisible: false,
      skillDetailData: null,
      
      // 设备详情对话框
      deviceDetailDialogVisible: false,
      deviceDetailData: null,
    };
  },

  computed: {
    // 过滤后的摄像头列表
    filteredCameras() {
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        return this.deviceList.filter(item => item.name.toLowerCase().includes(keyword));
      }
      return this.deviceList;
    },

    // 过滤后的技能选项列表
    filteredSkillOptions() {
      if (!this.skillOptions || this.skillOptions.length === 0) {
        return [];
      }
      
      // 首先按状态过滤
      let filteredByStatus = this.skillOptions;
      if (this.skillStatusFilter !== 'all') {
        const statusValue = this.skillStatusFilter === 'true';
        filteredByStatus = this.skillOptions.filter(skill => skill.status === statusValue);
      }
      
      // 然后按关键词过滤
      if (!this.skillSearchKeyword) {
        return filteredByStatus;
      }
      
      const keyword = this.skillSearchKeyword.toLowerCase();
      return filteredByStatus.filter(skill => {
        return skill.name_zh && skill.name_zh.toLowerCase().includes(keyword) ||
               skill.value && skill.value.toLowerCase().includes(keyword) ||
               skill.type && skill.type.toLowerCase().includes(keyword);
      });
    }
  },

  created() {
    // 获取摄像头列表
    this.fetchCameraList();
    
    
    
    // 初始化摄像头类型筛选为全部(0)
    this.currentCameraTypeFilter = 0;

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
      


      // 在发送请求前，打印出请求参数用于调试
      console.log('发送API请求参数:', queryParams);
      
      cameraAPI.getCameraList(queryParams)
        .then(response => {
          console.log('获取摄像头列表原始响应:', response);
          console.log('获取摄像头列表响应data:', response.data);
          
          if (response.data && response.data.code === 0) {
            // 处理返回的数据
            let camerasData = response.data.data || [];
            this.total = response.data.total || camerasData.length;
            
            console.log('处理后的摄像头数据:', camerasData);
            console.log('摄像头总数:', this.total);
            
            // 将获取的摄像头列表转换为前端所需的设备列表格式
            const newDeviceList = camerasData.map(camera => {
              return {
                id: camera.id,
                name: camera.name,
                status: camera.status,
                location: camera.location || '-',
                skill: Array.isArray(camera.skill_names) ? camera.skill_names.join(', ') : '-',
                camera_type: camera.camera_type,
              };
            });
            
            // 使用Vue.set确保视图更新
            this.$set(this, 'deviceList', newDeviceList);
            
            // 保存原始数据，用于重置
            this.originalDeviceList = [...this.deviceList];
            
            
            
            // 检查当前页是否有数据，如果当前页没有数据且不是第一页，则回到前一页
            if (this.deviceList.length === 0 && this.currentPage > 1 && this.total > 0) {
              this.currentPage -= 1;
              // 重新获取上一页数据
              this.fetchCameraList();
            }
            
            // 强制下一次DOM更新后触发回调
            this.$nextTick(() => {
              console.log('DOM已更新，设备列表数据:', this.deviceList);
            });
          } else {
            this.$message.error('获取摄像头列表失败：' + (response.data && response.data.msg ? response.data.msg : '未知错误'));
          }
        })
        .catch(error => {
          console.error('获取摄像头列表出错:', error);
          this.$message.error('获取摄像头列表失败：' + (error.message || '服务器错误'));
          
          // 如果获取失败，使用空数组
          this.$set(this, 'deviceList', []);
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
          alarmLevel: camera.alert_level ? this.getAlarmLevelByValue(camera.alert_level) : '二级预警',
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
      
      // 保存当前摄像头类型筛选
      const currentCameraType = this.currentCameraTypeFilter;
      
      // 重置分页
      this.currentPage = 1;
      
      // 构建查询参数
      const params = {};

      // 添加摄像头类型筛选
      if (currentCameraType === 1) {
        params.camera_type = 1;
      } else if (currentCameraType === 2) {
        params.camera_type = 2;
      } else if (currentCameraType === 3) {
        params.camera_type = 3;
      }
      
      // 重置选择状态
      this.currentDeviceId = null;
      this.skillSelectForm.selectedSkills = [];
      this.selectedSkillCache = [];
      
      this.fetchCameraList(params);
    },
    
    // 添加刷新所有数据的方法（包括地点数据）
    refreshAllData() {
      // 清空搜索关键词
      this.searchKeyword = '';

      // 清空摄像头类型筛选
      this.currentCameraTypeFilter = 0;
      // 重置分页
      this.currentPage = 1;
      // 重新获取摄像头列表
      this.fetchCameraList();

      this.fetchSkillClasses()

      this.$message.success('所有数据刷新成功');
    },

    // 处理查看详情
    handleViewDetails(row) {
      // 显示加载状态
      this.loading = true;
      
      // 调用API获取完整的摄像头信息
      cameraAPI.getCameraDetail(row.id)
        .then(response => {
          // 检查API响应
          if (response.data && (response.data.success || response.data.code === 0)) {
            // 获取摄像头详细数据
            const camera = response.data.camera || response.data.data;
            console.log('获取到摄像头详细信息:', camera);
            
            // 创建详情对象
            this.deviceDetailData = camera;
            
            // 显示详情对话框
            this.deviceDetailDialogVisible = true;
            } else {
            // 处理API错误
            const errorMsg = response.data && response.data.message ? response.data.message : '获取摄像头详情失败';
            this.$message.error(errorMsg);
          }
        })
        .catch(error => {
          console.error('获取摄像头详情时出错:', error);
          this.$message.error('获取摄像头详情失败: ' + (error.message || '未知错误'));
        })
        .finally(() => {
          this.loading = false;
      });
    },

    // 处理配置技能
    handleConfigSkill(row) {
      // 设置当前设备ID，用于后续保存
      this.currentDeviceId = row.id;

      // 初始化技能选择表单和缓存
      this.skillSelectForm = {
        selectedSkills: []
      };
      this.selectedSkillCache = [];
      
      // 先确保获取最新的技能类列表
      if (!this.skillOptions || this.skillOptions.length === 0) {
        this.fetchSkillClasses();
      }
      
      // 获取当前摄像头的技能列表和关联任务
      if (row.id) {
        this.loading = true;
        
        // 获取摄像头关联的任务列表
        this.fetchCameraRelatedTasks(row.id);
        
        cameraAPI.getCameraDetail(row.id)
          .then(response => {
            if (response.data && (response.data.success || response.data.code === 0)) {
              const camera = response.data.camera || response.data.data;
              console.log('获取到摄像头详细信息:', camera);
              
              // 只加载已成功配置的技能列表
              if (camera.skill_names && Array.isArray(camera.skill_names)) {
                this.skillSelectForm.selectedSkills = [...camera.skill_names];
                this.selectedSkillCache = [...camera.skill_names];
                console.log('已加载摄像头的技能列表:', this.selectedSkillCache);
              }
            }
          })
          .catch(error => {
            console.error('获取摄像头详情时出错:', error);
          })
          .finally(() => {
            this.loading = false;
      // 打开选择技能对话框
      this.skillSelectDialogVisible = true;
          });
      } else {
        // 如果没有摄像头ID，直接打开对话框
        this.skillSelectDialogVisible = true;
      }
    },

    // 关闭选择技能对话框
    closeSkillSelectDialog() {
      // 关闭对话框
      this.skillSelectDialogVisible = false;
      
      // 重新获取设备详情，确保显示的是已成功配置的技能
      if (this.currentDeviceId) {
        this.refreshCameraDetail(this.currentDeviceId);
        // 重新获取关联任务数据
        this.fetchCameraRelatedTasks(this.currentDeviceId);
      }
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
      // 检查是否有选择技能
      if (this.skillSelectForm.selectedSkills.length === 0) {
        this.$message.warning('请至少选择一个技能');
        return;
      }

      // 保存用户当前选择的技能
      const selectedSkills = [...this.skillSelectForm.selectedSkills];
      
      // 关闭选择技能对话框
      this.skillSelectDialogVisible = false;
      
      // 刷新摄像头关联任务数据
      if (this.currentDeviceId) {
        this.refreshCameraDetail(this.currentDeviceId);
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
    },

    // 清除技能搜索
    clearSkillSearch() {
      this.skillSearchKeyword = '';
    },

    // 检查技能是否被选中
    isSkillSelected(skill) {
      return this.skillSelectForm.selectedSkills.includes(skill);
    },

    // 切换技能选择状态
    toggleSkillSelection(skill) {
      // 如果当前在选择技能对话框中
      if (this.skillSelectDialogVisible) {
        if (this.isSkillSelected(skill)) {
          // 如果技能已被选中，移除它
          this.removeSelectedSkill(skill);
        } else {
          // 如果技能未被选中，添加它
          this.skillSelectForm.selectedSkills.push(skill);
          
          // 直接配置该技能
          this.skillSelectDialogVisible = false;
          this.configureSkill(skill, true);
        }
      } else {
        // 如果不在选择对话框中，直接配置
        this.configureSkill(skill, true);
      }
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

        // 注意：这里不保存用户选择的技能到已选列表中
        // 只有当用户完成技能配置，成功创建AI任务后
        // 通过refreshCameraDetail方法获取最新的技能列表

        // 查找设备以生成默认名称和描述
        const deviceForDefault = this.deviceList.find(d => d.id === this.currentDeviceId);
        const deviceName = deviceForDefault ? deviceForDefault.name : '';
        
        // 初始化技能表单
        this.skillForm = {
          selectedSkill: [skill], // 注意这里是数组
          status: true, // 默认启用
          name: `${deviceName}-${skill}分析任务`, // 优化后的默认任务名称
          description: `此任务使用${skill}技术对${deviceName}进行智能分析，可自动识别并进行预警`, // 优化后的默认任务描述
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
          tempPoints: [],
          draggedPointIndex: -1,
          isDragging: false,
          currentPolygon: []
        },
          images: []
        };

        // 获取当前技能的完整信息
        const skillInfo = this.skillOptions.find(option => 
          option.value === skill || option.name_zh === skill
        );
        
        // 当前选中的技能名称
        this.currentSkill = skill;
        
        // 保存当前技能的详细信息
        this.currentSkillInfo = skillInfo || {
          value: skill,
          name_zh: skill,
          version: '',
          type: ''
        };

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

        // 如果是新选择的技能且之前未被选中，暂存到临时变量中
        if (isNewSelection && !this.isSkillSelected(skill)) {
          // 将新选择的技能保存到临时变量
          this.tempConfiguredSkill = skill;
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
      
      // 查找设备和技能名称，用于默认值
      const deviceForDefaults = this.deviceList.find(d => d.id === this.currentDeviceId);
      const deviceName = deviceForDefaults ? deviceForDefaults.name : '';
      const skillName = this.currentSkill || '';
      
      // 加载任务名称和描述，如果没有已保存的值则使用默认值
      this.skillForm.name = configCopy.name || `${deviceName}-${skillName}分析任务`;
      this.skillForm.description = configCopy.description || `此任务使用${skillName}技术对${deviceName}进行智能分析，可自动识别并进行预警`;

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

              // 准备创建AI任务的数据
              const taskData = {
                // 使用用户输入的任务名称，如果没有则使用默认值
                name: this.skillForm.name || `${this.deviceList[deviceIndex].name}-${skillKey}分析任务`,
                // 使用用户输入的任务描述，如果没有则使用默认值
                description: this.skillForm.description || `此任务使用${skillKey}技术对${this.deviceList[deviceIndex].name}进行智能分析，可自动识别并进行预警`,
                // 预警等级转换为数字
                alert_level: this.getWarningLevelValue(this.skillForm.alarmLevel),
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
                  trigger_mode: this.skillForm.electronicFence.triggerMode || 'inside'
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
              
              // 获取技能参数，无论用户是否点击过保存按钮
              this.getSkillParams(skillInfo ? skillInfo.id : null, skillKey)
                .then(params => {
                  // 添加获取到的参数到任务数据中
                  if (params && Object.keys(params).length > 0) {
                    taskData.skill_custom_config.params = params;
                    console.log('使用获取到的参数:', params);
                  } else {
                    // 如果无法获取默认参数，则尝试使用已保存的参数
                    if (this.deviceList[deviceIndex].config && 
                        this.deviceList[deviceIndex].config[skillKey] && 
                        this.deviceList[deviceIndex].config[skillKey].customParams) {
                      // 如果设备配置中已有自定义参数，直接使用
                      taskData.skill_custom_config.params = { ...this.deviceList[deviceIndex].config[skillKey].customParams };
                    } else if (config && config.customParams) {
                      // 兼容旧逻辑，如果配置对象中有自定义参数，使用配置对象中的
                      taskData.skill_custom_config.params = { ...config.customParams };
                    }
                  }
                  
                  // 继续创建AI任务
                  this.createAITaskWithParams(taskData, deviceIndex, skillKey, config);
                })
                .catch(error => {
                  console.error('获取技能参数失败:', error);
                  // 如果获取参数失败，仍然尝试创建AI任务，但使用已有的参数
                  this.createAITaskWithParams(taskData, deviceIndex, skillKey, config);
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
    
    // 重置设备表单
    resetDeviceForm() {
      this.deviceForm = {
        name: '',
        source_name: '', // 清空摄像头名称字段
        type: '',
        cameraId: null, // 修改为null以确保下拉框重置
        location: '',
        skills: [],
      };
      this.cameraTypeSpecificFields = {}; // 清空类型特定字段
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

    // 将摄像头类型数字转换为对应的中文名称
    getCameraTypeText(type) {
      const typeMap = {
        1: '国标设备',
        2: '推流设备',
        3: '代理拉流',
      };
      return typeMap[type] || `未知类型(${type})`;
    },
    
    // 获取摄像头图标
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

    // 格式化属性标签
    formatPropertyLabel(key) {
      // 属性名映射表
      const labelMap = {
        // 基本属性 
        'id': '设备ID',
        'name': '设备名称',
        'location': '设备位置',
        'status': '设备状态',
        'camera_type': '设备类型',
        
        // 设备属性（所有类型）
        'gbDeviceId': '国标-编码',
        'gbManufacturer': '国标-设备厂商',
        'gbModel': '国标-设备型号',
        'gbOwner': '国标-设备归属',
        'gbCivilCode': '国标-行政区域',
        'gbBlock': '国标-警区',
        'gbParental': '国标-是否有子设备',
        'gbParentId': '国标-父节点ID',
        'gbSafetyWay': '国标-信令安全模式',
        'gbRegisterWay': '国标-注册方式',
        'gbCertNum': '国标-证书序列号',
        'gbCertifiable': '国标-证书有效标识',
        'gbErrCode': '国标-无效原因码',
        'gbEndTime': '国标-证书终止有效期',
        'gbSecrecy': '国标-保密属性',
        'gbIpAddress': '国标-设备/系统IPv4/IPv6地址',
        'gbPort': '国标-设备/系统端口',
        'gbPassword': '国标-设备口令',
        'gbLongitude': '国标-经度 WGS-84坐标系',
        'gbLatitude': '国标-纬度 WGS-84坐标系',
        'gpsAltitude': 'GPS-海拔',
        'gpsSpeed': 'GPS-速度',
        'gpsDirection': 'GPS-方向',
        'gpsTime': 'GPS-时间',
        'gbBusinessGroupId': '国标-虚拟组织所属的业务分组ID',
        'gbPtzType': '国标-摄像机结构类型',
        'gbPositionType': '国标-摄像机位置类型扩展',
        'gbRoomType': '国标-摄像机安装位置室外/室内属性',
        'gbUseType': '国标-用途属性',
        'gbSupplyLightType': '国标-摄像机补光属性',
        'gbDirectionType': '国标-摄像机监视方位',
        'gbResolution': '国标-摄像机支持的分辨率',
        'gbDownloadSpeed': '国标-下载倍速',
        'gbSvcSpaceSupportMod': '国标-空域编码能力',
        'gbSvcTimeSupportMode': '国标-时域编码能力',
        'recordPLan': '录制计划（每位代表半小时）',
        'dataDeviceId': '关联的设备ID',
        'createTime': '创建时间',
        'updateTime': '更新时间'
      };
      
      // 尝试从映射表中获取标签，如果不存在则格式化原始key
      return labelMap[key] || this.formatKeyAsLabel(key);
    },
    
    // 将驼峰或下划线命名的属性key转换为更友好的标签
    formatKeyAsLabel(key) {
      // 处理驼峰命名
      const formatted = key
        .replace(/([A-Z])/g, ' $1') // 在大写字母前添加空格
        .replace(/_/g, ' ') // 将下划线替换为空格
        .toLowerCase() // 转为小写
        .trim(); // 去除首尾空格
      
      // 首字母大写
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    },
    
    // 获取设备特定信息，过滤掉基本信息和技能信息
    getDeviceSpecificInfo(deviceData) {
      if (!deviceData) return {};
      
      // 需要排除的通用属性（这些属性已经在基本信息区域显示）
      const excludeProps = [
        'id', 'name', 'status', 'location', 'camera_type', 
        'skill_names', 'createTime', 'updateTime'
      ];
      
      // 创建结果对象
      const result = {};
      
      // 遍历所有属性，排除通用属性和空值（包括null、undefined和空字符串）
      Object.keys(deviceData).forEach(key => {
        if (!excludeProps.includes(key) && 
            deviceData[key] !== null && 
            deviceData[key] !== undefined && 
            deviceData[key] !== '' && // 添加过滤空字符串
            key !== 'skill_names') {
          result[key] = deviceData[key];
        }
      });
      
      return result;
    },

    // 通过摄像头类型筛选设备
    filterByCameraType(typeId) {
      console.log('按摄像头类型筛选:', typeId, this.cameraTypeMap[typeId]);
      
      this.currentCameraTypeFilter = typeId;
      
      // 构建查询参数对象
      const params = {};
      
      params.camera_type = typeId      
      
      // 重置到第一页
      this.currentPage = 1;
      
      // 执行筛选查询
      this.fetchCameraList(params);
    },
    
    // 清除摄像头类型筛选，显示所有设备
    filterAllCameraTypes() {
      this.currentCameraTypeFilter = 0;
      
      // 构建查询参数
      const params = {};
      
      
      // 执行查询
      this.fetchCameraList(params);
    },

    // 刷新摄像头详情数据
    refreshCameraDetail(cameraId) {
      if (!cameraId) return;
      
      console.log('刷新摄像头详情:', cameraId);
      
      cameraAPI.getCameraDetail(cameraId)
        .then(response => {
          if (response.data && (response.data.success || response.data.code === 0)) {
            const camera = response.data.camera || response.data.data;
            console.log('刷新获取到最新摄像头详情:', camera);
            
            // 更新摄像头在列表中的数据
            const index = this.deviceList.findIndex(device => device.id === cameraId);
            if (index !== -1) {
              // 更新设备基本信息
              this.$set(this.deviceList[index], 'name', camera.name);
              this.$set(this.deviceList[index], 'status', camera.status);
              this.$set(this.deviceList[index], 'location', camera.location || '-');
              
              // 更新技能列表（这是最关键的部分）
              if (camera.skill_names && Array.isArray(camera.skill_names)) {
                // 更新设备显示的技能列表文本
                this.$set(this.deviceList[index], 'skill', camera.skill_names.join(', '));
                
                // 更新已选技能缓存
                this.selectedSkillCache = [...camera.skill_names];
                this.skillSelectForm.selectedSkills = [...this.selectedSkillCache];
                
                console.log('已更新摄像头技能列表:', camera.skill_names.join(', '));
              } else {
                this.$set(this.deviceList[index], 'skill', '-');
                // 清空已选技能缓存
                this.selectedSkillCache = [];
                this.skillSelectForm.selectedSkills = [];
              }
              
              // 刷新原始列表
              this.originalDeviceList = [...this.deviceList];
            }
          }
        })
        .catch(error => {
          console.error('刷新摄像头详情失败:', error);
        });
    },

    // 处理技能选择对话框关闭事件
    handleSkillSelectClose() {
      // 当用户关闭技能选择对话框（点击X或按ESC）时，刷新摄像头数据
      // 以确保只显示已成功配置的技能
      if (this.currentDeviceId) {
        this.refreshCameraDetail(this.currentDeviceId);
        // 重新加载关联任务数据
        this.fetchCameraRelatedTasks(this.currentDeviceId);
      }
    },

    // 获取技能类列表
    fetchSkillClasses() {
      this.skillOptionsLoading = true;
      skillAPI.getAITaskSkillClasses()
        .then(response => {
          if (response.data && (response.data.success || response.data.code === 0)) {
            const data = response.data.data || [];
            this.skillOptions = data.map(item => ({
              id: item.id,
              value: item.name_en || item.name,
              name_zh: item.name_zh || item.name,
              type: item.type || 'default',
              version: item.version,
              status: item.status,
              parameters: item.parameters || []
            }));
            console.log('获取到技能类列表:', this.skillOptions);
          } else {
            this.$message.error('获取技能类列表失败：' + (response.data && response.data.msg ? response.data.msg : '未知错误'));
            this.skillOptions = []; // 清空技能选项
          }
        })
        .catch(error => {
          console.error('获取技能类列表出错:', error);
          this.$message.error('获取技能类列表失败：' + (error.message || '服务器错误'));
          this.skillOptions = []; // 清空技能选项
        })
        .finally(() => {
          this.skillOptionsLoading = false;
        });
    },
    
    // 获取技能的渐变颜色
    getSkillGradient(skill) {
      // 查找当前技能在技能选项中的配置
      const skillOption = this.skillOptions.find(option => option.value === skill || option.name_zh === skill);
      
      // 根据技能类型返回不同的渐变色
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
      
      // 如果无法找到技能类型，基于技能名称生成一个固定的渐变色
      const skillNameHash = this.hashString(skill) % 5;
      const gradients = [
        'linear-gradient(135deg, #409EFF, #1677ff)', // 蓝色
        'linear-gradient(135deg, #67C23A, #53a11d)', // 绿色
        'linear-gradient(135deg, #F56C6C, #e74c4c)', // 红色
        'linear-gradient(135deg, #E6A23C, #d38b1c)', // 橙色
        'linear-gradient(135deg, #909399, #6e7175)'  // 灰色
      ];
      
      return gradients[skillNameHash];
    },
    
    // 将字符串转换为哈希数值（用于生成固定颜色）
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // 转换为32位整数
      }
      return Math.abs(hash);
    },
    
    // 根据预警等级获取数值
    getWarningLevelValue(levelName) {
      const levelMap = {
        '一级预警': 1,
        '二级预警': 2,
        '三级预警': 3,
        '四级预警': 4
      };
      return levelMap[levelName] || 2;
    },
    
    // 格式化时间字符串 (HH:mm 格式)
    formatTimeString(date) {
      if (!date) return '00:00';
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${hours}:${minutes}`;
    },
    
    // 格式化围栏点数据
    formatFencePoints(points) {
      if (!points || points.length === 0) return [];
      
      // 如果是多个多边形的数组
      if (Array.isArray(points[0])) {
        return points.map(polygon => 
          polygon.map(point => ({ x: point.x, y: point.y }))
        );
      }
      
      // 如果只有一个多边形
      return [points.map(point => ({ x: point.x, y: point.y }))];
    },
    
    // 准备保存的配置对象
    prepareConfigForSave() {
              return {
        status: this.skillForm.status,
        name: this.skillForm.name,
        description: this.skillForm.description,
        alarmLevel: this.skillForm.alarmLevel,
        timeRanges: this.skillForm.timeRanges.map(range => ({
          start: new Date(range.start),
          end: new Date(range.end)
        })),
        frequency: {
          seconds: this.skillForm.frequency.seconds,
          frames: this.skillForm.frequency.frames
        },
        electronicFence: {
          image: this.skillForm.electronicFence.image,
          points: [...this.skillForm.electronicFence.points], // 深拷贝
          triggerMode: this.skillForm.electronicFence.triggerMode
        }
      };
    },
    
    // 电子围栏相关方法
    // 格式化多边形点坐标为SVG path
    formatPolygonPoints(points) {
      if (!points || points.length === 0) return '';
      return points.map(p => `${p.x},${p.y}`).join(' ');
    },
    
    // 获取多边形颜色
    getPolygonColor(index) {
      const colors = ['rgba(24, 144, 255, 0.2)', 'rgba(82, 196, 26, 0.2)', 'rgba(245, 108, 108, 0.2)'];
      return colors[index % colors.length];
    },
    
    // 获取点的样式
    getPointStyle(polyIndex, pointIndex) {
      return {
        cursor: 'move',
        zIndex: 100 + pointIndex
      };
    },
    
    // 开始拖拽点
    startDragPoint(polyIndex, pointIndex, event) {
      // 实现拖拽逻辑
    },
    
    // 点击围栏上的点
    handlePointClick(polyIndex, pointIndex) {
      // 处理点击事件
    },
    
    // 点击当前绘制的围栏上的点
    handleCurrentPointClick(index) {
      // 处理点击事件
    },
    
    // 点击图像
    handleImageClick(event) {
      // 处理点击事件
    },
    
    // 开始绘制围栏
    startDrawFence() {
      this.skillForm.electronicFence.isDrawing = true;
      this.skillForm.electronicFence.currentPolygon = [];
    },
    
    // 完成绘制围栏
    completeFence() {
      if (this.skillForm.electronicFence.currentPolygon.length < 3) {
        this.$message.warning('需要至少3个点才能形成有效的围栏');
        return;
      }
      
      // 将当前绘制的多边形添加到点数组中
      this.skillForm.electronicFence.points.push([...this.skillForm.electronicFence.currentPolygon]);
      
      // 清空当前多边形
      this.skillForm.electronicFence.currentPolygon = [];
      this.skillForm.electronicFence.isDrawing = false;
    },
    
    // 取消绘制
    cancelDrawFence() {
      this.skillForm.electronicFence.currentPolygon = [];
      this.skillForm.electronicFence.isDrawing = false;
    },
    
    // 清除围栏
    clearFence() {
      this.$confirm('确定要清除所有围栏吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.skillForm.electronicFence.points = [];
        this.$message.success('围栏已清除');
      }).catch(() => {});
    },
    
    // 添加时间范围
    addTimeRange() {
      if (this.skillForm.timeRanges.length >= 3) {
        this.$message.warning('最多只能添加3个时间范围');
        return;
      }
      
      this.skillForm.timeRanges.push({
        start: new Date(2024, 0, 1, 0, 0),
        end: new Date(2024, 0, 1, 23, 59)
      });
    },
    
    // 移除时间范围
    removeTimeRange(index) {
      if (this.skillForm.timeRanges.length <= 1) {
        this.$message.warning('至少需要保留一个时间范围');
        return;
      }
      
      this.skillForm.timeRanges.splice(index, 1);
    },

    // 添加getSkillParams方法来获取技能参数
    getSkillParams(skillClassId, skillKey) {
      return new Promise((resolve, reject) => {
        if (!skillClassId) {
          resolve({});
          return;
        }
        
        // 首先检查是否已有保存的参数
        const deviceIndex = this.deviceList.findIndex(device => device.id === this.currentDeviceId);
        if (deviceIndex !== -1 && 
            this.deviceList[deviceIndex].config && 
            this.deviceList[deviceIndex].config[skillKey] && 
            this.deviceList[deviceIndex].config[skillKey].customParams) {
          // 如果已有保存的参数，直接返回
          resolve(this.deviceList[deviceIndex].config[skillKey].customParams);
        return;
      }
      
        // 尝试从API获取技能默认参数
        skillAPI.getAITaskSkillDetail(skillClassId)
        .then(response => {
            if (response.data && (response.data.code === 0 || response.data.success)) {
              // 获取技能详情数据
              const skillDetail = response.data.data;
              
              // 从 default_config 中提取 params 数据
              if (skillDetail && skillDetail.default_config && skillDetail.default_config.params) {
                resolve(skillDetail.default_config.params);
              } else {
                resolve({});
              }
            } else {
              // 如果API返回错误，返回空对象
              resolve({});
            }
        })
        .catch(error => {
            console.error('获取技能默认参数失败:', error);
            resolve({});
          });
        });
    },
    
    // 添加createAITaskWithParams方法来创建AI任务
    createAITaskWithParams(taskData, deviceIndex, skillKey, config) {
      console.log('准备创建AI任务:', taskData);
      
      // 调用API创建AI任务
      skillAPI.createAITask(taskData)
        .then(response => {
          if (response.data && response.data.code === 0) {
            console.log('AI任务创建成功:', response.data);
            
            // 确保config对象有customParams字段
            if (!config.customParams) {
              config.customParams = {};
            }
            
            // 保存使用的参数到config
            if (taskData.skill_custom_config && taskData.skill_custom_config.params) {
              config.customParams = { ...taskData.skill_custom_config.params };
            }
            
            // 更新设备的技能配置 - 仅在内存中保存
            this.$set(this.deviceList[deviceIndex].config, skillKey, config);
            
            this.$message.success('技能配置保存成功');
            
            // 如果有临时配置的技能，并且不在已选列表中，添加到已选列表
            if (this.tempConfiguredSkill && !this.skillSelectForm.selectedSkills.includes(this.tempConfiguredSkill)) {
              this.skillSelectForm.selectedSkills.push(this.tempConfiguredSkill);
              this.selectedSkillCache = [...this.skillSelectForm.selectedSkills];
            }
            
            // 清除临时配置的技能
            this.tempConfiguredSkill = null;
            
            // AI任务创建成功后，刷新摄像头数据获取最新的技能列表
            this.refreshCameraDetail(this.currentDeviceId);
            // 刷新关联任务列表
            this.fetchCameraRelatedTasks(this.currentDeviceId);
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
          
          // 如果不是从左侧菜单点击的，则重新打开选择技能对话框
          if (!this.showLeftSkillMenu) {
            this.skillSelectDialogVisible = true;
          }
        });
    },

    // 根据状态过滤技能
    filterSkillsByStatus(value) {
      this.skillStatusFilter = value;
      // 可以在这里添加额外的处理逻辑，例如记录日志或触发其他事件
      console.log('按技能状态过滤:', value);
    },
    
    // 获取摄像头关联的AI任务
    fetchCameraRelatedTasks(cameraId) {
      if (!cameraId) {
        console.error('获取关联任务失败: 缺少摄像头ID');
        return;
      }
      
      this.taskLoading = true;
      this.cameraRelatedTasks = [];
      
      cameraAPI.getCameraAITasks(cameraId)
        .then(response => {
          console.log('获取摄像头关联任务原始响应:', response);
          
          // 检查不同可能的数据结构
          let tasks = [];
          
          if (response.data && response.data.tasks) {
            // 直接结构: { tasks: [...] }
            tasks = response.data.tasks;
          } else if (response.data && response.data.data && response.data.data.tasks) {
            // 嵌套结构: { data: { tasks: [...] } }
            tasks = response.data.data.tasks;
          } else if (response.data && Array.isArray(response.data)) {
            // 数组结构: [...] 
            tasks = response.data;
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // 嵌套数组结构: { data: [...] }
            tasks = response.data.data;
          }
          
          this.cameraRelatedTasks = tasks;
          console.log('解析后的关联任务数据:', this.cameraRelatedTasks);
          
          if (this.cameraRelatedTasks.length === 0) {
            console.warn('未获取到任何关联任务数据');
          }
        })
        .catch(error => {
          console.error('获取摄像头关联任务失败:', error);
          this.$message.error('获取摄像头关联任务失败: ' + (error.message || '未知错误'));
          this.cameraRelatedTasks = [];
        })
        .finally(() => {
          this.taskLoading = false;
        });
    },
    
    // 根据预警等级获取标签类型
    getAlertLevelType(level) {
      const typeMap = {
        1: 'danger',   // 一级预警
        2: 'warning',  // 二级预警
        3: 'primary',  // 三级预警
        4: 'success'   // 四级预警
      };
      return typeMap[level] || 'info';
    },
    
    // 根据预警等级数值获取名称
    getAlertLevelName(level) {
      const nameMap = {
        1: '一级预警',
        2: '二级预警',
        3: '三级预警',
        4: '四级预警'
      };
      return nameMap[level] || `预警(${level})`;
    }
  }
}

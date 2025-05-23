import { cameraAPI, skillAPI } from '@/components/service/VisionAIService.js';
import MediaServer from '@/components/service/MediaServer.js';

export default {
  name: 'CameraManagement',
  data() {
    return {
      // 初始化MediaServer实例
      mediaServer: new MediaServer(),
      
      // 摄像头列表数据
      deviceList: [],
      loading: true,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchKeyword: '',

      // 任务更新相关
      isUpdateMode: false,
      currentTaskId: null,

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
          currentPolygon: [],
          imageLoading: false
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
            currentPolygon: [],
            imageLoading: false
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

  
        // 如果是新选择的技能且之前未被选中，暂存到临时变量中
        if (isNewSelection && !this.isSkillSelected(skill)) {
          // 将新选择的技能保存到临时变量
          this.tempConfiguredSkill = skill;
        }

        // 打开配置技能对话框
        this.skillDialogVisible = true;
        
        // 获取摄像头截图作为电子围栏背景 - 移到这里确保对话框已经打开再获取截图
        if (this.currentDeviceId) {
          this.getAndSetCameraSnapForFence(this.currentDeviceId);
        }
      }, 100);
    },

    // 获取并设置围栏图片
    getAndSetCameraSnapForFence(cameraId) {
      if (!cameraId) {
        console.error('无法获取摄像头截图：缺少摄像头ID');
        this.skillForm.electronicFence.imageLoading = false;
        return;
      }
      
      // 设置加载状态
      this.skillForm.electronicFence.imageLoading = true;
      
      // 检查对话框是否已关闭
      if (!this.skillDialogVisible && !this.skillForm.electronicFence.imageLoading) {
        console.log('对话框已关闭，取消获取摄像头截图');
        this.skillForm.electronicFence.imageLoading = false;
        return;
      }
      
      // 显示加载提示
      console.log('正在获取摄像头截图:', cameraId);
      
      // 清理之前可能存在的URL对象，避免内存泄漏
      if (this.skillForm.electronicFence._blobUrl) {
        try {
          URL.revokeObjectURL(this.skillForm.electronicFence._blobUrl);
        } catch (e) {}
        this.skillForm.electronicFence._blobUrl = null;
      }
      
      // 使用Promise包装API调用
      const getSnapPromise = new Promise((resolve, reject) => {
        try {
          // 调用获取截图API
          this.mediaServer.getChannelSnapWithImage(cameraId, (result) => {
            if (result.success && result.imageData) {
              resolve(result);
            } else {
              reject(new Error(result.message || '获取截图失败'));
            }
          });
        } catch (error) {
          reject(error);
        }
      });
      
      // 处理Promise结果
      getSnapPromise
        .then(result => {
          // 检查对话框是否已关闭
          if (!this.skillDialogVisible) {
            console.log('对话框已关闭，丢弃摄像头截图');
            throw new Error('对话框已关闭');
          }
          
          console.log('获取截图成功，图像大小:', result.imageData.size, '类型:', result.imageData.type);
          
          // 检查数据是否是有效的Blob对象
          if (!(result.imageData instanceof Blob)) {
            throw new Error('获取的数据不是有效的图像');
          }
          
          // 创建一个新的Blob URL
          const blobUrl = URL.createObjectURL(result.imageData);
          
          // 保存URL以便后续清理
          this.skillForm.electronicFence._blobUrl = blobUrl;
          
          // 设置图像源
          this.skillForm.electronicFence.image = blobUrl;
          
          console.log('图像设置成功，等待加载完成');
        })
        .catch(error => {
          console.error('获取摄像头截图失败:', error);
          
          // 如果不是因为对话框关闭的错误，显示错误提示
          if (error.message !== '对话框已关闭' && this.skillDialogVisible) {
            this.$alert(`获取摄像头截图失败: ${error.message}`, {
              title: '获取截图失败',
              type: 'error',
              confirmButtonText: '确定'
            });
          }
        })
        .finally(() => {
          // 只有当对话框仍然打开时才更新UI状态
          if (this.skillDialogVisible) {
            setTimeout(() => {
              this.skillForm.electronicFence.imageLoading = false;
            }, 500);
          }
        });
    },


    // 处理确认配置
    handleConfirm() {
      // 添加表单验证前的调试日志
      console.log('准备进行表单验证，当前预警等级:', this.skillForm.alarmLevel);
      console.log('准备进行表单验证，当前任务名称:', this.skillForm.name);
      console.log('准备进行表单验证，当前任务描述:', this.skillForm.description);
      
      this.$refs.skillForm.validate((valid) => {
        if (valid) {
          if (this.currentDeviceId && this.currentSkill) {
            // 构建要保存的配置对象
            const config = this.prepareConfigForSave();
            
            // 显示加载状态
            this.loading = true;

            // 找到当前设备
            console.log('当前设备ID:', this.currentDeviceId);
            console.log('设备列表长度:', this.deviceList.length);
            
            const deviceIndex = this.deviceList.findIndex(device => {
              console.log('比较设备ID:', device.id, typeof device.id, '与', this.currentDeviceId, typeof this.currentDeviceId);
              return String(device.id) === String(this.currentDeviceId);
            });
            
            console.log('找到的设备索引:', deviceIndex);
            
            if (deviceIndex !== -1 || this.isUpdateMode) {
              // 如果找到设备索引或者是更新模式
              // 更新模式下不需要依赖deviceList
              
              // 确保设备有config对象
              if (deviceIndex !== -1 && !this.deviceList[deviceIndex].config) {
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

              // 准备任务数据
              const taskData = {
                // 使用用户输入的任务名称，如果没有则使用默认值
                name: this.skillForm.name || (deviceIndex !== -1 ? `${this.deviceList[deviceIndex].name}-${skillKey}分析任务` : `${skillKey}分析任务`),
                
                // 使用用户输入的任务描述，如果没有则使用默认值
                description: this.skillForm.description || (deviceIndex !== -1 ? `此任务使用${skillKey}技术对${this.deviceList[deviceIndex].name}进行智能分析，可自动识别并进行预警` : `此任务使用${skillKey}技术进行智能分析，可自动识别并进行预警`),
                
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
                // 自定义技能配置
                skill_config: {
                  params: this.skillDetailData && this.skillDetailData.params ? this.skillDetailData.params : {}
                }
              };
              
              // 如果是创建模式，需要添加摄像头ID和技能类ID
              if (!this.isUpdateMode) {
                taskData.camera_id = parseInt(this.currentDeviceId);
                taskData.skill_class_id = skillInfo ? parseInt(skillInfo.id) : null;
              
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
                        taskData.skill_config.params = params;
                      console.log('使用获取到的参数:', params);
                    } else {
                      // 如果无法获取默认参数，则尝试使用已保存的参数
                      if (deviceIndex !== -1 && this.deviceList[deviceIndex].config && 
                          this.deviceList[deviceIndex].config[skillKey] && 
                          this.deviceList[deviceIndex].config[skillKey].customParams) {
                        // 如果设备配置中已有自定义参数，直接使用
                          taskData.skill_config.params = { ...this.deviceList[deviceIndex].config[skillKey].customParams };
                      } else if (config && config.customParams) {
                        // 兼容旧逻辑，如果配置对象中有自定义参数，使用配置对象中的
                          taskData.skill_config.params = { ...config.customParams };
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
                // 更新模式，使用PUT请求更新任务
                this.updateAITask(taskData, deviceIndex, skillKey, config);
              }
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
                  console.log('检查设备配置，当前设备ID:', this.currentDeviceId);
                  
                  // 使用String转换确保类型一致
                  const deviceIndex = this.deviceList.findIndex(device => {
                    return String(device.id) === String(this.currentDeviceId);
                  });
                  
                  console.log('查找到的设备索引:', deviceIndex);
                  
                  if (deviceIndex !== -1 && this.deviceList[deviceIndex].config) {
                    const deviceConfig = this.deviceList[deviceIndex].config;
                    // 尝试使用不同的键名查找配置
                    const skillConfig = deviceConfig[skillDetail.name_zh] || deviceConfig[skillDetail.name];
                    
                    console.log('找到技能配置:', skillConfig ? '是' : '否');
                    
                    if (skillConfig && skillConfig.customParams) {
                      // 如果有自定义参数，优先使用
                      console.log('使用已存在的自定义参数');
                      this.skillDetailData.params = { ...skillConfig.customParams };
                    } else {
                      console.log('没有找到已存在的自定义参数，使用默认参数');
                    }
                  } else {
                    console.log('没有找到设备或设备没有配置对象，使用默认参数');
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
        console.log('准备保存技能参数，当前设备ID:', this.currentDeviceId);
        console.log('设备列表长度:', this.deviceList.length);
        
        // 使用String转换确保类型一致
        const deviceIndex = this.deviceList.findIndex(device => {
          console.log('比较设备:', device.id, typeof device.id, '与', this.currentDeviceId, typeof this.currentDeviceId);
          return String(device.id) === String(this.currentDeviceId);
        });
        
        console.log('查找到的设备索引:', deviceIndex);
        
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
          
          console.log('使用技能键名:', skillKey);
          
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
          console.error('保存技能参数失败 - 未找到设备:', this.currentDeviceId);
          
          // 尽管找不到设备，仍然保存参数到临时位置
          this.$message.warning('未找到设备，但技能参数已临时保存，将在确认技能配置时应用');
          
          // 技能参数仍然保留在this.skillDetailData中，等待后续处理
          this.skillDetailDialogVisible = false;
          return;
        }
      } else {
        console.warn('技能参数保存 - 缺少必要信息:', { 
          currentSkill: this.currentSkill, 
          currentDeviceId: this.currentDeviceId 
        });
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
      event.stopPropagation(); // 阻止事件冒泡
      
      // 保存拖拽的多边形和点的索引
      this.skillForm.electronicFence.draggedPolygonIndex = polyIndex;
      this.skillForm.electronicFence.draggedPointIndex = pointIndex;
      this.skillForm.electronicFence.isDragging = true;
      
      // 记录初始位置
      const initialX = event.clientX;
      const initialY = event.clientY;
      
      // 当前点的初始位置
      const initialPointX = this.skillForm.electronicFence.points[polyIndex][pointIndex].x;
      const initialPointY = this.skillForm.electronicFence.points[polyIndex][pointIndex].y;
      
      // 获取图像元素和其边界
      const imageElement = document.querySelector('.fence-image');
      const rect = imageElement.getBoundingClientRect();
      
      // 创建鼠标移动事件处理函数
      const handleMouseMove = (moveEvent) => {
        if (!this.skillForm.electronicFence.isDragging) return;
        
        moveEvent.preventDefault(); // 防止默认行为
        
        // 计算偏移量
        const offsetX = moveEvent.clientX - initialX;
        const offsetY = moveEvent.clientY - initialY;
        
        // 计算新位置
        const newX = Math.max(0, Math.min(rect.width, initialPointX + offsetX));
        const newY = Math.max(0, Math.min(rect.height, initialPointY + offsetY));
        
        // 更新点的位置
        this.skillForm.electronicFence.points[polyIndex][pointIndex] = {
          x: newX,
          y: newY
        };
        
        // 刷新视图
        this.$forceUpdate();
      };
      
      // 创建鼠标松开事件处理函数
      const handleMouseUp = () => {
        // 停止拖拽
        this.skillForm.electronicFence.isDragging = false;
        this.skillForm.electronicFence.draggedPolygonIndex = -1;
        this.skillForm.electronicFence.draggedPointIndex = -1;
        
        // 移除事件监听器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      // 添加事件监听器
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    
    // 点击围栏上的点
    handlePointClick(polyIndex, pointIndex) {
      // 处理点击事件
    },
    
    // 点击当前绘制的围栏上的点
    handleCurrentPointClick(index) {
      // 如果点击的是第一个点，且已经有3个或更多的点，则闭合围栏
      if (index === 0 && this.skillForm.electronicFence.currentPolygon.length > 2) {
        this.completeFence();
        return;
      }
      
      // 对于其他点，询问是否删除
      this.$confirm('是否删除此点？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.skillForm.electronicFence.currentPolygon.splice(index, 1);
        // 更新UI
        this.$forceUpdate();
      }).catch(() => {});
    },

    
    // 处理图像加载错误
    handleImageError(event) {
      console.error('图像加载失败事件:', event);
      this.skillForm.electronicFence.imageLoading = false;
      
      // 显示更详细的错误对话框
      this.$alert('图像加载失败，可能原因：\n1. 摄像头不在线\n2. 摄像头未返回有效图像\n3. 网络问题\n\n请尝试刷新或稍后重试', {
        title: '图像加载失败',
        confirmButtonText: '确定',
        type: 'error',
        callback: () => {
          // 清空错误的图像URL
          if (this.skillForm.electronicFence._blobUrl) {
            try {
              URL.revokeObjectURL(this.skillForm.electronicFence._blobUrl);
            } catch (e) {}
          }
          // 设置默认占位图
          this.skillForm.electronicFence.image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        }
      });
    },
    
    // 点击图像
    handleImageClick(event) {
      // 如果正在绘制围栏，添加点
      if (this.skillForm.electronicFence.isDrawing) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 如果已经有点，检查是否点击了第一个点附近区域来闭合围栏
        if (this.skillForm.electronicFence.currentPolygon.length > 2) {
          const firstPoint = this.skillForm.electronicFence.currentPolygon[0];
          const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
          
          // 如果点击位置距离第一个点很近（40像素内），则闭合围栏
          // 使用更大的范围使闭合操作更容易
          if (distance < 40) {
            this.completeFence();
            return;
          }
        }
        
        // 添加点到当前多边形
        this.skillForm.electronicFence.currentPolygon.push({ x, y });
        
        // 当点数大于2时，刷新界面显示闭合提示
        if (this.skillForm.electronicFence.currentPolygon.length > 2) {
          // 这里不需要实际创建元素，只需要确保在渲染时能够看到虚线
          // Vue的响应式系统会处理更新
          // 通过触发更新来确保组件重新渲染
          this.$forceUpdate();
        }
      } else {
        // 否则，获取新的截图
        if (this.currentDeviceId) {
          // 直接获取最新截图，无需确认
          this.getAndSetCameraSnapForFence(this.currentDeviceId);
        } else {
          this.$message.warning('未选择摄像头，无法获取截图');
        }
      }
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
      console.log('设备索引:', deviceIndex, '技能键:', skillKey);
      
      // 调用API创建AI任务
      skillAPI.createAITask(taskData)
        .then(response => {
          console.log('创建AI任务返回数据:', response.data);
          
          // 检查不同的返回数据格式
          let isSuccess = false;
          let responseData = null;
          
          if (response.data && response.data.code === 0) {
            // 标准格式{code: 0, data: ...}
            isSuccess = true;
            responseData = response.data.data;
          } else if (response.data && response.data.id) {
            // 直接返回任务对象格式，包含id字段
            isSuccess = true;
            responseData = response.data;
          } else if (response.status === 200 || response.status === 201) {
            // 通过HTTP状态码判断成功
            isSuccess = true;
            responseData = response.data;
          }
          
          if (isSuccess) {
            console.log('AI任务创建成功:', responseData);
            
            // 确保config对象有customParams字段
            if (!config.customParams) {
              config.customParams = {};
            }
            
            // 保存使用的参数到config
            if (taskData.skill_config && taskData.skill_config.params) {
              config.customParams = { ...taskData.skill_config.params };
            }
            
            // 只有当deviceIndex有效时才更新设备的技能配置
            if (deviceIndex !== -1 && deviceIndex !== undefined && this.deviceList[deviceIndex]) {
              // 更新设备的技能配置 - 仅在内存中保存
              this.$set(this.deviceList[deviceIndex].config, skillKey, config);
            } else {
              console.log('设备索引无效，跳过在设备列表中保存配置');
            }
            
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
            this.$message.error('创建AI任务失败：' + (response.data && response.data.msg ? response.data.msg : '未知错误'));
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
      const levelMap = {
        1: '一级预警',
        2: '二级预警',
        3: '三级预警',
        4: '四级预警'
      };
      
      // 确保level是数字类型
      const numLevel = Number(level);
      
      // 如果能在映射表中找到对应值，则返回，否则返回默认值'二级预警'
      return levelMap[numLevel] || '二级预警';
    },

    // 任务卡片点击处理方法 - 在fetchCameraRelatedTasks方法后添加
    // 处理任务卡片点击
    handleTaskClick(task) {
      if (!task || !task.id) {
        this.$message.warning('无效的任务信息');
        return;
      }
      
      // 显示加载提示
      const loading = this.$loading({
        lock: true,
        text: '加载任务详情...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 设置更新模式
      this.isUpdateMode = true;
      this.currentTaskId = task.id;
      
      // 重要：重置表单内容，避免之前的数据影响
      this.skillForm = {
        name: '',  // 确保清空这些字段
        description: '',
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
          currentPolygon: [],
          imageLoading: false
        }
      };
      
      // 添加延时防止界面卡顿
      setTimeout(() => {
        // 加载任务数据
        this.loadTaskData(task.id)
          .catch(error => {
            console.error('加载任务数据出错:', error);
            this.$message.error('加载任务数据失败: ' + (error.message || '未知错误'));
            // 关闭加载提示
            loading.close();
            // 重置更新模式
            this.isUpdateMode = false;
            this.currentTaskId = null;
          })
          .finally(() => {
            // 关闭加载提示
            loading.close();
          });
      }, 100);
    },
    
    // 加载任务数据
    loadTaskData(taskId) {
      // 返回Promise以便外部处理错误
      return new Promise((resolve, reject) => {
        // 调用接口获取任务详情
        skillAPI.getAITaskDetail(taskId)
          .then(response => {
            // 正确处理不同的数据结构
            let taskData;
            if (response.data && response.data.id) {
              // 直接返回的任务数据
              taskData = response.data;
            } else if (response.data && response.data.code === 0 && response.data.data) {
              // 标准包装格式的任务数据
              taskData = response.data.data;
            } else {
              const error = new Error('数据格式不正确');
              console.error('任务数据格式不符合预期:', response.data);
              reject(error);
              return;
            }
            
            // 检查任务数据是否有效
            if (!taskData.id) {
              const error = new Error('无效的任务数据');
              reject(error);
              return;
            }
            
            // 设置当前设备ID和技能ID
            this.currentDeviceId = taskData.camera_id;
            


            // 获取技能信息
            if (taskData.skill_class_id) {
              // 查找对应的技能信息
              skillAPI.getAITaskSkillDetail(taskData.skill_class_id)
                .then(skillResponse => {
                  // 处理不同格式的技能数据
                  let skillData;
                  if (skillResponse.data && skillResponse.data.data) {
                    // 标准包装格式
                    skillData = skillResponse.data.data;
                  } else if (skillResponse.data && (skillResponse.data.id || skillResponse.data.value || skillResponse.data.name_zh)) {
                    // 直接返回的技能数据
                    skillData = skillResponse.data;
                  } else if (skillResponse.data && skillResponse.data.code === 0 && skillResponse.data.data) {
                    // 嵌套包装格式
                    skillData = skillResponse.data.data;
                  } else {
                    console.error('技能数据格式不符合预期:', skillResponse.data);
                    const error = new Error('技能数据格式不正确');
                    reject(error);
                    return;
                  }

                  // 确保技能数据有效
                  if (!skillData.value && !skillData.name_zh && !skillData.name) {
                    const error = new Error('技能数据缺少必要字段');
                    reject(error);
                    return;
                  }

                  this.currentSkill = skillData.name || skillData.name_zh;
                  this.currentSkillInfo = skillData;
                  
                  // 填充技能表单数据
                  this.fillSkillFormFromTask(taskData);
                  
                  // 打开技能配置对话框
                  this.skillDialogVisible = true;

                  
                  
                  // 操作成功完成
                  resolve();
                })
                .catch(error => {
                  console.error('获取技能信息失败:', error);
                  reject(error);
                });
            } else {
              const error = new Error('任务中缺少技能信息');
              reject(error);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    
    // 从任务数据填充表单
    fillSkillFormFromTask(taskData) {
      // 清除加载状态
      this.loading = false;
      
      console.log('填充表单前的表单数据:', JSON.stringify(this.skillForm));
      console.log('从任务中获取的任务名称:', taskData.name);
      console.log('从任务中获取的任务描述:', taskData.description);
      
      // 填充基础信息 - 使用Vue的$set确保响应式更新
      this.$set(this.skillForm, 'name', taskData.name || '');
      this.$set(this.skillForm, 'description', taskData.description || '');
      this.$set(this.skillForm, 'status', taskData.status !== undefined ? taskData.status : true);
      
      // 强制刷新表单视图
      this.$nextTick(() => {
        console.log('填充表单后的表单数据:', JSON.stringify(this.skillForm));
        
        // 强制更新表单
        if (this.$refs.skillForm) {
          this.$refs.skillForm.clearValidate();
        }
      });
      
      // 填充预警等级
      this.skillForm.alarmLevel = this.getAlertLevelName(taskData.alert_level) || '二级预警';
      
      // 填充抽帧频率
      if (taskData.frame_rate) {
        if (taskData.frame_rate >= 1) {
          // 如果帧率大于等于1，表示1秒多帧
          this.skillForm.frequency.seconds = 1;
          this.skillForm.frequency.frames = Math.round(taskData.frame_rate);
        } else {
          // 如果帧率小于1，表示多秒1帧
          this.skillForm.frequency.seconds = Math.round(1 / taskData.frame_rate);
          this.skillForm.frequency.frames = 1;
        }
      }
      
      // 填充运行时段
      if (taskData.running_period && taskData.running_period.periods && taskData.running_period.periods.length > 0) {
        this.skillForm.timeRanges = taskData.running_period.periods.map(period => {
          const [startHour, startMinute] = period.start.split(':').map(Number);
          const [endHour, endMinute] = period.end.split(':').map(Number);
          
          return {
            start: new Date(2024, 0, 1, startHour, startMinute),
            end: new Date(2024, 0, 1, endHour, endMinute)
          };
        });
      } else {
        // 使用默认时间范围
        this.skillForm.timeRanges = [
          {
            start: new Date(2024, 0, 1, 0, 0),
            end: new Date(2024, 0, 1, 23, 59)
          }
        ];
      }
      
      // 填充电子围栏
      // 重置围栏数据
      this.skillForm.electronicFence.points = [];
      
      if (taskData.electronic_fence && taskData.electronic_fence.points && taskData.electronic_fence.points.length > 0) {
        // 判断电子围栏点数据的格式
        const fencePoints = taskData.electronic_fence.points;
        
        console.log('电子围栏原始数据:', JSON.stringify(fencePoints));
        
        try {
          // 如果是二维数组，并且第一层是多边形数组
          if (Array.isArray(fencePoints) && Array.isArray(fencePoints[0])) {
            // 遍历每个多边形
            fencePoints.forEach(polygon => {
              // 检查多边形点数据格式
              if (polygon.length > 0) {
                if (typeof polygon[0] === 'object' && 'x' in polygon[0] && 'y' in polygon[0]) {
                  // 如果点已经是{x,y}格式，直接添加
                  this.skillForm.electronicFence.points.push([...polygon]);
                } else if (Array.isArray(polygon[0])) {
                  // 如果点是[x,y]格式，转换为{x,y}格式
                  const formattedPolygon = polygon.map(point => ({ x: point[0], y: point[1] }));
                  this.skillForm.electronicFence.points.push(formattedPolygon);
                }
              }
            });
          } else if (Array.isArray(fencePoints)) {
            // 如果是一维数组，可能是单个多边形的点数组
            if (fencePoints.length > 0) {
              if (typeof fencePoints[0] === 'object' && 'x' in fencePoints[0] && 'y' in fencePoints[0]) {
                // 如果点已经是{x,y}格式，作为一个多边形添加
                this.skillForm.electronicFence.points.push([...fencePoints]);
              } else if (Array.isArray(fencePoints[0])) {
                // 如果点是[x,y]格式，转换为{x,y}格式
                const formattedPolygon = fencePoints.map(point => ({ x: point[0], y: point[1] }));
                this.skillForm.electronicFence.points.push(formattedPolygon);
              }
            }
          }
          
          console.log('处理后的电子围栏数据:', JSON.stringify(this.skillForm.electronicFence.points));
        } catch (error) {
          console.error('电子围栏数据处理错误:', error);
        }
        
        // 设置触发模式
        this.skillForm.electronicFence.triggerMode = taskData.electronic_fence.trigger_mode || 'inside';
      }
      
      // 获取摄像头截图
      this.skillForm.electronicFence.imageLoading = true; // 显示加载状态
      this.getAndSetCameraSnapForFence(taskData.camera_id);
      
      // 加载自定义参数
      if (taskData.skill_config && taskData.skill_config.params) {
        this.skillDetailData = {
          params: { ...taskData.skill_config.params }
        };
      }
    },

    // 更新AI任务
    updateAITask(taskData, deviceIndex, skillKey, config) {
      console.log('准备更新AI任务:', taskData);
      console.log('设备索引:', deviceIndex, '技能键:', skillKey);
      
      // 调用API更新AI任务
      skillAPI.updateAITask(this.currentTaskId, taskData)
        .then(response => {
          console.log('更新AI任务返回数据:', response.data);
          
          // 检查不同的返回数据格式
          let isSuccess = false;
          let responseData = null;
          
          if (response.data && response.data.code === 0) {
            // 标准格式{code: 0, data: ...}
            isSuccess = true;
            responseData = response.data.data;
          } else if (response.data && response.data.id) {
            // 直接返回任务对象格式，包含id字段
            isSuccess = true;
            responseData = response.data;
          } else if (response.status === 200 || response.status === 201) {
            // 通过HTTP状态码判断成功
            isSuccess = true;
            responseData = response.data;
          }
          
          if (isSuccess) {
            console.log('AI任务更新成功:', responseData);
            
            // 确保config对象有customParams字段
            if (!config.customParams) {
              config.customParams = {};
            }
            
            // 保存使用的参数到config
            if (taskData.skill_config && taskData.skill_config.params) {
              config.customParams = { ...taskData.skill_config.params };
            }
            
            // 只有当deviceIndex有效时才更新设备的技能配置
            if (deviceIndex !== -1 && deviceIndex !== undefined && this.deviceList[deviceIndex]) {
              // 更新设备的技能配置 - 仅在内存中保存
              this.$set(this.deviceList[deviceIndex].config, skillKey, config);
            } else {
              console.log('设备索引无效，跳过在设备列表中保存配置');
            }
            
            this.$message.success('任务更新成功');
            
            // 刷新摄像头数据获取最新的技能列表
            this.refreshCameraDetail(this.currentDeviceId);
            // 刷新关联任务列表
            this.fetchCameraRelatedTasks(this.currentDeviceId);
          } else {
            console.error('更新AI任务失败:', response.data);
            this.$message.error('更新AI任务失败：' + (response.data && response.data.msg ? response.data.msg : '未知错误'));
          }
        })
        .catch(error => {
          console.error('更新AI任务出错:', error);
          this.$message.error('更新AI任务失败：' + (error.message || '服务器错误'));
        })
        .finally(() => {
          this.loading = false;
          // 重置更新模式
          this.isUpdateMode = false;
          this.currentTaskId = null;
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

    handleClose() {
      // 如果正在绘制电子围栏，则取消绘制
      if (this.skillForm.electronicFence.isDrawing) {
        this.cancelDrawFence();
      }
      
      // 确保所有loading状态被清除
      this.skillForm.electronicFence.imageLoading = false;
      
      // 重置更新模式
      this.isUpdateMode = false;
      this.currentTaskId = null;
      
      // 关闭可能存在的loading实例
      try {
        this.$loading().close();
      } catch (e) {}
      
      // 关闭对话框
      this.skillDialogVisible = false;
    },
    
    closeSkillDialog() {
      // 确保所有loading状态被清除
      this.skillForm.electronicFence.imageLoading = false;
      
      // 重置更新模式
      this.isUpdateMode = false;
      this.currentTaskId = null;
      
      // 关闭可能存在的loading实例
      try {
        this.$loading().close();
      } catch (e) {}
      
      // 关闭对话框
      this.skillDialogVisible = false;
    },

    // 处理图像加载完成
    handleImageLoad() {
      // 如果对话框已经被关闭，直接隐藏加载状态
      if (!this.skillDialogVisible) {
        this.skillForm.electronicFence.imageLoading = false;
        return;
      }
      
      // 延迟关闭加载状态，添加过渡效果
      setTimeout(() => {
        // 再次检查对话框是否关闭
        if (!this.skillDialogVisible) {
          this.skillForm.electronicFence.imageLoading = false;
          return;
        }
        
        // 不要直接设置为false，先添加过渡类
        const loadingEl = document.querySelector('.fence-image-loading');
        if (loadingEl) {
          loadingEl.classList.add('fade-out');
          // 等待过渡效果完成后再隐藏
          setTimeout(() => {
            this.skillForm.electronicFence.imageLoading = false;
          }, 300); // 与CSS过渡时间相匹配
        } else {
          this.skillForm.electronicFence.imageLoading = false;
        }
      }, 100);
    }
  }
}

<script>
export default {
  name: "WarningArchives",
  components: {
    WarningDetail: () => import('./warningDetail.vue')
  },
  data() {
    return {
      // 接口定义
      WarningArchive: {
        id: 0,
        name: '',
        image: '',
        deviceName: '',
        warningTime: '',
        warningLevel: ''
      },
      ArchiveInfo: {
        name: '',
        location: '',
        timeRange: '',
        createTime: '',
        description: '',
        image: ''
      },
      // 预警等级枚举
      WARNING_LEVELS: {
        Red: { label: '一级预警', value: 'red', color: '#ff4d4f' },
        Orange: { label: '二级预警', value: 'orange', color: '#faad14' },
        Yellow: { label: '三级预警', value: 'yellow', color: '#faad14' },
        Blue: { label: '四级预警', value: 'blue', color: '#52c41a' }
      },
      // 分页配置
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 档案基本信息
      archiveInfo: {
        name: '厂区A10车间预警档案',
        location: '厂区A10车间',
        timeRange: '2024-12-01 00:00:00-2024-12-31 23:59:59',
        createTime: '2024-12-18 15:49:04',
        description: '-',
        image: ''
      },
      // 多个档案列表
      archivesList: [
        {
          id: 1,
          name: '厂区A10车间预警档案',
          location: '厂区A10车间',
          timeRange: '2024-12-01 00:00:00-2024-12-31 23:59:59',
          createTime: '2024-12-18 15:49:04',
          description: '-',
          image: ''
        },
        {
          id: 2,
          name: '东15风机预警档案',
          location: '东15风机',
          timeRange: '2024-12-01 00:00:00-2024-12-20 23:59:59',
          createTime: '2024-12-18 09:25:18',
          description: '东15风机特殊情况监控',
          image: ''
        },
        {
          id: 3,
          name: 'EF两区特检测区预警档案',
          location: 'EF两区特检测区',
          timeRange: '2024-11-15 00:00:00-2024-12-15 23:59:59',
          createTime: '2024-12-17 16:40:33',
          description: '特检区域重点监控',
          image: ''
        },
        {
          id: 4,
          name: '降盐水泵废水站预警档案',
          location: '降盐水泵废水站',
          timeRange: '2024-11-01 00:00:00-2024-11-30 23:59:59',
          createTime: '2024-12-17 11:23:46',
          description: '废水处理站安全监控',
          image: ''
        }
      ],
      // 当前选中的档案ID
      currentArchiveId: 1,
      // 列表相关
      allArchiveList: [],
      archiveList: [],
      // 每个档案对应的预警列表
      archiveWarningLists: {},
      selectedRows: [],
      selectAll: false,
      // 详情弹框
      detailDialogVisible: false,
      currentDetail: null,
      // 图片预览
      imagePreviewVisible: false,
      currentPreviewImage: null,
      // 文件上传相关
      uploadAction: 'https://jsonplaceholder.typicode.com/posts/', // 模拟上传地址
      uploadHeaders: {
        Authorization: 'Bearer token'
      },
      // 编辑相关
      isEditing: false,
      editingArchive: null,
      // 添加预警对话框
      showAddDialog: false,
      newArchive: {
        name: '',
        deviceName: '',
        warningLevel: '',
        description: ''
      },
      // 编辑档案表单
      editForm: {
        name: '',
        location: '',
        timeRange: [],
        createTime: '',
        description: '',
        image: ''
      },
      // 添加预警表单
      addForm: {
        name: '',
        deviceName: '',
        warningLevel: '',
        warningType: '',
        location: '',
        description: '',
        warningTime: '',
        violationImage: '',
        violationVideo: ''
      },
      // 对话框控制
      editDialogVisible: false,
      addDialogVisible: false,
      // 删除相关
      deleteConfirmVisible: false,
      deleteConfirmMessage: '',
      deleteType: '', // 'single' 或 'batch'
      deleteId: null,
      // 添加档案对话框
      addArchiveDialogVisible: false,
      newArchiveForm: {
        name: '',
        location: '',
        timeRange: [],
        description: '',
        image: ''
      },
      // 预警详情相关
      warningDetailVisible: false,
      currentWarning: null
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 获取预览图片URL
    getPreviewImage() {
      // 这里返回一个实际的图片URL，可以是本地资源或远程URL
      return 'https://via.placeholder.com/300x200/ecf5ff/409eff?text=预览图片';
    },
    // 显示图片预览
    showImagePreview(row) {
      const imageUrl = row.violationImage || row.image;
      if (imageUrl) {
        this.currentPreviewImage = imageUrl;
        this.imagePreviewVisible = true;
      } else {
        this.$message.warning('该预警暂无图片');
      }
    },
    // 初始化数据
    initData() {
      // 为每个档案生成对应的预警数据
      this.archivesList.forEach(archive => {
        this.archiveWarningLists[archive.id] = this.generateMockDataForArchive(archive);
      });
      
      // 设置当前档案信息
      this.archiveInfo = { ...this.archivesList[0] };
      
      // 设置当前档案的预警列表
      this.allArchiveList = this.archiveWarningLists[this.currentArchiveId];
      this.updatePageData();
    },
    // 生成特定档案的模拟数据
    generateMockDataForArchive(archive) {
      const data = [];
      const devices = [
        'EF两区特检测区10社',
        '降盐水泵废水站',
        '东15风机',
        '齐心爱A20储产',
        'EF两区特检测区10社'
      ];
      
      const warningNames = [
        '安全帽识别',
        '工服识别',
        '安全帽识别',
        '玻璃运输车打卡',
        '烟火检测',
        '安全帽识别',
        '工服识别',
        '安全帽识别',
        '玻璃运输车打卡'
      ];

      const warningTypes = [
        '安全违规',
        '安全违规',
        '安全违规',
        '车辆违规',
        '消防违规',
        '安全违规',
        '安全违规',
        '安全违规',
        '车辆违规'
      ];

      const locations = [
        '厂区A10车间东区',
        '废水处理站入口',
        '东15风机房',
        '储产区域A20',
        'EF两区特检测区'
      ];

      const remarks = [
        '已现场提醒，工人已佩戴安全帽',
        '已督促整改，现已规范穿着',
        '已加强现场监督管理',
        '车辆已完成打卡登记',
        '已清理现场，加强禁烟宣传',
        '',
        '现场已整改完毕',
        '',
        ''
      ];
      
      // 根据档案ID决定生成多少条数据
      const count = archive.id === 1 ? 9 : (archive.id === 2 ? 6 : (archive.id === 3 ? 8 : 5));
      
      for (let i = 1; i <= count; i++) {
        const randomLevel = Math.floor(Math.random() * 4);
        const level = ['level1', 'level2', 'level3', 'level4'][randomLevel];
        let deviceName;
        
        // 根据档案类型选择对应的设备名
        if (archive.id === 1) {
          deviceName = i % 3 === 0 ? '厂区A10车间' : '厂区A10车间区域' + (i % 5 + 1);
        } else if (archive.id === 2) {
          deviceName = '东15风机';
        } else if (archive.id === 3) {
          deviceName = 'EF两区特检测区10社';
        } else {
          deviceName = '降盐水泵废水站';
        }
        
        // 生成时间
        const currentYear = 2024;
        const randomMonth = Math.floor(Math.random() * 6) + 7; // 7-12月，更接近现在
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const randomHour = Math.floor(Math.random() * 24);
        const randomMinute = Math.floor(Math.random() * 60);
        const randomSecond = Math.floor(Math.random() * 60);
        
        const warningTime = `${currentYear}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')} ${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:${randomSecond.toString().padStart(2, '0')}`;
        
        data.push({
          id: i,
          name: warningNames[(i - 1) % warningNames.length] || `预警${i}`,
          image: this.getPreviewImage(),
          deviceName: deviceName,
          warningTime: warningTime,
          warningLevel: i % 4 === 0 ? 'level1' : (i % 4 === 1 ? 'level2' : (i % 4 === 2 ? 'level3' : 'level4')),
          warningType: warningTypes[(i - 1) % warningTypes.length] || '其他违规',
          location: locations[(i - 1) % locations.length] || archive.location,
          remark: remarks[(i - 1) % remarks.length] || '',
          description: this.getDescriptionByType(warningNames[(i - 1) % warningNames.length]),
          violationImage: this.getPreviewImage(),
          violationVideo: ''
        });
      }
      return data;
    },
    // 根据预警类型生成默认描述
    getDescriptionByType(type) {
      const descriptionMap = {
        '安全帽识别': '检测到工作人员未佩戴安全帽，存在严重安全隐患，请立即整改并加强安全教育',
        '工服识别': '发现工作人员未按规定穿着工作服，违反现场作业安全规范，需要立即纠正',
        '玻璃运输车打卡': '玻璃运输车辆未按规定进行打卡登记，违反车辆管理规定，请督促司机规范操作',
        '烟火检测': '检测到禁烟区域有吸烟行为，存在火灾隐患，请立即制止并进行安全教育',
      };
      return descriptionMap[type] || `检测到${type}违规行为，请及时处理并加强现场管理`;
    },
    // 切换到指定档案
    switchToArchive(archiveId) {
      this.currentArchiveId = archiveId;
      // 更新当前档案信息
      const selectedArchive = this.archivesList.find(item => item.id === archiveId);
      if (selectedArchive) {
        this.archiveInfo = { ...selectedArchive };
        // 更新预警列表数据
        this.allArchiveList = this.archiveWarningLists[archiveId];
        this.pagination.currentPage = 1;
        this.updatePageData();
      }
    },
    // 更新页面数据
    updatePageData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      this.archiveList = this.allArchiveList.slice(start, end);
      this.pagination.total = this.allArchiveList.length;
    },
    // 页码改变
    handleCurrentChange(page) {
      this.pagination.currentPage = page;
      this.updatePageData();
    },
    // 每页条数改变
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.currentPage = 1;
      this.updatePageData();
    },
    // 表格选择事件
    handleSelectionChange(selection) {
      this.selectedRows = selection.map(item => item.id);
      this.selectAll = selection.length === this.archiveList.length;
    },
    // 查看详情
    showDetail(record) {
      // 将档案记录转换为预警格式
      this.currentWarning = {
        id: record.id,
        device: record.deviceName,
        type: record.name,
        time: record.warningTime,
        level: record.warningLevel,
        location: record.location || this.archiveInfo.location,
        remark: record.remark,
        description: record.description || this.getDescriptionByType(record.name)
      };
      this.warningDetailVisible = true;
    },
    // 从预警详情组件处理预警
    handleWarningFromDetail(warning) {
      this.$message({
        message: `正在处理 ${warning.device} 的 ${warning.type} 预警`,
        type: 'success'
      });
      this.warningDetailVisible = false;
    },
    // 处理单条删除
    handleDelete(id) {
      this.deleteType = 'single';
      this.deleteId = id;
      this.deleteConfirmMessage = '确定要删除该预警档案吗？';
      this.deleteConfirmVisible = true;
    },
    // 处理批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录');
        return;
      }

      this.deleteType = 'batch';
      this.deleteConfirmMessage = `确定要删除选中的 ${this.selectedRows.length} 条记录吗？`;
      this.deleteConfirmVisible = true;
    },
    // 确认删除
    async confirmDelete() {
      try {
        if (this.deleteType === 'single') {
          // 单条删除
          const index = this.allArchiveList.findIndex(item => item.id === this.deleteId);
          if (index !== -1) {
            this.allArchiveList.splice(index, 1);
            this.$message.success('删除成功');
          }
        } else {
          // 批量删除
          this.allArchiveList = this.allArchiveList.filter(item => !this.selectedRows.includes(item.id));
          this.selectedRows = [];
          this.$message.success('批量删除成功');
        }

        // 更新页面数据
        this.updatePageData();
        this.deleteConfirmVisible = false;
      } catch (error) {
        this.$message.error('删除操作失败');
        console.error(error);
      }
    },
    // 编辑档案
    editArchive() {
      this.isEditing = true;
      this.editForm = { ...this.archiveInfo };
      
      // 处理时间范围：将字符串格式转换为数组格式
      if (this.editForm.timeRange && typeof this.editForm.timeRange === 'string') {
        // 使用正则表达式精确匹配时间范围格式
        const rangePattern = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})-(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
        const match = this.editForm.timeRange.match(rangePattern);
        
        if (match) {
          this.editForm.timeRange = [match[1], match[2]];
        } else {
          this.editForm.timeRange = [];
        }
      } else {
        this.editForm.timeRange = [];
      }
      
      // 确保编辑时显示原有图片
      if (!this.editForm.image) {
        this.editForm.image = this.getPreviewImage();
      }
      this.editDialogVisible = true;
    },
    // 保存编辑
    saveEdit() {
      // 处理时间范围：将数组格式转换为字符串格式
      const editedForm = { ...this.editForm };
      if (editedForm.timeRange && Array.isArray(editedForm.timeRange) && editedForm.timeRange.length === 2) {
        editedForm.timeRange = `${editedForm.timeRange[0]}-${editedForm.timeRange[1]}`;
      } else if (!editedForm.timeRange || editedForm.timeRange.length === 0) {
        const currentYear = new Date().getFullYear();
        editedForm.timeRange = `${currentYear}-01-01 00:00:00-${currentYear}-12-31 23:59:59`;
      }
      
      // 更新档案信息
      this.archiveInfo = { ...editedForm };
      
      // 同时更新档案列表中的对应档案
      const index = this.archivesList.findIndex(item => item.id === this.currentArchiveId);
      if (index !== -1) {
        this.archivesList[index] = { ...editedForm, id: this.currentArchiveId };
      }
      
      this.isEditing = false;
      this.editDialogVisible = false;
      this.$message.success('档案信息更新成功');
    },
    // 取消编辑
    cancelEdit() {
      this.isEditing = false;
      this.editDialogVisible = false;
    },
    // 添加新预警
    addWarning() {
      this.addDialogVisible = true;
      this.addForm = {
        name: '',
        deviceName: '',
        warningLevel: '',
        warningType: '',
        location: '',
        description: '',
        warningTime: '',
        violationImage: '',
        violationVideo: ''
      };
    },
    // 提交新预警
    submitNewWarning() {
      // 验证单个时间
      const isTimeValid = this.addForm.warningTime && this.addForm.warningTime.trim() !== '';
      
      if (!this.addForm.name || !this.addForm.deviceName || !this.addForm.warningLevel || !isTimeValid || !this.addForm.warningType || !this.addForm.location) {
        this.$message.warning('请填写必要的信息（预警名称、设备名称、预警等级、预警时间、预警类型、违规位置）');
        return;
      }

      const newId = this.allArchiveList.length > 0 ? Math.max(...this.allArchiveList.map(item => item.id)) + 1 : 1;

      const newRecord = {
        id: newId,
        name: this.addForm.name,
        deviceName: this.addForm.deviceName,
        warningLevel: this.addForm.warningLevel,
        warningType: this.addForm.warningType,
        location: this.addForm.location,
        remark: '',
        image: this.addForm.violationImage || this.getPreviewImage(),
        warningTime: this.addForm.warningTime,
        violationImage: this.addForm.violationImage,
        violationVideo: this.addForm.violationVideo,
        description: this.addForm.description
      };

      this.allArchiveList.unshift(newRecord);
      this.updatePageData();
      this.addDialogVisible = false;
      this.$message.success('成功添加新预警记录');
    },
    // 添加新档案
    addNewArchive() {
      this.addArchiveDialogVisible = true;
      this.newArchiveForm = {
        name: '',
        location: '',
        timeRange: [],
        description: '',
        image: ''
      };
    },
    // 提交新档案
    submitNewArchive() {
      if (!this.newArchiveForm.name || !this.newArchiveForm.location) {
        this.$message.warning('请填写必要的信息');
        return;
      }
      
      const newArchiveId = this.archivesList.length > 0 
        ? Math.max(...this.archivesList.map(item => item.id)) + 1 
        : 1;
      
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      const seconds = currentDate.getSeconds().toString().padStart(2, '0');
      
      const createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      // 处理时间范围
      let timeRangeStr = '';
      if (this.newArchiveForm.timeRange && this.newArchiveForm.timeRange.length === 2) {
        timeRangeStr = `${this.newArchiveForm.timeRange[0]}-${this.newArchiveForm.timeRange[1]}`;
      } else {
        timeRangeStr = `${year}-01-01 00:00:00-${year}-12-31 23:59:59`;
      }
      
      const newArchive = {
        id: newArchiveId,
        name: this.newArchiveForm.name,
        location: this.newArchiveForm.location,
        timeRange: timeRangeStr,
        createTime: createTime,
        description: this.newArchiveForm.description || '-',
        image: this.newArchiveForm.image || this.getPreviewImage()
      };
      
      // 添加到档案列表
      this.archivesList.push(newArchive);
      
      // 为新档案生成预警数据
      this.archiveWarningLists[newArchiveId] = this.generateMockDataForArchive(newArchive);
      
      // 切换到新档案
      this.switchToArchive(newArchiveId);
      
      this.addArchiveDialogVisible = false;
      this.$message.success('成功添加新档案');
    },
    // 处理上传成功后的逻辑
    handleUploadSuccess(response, file) {
      // 实际项目中应从服务器响应中获取图片URL
      // 这里使用本地文件预览URL作为演示
      const imageUrl = URL.createObjectURL(file.raw);
      
      // 根据上下文设置不同表单的图片
      if (this.editDialogVisible) {
        this.editForm.image = imageUrl;
      } else if (this.addArchiveDialogVisible) {
        this.newArchiveForm.image = imageUrl;
      }
      
      this.$message.success('图片上传成功');
    },
    // 处理上传前的图片校验
    beforeUpload(file) {
      // 检查文件类型
      const isImage = file.type.indexOf('image/') === 0;
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      
      // 检查文件大小，限制为2MB
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('图片不能超过2MB!');
        return false;
      }
      
      return true;
    },
    // 处理上传错误
    handleUploadError(error) {
      console.error('上传错误', error);
      this.$message.error('图片上传失败，请重试');
    },
    // 处理移除图片
    handleRemove() {
      if (this.editDialogVisible) {
        this.editForm.image = '';
      } else if (this.addArchiveDialogVisible) {
        this.newArchiveForm.image = '';
      }
    },
    // 处理违规截图上传
    beforeImageUpload(file) {
      // 检查文件类型
      const isImage = file.type.indexOf('image/') === 0;
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      
      // 检查文件大小，限制为2MB
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('图片不能超过2MB!');
        return false;
      }
      
      return true;
    },
    // 处理违规截图上传成功
    handleImageUploadSuccess(response, file) {
      // 实际项目中应从服务器响应中获取图片URL
      // 这里使用本地文件预览URL作为演示
      const imageUrl = URL.createObjectURL(file.raw);
      
      this.addForm.violationImage = imageUrl;
      
      this.$message.success('违规截图上传成功');
    },
    // 处理违规截图移除
    removeImage() {
      this.addForm.violationImage = '';
    },
    // 预览图片
    previewImage(imageUrl) {
      this.currentPreviewImage = imageUrl;
      this.imagePreviewVisible = true;
    },
    // 处理视频片段上传
    beforeVideoUpload(file) {
      // 检查文件类型
      const isVideo = file.type.indexOf('video/') === 0;
      if (!isVideo) {
        this.$message.error('只能上传视频文件!');
        return false;
      }
      
      // 检查文件大小，限制为10MB
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.$message.error('视频不能超过10MB!');
        return false;
      }
      
      return true;
    },
    // 处理视频片段上传成功
    handleVideoUploadSuccess(response, file) {
      // 实际项目中应从服务器响应中获取视频URL
      // 这里使用本地文件预览URL作为演示
      const videoUrl = URL.createObjectURL(file.raw);
      
      this.addForm.violationVideo = videoUrl;
      
      this.$message.success('视频片段上传成功');
    },
    // 处理视频片段移除
    removeVideo() {
      this.addForm.violationVideo = '';
    },
    // 格式化时间
    formatTime(timeString) {
      try {
        if (!timeString) return timeString;
        
        // 检查是否是时间范围格式（包含" HH:mm:ss-"这样的模式）
        const rangePattern = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})-(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
        const match = timeString.match(rangePattern);
        
        if (match) {
          // 这是时间范围格式
          const startTime = match[1];
          const endTime = match[2];
          
          // 格式化开始时间
          const [startDate, startTimeStr] = startTime.split(' ');
          const [startYear, startMonth, startDay] = startDate.split('-');
          const formattedStart = `${startYear}年${startMonth}月${startDay}日 ${startTimeStr}`;
          
          // 格式化结束时间
          const [endDate, endTimeStr] = endTime.split(' ');
          const [endYear, endMonth, endDay] = endDate.split('-');
          const formattedEnd = `${endYear}年${endMonth}月${endDay}日 ${endTimeStr}`;
          
          return `${formattedStart} 至 ${formattedEnd}`;
        }
        
        // 如果是单个完整的时间字符串，格式化为更友好的显示
        if (timeString.includes(' ')) {
          const [date, time] = timeString.split(' ');
          const [year, month, day] = date.split('-');
          return `${year}年${month}月${day}日 ${time}`;
        }
        
        return timeString;
      } catch (error) {
        return timeString;
      }
    }
  }
}
</script>

<template>
  <div class="page-container">
    <!-- 内容区域 -->
    <div class="content-wrapper">
 
      <!-- 左侧档案信息区域 -->
      <div class="detail-section">
        <div class="detail-header">
          <div class="detail-title">档案基本信息</div>
          <div class="header-actions">
            <el-button type="primary" size="mini" @click="addNewArchive">添加档案</el-button>
          </div>
        </div>

        <!-- 档案列表 -->
        <div class="archives-list">
          <div 
            v-for="archive in archivesList" 
            :key="archive.id" 
            class="archive-item"
            :class="{'active': currentArchiveId === archive.id}"
            @click="switchToArchive(archive.id)"
          >
            <div class="archive-content">
              <div class="archive-name">{{ archive.name }}</div>
              <div class="archive-location">位置: {{ archive.location }}</div>
              <div class="archive-time">创建: {{ formatTime(archive.createTime) }}</div>
            </div>
          </div>
        </div>

        <!-- 当前选中档案详情 -->
        <div class="detail-content">
          <div class="archive-detail-card">
            <div class="archive-detail-header">
              <div class="archive-title">{{ archiveInfo.name }}</div>
            </div>
            <div class="archive-detail-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">所属位置：</span>
                  <span class="value">{{ archiveInfo.location }}</span>
                </div>
                <div class="info-item">
                  <span class="label">时间范围：</span>
                  <span class="value">{{ formatTime(archiveInfo.timeRange) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间：</span>
                  <span class="value">{{ formatTime(archiveInfo.createTime) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">档案描述：</span>
                  <span class="value">{{ archiveInfo.description || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="archive-detail-footer">
              <el-button type="primary" class="edit-archive-btn" @click="editArchive">编辑档案</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表格区域 -->
      <div class="table-section">
        <!-- 表格标题和操作按钮 -->
        <div class="table-header">
          <div class="table-title">预警列表 - {{ archiveInfo.name }}</div>
          <div class="table-actions">
            <el-button type="danger" size="small" class="batch-delete-btn" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
              批量删除
            </el-button>
            <el-button type="primary" size="small" class="add-btn" @click="addWarning">
              <i class="el-icon-plus"></i> 添加预警
            </el-button>
          </div>
        </div>
        
        <!-- 表格内容 -->
        <el-table :data="archiveList" @selection-change="handleSelectionChange" style="width: 100%">
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="序号" prop="id" width="80" align="center"></el-table-column>
          <el-table-column label="预警名称" prop="name" min-width="120" align="center"></el-table-column>
          <el-table-column label="预警图片" width="100" align="center">
            <template slot-scope="scope">
              <div class="preview-image-cell">
                <div class="mini-image-preview" @click="showImagePreview(scope.row)">
                  <div class="mini-blue-box">
                    <i class="el-icon-picture-outline"></i>
                    <span>预警图片</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="设备名称" prop="deviceName" min-width="150" align="center"></el-table-column>
          <el-table-column label="预警时间" prop="warningTime" min-width="180" align="center">
            <template slot-scope="scope">
              {{ formatTime(scope.row.warningTime) }}
            </template>
          </el-table-column>
          <el-table-column label="预警等级" width="100" align="center">
            <template slot-scope="scope">
              <span class="level-tag" :class="{
                'level1-tag': scope.row.warningLevel === 'level1',
                'level2-tag': scope.row.warningLevel === 'level2',
                'level3-tag': scope.row.warningLevel === 'level3',
                'level4-tag': scope.row.warningLevel === 'level4'
              }">
                {{ 
                  scope.row.warningLevel === 'level1' ? '一级预警' :
                  scope.row.warningLevel === 'level2' ? '二级预警' :
                  scope.row.warningLevel === 'level3' ? '三级预警' : 
                  scope.row.warningLevel === 'level4' ? '四级预警' :
                  '未知预警' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <div class="operation-buttons">
                <el-button type="text" size="mini" @click="showDetail(scope.row)" class="operation-btn detail-btn">详情</el-button>
                <el-button type="text" size="mini" @click="handleDelete(scope.row.id)" class="operation-btn delete-btn">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页区域 - 改为与 deviceSkills.vue 一致的样式 -->
        <div class="pagination">
          <el-pagination
            :current-page.sync="pagination.currentPage"
            :page-size.sync="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

    </div>

    <!-- 替换原有的预警详情弹框 -->
    <WarningDetail 
      :visible.sync="warningDetailVisible"
      :warning="currentWarning"
      source="warningArchives"
      @handle-warning="handleWarningFromDetail"
    />

    <!-- 图片预览弹框 -->
    <el-dialog title="预警图片预览" :visible.sync="imagePreviewVisible" width="50%" custom-class="image-preview-dialog">
      <div class="image-preview-wrapper">
        <div class="preview-blue-box">
          <i class="el-icon-picture-outline"></i>
          <p>预警图片</p>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑档案弹框 -->
    <el-dialog title="编辑档案信息" :visible.sync="editDialogVisible" width="30%" :before-close="cancelEdit"
      custom-class="edit-archive-dialog">
      <el-form :model="editForm" label-width="100px" class="edit-form">
        <el-form-item label="档案名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="所属位置">
          <el-input v-model="editForm.location"></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="editForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
          <div class="form-tip">
            <i class="el-icon-info"></i>
            <span>可选项：不填写将自动设置为当年完整时间范围</span>
          </div>
        </el-form-item>
        <el-form-item label="备注描述">
          <el-input type="textarea" v-model="editForm.description" rows="4"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="saveEdit" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加预警弹框 -->
    <el-dialog title="添加预警" :visible.sync="addDialogVisible" width="50%" custom-class="add-warning-dialog">
      <el-form :model="addForm" label-width="100px" class="add-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预警名称" required>
              <el-input v-model="addForm.name" placeholder="请输入预警名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" required>
              <el-input v-model="addForm.deviceName" placeholder="请输入设备名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预警等级" required>
              <el-select v-model="addForm.warningLevel" placeholder="请选择预警等级" style="width: 100%">
                <el-option label="一级预警" value="level1"></el-option>
                <el-option label="二级预警" value="level2"></el-option>
                <el-option label="三级预警" value="level3"></el-option>
                <el-option label="四级预警" value="level4"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预警类型" required>
              <el-select v-model="addForm.warningType" placeholder="请选择预警类型" style="width: 100%">
                <el-option label="安全违规" value="安全违规"></el-option>
                <el-option label="人员违规" value="人员违规"></el-option>
                <el-option label="消防违规" value="消防违规"></el-option>
                <el-option label="车辆违规" value="车辆违规"></el-option>
                <el-option label="其他违规" value="其他违规"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="违规位置" required>
              <el-input v-model="addForm.location" placeholder="请输入违规位置"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预警时间" required>
              <el-date-picker
                v-model="addForm.warningTime"
                type="datetime"
                placeholder="选择预警时间"
                style="width: 100%"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="预警描述">
          <el-input type="textarea" v-model="addForm.description" rows="3" placeholder="请输入预警详细描述"></el-input>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="违规截图">
              <div class="upload-container">
                <el-upload
                  class="violation-image-uploader"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :before-upload="beforeImageUpload"
                  :on-success="handleImageUploadSuccess"
                  :on-error="handleUploadError">
                  <div v-if="addForm.violationImage" class="image-preview-container">
                    <img :src="addForm.violationImage" class="uploaded-image" />
                    <div class="image-overlay">
                      <div class="overlay-actions">
                        <el-button type="text" size="mini" @click.stop="previewImage(addForm.violationImage)">
                          <i class="el-icon-view"></i> 预览
                        </el-button>
                        <el-button type="text" size="mini" @click.stop="removeImage">
                          <i class="el-icon-delete"></i> 删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="upload-dragger">
                    <div class="upload-icon">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                    <div class="upload-title">点击上传违规截图</div>
                    <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="视频片段">
              <div class="upload-container">
                <el-upload
                  class="violation-video-uploader"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :before-upload="beforeVideoUpload"
                  :on-success="handleVideoUploadSuccess"
                  :on-error="handleUploadError">
                  <div v-if="addForm.violationVideo" class="video-preview-container">
                    <video :src="addForm.violationVideo" class="uploaded-video" controls></video>
                    <div class="video-overlay">
                      <div class="overlay-actions">
                        <el-button type="text" size="mini" @click.stop="removeVideo">
                          <i class="el-icon-delete"></i> 删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="upload-dragger">
                    <div class="upload-icon">
                      <i class="el-icon-video-camera-solid"></i>
                    </div>
                    <div class="upload-title">点击上传视频片段</div>
                    <div class="upload-tip">支持 MP4、AVI 格式，大小不超过 10MB</div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="submitNewWarning" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog title="删除确认" :visible.sync="deleteConfirmVisible" width="25%" custom-class="delete-confirm-dialog"
      center>
      <div class="confirm-content">
        <p>{{ deleteConfirmMessage }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="deleteConfirmVisible = false" class="cancel-btn">取 消</el-button>
        <el-button size="small" type="danger" @click="confirmDelete" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加档案对话框 -->
    <el-dialog title="添加新档案" :visible.sync="addArchiveDialogVisible" width="30%" custom-class="add-archive-dialog">
      <el-form :model="newArchiveForm" label-width="100px" class="add-form">
        <el-form-item label="档案名称" required>
          <el-input v-model="newArchiveForm.name"></el-input>
        </el-form-item>
        <el-form-item label="所属位置" required>
          <el-input v-model="newArchiveForm.location"></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="newArchiveForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
          <div class="form-tip">
            <i class="el-icon-info"></i>
            <span>可选项：不填写将自动设置为当年完整时间范围</span>
          </div>
        </el-form-item>
        <el-form-item label="备注描述">
          <el-input type="textarea" v-model="newArchiveForm.description" rows="4" placeholder="请输入备注描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addArchiveDialogVisible = false" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="submitNewArchive" class="confirm-btn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 60px);
  position: relative;
}

/* 内容区域 */
.content-wrapper {
  display: flex;
  gap: 16px;
  padding: 16px;
}

/* 表格区域样式 */
.table-section {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}



/* 表格头部 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  z-index: 2;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
}

.table-actions {
  display: flex;
  gap: 10px;
}

/* 移除表格竖线条 */
::v-deep .table-section .el-table--border td,
::v-deep .table-section .el-table--border th {
  border-right: none;
}

::v-deep .table-section .el-table::before,
::v-deep .table-section .el-table::after {
  display: none;
}

/* 调整el-table样式 */
::v-deep .table-section .el-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  color: #1e40af !important;
  font-weight: 600 !important;
  padding: 8px 0;
  text-align: center;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2) !important;
}

::v-deep .table-section .el-table--border {
  border: none;
  border-radius: 0;
  overflow: hidden;
}

::v-deep .table-section .el-table td {
  padding: 8px 0;
  text-align: center;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
}

::v-deep .table-section .el-table__row:hover > td {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.03) 100%) !important;
}

::v-deep .table-section .el-table__row {
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

/* 预览图片单元格 */
.preview-image-cell {
  text-align: center;
}

.mini-image-preview {
  width: 80px;
  height: 50px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
  border: 1px solid #dcdfe6;
}

.mini-image-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mini-blue-box {
  width: 80px;
  height: 50px;
  background: linear-gradient(135deg, #e6f4ff 0%, #bae7ff 50%, #91d5ff 100%);
  border: 1px solid #d1e9ff;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  cursor: pointer;
  font-size: 10px;
  color: #0066cc;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.mini-blue-box:hover {
  background: linear-gradient(135deg, #d4edff 0%, #a3d5ff 50%, #7cb8e8 100%);
  color: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.mini-blue-box i {
  font-size: 16px;
  margin-bottom: 2px;
}

.mini-blue-box span {
  font-weight: 500;
  white-space: nowrap;
}

/* 预警等级标签 */
.level-tag {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 2px;
}

.level1-tag {
  background-color: #fff0f0;
  color: #f56c6c;
}

.level2-tag {
  background-color: #fff8e6;
  color: #e6a23c;
}

.level3-tag {
  background-color: #e6f2ff;
  color: #1890ff;
}

.level4-tag {
  background-color: #e6f7e6;
  color: #67c23a;
}

/* 旧样式保留兼容 */
.high-level {
  background-color: #fff0f0;
  color: #f56c6c;
}

.medium-level {
  background-color: #fff8e6;
  color: #e6a23c;
}

.low-level {
  background-color: #e6f7e6;
  color: #67c23a;
}

/* 操作按钮 */
.detail-btn {
  color: #3b82f6;
  margin-right: 10px;
  transition: color 0.3s ease;
}

.detail-btn:hover {
  color: #1e40af;
}

.delete-btn {
  color: #f56c6c;
  transition: color 0.3s ease;
}

.delete-btn:hover {
  color: #dc2626;
}



/* 左侧详情部分 */
.detail-section {
  width: 330px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}



.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  z-index: 2;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  color: #409eff;
}

/* 档案列表样式 */
.archives-list {
  max-height: 300px;
  overflow-y: auto;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  padding: 0 10px;
}

.archive-item {
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  background: rgba(255, 255, 255, 0.8);
}

.archive-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.03) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.archive-item.active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}



.archive-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.archive-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
}

.archive-location, .archive-time {
  font-size: 12px;
  color: #6b7280;
}

.detail-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 预览图片蓝色框 */
.preview-blue-box {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #e6f4ff 0%, #bae7ff 30%, #91d5ff 70%, #69c0ff 100%);
  border: 2px solid #d1e9ff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #0066cc;
  box-shadow: 
    0 8px 32px rgba(64, 158, 255, 0.2),
    inset 0 2px 16px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}



.preview-blue-box i {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.8;
  z-index: 1;
  position: relative;
}

.preview-blue-box p {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  z-index: 1;
  position: relative;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

@keyframes shimmer {
  0%, 100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 0.1;
  }
}

/* 详情蓝色框 */
.detail-image-box {
  height: 200px;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.info-item .label {
  color: #606266;
  width: 80px;
  flex-shrink: 0;
  text-align: left;
}

.info-item .value {
  color: #333;
  flex: 1;
  text-align: left;
  word-break: break-all;
}

/* 档案操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
}

.edit-archive-btn {
  width: 100%;
  border-radius: 4px;
}

/* 弹框样式 - 与 deviceSkills.vue 一致 */
.page-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.page-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.page-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.page-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.page-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.page-container >>> .el-dialog__footer {
  padding: 10px 20px 20px;
  text-align: right;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 上传组件样式优化 */
.page-container >>> .el-upload-dragger {
  border: 2px dashed #d1d5db !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.page-container >>> .el-upload-dragger:hover {
  border-color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.page-container >>> .el-upload-dragger .el-icon-upload {
  color: #3b82f6 !important;
}

.page-container >>> .el-upload__text {
  color: #6b7280 !important;
}

.page-container >>> .el-upload__text em {
  color: #3b82f6 !important;
  font-weight: 500 !important;
}

/* 表格样式优化 - 保持黑色字体 */
.page-container >>> .el-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  color: #303133 !important;
  font-weight: 600 !important;
  padding: 8px 0;
  text-align: center;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2) !important;
}

.page-container >>> .el-table td {
  padding: 8px 0;
  text-align: center;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
}

.page-container >>> .el-table__row:hover > td {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.03) 100%) !important;
}

/* 科技感 Radio 样式 */
.page-container >>> .el-radio__input.is-checked .el-radio__inner {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

.page-container >>> .el-radio__inner:hover {
  border-color: #3b82f6 !important;
}

/* 科技感 Checkbox 样式 */
.page-container >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

.page-container >>> .el-checkbox__inner:hover {
  border-color: #3b82f6 !important;
}

/* 科技感 Tag 样式 */
.page-container >>> .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.operation-btn {
  padding: 4px 8px !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
  border-radius: 4px !important;
  min-width: 40px !important;
  height: 24px !important;
  transition: all 0.3s ease !important;
}

.operation-btn.detail-btn {
  color: #3b82f6 !important;
  border: 1px solid #3b82f6 !important;
  background: transparent !important;
}

.operation-btn.detail-btn:hover {
  background: #3b82f6 !important;
  color: white !important;
}

.operation-btn.delete-btn {
  color: #dc2626 !important;
  border: 1px solid #dc2626 !important;
  background: transparent !important;
}

.operation-btn.delete-btn:hover {
  background: #dc2626 !important;
  color: white !important;
}

/* 分页样式 - 与 deviceSkills.vue 完全一致 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: -20px;
  padding: 20px 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination >>> .el-pagination {
  justify-content: center;
}

.pagination >>> .el-pagination .el-pager li {
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
}

.pagination >>> .el-pagination .el-pager li:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.pagination >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.pagination >>> .el-pagination button {
  background: white !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
}

.pagination >>> .el-pagination button:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

/* 详情弹窗 */
::v-deep .warning-detail-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-info {
  background: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  display: flex;
  font-size: 14px;
  align-items: center;
}

.detail-item .label {
  width: 100px;
  color: #606266;
  flex-shrink: 0;
}

.detail-item .value {
  flex: 1;
  color: #333;
}

/* 图片预览对话框 */
::v-deep .image-preview-dialog .el-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.image-preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  object-fit: contain;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #909399;
}

.no-image-placeholder i {
  font-size: 48px;
  margin-bottom: 12px;
  color: #c0c4cc;
}

.no-image-placeholder p {
  margin: 0;
  font-size: 14px;
}

/* 编辑档案弹窗 */
::v-deep .edit-archive-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.edit-form .el-form-item {
  margin-bottom: 20px;
}

.edit-form .el-input__inner {
  height: 36px;
  line-height: 36px;
}

.edit-form .el-textarea__inner {
  min-height: 80px;
}

/* 添加预警弹窗 */
::v-deep .add-warning-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
}

.add-form .el-form-item {
  margin-bottom: 20px;
}

.add-form .el-input__inner {
  height: 36px;
  line-height: 36px;
}

.add-form .el-textarea__inner {
  min-height: 80px;
}

/* 删除确认弹窗 */
::v-deep .delete-confirm-dialog .el-dialog {
  border-radius: 4px;
  overflow: hidden;
  min-width: 320px;
}

::v-deep .delete-confirm-dialog .el-dialog__body {
  padding: 30px 20px;
}

::v-deep .delete-confirm-dialog .el-dialog__footer {
  border-top: 1px solid #ebeef5;
  padding: 10px 20px;
}

.confirm-content {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

/* 表格中预警图片小蓝框 */
.preview-image-cell {
  text-align: center;
}

.mini-image-preview {
  width: 80px;
  height: 50px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
  border: 1px solid #dcdfe6;
}

.mini-image-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mini-blue-box {
  width: 80px;
  height: 50px;
  background: linear-gradient(135deg, #e6f4ff 0%, #bae7ff 50%, #91d5ff 100%);
  border: 1px solid #d1e9ff;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  cursor: pointer;
  font-size: 10px;
  color: #0066cc;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.mini-blue-box:hover {
  background: linear-gradient(135deg, #d4edff 0%, #a3d5ff 50%, #7cb8e8 100%);
  color: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.mini-blue-box i {
  font-size: 16px;
  margin-bottom: 2px;
}

.mini-blue-box span {
  font-weight: 500;
  white-space: nowrap;
}

/* 上传组件样式 */
.upload-container {
  width: 100%;
}

.violation-image-uploader,
.violation-video-uploader {
  width: 100%;
}

.violation-image-uploader .el-upload,
.violation-video-uploader .el-upload {
  width: 100%;
  height: 180px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.upload-dragger {
  width: 100%;
  height: 180px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  padding: 20px;
  box-sizing: border-box;
}

.upload-dragger:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-icon {
  margin-bottom: 12px;
}

.upload-icon i {
  font-size: 48px;
  color: #c0c4cc;
  transition: color 0.3s ease;
}

.upload-dragger:hover .upload-icon i {
  color: #409eff;
}

.upload-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  text-align: center;
  line-height: 1.4;
}

.image-preview-container,
.video-preview-container {
  width: 100%;
  height: 180px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.uploaded-image,
.uploaded-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-overlay,
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    transparent 60%, 
    rgba(0, 0, 0, 0.3) 80%, 
    rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-container:hover .image-overlay,
.video-preview-container:hover .video-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 12px;
}

.overlay-actions .el-button {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  color: #606266;
  padding: 8px 12px;
  font-size: 12px;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.overlay-actions .el-button:hover {
  background-color: #409eff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.overlay-actions .el-button i {
  margin-right: 4px;
}

/* 档案详情 */
.detail-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.archive-detail-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.15);
  position: relative;
}



.archive-detail-header {
  padding: 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}

.archive-detail-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
}

.archive-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
}

.archive-detail-body {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: baseline;
}

.info-item .label {
  min-width: 90px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  color: #1f2937;
  font-size: 14px;
  flex: 1;
  word-break: break-all;
}

.archive-detail-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}



.edit-archive-btn {
  width: 100%;
  border-radius: 4px;
}

/* 表单提示文字样式 */
.form-tip {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 6px;
  font-size: 12px;
  color: #1e40af;
  line-height: 1.4;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.form-tip:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.form-tip i {
  font-size: 14px;
  margin-right: 6px;
  color: #10b981;
  flex-shrink: 0;
}

.form-tip span {
  flex: 1;
  font-weight: 500;
}

/* 时间段选择器样式优化 */
::v-deep .el-date-editor--datetimerange {
  width: 100% !important;
}

::v-deep .el-date-editor--datetimerange .el-range-separator {
  width: 30px;
  text-align: center;
  color: #606266;
  font-weight: 500;
}

::v-deep .el-date-editor--datetimerange .el-range-input {
  background-color: transparent;
  border: 0;
  color: #606266;
  font-size: 14px;
  line-height: 28px;
  outline: none;
  display: inline-block;
  width: 39%;
  text-align: center;
}

::v-deep .el-date-editor--datetimerange .el-range__icon {
  font-size: 14px;
  color: #c0c4cc;
  float: left;
  width: 25px;
  margin-left: 7px;
  text-align: center;
}

/* 科技感蓝色按钮样式 - 与 deviceSkills.vue 完全一致 */
.page-container >>> .el-button {
  height: 32px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 0;
}

.page-container >>> .el-button--primary,
.page-container >>> .add-btn,
.page-container >>> .edit-archive-btn {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3) !important;
  position: relative !important;
  overflow: hidden !important;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
  border-radius: 6px !important;
}



.page-container >>> .el-button--primary:hover,
.page-container >>> .add-btn:hover,
.page-container >>> .edit-archive-btn:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4) !important;
  transform: translateY(-2px) !important;
}



/* 批量删除按钮改为刷新按钮样式 */
.page-container >>> .batch-delete-btn {
  padding: 7px 10px !important;
  margin-left: 0 !important;
  color: #606266 !important;
  background-color: #fff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: none !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
  text-shadow: none !important;
  height: 32px !important;
  position: static !important;
  overflow: visible !important;
}

.page-container >>> .batch-delete-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
  transform: none !important;
}

.page-container >>> .batch-delete-btn::before {
  display: none !important;
}

.page-container >>> .batch-delete-btn:hover::before {
  display: none !important;
}

/* 保持其他危险按钮的红色样式 */
.page-container >>> .el-button--danger:not(.batch-delete-btn) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4), 0 2px 4px rgba(185, 28, 28, 0.3) !important;
  position: relative !important;
  overflow: hidden !important;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
  border-radius: 6px !important;
}



.page-container >>> .el-button--danger:not(.batch-delete-btn):hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5), 0 4px 8px rgba(185, 28, 28, 0.4) !important;
  transform: translateY(-2px) !important;
}



.page-container >>> .el-button:not(.el-button--primary):not(.el-button--danger):not(.add-btn):not(.edit-archive-btn):not(.batch-delete-btn) {
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  border-radius: 6px !important;
}

.page-container >>> .el-button:not(.el-button--primary):not(.el-button--danger):not(.add-btn):not(.edit-archive-btn):not(.batch-delete-btn):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* 弹框按钮统一样式 */
.page-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.page-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.page-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.page-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}



/* 输入框和选择器样式 - 与 deviceSkills.vue 一致 */
.page-container >>> .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.page-container >>> .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.page-container >>> .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.page-container >>> .el-select .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.page-container >>> .el-select .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.page-container >>> .el-select .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.page-container >>> .el-date-editor.el-input {
  border-radius: 6px !important;
}

.page-container >>> .el-date-editor .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
}

.page-container >>> .el-date-editor .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.page-container >>> .el-date-editor .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.page-container >>> .el-textarea__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.page-container >>> .el-textarea__inner:hover {
  border-color: #3b82f6 !important;
}

.page-container >>> .el-textarea__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}


</style>
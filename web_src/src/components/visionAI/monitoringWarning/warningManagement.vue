<script>
import WarningDetail from './warningDetail.vue'

export default {
  name: "WarningManagement",
  components: {
    WarningDetail
  },
  data() {
    return {
      // 定义搜索条件
      searchForm: {
        deviceName: '',
        startDate: '',
        endDate: '',
        warningType: '',
        warningLevel: '',
        warningSkill: '', // 预警技能
        warningName: '', // 预警名称
        warningId: '' // 预警ID
      },
      
      // 左侧位置数据
      locationList: [
        {
          id: 'all',
          name: '全部位置',
          count: 0, // 动态计算
          selected: true
        },
        {
          id: 'northeast_corner',
          name: '工地东北角',
          count: 0,
          selected: false
        },
        {
          id: 'south_side',
          name: '工地南侧',
          count: 0,
          selected: false
        },
        {
          id: 'material_area',
          name: '材料区',
          count: 0,
          selected: false
        },
        {
          id: 'rest_area',
          name: '休息区',
          count: 0,
          selected: false
        },
        {
          id: 'construction_area',
          name: '施工作业区',
          count: 0,
          selected: false
        }
      ],
      
      // 当前选中的位置
      selectedLocationId: 'all',
      
      // 预警列表数据
      warningList: [
        {
          id: '1',
          deviceName: '未戴安全帽',
          imageUrl: require('./images/5.jpg'),
          value: 1,
          unit: '人',
          level: '一级预警',
          time: '2024-12-18 10:30:25',
          status: 'pending',
          cameraId: 'camera_1',
          deviceInfo: {
            name: '摄像头01',
            position: '工地东北角'
          },
          remark: '',
          device: '摄像头01',
          type: '未戴安全帽',
          location: '工地东北角',
          locationId: 'northeast_corner',
          description: '检测到工作人员未佩戴安全帽，存在严重安全隐患，请立即整改并加强安全教育',
          skill: 'safety_helmet_detection'
        },
        {
          id: '2',
          deviceName: '未穿工作服',
          imageUrl: require('./images/4.jpg'),
          value: 1,
          unit: '人',
          level: '二级预警',
          time: '2024-12-18 10:28:15',
          status: 'pending',
          cameraId: 'camera_3',
          deviceInfo: {
            name: '摄像头03',
            position: '工地南侧'
          },
          remark: '',
          device: '摄像头03',
          type: '未穿工作服',
          location: '工地南侧',
          locationId: 'south_side',
          description: '发现工作人员未按规定穿着工作服，违反现场作业安全规范，需要立即纠正',
          skill: 'work_clothes_detection'
        },
        {
          id: '3',
          deviceName: '闲杂人员',
          imageUrl: require('./images/5.jpg'),
          value: 1,
          unit: '人',
          level: '三级预警',
          time: '2024-12-18 10:15:42',
          status: 'pending',
          cameraId: 'camera_2',
          deviceInfo: {
            name: '摄像头02',
            position: '材料区'
          },
          remark: '',
          device: '摄像头02',
          type: '闲杂人员',
          location: '材料区',
          locationId: 'material_area',
          description: '检测到非工作人员进入施工区域，可能存在安全风险，请及时清理并加强管控',
          skill: 'personnel_intrusion_detection'
        },
        {
          id: '4',
          deviceName: '违规吸烟',
          imageUrl: require('./images/6.jpg'),
          value: 1,
          unit: '人',
          level: '二级预警',
          time: '2024-12-18 09:58:30',
          status: 'completed',
          cameraId: 'camera_5',
          deviceInfo: {
            name: '摄像头05',
            position: '休息区'
          },
          remark: '已对违规人员进行安全教育，并要求现场管理员加强巡查',
          device: '摄像头05',
          type: '违规吸烟',
          location: '休息区',
          locationId: 'rest_area',
          description: '发现工作人员在禁烟区域吸烟，违反安全生产规定，请立即制止并进行安全教育',
          skill: 'smoke_fire_detection'
        },
        {
          id: '5',
          deviceName: '高空作业未系安全带',
          imageUrl: require('./images/1.jpg'),
          value: 1,
          unit: '人',
          level: '一级预警',
          time: '2024-12-18 09:45:12',
          status: 'pending',
          cameraId: 'camera_4',
          deviceInfo: {
            name: '摄像头04',
            position: '施工作业区'
          },
          remark: '',
          device: '摄像头04',
          type: '高空作业未系安全带',
          location: '施工作业区',
          locationId: 'construction_area',
          description: '检测到高空作业人员未系安全带，存在坠落风险，请立即停止作业并整改',
          skill: 'safety_belt_detection'
        },
        {
          id: '6',
          deviceName: '未穿反光背心',
          imageUrl: require('./images/3.jpg'),
          value: 2,
          unit: '人',
          level: '三级预警',
          time: '2024-12-18 09:32:18',
          status: 'pending',
          cameraId: 'camera_6',
          deviceInfo: {
            name: '摄像头06',
            position: '工地东北角'
          },
          remark: '',
          device: '摄像头06',
          type: '未穿反光背心',
          location: '工地东北角',
          locationId: 'northeast_corner',
          description: '检测到作业人员未穿着反光背心，在低照度环境下存在安全隐患，请立即整改',
          skill: 'reflective_vest_detection'
        }
      ],
      
      // 表格加载状态
      loading: false,
      
      // 选中的预警项
      selectedWarnings: [],
      
      // 预警等级配置
      warningLevelConfig: {
        '一级预警': { color: '#F56C6C', bg: '#FEF0F0' },
        '二级预警': { color: '#E6A23C', bg: '#FDF6EC' },
        '三级预警': { color: '#409EFF', bg: '#ECF5FF' }
      },
      

      
      // 日期范围
      dateRange: null,
      
      // 目录搜索
      searchDirectory: '',
      
      // 导出数据相关
      exportDialogVisible: false,
      exportFormat: 'csv',
      exportLoading: false,
      
      // 添加备注对话框
      remarkDialogVisible: false,
      currentWarningId: '',
      remarkForm: {
        remark: ''
      },
      
      // 上报确认对话框
      reportDialogVisible: false,
      reportWarningId: '',
      
      // 归档确认对话框
      archiveDialogVisible: false,
      archiveWarningId: '',
      
      // 批量处理对话框
      batchProcessDialogVisible: false,
      batchRemarkForm: {
        remark: ''
      },
      
      // 档案管理数据
      archivesList: [
        {
          id: 'archive_1',
          name: '建筑工地默认档案',
          cameraId: 'camera_1',
          cameraName: '摄像头01',
          isDefault: true,
          createTime: '2024-01-01 10:00:00'
        },
        {
          id: 'archive_2', 
          name: '工地南侧专项档案',
          cameraId: 'camera_3',
          cameraName: '摄像头03',
          isDefault: false,
          createTime: '2024-01-05 14:30:00'
        }
      ],
      selectedArchiveId: '',
      currentCameraId: 'camera_1',
      
      // 预警详情对话框
      warningDetailVisible: false,
      currentWarningDetail: null,
      
      // 删除确认对话框
      deleteDialogVisible: false,
      deleteLoading: false,
      
      // 预警技能选项
      warningSkillOptions: [
        { label: '安全帽检测', value: 'safety_helmet_detection' },
        { label: '工作服检测', value: 'work_clothes_detection' },
        { label: '反光背心检测', value: 'reflective_vest_detection' },
        { label: '安全带检测', value: 'safety_belt_detection' },
        { label: '烟火检测', value: 'smoke_fire_detection' },
        { label: '人员入侵检测', value: 'personnel_intrusion_detection' },
        { label: '高空作业检测', value: 'high_altitude_work_detection' },
        { label: '区域入侵检测', value: 'area_intrusion_detection' }
      ]
    }
  },
  computed: {
    // 根据筛选条件过滤的预警列表
    filteredWarningList() {
      let list = [...this.warningList]
      
      // 过滤掉已归档的预警（已归档的预警不在预警管理页面显示）
      list = list.filter(item => item.status !== 'archived' && !item.isFalseAlarm)
      
      // 按位置过滤
      if (this.selectedLocationId && this.selectedLocationId !== 'all') {
        list = list.filter(item => item.locationId === this.selectedLocationId)
      }
      
      // 按开始日期过滤
      if (this.searchForm.startDate) {
        list = list.filter(item => new Date(item.time) >= new Date(this.searchForm.startDate))
      }
      
      // 按结束日期过滤
      if (this.searchForm.endDate) {
        list = list.filter(item => new Date(item.time) <= new Date(this.searchForm.endDate))
      }
      

      
      // 按预警类型过滤 (根据设备名称包含的关键词进行筛选)
      if (this.searchForm.warningType) {
        switch(this.searchForm.warningType) {
          case 'safety_helmet':
            list = list.filter(item => item.deviceName.includes('安全帽'))
            break
          case 'safety_belt':
            list = list.filter(item => item.deviceName.includes('安全带'))
            break
          case 'protective_clothing':
            list = list.filter(item => item.deviceName.includes('反光背心') || item.deviceName.includes('工作服'))
            break
          case 'unauthorized_personnel':
            list = list.filter(item => item.deviceName.includes('闲杂人员'))
            break
          case 'smoking':
            list = list.filter(item => item.deviceName.includes('吸烟'))
            break
          case 'high_altitude':
            list = list.filter(item => item.deviceName.includes('高空'))
            break
        }
      }
      
      // 按预警等级过滤
      if (this.searchForm.warningLevel) {
        const levelMap = {
          'level1': '一级预警',
          'level2': '二级预警',
          'level3': '三级预警',
          'level4': '四级预警'
        }
        list = list.filter(item => item.level === levelMap[this.searchForm.warningLevel])
      }
      
      // 按预警技能过滤
      if (this.searchForm.warningSkill) {
        list = list.filter(item => item.skill === this.searchForm.warningSkill)
      }
      
      // 按预警名称过滤
      if (this.searchForm.warningName) {
        list = list.filter(item => 
          item.deviceName.toLowerCase().includes(this.searchForm.warningName.toLowerCase())
        )
      }
      
      // 按预警ID过滤
      if (this.searchForm.warningId) {
        list = list.filter(item => 
          item.id.toLowerCase().includes(this.searchForm.warningId.toLowerCase())
        )
      }
      
      return list
    },
    
    // 计算各位置的预警数量
    locationListWithCount() {
      const list = this.warningList.filter(item => item.status !== 'archived' && !item.isFalseAlarm)
      
      return this.locationList.map(location => {
        let count = 0
        if (location.id === 'all') {
          count = list.length
        } else {
          count = list.filter(item => item.locationId === location.id).length
        }
        
        return {
          ...location,
          count
        }
      })
    },
    
    // 当前页的数据
    currentPageData() {
      // 这里模拟每页12条数据，实际项目中可能需要结合分页组件
      return this.filteredWarningList.slice(0, 12)
    },
    
    // 当前摄像头可用的档案列表
    availableArchives() {
      return this.archivesList.filter(archive => archive.cameraId === this.currentCameraId)
    },
    
    // 当前摄像头的默认档案
    defaultArchive() {
      return this.availableArchives.find(archive => archive.isDefault)
    }
  },
  watch: {
    dateRange(newVal) {
      if (newVal) {
        this.searchForm.startDate = newVal[0]
        this.searchForm.endDate = newVal[1]
      }
    }
  },
  mounted() {
    this.getWarningList()
  },
  methods: {
    // 搜索重置
    resetSearch() {
      this.searchForm = {
        deviceName: '',
        startDate: '',
        endDate: '',
        warningType: '',
        warningLevel: '',
        warningSkill: '',
        warningName: '',
        warningId: ''
      }
      this.dateRange = null
      this.getWarningList()
    },
    
    // 执行搜索
    handleSearch() {
      this.getWarningList()
    },
    
    // 获取预警列表
    async getWarningList() {
      this.loading = true
      try {
        // 实际应用中，将搜索条件传给API
        // this.warningList = await getWarningListAPI(this.searchForm)
        
        // 当前是模拟数据，先显示loading效果
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 刷新后清空选择
        this.selectedWarnings = []
      } finally {
        this.loading = false
      }
    },
    
    // 处理预警事件
    async handleWarning(id, action) {
      try {
        this.loading = true
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 更新本地数据状态
        const index = this.warningList.findIndex(item => item.id === id)
        if (index !== -1) {
          if (action === 'markProcessed') {
            // 处理预警 - 使用和预警详情对话框一致的逻辑
            this.startProcessingWarning(this.warningList[index])
            this.loading = false // 在弹框前先关闭loading
            return // 等处理意见填写完成后再继续
          } else if (action === 'report') {
            // 上报
            this.reportWarningId = id
            this.reportDialogVisible = true
            return // 不关闭loading，等确认后再关闭
          } else if (action === 'archive') {
            // 归档 - 需要选择档案
            this.archiveWarningId = id
            // 获取当前预警的摄像头信息（实际项目中从预警数据获取）
            this.currentCameraId = this.warningList[index].cameraId || 'camera_1'
            this.initArchiveSelection()
            this.archiveDialogVisible = true
            return // 不关闭loading，等确认后再关闭
          } else if (action === 'falseAlarm') {
            // 误报 - 自动归档到默认档案
            this.archiveWarningId = id
            // 获取当前预警的摄像头信息（实际项目中从预警数据获取）
            this.currentCameraId = this.warningList[index].cameraId || 'camera_1'
            await this.handleFalseAlarmArchive()
            return // 不关闭loading，等归档完成后再关闭
          }
        }
        
        // 如果在选中列表中，移除它
        const selectedIndex = this.selectedWarnings.indexOf(id)
        if (selectedIndex !== -1) {
          this.selectedWarnings.splice(selectedIndex, 1)
        }
      } catch (error) {
        console.error('处理失败:', error)
        this.$message.error('处理预警失败')
      } finally {
        this.loading = false
      }
    },
    
    // 初始化归档选择
    initArchiveSelection() {
      // 自动选择默认档案（如果存在）
      if (this.defaultArchive) {
        this.selectedArchiveId = this.defaultArchive.id
      } else {
        // 如果没有默认档案，则准备创建
        this.selectedArchiveId = ''
      }
    },
    
    // 确认归档
    async confirmArchive() {
      try {
        let targetArchiveId = this.selectedArchiveId
        let archiveName = ''
        
        // 如果没有选择档案，自动创建默认档案
        if (!targetArchiveId) {
          targetArchiveId = await this.createDefaultArchive()
          archiveName = '默认档案'
        } else {
          // 获取选中档案的名称
          const selectedArchive = this.availableArchives.find(archive => archive.id === targetArchiveId)
          archiveName = selectedArchive ? selectedArchive.name : '未知档案'
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案')
          return
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 获取当前预警并添加归档记录到操作历史
        const index = this.warningList.findIndex(item => item.id === this.archiveWarningId)
        if (index !== -1) {
          // 添加归档记录到操作历史
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', [])
          }
          
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '预警归档',
            time: this.getCurrentTime(),
            description: `预警已归档到：${archiveName}，可在预警档案中查看`,
            operationType: 'archive',
            operator: this.getCurrentUserName(),
            archiveInfo: {
              archiveId: targetArchiveId,
              archiveName: archiveName
            }
          }
          
          this.warningList[index].operationHistory.unshift(newRecord)
          
          // 更新预警状态为已归档（用于筛选时不显示）
          this.warningList[index].status = 'archived'
          this.warningList[index].archiveId = targetArchiveId
          this.warningList[index].archiveTime = new Date().toLocaleString()
        }
        
        // 如果在选中列表中，也移除
        const selectedIndex = this.selectedWarnings.indexOf(this.archiveWarningId)
        if (selectedIndex !== -1) {
          this.selectedWarnings.splice(selectedIndex, 1)
        }
        
        this.$message.success('预警已成功归档')
        this.closeArchiveDialog()
      } catch (error) {
        console.error('归档失败:', error)
        this.$message.error('归档失败')
      } finally {
        this.loading = false
      }
    },
    
    // 自动创建默认档案
    async createDefaultArchive() {
      try {
        // 模拟API调用创建默认档案
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const newArchive = {
          id: `archive_${Date.now()}`,
          name: `${this.getCurrentCameraName()}默认档案`,
          cameraId: this.currentCameraId,
          cameraName: this.getCurrentCameraName(),
          isDefault: true,
          createTime: new Date().toLocaleString()
        }
        
        this.archivesList.push(newArchive)
        this.$message.success('已自动创建默认档案')
        
        return newArchive.id
      } catch (error) {
        console.error('创建默认档案失败:', error)
        this.$message.error('创建默认档案失败')
        return null
      }
    },
    
    // 获取当前摄像头名称
    getCurrentCameraName() {
      // 实际项目中应该从摄像头数据中获取
      const cameraNames = {
        'camera_1': '摄像头01',
        'camera_2': '摄像头02',
        'camera_3': '摄像头03',
        'camera_4': '摄像头04',
        'camera_5': '摄像头05',
        'camera_6': '摄像头06'
      }
      return cameraNames[this.currentCameraId] || '摄像头'
    },
    
    // 获取当前时间
    getCurrentTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 获取当前用户昵称
    getCurrentUserName() {
      // 实际项目中应该从用户登录信息或Vuex store中获取
      // 这里模拟一些用户昵称
      const userNames = ['张工程师', '李主管', '王安全员', '赵技术员', '陈操作员']
      const savedUserName = localStorage.getItem('currentUserName')
      
      if (savedUserName) {
        return savedUserName
      } else {
        // 如果没有保存的用户名，随机选择一个并保存
        const randomName = userNames[Math.floor(Math.random() * userNames.length)]
        localStorage.setItem('currentUserName', randomName)
        return randomName
      }
    },
    
    // 全选/取消全选
    handleSelectAll() {
      if (this.selectedWarnings.length === this.filteredWarningList.length) {
        // 如果已经全选，则取消全选
        this.selectedWarnings = []
        this.$message.info('已取消全选')
      } else {
        // 全选所有筛选后的预警
        this.selectedWarnings = this.filteredWarningList.map(item => item.id)
        this.$message.success(`已选择 ${this.selectedWarnings.length} 项预警`)
      }
    },
    
    // 选择当前页
    handleSelectPage() {
      if (this.selectedWarnings.length === this.currentPageData.length) {
        // 如果当前页已全选，则取消选择
        this.selectedWarnings = this.selectedWarnings.filter(id => 
          !this.currentPageData.some(item => item.id === id)
        )
        this.$message.info('已取消选择本页')
      } else {
        // 选择当前页所有项，同时保留其他已选项
        const currentPageIds = this.currentPageData.map(item => item.id)
        const otherSelectedIds = this.selectedWarnings.filter(id => 
          !currentPageIds.includes(id)
        )
        
        this.selectedWarnings = [...otherSelectedIds, ...currentPageIds]
        this.$message.success(`已选择本页 ${currentPageIds.length} 项预警`)
      }
    },
    
    // 批量处理
    async handleBatchProcess() {
      if (this.selectedWarnings.length === 0) {
        this.$message.warning('请先选择预警项')
        return
      }
      
      // 弹出批量处理意见对话框
      this.batchProcessDialogVisible = true
    },
    
    // 确认批量处理
    async confirmBatchProcess() {
      if (!this.batchRemarkForm.remark.trim()) {
        this.$message.warning('请输入批量处理意见')
        return
      }
      
      try {
        this.loading = true
        
        // 模拟API调用处理时间
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 为所有选中项添加处理记录
        for (const id of this.selectedWarnings) {
          const index = this.warningList.findIndex(item => item.id === id)
          if (index !== -1) {
            // 添加处理记录到操作历史
            if (!this.warningList[index].operationHistory) {
              this.$set(this.warningList[index], 'operationHistory', [])
            }
            
            const newRecord = {
              id: Date.now() + Math.random(),
              status: 'completed',
              statusText: '批量处理记录',
              time: this.getCurrentTime(),
              description: `批量处理意见：${this.batchRemarkForm.remark}`,
              operationType: 'process',
              operator: this.getCurrentUserName()
            }
            
            this.warningList[index].operationHistory.unshift(newRecord)
            // 不再改变预警状态，保持预警可继续处理
          }
        }
        
        this.$message.success(`已为 ${this.selectedWarnings.length} 项预警添加处理记录，可继续添加多次处理记录`)
        this.selectedWarnings = []
        this.closeBatchProcessDialog()
      } catch (error) {
        console.error('批量处理失败:', error)
        this.$message.error('批量处理失败')
      } finally {
        this.loading = false
      }
    },
    
    // 关闭批量处理对话框
    closeBatchProcessDialog() {
      this.batchProcessDialogVisible = false
      this.batchRemarkForm = {
        remark: ''
      }
    },
    
    // 导出数据
    exportData() {
      this.exportDialogVisible = true
    },
    
    // 获取导出选择文本
    getExportSelectionText() {
      const count = this.selectedWarnings.length
      if (count > 0) {
        return `您已选择 ${count} 条记录进行导出`
      } else {
        return '您将导出当前筛选条件下的所有记录'
      }
    },
    
    // 确认导出
    confirmExport() {
      // 显示加载状态
      this.exportLoading = true
      
      // 获取要导出的数据
      const data = this.selectedWarnings.length > 0
        ? this.warningList.filter(item => this.selectedWarnings.includes(item.id))
        : this.filteredWarningList
      
      // 转换数据为导出格式
      const exportData = data.map(item => ({
        预警名称: item.deviceName,
        设备名称: item.deviceInfo.name,
        预警位置: item.deviceInfo.position,
        预警等级: item.level,
        预警时间: item.time,
        状态: item.status === 'pending' ? '待处理' : 
              item.status === 'processing' ? '处理中' : '已完成'
      }))
      
      try {
        // 直接导出为CSV
        this.exportToCSV(exportData)
        this.$message.success('CSV文件导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exportLoading = false
        this.exportDialogVisible = false
      }
    },
    
    // 导出为CSV
    exportToCSV(data) {
      // CSV 表头
      const headers = Object.keys(data[0])
      
      // 转换数据为CSV行
      const csvRows = [
        headers.join(','), // 表头行
        ...data.map(row => 
          headers.map(header => {
            // 处理包含逗号的字段，用引号包裹
            const field = String(row[header] || '')
            return field.includes(',') ? `"${field}"` : field
          }).join(',')
        )
      ]
      
      // 合并为CSV内容
      const csvContent = csvRows.join('\n')
      
      // 创建Blob
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const fileName = `预警数据_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`
      this.downloadFile(blob, fileName)
    },
    
    // 下载文件通用方法
    downloadFile(blob, fileName) {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      
      // 模拟点击下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      }, 100)
    },
    
    // 选择预警项
    toggleSelect(id) {
      const index = this.selectedWarnings.indexOf(id)
      if (index === -1) {
        this.selectedWarnings.push(id)
      } else {
        this.selectedWarnings.splice(index, 1)
      }
    },
    
    // 获取背景颜色类名
    getLevelClass(level) {
      if (level === '一级预警') return 'level-1-bg'
      if (level === '二级预警') return 'level-2-bg'
      if (level === '三级预警') return 'level-3-bg'
      return ''
    },
    
    // 获取边框颜色类名
    getBorderClass(level) {
      if (level === '一级预警') return 'level-1-border'
      if (level === '二级预警') return 'level-2-border'
      if (level === '三级预警') return 'level-3-border'
      return ''
    },
    
    // 获取文字颜色类名
    getLevelTextClass(level) {
      if (level === '一级预警') return 'level-1-text'
      if (level === '二级预警') return 'level-2-text'
      if (level === '三级预警') return 'level-3-text'
      return ''
    },
    
    // 保存备注
    async saveRemark() {
      if (!this.remarkForm.remark.trim()) {
        this.$message.warning('请输入处理意见')
        return
      }
      
      try {
        this.loading = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 更新本地数据状态 - 添加新的处理记录
        const index = this.warningList.findIndex(item => item.id === this.currentWarningId)
        if (index !== -1) {
          // 确保有操作历史数组
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', [])
          }
          
          // 添加新的处理中记录
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '处理中',
            time: this.getCurrentTime(),
            description: `处理意见：${this.remarkForm.remark}`,
            operationType: 'processing',
            operator: this.getCurrentUserName()
          }
          
          this.warningList[index].operationHistory.unshift(newRecord)
        }
        
        this.$message.success('处理记录已添加')
        this.closeRemarkDialog()
      } catch (error) {
        console.error('处理失败:', error)
        this.$message.error('处理失败')
      } finally {
        this.loading = false
      }
    },
    
    // 关闭备注对话框
    closeRemarkDialog() {
      this.remarkDialogVisible = false
      this.currentWarningId = ''
      this.remarkForm = {
        remark: ''
      }
    },
    
    // 确认上报
    async confirmReport() {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 获取当前预警
        const index = this.warningList.findIndex(item => item.id === this.reportWarningId)
        if (index !== -1) {
          // 添加上报记录到操作历史
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', [])
          }
          
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '预警上报',
            time: this.getCurrentTime(),
            description: '预警已上报给上级部门处理，等待上级部门响应',
            operationType: 'report',
            operator: this.getCurrentUserName()
          }
          
          this.warningList[index].operationHistory.unshift(newRecord)
        }
        
        this.$message.success('预警已成功上报')
        this.closeReportDialog()
        // 不改变预警状态，保持预警可继续处理
      } catch (error) {
        console.error('上报失败:', error)
        this.$message.error('上报失败')
      } finally {
        this.loading = false
      }
    },
    
    // 关闭上报对话框
    closeReportDialog() {
      this.reportDialogVisible = false
      this.reportWarningId = ''
    },
    
    // 关闭归档对话框
    closeArchiveDialog() {
      this.archiveDialogVisible = false
      this.archiveWarningId = ''
      this.selectedArchiveId = ''
    },
    
    // 显示预警详情
    showWarningDetail(item) {
      this.currentWarningDetail = item
      this.warningDetailVisible = true
    },
    
    // 处理预警详情对话框中的事件
    handleWarningFromDetail(warning) {
      if (warning && warning.id) {
        this.handleWarning(warning.id, 'markProcessed')
      }
    },
    
    // 处理预警详情对话框中的上报事件
    handleReportFromDetail(warning) {
      if (warning && warning.id) {
        this.handleWarning(warning.id, 'report')
      }
    },
    
    // 处理预警详情对话框中的归档事件
    handleArchiveFromDetail(warning) {
      if (warning && warning.id) {
        this.handleWarning(warning.id, 'archive')
      }
    },
    
    // 处理预警详情对话框中的误报事件
    handleFalseAlarmFromDetail(warning) {
      if (warning && warning.id) {
        this.handleWarning(warning.id, 'falseAlarm')
      }
    },
    
    // 获取预警类型文本
    getWarningTypeText(type) {
      const typeMap = {
        '未戴安全帽': '安全防护违规',
        '未穿工作服': '安全防护违规',
        '闲杂人员': '人员管理违规',
        '违规吸烟': '消防安全违规',
        '高空作业未系安全带': '高空作业违规',
        '未穿反光背心': '安全防护违规',
        '安全帽识别': '安全防护违规',
        '工服识别': '安全防护违规',
        '烟火检测': '消防安全违规'
      };
      return typeMap[type] || '其他安全违规';
    },
    
    // 获取预警等级标签文本
    getLevelBadgeText(level) {
      const levelMap = {
        '一级预警': '一级',
        '二级预警': '二级',
        '三级预警': '三级'
      }
      return levelMap[level] || '未知'
    },
    
    // 处理误报事件
    async handleFalseAlarmArchive() {
      try {
        let targetArchiveId = null
        let archiveName = ''
        
        // 查找或创建默认档案
        const existingDefaultArchive = this.availableArchives.find(archive => archive.isDefault)
        if (existingDefaultArchive) {
          targetArchiveId = existingDefaultArchive.id
          archiveName = existingDefaultArchive.name
        } else {
          // 如果没有默认档案，自动创建
          targetArchiveId = await this.createDefaultArchive()
          archiveName = '默认档案'
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案')
          return
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 获取当前预警并添加误报记录到操作历史
        const index = this.warningList.findIndex(item => item.id === this.archiveWarningId)
        if (index !== -1) {
          // 添加误报记录到操作历史
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', [])
          }
          
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '误报处理',
            time: this.getCurrentTime(),
            description: `预警被标记为误报并自动归档到：${archiveName}`,
            operationType: 'falseAlarm',
            operator: this.getCurrentUserName(),
            archiveInfo: {
              archiveId: targetArchiveId,
              archiveName: archiveName
            }
          }
          
          this.warningList[index].operationHistory.unshift(newRecord)
          
          // 更新本地数据
          this.warningList[index].status = 'archived'
          this.warningList[index].archiveId = targetArchiveId
          this.warningList[index].archiveTime = new Date().toLocaleString()
          this.warningList[index].isFalseAlarm = true // 标记为误报
        }
        
        // 如果在选中列表中，也移除
        const selectedIndex = this.selectedWarnings.indexOf(this.archiveWarningId)
        if (selectedIndex !== -1) {
          this.selectedWarnings.splice(selectedIndex, 1)
        }
        
        this.$message.success('误报已自动归档到默认档案')
        this.archiveWarningId = ''
      } catch (error) {
        console.error('误报归档失败:', error)
        this.$message.error('误报归档失败')
      } finally {
        this.loading = false
      }
    },
    
    // 选择位置
    selectLocation(locationId) {
      // 如果点击的是当前已选中的位置，则不做任何操作
      if (this.selectedLocationId === locationId) {
        return
      }
      
      this.selectedLocationId = locationId
      
      // 更新位置列表的选中状态
      this.locationList.forEach(location => {
        location.selected = location.id === locationId
      })
      
      // 清空选中项
      this.selectedWarnings = []
      
      // 提示当前查看的位置
      const selectedLocation = this.locationList.find(location => location.id === locationId)
      if (selectedLocation) {
        if (locationId === 'all') {
          this.$message.success(`正在查看所有位置的预警信息`)
        } else {
          this.$message.success(`正在查看"${selectedLocation.name}"的预警信息`)
        }
      }
    },
    
    // 获取预警图标
    getWarningIcon(level) {
      const iconMap = {
        '一级预警': 'el-icon-warning',
        '二级预警': 'el-icon-warning-outline',
        '三级预警': 'el-icon-warning-outline',
        '四级预警': 'el-icon-warning-outline'
      };
      return iconMap[level] || 'el-icon-warning';
    },
    
    // 开始处理预警 - 与预警详情对话框保持一致
    startProcessingWarning(warning) {
      // 初始化操作历史（如果没有）
      this.initOperationHistory(warning)
      
      // 更新待处理记录为已完成状态
      if (warning.operationHistory) {
        warning.operationHistory = warning.operationHistory.map(record => {
          if (record.operationType === 'pending' && record.status === 'active') {
            return {
              ...record,
              status: 'completed',
              description: '预警已确认，开始处理'
            }
          }
          return record
        })
      }
      
      // 弹出处理意见对话框
      this.currentWarningId = warning.id
      this.remarkDialogVisible = true
    },
    
    // 初始化操作历史 - 与预警详情对话框保持一致
    initOperationHistory(warning) {
      if (!warning) return
      
      // 如果预警有保存的操作历史，则直接返回
      if (warning.operationHistory && Array.isArray(warning.operationHistory) && warning.operationHistory.length > 0) {
        return
      }
      
      // 如果没有操作历史，则创建默认的初始记录
      const operationHistory = []
      
      // 添加预警产生记录（始终存在的初始记录）
      operationHistory.push({
        id: Date.now() + Math.random(),
        status: 'completed',
        statusText: '预警产生',
        time: warning.time || this.getCurrentTime(),
        description: `${warning.type || '系统检测'}：${warning.description || '检测到异常情况，请及时处理'}`,
        operationType: 'create',
        operator: '系统'
      })
      
      // 添加待处理记录（始终显示）
      operationHistory.push({
        id: Date.now() + Math.random() + 1,
        status: 'active',
        statusText: '待处理',
        time: warning.createTime || this.getCurrentTime(),
        description: '预警已产生，等待处理人员确认并开始处理',
        operationType: 'pending',
        operator: ''
      })
      
      // 设置操作历史
      this.$set(warning, 'operationHistory', operationHistory)
    },
    
    // 结束处理 - 与预警详情对话框保持一致
    async finishProcessing() {
      try {
        this.loading = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 更新本地数据状态
        const index = this.warningList.findIndex(item => item.id === this.currentWarningId)
        if (index !== -1) {
          // 确保有操作历史数组
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', [])
          }
          
          // 添加新的已处理记录
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '已处理',
            time: this.getCurrentTime(),
            description: '预警处理已完成，可以进行后续操作',
            operationType: 'completed',
            operator: this.getCurrentUserName()
          }
          
          this.warningList[index].operationHistory.unshift(newRecord)
        }
        
        this.$message.success('处理已完成，现在可以进行归档等操作')
        this.closeRemarkDialog()
      } catch (error) {
        console.error('结束处理失败:', error)
        this.$message.error('结束处理失败')
      } finally {
        this.loading = false
      }
    },
    
    // 检查处理按钮是否应该禁用
    isProcessingDisabled(warning) {
      if (!warning.operationHistory || warning.operationHistory.length === 0) {
        return false // 没有历史记录，可以处理
      }
      
      // 如果已归档，禁用处理按钮
      const hasArchived = warning.operationHistory.some(record => 
        record.operationType === 'archive' || record.operationType === 'falseAlarm'
      ) || warning.status === 'archived'
      
      if (hasArchived) {
        return true
      }
      
      // 如果已完成处理，禁用处理按钮
      const hasCompletedProcessing = warning.operationHistory.some(record => 
        record.operationType === 'completed'
      )
      
      return hasCompletedProcessing
    },
    
    // 获取当前预警状态
    getCurrentWarningStatus(warning) {
      if (!warning.operationHistory || warning.operationHistory.length === 0) {
        return {
          text: '待处理',
          class: 'status-pending'
        }
      }
      
      // 检查是否已归档
      const hasArchived = warning.operationHistory.some(record => 
        record.operationType === 'archive' || record.operationType === 'falseAlarm'
      ) || warning.status === 'archived'
      
      if (hasArchived) {
        return {
          text: '已归档',
          class: 'status-archived'
        }
      }
      
      // 检查是否有已处理状态
      const hasCompletedProcessing = warning.operationHistory.some(record => 
        record.operationType === 'completed'
      )
      
      if (hasCompletedProcessing) {
        return {
          text: '已处理',
          class: 'status-completed'
        }
      }
      
      // 检查是否有处理中状态
      const hasActiveProcessing = warning.operationHistory.some(record => 
        record.operationType === 'processing'
      )
      
      if (hasActiveProcessing) {
        return {
          text: '处理中',
          class: 'status-processing'
        }
      }
      
      // 检查是否已经确认开始处理（待处理状态完成）
      const hasPendingCompleted = warning.operationHistory.some(record => 
        record.operationType === 'pending' && record.status === 'completed'
      )
      
      if (hasPendingCompleted) {
        return {
          text: '处理中',
          class: 'status-processing'
        }
      }
      
      // 默认为待处理
      return {
        text: '待处理',
        class: 'status-pending'
      }
    },
    
    // 格式化时间
    formatTime(timeString) {
      try {
        // 如果是完整的时间字符串，格式化为更友好的显示
        if (timeString.includes(' ')) {
          const [date, time] = timeString.split(' ');
          const [year, month, day] = date.split('-');
          return `${year}年${month}月${day}日 ${time}`;
        }
        return timeString;
      } catch (error) {
        return timeString;
      }
    },
    
    // 显示删除确认对话框
    showDeleteDialog() {
      if (this.selectedWarnings.length === 0) {
        this.$message.warning('请先选择要删除的预警项')
        return
      }
      this.deleteDialogVisible = true
    },
    
    // 确认删除选中的预警
    async confirmDelete() {
      if (this.selectedWarnings.length === 0) {
        this.$message.warning('请先选择要删除的预警项')
        return
      }
      
      try {
        this.deleteLoading = true
        
        // 模拟API调用删除时间
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 从预警列表中移除选中的项
        this.warningList = this.warningList.filter(item => 
          !this.selectedWarnings.includes(item.id)
        )
        
        this.$message.success(`已成功删除 ${this.selectedWarnings.length} 项预警`)
        
        // 清空选择
        this.selectedWarnings = []
        this.closeDeleteDialog()
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败，请稍后重试')
      } finally {
        this.deleteLoading = false
      }
    },
    
    // 关闭删除对话框
    closeDeleteDialog() {
      this.deleteDialogVisible = false
      this.deleteLoading = false
    },
    
    // 跳转到复判记录页面
    goToReviewRecords() {
      try {
        // 使用正确的路由名称跳转
        this.$router.push({
          name: 'reviewRecords'
        }).catch((error) => {
          console.error('路由跳转失败:', error)
          this.$message.error('页面跳转失败，请稍后重试')
        })
      } catch (error) {
        console.error('路由跳转失败:', error)
        this.$message.error('页面跳转失败，请稍后重试')
      }
    }
  }
}
</script>

<template>
  <div class="warning-management-container" v-loading="loading">
    <!-- 左侧位置区域 -->
    <div class="location-sidebar">
      <div class="location-header">
        <h3>位置区域</h3>
      </div>
      
      <div class="location-list">
        <div 
          v-for="location in locationListWithCount" 
          :key="location.id"
          class="location-item"
          :class="{ active: selectedLocationId === location.id }"
          @click="selectLocation(location.id)"
        >
          <div class="location-content">
            <div class="location-name">{{ location.name }}</div>
            <div class="location-count">{{ location.count }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-area">
      <!-- 搜索和筛选区域 -->
      <div class="search-filter-area">
        <div class="search-row">
          <div class="date-picker-wrapper">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              value-format="yyyy-MM-dd"
              @change="handleSearch"
            />
          </div>
          

          
          <div class="select-wrapper">
            <el-select 
              v-model="searchForm.warningLevel" 
              placeholder="预警等级" 
              size="small"
              clearable
              @change="handleSearch"
            >
              <el-option label="一级预警" value="level1" />
              <el-option label="二级预警" value="level2" />
              <el-option label="三级预警" value="level3" />
              <el-option label="四级预警" value="level4" />
            </el-select>
          </div>
          
          <div class="select-wrapper">
            <el-select 
              v-model="searchForm.warningType" 
              placeholder="预警类型" 
              size="small"
              clearable
              @change="handleSearch"
            >
              <el-option label="安全帽违规" value="safety_helmet" />
              <el-option label="安全带违规" value="safety_belt" />
              <el-option label="防护服违规" value="protective_clothing" />
              <el-option label="无关人员" value="unauthorized_personnel" />
              <el-option label="吸烟违规" value="smoking" />
              <el-option label="高空作业违规" value="high_altitude" />
            </el-select>
          </div>
          
          <div class="select-wrapper">
            <el-select 
              v-model="searchForm.warningSkill" 
              placeholder="预警技能" 
              size="small"
              clearable
              @change="handleSearch"
            >
              <el-option 
                v-for="skill in warningSkillOptions"
                :key="skill.value"
                :label="skill.label" 
                :value="skill.value" 
              />
            </el-select>
          </div>
          
          <div class="input-wrapper">
            <el-input
              v-model="searchForm.warningName"
              placeholder="预警名称"
              size="small"
              clearable
              @change="handleSearch"
              @clear="handleSearch"
            />
          </div>
          
          <div class="input-wrapper">
            <el-input
              v-model="searchForm.warningId"
              placeholder="预警ID"
              size="small"
              clearable
              @change="handleSearch"
              @clear="handleSearch"
            />
          </div>
          
          <div class="reset-button">
            <el-button 
              size="small" 
              icon="el-icon-refresh-right"
              @click="resetSearch"
            >重置</el-button>
          </div>
        </div>
        
        <div class="filter-actions">
          <div class="filter-buttons">
            <el-button 
              size="small" 
              @click="handleSelectAll"
            >全选</el-button>
            <el-button 
              size="small" 
              @click="handleSelectPage"
            >选择本页</el-button>
            <el-button 
              size="small" 
              type="warning"
              :disabled="selectedWarnings.length === 0"
              @click="handleBatchProcess"
            >批量处理</el-button>
            <el-button 
              size="small" 
              type="danger"
              icon="el-icon-delete"
              :disabled="selectedWarnings.length === 0"
              @click="showDeleteDialog"
            >删除</el-button>
          </div>
          
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-download"
              @click="exportData"
            >导出数据</el-button>
            <el-button 
              type="info" 
              size="small" 
              icon="el-icon-document-copy"
              @click="goToReviewRecords"
            >复判记录</el-button>
            <el-button 
              size="small" 
              icon="el-icon-refresh"
              @click="getWarningList"
            >刷新</el-button>
          </div>
        </div>
      </div>
      
      <!-- 预警卡片列表 -->
      <div class="warning-cards-container">
        <div class="warning-cards-grid">
          <div 
            v-for="item in filteredWarningList" 
            :key="item.id" 
            class="warning-col"
          >
            <div 
              class="warning-card" 
              :class="[
                getBorderClass(item.level), 
                { 'selected': selectedWarnings.includes(item.id) }
              ]"
              @click="showWarningDetail(item)"
            >
              <!-- 等级和状态标签容器 -->
              <div class="warning-badges-container">
                <div class="warning-level-badge" :class="getLevelClass(item.level)">
                  <span class="level-badge-text">{{ getLevelBadgeText(item.level) }}</span>
                </div>
                
                <!-- 预警状态标签，与等级标签挨在一起显示 -->
                <div class="warning-status-badge" :class="getCurrentWarningStatus(item).class">
                  {{ getCurrentWarningStatus(item).text }}
                </div>
              </div>
            
              <!-- 右上角选择框 -->
              <div class="select-checkbox" @click.stop="toggleSelect(item.id)">
                <el-checkbox 
                  :value="selectedWarnings.includes(item.id)"
                  @change="toggleSelect(item.id)"
                  size="mini"
                >
                </el-checkbox>
              </div>
              
              <div class="warning-image">
                <div v-if="item.imageUrl" class="warning-real-image">
                  <img :src="item.imageUrl" :alt="item.type" />
                </div>
                <div v-else class="warning-video-preview">
                  <i :class="getWarningIcon(item.level)"></i>
                  <span>预警监控画面</span>
                </div>
              </div>
              
              <div class="warning-content">
                <h3 class="warning-title">{{ item.deviceName }}</h3>
                
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">设备名称：</span>
                    <span class="value">{{ item.device || item.deviceInfo.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">违规位置：</span>
                    <span class="value">{{ item.location || item.deviceInfo.position || '未知位置' }}</span>
                  </div>

                  <div class="info-item time-item">
                    <span class="time">{{ formatTime(item.time) }}</span>
                  </div>
                </div>
                
                <div class="warning-footer">
                  <!-- 处理按钮始终可用，允许多次处理 -->
                  <div class="item-actions">
                    <!-- 按钮排列顺序与预警详情对话框保持一致：上报、归档、误报、处理 -->
                    <el-button 
                      size="mini" 
                      class="action-btn report-btn"
                      @click.stop="handleWarning(item.id, 'report')"
                      :disabled="isProcessingDisabled(item)"
                    >
                      上报
                    </el-button>
                    
                    <el-button 
                      size="mini" 
                      class="action-btn archive-btn"
                      @click.stop="handleWarning(item.id, 'archive')"
                      :disabled="!isProcessingDisabled(item)"
                    >
                      归档
                    </el-button>
                    
                    <el-button 
                      size="mini" 
                      class="action-btn false-alarm-btn"
                      @click.stop="handleWarning(item.id, 'falseAlarm')"
                    >
                      误报
                    </el-button>
                    
                    <el-button 
                      size="mini" 
                      type="success" 
                      plain
                      class="action-btn"
                      @click.stop="handleWarning(item.id, 'markProcessed')"
                      :disabled="isProcessingDisabled(item)"
                    >
                      {{ isProcessingDisabled(item) ? '已完成' : '处理' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 没有数据时的提示 -->
        <div class="no-data" v-if="filteredWarningList.length === 0">
          <i class="el-icon-folder-opened"></i>
          <p v-if="selectedLocationId === 'all'">暂无预警数据</p>
          <p v-else>该位置暂无预警数据</p>
          <span class="no-data-tip">可尝试切换其他位置或调整筛选条件</span>
        </div>
      </div>
    </div>
    
    <!-- 导出数据对话框 -->
    <el-dialog
      title="导出数据"
      :visible.sync="exportDialogVisible"
      width="25%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="export-dialog-content">
        <p class="export-tip">确认要导出CSV格式的预警数据吗？</p>
        <p class="export-selection-info">
          {{ getExportSelectionText() }}
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false" :disabled="exportLoading">取 消</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exportLoading">确认导出</el-button>
      </span>
    </el-dialog>
    
    <!-- 添加备注对话框 -->
    <el-dialog
      title="处理预警"
      :visible.sync="remarkDialogVisible"
      width="30%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="remarkForm" label-width="80px">
        <el-form-item label="处理意见" required>
          <el-input
            v-model="remarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见，描述具体的处理措施和结果"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="process-tip">
        <i class="el-icon-info" style="color: #909399; margin-right: 4px;"></i>
        <span style="color: #909399; font-size: 13px;">填写处理意见后，可点击"确认处理"添加处理记录，或点击"结束处理"完成整个处理流程</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRemark">确认处理</el-button>
        <el-button type="success" @click="finishProcessing">结束处理</el-button>
      </span>
    </el-dialog>
    
    <!-- 上报确认对话框 -->
    <el-dialog
      title="上报确认"
      :visible.sync="reportDialogVisible"
      width="400px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="confirm-content">
        <p>确定要上报此预警吗？</p>
        <p style="color: #909399; font-size: 12px;">上报后预警将提交给上级部门处理</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeReportDialog">取 消</el-button>
        <el-button type="warning" @click="confirmReport">确定上报</el-button>
      </span>
    </el-dialog>
    
    <!-- 归档确认对话框 -->
    <el-dialog
      title="归档预警"
      :visible.sync="archiveDialogVisible"
      width="40%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="archive-dialog-content">
        <div class="archive-info">
          <i class="el-icon-folder" style="color: #E6A23C; font-size: 24px; margin-right: 8px;"></i>
          <span>请选择要归档到的档案：</span>
        </div>
        
        <div class="archive-selection">
          <el-form label-width="80px">
            <el-form-item label="选择档案">
              <el-select 
                v-model="selectedArchiveId" 
                placeholder="请选择档案"
                style="width: 100%"
                :disabled="availableArchives.length === 0"
              >
                <el-option
                  v-for="archive in availableArchives"
                  :key="archive.id"
                  :label="archive.name + (archive.isDefault ? ' (默认)' : '')"
                  :value="archive.id"
                >
                  <span style="float: left">{{ archive.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ archive.isDefault ? '默认档案' : '自定义档案' }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item v-if="availableArchives.length === 0">
              <el-alert
                title="当前摄像头位置没有可用档案"
                description="系统将自动创建默认档案进行归档"
                type="info"
                :closable="false"
                show-icon
              />
            </el-form-item>
            

          </el-form>
        </div>
        
        <div class="archive-tip">
          <el-alert
            title="归档说明"
            description="归档后，预警将从实时预警页面和预警管理页面移除，仅可在预警档案中查看。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeArchiveDialog">取 消</el-button>
        <el-button type="danger" @click="confirmArchive">确认归档</el-button>
      </span>
    </el-dialog>
    
    <!-- 批量处理对话框 -->
    <el-dialog
      title="批量处理预警"
      :visible.sync="batchProcessDialogVisible"
      width="35%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="batch-process-info">
        <i class="el-icon-warning-outline" style="color: #E6A23C; font-size: 24px; margin-right: 8px;"></i>
        <span style="font-size: 16px; font-weight: 500;">您将要批量处理 {{ selectedWarnings.length }} 项预警</span>
      </div>
      
      <el-form :model="batchRemarkForm" label-width="80px" style="margin-top: 20px;">
        <el-form-item label="处理意见" required>
          <el-input
            v-model="batchRemarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入批量处理意见，此意见将应用到所有选中的预警"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <div class="batch-process-tip">
        <i class="el-icon-info" style="color: #909399; margin-right: 4px;"></i>
        <span style="color: #909399; font-size: 13px;">批量处理完成后，将为所有选中的预警添加统一的处理记录，可继续多次处理</span>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeBatchProcessDialog">取 消</el-button>
        <el-button type="primary" @click="confirmBatchProcess">确认批量处理</el-button>
      </span>
    </el-dialog>
    
    <!-- 预警详情对话框 -->
    <WarningDetail
      :visible.sync="warningDetailVisible"
      :warning="currentWarningDetail"
      source="warningManagement"
      @handle-warning="handleWarningFromDetail"
      @handle-report="handleReportFromDetail"
      @handle-archive="handleArchiveFromDetail"
      @handle-false-alarm="handleFalseAlarmFromDetail"
    />
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="删除预警"
      :visible.sync="deleteDialogVisible"
      width="400px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="delete-dialog-content">
        <div class="delete-warning-icon">
          <i class="el-icon-warning-outline" style="color: #f56c6c; font-size: 36px;"></i>
        </div>
        <div class="delete-text">
          <p class="delete-title">确定要删除选中的预警吗？</p>
          <p class="delete-desc">您已选择 <strong>{{ selectedWarnings.length }}</strong> 项预警，删除后将无法恢复</p>
          <div class="delete-tip">
            <i class="el-icon-info" style="color: #e6a23c; margin-right: 4px;"></i>
            <span style="color: #e6a23c; font-size: 13px;">此操作不可逆，请谨慎操作</span>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDeleteDialog" :disabled="deleteLoading">取 消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleteLoading">确认删除</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>
.warning-management-container {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 0;
}

/* 左侧位置区域样式 */
.location-sidebar {
  width: 200px;
  background: #fff;
  border-radius: 8px;
  margin: 16px 0 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.location-header {
  padding: 20px 16px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.location-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-align: left;
  position: relative;
  padding-left: 12px;
}

.location-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
  border-radius: 2px;
}

.location-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px;
}

.location-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 6px;
  position: relative;
  background: #fff;
}

.location-item:last-child {
  margin-bottom: 0;
}

.location-item:hover {
  background-color: #f5f7fa;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.location-item.active {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: translateX(4px);
}

.location-content {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  transition: color 0.3s ease;
}

.location-item.active .location-name {
  color: #fff;
  font-weight: 600;
}

.location-count {
  background: #f0f2f5;
  color: #606266;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.location-item:hover .location-count {
  background: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.location-item.active .location-count {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* 右侧内容区样式 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 16px 8px;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 搜索和筛选区域 */
.search-filter-area {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.search-row {
  display: flex;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.date-picker-wrapper,
.select-wrapper,
.input-wrapper {
  margin-right: 12px;
  margin-bottom: 8px;
}

.date-picker-wrapper {
  width: 340px;
}

.select-wrapper {
  width: 140px;
}

.input-wrapper {
  width: 140px;
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
}

.filter-buttons .el-button {
  margin-right: 8px;
  margin-bottom: 8px;
  border-color: #dcdfe6;
}

.filter-buttons .el-button.active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin-left: 8px;
  margin-bottom: 8px;
}

/* 预警卡片样式 */
.warning-cards-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1px 1px 0 1px;
}

.warning-cards-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 16px;
  margin: 0;
}

.warning-col {
  width: calc(20% - 12.8px);
  margin: 0;
}

.warning-card {
  height: 360px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 0;
  position: relative;
  transition: all 0.25s;
  border-top: 3px solid transparent;
  width: 100%;
}

.warning-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 等级和状态标签容器 */
.warning-badges-container {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.warning-level-badge {
  padding: 3px 8px;
  font-size: 12px;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  /* 移除之前的复杂样式，使用简洁的设计 */
}

/* 等级标签背景颜色 - 与实时监控页面保持一致 */
.warning-level-badge.level-1-bg {
  background-color: #f56c6c;
}

.warning-level-badge.level-2-bg {
  background-color: #e6a23c;
}

.warning-level-badge.level-3-bg {
  background-color: #409EFF;
}

.warning-level-badge.level-4-bg {
  background-color: #67c23a;
}

.warning-image {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.warning-real-image,
.warning-video-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  position: relative;
}

.warning-real-image {
  padding: 0;
  overflow: hidden;
}

.warning-real-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
  transition: transform 0.3s ease;
}

.warning-real-image:hover img {
  transform: scale(1.05);
}

.warning-video-preview i {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.warning-video-preview span {
  font-size: 13px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 根据预警等级设置不同的图标颜色和动画效果 */
.warning-card.level-1-border .warning-video-preview i {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.warning-card.level-2-border .warning-video-preview i {
  color: #e6a23c;
}

.warning-card.level-3-border .warning-video-preview i {
  color: #409EFF;
}

.warning-content {
  padding: 14px;
}

.warning-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.info-list {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.info-item .label {
  color: #909399;
  flex-shrink: 0;
}

.info-item .value {
  color: #606266;
}



.warning-level {
  font-weight: 500;
}

.time-item {
  margin-top: 8px;
}

.time-item .time {
  font-size: 12px;
  color: #909399;
}

.warning-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.warning-footer .el-button {
  margin: 0;
  padding: 3px 8px;
  font-size: 11px;
  min-width: auto;
}

.report-btn {
  color: #e6a23c;
  border-color: #e6a23c;
}

.complete-btn {
  color: #67c23a;
  border-color: #67c23a;
}

.remark-btn {
  color: #409eff;
  border-color: #409eff;
}

.false-alarm-btn {
  color: #e6a23c;
  border-color: #e6a23c;
}

.archive-btn {
  color: #f56c6c;
  border-color: #f56c6c;
}

.status-text {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-text.processed {
  color: #67c23a;
  background-color: #f0f9ff;
  border: 1px solid #67c23a;
}

/* 等级样式 */
.level-1-border {
  border-top-color: #f56c6c;
}

.level-2-border {
  border-top-color: #e6a23c;
}

.level-3-border {
  border-top-color: #409eff;
}

.level-1-bg {
  background-color: #fff0f0;
}

.level-2-bg {
  background-color: #fffbf0;
}

.level-3-bg {
  background-color: #ecf5ff;
}

.level-1-text {
  color: #f56c6c;
}

.level-2-text {
  color: #e6a23c;
}

.level-3-text {
  color: #409eff;
}

/* 导出对话框样式 */
.export-dialog-content {
  padding: 10px 20px;
}

.export-tip {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.export-selection-info {
  margin-top: 15px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #909399;
}

/* 响应式调整 */
@media (max-width: 1280px) {
  .warning-management-container {
    flex-direction: column;
  }
  
  .warning-col {
    width: calc(25% - 12px);
  }
  
  .location-sidebar {
    width: 100%;
    height: auto;
    margin: 0 0 16px 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .location-header {
    padding: 16px 20px 12px;
    background: #f8f9fa;
    text-align: center;
  }
  
  .location-header h3 {
    font-size: 15px;
    font-weight: 600;
  }
  
  .location-list {
    display: flex;
    overflow-x: auto;
    padding: 12px 16px;
    gap: 8px;
  }
  
  .location-item {
    margin-bottom: 0;
    border-radius: 20px;
    white-space: nowrap;
    min-width: auto;
    flex-shrink: 0;
    transform: none;
  }
  
  .location-item:hover {
    transform: translateY(-2px);
  }
  
  .location-item.active {
    background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }
  
  .location-content {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .location-name {
    font-size: 13px;
    font-weight: 500;
  }
  
  .location-count {
    margin-left: 0;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 8px;
  }
  
  .date-picker-wrapper {
    width: 100%;
    margin-right: 0;
  }
  
  .select-wrapper,
  .input-wrapper {
    width: calc(33.33% - 8px);
    min-width: 120px;
  }
  
  .filter-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    margin-bottom: 8px;
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .select-wrapper,
  .input-wrapper {
    width: 100%;
    margin-right: 0;
  }
  
  .warning-col {
    width: calc(50% - 8px);
  }
  
  .warning-management-container {
    height: auto;
    min-height: calc(100vh - 60px);
  }
}

@media (max-width: 480px) {
  .warning-col {
    width: calc(50% - 8px);
  }
  
  .warning-cards-grid {
    gap: 12px;
  }
}

/* 添加重置按钮样式 */
.reset-button {
  margin-left: 8px;
}

/* 添加卡片选中样式 */
.warning-card.selected {
  box-shadow: 0 0 0 2px #409eff, 0 4px 12px rgba(0, 0, 0, 0.1);
}

.select-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.select-checkbox:hover {
  background-color: rgba(255, 255, 255, 0.9);
  opacity: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.warning-card:hover .select-checkbox {
  opacity: 0.9;
  background-color: rgba(255, 255, 255, 0.7);
}

.warning-card.selected .select-checkbox {
  opacity: 1;
  background-color: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.select-checkbox .el-checkbox {
  transform: scale(0.9);
}

.select-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}

/* 没有数据时的提示样式 */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #909399;
  text-align: center;
}

.no-data i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #dcdfe6;
  opacity: 0.6;
}

.no-data p {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #606266;
  font-weight: 500;
}

.no-data-tip {
  font-size: 13px;
  color: #909399;
  opacity: 0.8;
}

/* 对话框内容样式 */
.dialog-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.confirm-content {
  text-align: center;
  padding: 20px 0;
}

.confirm-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.process-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  border-left: 3px solid #909399;
}

/* 归档对话框样式 */
.archive-dialog-content {
  padding: 10px 0;
}

.archive-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
}

.archive-selection {
  margin-bottom: 20px;
}

.archive-tip {
  margin-top: 10px;
}

.batch-process-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fef7e0;
  border: 1px solid #faecd8;
  border-radius: 6px;
  margin-bottom: 16px;
}

.batch-process-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  border-left: 3px solid #909399;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 底部按钮样式 - 与预警详情对话框保持一致 */
.action-btn {
  padding: 6px 16px;
  font-size: 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
  margin: 0 2px;
}



.report-btn {
  background-color: #e6a23c;
  border-color: #e6a23c;
  color: white;
}

.report-btn:hover {
  background-color: #eeb462;
  border-color: #eeb462;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

.archive-btn {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.archive-btn:hover {
  background-color: #f78989;
  border-color: #f78989;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.false-alarm-btn {
  background-color: #909399;
  border-color: #909399;
  color: white;
}

.false-alarm-btn:hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
}

/* 预警状态标签样式 - 与实时监控页面保持完全一致 */
.warning-status-badge {
  padding: 3px 8px;
  font-size: 12px;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 旧的状态样式已移除，使用带warning-status-badge前缀的新样式 */

/* 状态标签颜色 - 与实时监控页面保持一致 */
.warning-status-badge.status-pending {
  background-color: #909399;
}

.warning-status-badge.status-processing {
  background-color: #409EFF;
}

.warning-status-badge.status-completed {
  background-color: #67c23a;
}

.warning-status-badge.status-archived {
  background-color: #606266;
}

/* 删除对话框样式 */
.delete-dialog-content {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
}

.delete-warning-icon {
  margin-right: 16px;
  flex-shrink: 0;
}

.delete-text {
  flex: 1;
}

.delete-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px 0;
}

.delete-desc {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
}

.delete-tip {
  padding: 8px 12px;
  background-color: #fef7e0;
  border: 1px solid #faecd8;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
</style>
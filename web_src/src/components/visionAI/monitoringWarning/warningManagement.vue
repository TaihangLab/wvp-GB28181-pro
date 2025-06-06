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
        status: '',
        warningType: '',
        warningLevel: ''
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
          id: 'oil_gas_area',
          name: '油气监控区域',
          count: 0,
          selected: false
        },
        {
          id: 'work_area',
          name: '作业区域',
          count: 0,
          selected: false
        },
        {
          id: 'storage_area',
          name: '储罐区域',
          count: 0,
          selected: false
        },
        {
          id: 'pipeline_area',
          name: '管道区域',
          count: 0,
          selected: false
        },
        {
          id: 'pipeline_interface',
          name: '管道接口',
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
          deviceName: 'CH4 超上限预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 1.30,
          unit: '%LEL',
          level: '一级预警',
          time: '2022-12-20 17:02:58',
          status: 'pending',
          cameraId: 'camera_1',
          deviceInfo: {
            name: '可燃气体',
            position: '0.1 米'
          },
          remark: '',
          device: '可燃气体',
          type: 'CH4 超上限预警',
          location: '油气监控区域',
          locationId: 'oil_gas_area',
          description: '检测到CH4浓度超过安全阈值，当前浓度为1.30%LEL，存在爆炸危险，请立即处理'
        },
        {
          id: '2',
          deviceName: 'CO 浓度预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 75,
          unit: 'ppm',
          level: '二级预警',
          time: '2022-12-20 17:01:58',
          status: 'processing',
          cameraId: 'camera_1',
          deviceInfo: {
            name: '一氧化碳',
            position: '1.5 米'
          },
          remark: '',
          device: '一氧化碳检测器',
          type: 'CO 浓度预警',
          location: '作业区域',
          locationId: 'work_area',
          description: '检测到一氧化碳浓度超标，当前浓度为75ppm，可能对人员造成健康危害'
        },
        {
          id: '3',
          deviceName: 'H2S 浓度预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 10,
          unit: 'ppm',
          level: '三级预警',
          time: '2022-12-20 16:58:32',
          status: 'pending',
          cameraId: 'camera_2',
          deviceInfo: {
            name: '硫化氢',
            position: '2.0 米'
          },
          remark: '',
          device: '硫化氢检测器',
          type: 'H2S 浓度预警',
          location: '储罐区域',
          locationId: 'storage_area',
          description: '检测到硫化氢浓度异常，当前浓度为10ppm，请注意通风和人员防护'
        },
        {
          id: '4',
          deviceName: '火焰探测器预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 85,
          unit: '%',
          level: '一级预警',
          time: '2022-12-20 16:55:12',
          status: 'pending',
          cameraId: 'camera_1',
          deviceInfo: {
            name: '火焰探测器',
            position: '管道区域'
          },
          remark: '',
          device: '火焰探测器',
          type: '火焰探测器预警',
          location: '管道区域',
          locationId: 'pipeline_area',
          description: '火焰探测器检测到火焰信号，置信度85%，存在火灾风险，请立即确认并处理'
        },
        {
          id: '5',
          deviceName: '温度超限预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 85,
          unit: '°C',
          level: '二级预警',
          time: '2022-12-20 16:50:22',
          status: 'completed',
          cameraId: 'camera_2',
          deviceInfo: {
            name: '温度传感器',
            position: '储罐区'
          },
          remark: '已检查温度传感器，调整了冷却系统参数',
          device: '温度传感器',
          type: '温度超限预警',
          location: '储罐区域',
          locationId: 'storage_area',
          description: '温度传感器检测到温度超过安全限值，当前温度85°C，可能影响设备安全运行'
        },
        {
          id: '6',
          deviceName: '压力超限预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 2.5,
          unit: 'MPa',
          level: '一级预警',
          time: '2022-12-20 16:45:18',
          status: 'pending',
          cameraId: 'camera_3',
          deviceInfo: {
            name: '压力传感器',
            position: '管道接口'
          },
          remark: '',
          device: '压力传感器',
          type: '压力超限预警',
          location: '管道接口',
          locationId: 'pipeline_interface',
          description: '压力传感器检测到管道压力超过安全限值，当前压力2.5MPa，存在爆管风险'
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
      
      // 筛选类型
      filterType: 'all',
      
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
          name: '油气行业默认档案',
          cameraId: 'camera_1',
          cameraName: '可燃气体监控点',
          isDefault: true,
          createTime: '2022-12-01 10:00:00'
        },
        {
          id: 'archive_2', 
          name: '储罐区专项档案',
          cameraId: 'camera_2',
          cameraName: '储罐区监控点',
          isDefault: false,
          createTime: '2022-12-05 14:30:00'
        }
      ],
      selectedArchiveId: '',
      currentCameraId: 'camera_1',
      
      // 预警详情对话框
      warningDetailVisible: false,
      currentWarningDetail: null
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
      
      // 按状态过滤
      if (this.searchForm.status) {
        list = list.filter(item => item.status === this.searchForm.status)
      }
      
      // 按预警类型过滤 (根据设备名称包含的关键词进行筛选)
      if (this.searchForm.warningType) {
        switch(this.searchForm.warningType) {
          case 'overflow':
            list = list.filter(item => item.deviceName.includes('超上限') || item.deviceName.includes('超限'))
            break
          case 'concentration':
            list = list.filter(item => item.deviceName.includes('浓度'))
            break
          case 'temperature':
            list = list.filter(item => item.deviceName.includes('温度'))
            break
          case 'pressure':
            list = list.filter(item => item.deviceName.includes('压力'))
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
      
      // 如果是只看预警中事件（未处理的）
      if (this.filterType === 'pending') {
        return list.filter(item => item.status === 'pending')
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
        status: '',
        warningType: '',
        warningLevel: ''
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
        this.filterType = 'all'
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
            // 添加处理记录 - 弹出处理意见对话框
            this.currentWarningId = id
            this.remarkDialogVisible = true
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
        'camera_1': '可燃气体监控点',
        'camera_2': '储罐区监控点',
        'camera_3': '管道接口监控点'
      }
      return cameraNames[this.currentCameraId] || '监控点'
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
      this.filterType = 'all'
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
      this.filterType = 'page'
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
        
        // 更新筛选类型
        this.filterType = 'batch'
        
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
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 更新本地数据 - 只添加处理记录，不改变状态
        const index = this.warningList.findIndex(item => item.id === this.currentWarningId)
        if (index !== -1) {
          // 添加处理记录到操作历史（如果预警对象有operationHistory）
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', [])
          }
          
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '处理记录',
            time: this.getCurrentTime(),
            description: `处理意见：${this.remarkForm.remark}`,
            operationType: 'process',
            operator: this.getCurrentUserName()
          }
          
          this.warningList[index].operationHistory.unshift(newRecord)
          // 不再改变预警状态为completed，保持预警可继续处理
        }
        
        this.$message.success('处理记录已添加，可继续添加多次处理记录')
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
        '未戴安全帽': '安全违规',
        '未穿工作服': '安全违规',
        '闲杂人员': '人员违规',
        '吸烟': '消防违规',
        '安全帽识别': '安全违规',
        '工服识别': '安全违规',
        '玻璃运输车打卡': '车辆违规',
        '烟火检测': '消防违规',
        'CH4 超上限预警': '气体检测预警',
        'CO 浓度预警': '气体检测预警',
        'H2S 浓度预警': '气体检测预警',
        '火焰探测器预警': '消防预警',
        '温度超限预警': '环境监测预警',
        '压力超限预警': '设备监测预警'
      };
      return typeMap[type] || '其他预警';
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
      
      // 重置筛选状态
      this.filterType = 'all'
      
      // 提示当前查看的位置
      const selectedLocation = this.locationList.find(location => location.id === locationId)
      if (selectedLocation) {
        if (locationId === 'all') {
          this.$message.success(`正在查看所有位置的预警信息`)
        } else {
          this.$message.success(`正在查看"${selectedLocation.name}"的预警信息`)
        }
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
              v-model="searchForm.status" 
              placeholder="特处理" 
              size="small"
              clearable
              @change="handleSearch"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="已处理" value="completed" />
            </el-select>
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
              :class="{ active: filterType === 'all' && selectedWarnings.length > 0 }"
              @click="handleSelectAll"
            >全选</el-button>
            <el-button 
              size="small" 
              :class="{ active: filterType === 'page' && selectedWarnings.length > 0 }"
              @click="handleSelectPage"
            >选择本页</el-button>
            <el-button 
              size="small" 
              :class="{ active: filterType === 'batch' }"
              type="warning"
              :disabled="selectedWarnings.length === 0"
              @click="handleBatchProcess"
            >批量处理</el-button>
            <el-button 
              size="small" 
              :class="{ active: filterType === 'pending' }"
              @click="filterType = filterType === 'pending' ? 'all' : 'pending'; handleSearch()"
            >仅查看未处理事件</el-button>
          </div>
          
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-download"
              @click="exportData"
            >导出数据</el-button>
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
              <div class="warning-level-badge" :class="getLevelClass(item.level)">
                <span class="level-badge-text">{{ getLevelBadgeText(item.level) }}</span>
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
              
              <div class="warning-image" :class="getLevelClass(item.level)">
                <div class="warning-icon">
                  <i class="el-icon-warning-outline"></i>
                  <div class="icon-text">加载失败</div>
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
                  <div class="info-item">
                    <span class="label">处理备注：</span>
                    <div class="remark-content" v-if="item.remark">{{ item.remark }}</div>
                    <div class="remark-empty" v-else>未添加备注</div>
                  </div>
                  <div class="info-item time-item">
                    <span class="time">{{ item.time }}</span>
                  </div>
                </div>
                
                <div class="warning-footer">
                  <!-- 处理按钮始终可用，允许多次处理 -->
                  <el-button 
                    type="success" 
                    size="mini" 
                    plain
                    @click.stop="handleWarning(item.id, 'markProcessed')"
                  >处理</el-button>
                  
                  <el-button 
                    class="report-btn" 
                    size="mini" 
                    @click.stop="handleWarning(item.id, 'report')"
                  >上报</el-button>
                  
                  <el-button 
                    class="false-alarm-btn" 
                    size="mini" 
                    type="warning"
                    plain
                    @click.stop="handleWarning(item.id, 'falseAlarm')"
                  >误报</el-button>
                  
                  <el-button 
                    class="archive-btn" 
                    size="mini" 
                    type="danger"
                    plain
                    @click.stop="handleWarning(item.id, 'archive')"
                  >归档</el-button>
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
        <span style="color: #909399; font-size: 13px;">填写处理意见后，将在处理进展中添加一条处理记录，可多次添加处理记录</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeRemarkDialog">取 消</el-button>
        <el-button type="primary" @click="saveRemark">确认处理</el-button>
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
.select-wrapper {
  margin-right: 12px;
  margin-bottom: 8px;
}

.date-picker-wrapper {
  width: 340px;
}

.select-wrapper {
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

.warning-level-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  color: #fff;
  padding: 4px 10px 4px 8px;
  border-radius: 0 0 4px 0;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  min-width: 35px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 100%, 0 100%);
}

.warning-level-badge::after {
  content: '';
  position: absolute;
  top: 0;
  right: -4px;
  width: 0;
  height: 0;
  border-top: 10px solid;
  border-bottom: 10px solid;
  border-left: 4px solid;
  border-right: 0;
  border-top-color: inherit;
  border-bottom-color: inherit;
  border-left-color: inherit;
}

.warning-level-badge.level-1-bg {
  background: linear-gradient(135deg, #ff4757 0%, #e74c3c 100%);
}

.warning-level-badge.level-1-bg::after {
  border-top-color: #e74c3c;
  border-bottom-color: #e74c3c;
  border-left-color: #e74c3c;
}

.warning-level-badge.level-2-bg {
  background: linear-gradient(135deg, #ffa502 0%, #e67e22 100%);
}

.warning-level-badge.level-2-bg::after {
  border-top-color: #e67e22;
  border-bottom-color: #e67e22;
  border-left-color: #e67e22;
}

.warning-level-badge.level-3-bg {
  background: linear-gradient(135deg, #3742fa 0%, #2f3542 100%);
}

.warning-level-badge.level-3-bg::after {
  border-top-color: #2f3542;
  border-bottom-color: #2f3542;
  border-left-color: #2f3542;
}

.level-badge-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.warning-image {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.warning-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(0, 0, 0, 0.25);
}

.warning-icon i {
  font-size: 36px;
  margin-bottom: 8px;
}

.icon-text {
  font-size: 13px;
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

.remark-content {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
  padding: 6px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.remark-empty {
  color: #c0c4cc;
  font-size: 12px;
  font-style: italic;
  margin-top: 4px;
  padding: 6px 8px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px dashed #e4e7ed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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
  
  .select-wrapper {
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
  .select-wrapper {
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
</style>
<script>
import WarningDetail from './warningDetail.vue'

export default {
  name: "ReviewRecords",
  components: {
    WarningDetail
  },
  // 添加路由元信息，便于路由识别
  meta: {
    title: '智能复判记录',
    requiresAuth: true
  },
  data() {
    return {
      // 统计数据
      statistics: {
        reviewed: 302,
        total: 325,
        percentage: 92.92
      },
      
      // TOP3排行数据
      topData: [
        {
          id: 'bf21b82aa7...',
          name: 'bf21b82aa7...',
          count: 626,
          total: 6210,
          percentage: 99.94,
          color: '#409EFF'
        },
        {
          id: 'helmet_detection',
          name: '戴帽识别',
          count: 3972,
          total: 3972,
          percentage: 100.00,
          color: '#67C23A'
        },
        {
          id: 'person_crossing',
          name: '人员穿越线...',
          count: 164,
          total: 175,
          percentage: 93.71,
          color: '#E6A23C'
        }
      ],
      
      // 搜索条件
      searchForm: {
        startDate: '',
        endDate: '',
        reviewType: '',
        warningSkill: '',
        warningLocation: '',
        warningName: '',
        warningId: ''
      },
      
      // 实际执行的搜索条件（点击查询按钮后更新）
      activeSearchForm: {
        startDate: '',
        endDate: '',
        reviewType: '',
        warningSkill: '',
        warningLocation: '',
        warningName: '',
        warningId: ''
      },
      
             // 复判记录列表
       reviewList: [
         {
           id: '1',
           title: '人员越界',
           image: require('./images/5.jpg'),
           cameraName: '门禁1',
           location: '工地入口区域',
           startTime: '2025-06-06 19:51',
           duration: '2秒',
           reviewType: 'manual'
         },
         {
           id: '2',
           title: '未穿着反光衣',
           image: require('./images/3.jpg'),
           cameraName: '摄像头01',
           location: '工地东北角',
           startTime: '2025-06-06 14:58',
           duration: '2秒',
           reviewType: 'auto'
         },
         {
           id: '3',
           title: '未佩戴安全帽',
           image: require('./images/5.jpg'),
           cameraName: '摄像头01',
           location: '工地东北角',
           startTime: '2025-06-06 14:57',
           duration: '14秒',
           reviewType: 'auto'
         },
         {
           id: '4',
           title: '未佩戴安全帽',
           image: require('./images/5.jpg'),
           cameraName: '摄像头01',
           location: '工地东北角',
           startTime: '2025-06-06 14:56',
           duration: '6秒',
           reviewType: 'auto'
         },
         {
           id: '5',
           title: '人员穿越禁止区域',
           image: require('./images/5.jpg'),
           cameraName: '摄像头02',
           location: '材料区',
           startTime: '2025-06-05 17:44',
           duration: '1秒',
           reviewType: 'manual'
         },
         {
           id: '6',
           title: '未穿工作服',
           image: require('./images/4.jpg'),
           cameraName: '摄像头03',
           location: '工地南侧',
           startTime: '2025-06-05 16:32',
           duration: '3秒',
           reviewType: 'auto'
         },
         {
           id: '7',
           title: '违规吸烟',
           image: require('./images/6.jpg'),
           cameraName: '摄像头05',
           location: '休息区',
           startTime: '2025-06-05 15:28',
           duration: '8秒',
           reviewType: 'manual'
         },
         {
           id: '8',
           title: '高空作业未系安全带',
           image: require('./images/1.jpg'),
           cameraName: '摄像头04',
           location: '施工作业区',
           startTime: '2025-06-05 14:15',
           duration: '12秒',
           reviewType: 'auto'
         },
         {
           id: '9',
           title: '闲杂人员入侵',
           image: require('./images/5.jpg'),
           cameraName: '摄像头02',
           location: '材料区',
           startTime: '2025-06-05 13:45',
           duration: '5秒',
           reviewType: 'manual'
         },
         {
           id: '10',
           title: '未穿反光背心',
           image: require('./images/3.jpg'),
           cameraName: '摄像头06',
           location: '工地东北角',
           startTime: '2025-06-05 12:20',
           duration: '4秒',
           reviewType: 'auto'
         },
         {
           id: '11',
           title: '安全帽佩戴异常',
           image: require('./images/5.jpg'),
           cameraName: '摄像头01',
           location: '工地东北角',
           startTime: '2025-06-05 11:35',
           duration: '7秒',
           reviewType: 'auto'
         },
         {
           id: '12',
           title: '危险区域人员滞留',
           image: require('./images/5.jpg'),
           cameraName: '摄像头07',
           location: '施工作业区',
           startTime: '2025-06-05 10:48',
           duration: '15秒',
           reviewType: 'manual'
         },
         {
           id: '13',
           title: '工作服穿着不规范',
           image: require('./images/4.jpg'),
           cameraName: '摄像头08',
           location: '工地南侧',
           startTime: '2025-06-05 09:22',
           duration: '6秒',
           reviewType: 'auto'
         },
         {
           id: '14',
           title: '火源烟雾检测',
           image: require('./images/6.jpg'),
           cameraName: '摄像头09',
           location: '休息区',
           startTime: '2025-06-05 08:55',
           duration: '11秒',
           reviewType: 'manual'
         },
         {
           id: '15',
           title: '高空作业安全带检查',
           image: require('./images/1.jpg'),
           cameraName: '摄像头10',
           location: '施工作业区',
           startTime: '2025-06-04 17:30',
           duration: '9秒',
           reviewType: 'auto'
         },
         {
           id: '16',
           title: '无关人员进入施工区',
           image: require('./images/5.jpg'),
           cameraName: '摄像头11',
           location: '施工作业区',
           startTime: '2025-06-04 16:45',
           duration: '13秒',
           reviewType: 'manual'
         },
         {
           id: '17',
           title: '反光服装缺失检测',
           image: require('./images/3.jpg'),
           cameraName: '摄像头12',
           location: '材料区',
           startTime: '2025-06-04 15:18',
           duration: '3秒',
           reviewType: 'auto'
         },
         {
           id: '18',
           title: '防护用具佩戴检查',
           image: require('./images/2.jpg'),
           cameraName: '摄像头13',
           location: '工地南侧',
           startTime: '2025-06-04 14:22',
           duration: '8秒',
           reviewType: 'auto'
         }
       ],
      
      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 60,
        total: 325
      },
      
      // 加载状态
      loading: false,
      
      // 选中的记录
      selectedRecords: [],
      
      // 统计面板显示状态
      showStatsPanel: true,
      
      // 复判类型选项
      reviewTypeOptions: [
        { label: '全部', value: '' },
        { label: '多模态大模型复判', value: 'auto' },
        { label: '人工审核', value: 'manual' }
      ],
      
      // 预警技能选项
      warningSkillOptions: [
        { label: '全部智能技能', value: '' },
        { label: '安全帽检测', value: 'safety_helmet_detection' },
        { label: '工作服检测', value: 'work_clothes_detection' },
        { label: '反光背心检测', value: 'reflective_vest_detection' },
        { label: '安全带检测', value: 'safety_belt_detection' },
        { label: '烟火检测', value: 'smoke_fire_detection' },
        { label: '人员入侵检测', value: 'personnel_intrusion_detection' },
        { label: '高空作业检测', value: 'high_altitude_work_detection' },
        { label: '区域入侵检测', value: 'area_intrusion_detection' }
      ],
      
      // 预警详情对话框
      warningDetailVisible: false,
      currentWarningDetail: null
    }
  },
  computed: {
    // 根据筛选条件过滤的数据
    filteredData() {
      let filtered = [...this.reviewList]
      
      // 按日期范围筛选
      if (this.activeSearchForm.startDate) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.startTime)
          const startDate = new Date(this.activeSearchForm.startDate + ' 00:00:00')
          return itemDate >= startDate
        })
      }
      
      if (this.activeSearchForm.endDate) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.startTime)
          const endDate = new Date(this.activeSearchForm.endDate + ' 23:59:59')
          return itemDate <= endDate
        })
      }
      
      // 按复判类型筛选
      if (this.activeSearchForm.reviewType) {
        filtered = filtered.filter(item => item.reviewType === this.activeSearchForm.reviewType)
      }
      
      // 按预警技能筛选
      if (this.activeSearchForm.warningSkill) {
        filtered = filtered.filter(item => {
          // 根据预警技能关键词匹配
          const skillMap = {
            'safety_helmet_detection': ['安全帽'],
            'work_clothes_detection': ['工作服'],
            'reflective_vest_detection': ['反光'],
            'safety_belt_detection': ['安全带'],
            'smoke_fire_detection': ['吸烟', '烟火', '火源'],
            'personnel_intrusion_detection': ['人员', '越界', '入侵'],
            'area_intrusion_detection': ['区域', '禁止']
          }
          
          const keywords = skillMap[this.activeSearchForm.warningSkill] || []
          return keywords.some(keyword => item.title.includes(keyword))
        })
      }
      
      // 按预警点位筛选
      if (this.activeSearchForm.warningLocation) {
        filtered = filtered.filter(item => 
          item.cameraName.toLowerCase().includes(this.activeSearchForm.warningLocation.toLowerCase())
        )
      }
      
      // 按预警名称筛选
      if (this.activeSearchForm.warningName) {
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(this.activeSearchForm.warningName.toLowerCase())
        )
      }
      
      // 按预警ID筛选
      if (this.activeSearchForm.warningId) {
        filtered = filtered.filter(item => 
          item.id.toLowerCase().includes(this.activeSearchForm.warningId.toLowerCase())
        )
      }
      
      return filtered
    },
    
    // 当前页显示的数据
    currentPageData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
      const end = start + this.pagination.pageSize
      return this.filteredData.slice(start, end)
    },
    
    // 更新分页总数
    totalRecords() {
      return this.filteredData.length
    }
  },
  watch: {
    // 监听筛选数据变化，更新统计信息
    filteredData(newData) {
      // 根据筛选后的数据更新统计信息
      const autoCount = newData.filter(item => item.reviewType === 'auto').length
      const manualCount = newData.filter(item => item.reviewType === 'manual').length
      
      // 更新 TOP3 数据（示例逻辑，实际项目中应该根据具体业务需求计算）
      this.updateStatistics(newData)
    }
  },
  mounted() {
    this.getReviewList()
    // 确保初始数据正确显示
    this.$nextTick(() => {
      console.log('ReviewList length:', this.reviewList.length)
      console.log('FilteredData length:', this.filteredData.length)
      console.log('CurrentPageData length:', this.currentPageData.length)
    })
  },
  methods: {
    // 返回上一页
    goBack() {
      this.$router.go(-1)
    },
    
    // 获取复判记录列表
    async getReviewList() {
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        // 实际项目中，这里应该是API调用
        // this.reviewList = await getReviewListAPI(this.searchForm)
      } finally {
        this.loading = false
      }
    },
    
    // 搜索
    handleSearch() {
      // 将搜索条件复制到活跃搜索条件，触发计算属性更新
      this.activeSearchForm = { ...this.searchForm }
      
      this.pagination.currentPage = 1
      this.selectedRecords = []
      
      // 等待计算属性更新后再显示结果
      this.$nextTick(() => {
        const totalCount = this.reviewList.length
        const filteredCount = this.totalRecords
        
        if (filteredCount === totalCount) {
          this.$message.success('显示全部记录')
        } else if (filteredCount === 0) {
          this.$message.warning('未找到匹配的记录，请调整搜索条件')
        } else {
          this.$message.success(`找到 ${filteredCount} 条匹配记录，共 ${totalCount} 条`)
        }
      })
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        startDate: '',
        endDate: '',
        reviewType: '',
        warningSkill: '',
        warningLocation: '',
        warningName: '',
        warningId: ''
      }
      // 同时重置活跃搜索条件，立即显示全部数据
      this.activeSearchForm = {
        startDate: '',
        endDate: '',
        reviewType: '',
        warningSkill: '',
        warningLocation: '',
        warningName: '',
        warningId: ''
      }
      this.pagination.currentPage = 1
      this.selectedRecords = []
      this.$message.info('搜索条件已重置')
    },
    
    // 全选/取消全选
    handleSelectAll() {
      if (this.selectedRecords.length === this.filteredData.length) {
        // 如果已经全选，则取消全选
        this.selectedRecords = []
        this.$message.info('已取消全选')
      } else {
        // 全选所有筛选后的记录
        this.selectedRecords = this.filteredData.map(item => item.id)
        this.$message.success(`已选择 ${this.selectedRecords.length} 项记录`)
      }
    },
    
    // 选择本页
    handleSelectPage() {
      const currentPageIds = this.currentPageData.map(item => item.id)
      
      if (currentPageIds.every(id => this.selectedRecords.includes(id))) {
        // 如果当前页已全选，则取消选择
        this.selectedRecords = this.selectedRecords.filter(id => 
          !currentPageIds.includes(id)
        )
        this.$message.info('已取消选择本页')
      } else {
        // 选择当前页所有项，同时保留其他已选项
        const otherSelectedIds = this.selectedRecords.filter(id => 
          !currentPageIds.includes(id)
        )
        this.selectedRecords = [...otherSelectedIds, ...currentPageIds]
        this.$message.success(`已选择本页 ${currentPageIds.length} 项记录`)
      }
    },
    
    // 批量导出
    handleBatchExport() {
      if (this.selectedRecords.length === 0) {
        this.$message.warning('请先选择要导出的记录')
        return
      }
      
      try {
        // 获取要导出的数据
        const exportData = this.filteredData
          .filter(item => this.selectedRecords.includes(item.id))
          .map(item => ({
            预警名称: item.title,
            预警点位: item.cameraName,
            开始时间: item.startTime,
            持续时间: item.duration,
            复判类型: this.getReviewTypeText(item.reviewType)
          }))
        
        // 导出为CSV
        this.exportToCSV(exportData, `复判记录_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`)
        this.$message.success(`已导出 ${exportData.length} 条记录`)
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      }
    },
    
    // 批量删除
    async handleBatchDelete() {
      if (this.selectedRecords.length === 0) {
        this.$message.warning('请先选择要删除的记录')
        return
      }
      
      try {
        await this.$confirm(
          `确定要删除选中的 ${this.selectedRecords.length} 项记录吗？删除后将无法恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        this.loading = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 从列表中移除选中项
        this.reviewList = this.reviewList.filter(item => 
          !this.selectedRecords.includes(item.id)
        )
        
        this.$message.success(`已成功删除 ${this.selectedRecords.length} 项记录`)
        this.selectedRecords = []
        
        // 如果当前页没有数据了，回到上一页
        if (this.currentPageData.length === 0 && this.pagination.currentPage > 1) {
          this.pagination.currentPage--
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      } finally {
        this.loading = false
      }
    },
    
    // 刷新数据
    async handleRefresh() {
      this.loading = true
      this.selectedRecords = []
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        this.$message.success('数据已刷新')
      } finally {
        this.loading = false
      }
    },
    
    // 导出CSV文件
    exportToCSV(data, filename) {
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
      this.downloadFile(blob, filename)
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
    
    // 分页改变
    handlePageChange(page) {
      this.pagination.currentPage = page
      // 不清除选择状态，让用户可以跨页选择
    },
    
    // 每页数量改变
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      // 保持选择状态，但需要确保选中的项目仍然有效
      this.selectedRecords = this.selectedRecords.filter(id => 
        this.filteredData.some(item => item.id === id)
      )
    },
    
    // 查看复判详情
    viewDetail(item) {
      // 将复判记录数据转换为预警详情格式
      this.currentWarningDetail = this.convertToWarningFormat(item)
      this.warningDetailVisible = true
    },
    
    // 将复判记录数据转换为预警详情格式
    convertToWarningFormat(reviewItem) {
      // 计算预警产生时间（比开始时间早一些）
      const startTime = new Date(reviewItem.startTime)
      const warningTime = new Date(startTime.getTime() - 5 * 60 * 1000) // 提前5分钟
      const reviewCompleteTime = new Date(startTime.getTime() + parseInt(reviewItem.duration) * 1000) // 加上持续时间
      
      return {
        id: reviewItem.id,
        type: reviewItem.title,
        device: reviewItem.cameraName,
        deviceInfo: {
          name: reviewItem.cameraName,
          position: reviewItem.location
        },
        location: reviewItem.location,
        time: this.formatDateTimeToStandard(warningTime),
        duration: reviewItem.duration,
        level: this.getWarningLevelByType(reviewItem.title), // 根据类型判断等级
        imageUrl: reviewItem.image,
        description: `复判记录：${reviewItem.title}，持续时间：${reviewItem.duration}`,
        reviewType: reviewItem.reviewType, // 添加复判类型
        reviewTypeText: this.getReviewTypeText(reviewItem.reviewType), // 添加复判类型文本
        status: 'completed',
        // 添加操作历史（按时间倒序）
        operationHistory: [
          {
            id: 1,
            status: 'completed',
            statusText: '复判完成',
            time: this.formatDateTimeToStandard(reviewCompleteTime),
            description: `${this.getReviewTypeText(reviewItem.reviewType)}已完成，复判结果：${this.getReviewResult(reviewItem)}`,
            operationType: 'review_completed',
            operator: reviewItem.reviewType === 'auto' ? '多模态大模型' : '复判人员'
          },
          {
            id: 2,
            status: 'completed',
            statusText: '开始复判',
            time: this.formatDateTimeToStandard(new Date(reviewItem.startTime)),
            description: `开始进行${this.getReviewTypeText(reviewItem.reviewType)}，预计耗时：${reviewItem.duration}`,
            operationType: 'review_start',
            operator: reviewItem.reviewType === 'auto' ? '智能复判系统' : '复判人员'
          },
          {
            id: 3,
            status: 'completed',
            statusText: '预警触发',
            time: this.formatDateTimeToStandard(warningTime),
            description: `${reviewItem.title}：检测到异常情况，已记录预警信息并排队等待复判`,
            operationType: 'create',
            operator: '监控系统'
          }
        ]
      }
    },
    
    // 根据预警类型判断等级
    getWarningLevelByType(type) {
      const levelMap = {
        '人员越界': '一级预警',
        '未佩戴安全帽': '一级预警',
        '高空作业未系安全带': '一级预警',
        '违规吸烟检测': '二级预警',
        '火源烟雾检测': '一级预警',
        '未穿工作服': '三级预警',
        '未穿反光背心': '三级预警',
        '闲杂人员入侵': '二级预警',
        '无关人员进入施工区': '二级预警',
        '危险区域人员滞留': '一级预警'
      }
      
      // 模糊匹配
      for (const [key, level] of Object.entries(levelMap)) {
        if (type.includes(key.substring(0, 3))) {
          return level
        }
      }
      
      return '二级预警' // 默认等级
    },
    
    // 获取复判结果
    getReviewResult(reviewItem) {
      const results = [
        '确认为真实预警，已记录',
        '预警信息准确，处理完成',
        '检测结果有效，已归档',
        '复判通过，预警成立',
        '验证完成，信息属实'
      ]
      
      // 根据ID生成固定的结果
      const index = parseInt(reviewItem.id) % results.length
      return results[index]
    },
    
    // 格式化时间显示
    formatTimeDisplay(timeString) {
      try {
        // 如果已经是格式化的字符串，直接返回
        if (typeof timeString === 'string' && timeString.includes('年') && timeString.includes('月') && timeString.includes('日')) {
          return timeString
        }
        
        let date
        if (timeString instanceof Date) {
          date = timeString
        } else {
          date = new Date(timeString)
        }
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', timeString)
          return timeString
        }
        
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        
        return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('Time formatting error:', error, timeString)
        return timeString || ''
      }
    },
    
    // 处理预警详情对话框中的事件（复判记录页面不需要处理操作）
    handleWarningFromDetail(warning) {
      // 复判记录页面不需要处理预警操作
      console.log('复判记录页面：预警操作', warning)
    },
    
    // 处理预警详情对话框中的上报事件
    handleReportFromDetail(warning) {
      // 复判记录页面不需要处理上报操作
      console.log('复判记录页面：上报操作', warning)
    },
    
    // 处理预警详情对话框中的归档事件
    handleArchiveFromDetail(warning) {
      // 复判记录页面不需要处理归档操作
      console.log('复判记录页面：归档操作', warning)
    },
    
    // 处理预警详情对话框中的误报事件
    handleFalseAlarmFromDetail(warning) {
      // 复判记录页面不需要处理误报操作
      console.log('复判记录页面：误报操作', warning)
    },
    
    // 获取复判类型文本
    getReviewTypeText(type) {
      const typeMap = {
        'auto': '多模态大模型复判',
        'manual': '人工审核'
      }
      return typeMap[type] || '未知'
    },
    
    // 获取复判类型样式
    getReviewTypeClass(type) {
      const classMap = {
        'auto': 'review-type-auto',
        'manual': 'review-type-manual'
      }
      return classMap[type] || ''
    },
    
    // 切换统计面板显示状态
    toggleStatsPanel() {
      this.showStatsPanel = !this.showStatsPanel
    },
    
    // 切换选择状态
    toggleSelect(id, event) {
      // 阻止事件冒泡，避免触发卡片的点击事件
      if (event) {
        event.stopPropagation()
      }
      
      const index = this.selectedRecords.indexOf(id)
      if (index === -1) {
        this.selectedRecords.push(id)
      } else {
        this.selectedRecords.splice(index, 1)
      }
    },
    
    // 更新统计信息
    updateStatistics(newData) {
      // 根据筛选后的数据更新统计信息，这里主要是为了演示功能
      // 实际项目中，统计数据应该由后端API提供
      console.log('筛选后数据量:', newData.length)
    },
    
    // 将日期时间转换为标准格式（YYYY-MM-DD HH:mm:ss）
    formatDateTimeToStandard(date) {
      try {
        let dateObj
        if (date instanceof Date) {
          dateObj = date
        } else {
          dateObj = new Date(date)
        }
        
        if (isNaN(dateObj.getTime())) {
          console.warn('Invalid date for standard format:', date)
          return date
        }
        
        const year = dateObj.getFullYear()
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
        const day = dateObj.getDate().toString().padStart(2, '0')
        const hours = dateObj.getHours().toString().padStart(2, '0')
        const minutes = dateObj.getMinutes().toString().padStart(2, '0')
        const seconds = dateObj.getSeconds().toString().padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('Date formatting error:', error, date)
        return date
      }
    }
  }
}
</script>

<template>
  <div class="review-records-container" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button 
          type="text" 
          icon="el-icon-arrow-left" 
          @click="goBack"
          class="back-btn"
        >
          智能复判记录
        </el-button>
      </div>
      <div class="header-right">
        <el-button 
          type="text" 
          :icon="showStatsPanel ? 'el-icon-view' : 'el-icon-s-data'"
          @click="toggleStatsPanel"
        >
          {{ showStatsPanel ? '隐藏看板' : '显示看板' }}
        </el-button>
      </div>
    </div>
    
    <!-- 上半部分：数据统计卡片 -->
    <div class="statistics-card" v-if="showStatsPanel">
      <div class="stats-overview">
        <!-- 总体统计 -->
        <div class="overview-item">
          <div class="overview-label">智能复判数量</div>
          <div class="overview-value">{{ statistics.reviewed }}/{{ statistics.total }}</div>
          <div class="overview-subtitle">复判完成数/分析完成数</div>
        </div>
        
        <!-- 完成率 -->
        <div class="overview-item">
          <div class="overview-label">完成率</div>
          <div class="overview-value percentage-value">{{ statistics.percentage }}%</div>
          <div class="overview-subtitle">总体完成率</div>
        </div>
        
        <!-- TOP3排行 -->
        <div class="overview-ranking">
          <div class="ranking-header">
            <span class="ranking-title">智能复判数量TOP3</span>
            <div class="ranking-legend">
              <span class="legend-dot completed"></span>
              <span class="legend-text">复判完成数</span>
              <span class="legend-dot total"></span>
              <span class="legend-text">分析完成数</span>
            </div>
          </div>
          <div class="ranking-items">
            <div v-for="(item, index) in topData" :key="item.id" class="ranking-row">
              <div class="ranking-index" :style="{ backgroundColor: item.color }">{{ index + 1 }}</div>
              <div class="ranking-name">{{ item.name }}</div>
              <div class="ranking-progress">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: item.percentage + '%', backgroundColor: item.color }"></div>
                </div>
                <div class="ranking-stats">
                  <span class="completed-count">{{ item.count }}</span>
                  <span class="separator">/</span>
                  <span class="total-count">{{ item.total }}</span>
                  <span class="percentage-text">{{ item.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 下半部分：内容卡片 -->
    <div class="content-card">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <el-button 
            type="primary" 
            size="small"
            @click="handleSelectAll"
          >
            {{ selectedRecords.length === filteredData.length && filteredData.length > 0 ? '取消全选' : '全选' }}
          </el-button>
          <el-button 
            size="small"
            @click="handleSelectPage"
          >
            选择本页
          </el-button>
          <el-button 
            size="small"
            :disabled="selectedRecords.length === 0"
            @click="handleBatchExport"
          >
            批量导出
          </el-button>
          <el-button 
            size="small"
            type="danger"
            :disabled="selectedRecords.length === 0"
            @click="handleBatchDelete"
          >
            删除
          </el-button>
        </div>
        
        <div class="filter-actions">
          <div class="selection-info" v-if="selectedRecords.length > 0">
            <span class="selection-text">已选择 {{ selectedRecords.length }} 项</span>
          </div>
          <div class="filter-right">
            <el-button 
              type="text" 
              icon="el-icon-refresh"
              @click="handleRefresh"
            >
              刷新
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 搜索条件 -->
      <div class="search-section">
        <div class="search-row">
          <div class="search-item">
            <label>预警日期：</label>
            <el-date-picker
              v-model="searchForm.startDate"
              type="date"
              placeholder="开始日期"
              size="small"
              value-format="yyyy-MM-dd"
            />
            <span class="date-separator">-</span>
            <el-date-picker
              v-model="searchForm.endDate"
              type="date"
              placeholder="结束日期"
              size="small"
              value-format="yyyy-MM-dd"
            />
          </div>
          
          <div class="search-item">
            <label>复判类型：</label>
            <el-select 
              v-model="searchForm.reviewType" 
              placeholder="全部" 
              size="small"
            >
              <el-option 
                v-for="option in reviewTypeOptions"
                :key="option.value"
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <label>预警技能：</label>
            <el-select 
              v-model="searchForm.warningSkill" 
              placeholder="全部智能技能" 
              size="small"
            >
              <el-option 
                v-for="option in warningSkillOptions"
                :key="option.value"
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <label>预警点位：</label>
            <el-input
              v-model="searchForm.warningLocation"
              placeholder="请输入预警点位"
              size="small"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <div class="search-row">
          <div class="search-item">
            <label>预警名称：</label>
            <el-input
              v-model="searchForm.warningName"
              placeholder="请输入预警名称"
              size="small"
              @keyup.enter="handleSearch"
            />
          </div>
          
          <div class="search-item">
            <label>预警ID：</label>
            <el-input
              v-model="searchForm.warningId"
              placeholder="请输入预警ID"
              size="small"
              @keyup.enter="handleSearch"
            />
          </div>
          
          <div class="search-actions">
            <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
            <el-button size="small" @click="resetSearch">重置</el-button>
          </div>
        </div>
      </div>
      
      <!-- 复判记录列表 -->
      <div class="records-section">
        <div class="records-grid" v-if="currentPageData.length > 0">
          <div 
            v-for="item in currentPageData" 
            :key="item.id" 
            class="record-card"
            :class="{ 'selected': selectedRecords.includes(item.id) }"
            @click="viewDetail(item)"
          >
            <!-- 选择框 -->
            <div class="select-checkbox" @click="toggleSelect(item.id, $event)">
              <el-checkbox 
                :value="selectedRecords.includes(item.id)"
                @change="toggleSelect(item.id)"
                size="mini"
              />
            </div>
            
            <div class="card-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            
            <div class="card-content">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-info">
                <div class="info-item">
                  <span class="label">设备名称：</span>
                  <span class="value">{{ item.cameraName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">违规位置：</span>
                  <span class="value">{{ item.location }}</span>
                </div>
                <div class="info-item time-item">
                  <span class="time">{{ formatTimeDisplay(item.startTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无数据提示 -->
        <div class="no-data" v-else>
          <i class="el-icon-folder-opened"></i>
          <p>暂无复判记录数据</p>
          <span class="no-data-tip">请尝试调整筛选条件或联系管理员</span>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-section">
        <div class="pagination-info">
          共 {{ totalRecords }} 条数据
        </div>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="pagination.currentPage"
          :page-sizes="[20, 40, 60, 100]"
          :page-size="pagination.pageSize"
          :total="totalRecords"
          layout="sizes, prev, pager, next, jumper"
          class="pagination-controls"
        />
      </div>
    </div>
    
    <!-- 预警详情对话框 -->
    <WarningDetail
      :visible.sync="warningDetailVisible"
      :warning="currentWarningDetail"
      source="reviewRecords"
      @handle-warning="handleWarningFromDetail"
      @handle-report="handleReportFromDetail"
      @handle-archive="handleArchiveFromDetail"
      @handle-false-alarm="handleFalseAlarmFromDetail"
    />
  </div>
</template>

<style scoped>
.review-records-container {
  height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 页面头部 */
.page-header {
  background: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.back-btn {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.back-btn:hover {
  color: #409eff;
}

/* 上半部分：数据统计卡片 */
.statistics-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
  width: 100%;
  flex-shrink: 0;
}

.stats-overview {
  display: flex;
  align-items: stretch;
  padding: 12px 24px;
  gap: 24px;
  min-height: 60px;
}

/* 总体统计项 */
.overview-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 180px;
  padding: 0 20px;
  border-right: 1px solid #f0f0f0;
}

.overview-item:last-child {
  border-right: none;
}

.overview-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 400;
}

.overview-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 2px;
  line-height: 1.2;
}

.overview-value.percentage-value {
  color: #409eff;
}

.overview-subtitle {
  font-size: 11px;
  color: #c0c4cc;
  line-height: 1.2;
}

/* TOP3排行区域 */
.overview-ranking {
  flex: 1;
  min-width: 0;
  padding-left: 20px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ranking-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.ranking-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #909399;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.completed {
  background: #409eff;
}

.legend-dot.total {
  background: #e4e7ed;
}

.legend-text {
  margin-left: 4px;
}

.ranking-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 20px;
}

.ranking-index {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.ranking-name {
  font-size: 11px;
  color: #606266;
  min-width: 80px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.ranking-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.progress-track {
  flex: 1;
  height: 3px;
  background: #f0f2f5;
  border-radius: 2px;
  overflow: hidden;
  min-width: 60px;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.ranking-stats {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #909399;
  white-space: nowrap;
  flex-shrink: 0;
}

.completed-count {
  color: #606266;
  font-weight: 500;
}

.separator {
  color: #c0c4cc;
  margin: 0 1px;
}

.total-count {
  color: #909399;
}

.percentage-text {
  color: #409eff;
  font-weight: 500;
  margin-left: 4px;
}

/* 下半部分：内容卡片 */
.content-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 筛选区域 */
.filter-section {
  padding: 12px 24px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-actions {
  display: flex;
  gap: 16px;
}

/* 搜索区域 */
.search-section {
  padding: 12px 24px;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.search-row:last-child {
  margin-bottom: 0;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.search-item label {
  font-size: 14px;
  color: #606266;
  min-width: auto;
}

.date-separator {
  color: #909399;
  margin: 0 4px;
}

.search-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

/* 记录列表区域 */
.records-section {
  padding: 16px 24px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding: 0 4px 20px 0;
  align-content: start;
}

@media (max-width: 1600px) {
  .records-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 15px;
    align-content: start;
  }
}

@media (max-width: 1300px) {
  .records-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    align-content: start;
  }
}

@media (max-width: 1000px) {
  .records-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    align-content: start;
    padding: 0 2px 18px 0;
  }
  
  .record-card {
    height: 260px;
  }
  
  .card-image {
    height: 140px;
  }
}

.record-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 260px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.record-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #c6e2ff;
}

.card-image {
  height: 140px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  flex-shrink: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title {
  font-size: 12px;
  margin-bottom: 4px;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.info-item {
  display: flex;
  font-size: 12px;
  line-height: 1.4;
  text-align: left;
}

.info-item .label {
  color: #909399;
  min-width: 60px;
  flex-shrink: 0;
  font-weight: 500;
  text-align: left;
}

.info-item .value {
  color: #606266;
  flex: 1;
  font-weight: 400;
  text-align: left;
}

.time-item {
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
}

.time-item .time {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
  line-height: 1.4;
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-top: 1px solid #f0f2f5;
  background: #fafafa;
  margin: 0 -24px 0 -24px;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 14px;
  color: #909399;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-overview {
    flex-direction: column;
    gap: 16px;
    min-height: auto;
  }
  
  .overview-item {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding: 12px 0;
    text-align: center;
    min-width: auto;
  }
  
  .overview-item:last-child {
    border-bottom: none;
  }
  
  .overview-ranking {
    padding-left: 0;
  }
  
  .search-row {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .review-records-container {
    padding: 8px;
  }
  
  .page-header {
    padding: 10px 16px;
    margin-bottom: 8px;
  }
  
  .statistics-card {
    margin-bottom: 8px;
  }
  
  .stats-overview {
    padding: 10px 16px;
    gap: 12px;
    min-height: 50px;
  }
  
  .filter-section,
  .search-section {
    padding: 10px 16px;
  }
  
  .records-section {
    padding: 12px 16px 0;
  }
  
  .pagination-section {
    padding: 10px 16px;
    margin: 0 -16px 0 -16px;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .search-item {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  
  .search-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .records-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    align-content: start;
    padding: 0 2px 16px 0;
  }
  
  .record-card {
    height: 220px;
  }
  
  .card-image {
    height: 110px;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .card-title {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .info-item {
    font-size: 11px;
    text-align: left;
  }
  
  .info-item .label {
    min-width: 55px;
    text-align: left;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

@media (max-width: 600px) {
  .records-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    align-content: start;
    padding: 0 0 16px 0;
  }
  
  .record-card {
    height: 200px;
  }
  
  .card-image {
    height: 100px;
  }
  
  .card-content {
    padding: 8px;
  }
  
  .card-title {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .info-item {
    font-size: 10px;
    text-align: left;
  }
  
  .info-item .label {
    min-width: 50px;
    text-align: left;
  }
}

@media (max-width: 400px) {
  .records-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .record-card {
    height: 220px;
  }
  
  .card-image {
    height: 110px;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .card-title {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .info-item {
    font-size: 11px;
    text-align: left;
  }
}

/* 选择框样式 - 高透明度，不明显 */
.select-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 20px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.select-checkbox:hover {
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 0.7;
}

.record-card:hover .select-checkbox {
  opacity: 0.5;
}

.record-card.selected .select-checkbox {
  background-color: rgba(64, 158, 255, 0.15);
  border: 1px solid rgba(64, 158, 255, 0.3);
  opacity: 0.8;
}

.select-checkbox .el-checkbox {
  transform: scale(0.8);
}

.select-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}

/* 卡片选中状态 */
.record-card.selected {
  border-color: #c6e2ff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 筛选按钮状态 */
.filter-tabs .el-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-tabs .el-button.is-disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

/* 选择信息样式 */
.selection-info {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.selection-text {
  font-size: 13px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #c6e2ff;
  font-weight: 500;
}

/* 无数据提示样式 */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.no-data i {
  font-size: 40px;
  color: #909399;
  margin-bottom: 10px;
}

.no-data p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.no-data-tip {
  font-size: 12px;
  color: #c0c4cc;
}
</style> 
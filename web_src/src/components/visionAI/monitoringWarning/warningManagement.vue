<script>
export default {
  name: "WarningManagement",
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
      
      // 左侧目录数据
      directories: [
        {
          id: '1',
          name: '油气行业',
          selected: true
        }
        // 可以添加更多目录
      ],
      
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
          deviceInfo: {
            name: '可燃气体',
            position: '0.1 米'
          }
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
          deviceInfo: {
            name: '一氧化碳',
            position: '1.5 米'
          }
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
          deviceInfo: {
            name: '硫化氢',
            position: '2.0 米'
          }
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
          deviceInfo: {
            name: '火焰探测器',
            position: '管道区域'
          }
        },
        {
          id: '5',
          deviceName: '温度超限预警',
          imageUrl: '/src/assets/warning-icon.png',
          value: 85,
          unit: '°C',
          level: '二级预警',
          time: '2022-12-20 16:50:22',
          status: 'processing',
          deviceInfo: {
            name: '温度传感器',
            position: '储罐区'
          }
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
          deviceInfo: {
            name: '压力传感器',
            position: '管道接口'
          }
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
      exportLoading: false
    }
  },
  computed: {
    // 根据筛选条件过滤的预警列表
    filteredWarningList() {
      let list = [...this.warningList]
      
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
          'level3': '三级预警'
        }
        list = list.filter(item => item.level === levelMap[this.searchForm.warningLevel])
      }
      
      // 如果是只看预警中事件
      if (this.filterType === 'pending') {
        return list.filter(item => item.status === 'pending')
      }
      
      return list
    },
    
    // 当前页的数据
    currentPageData() {
      // 这里模拟每页12条数据，实际项目中可能需要结合分页组件
      return this.filteredWarningList.slice(0, 12)
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
          if (action === 'process') {
            this.warningList[index].status = 'processing'
            this.$message.success('已开始处理预警')
          } else if (action === 'complete') {
            this.warningList[index].status = 'completed'
            this.$message.success('预警已完结')
          } else if (action === 'report') {
            this.$message.success('预警已上报')
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
      
      try {
        this.loading = true
        
        // 更新筛选类型
        this.filterType = 'batch'
        
        // 模拟API调用处理时间
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 更新所有选中项的状态
        for (const id of this.selectedWarnings) {
          const index = this.warningList.findIndex(item => item.id === id)
          if (index !== -1 && this.warningList[index].status === 'pending') {
            this.warningList[index].status = 'processing'
          }
        }
        
        this.$message.success(`已批量处理 ${this.selectedWarnings.length} 项预警`)
        this.selectedWarnings = []
      } catch (error) {
        console.error('批量处理失败:', error)
        this.$message.error('批量处理失败')
      } finally {
        this.loading = false
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
        预警值: `${item.value} ${item.unit}`,
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
    }
  }
}
</script>

<template>
  <div class="warning-management-container" v-loading="loading">
    <!-- 左侧目录 -->
    <div class="directory-sidebar">
      <div class="search-box">
        <el-input
          v-model="searchDirectory"
          placeholder="输入组织名称搜索"
          prefix-icon="el-icon-search"
          clearable
        />
      </div>
      <div class="directory-list">
        <div
          v-for="dir in directories"
          :key="dir.id"
          :class="['directory-item', { active: dir.selected }]"
        >
          {{ dir.name }}
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
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
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>
          
          <div class="select-wrapper">
            <el-select 
              v-model="searchForm.warningType" 
              placeholder="全部预警类型" 
              size="small"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="超限预警" value="overflow" />
              <el-option label="浓度预警" value="concentration" />
              <el-option label="温度预警" value="temperature" />
              <el-option label="压力预警" value="pressure" />
            </el-select>
          </div>
          
          <div class="select-wrapper">
            <el-select 
              v-model="searchForm.warningLevel" 
              placeholder="全部预警等级" 
              size="small"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="一级预警" value="level1" />
              <el-option label="二级预警" value="level2" />
              <el-option label="三级预警" value="level3" />
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
            >仅查看预警中事件</el-button>
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
        <el-row :gutter="12">
          <el-col 
            v-for="item in filteredWarningList" 
            :key="item.id" 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6" 
            :xl="4"
          >
            <div 
              class="warning-card" 
              :class="[
                getBorderClass(item.level), 
                { 'selected': selectedWarnings.includes(item.id) }
              ]"
              @click="toggleSelect(item.id)"
            >
              <div class="warning-value-tag">
                <span class="value-number">{{ item.value }}</span>
                <span class="value-unit">{{ item.unit }}</span>
              </div>
              
              <!-- 添加选中标记 -->
              <div class="select-mark" v-if="selectedWarnings.includes(item.id)">
                <i class="el-icon-check"></i>
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
                    <span class="value">{{ item.deviceInfo.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">预警位置：</span>
                    <span class="value">{{ item.deviceInfo.position }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">预警等级：</span>
                    <span class="warning-level" :class="getLevelTextClass(item.level)">
                      {{ item.level }}
                    </span>
                  </div>
                  <div class="info-item time-item">
                    <span class="time">{{ item.time }}</span>
                  </div>
                </div>
                
                <div class="warning-footer">
                  <template v-if="item.status === 'pending'">
                    <el-button 
                      type="primary" 
                      size="small" 
                      plain
                      @click.stop="handleWarning(item.id, 'process')"
                    >处理</el-button>
                  </template>
                  <template v-else-if="item.status === 'processing'">
                    <el-button 
                      class="complete-btn" 
                      size="small" 
                      plain
                      @click.stop="handleWarning(item.id, 'complete')"
                    >完结</el-button>
                  </template>
                  <el-button 
                    class="report-btn" 
                    size="small" 
                    @click.stop="handleWarning(item.id, 'report')"
                  >上报</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 没有数据时的提示 -->
        <div class="no-data" v-if="filteredWarningList.length === 0">
          <i class="el-icon-warning-outline"></i>
          <p>暂无符合条件的预警数据</p>
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
  </div>
</template>

<style scoped>
.warning-management-container {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f7fa;
}

/* 左侧目录样式 */
.directory-sidebar {
  width: 180px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.directory-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.directory-item {
  padding: 12px 16px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.directory-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.directory-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  border-left: 3px solid #409eff;
}

/* 右侧内容区样式 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
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

.warning-card {
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  position: relative;
  transition: all 0.25s;
  border-top: 3px solid transparent;
  width: 100%;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.warning-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.warning-value-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.value-number {
  font-size: 14px;
  font-weight: 600;
}

.value-unit {
  font-size: 12px;
  margin-left: 2px;
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
  padding: 12px;
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
  margin-bottom: 6px;
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
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.warning-footer .el-button {
  margin-left: 8px;
}

.report-btn {
  color: #e6a23c;
  border-color: #e6a23c;
}

.complete-btn {
  color: #67c23a;
  border-color: #67c23a;
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
  
  .directory-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }
  
  .directory-list {
    display: flex;
    overflow-x: auto;
    padding: 8px 16px;
  }
  
  .directory-item {
    padding: 8px 16px;
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .directory-item.active {
    border-left: none;
    border-bottom: 3px solid #409eff;
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
  
  .warning-management-container {
    height: auto;
    min-height: calc(100vh - 60px);
  }
}

/* 添加重置按钮样式 */
.reset-button {
  margin-left: 8px;
}

/* 添加卡片选中样式 */
.warning-card.selected {
  box-shadow: 0 0 0 2px #409eff, 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.select-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 没有数据时的提示样式 */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #dcdfe6;
}

.no-data p {
  font-size: 14px;
}

/* 调整行间距 */
.el-row {
  margin-left: -6px !important;
  margin-right: -6px !important;
}

.el-col {
  padding-left: 6px !important;
  padding-right: 6px !important;
}
</style>
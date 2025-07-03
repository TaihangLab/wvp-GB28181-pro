<template>
  <div class="log-records-container">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="日志类型">
          <el-select v-model="searchForm.logType" placeholder="选择日志类型" clearable>
            <el-option label="操作" value="操作"></el-option>
            <el-option label="系统" value="系统"></el-option>
            <el-option label="错误" value="错误"></el-option>
            <el-option label="告警" value="告警"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日志级别">
          <el-select v-model="searchForm.logLevel" placeholder="选择日志级别" clearable>
            <el-option label="信息" value="信息"></el-option>
            <el-option label="警告" value="警告"></el-option>
            <el-option label="错误" value="错误"></el-option>
            <el-option label="严重" value="严重"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索关键词"
            clearable
          >
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchLogs">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 日志列表表格 -->
    <div class="table-container">
      <div class="table-operations">
        <el-button type="primary" icon="el-icon-download" size="small" @click="exportLogs">导出日志</el-button>
        <el-button type="danger" icon="el-icon-delete" size="small" @click="clearLogs">清空日志</el-button>
      </div>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        :border="false"
        class="custom-table"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="timestamp" label="时间" width="160" align="center"></el-table-column>
        <el-table-column prop="type" label="日志类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag 
              :type="getLogTypeTag(scope.row.type)"
              size="mini"
            >
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100" align="center">
          <template slot-scope="scope">
            <el-tag 
              :type="getLevelTag(scope.row.level)"
              size="mini"
            >
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="用户" width="120" align="center"></el-table-column>
        <el-table-column prop="module" label="模块" width="120" align="center"></el-table-column>
        <el-table-column prop="message" label="日志内容" align="center"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="130" align="center"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button type="text" class="view-detail-btn" @click="viewLogDetail(scope.row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page.sync="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size.sync="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
    
    <!-- 日志详情对话框 -->
    <el-dialog
      title="日志详情"
      :visible.sync="logDetailVisible"
      width="700px"
    >
      <div v-if="currentLog" class="log-detail">
        <div class="detail-item">
          <span class="detail-label">日志ID：</span>
          <span class="detail-value">{{ currentLog.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">时间：</span>
          <span class="detail-value">{{ currentLog.timestamp }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">类型：</span>
          <span class="detail-value">
            <el-tag :type="getLogTypeTag(currentLog.type)" size="mini">{{ currentLog.type }}</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">级别：</span>
          <span class="detail-value">
            <el-tag :type="getLevelTag(currentLog.level)" size="mini">{{ currentLog.level }}</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">用户：</span>
          <span class="detail-value">{{ currentLog.user }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">模块：</span>
          <span class="detail-value">{{ currentLog.module }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">IP地址：</span>
          <span class="detail-value">{{ currentLog.ip }}</span>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">操作内容：</span>
          <div class="detail-value message">{{ currentLog.message }}</div>
        </div>
        <div v-if="currentLog.stackTrace" class="detail-item full-width">
          <span class="detail-label">堆栈信息：</span>
          <pre class="detail-value stack-trace">{{ currentLog.stackTrace }}</pre>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDetailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    
    <!-- 清空日志确认对话框 -->
    <el-dialog
      title="确认清空"
      :visible.sync="clearLogVisible"
      width="400px"
    >
      <div class="confirm-message">
        <i class="el-icon-warning"></i>
        <span>确定要清空所有日志记录吗？此操作不可恢复。</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearLogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmClearLogs">确定清空</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'LogRecords',
  
  data() {
    return {
      // 搜索表单
      searchForm: {
        logType: '',
        logLevel: '',
        timeRange: [],
        keyword: ''
      },
      
      // 表格数据
      tableData: [],
      loading: false,
      
      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 日志详情
      logDetailVisible: false,
      currentLog: null,
      
      // 清空日志确认
      clearLogVisible: false
    }
  },
  
  created() {
    this.fetchLogs()
  },
  
  methods: {
    // 获取日志数据
    fetchLogs() {
      this.loading = true
      
      // 模拟API调用获取日志数据
      setTimeout(() => {
        // 模拟完整数据
        const allMockData = this.generateAllMockLogs()
        
        // 根据搜索条件筛选
        let filteredData = [...allMockData]
        
        if (this.searchForm.logType) {
          filteredData = filteredData.filter(item => item.type === this.searchForm.logType)
        }
        
        if (this.searchForm.logLevel) {
          filteredData = filteredData.filter(item => item.level === this.searchForm.logLevel)
        }
        
        if (this.searchForm.timeRange && this.searchForm.timeRange.length === 2) {
          filteredData = filteredData.filter(item => {
            const itemDate = item.timestamp.split(' ')[0]
            return itemDate >= this.searchForm.timeRange[0] && itemDate <= this.searchForm.timeRange[1]
          })
        }
        
        if (this.searchForm.keyword) {
          const keyword = this.searchForm.keyword.toLowerCase()
          filteredData = filteredData.filter(item => 
            item.message.toLowerCase().includes(keyword) ||
            item.module.toLowerCase().includes(keyword) ||
            item.user.toLowerCase().includes(keyword)
          )
        }
        
        // 设置总数
        this.pagination.total = filteredData.length
        
        // 根据当前页码和每页数量过滤数据
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize
        const endIndex = startIndex + this.pagination.pageSize
        
        // 截取当前页数据
        this.tableData = filteredData.slice(startIndex, endIndex)
        
        this.loading = false
      }, 500)
    },
    
    // 生成模拟日志数据 - 当前页
    generateMockLogs() {
      const logTypes = ['操作', '系统', '错误', '告警']
      const logLevels = ['信息', '警告', '错误', '严重']
      const modules = ['用户管理', '设备管理', '系统设置', '视频监控', '模型管理']
      const users = ['admin', 'operator', 'system']
      
      return Array.from({ length: 10 }, (_, i) => {
        const type = logTypes[Math.floor(Math.random() * logTypes.length)]
        const level = logLevels[Math.floor(Math.random() * logLevels.length)]
        const date = new Date()
        date.setHours(date.getHours() - Math.floor(Math.random() * 24))
        
        return {
          id: 1000 + i,
          timestamp: this.formatDate(date),
          type,
          level,
          user: users[Math.floor(Math.random() * users.length)],
          module: modules[Math.floor(Math.random() * modules.length)],
          message: this.getRandomMessage(type),
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          stackTrace: level === '错误' || level === '严重' ? this.getRandomStackTrace() : null
        }
      })
    },
    
    // 生成所有模拟日志数据 - 用于分页
    generateAllMockLogs() {
      const logTypes = ['操作', '系统', '错误', '告警']
      const logLevels = ['信息', '警告', '错误', '严重']
      const modules = ['用户管理', '设备管理', '系统设置', '视频监控', '模型管理']
      const users = ['admin', 'operator', 'system']
      
      // 生成200条模拟数据
      return Array.from({ length: 200 }, (_, i) => {
        const type = logTypes[Math.floor(Math.random() * logTypes.length)]
        const level = logLevels[Math.floor(Math.random() * logLevels.length)]
        const date = new Date()
        
        // 生成不同时间的日志
        date.setHours(date.getHours() - Math.floor(Math.random() * 72)) // 近3天内
        date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 60))
        
        return {
          id: 1000 + i,
          timestamp: this.formatDate(date),
          type,
          level,
          user: users[Math.floor(Math.random() * users.length)],
          module: modules[Math.floor(Math.random() * modules.length)],
          message: this.getRandomMessage(type),
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          stackTrace: level === '错误' || level === '严重' ? this.getRandomStackTrace() : null
        }
      })
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      const second = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },
    
    // 获取随机日志信息
    getRandomMessage(type) {
      const messages = {
        '操作': [
          '用户登录系统',
          '修改设备配置',
          '添加新用户',
          '删除视频文件',
          '更新系统设置'
        ],
        '系统': [
          '系统启动',
          '数据库备份完成',
          '服务重启',
          '系统资源检查',
          '缓存清理完成'
        ],
        '错误': [
          '数据库连接失败',
          'API请求超时',
          '文件上传错误',
          '服务不可用',
          '权限验证失败'
        ],
        '告警': [
          '磁盘空间不足',
          'CPU使用率过高',
          '内存占用过大',
          '连接尝试次数过多',
          '未授权的访问尝试'
        ]
      }
      
      const typeMessages = messages[type] || messages['系统']
      return typeMessages[Math.floor(Math.random() * typeMessages.length)]
    },
    
    // 获取随机堆栈信息
    getRandomStackTrace() {
      return `Error: Something went wrong
  at processRequest (server.js:42:15)
  at async handleAPIRequest (api.js:27:12)
  at async processAPIRequest (controller.js:125:23)`
    },
    
    // 搜索日志
    searchLogs() {
      this.pagination.currentPage = 1
      this.fetchLogs()
    },
    
    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        logType: '',
        logLevel: '',
        timeRange: [],
        keyword: ''
      }
      this.pagination.currentPage = 1
      this.fetchLogs()
    },
    
    // 处理每页数量变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchLogs()
    },
    
    // 处理页码变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchLogs()
    },
    
    // 查看日志详情
    viewLogDetail(log) {
      this.currentLog = log
      this.logDetailVisible = true
    },
    
    // 导出日志
    exportLogs() {
      this.loading = true
      
      // 获取筛选后的所有数据
      const allMockData = this.generateAllMockLogs()
      let dataToExport = [...allMockData]
      
      // 应用当前筛选条件
      if (this.searchForm.logType) {
        dataToExport = dataToExport.filter(item => item.type === this.searchForm.logType)
      }
      
      if (this.searchForm.logLevel) {
        dataToExport = dataToExport.filter(item => item.level === this.searchForm.logLevel)
      }
      
      if (this.searchForm.timeRange && this.searchForm.timeRange.length === 2) {
        dataToExport = dataToExport.filter(item => {
          const itemDate = item.timestamp.split(' ')[0]
          return itemDate >= this.searchForm.timeRange[0] && itemDate <= this.searchForm.timeRange[1]
        })
      }
      
      if (this.searchForm.keyword) {
        const keyword = this.searchForm.keyword.toLowerCase()
        dataToExport = dataToExport.filter(item => 
          item.message.toLowerCase().includes(keyword) ||
          item.module.toLowerCase().includes(keyword) ||
          item.user.toLowerCase().includes(keyword)
        )
      }
      
      // 设置CSV表头
      let csvContent = 'ID,时间,日志类型,级别,用户,模块,日志内容,IP地址\n'
      
      // 添加数据行
      dataToExport.forEach(item => {
        // 处理CSV中的特殊字符，确保内容中的逗号不会破坏CSV格式
        const message = item.message.replace(/"/g, '""')
        
        csvContent += `${item.id},"${item.timestamp}","${item.type}","${item.level}","${item.user}","${item.module}","${message}","${item.ip}"\n`
      })
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      // 设置文件名，使用当前日期
      const now = new Date()
      const fileName = `系统日志_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`
      
      // 设置下载链接属性
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      
      // 添加到DOM并触发点击
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      this.loading = false
      
      this.$message({
        message: '日志导出成功',
        type: 'success'
      })
    },
    
    // 清空日志
    clearLogs() {
      this.clearLogVisible = true
    },
    
    // 确认清空日志
    confirmClearLogs() {
      this.clearLogVisible = false
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.tableData = []
        this.pagination.total = 0
        this.loading = false
        
        this.$message({
          message: '日志记录已成功清空',
          type: 'success'
        })
      }, 800)
    },
    
    // 获取日志类型对应的标签类型
    getLogTypeTag(type) {
      const typeMap = {
        '操作': 'success',
        '系统': 'info',
        '错误': 'danger',
        '告警': 'warning'
      }
      return typeMap[type] || 'info'
    },
    
    // 获取日志级别对应的标签类型
    getLevelTag(level) {
      const levelMap = {
        '信息': 'info',
        '警告': 'warning',
        '错误': 'danger',
        '严重': 'danger'
      }
      return levelMap[level] || 'info'
    }
  }
}
</script>

<style scoped>
/* 整体背景 */
.log-records-container {
  padding: 20px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 100px);
}

/* 主卡片样式 */
.table-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  margin-top: 0;
  position: relative;
  overflow: hidden;
}

/* 搜索区卡片 */
.filter-section {
  margin-bottom: 20px;
  padding: 18px 24px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.05);
}

/* 搜索表单美化 */
.filter-section .el-form-item {
  margin-bottom: 0;
}
.filter-section .el-form-item__label {
  color: #303133;
  font-weight: 500;
}
.filter-section >>> .el-input__inner,
.filter-section >>> .el-select .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fff;
}
.filter-section >>> .el-input__inner:hover,
.filter-section >>> .el-select .el-input__inner:hover {
  border-color: #3b82f6;
}
.filter-section >>> .el-input__inner:focus,
.filter-section >>> .el-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 搜索按钮 */
.filter-section >>> .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.filter-section >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}
.filter-section >>> .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.filter-section >>> .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

/* 操作按钮区 */
.table-operations {
  padding: 18px 24px 18px 24px;
  text-align: right;
  border-bottom: none;
}
.table-operations >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  margin-right: 8px;
  transition: all 0.3s ease;
}
.table-operations >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
/* 清空日志按钮与重置按钮保持一致的样式 */
.table-operations >>> .el-button--danger {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
}
.table-operations >>> .el-button--danger:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

/* 表格样式 */
.custom-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
.custom-table >>> .el-table__cell {
  border-right: none;
}
.custom-table >>> .el-table::before {
  height: 0;
}
.custom-table >>> .el-table__header-wrapper th {
  font-weight: bold;
  text-align: center;
  background: #f5f7fa !important;
  color: #303133 !important;
  border-bottom: 1px solid #ebeef5 !important;
}
.custom-table >>> .el-table__row td {
  text-align: center;
}
.custom-table >>> .el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}
.custom-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/* ===== 表格操作按钮样式 - 完全参照camera.css ===== */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
}

.view-detail-btn {
  padding: 2px 8px !important;
  font-size: 11px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  height: 24px !important;
  min-width: 50px !important;
}

.view-detail-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* ===== 标签样式 - 完全参照camera.css ===== */
/* 类型标签 - 灰底灰字 */
.log-records-container >>> .el-table .el-tag[type=""],
.log-records-container >>> .el-dialog .el-tag[type=""] {
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
}

/* 状态标签 - 科技感浅色 */
.log-records-container >>> .el-table .el-tag--success,
.log-records-container >>> .el-dialog .el-tag--success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
  color: #065f46 !important;
  border: 1px solid #a7f3d0 !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
}

.log-records-container >>> .el-table .el-tag--danger,
.log-records-container >>> .el-dialog .el-tag--danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%) !important;
  color: #991b1b !important;
  border: 1px solid #fca5a5 !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
}

.log-records-container >>> .el-table .el-tag--warning,
.log-records-container >>> .el-dialog .el-tag--warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%) !important;
  color: #92400e !important;
  border: 1px solid #fbbf24 !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
}

.log-records-container >>> .el-table .el-tag--info,
.log-records-container >>> .el-dialog .el-tag--info {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  color: #1e40af !important;
  border: 1px solid #93c5fd !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
}

/* 统一表格内所有标签样式 */
.log-records-container >>> .el-table .el-tag,
.log-records-container >>> .el-dialog .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
  transition: all 0.3s ease !important;
}

.log-records-container >>> .el-table .el-tag:hover,
.log-records-container >>> .el-dialog .el-tag:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* 分页器科技感蓝色样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  padding: 10px 0 20px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}
.pagination-container >>> .el-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pagination-container >>> .el-pagination .el-pager li {
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  margin: 0 3px;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
  position: relative;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}
.pagination-container >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.pagination-container >>> .el-pagination .el-pager li:hover {
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}
.pagination-container >>> .el-pagination button {
  min-width: 32px;
  height: 32px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  margin: 0 3px;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}
.pagination-container >>> .el-pagination button:hover {
  border-color: #3b82f6;
  color: #1e40af;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

/* ===== 弹框样式 - 完全参照camera.css ===== */
.log-records-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.log-records-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.log-records-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.log-records-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.log-records-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.log-records-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.log-records-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.log-records-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.log-records-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.log-records-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.log-records-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.log-records-container >>> .el-dialog .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.log-records-container >>> .el-dialog .el-button--danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 日志详情内容美化 */
.log-detail {
  display: flex;
  flex-wrap: wrap;
}
.detail-item {
  width: 50%;
  margin-bottom: 15px;
  display: flex;
}
.detail-item.full-width {
  width: 100%;
}
.detail-label {
  font-weight: bold;
  width: 100px;
  color: #606266;
}
.detail-value {
  flex: 1;
}
.detail-value.message {
  white-space: pre-wrap;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 5px;
}
.detail-value.stack-trace {
  white-space: pre-wrap;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  color: #f56c6c;
  font-family: monospace;
  margin-top: 5px;
  overflow: auto;
  max-height: 200px;
}

.confirm-message {
  display: flex;
  align-items: center;
}
.confirm-message i {
  font-size: 20px;
  color: #e6a23c;
  margin-right: 10px;
}

/* 适配小屏幕 */
@media screen and (max-width: 768px) {
  .detail-item {
    width: 100%;
  }
  .table-container {
    border-radius: 8px;
    padding: 0 2px;
  }
  .filter-section {
    border-radius: 8px;
    padding: 12px 8px;
  }
  .pagination-container {
    border-radius: 8px;
    padding: 8px 2px;
  }
  .el-dialog {
    border-radius: 8px;
  }
}

/* ===== 系统级弹框样式 (Alert/Confirm/Prompt) ===== */
/* MessageBox 弹框整体样式 */
.log-records-container >>> .el-message-box {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(59, 130, 246, 0.2) !important;
}

/* MessageBox 头部样式 */
.log-records-container >>> .el-message-box__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

/* MessageBox 标题样式 */
.log-records-container >>> .el-message-box__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
  font-size: 16px !important;
}

/* MessageBox 关闭按钮 */
.log-records-container >>> .el-message-box__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.log-records-container >>> .el-message-box__close:hover {
  color: #3b82f6 !important;
}

/* MessageBox 主体内容样式 */
.log-records-container >>> .el-message-box__content {
  padding: 20px !important;
  background: #ffffff !important;
}

/* MessageBox 消息文本样式 */
.log-records-container >>> .el-message-box__message {
  color: #374151 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

/* MessageBox 图标样式 */
.log-records-container >>> .el-message-box__status {
  font-size: 20px !important;
}

.log-records-container >>> .el-message-box__status.el-icon-warning {
  color: #f59e0b !important;
}

.log-records-container >>> .el-message-box__status.el-icon-info {
  color: #3b82f6 !important;
}

.log-records-container >>> .el-message-box__status.el-icon-success {
  color: #10b981 !important;
}

.log-records-container >>> .el-message-box__status.el-icon-error {
  color: #ef4444 !important;
}

/* MessageBox 底部按钮区域 */
.log-records-container >>> .el-message-box__btns {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* MessageBox 按钮样式 */
.log-records-container >>> .el-message-box__btns .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

.log-records-container >>> .el-message-box__btns .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.log-records-container >>> .el-message-box__btns .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
  margin-right: 10px !important;
}

.log-records-container >>> .el-message-box__btns .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 危险操作按钮样式 (删除确认等) */
.log-records-container >>> .el-message-box__btns .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

.log-records-container >>> .el-message-box__btns .el-button--danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4) !important;
  transform: translateY(-1px) !important;
}
</style>
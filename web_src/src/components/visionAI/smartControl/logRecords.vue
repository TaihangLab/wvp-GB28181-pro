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
        <el-button type="primary" icon="el-icon-download" @click="exportLogs">导出日志</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="clearLogs">清空日志</el-button>
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
              size="small"
            >
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100" align="center">
          <template slot-scope="scope">
            <el-tag 
              :type="getLevelTag(scope.row.level)"
              :class="{'critical-level': scope.row.level === '严重'}"
              size="small"
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
            <el-button type="text" @click="viewLogDetail(scope.row)">详情</el-button>
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
            <el-tag :type="getLogTypeTag(currentLog.type)" size="small">{{ currentLog.type }}</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">级别：</span>
          <span class="detail-value">
            <el-tag :type="getLevelTag(currentLog.level)" :class="{'critical-level': currentLog.level === '严重'}" size="small">{{ currentLog.level }}</el-tag>
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
        '严重': '' // 使用自定义颜色
      }
      return levelMap[level] || 'info'
    }
  }
}
</script>

<style scoped>
.log-records-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-operations {
  padding: 15px;
  text-align: right;
  border-bottom: 1px solid #ebeef5;
}

.pagination-container {
  padding: 15px;
  text-align: right;
}

/* 自定义表格样式 */
.custom-table >>> .el-table__cell {
  border-right: none;
}

.custom-table >>> .el-table::before {
  height: 0;
}

.custom-table >>> .el-table__header-wrapper th {
  font-weight: bold;
  text-align: center;
}

.custom-table >>> .el-table__row td {
  text-align: center;
}

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
}

/* 自定义严重级别标签样式 */
.critical-level {
  background-color: #5d0404 !important;
  border-color: #5d0404 !important;
  color: #fff !important;
  font-weight: bold;
}
</style>
<template>
  <div class="log-records-container">
    <h2 class="page-title">日志记录</h2>
    
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="日志类型">
          <el-select v-model="searchForm.logType" placeholder="选择日志类型" clearable>
            <el-option label="操作日志" value="operation"></el-option>
            <el-option label="系统日志" value="system"></el-option>
            <el-option label="错误日志" value="error"></el-option>
            <el-option label="告警日志" value="warning"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日志级别">
          <el-select v-model="searchForm.logLevel" placeholder="选择日志级别" clearable>
            <el-option label="INFO" value="info"></el-option>
            <el-option label="WARNING" value="warning"></el-option>
            <el-option label="ERROR" value="error"></el-option>
            <el-option label="CRITICAL" value="critical"></el-option>
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
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="timestamp" label="时间" width="160"></el-table-column>
        <el-table-column prop="type" label="日志类型" width="120">
          <template slot-scope="scope">
            <el-tag 
              :type="getLogTypeTag(scope.row.type)"
              size="small"
            >
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="getLevelTag(scope.row.level)"
              size="small"
            >
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="用户" width="120"></el-table-column>
        <el-table-column prop="module" label="模块" width="120"></el-table-column>
        <el-table-column prop="message" label="日志内容"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="130"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
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
            <el-tag :type="getLevelTag(currentLog.level)" size="small">{{ currentLog.level }}</el-tag>
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
        // 模拟数据
        const mockData = this.generateMockLogs()
        this.tableData = mockData
        this.pagination.total = 200 // 模拟总数
        this.loading = false
      }, 800)
    },
    
    // 生成模拟日志数据
    generateMockLogs() {
      const logTypes = ['operation', 'system', 'error', 'warning']
      const logLevels = ['INFO', 'WARNING', 'ERROR', 'CRITICAL']
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
          stackTrace: level === 'ERROR' || level === 'CRITICAL' ? this.getRandomStackTrace() : null
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
        operation: [
          '用户登录系统',
          '修改设备配置',
          '添加新用户',
          '删除视频文件',
          '更新系统设置'
        ],
        system: [
          '系统启动',
          '数据库备份完成',
          '服务重启',
          '系统资源检查',
          '缓存清理完成'
        ],
        error: [
          '数据库连接失败',
          'API请求超时',
          '文件上传错误',
          '服务不可用',
          '权限验证失败'
        ],
        warning: [
          '磁盘空间不足',
          'CPU使用率过高',
          '内存占用过大',
          '连接尝试次数过多',
          '未授权的访问尝试'
        ]
      }
      
      const typeMessages = messages[type] || messages.system
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
      this.$message({
        message: '日志导出功能已触发，文件将开始下载',
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
        'operation': 'success',
        'system': 'info',
        'error': 'danger',
        'warning': 'warning'
      }
      return typeMap[type] || 'info'
    },
    
    // 获取日志级别对应的标签类型
    getLevelTag(level) {
      const levelMap = {
        'INFO': 'info',
        'WARNING': 'warning',
        'ERROR': 'danger',
        'CRITICAL': 'danger'
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
</style>
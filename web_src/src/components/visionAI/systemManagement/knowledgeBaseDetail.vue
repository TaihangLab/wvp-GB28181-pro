<template>
  <div class="knowledge-detail-container">
    <div class="content-layout">
      <!-- 左侧菜单 -->
      <div class="left-panel">
        <div class="menu-container">
                  <div class="knowledge-info">
          <div class="knowledge-header">
            <el-button type="text" icon="el-icon-arrow-left" @click="goBack" class="back-button"></el-button>
            <div class="knowledge-name">{{ knowledgeName }}</div>
          </div>
          <div class="knowledge-id">ID: {{ knowledgeId }}</div>
        </div>
          
          <div class="menu-list">
            <div 
              v-for="item in menuItems" 
              :key="item.key"
              class="menu-item"
              :class="{ active: activeMenu === item.key }"
              @click="switchMenu(item.key)">
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-panel">
        <!-- 文档列表页面 -->
        <div v-if="activeMenu === 'documents'" class="documents-section">
          <!-- 操作栏 -->
          <div class="toolbar">
            <div class="left-actions">
              <el-button type="primary" icon="el-icon-upload" size="small" @click="importDocument">
                导入新文档
              </el-button>
              <el-button icon="el-icon-refresh" size="small" @click="refreshDocuments">
                刷新
              </el-button>
            </div>
            
            <div class="right-info">
              <div class="stats">
                <span class="stat-item">
                  <span class="label">合计:</span>
                  <span class="value">{{ totalDocuments }}</span>
                </span>
                <span class="stat-item">
                  <span class="label">完成率:</span>
                  <span class="value">{{ completionRate }}%</span>
                </span>
                <span class="stat-item">
                  <span class="label">已完成:</span>
                  <span class="value success">{{ completedCount }}</span>
                </span>
                <span class="stat-item">
                  <span class="label">失败:</span>
                  <span class="value error">{{ failedCount }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 文档表格 -->
          <div class="table-container">
            <el-table
              :data="documentData"
              v-loading="loading"
              :border="false"
              class="custom-table"
              style="width: 100%"
              table-layout="fixed"
              size="medium">
              
              <el-table-column prop="fileName" label="文档名称" width="150" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span class="file-name">{{ scope.row.fileName }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="source" label="文档来源" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag size="mini" type="info">{{ scope.row.source }}</el-tag>
                </template>
              </el-table-column>
              
              <el-table-column prop="characterCount" label="字符数" width="80" align="center"></el-table-column>
              
              <el-table-column prop="chunkCount" label="切片数量" width="90" align="center"></el-table-column>
              
              <el-table-column prop="uploadTime" label="上传时间" width="150" align="center">
                <template slot-scope="scope">
                  <span style="font-size: 12px;">{{ scope.row.uploadTime }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="status" label="文档状态" width="90" align="center">
                <template slot-scope="scope">
                  <el-tag 
                    size="mini" 
                    :type="getStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column prop="fileSize" label="文档大小" width="100" align="center">
                <template slot-scope="scope">
                  <span style="font-size: 12px;">{{ scope.row.fileSize }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="logs" label="执行日志" width="120" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span class="log-text">{{ scope.row.logs }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="130" align="center">
                <template slot-scope="scope">
                  <div class="operation-buttons">
                    <el-button type="text" class="view-btn" @click="viewDocument(scope.row)" title="查看">
                      <i class="el-icon-view"></i>
                    </el-button>
                    <el-button type="text" class="download-btn" @click="downloadDocument(scope.row)" title="下载">
                      <i class="el-icon-download"></i>
                    </el-button>
                    <el-button type="text" class="refresh-btn" @click="refreshDocument(scope.row)" title="刷新">
                      <i class="el-icon-refresh"></i>
                    </el-button>
                    <el-button type="text" class="delete-btn" @click="deleteDocument(scope.row)" title="删除">
                      <i class="el-icon-delete"></i>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalDocuments">
              </el-pagination>
            </div>
          </div>
        </div>

        <!-- 其他菜单页面的占位 -->
        <div v-else class="placeholder-section">
          <el-empty :description="`${getCurrentMenuLabel()}功能开发中`"></el-empty>
        </div>
      </div>
    </div>
    
    <!-- 执行日志弹框 -->
    <el-dialog
      title="执行日志"
      :visible.sync="logDialogVisible"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="log-dialog">
      
      <div class="log-content">
        <pre class="log-text-content">{{ currentLogContent }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBaseDetail',
  data() {
    return {
      // 路由参数
      knowledgeId: '',
      knowledgeName: '',
      
      // 菜单相关
      activeMenu: 'documents',
      menuItems: [
        { key: 'documents', label: '文档列表', icon: 'el-icon-document' },
        { key: 'import', label: '数据导入', icon: 'el-icon-upload2' },
        { key: 'search', label: '向量搜索', icon: 'el-icon-search' },
        { key: 'settings', label: '设置', icon: 'el-icon-setting' }
      ],
      
      // 表格数据
      documentData: [],
      loading: false,
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      
      // 统计数据
      totalDocuments: 419,
      completionRate: 100,
      completedCount: 0,
      failedCount: 0,
      
      // 日志弹框相关
      logDialogVisible: false,
      currentLogContent: '',
      
      // 示例数据
      mockDocuments: [
        {
          id: 1,
          fileName: 'PHSQ11.docx',
          source: '文档上传',
          characterCount: 867,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:44:39',
          status: '已完成',
          fileSize: '128.99 KB',
          logs: '===================='
        },
        {
          id: 2,
          fileName: 'PHSQ07.docx',
          source: '文档上传',
          characterCount: 427,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '107.40 KB',
          logs: '===================='
        },
        {
          id: 3,
          fileName: 'PHSQ13.docx',
          source: '文档上传',
          characterCount: 835,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '131.71 KB',
          logs: '===================='
        },
        {
          id: 4,
          fileName: 'PHSQ05.docx',
          source: '文档上传',
          characterCount: 386,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '101.80 KB',
          logs: '===================='
        },
        {
          id: 5,
          fileName: 'PHSQ11.docx',
          source: '文档上传',
          characterCount: 867,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '128.99 KB',
          logs: '===================='
        },
        {
          id: 6,
          fileName: 'PHSQ08.docx',
          source: '文档上传',
          characterCount: 324,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '106.17 KB',
          logs: '===================='
        },
        {
          id: 7,
          fileName: 'PHSQ03.docx',
          source: '文档上传',
          characterCount: 666,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '117.01 KB',
          logs: '===================='
        },
        {
          id: 8,
          fileName: 'PHSQ02.docx',
          source: '文档上传',
          characterCount: 416,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '104.59 KB',
          logs: '===================='
        },
        {
          id: 9,
          fileName: 'PHSQ10.docx',
          source: '文档上传',
          characterCount: 376,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '101.71 KB',
          logs: '===================='
        },
        {
          id: 10,
          fileName: 'PHSQ06.docx',
          source: '文档上传',
          characterCount: 457,
          chunkCount: 1,
          uploadTime: '2025-07-15 17:37:40',
          status: '已完成',
          fileSize: '101.55 KB',
          logs: '===================='
        }
      ]
    }
  },
  
  created() {
    // 获取路由参数
    this.knowledgeId = this.$route.query.id || '1'
    this.knowledgeName = this.$route.query.name || '综改区助手'
    
    // 加载数据
    this.loadDocuments()
  },
  
  methods: {
    // 切换菜单
    switchMenu(menuKey) {
      this.activeMenu = menuKey
      if (menuKey === 'documents') {
        this.loadDocuments()
      }
    },
    
    // 获取当前菜单标签
    getCurrentMenuLabel() {
      const item = this.menuItems.find(item => item.key === this.activeMenu)
      return item ? item.label : ''
    },
    
    // 加载文档数据
    async loadDocuments() {
      try {
        this.loading = true
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        this.documentData = this.mockDocuments.slice(
          (this.currentPage - 1) * this.pageSize,
          this.currentPage * this.pageSize
        )
        
        // 计算统计数据
        this.completedCount = this.mockDocuments.filter(doc => doc.status === '已完成').length
        this.failedCount = this.mockDocuments.filter(doc => doc.status === '失败').length
        this.completionRate = Math.round((this.completedCount / this.totalDocuments) * 100)
        
      } catch (error) {
        console.error('加载文档列表失败:', error)
        this.$message.error('加载文档列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 获取状态标签类型
    getStatusType(status) {
      switch (status) {
        case '已完成': return 'success'
        case '处理中': return 'warning'
        case '失败': return 'danger'
        default: return 'info'
      }
    },
    
    // 文档操作方法
    importDocument() {
      this.$message.info('导入新文档功能开发中...')
    },
    
    refreshDocuments() {
      this.loadDocuments()
      this.$message.success('文档列表已刷新')
    },
    
    viewDocument(row) {
      // 生成日志内容
      this.currentLogContent = this.generateLogContent(row)
      this.logDialogVisible = true
    },
    
    // 生成日志内容
    generateLogContent(row) {
      const now = new Date()
      const formatTime = (date) => {
        return date.toISOString().replace('T', 'T').slice(0, -5) + '.' + Math.floor(Math.random() * 1000000000)
      }
      
      return `===============================================================
                    文档向量化处理开始
===============================================================
文档ID: e00259a468515${Math.random().toString(36).substring(2)}
文档名称: ${row.fileName} 开始实行, 对于老企业的出资时间需要怎样变更.docx
知识库ID: kb_663a7df461a14521a0259abfb2f1ab95
开始时间: ${formatTime(now)}
---------------------------------------------------------------
---------------------------------------------------------------
                    文档向量化处理成功
---------------------------------------------------------------
文档ID: e00259a468515${Math.random().toString(36).substring(2)}
文档名称: ${row.fileName} 开始实行, 对于老企业的出资时间需要怎样变更.docx
字符数量: ${row.characterCount}
切片数量: ${row.chunkCount}
成功时间: ${formatTime(new Date(now.getTime() + 1000))}
===============================================================`
    },
    
    downloadDocument(row) {
      this.$message.info(`下载文档: ${row.fileName}`)
    },
    
    refreshDocument(row) {
      this.$message.info(`重新处理文档: ${row.fileName}`)
    },
    
    deleteDocument(row) {
      this.$confirm(`确认删除文档 "${row.fileName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        this.loadDocuments()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 分页方法
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadDocuments()
    },
    
    handleCurrentChange(page) {
      this.currentPage = page
      this.loadDocuments()
    },
    
    // 返回知识库列表页
    goBack() {
      this.$router.push('/systemManage/knowledgeBase')
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.knowledge-detail-container {
  padding: 20px 20px 5px 20px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 90px);
  height: calc(100vh - 90px);
  overflow: hidden;
}

/* 主要布局 */
.content-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 100px);
  min-height: 600px;
}

/* 左侧面板 */
.left-panel {
  width: 200px;
  min-width: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.menu-container {
  padding: 20px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.knowledge-info {
  padding: 0 20px 20px 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.knowledge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.back-button {
  color: #3b82f6 !important;
  font-size: 16px !important;
  padding: 4px !important;
  margin: 0 !important;
  transition: all 0.3s ease !important;
}

.back-button:hover {
  color: #1d4ed8 !important;
  background: rgba(59, 130, 246, 0.1) !important;
  transform: translateX(-2px) !important;
}

.knowledge-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  flex: 1;
}

.knowledge-id {
  font-size: 12px;
  color: #909399;
}

.menu-list {
  flex: 1;
  padding: 0 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
}

.menu-item i {
  margin-right: 8px;
  font-size: 16px;
}

.menu-item:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
}

.menu-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  font-weight: 500;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 文档页面 */
.documents-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7fa;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.05);
  margin-bottom: 12px;
  flex-shrink: 0;
}

.left-actions {
  display: flex;
  gap: 8px;
}

.toolbar >>> .el-button {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.toolbar >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  color: #fff;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.toolbar >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.toolbar >>> .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

.toolbar >>> .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.right-info {
  display: flex;
  align-items: center;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.stat-item .label {
  color: #606266;
  font-weight: 500;
}

.stat-item .value {
  color: #303133;
  font-weight: 600;
}

.stat-item .value.success {
  color: #67c23a;
}

.stat-item .value.error {
  color: #f56c6c;
}

/* 表格容器 */
.table-container {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  height: 100%;
  width: 100%;
  max-width: 100%;
}

.table-container .el-table {
  width: 100% !important;
  max-width: 100% !important;
  table-layout: fixed !important;
}

/* 表格样式 */
.custom-table {
  flex: 1;
  overflow: hidden;
  width: 100% !important;
  max-width: 100% !important;
}

.custom-table >>> .el-table {
  width: 100% !important;
  table-layout: fixed !important;
  max-width: 100% !important;
}

.custom-table >>> .el-table__header {
  width: 100% !important;
}

.custom-table >>> .el-table__body {
  width: 100% !important;
}

.custom-table >>> .el-table__body-wrapper {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100% !important;
  max-width: 100% !important;
}

.custom-table >>> .el-table__header-wrapper {
  overflow-x: hidden;
  width: 100% !important;
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
  height: 50px !important;
  padding: 8px 4px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  border-right: none !important;
}

.custom-table >>> .el-table__row td {
  text-align: center;
  vertical-align: middle;
  height: 50px !important;
  padding: 8px 4px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  border-right: none !important;
}

.custom-table >>> .el-table__cell {
  padding: 0 !important;
  overflow: hidden !important;
}

.custom-table >>> .cell {
  padding: 0 6px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.custom-table >>> .el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}

.file-name {
  color: #3b82f6;
  font-weight: 500;
}

.log-text {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

/* 操作按钮 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.operation-buttons .el-button {
  padding: 2px !important;
  font-size: 13px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  width: 26px !important;
  height: 26px !important;
  min-width: 26px !important;
  margin: 0 !important;
}

.operation-buttons .el-button:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #ebeef5;
  margin-top: auto;
  flex-shrink: 0;
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
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.pagination-container >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
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

/* 占位页面 */
.placeholder-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
}

/* 标签样式 */
.knowledge-detail-container >>> .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
}

.knowledge-detail-container >>> .el-tag--success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
  color: #065f46 !important;
  border: 1px solid #a7f3d0 !important;
}

.knowledge-detail-container >>> .el-tag--info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  color: #0c4a6e !important;
  border: 1px solid #7dd3fc !important;
}

  /* 执行日志弹框样式 - 与 knowledgeBase.vue 编辑弹框保持一致 */
  .knowledge-detail-container >>> .el-dialog.log-dialog {
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
  }

  .knowledge-detail-container >>> .el-dialog.log-dialog .el-dialog__header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
    padding: 16px 20px !important;
  }

  .knowledge-detail-container >>> .el-dialog.log-dialog .el-dialog__title {
    color: #1f2937 !important;
    font-weight: 600 !important;
  }

  .knowledge-detail-container >>> .el-dialog.log-dialog .el-dialog__close {
    color: #6b7280 !important;
    transition: color 0.3s ease !important;
  }

  .knowledge-detail-container >>> .el-dialog.log-dialog .el-dialog__close:hover {
    color: #3b82f6 !important;
  }

  .knowledge-detail-container >>> .el-dialog.log-dialog .el-dialog__body {
    padding: 20px !important;
    background: #ffffff !important;
    max-height: 500px !important;
    overflow-y: auto !important;
  }

  .log-content {
    padding: 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .log-text-content {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    color: #374151 !important;
    background: #ffffff !important;
    padding: 20px !important;
    margin: 0 !important;
    border: none !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-x: auto !important;
  }

  /* 响应式设计 */
  @media screen and (max-width: 1200px) {
  .content-layout {
    flex-direction: column;
    height: auto;
    min-height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: 100%;
    height: auto;
    margin-bottom: 20px;
  }

  .menu-container {
    flex-direction: row;
    padding: 16px 20px;
  }

  .knowledge-info {
    border-bottom: none;
    border-right: 1px solid #ebeef5;
    margin-bottom: 0;
    margin-right: 20px;
    padding-right: 20px;
  }

  .menu-list {
    display: flex;
    gap: 8px;
    padding: 0;
  }

  .menu-item {
    margin: 0;
  }
}

@media screen and (max-width: 768px) {
  .knowledge-detail-container {
    padding: 12px;
  }

  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 12px 16px;
  }

  .stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .operation-buttons {
    gap: 2px;
  }

  .operation-buttons .el-button {
    width: 24px !important;
    height: 24px !important;
    font-size: 12px !important;
  }
}
</style> 
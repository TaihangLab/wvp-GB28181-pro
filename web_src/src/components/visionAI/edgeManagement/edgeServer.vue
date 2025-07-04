<template>
  <div class="edge-server-container">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddServer">
        <i class="el-icon-plus"></i>注册边缘服务器
      </el-button>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入边缘服务器名称关键字"
          clearable
          @input="loadTableData"
        >
          <i slot="suffix" class="el-icon-search"></i>
        </el-input>
      </div>
    </div>
  
    <!-- 边缘服务器列表 -->
    <el-table :data="tableData" :border="false" class="custom-table" style="width: 100%; text-align: center;">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="边缘服务器名称" min-width="180" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ipAddress" label="IP地址" width="150" align="center" />
      <el-table-column prop="domain" label="域名" min-width="200" align="center" />
      <el-table-column prop="visionSkills" label="视觉技能" min-width="150" align="center">
        <template slot-scope="{ row }">
          {{ row.visionSkills.join(', ') || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="dataCollectionRules" label="数据采集规则" min-width="150" align="center">
        <template slot-scope="{ row }">
          {{ row.dataCollectionRules || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="authorizedGroups" label="授权组织" min-width="150" align="center">
        <template slot-scope="{ row }">
          {{ row.authorizedGroups.join(', ') || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="280" align="center">
        <template slot-scope="{ row }">
          <div class="operation-buttons">
            <el-button type="text" class="manage-btn" @click="handleManage(row)">管理</el-button>
            <el-button type="text" class="authorize-btn" @click="handleAuthorize(row)">授权组织</el-button>
            <el-button type="text" class="edit-btn" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" class="delete-btn" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 注册边缘服务器弹框 -->
    <el-dialog 
      :title="isEditing ? '编辑边缘服务器' : '注册边缘服务器'"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="resetForm"
    >
      <el-form label-width="120px">
        <el-form-item label="名称">
          <el-input v-model="newServer.name" placeholder="请输入边缘服务器名称"></el-input>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="newServer.ipAddress" placeholder="请输入边缘服务器IP地址"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newServer.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="域名">
          <el-input v-model="newServer.domain" placeholder="请输入域名"></el-input>
        </el-form-item>
        <el-form-item label="视觉技能">
          <el-input v-model="newServer.visionSkills" placeholder="请输入视觉技能，用逗号分隔"></el-input>
        </el-form-item>
        <el-form-item label="数据采集规则">
          <el-input v-model="newServer.dataCollectionRules" placeholder="请输入数据采集规则"></el-input>
        </el-form-item>
        <el-form-item label="授权组织">
          <el-input v-model="newServer.authorizedGroups" placeholder="请输入授权组织，用逗号分隔"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddServer">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EdgeServer',
  
  data() {
    return {
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 表格数据
      tableData: [],
      
      // 搜索关键词
      searchKeyword: '',
      
      // 弹框控制
      dialogVisible: false,
      isEditing: false,
      editingId: '',
      
      // 新服务器表单
      newServer: {
        name: '',
        ipAddress: '',
        status: 'online',
        domain: '',
        visionSkills: '',
        dataCollectionRules: '',
        authorizedGroups: ''
      },
      
      // 模拟数据
      allData: [
        { id: '1', name: '北京集团绿源化工厂', status: 'offline', ipAddress: '192.168.1.4', visionSkills: [], authorizedGroups: [] },
        { id: '2', name: '北京集团热电公司', status: 'online', ipAddress: '192.168.1.3', visionSkills: [], authorizedGroups: [] },
        { id: '3', name: '北京集团水泥厂', status: 'offline', ipAddress: '192.168.1.2', visionSkills: [], authorizedGroups: [] },
        { id: '4', name: '北京集团化工厂', status: 'online', ipAddress: '192.168.1.1', visionSkills: [], authorizedGroups: [] },
        { id: '5', name: '中南石化', status: 'offline', ipAddress: '127.0.0.2', visionSkills: [], authorizedGroups: [] },
        { id: '6', name: '大树石化', status: 'online', ipAddress: '127.0.0.1', visionSkills: [], authorizedGroups: [] },
        { id: '7', name: '宝山自来水厂', status: 'offline', ipAddress: '10.68.208.94', visionSkills: [], authorizedGroups: [] },
        { id: '8', name: '白云港污水处理厂', status: 'online', ipAddress: '10.68.208.94', visionSkills: [], authorizedGroups: [] },
        { id: '9', name: '石油污水处理厂', status: 'offline', ipAddress: '10.68.208.94', visionSkills: [], authorizedGroups: [] },
        { id: '10', name: '秦港污水处理厂', status: 'online', ipAddress: '10.31.76.16', visionSkills: [], authorizedGroups: [] }
      ]
    }
  },
  
  mounted() {
    this.loadTableData()
  },
  
  methods: {
    // 加载表格数据
    loadTableData() {
      const filteredData = this.allData.filter(server => server.name.includes(this.searchKeyword))
      this.total = filteredData.length
      const start = (this.currentPage - 1) * this.pageSize
      this.tableData = filteredData.slice(start, start + this.pageSize)
    },
    
    // 注册边缘服务器
    handleAddServer() {
      this.dialogVisible = true
    },
    
    // 确认注册
    confirmAddServer() {
      if (!this.newServer.name || !this.newServer.ipAddress) {
        this.$message({
          message: '请填写名称和IP地址',
          type: 'error'
        })
        return
      }
      
      const serverData = {
        name: this.newServer.name,
        ipAddress: this.newServer.ipAddress,
        status: this.newServer.status,
        domain: this.newServer.domain,
        visionSkills: this.newServer.visionSkills.split(',').map(skill => skill.trim()).filter(Boolean),
        dataCollectionRules: this.newServer.dataCollectionRules,
        authorizedGroups: this.newServer.authorizedGroups.split(',').map(group => group.trim()).filter(Boolean)
      }

      if (this.isEditing) {
        // 更新现有服务器
        const index = this.allData.findIndex(s => s.id === this.editingId)
        if (index !== -1) {
          this.allData[index] = { ...this.allData[index], ...serverData }
          this.$message({
            message: '边缘服务器更新成功！',
            type: 'success'
          })
        }
      } else {
        // 添加新服务器
        const newId = (this.allData.length + 1).toString()
        this.allData.push({ id: newId, ...serverData })
        this.$message({
          message: '边缘服务器注册成功！',
          type: 'success'
        })
      }

      this.loadTableData()
      this.dialogVisible = false
      this.resetForm()
    },
    
    // 管理功能
    handleManage(server) {
      this.$alert(`
        <div>
          <p>服务器名称：${server.name}</p>
          <p>IP地址：${server.ipAddress}</p>
          <p>状态：${server.status === 'online' ? '在线' : '离线'}</p>
          <p>域名：${server.domain || '未设置'}</p>
          <p>视觉技能：${server.visionSkills.join(', ') || '未设置'}</p>
          <p>数据采集规则：${server.dataCollectionRules || '未设置'}</p>
          <p>授权组织：${server.authorizedGroups.join(', ') || '未设置'}</p>
        </div>
      `, '管理', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      })
    },
    
    // 授权组织功能
    handleAuthorize(server) {
      this.$prompt('请输入要添加的授权组织（多个组织用逗号分隔）', '授权组织', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: server.authorizedGroups.join(', ')
      }).then(({ value }) => {
        const index = this.allData.findIndex(s => s.id === server.id)
        if (index !== -1) {
          this.allData[index].authorizedGroups = value.split(',').map(group => group.trim()).filter(Boolean)
          this.loadTableData()
          this.$message({
            message: '授权组织更新成功！',
            type: 'success'
          })
        }
      })
    },
    
    // 编辑功能
    handleEdit(server) {
      this.newServer = {
        name: server.name,
        ipAddress: server.ipAddress,
        status: server.status,
        domain: server.domain || '',
        visionSkills: server.visionSkills.join(', '),
        dataCollectionRules: server.dataCollectionRules || '',
        authorizedGroups: server.authorizedGroups.join(', ')
      }
      
      this.isEditing = true
      this.editingId = server.id
      this.dialogVisible = true
    },
    
    // 重置表单
    resetForm() {
      this.newServer = {
        name: '',
        ipAddress: '',
        status: 'online',
        domain: '',
        visionSkills: '',
        dataCollectionRules: '',
        authorizedGroups: ''
      }
      this.isEditing = false
      this.editingId = ''
    },
    
    // 删除功能
    handleDelete(server) {
      this.$confirm(
        `确定要删除边缘服务器 "${server.name}" 吗？此操作不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = this.allData.findIndex(s => s.id === server.id)
        if (index !== -1) {
          this.allData.splice(index, 1)
          this.loadTableData()
          this.$message({
            message: '删除成功！',
            type: 'success'
          })
        }
      })
    },
    
    // 刷新数据
    handleRefresh() {
      this.loadTableData()
    },
    
    // 处理页码变化
    handlePageChange(page) {
      this.currentPage = page
      this.loadTableData()
    },
    
    // 处理每页显示数量变化
    handlePageSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadTableData()
    }
  }
}
</script>

<style scoped>
/* 整体背景 */
.edge-server-container {
  padding: 20px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 100px);
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 18px 24px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.05);
}

/* 搜索框样式 */
.search-box {
  display: flex;
  gap: 10px;
}
.search-box .el-input {
  width: 300px;
}
.operation-bar >>> .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fff;
}
.operation-bar >>> .el-input__inner:hover {
  border-color: #3b82f6;
}
.operation-bar >>> .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 注册按钮样式 */
.operation-bar >>> .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.operation-bar >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

/* 表格样式 */
.custom-table {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  margin-top: 20px;
  overflow: hidden;
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
/* 确保固定列表头也使用相同的背景色 */
.custom-table >>> .el-table__fixed-right-header-wrapper th,
.custom-table >>> .el-table__fixed-header-wrapper th {
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

/* ===== 表格操作按钮样式 - 完全参照camera.css ===== */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
}

.manage-btn,
.authorize-btn,
.edit-btn,
.delete-btn {
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

.manage-btn:hover,
.authorize-btn:hover,
.edit-btn:hover,
.delete-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* ===== 标签样式 - 完全参照camera.css ===== */
/* 状态标签 - 科技感浅色 */
.edge-server-container >>> .el-table .el-tag--success,
.edge-server-container >>> .el-dialog .el-tag--success {
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

.edge-server-container >>> .el-table .el-tag--danger,
.edge-server-container >>> .el-dialog .el-tag--danger {
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

/* 统一标签样式 */
.edge-server-container >>> .el-table .el-tag,
.edge-server-container >>> .el-dialog .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
  transition: all 0.3s ease !important;
}

.edge-server-container >>> .el-table .el-tag:hover,
.edge-server-container >>> .el-dialog .el-tag:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* 分页器科技感蓝色样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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
.edge-server-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.edge-server-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.edge-server-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.edge-server-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.edge-server-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.edge-server-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.edge-server-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.edge-server-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.edge-server-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.edge-server-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.edge-server-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 输入框样式 */
.edge-server-container >>> .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.edge-server-container >>> .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.edge-server-container >>> .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* 选择器样式 */
.edge-server-container >>> .el-select .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.edge-server-container >>> .el-select .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.edge-server-container >>> .el-select .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* 表单标签样式 */
.edge-server-container >>> .el-form-item__label {
  color: #374151 !important;
  font-weight: 500 !important;
}

/* ===== 系统级弹框样式 (Alert/Confirm/Prompt) ===== */
/* MessageBox 弹框整体样式 */
.edge-server-container >>> .el-message-box {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(59, 130, 246, 0.2) !important;
}

/* MessageBox 头部样式 */
.edge-server-container >>> .el-message-box__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

/* MessageBox 标题样式 */
.edge-server-container >>> .el-message-box__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
  font-size: 16px !important;
}

/* MessageBox 关闭按钮 */
.edge-server-container >>> .el-message-box__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.edge-server-container >>> .el-message-box__close:hover {
  color: #3b82f6 !important;
}

/* MessageBox 主体内容样式 */
.edge-server-container >>> .el-message-box__content {
  padding: 20px !important;
  background: #ffffff !important;
}

/* MessageBox 消息文本样式 */
.edge-server-container >>> .el-message-box__message {
  color: #374151 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

/* MessageBox 图标样式 */
.edge-server-container >>> .el-message-box__status {
  font-size: 20px !important;
}

.edge-server-container >>> .el-message-box__status.el-icon-warning {
  color: #f59e0b !important;
}

.edge-server-container >>> .el-message-box__status.el-icon-info {
  color: #3b82f6 !important;
}

.edge-server-container >>> .el-message-box__status.el-icon-success {
  color: #10b981 !important;
}

.edge-server-container >>> .el-message-box__status.el-icon-error {
  color: #ef4444 !important;
}

/* MessageBox 输入框样式 (用于prompt) */
.edge-server-container >>> .el-message-box__input {
  padding-top: 15px !important;
}

.edge-server-container >>> .el-message-box__input .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  padding: 10px 12px !important;
}

.edge-server-container >>> .el-message-box__input .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.edge-server-container >>> .el-message-box__input .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* MessageBox 底部按钮区域 */
.edge-server-container >>> .el-message-box__btns {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* MessageBox 按钮样式 */
.edge-server-container >>> .el-message-box__btns .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

.edge-server-container >>> .el-message-box__btns .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.edge-server-container >>> .el-message-box__btns .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
  margin-right: 10px !important;
}

.edge-server-container >>> .el-message-box__btns .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 危险操作按钮样式 (删除确认等) */
.edge-server-container >>> .el-message-box__btns .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

.edge-server-container >>> .el-message-box__btns .el-button--danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 适配小屏幕 */
@media screen and (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    gap: 10px;
  }
  .search-box {
    width: 100%;
  }
  .search-box .el-input {
    width: 100%;
  }
  .custom-table {
    border-radius: 8px;
  }
  .pagination-container {
    border-radius: 8px;
    padding: 8px 2px;
  }
  .edge-server-container >>> .el-dialog {
    border-radius: 8px;
  }
}
</style>
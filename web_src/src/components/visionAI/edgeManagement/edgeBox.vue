<template>
  <div class="edge-box-container">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddBox">
        <i class="el-icon-plus"></i>添加边缘盒子
      </el-button>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入边缘盒子名称或序列号"
          clearable
          @input="handleSearch"
        >
          <i slot="suffix" class="el-icon-search"></i>
        </el-input>
      </div>
    </div>

    <!-- 边缘盒子列表 -->
    <el-table 
      :data="tableData" 
      :border="false"
      class="custom-table"
      style="width: 100%; margin-top: 20px;">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="name" label="盒子名称" min-width="150" align="center" />
      <el-table-column prop="serialNumber" label="序列号" min-width="150" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ipAddress" label="IP地址" min-width="150" align="center" />
      <el-table-column prop="location" label="安装位置" min-width="150" align="center" />
      <el-table-column prop="bindServer" label="绑定服务器" min-width="150" align="center" />
      <el-table-column prop="lastOnlineTime" label="最后在线时间" min-width="180" align="center" />
      <el-table-column label="操作" fixed="right" width="250" align="center">
        <template slot-scope="{ row }">
          <div class="operation-buttons">
            <el-button type="text" class="edit-btn" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" class="bind-btn" @click="handleBind(row)">绑定服务器</el-button>
            <el-button type="text" class="delete-btn" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑边缘盒子弹窗 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加边缘盒子' : '编辑边缘盒子'"
      :visible.sync="dialogVisible"
      width="50%"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" ref="boxForm" label-width="100px">
        <el-form-item label="盒子名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入盒子名称"></el-input>
        </el-form-item>
        <el-form-item label="序列号" prop="serialNumber">
          <el-input v-model="formData.serialNumber" placeholder="请输入序列号"></el-input>
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="formData.ipAddress" placeholder="请输入IP地址"></el-input>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 绑定服务器弹窗 -->
    <el-dialog
      title="绑定边缘服务器"
      :visible.sync="bindDialogVisible"
      width="40%"
    >
      <el-form :model="bindForm" label-width="100px">
        <el-form-item label="选择服务器">
          <el-select v-model="bindForm.serverId" placeholder="请选择边缘服务器" style="width: 100%">
            <el-option
              v-for="server in serverList"
              :key="server.id"
              :label="server.name"
              :value="server.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bindDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleBindSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EdgeBox',
  
  data() {
    return {
      // 搜索关键字
      searchKeyword: '',
      
      // 表格数据
      tableData: [],
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 弹窗控制
      dialogVisible: false,
      dialogType: 'add', // add 或 edit
      bindDialogVisible: false,
      
      // 表单数据
      formData: {
        name: '',
        serialNumber: '',
        ipAddress: '',
        location: ''
      },
      
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入盒子名称', trigger: 'blur' }
        ],
        serialNumber: [
          { required: true, message: '请输入序列号', trigger: 'blur' }
        ],
        ipAddress: [
          { required: true, message: '请输入IP地址', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入安装位置', trigger: 'blur' }
        ]
      },
      
      // 绑定服务器表单
      bindForm: {
        serverId: ''
      },
      
      // 服务器列表
      serverList: [
        { id: '1', name: '边缘服务器1' },
        { id: '2', name: '边缘服务器2' },
        { id: '3', name: '边缘服务器3' }
      ],
      
      // 模拟数据
      mockData: [
        {
          id: '1',
          name: '边缘盒子A',
          serialNumber: 'EB001',
          status: 'online',
          ipAddress: '192.168.1.100',
          location: '1号厂房东侧',
          bindServer: '边缘服务器1',
          lastOnlineTime: '2024-03-19 15:30:00'
        },
        {
          id: '2',
          name: '边缘盒子B',
          serialNumber: 'EB002',
          status: 'offline',
          ipAddress: '192.168.1.101',
          location: '2号厂房西侧',
          bindServer: '边缘服务器2',
          lastOnlineTime: '2024-03-19 14:20:00'
        }
      ]
    }
  },
  
  mounted() {
    this.loadData()
  },
  
  methods: {
    // 加载数据
    loadData() {
      // 模拟API调用
      this.tableData = this.mockData
      this.total = this.mockData.length
    },
    
    // 搜索
    handleSearch() {
      // 实现搜索逻辑
      const keyword = this.searchKeyword.toLowerCase()
      this.tableData = this.mockData.filter(item => 
        item.name.toLowerCase().includes(keyword) || 
        item.serialNumber.toLowerCase().includes(keyword)
      )
    },
    
    // 添加边缘盒子
    handleAddBox() {
      this.dialogType = 'add'
      this.dialogVisible = true
    },
    
    // 编辑边缘盒子
    handleEdit(row) {
      this.dialogType = 'edit'
      this.formData = { ...row }
      this.dialogVisible = true
    },
    
    // 绑定服务器
    handleBind(row) {
      this.currentEditingBox = row
      this.bindForm.serverId = ''
      this.bindDialogVisible = true
    },
    
    // 删除边缘盒子
    handleDelete(row) {
      this.$confirm('确认删除该边缘盒子?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 实现删除逻辑
        this.$message.success('删除成功')
        this.loadData()
      }).catch(() => {})
    },
    
    // 提交表单
    handleSubmit() {
      this.$refs.boxForm.validate((valid) => {
        if (valid) {
          // 实现提交逻辑
          this.$message.success(this.dialogType === 'add' ? '添加成功' : '编辑成功')
          this.dialogVisible = false
          this.loadData()
        }
      })
    },
    
    // 提交绑定
    handleBindSubmit() {
      if (!this.bindForm.serverId) {
        this.$message.warning('请选择要绑定的服务器')
        return
      }
      // 实现绑定逻辑
      this.$message.success('绑定成功')
      this.bindDialogVisible = false
      this.loadData()
    },
    
    // 重置表单
    resetForm() {
      if (this.$refs.boxForm) {
        this.$refs.boxForm.resetFields()
      }
      this.formData = {
        name: '',
        serialNumber: '',
        ipAddress: '',
        location: ''
      }
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.loadData()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    }
  }
}
</script>

<style scoped>
/* 整体背景 */
.edge-box-container {
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

/* 添加按钮样式 */
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

.edit-btn,
.bind-btn,
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

.edit-btn:hover,
.bind-btn:hover,
.delete-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* ===== 标签样式 - 完全参照camera.css ===== */
/* 状态标签 - 科技感浅色 */
.edge-box-container >>> .el-table .el-tag--success,
.edge-box-container >>> .el-dialog .el-tag--success {
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

.edge-box-container >>> .el-table .el-tag--danger,
.edge-box-container >>> .el-dialog .el-tag--danger {
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
.edge-box-container >>> .el-table .el-tag,
.edge-box-container >>> .el-dialog .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
  transition: all 0.3s ease !important;
}

.edge-box-container >>> .el-table .el-tag:hover,
.edge-box-container >>> .el-dialog .el-tag:hover {
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
.edge-box-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.edge-box-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.edge-box-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.edge-box-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.edge-box-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.edge-box-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.edge-box-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.edge-box-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.edge-box-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.edge-box-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.edge-box-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 输入框样式 */
.edge-box-container >>> .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.edge-box-container >>> .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.edge-box-container >>> .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* 选择器样式 */
.edge-box-container >>> .el-select .el-input__inner {
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.edge-box-container >>> .el-select .el-input__inner:hover {
  border-color: #3b82f6 !important;
}

.edge-box-container >>> .el-select .el-input__inner:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

/* 表单标签样式 */
.edge-box-container >>> .el-form-item__label {
  color: #374151 !important;
  font-weight: 500 !important;
}

/* ===== 系统级弹框样式 (Alert/Confirm/Prompt) ===== */
/* MessageBox 弹框整体样式 */
.edge-box-container >>> .el-message-box {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(59, 130, 246, 0.2) !important;
}

/* MessageBox 头部样式 */
.edge-box-container >>> .el-message-box__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

/* MessageBox 标题样式 */
.edge-box-container >>> .el-message-box__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
  font-size: 16px !important;
}

/* MessageBox 关闭按钮 */
.edge-box-container >>> .el-message-box__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.edge-box-container >>> .el-message-box__close:hover {
  color: #3b82f6 !important;
}

/* MessageBox 主体内容样式 */
.edge-box-container >>> .el-message-box__content {
  padding: 20px !important;
  background: #ffffff !important;
}

/* MessageBox 消息文本样式 */
.edge-box-container >>> .el-message-box__message {
  color: #374151 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

/* MessageBox 图标样式 */
.edge-box-container >>> .el-message-box__status {
  font-size: 20px !important;
}

.edge-box-container >>> .el-message-box__status.el-icon-warning {
  color: #f59e0b !important;
}

.edge-box-container >>> .el-message-box__status.el-icon-info {
  color: #3b82f6 !important;
}

.edge-box-container >>> .el-message-box__status.el-icon-success {
  color: #10b981 !important;
}

.edge-box-container >>> .el-message-box__status.el-icon-error {
  color: #ef4444 !important;
}

/* MessageBox 底部按钮区域 */
.edge-box-container >>> .el-message-box__btns {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* MessageBox 按钮样式 */
.edge-box-container >>> .el-message-box__btns .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

.edge-box-container >>> .el-message-box__btns .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.edge-box-container >>> .el-message-box__btns .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
  margin-right: 10px !important;
}

.edge-box-container >>> .el-message-box__btns .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 危险操作按钮样式 (删除确认等) */
.edge-box-container >>> .el-message-box__btns .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}

.edge-box-container >>> .el-message-box__btns .el-button--danger:hover {
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
  .custom-table {
    border-radius: 8px;
  }
  .pagination-container {
    border-radius: 8px;
    padding: 8px 2px;
  }
  .edge-box-container >>> .el-dialog {
    border-radius: 8px;
  }
}
</style>
<template>
  <div class="tenant-management-container">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="租户编号">
          <el-input
            v-model="searchForm.tenantNumber"
            placeholder="请输入租户编号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input
            v-model="searchForm.contactPerson"
            placeholder="请输入联系人"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="searchForm.contactPhone"
            placeholder="请输入联系电话"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input
            v-model="searchForm.companyName"
            placeholder="请输入企业名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTenants">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 租户列表表格 -->
    <div class="table-container">
      <div class="table-operations">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="addTenant">新增</el-button>
        <el-button icon="el-icon-delete" size="small" @click="batchDelete">删除</el-button>
        <el-button icon="el-icon-download" size="small" @click="exportTenants">导出</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="syncTenantDict">同步租户字典</el-button>
      </div>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        :border="false"
        class="custom-table"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="tenantNumber" label="租户编号" width="120" align="center"></el-table-column>
        <el-table-column prop="contactPerson" label="联系人" width="120" align="center"></el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="140" align="center"></el-table-column>
        <el-table-column prop="companyName" label="企业名称" align="center"></el-table-column>
        <el-table-column prop="creditCode" label="社会信用代码" width="180" align="center"></el-table-column>
        <el-table-column prop="expireTime" label="过期时间" width="120" align="center"></el-table-column>
        <el-table-column prop="status" label="租户状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#3b82f6"
              inactive-color="#9ca3af"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button type="text" class="edit-btn" @click="editTenant(scope.row)">编辑</el-button>
              <el-button type="text" class="reset-btn" @click="resetTenant(scope.row)">重置</el-button>
              <el-button type="text" class="delete-btn" @click="deleteTenant(scope.row)">删除</el-button>
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
    
    <!-- 新增/编辑租户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="tenantDialogVisible"
      width="700px"
    >
      <el-form :model="tenantForm" :rules="tenantRules" ref="tenantForm" label-width="100px">
        <el-form-item label="企业名称" prop="companyName" required>
          <el-input v-model="tenantForm.companyName" placeholder="请输入企业名称"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson" required>
          <el-input v-model="tenantForm.contactPerson" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone" required>
          <el-input v-model="tenantForm.contactPhone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="tenantForm.username" placeholder="请输入系统用户名"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" :prop="currentTenant ? '' : 'password'" :required="!currentTenant">
          <el-input v-model="tenantForm.password" :placeholder="currentTenant ? '留空则不修改密码' : '请输入系统用户密码'" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="租户套餐">
          <el-select v-model="tenantForm.package" placeholder="请选择租户套餐" style="width: 100%">
            <el-option label="基础版" value="basic"></el-option>
            <el-option label="标准版" value="standard"></el-option>
            <el-option label="高级版" value="premium"></el-option>
            <el-option label="企业版" value="enterprise"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="tenantForm.expireTime"
            type="date"
            placeholder="请选择过期时间"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="用户数量">
          <el-input v-model.number="tenantForm.userCount" placeholder="0" type="number"></el-input>
        </el-form-item>
        <el-form-item label="绑定域名">
          <el-input v-model="tenantForm.domain" placeholder="请输入绑定域名"></el-input>
        </el-form-item>
        <el-form-item label="企业地址">
          <el-input v-model="tenantForm.address" placeholder="请输入企业地址"></el-input>
        </el-form-item>
        <el-form-item label="企业代码">
          <el-input v-model="tenantForm.companyCode" placeholder="请输入统一社会信用代码"></el-input>
        </el-form-item>
        <el-form-item label="企业简介">
          <el-input
            v-model="tenantForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入企业简介"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="tenantForm.remark" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="tenantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTenant">确定</el-button>
      </span>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="400px"
    >
      <div class="confirm-message">
        <i class="el-icon-warning"></i>
        <span>确定要删除选中的租户吗？此操作不可恢复。</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定删除</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TenantManagement',
  
  data() {
    return {
      // 搜索表单
      searchForm: {
        tenantNumber: '',
        contactPerson: '',
        contactPhone: '',
        companyName: ''
      },
      
      // 表格数据
      tableData: [],
      loading: false,
      selectedRows: [],
      
      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 租户表单
      tenantForm: {
        companyName: '',
        contactPerson: '',
        contactPhone: '',
        username: '',
        password: '',
        package: '',
        expireTime: '',
        userCount: 0,
        domain: '',
        address: '',
        companyCode: '',
        description: '',
        remark: ''
      },
      
      // 表单验证规则
      tenantRules: {
        companyName: [
          { required: true, message: '请输入企业名称', trigger: 'blur' }
        ],
        contactPerson: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入系统用户名', trigger: 'blur' }
        ],
        password: [
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      
      // 对话框
      tenantDialogVisible: false,
      deleteDialogVisible: false,
      dialogTitle: '新增租户',
      currentTenant: null
    }
  },
  
  created() {
    this.fetchTenants()
  },
  
  methods: {
    // 获取租户数据
    fetchTenants() {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        const allMockData = this.generateAllMockTenants()
        
        // 根据搜索条件筛选
        let filteredData = [...allMockData]
        
        if (this.searchForm.tenantNumber) {
          filteredData = filteredData.filter(item => 
            item.tenantNumber.includes(this.searchForm.tenantNumber)
          )
        }
        
        if (this.searchForm.contactPerson) {
          filteredData = filteredData.filter(item => 
            item.contactPerson.includes(this.searchForm.contactPerson)
          )
        }
        
        if (this.searchForm.contactPhone) {
          filteredData = filteredData.filter(item => 
            item.contactPhone.includes(this.searchForm.contactPhone)
          )
        }
        
        if (this.searchForm.companyName) {
          filteredData = filteredData.filter(item => 
            item.companyName.includes(this.searchForm.companyName)
          )
        }
        
        // 设置总数
        this.pagination.total = filteredData.length
        
        // 根据当前页码和每页数量过滤数据
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize
        const endIndex = startIndex + this.pagination.pageSize
        
        this.tableData = filteredData.slice(startIndex, endIndex)
        this.loading = false
      }, 500)
    },
    
    // 生成模拟租户数据
    generateAllMockTenants() {
      return [
        {
          id: 1,
          tenantNumber: '000000',
          contactPerson: '管理组',
          contactPhone: '15888888888',
          companyName: 'XXX有限公司',
          creditCode: '',
          expireTime: '',
          status: true,
          username: 'admin',
          package: 'enterprise',
          userCount: 100,
          domain: 'xxx.com',
          address: '北京市朝阳区',
          companyCode: '91110000000000000X',
          description: '专业的科技服务公司',
          remark: '管理员租户'
        },
        {
          id: 2,
          tenantNumber: '952742',
          contactPerson: '123',
          contactPhone: '123',
          companyName: '123',
          creditCode: '',
          expireTime: '',
          status: true,
          username: 'user123',
          package: 'basic',
          userCount: 10,
          domain: '',
          address: '',
          companyCode: '',
          description: '',
          remark: ''
        },
        {
          id: 3,
          tenantNumber: '415387',
          contactPerson: '66',
          contactPhone: '66666',
          companyName: '6666',
          creditCode: '',
          expireTime: '',
          status: true,
          username: 'user66',
          package: 'standard',
          userCount: 20,
          domain: '',
          address: '',
          companyCode: '',
          description: '',
          remark: ''
        },
        {
          id: 4,
          tenantNumber: '297659',
          contactPerson: '16888',
          contactPhone: '16888',
          companyName: '16888',
          creditCode: '',
          expireTime: '',
          status: true,
          username: 'user16888',
          package: 'premium',
          userCount: 50,
          domain: '',
          address: '',
          companyCode: '',
          description: '',
          remark: ''
        },
        {
          id: 5,
          tenantNumber: '789133',
          contactPerson: '测试租户联系人',
          contactPhone: '15895889800',
          companyName: '测试租户企业名称',
          creditCode: '',
          expireTime: '',
          status: true,
          username: 'testuser',
          package: 'standard',
          userCount: 30,
          domain: 'test.com',
          address: '上海市浦东新区',
          companyCode: '91310000000000000Y',
          description: '测试企业',
          remark: '测试用途'
        },
        {
          id: 6,
          tenantNumber: '555083',
          contactPerson: 'test',
          contactPhone: 'test',
          companyName: 'test',
          creditCode: '',
          expireTime: '',
          status: true,
          username: 'test',
          package: 'basic',
          userCount: 5,
          domain: '',
          address: '',
          companyCode: '',
          description: '',
          remark: ''
        },
        {
          id: 7,
          tenantNumber: '646214',
          contactPerson: 'test999',
          contactPhone: '111',
          companyName: 'test999',
          creditCode: '',
          expireTime: '2025-07-16',
          status: true,
          username: 'test999',
          package: 'premium',
          userCount: 99,
          domain: 'test999.com',
          address: '深圳市南山区',
          companyCode: '91440300000000000Z',
          description: '高级测试企业',
          remark: '高级测试'
        },
        {
          id: 8,
          tenantNumber: '252800',
          contactPerson: 'ce',
          contactPhone: '13131111111',
          companyName: 'ce',
          creditCode: '',
          expireTime: '2025-07-31',
          status: true,
          username: 'ce',
          package: 'enterprise',
          userCount: 200,
          domain: 'ce.com',
          address: '广州市天河区',
          companyCode: '91440100000000000A',
          description: 'CE企业服务',
          remark: '企业级用户'
        }
      ]
    },
    
    // 搜索租户
    searchTenants() {
      this.pagination.currentPage = 1
      this.fetchTenants()
    },
    
    // 重置搜索条件
    resetSearch() {
      this.searchForm = {
        tenantNumber: '',
        contactPerson: '',
        contactPhone: '',
        companyName: ''
      }
      this.pagination.currentPage = 1
      this.fetchTenants()
    },
    
    // 处理每页数量变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchTenants()
    },
    
    // 处理页码变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchTenants()
    },
    
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 新增租户
    addTenant() {
      this.dialogTitle = '添加租户'
      this.currentTenant = null
      this.tenantForm = {
        companyName: '',
        contactPerson: '',
        contactPhone: '',
        username: '',
        password: '',
        package: '',
        expireTime: '',
        userCount: 0,
        domain: '',
        address: '',
        companyCode: '',
        description: '',
        remark: ''
      }
      this.tenantDialogVisible = true
    },
    
    // 编辑租户
    editTenant(row) {
      this.dialogTitle = '编辑租户'
      this.currentTenant = row
      this.tenantForm = { ...row }
      this.tenantDialogVisible = true
    },
    
    // 保存租户
    saveTenant() {
      // 新增模式下，检查密码是否为空
      if (!this.currentTenant && !this.tenantForm.password) {
        this.$message({
          message: '请输入系统用户密码',
          type: 'warning'
        })
        return
      }
      
      this.$refs.tenantForm.validate((valid) => {
        if (valid) {
          this.loading = true
          
          // 模拟API调用
          setTimeout(() => {
            if (this.currentTenant) {
              // 编辑
              this.$message({
                message: '租户信息修改成功',
                type: 'success'
              })
            } else {
              // 新增
              this.$message({
                message: '租户添加成功',
                type: 'success'
              })
            }
            
            this.tenantDialogVisible = false
            this.fetchTenants()
            this.loading = false
          }, 800)
        }
      })
    },
    
    // 删除租户
    deleteTenant(row) {
      this.currentTenant = row
      this.deleteDialogVisible = true
    },
    
    // 确认删除
    confirmDelete() {
      this.deleteDialogVisible = false
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.$message({
          message: '租户删除成功',
          type: 'success'
        })
        this.fetchTenants()
        this.loading = false
      }, 800)
    },
    
    // 重置租户
    resetTenant(row) {
      this.$confirm('确定要重置该租户的信息吗？', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '租户信息重置成功',
          type: 'success'
        })
        this.fetchTenants()
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量编辑
    batchEdit() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要编辑的租户',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '批量编辑功能开发中',
        type: 'info'
      })
    },
    
    // 批量删除
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要删除的租户',
          type: 'warning'
        })
        return
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个租户吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '批量删除成功',
          type: 'success'
        })
        this.fetchTenants()
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 导出租户
    exportTenants() {
      this.loading = true
      
      // 获取要导出的数据
      const dataToExport = this.selectedRows.length > 0 ? this.selectedRows : this.tableData
      
      // 设置CSV表头
      let csvContent = '租户编号,企业名称,联系人,联系电话,用户名,租户套餐,过期时间,用户数量,绑定域名,企业地址,企业代码,企业简介,备注,租户状态\n'
      
      // 添加数据行
      dataToExport.forEach(item => {
        const status = item.status ? '启用' : '禁用'
        const packageName = {
          'basic': '基础版',
          'standard': '标准版', 
          'premium': '高级版',
          'enterprise': '企业版'
        }[item.package] || item.package || ''
        
        csvContent += `"${item.tenantNumber}","${item.companyName}","${item.contactPerson}","${item.contactPhone}","${item.username || ''}","${packageName}","${item.expireTime}","${item.userCount || 0}","${item.domain || ''}","${item.address || ''}","${item.companyCode || ''}","${item.description || ''}","${item.remark || ''}","${status}"\n`
      })
      
      // 创建下载
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const now = new Date()
      const fileName = `租户信息_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.loading = false
      this.$message({
        message: '租户信息导出成功',
        type: 'success'
      })
    },
    
    // 同步租户字典
    syncTenantDict() {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.$message({
          message: '租户字典同步成功',
          type: 'success'
        })
        this.fetchTenants()
        this.loading = false
      }, 1000)
    },
    
    // 处理状态变化
    handleStatusChange(row) {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        const status = row.status ? '启用' : '禁用'
        this.$message({
          message: `租户状态已${status}`,
          type: 'success'
        })
        this.loading = false
      }, 500)
    }
  }
}
</script>

<style scoped>
/* 整体背景 */
.tenant-management-container {
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
  text-align: left;
  border-bottom: none;
}
.table-operations >>> .el-button {
  margin-right: 8px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.table-operations >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  color: #fff;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}
.table-operations >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}
.table-operations >>> .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}
.table-operations >>> .el-button:not(.el-button--primary):hover {
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
.custom-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/* 表格操作按钮样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
}

.edit-btn, .reset-btn, .delete-btn {
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

.edit-btn:hover, .reset-btn:hover, .delete-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* 分页器样式 */
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

/* 弹框样式 */
.tenant-management-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.tenant-management-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.tenant-management-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.tenant-management-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.tenant-management-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.tenant-management-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.tenant-management-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.tenant-management-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.tenant-management-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tenant-management-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.tenant-management-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.tenant-management-container >>> .el-dialog .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.tenant-management-container >>> .el-dialog .el-button--danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 确认消息样式 */
.confirm-message {
  display: flex;
  align-items: center;
}
.confirm-message i {
  font-size: 20px;
  color: #e6a23c;
  margin-right: 10px;
}

/* 开关样式 */
.tenant-management-container >>> .el-switch {
  margin: 0 auto;
}

/* 表单样式美化 */
.tenant-management-container >>> .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.tenant-management-container >>> .el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.tenant-management-container >>> .el-input__inner,
.tenant-management-container >>> .el-date-editor .el-input__inner,
.tenant-management-container >>> .el-select .el-input__inner,
.tenant-management-container >>> .el-textarea__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.tenant-management-container >>> .el-input__inner:hover,
.tenant-management-container >>> .el-date-editor .el-input__inner:hover,
.tenant-management-container >>> .el-select .el-input__inner:hover,
.tenant-management-container >>> .el-textarea__inner:hover {
  border-color: #3b82f6;
}

.tenant-management-container >>> .el-input__inner:focus,
.tenant-management-container >>> .el-date-editor .el-input__inner:focus,
.tenant-management-container >>> .el-select .el-input__inner:focus,
.tenant-management-container >>> .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 下拉框样式优化 */
.tenant-management-container >>> .el-select-dropdown {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

/* 适配小屏幕 */
@media screen and (max-width: 768px) {
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
</style> 
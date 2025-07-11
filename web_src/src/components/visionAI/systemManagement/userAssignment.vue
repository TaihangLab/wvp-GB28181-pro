<template>
  <div class="role-user-assignment-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" class="back-btn" @click="goBack">
          <i class="el-icon-arrow-left"></i>
          返回角色管理
        </el-button>
        <h2>{{ roleName }}</h2>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号码"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户列表表格 -->
    <div class="table-container">
      <div class="table-operations">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="addUser">添加用户</el-button>
        <el-button icon="el-icon-delete" size="small" @click="batchCancelAuth">批量取消授权</el-button>
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
        <el-table-column prop="userName" label="用户名称" min-width="120" align="center"></el-table-column>
        <el-table-column prop="nickName" label="用户昵称" min-width="120" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200" align="center"></el-table-column>
        <el-table-column prop="phone" label="手机" min-width="140" align="center"></el-table-column>
                     <el-table-column prop="status" label="状态" width="80" align="center">
               <template slot-scope="scope">
                 <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
                   {{ scope.row.status === 1 ? '正常' : '停用' }}
                 </el-tag>
               </template>
             </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button type="text" class="cancel-auth-btn" @click="cancelAuth(scope.row)">取消授权</el-button>
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
    
    <!-- 添加用户对话框 -->
    <el-dialog
      title="选择用户"
      :visible.sync="addUserDialogVisible"
      width="1200px"
      class="add-user-dialog"
    >
      <div class="add-user-content">
        <!-- 搜索区域 -->
        <div class="user-search-section">
          <el-form :inline="true">
            <el-form-item label="用户名称">
              <el-input
                v-model="userSearchForm.userName"
                placeholder="请输入用户名称"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="手机号码">
              <el-input
                v-model="userSearchForm.phone"
                placeholder="请输入手机号码"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchAvailableUsers">搜索</el-button>
              <el-button @click="resetUserSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 用户选择表格 -->
        <div class="user-select-table">
          <el-table
            :data="availableUsersData"
            v-loading="userSelectLoading"
            :border="false"
            class="user-table"
            style="width: 100%"
            @selection-change="handleUserSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column prop="userName" label="用户名称" min-width="120" align="center"></el-table-column>
            <el-table-column prop="nickName" label="用户昵称" min-width="120" align="center"></el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="200" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机" min-width="140" align="center"></el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
                  {{ scope.row.status === 1 ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
          </el-table>
          
          <!-- 分页器 -->
          <div class="user-pagination">
            <el-pagination
              :current-page.sync="userPagination.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size.sync="userPagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="userPagination.total"
              @size-change="handleUserSizeChange"
              @current-change="handleUserCurrentChange"
            ></el-pagination>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddUser">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserAssignment',
  
  data() {
    return {
      // 角色信息
      roleId: '',
      roleName: '',
      
      // 搜索表单
      searchForm: {
        userName: '',
        phone: ''
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
      
      // 添加用户对话框
      addUserDialogVisible: false,
      selectedUsers: [],
      
      // 用户搜索表单
      userSearchForm: {
        userName: '',
        phone: ''
      },
      
      // 可选用户数据
      availableUsersData: [],
      userSelectLoading: false,
      
      // 用户分页
      userPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  
  created() {
    this.initPageData()
    this.fetchUsers()
  },
  
  methods: {
    // 初始化页面数据
    initPageData() {
      // 从路由参数或localStorage获取角色信息
      this.roleId = this.$route.query.roleId || ''
      this.roleName = this.$route.query.roleName || '未知角色'
    },
    
    // 获取用户数据
    fetchUsers() {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        const allMockData = this.generateAllMockUsers()
        
        // 根据搜索条件筛选
        let filteredData = [...allMockData]
        
        if (this.searchForm.userName) {
          filteredData = filteredData.filter(item => 
            item.userName.includes(this.searchForm.userName) ||
            item.nickName.includes(this.searchForm.userName)
          )
        }
        
        if (this.searchForm.phone) {
          filteredData = filteredData.filter(item => 
            item.phone.includes(this.searchForm.phone)
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
    
    // 生成模拟用户数据
    generateAllMockUsers() {
      return [
        {
          id: 1,
          userName: 'asdasd',
          nickName: 'das',
          email: 'yunlongc528@gmail.com',
          phone: '19310742302',
          status: 1,
          createTime: '2025-07-07 10:59:02'
        },
        {
          id: 2,
          userName: 'testuser',
          nickName: '测试用户',
          email: 'test@example.com',
          phone: '13888888888',
          status: 1,
          createTime: '2025-07-06 15:30:45'
        },
        {
          id: 3,
          userName: 'admin',
          nickName: '管理员',
          email: 'admin@system.com',
          phone: '15999999999',
          status: 1,
          createTime: '2025-07-05 09:20:15'
        },
        {
          id: 4,
          userName: 'developer',
          nickName: '开发者',
          email: 'dev@company.com',
          phone: '13777777777',
          status: 1,
          createTime: '2025-07-04 14:45:30'
        },
        {
          id: 5,
          userName: 'operator',
          nickName: '操作员',
          email: 'operator@system.com',
          phone: '18666666666',
          status: 0,
          createTime: '2025-07-03 11:10:20'
        }
      ]
    },
    
    // 搜索用户
    searchUsers() {
      this.pagination.currentPage = 1
      this.fetchUsers()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        userName: '',
        phone: ''
      }
      this.pagination.currentPage = 1
      this.fetchUsers()
    },
    
    // 添加用户
    addUser() {
      this.selectedUsers = []
      this.userSearchForm = {
        userName: '',
        phone: ''
      }
      this.userPagination = {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
      this.addUserDialogVisible = true
      this.fetchAvailableUsers()
    },
    
    // 获取可选用户数据
    fetchAvailableUsers() {
      this.userSelectLoading = true
      
      // 模拟API调用
      setTimeout(() => {
        const allMockData = this.generateAllAvailableUsers()
        
        // 根据搜索条件筛选
        let filteredData = [...allMockData]
        
        if (this.userSearchForm.userName) {
          filteredData = filteredData.filter(item => 
            item.userName.includes(this.userSearchForm.userName) ||
            item.nickName.includes(this.userSearchForm.userName)
          )
        }
        
        if (this.userSearchForm.phone) {
          filteredData = filteredData.filter(item => 
            item.phone.includes(this.userSearchForm.phone)
          )
        }
        
        // 设置总数
        this.userPagination.total = filteredData.length
        
        // 根据当前页码和每页数量过滤数据
        const startIndex = (this.userPagination.currentPage - 1) * this.userPagination.pageSize
        const endIndex = startIndex + this.userPagination.pageSize
        
        this.availableUsersData = filteredData.slice(startIndex, endIndex)
        this.userSelectLoading = false
      }, 300)
    },
    
    // 生成模拟可选用户数据
    generateAllAvailableUsers() {
      return [
        {
          id: 1,
          userName: 'admin',
          nickName: '疯狂的狮子',
          email: 'crazyLion@gmail.com',
          phone: '15888888888',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 2,
          userName: 'test',
          nickName: '本部门及以下',
          email: 'test@example.com',
          phone: '13999999999',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 3,
          userName: 'test1',
          nickName: '仅本人 密码',
          email: 'test1@example.com',
          phone: '13777777777',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 4,
          userName: 'newuser',
          nickName: '新用户',
          email: 'newuser@example.com',
          phone: '13666666666',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 5,
          userName: 'manager',
          nickName: '管理员',
          email: 'manager@example.com',
          phone: '13555555555',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 6,
          userName: 'operator',
          nickName: '操作员',
          email: 'operator@example.com',
          phone: '13444444444',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 7,
          userName: 'viewer',
          nickName: '查看者',
          email: 'viewer@example.com',
          phone: '13333333333',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 8,
          userName: 'editor',
          nickName: '编辑者',
          email: 'editor@example.com',
          phone: '13222222222',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 9,
          userName: 'auditor',
          nickName: '审计员',
          email: 'auditor@example.com',
          phone: '13111111111',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        },
        {
          id: 10,
          userName: 'guest',
          nickName: '访客',
          email: 'guest@example.com',
          phone: '13000000000',
          status: 1,
          createTime: '2025-06-06 16:28:45'
        }
      ]
    },
    
    // 搜索可选用户
    searchAvailableUsers() {
      this.userPagination.currentPage = 1
      this.fetchAvailableUsers()
    },
    
    // 重置用户搜索
    resetUserSearch() {
      this.userSearchForm = {
        userName: '',
        phone: ''
      }
      this.userPagination.currentPage = 1
      this.fetchAvailableUsers()
    },
    
    // 处理用户选择变化
    handleUserSelectionChange(selection) {
      this.selectedUsers = selection
    },
    
    // 处理用户分页大小变化
    handleUserSizeChange(newSize) {
      this.userPagination.pageSize = newSize
      this.fetchAvailableUsers()
    },
    
    // 处理用户当前页变化
    handleUserCurrentChange(newPage) {
      this.userPagination.currentPage = newPage
      this.fetchAvailableUsers()
    },
    
    // 保存添加用户
    saveAddUser() {
      if (this.selectedUsers.length === 0) {
        this.$message({
          message: '请选择要添加的用户',
          type: 'warning'
        })
        return
      }
      
      this.$message({
        message: `成功添加 ${this.selectedUsers.length} 个用户`,
        type: 'success'
      })
      this.addUserDialogVisible = false
      this.fetchUsers()
    },
    
    // 取消授权
    cancelAuth(row) {
      this.$confirm(`确定要取消用户 "${row.userName}" 的授权吗？`, '确认取消', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '取消授权成功',
          type: 'success'
        })
        this.fetchUsers()
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量取消授权
    batchCancelAuth() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要取消授权的用户',
          type: 'warning'
        })
        return
      }
      
      this.$confirm(`确定要取消选中的 ${this.selectedRows.length} 个用户的授权吗？`, '确认取消', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '批量取消授权成功',
          type: 'success'
        })
        this.fetchUsers()
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 返回角色管理页面
    goBack() {
      this.$router.push('/systemManage/roleManagement')
    },
    
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 处理分页大小变化
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.fetchUsers()
    },
    
    // 处理当前页变化
    handleCurrentChange(newPage) {
      this.pagination.currentPage = newPage
      this.fetchUsers()
    }
  }
}
</script>

<style scoped>
/* 整体背景 */
.role-user-assignment-container {
  padding: 20px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 100px);
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-btn {
  color: #3b82f6 !important;
  font-size: 14px !important;
  margin-right: 15px !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.back-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  color: #1e40af !important;
}

.back-btn i {
  margin-right: 5px;
}

.page-header h2 {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
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

.cancel-auth-btn {
  padding: 2px 8px !important;
  font-size: 11px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  height: 24px !important;
  min-width: 60px !important;
}

.cancel-auth-btn:hover {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border-color: #f56c6c !important;
  color: #c45656 !important;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2) !important;
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

/* 添加用户弹框样式 */
.role-user-assignment-container >>> .add-user-dialog .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.role-user-assignment-container >>> .add-user-dialog .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.role-user-assignment-container >>> .add-user-dialog .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.role-user-assignment-container >>> .add-user-dialog .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.role-user-assignment-container >>> .add-user-dialog .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

.add-user-content {
  text-align: left;
}

/* 用户搜索区域样式 */
.user-search-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.user-search-section .el-form-item {
  margin-bottom: 0;
}

.user-search-section .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.user-search-section >>> .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: #fff;
}

.user-search-section >>> .el-input__inner:hover {
  border-color: #3b82f6;
}

.user-search-section >>> .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.user-search-section >>> .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3);
  color: white;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-search-section >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4);
  transform: translateY(-2px);
}

.user-search-section >>> .el-button:not(.el-button--primary) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-search-section >>> .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e3a8a;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

/* 用户选择表格样式 */
.user-select-table {
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.user-table {
  border-radius: 8px;
  overflow: hidden;
}

.user-table >>> .el-table__cell {
  border-right: none;
}

.user-table >>> .el-table::before {
  height: 0;
}

.user-table >>> .el-table__header-wrapper th {
  font-weight: bold;
  text-align: center;
  background: #f5f7fa !important;
  color: #303133 !important;
  border-bottom: 1px solid #ebeef5 !important;
}

.user-table >>> .el-table__row td {
  text-align: center;
}

.user-table >>> .el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}

.user-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/* 弹框内分页器样式 */
.user-pagination {
  display: flex;
  justify-content: center;
  padding: 15px;
  background: #f8fafc;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
}

.user-pagination >>> .el-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-pagination >>> .el-pagination .el-pager li {
  min-width: 30px;
  height: 30px;
  line-height: 28px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  margin: 0 2px;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.user-pagination >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.user-pagination >>> .el-pagination .el-pager li:hover {
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
}

.user-pagination >>> .el-pagination button {
  min-width: 30px;
  height: 30px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #4b5563;
  margin: 0 2px;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.user-pagination >>> .el-pagination button:hover {
  border-color: #3b82f6;
  color: #1e40af;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
}

.user-pagination >>> .el-pagination .el-select .el-input__inner {
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  height: 30px;
  line-height: 30px;
}

.user-pagination >>> .el-pagination .el-select .el-input__inner:hover {
  border-color: #3b82f6;
}

.user-pagination >>> .el-pagination .el-pagination__jump {
  color: #4b5563;
  font-size: 12px;
}

.user-pagination >>> .el-pagination .el-pagination__jump .el-input__inner {
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  height: 30px;
  line-height: 30px;
  width: 50px;
}

.user-pagination >>> .el-pagination .el-pagination__jump .el-input__inner:hover {
  border-color: #3b82f6;
}

/* 科技感标签样式 - 完全参照logRecords.vue设计 */
.role-user-assignment-container >>> .el-table .el-tag--success,
.role-user-assignment-container >>> .user-table .el-tag--success,
.role-user-assignment-container >>> .el-dialog .el-tag--success {
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

.role-user-assignment-container >>> .el-table .el-tag--danger,
.role-user-assignment-container >>> .user-table .el-tag--danger,
.role-user-assignment-container >>> .el-dialog .el-tag--danger {
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

.role-user-assignment-container >>> .el-table .el-tag--warning,
.role-user-assignment-container >>> .user-table .el-tag--warning,
.role-user-assignment-container >>> .el-dialog .el-tag--warning {
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

.role-user-assignment-container >>> .el-table .el-tag--info,
.role-user-assignment-container >>> .user-table .el-tag--info,
.role-user-assignment-container >>> .el-dialog .el-tag--info {
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
.role-user-assignment-container >>> .el-table .el-tag,
.role-user-assignment-container >>> .user-table .el-tag,
.role-user-assignment-container >>> .el-dialog .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
  transition: all 0.3s ease !important;
}

.role-user-assignment-container >>> .el-table .el-tag:hover,
.role-user-assignment-container >>> .user-table .el-tag:hover,
.role-user-assignment-container >>> .el-dialog .el-tag:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* 弹框内按钮样式 */
.role-user-assignment-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.role-user-assignment-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.role-user-assignment-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.role-user-assignment-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
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
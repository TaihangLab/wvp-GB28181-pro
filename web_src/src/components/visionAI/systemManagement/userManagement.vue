<template>
  <div class="user-management-container">
    <div class="content-layout">
      <!-- 左侧组织架构树 -->
      <div class="left-panel">
        <div class="tree-container">
          <el-input
            placeholder="请输入部门名称"
            v-model="filterText"
            prefix-icon="el-icon-search"
            size="small"
            class="tree-search">
          </el-input>
          <el-tree
            class="department-tree"
            :data="treeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            ref="tree"
            node-key="id"
            :expand-on-click-node="false"
            :highlight-current="true"
            @node-click="handleNodeClick">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="tree-label">{{ node.label }}</span>
            </span>
          </el-tree>
        </div>
      </div>

      <!-- 右侧用户管理区域 -->
      <div class="right-panel">
        <!-- 搜索筛选区域 -->
        <div class="filter-section">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="用户名称">
              <el-input
                v-model="searchForm.userName"
                placeholder="请输入用户名称"
                clearable
                style="width: 200px;">
              </el-input>
            </el-form-item>
            <el-form-item label="用户昵称">
              <el-input
                v-model="searchForm.userNickname"
                placeholder="请输入用户昵称"
                clearable
                style="width: 200px;">
              </el-input>
            </el-form-item>
            <el-form-item label="手机号码">
              <el-input
                v-model="searchForm.phoneNumber"
                placeholder="请输入手机号码"
                clearable
                style="width: 200px;">
              </el-input>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="用户状态" clearable style="width: 120px;">
                <el-option label="启用" value="1"></el-option>
                <el-option label="禁用" value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 240px;">
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格操作区域 -->
        <div class="table-container">
          <div class="table-operations">
            <div class="left-buttons">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="addUser">新增</el-button>
              <el-button icon="el-icon-edit" size="small" @click="batchEdit">修改</el-button>
              <el-button icon="el-icon-delete" size="small" @click="batchDelete">删除</el-button>
              <el-dropdown @command="handleMoreAction" class="more-dropdown">
                <el-button size="small">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="export">导出</el-dropdown-item>
                  <el-dropdown-item command="import">导入</el-dropdown-item>
                  <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="right-buttons">
              <el-button icon="el-icon-search" size="small" circle @click="toggleAdvancedSearch"></el-button>
              <el-button icon="el-icon-refresh" size="small" circle @click="refreshData"></el-button>
              <el-button icon="el-icon-setting" size="small" circle @click="showTableSetting"></el-button>
            </div>
          </div>

          <!-- 用户表格 -->
          <el-table
            :data="tableData"
            v-loading="loading"
            style="width: 100%"
            class="custom-table"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center"></el-table-column>
            <el-table-column prop="userName" label="用户名称" min-width="140" align="center"></el-table-column>
            <el-table-column prop="userNickname" label="用户昵称" min-width="150" align="center"></el-table-column>
            <el-table-column prop="department" label="部门" min-width="80" align="center"></el-table-column>
            <el-table-column prop="phoneNumber" label="手机号码" min-width="120" align="center"></el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.status"
                  active-color="#3b82f6"
                  inactive-color="#9ca3af"
                  @change="handleStatusChange(scope.row)">
                </el-switch>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" min-width="140" align="center"></el-table-column>
            <el-table-column label="操作" min-width="130" fixed="right" align="center">
              <template slot-scope="scope">
                <div class="operation-buttons">
                  <el-button type="text" class="edit-btn" @click="editUser(scope.row)" title="编辑">
                    <i class="el-icon-edit"></i>
                  </el-button>
                  <el-button type="text" class="delete-btn" @click="deleteUser(scope.row)" title="删除">
                    <i class="el-icon-delete"></i>
                  </el-button>
                  <el-button type="text" class="key-btn" @click="resetPassword(scope.row)" title="重置密码">
                    <i class="el-icon-key"></i>
                  </el-button>
                  <el-button type="text" class="more-btn" @click="showUserMore(scope.row)" title="更多">
                    <i class="el-icon-more"></i>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div class="pagination-container">
            <el-pagination
              :current-page.sync="pagination.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size.sync="pagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="userDialogVisible"
      width="600px">
      <el-form :model="userForm" :rules="userRules" ref="userForm" label-width="100px">
        <el-form-item label="用户名称" prop="userName" required>
          <el-input v-model="userForm.userName" placeholder="请输入用户名称"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="userNickname">
          <el-input v-model="userForm.userNickname" placeholder="请输入用户昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber" required>
          <el-input v-model="userForm.phoneNumber" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        <el-form-item label="所属部门" prop="departmentId" required>
          <el-cascader
            v-model="userForm.departmentId"
            :options="departmentOptions"
            :props="cascaderProps"
            placeholder="请选择所属部门"
            style="width: 100%">
          </el-cascader>
        </el-form-item>
        <el-form-item label="用户密码" :prop="currentUser ? '' : 'password'" :required="!currentUser">
          <el-input
            v-model="userForm.password"
            :placeholder="currentUser ? '留空则不修改密码' : '请输入用户密码'"
            type="password"
            show-password>
          </el-input>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-switch
            v-model="userForm.status"
            active-text="启用"
            inactive-text="禁用"
            active-color="#3b82f6"
            inactive-color="#9ca3af">
          </el-switch>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="userForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="400px">
      <div class="confirm-message">
        <i class="el-icon-warning"></i>
        <span>确定要删除选中的用户吗？此操作不可恢复。</span>
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
  name: 'UserManagement',
  
  data() {
    return {
      loading: false,
      filterText: '',
      selectedDepartment: null,
      
      // 搜索表单
      searchForm: {
        userName: '',
        userNickname: '',
        phoneNumber: '',
        status: '',
        createTimeRange: []
      },
      
      // 表格数据
      tableData: [],
      selectedRows: [],
      
      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 组织架构树数据
      treeData: [
        {
          id: 1,
          label: 'XXX科技',
          children: [
            {
              id: 2,
              label: '深圳总公司',
              children: [
                { id: 3, label: '研发部门' },
                { id: 4, label: '市场部门' },
                { id: 5, label: '测试部门' },
                { id: 6, label: '财务部门' },
                { id: 7, label: '运维部门' }
              ]
            },
            {
              id: 8,
              label: '长沙分公司',
              children: [
                { id: 9, label: '市场部门' },
                { id: 10, label: '财务部门' }
              ]
            }
          ]
        }
      ],
      
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      
      // 用户表单
      userForm: {
        userName: '',
        userNickname: '',
        phoneNumber: '',
        email: '',
        departmentId: [],
        password: '',
        status: true,
        remark: ''
      },
      
      // 表单验证规则
      userRules: {
        userName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        phoneNumber: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        departmentId: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ]
      },
      
      // 对话框
      userDialogVisible: false,
      deleteDialogVisible: false,
      dialogTitle: '新增用户',
      currentUser: null,
      
      // 级联选择器配置
      cascaderProps: {
        value: 'id',
        label: 'label',
        children: 'children',
        checkStrictly: true
      }
    }
  },
  
  computed: {
    departmentOptions() {
      return this.treeData
    }
  },
  
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  
  created() {
    this.fetchUsers()
  },
  
  methods: {
    // 过滤树节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    
    // 点击树节点
    handleNodeClick(data) {
      this.selectedDepartment = data
      this.pagination.currentPage = 1
      this.fetchUsers()
    },
    
    // 获取用户数据
    fetchUsers() {
      this.loading = true
      
      setTimeout(() => {
        const allMockData = this.generateAllMockUsers()
        
        // 根据搜索条件和选中部门筛选
        let filteredData = [...allMockData]
        
        if (this.selectedDepartment && this.selectedDepartment.id !== 1) {
          filteredData = filteredData.filter(item => 
            item.departmentId === this.selectedDepartment.id ||
            item.department === this.selectedDepartment.label
          )
        }
        
        if (this.searchForm.userName) {
          filteredData = filteredData.filter(item => 
            item.userName.includes(this.searchForm.userName)
          )
        }
        
        if (this.searchForm.userNickname) {
          filteredData = filteredData.filter(item => 
            item.userNickname.includes(this.searchForm.userNickname)
          )
        }
        
        if (this.searchForm.phoneNumber) {
          filteredData = filteredData.filter(item => 
            item.phoneNumber.includes(this.searchForm.phoneNumber)
          )
        }
        
        if (this.searchForm.status !== '') {
          filteredData = filteredData.filter(item => 
            item.status === (this.searchForm.status === '1')
          )
        }
        
        if (this.searchForm.createTimeRange && this.searchForm.createTimeRange.length === 2) {
          filteredData = filteredData.filter(item => {
            const itemDate = item.createTime.split(' ')[0]
            return itemDate >= this.searchForm.createTimeRange[0] && 
                   itemDate <= this.searchForm.createTimeRange[1]
          })
        }
        
        this.pagination.total = filteredData.length
        
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
          userName: 'admin',
          userNickname: '疯狂的狮子Li',
          department: '研发部门',
          departmentId: 3,
          phoneNumber: '15888888888',
          email: 'admin@xxx.com',
          status: true,
          createTime: '2025-06-06 16:28:45',
          remark: '管理员账户'
        },
        {
          id: 2,
          userName: 'test',
          userNickname: '本部门）以上 密码6',
          department: '市场部门',
          departmentId: 4,
          phoneNumber: '',
          email: 'test@xxx.com',
          status: true,
          createTime: '2025-06-06 16:28:45',
          remark: ''
        },
        {
          id: 3,
          userName: 'test1',
          userNickname: '仅本人 密码66666',
          department: '长沙分公司',
          departmentId: 8,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-06-06 16:28:45',
          remark: ''
        },
        {
          id: 4,
          userName: 'testLoginOut',
          userNickname: 'testLoginOut',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-02 15:04:32',
          remark: ''
        },
        {
          id: 5,
          userName: 'te',
          userNickname: 'fy',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-03 17:46:32',
          remark: ''
        },
        {
          id: 6,
          userName: '用户名称',
          userNickname: '用户昵称',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-03 17:48:21',
          remark: ''
        },
        {
          id: 7,
          userName: '用户名',
          userNickname: '昵称',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-03 18:06:22',
          remark: ''
        },
        {
          id: 8,
          userName: '名称',
          userNickname: 'yonghu11',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-03 18:30:12',
          remark: ''
        },
        {
          id: 9,
          userName: '2222',
          userNickname: '2222',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-03 18:32:54',
          remark: ''
        },
        {
          id: 10,
          userName: '123用户名称',
          userNickname: '123用户昵称',
          department: '',
          departmentId: null,
          phoneNumber: '',
          email: '',
          status: true,
          createTime: '2025-07-03 18:36:14',
          remark: ''
        }
      ]
    },
    
    // 搜索用户
    handleSearch() {
      this.pagination.currentPage = 1
      this.fetchUsers()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        userName: '',
        userNickname: '',
        phoneNumber: '',
        status: '',
        createTimeRange: []
      }
      this.pagination.currentPage = 1
      this.fetchUsers()
    },
    
    // 刷新数据
    refreshData() {
      this.fetchUsers()
    },
    
    // 切换高级搜索
    toggleAdvancedSearch() {
      this.$message({
        message: '高级搜索功能开发中',
        type: 'info'
      })
    },
    
    // 显示表格设置
    showTableSetting() {
      this.$message({
        message: '表格设置功能开发中',
        type: 'info'
      })
    },
    
    // 处理分页
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchUsers()
    },
    
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchUsers()
    },
    
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 新增用户
    addUser() {
      this.dialogTitle = '新增用户'
      this.currentUser = null
      this.userForm = {
        userName: '',
        userNickname: '',
        phoneNumber: '',
        email: '',
        departmentId: [],
        password: '',
        status: true,
        remark: ''
      }
      this.userDialogVisible = true
    },
    
    // 编辑用户
    editUser(row) {
      this.dialogTitle = '编辑用户'
      this.currentUser = row
      this.userForm = {
        ...row,
        departmentId: row.departmentId ? [row.departmentId] : [],
        password: ''
      }
      this.userDialogVisible = true
    },
    
    // 保存用户
    saveUser() {
      if (!this.currentUser && !this.userForm.password) {
        this.$message({
          message: '请输入用户密码',
          type: 'warning'
        })
        return
      }
      
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.loading = true
          
          setTimeout(() => {
            if (this.currentUser) {
              this.$message({
                message: '用户信息修改成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: '用户添加成功',
                type: 'success'
              })
            }
            
            this.userDialogVisible = false
            this.fetchUsers()
            this.loading = false
          }, 800)
        }
      })
    },
    
    // 删除用户
    deleteUser(row) {
      this.currentUser = row
      this.deleteDialogVisible = true
    },
    
    // 确认删除
    confirmDelete() {
      this.deleteDialogVisible = false
      this.loading = true
      
      setTimeout(() => {
        this.$message({
          message: '用户删除成功',
          type: 'success'
        })
        this.fetchUsers()
        this.loading = false
      }, 800)
    },
    
    // 批量编辑
    batchEdit() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要编辑的用户',
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
          message: '请选择要删除的用户',
          type: 'warning'
        })
        return
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个用户吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '批量删除成功',
          type: 'success'
        })
        this.fetchUsers()
      }).catch(() => {})
    },
    
    // 处理更多操作
    handleMoreAction(command) {
      switch (command) {
        case 'export':
          this.exportUsers()
          break
        case 'import':
          this.importUsers()
          break
        case 'resetPassword':
          this.batchResetPassword()
          break
      }
    },
    
    // 导出用户
    exportUsers() {
      this.$message({
        message: '用户信息导出成功',
        type: 'success'
      })
    },
    
    // 导入用户
    importUsers() {
      this.$message({
        message: '导入功能开发中',
        type: 'info'
      })
    },
    
    // 批量重置密码
    batchResetPassword() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要重置密码的用户',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '批量重置密码功能开发中',
        type: 'info'
      })
    },
    
    // 重置密码
    resetPassword(row) {
      this.$confirm('确定要重置该用户的密码吗？', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '密码重置成功',
          type: 'success'
        })
      }).catch(() => {})
    },
    
    // 显示用户更多操作
    showUserMore(row) {
      this.$message({
        message: '更多操作功能开发中',
        type: 'info'
      })
    },
    
    // 处理状态变化
    handleStatusChange(row) {
      this.loading = true
      
      setTimeout(() => {
        const status = row.status ? '启用' : '禁用'
        this.$message({
          message: `用户状态已${status}`,
          type: 'success'
        })
        this.loading = false
      }, 500)
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.user-management-container {
  padding: 20px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 100px);
}

/* 主要布局 */
.content-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
  min-height: 600px;
}

/* 左侧面板 */
.left-panel {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.tree-container {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-search {
  margin-bottom: 16px;
}

.tree-search >>> .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tree-search >>> .el-input__inner:hover {
  border-color: #3b82f6;
}

.tree-search >>> .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.department-tree {
  flex: 1;
  overflow: auto;
}

.department-tree >>> .el-tree-node__content {
  height: 36px;
  padding: 0 8px;
  border-radius: 6px;
  margin: 2px 0;
  transition: all 0.3s ease;
}

.department-tree >>> .el-tree-node__content:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
}

.department-tree >>> .el-tree-node.is-current > .el-tree-node__content {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.tree-label {
  font-weight: 500;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.search-form .el-form-item {
  margin-bottom: 12px;
}

.search-form .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.filter-section >>> .el-input__inner,
.filter-section >>> .el-select .el-input__inner,
.filter-section >>> .el-date-editor .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fff;
}

.filter-section >>> .el-input__inner:hover,
.filter-section >>> .el-select .el-input__inner:hover,
.filter-section >>> .el-date-editor .el-input__inner:hover {
  border-color: #3b82f6;
}

.filter-section >>> .el-input__inner:focus,
.filter-section >>> .el-select .el-input__inner:focus,
.filter-section >>> .el-date-editor .el-input__inner:focus {
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
}

/* 操作按钮区 */
.table-operations {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.left-buttons {
  display: flex;
  gap: 8px;
}

.right-buttons {
  display: flex;
  gap: 8px;
}

.table-operations >>> .el-button {
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

.table-operations >>> .el-button.is-circle {
  width: 32px;
  height: 32px;
  padding: 0;
}

/* 下拉菜单 */
.more-dropdown >>> .el-dropdown-menu {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
.custom-table {
  flex: 1;
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
  vertical-align: middle;
}

.custom-table >>> .el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}

/* 表格内容样式优化 */
.custom-table >>> .el-table__body .el-table__row td .cell {
  padding: 0 8px;
  word-break: break-word;
  line-height: 1.5;
}

/* 状态开关居中 */
.custom-table >>> .el-switch {
  vertical-align: middle;
}

/* 表格操作按钮样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.operation-buttons .el-button {
  padding: 4px !important;
  width: 26px !important;
  height: 26px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  transition: all 0.3s ease !important;
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.operation-buttons .el-button:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* 表格行高调整 */
.custom-table >>> .el-table__body-wrapper .el-table__row {
  height: 50px;
}

.custom-table >>> .el-table__body-wrapper .el-table__row td {
  padding: 8px 0;
}

.custom-table >>> .el-table__header-wrapper .el-table__header th {
  padding: 12px 0;
  height: 48px;
}

/* 分页器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #ebeef5;
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

/* 弹框样式 */
.user-management-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.user-management-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.user-management-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.user-management-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.user-management-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.user-management-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.user-management-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.user-management-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.user-management-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.user-management-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.user-management-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.user-management-container >>> .el-dialog .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.user-management-container >>> .el-dialog .el-button--danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 表单样式美化 */
.user-management-container >>> .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.user-management-container >>> .el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.user-management-container >>> .el-input__inner,
.user-management-container >>> .el-date-editor .el-input__inner,
.user-management-container >>> .el-select .el-input__inner,
.user-management-container >>> .el-textarea__inner,
.user-management-container >>> .el-cascader .el-input__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-management-container >>> .el-input__inner:hover,
.user-management-container >>> .el-date-editor .el-input__inner:hover,
.user-management-container >>> .el-select .el-input__inner:hover,
.user-management-container >>> .el-textarea__inner:hover,
.user-management-container >>> .el-cascader .el-input__inner:hover {
  border-color: #3b82f6;
}

.user-management-container >>> .el-input__inner:focus,
.user-management-container >>> .el-date-editor .el-input__inner:focus,
.user-management-container >>> .el-select .el-input__inner:focus,
.user-management-container >>> .el-textarea__inner:focus,
.user-management-container >>> .el-cascader .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 下拉框样式优化 */
.user-management-container >>> .el-select-dropdown,
.user-management-container >>> .el-cascader__dropdown {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
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
.user-management-container >>> .el-switch {
  margin: 0 auto;
}

/* 适配小屏幕 */
@media screen and (max-width: 1200px) {
  .content-layout {
    flex-direction: column;
    height: auto;
    min-height: auto;
  }
  
  .left-panel {
    width: 100%;
    min-width: 100%;
    height: 300px;
    margin-bottom: 20px;
  }
  
  .right-panel {
    margin-top: 0;
  }
}

@media screen and (max-width: 768px) {
  .user-management-container {
    padding: 12px;
  }
  
  .filter-section {
    padding: 12px 16px;
  }
  
  .table-operations {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 12px 16px;
  }
  
  .left-buttons,
  .right-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .search-form .el-form-item {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .search-form >>> .el-form-item__label {
    width: 80px !important;
  }
  
  .search-form >>> .el-form-item__content {
    margin-left: 80px !important;
  }
  
  .operation-buttons {
    gap: 4px;
  }
  
  .operation-buttons .el-button {
    width: 24px !important;
    height: 24px !important;
  }
  
  .custom-table >>> .el-table__body .el-table__row td .cell {
    padding: 0 4px;
  }
}
</style> 
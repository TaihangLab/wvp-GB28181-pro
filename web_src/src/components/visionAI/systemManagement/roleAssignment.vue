<template>
  <div class="role-assignment-container">
    <!-- 基本信息 -->
    <div class="basic-info-section">
      <h3 class="section-title">基本信息</h3>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">用户账号</span>
          <span class="info-value">{{ userInfo.userNickname }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">登录账号</span>
          <span class="info-value">{{ userInfo.userName }}</span>
        </div>
      </div>
    </div>

    <!-- 角色信息 -->
    <div class="role-info-section">
      <h3 class="section-title">角色信息</h3>
      
      <!-- 角色表格 -->
      <el-table
        :data="roleData"
        v-loading="loading"
        style="width: 100%"
        class="role-table"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column label="序号" type="index" width="80" align="center" :index="indexMethod"></el-table-column>
        <el-table-column prop="roleCode" label="角色编号" min-width="180" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" min-width="120" align="center"></el-table-column>
        <el-table-column prop="roleKey" label="权限字符" min-width="120" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
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

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="submitAssignment">提交</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoleAssignment',
  
  data() {
    return {
      loading: false,
      
      // 用户信息
      userInfo: {
        userId: '',
        userName: '',
        userNickname: ''
      },
      
      // 角色数据
      roleData: [],
      selectedRoles: [],
      
      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  
  created() {
    this.initUserInfo()
    this.fetchRoles()
  },
  
  methods: {
    // 初始化用户信息
    initUserInfo() {
      const { userId, userName } = this.$route.params
      this.userInfo.userId = userId
      this.userInfo.userName = userName
      
      // 根据用户ID获取用户详细信息
      this.fetchUserInfo()
    },
    
    // 获取用户详细信息
    fetchUserInfo() {
      // 模拟获取用户信息
      const mockUserData = {
        1: { userNickname: '疯狂的狮子Li', userName: 'admin' },
        2: { userNickname: '本部门以上 密码6', userName: 'test' },
        3: { userNickname: '仅本人 密码66666', userName: 'test1' }
      }
      
      const userData = mockUserData[this.userInfo.userId]
      if (userData) {
        this.userInfo.userNickname = userData.userNickname
        this.userInfo.userName = userData.userName
      }
    },
    
    // 获取角色数据
    fetchRoles() {
      this.loading = true
      
      setTimeout(() => {
        const allRoles = this.generateMockRoles()
        
        this.pagination.total = allRoles.length
        
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize
        const endIndex = startIndex + this.pagination.pageSize
        
        this.roleData = allRoles.slice(startIndex, endIndex)
        this.loading = false
      }, 500)
    },
    
    // 生成模拟角色数据
    generateMockRoles() {
      return [
        {
          id: 1,
          roleCode: '194204879171796922',
          roleName: 'testwen',
          roleKey: 'testwen',
          createTime: '2025-07-07 10:31:28'
        },
        {
          id: 2,
          roleCode: '3',
          roleName: '本部门以上',
          roleKey: 'test1',
          createTime: '2025-06-06 16:28:46'
        },
        {
          id: 3,
          roleCode: '4',
          roleName: '仅本人',
          roleKey: 'test2',
          createTime: '2025-06-06 16:28:46'
        },
        {
          id: 4,
          roleCode: '5',
          roleName: '管理员',
          roleKey: 'admin',
          createTime: '2025-06-05 14:20:30'
        },
        {
          id: 5,
          roleCode: '6',
          roleName: '普通用户',
          roleKey: 'user',
          createTime: '2025-06-05 14:20:30'
        }
      ]
    },
    
    // 序号计算
    indexMethod(index) {
      return (this.pagination.currentPage - 1) * this.pagination.pageSize + index + 1
    },
    
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRoles = selection
    },
    
    // 处理分页
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.fetchRoles()
    },
    
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchRoles()
    },
    
    // 提交分配
    submitAssignment() {
      if (this.selectedRoles.length === 0) {
        this.$message({
          message: '请选择要分配的角色',
          type: 'warning'
        })
        return
      }
      
      this.loading = true
      
      setTimeout(() => {
        this.$message({
          message: `已为用户"${this.userInfo.userName}"分配${this.selectedRoles.length}个角色`,
          type: 'success'
        })
        this.loading = false
        
        // 提交成功后返回
        setTimeout(() => {
          this.goBack()
        }, 1000)
      }, 800)
    },
    
    // 返回上一页
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.role-assignment-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 90px);
}

/* 基本信息区域 */
.basic-info-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.info-row {
  display: flex;
  gap: 40px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.info-value {
  font-size: 14px;
  color: #303133;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

/* 角色信息区域 */
.role-info-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 表格样式 */
.role-table {
  margin-top: 15px;
}

.role-table >>> .el-table__header-wrapper th {
  background: #f5f7fa !important;
  color: #303133 !important;
  font-weight: 600;
}

.role-table >>> .el-table__body .el-table__row:hover > td {
  background: #f5f7fa !important;
}

/* 分页器 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0 0 0;
}

.pagination-container >>> .el-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px 0;
}

.action-buttons >>> .el-button {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  min-width: 80px;
}

.action-buttons >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  color: white;
}

.action-buttons >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.action-buttons >>> .el-button--default {
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.action-buttons >>> .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .role-assignment-container {
    padding: 12px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons >>> .el-button {
    width: 120px;
  }
}
</style> 
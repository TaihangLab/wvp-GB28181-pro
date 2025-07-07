<template>
  <div class="role-management-container">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.roleName"
            placeholder="请输入角色名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input
            v-model="searchForm.roleCode"
            placeholder="请输入权限字符"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="1"></el-option>
            <el-option label="停用" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createTime"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchRoles">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 角色列表表格 -->
    <div class="table-container">
      <div class="table-operations">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="addRole">新增</el-button>
        <el-button icon="el-icon-delete" size="small" @click="batchDelete">删除</el-button>
        <el-button icon="el-icon-download" size="small" @click="exportRoles">导出</el-button>
      </div>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        :border="false"
        class="custom-table"
        style="width: 100%"
        table-layout="fixed"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" min-width="160" align="center"></el-table-column>
        <el-table-column prop="roleCode" label="权限字符" min-width="140" align="center"></el-table-column>
        <el-table-column prop="roleSort" label="显示顺序" width="100" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#3b82f6"
              inactive-color="#9ca3af"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button type="text" class="edit-btn" @click="editRole(scope.row)">编辑</el-button>
              <el-button type="text" class="delete-btn" @click="deleteRole(scope.row)">删除</el-button>
              <el-button type="text" class="assign-btn" @click="assignPermissions(scope.row)">数据权限</el-button>
              <el-button type="text" class="assign-user-btn" @click="assignUsers(scope.row)">分配用户</el-button>
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
    
    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="roleDialogVisible"
      width="800px"
      class="role-dialog"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="角色名称" prop="roleName" required>
              <el-input v-model="roleForm.roleName" placeholder="请输入角色名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="权限字符" prop="roleCode" required>
              <el-input v-model="roleForm.roleCode" placeholder="请输入权限字符">
                <template slot="suffix">
                  <i class="el-icon-question" style="color: #409eff; cursor: pointer;" title="权限字符用于权限控制"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="roleSort" required>
              <el-input-number v-model="roleForm.roleSort" :min="0" :max="999" controls-position="right" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="roleForm.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="菜单权限">
              <div class="menu-permission-container">
                <div class="permission-actions">
                  <el-button size="small" @click="expandAll">展开/折叠</el-button>
                  <el-button size="small" @click="selectAll">全选/全不选</el-button>
                  <el-checkbox v-model="parentChildLinked">父子联动</el-checkbox>
                </div>
                <div class="permission-tree">
                  <el-tree
                    ref="permissionTree"
                    :data="permissionTreeData"
                    :props="treeProps"
                    node-key="id"
                    show-checkbox
                    :default-expand-all="false"
                    :check-strictly="!parentChildLinked"
                  ></el-tree>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="roleForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">确定</el-button>
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
        <span>确定要删除选中的角色吗？此操作不可恢复。</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定删除</el-button>
      </span>
    </el-dialog>
    
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配数据权限"
      :visible.sync="assignPermissionDialogVisible"
      width="500px"
      class="assign-permission-dialog"
    >
      <el-form :model="assignPermissionForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="assignPermissionForm.roleName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="assignPermissionForm.roleCode" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="assignPermissionForm.dataScope" placeholder="请选择权限范围" style="width: 100%">
            <el-option label="全部数据权限" value="1"></el-option>
            <el-option label="自定数据权限" value="2"></el-option>
            <el-option label="本部门数据权限" value="3"></el-option>
            <el-option label="本部门及以下数据权限" value="4"></el-option>
            <el-option label="仅本人数据权限" value="5"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignPermissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAssignPermission">确定</el-button>
      </span>
    </el-dialog>
    

  </div>
</template>

<script>
export default {
  name: 'RoleManagement',
  
  data() {
    return {
      // 搜索表单
      searchForm: {
        roleName: '',
        roleCode: '',
        status: '',
        createTime: []
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
      
      // 角色表单
      roleForm: {
        roleName: '',
        roleCode: '',
        roleSort: 1,
        status: 1,
        remark: '',
        permissions: []
      },
      
      // 表单验证规则
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '角色名称长度在2到20个字符', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '请输入权限字符', trigger: 'blur' },
          { min: 2, max: 30, message: '权限字符长度在2到30个字符', trigger: 'blur' }
        ],
        roleSort: [
          { required: true, message: '请输入显示顺序', trigger: 'blur' }
        ]
      },
      
      // 对话框
      roleDialogVisible: false,
      deleteDialogVisible: false,
      assignPermissionDialogVisible: false,
      dialogTitle: '添加角色',
      currentRole: null,
      currentAssignRole: null,
      
      // 权限树相关
      parentChildLinked: true,
      treeProps: {
        children: 'children',
        label: 'label'
      },
      permissionTreeData: [
        {
          id: 1,
          label: '系统管理',
          children: [
            {
              id: 11,
              label: '用户管理',
              children: [
                { id: 111, label: '用户查询' },
                { id: 112, label: '用户新增' },
                { id: 113, label: '用户修改' },
                { id: 114, label: '用户删除' },
                { id: 115, label: '用户导出' },
                { id: 116, label: '用户导入' },
                { id: 117, label: '重置密码' }
              ]
            },
            {
              id: 12,
              label: '角色管理',
              children: [
                { id: 121, label: '角色查询' },
                { id: 122, label: '角色新增' },
                { id: 123, label: '角色修改' },
                { id: 124, label: '角色删除' },
                { id: 125, label: '角色导出' }
              ]
            },
            {
              id: 13,
              label: '菜单管理',
              children: [
                { id: 131, label: '菜单查询' },
                { id: 132, label: '菜单新增' },
                { id: 133, label: '菜单修改' },
                { id: 134, label: '菜单删除' }
              ]
            },
            {
              id: 14,
              label: '部门管理',
              children: [
                { id: 141, label: '部门查询' },
                { id: 142, label: '部门新增' },
                { id: 143, label: '部门修改' },
                { id: 144, label: '部门删除' }
              ]
            },
            {
              id: 15,
              label: '岗位管理',
              children: [
                { id: 151, label: '岗位查询' },
                { id: 152, label: '岗位新增' },
                { id: 153, label: '岗位修改' },
                { id: 154, label: '岗位删除' },
                { id: 155, label: '岗位导出' }
              ]
            }
          ]
        },
        {
          id: 2,
          label: '系统监控',
          children: [
            {
              id: 21,
              label: '在线用户',
              children: [
                { id: 211, label: '在线用户查询' },
                { id: 212, label: '批量强退' },
                { id: 213, label: '单条强退' }
              ]
            },
            {
              id: 22,
              label: '定时任务',
              children: [
                { id: 221, label: '任务查询' },
                { id: 222, label: '任务新增' },
                { id: 223, label: '任务修改' },
                { id: 224, label: '任务删除' },
                { id: 225, label: '任务导出' }
              ]
            },
            {
              id: 23,
              label: '数据监控',
              children: [
                { id: 231, label: '数据监控查询' }
              ]
            },
            {
              id: 24,
              label: '服务监控',
              children: [
                { id: 241, label: '服务监控查询' }
              ]
            }
          ]
        },
        {
          id: 3,
          label: '系统工具',
          children: [
            {
              id: 31,
              label: '表单构建',
              children: [
                { id: 311, label: '表单构建查询' }
              ]
            },
            {
              id: 32,
              label: '代码生成',
              children: [
                { id: 321, label: '代码查询' },
                { id: 322, label: '代码生成修改' },
                { id: 323, label: '代码生成删除' },
                { id: 324, label: '代码预览' },
                { id: 325, label: '代码生成' }
              ]
            },
            {
              id: 33,
              label: '系统接口',
              children: [
                { id: 331, label: '接口查询' }
              ]
            }
                     ]
         }
       ],
       
       // 分配权限表单
       assignPermissionForm: {
         roleName: '',
         roleCode: '',
         dataScope: '1'
       }
     }
   },
  
  created() {
    this.fetchRoles()
  },
  
  methods: {
    // 获取角色数据
    fetchRoles() {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        const allMockData = this.generateAllMockRoles()
        
        // 根据搜索条件筛选
        let filteredData = [...allMockData]
        
        if (this.searchForm.roleName) {
          filteredData = filteredData.filter(item => 
            item.roleName.includes(this.searchForm.roleName)
          )
        }
        
        if (this.searchForm.roleCode) {
          filteredData = filteredData.filter(item => 
            item.roleCode.includes(this.searchForm.roleCode)
          )
        }
        
        if (this.searchForm.status !== '') {
          filteredData = filteredData.filter(item => 
            item.status === parseInt(this.searchForm.status)
          )
        }
        
        if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
          filteredData = filteredData.filter(item => {
            const createDate = new Date(item.createTime)
            const startDate = new Date(this.searchForm.createTime[0])
            const endDate = new Date(this.searchForm.createTime[1])
            return createDate >= startDate && createDate <= endDate
          })
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
    
    // 生成模拟角色数据
    generateAllMockRoles() {
      return [
        {
          id: 1,
          roleName: '超级管理员',
          roleCode: 'superadmin',
          roleSort: 1,
          status: 1,
          createTime: '2025-06-06 16:28:46',
          remark: '超级管理员角色'
        },
        {
          id: 2,
          roleName: '测试',
          roleCode: '测',
          roleSort: 1,
          status: 1,
          createTime: '2025-07-03 11:20:04',
          remark: '测试角色'
        },
        {
          id: 3,
          roleName: 'test3',
          roleCode: 'test3',
          roleSort: 1,
          status: 1,
          createTime: '2025-07-03 15:00:24',
          remark: 'test3角色'
        },
        {
          id: 4,
          roleName: '111',
          roleCode: '2223sa',
          roleSort: 1,
          status: 1,
          createTime: '2025-07-03 15:06:16',
          remark: '111角色'
        },
        {
          id: 5,
          roleName: '111111',
          roleCode: '111111',
          roleSort: 1,
          status: 1,
          createTime: '2025-07-04 11:39:41',
          remark: '111111角色'
        },
        {
          id: 6,
          roleName: '本部门及以下',
          roleCode: 'test1',
          roleSort: 3,
          status: 1,
          createTime: '2025-06-06 16:28:46',
          remark: '本部门及以下角色'
        },
        {
          id: 7,
          roleName: '仅本人',
          roleCode: 'test2',
          roleSort: 4,
          status: 1,
          createTime: '2025-06-06 16:28:46',
          remark: '仅本人角色'
        },
        {
          id: 8,
          roleName: '张胜男',
          roleCode: 'asdkhas',
          roleSort: 4,
          status: 1,
          createTime: '2025-07-03 18:53:00',
          remark: '张胜男角色'
        },
        {
          id: 9,
          roleName: '测试1111',
          roleCode: '测试',
          roleSort: 9,
          status: 1,
          createTime: '2025-07-03 16:55:22',
          remark: '测试1111角色'
        }
      ]
    },
    
    // 搜索角色
    searchRoles() {
      this.pagination.currentPage = 1
      this.fetchRoles()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        roleName: '',
        roleCode: '',
        status: '',
        createTime: []
      }
      this.pagination.currentPage = 1
      this.fetchRoles()
    },
    
    // 新增角色
    addRole() {
      this.dialogTitle = '添加角色'
      this.currentRole = null
      this.roleForm = {
        roleName: '',
        roleCode: '',
        roleSort: 1,
        status: 1,
        remark: '',
        permissions: []
      }
      this.roleDialogVisible = true
      this.$nextTick(() => {
        this.$refs.roleForm.clearValidate()
        this.$refs.permissionTree && this.$refs.permissionTree.setCheckedKeys([])
      })
    },
    
    // 编辑角色
    editRole(row) {
      this.dialogTitle = '修改角色'
      this.currentRole = row
      this.roleForm = {
        roleName: row.roleName,
        roleCode: row.roleCode,
        roleSort: row.roleSort,
        status: row.status,
        remark: row.remark,
        permissions: row.permissions || []
      }
      this.roleDialogVisible = true
      this.$nextTick(() => {
        this.$refs.roleForm.clearValidate()
        this.$refs.permissionTree && this.$refs.permissionTree.setCheckedKeys(row.permissions || [])
      })
    },
    
    // 保存角色
    saveRole() {
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          // 获取选中的权限
          const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
          const halfCheckedKeys = this.$refs.permissionTree.getHalfCheckedKeys()
          this.roleForm.permissions = [...checkedKeys, ...halfCheckedKeys]
          
          const message = this.currentRole ? '角色更新成功' : '角色添加成功'
          this.$message({
            message: message,
            type: 'success'
          })
          this.roleDialogVisible = false
          this.fetchRoles()
        }
      })
    },
    
    // 删除角色
    deleteRole(row) {
      this.$confirm(`确定要删除角色 "${row.roleName}" 吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '角色删除成功',
          type: 'success'
        })
        this.fetchRoles()
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 分配权限
    assignPermissions(row) {
      this.currentAssignRole = row
      this.assignPermissionForm = {
        roleName: row.roleName,
        roleCode: row.roleCode,
        dataScope: '1'
      }
      this.assignPermissionDialogVisible = true
    },
    
    // 分配用户
    assignUsers(row) {
      this.$router.push({
        path: '/visionAI/systemManagement/userAssignment',
        query: {
          roleId: row.id,
          roleName: row.roleName
        }
      })
    },
    
    // 保存分配权限
    saveAssignPermission() {
      this.$message({
        message: '权限分配成功',
        type: 'success'
      })
      this.assignPermissionDialogVisible = false
    },
    


    
    // 批量删除
    batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message({
          message: '请选择要删除的角色',
          type: 'warning'
        })
        return
      }
      
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个角色吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          message: '批量删除成功',
          type: 'success'
        })
        this.fetchRoles()
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 导出角色
    exportRoles() {
      this.loading = true
      
      // 获取要导出的数据
      const dataToExport = this.selectedRows.length > 0 ? this.selectedRows : this.tableData
      
      // 设置CSV表头
      let csvContent = '角色名称,权限字符,显示顺序,状态,创建时间,备注\n'
      
      // 添加数据行
      dataToExport.forEach(item => {
        const status = item.status === 1 ? '正常' : '停用'
        csvContent += `"${item.roleName}","${item.roleCode}","${item.roleSort}","${status}","${item.createTime}","${item.remark || ''}"\n`
      })
      
      // 创建下载
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const now = new Date()
      const fileName = `角色信息_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.loading = false
      this.$message({
        message: '角色信息导出成功',
        type: 'success'
      })
    },
    
    // 处理状态变化
    handleStatusChange(row) {
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        const status = row.status === 1 ? '启用' : '停用'
        this.$message({
          message: `角色状态已${status}`,
          type: 'success'
        })
        this.loading = false
      }, 500)
    },
    
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 处理分页大小变化
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.fetchRoles()
    },
    
    // 处理当前页变化
    handleCurrentChange(newPage) {
      this.pagination.currentPage = newPage
      this.fetchRoles()
    },
    
    // 确认删除
    confirmDelete() {
      this.$message({
        message: '删除成功',
        type: 'success'
      })
      this.deleteDialogVisible = false
      this.fetchRoles()
    },
    
    // 展开/折叠权限树
    expandAll() {
      const nodes = this.$refs.permissionTree.store.nodesMap
      for (let key in nodes) {
        nodes[key].expanded = !nodes[key].expanded
      }
    },
    
    // 全选/全不选权限树
    selectAll() {
      const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
      if (checkedKeys.length > 0) {
        this.$refs.permissionTree.setCheckedKeys([])
      } else {
        this.$refs.permissionTree.setCheckedKeys(this.getAllNodeKeys())
      }
    },
    
    // 获取所有节点key
    getAllNodeKeys() {
      const keys = []
      const getKeys = (nodes) => {
        nodes.forEach(node => {
          keys.push(node.id)
          if (node.children && node.children.length > 0) {
            getKeys(node.children)
          }
        })
      }
      getKeys(this.permissionTreeData)
      return keys
    }
  }
}
</script>

<style scoped>
/* 整体背景 */
.role-management-container {
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

.edit-btn, .delete-btn, .assign-btn, .assign-user-btn {
  padding: 2px 6px !important;
  font-size: 11px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  background: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #606266 !important;
  height: 24px !important;
  min-width: 45px !important;
}

.edit-btn:hover, .delete-btn:hover, .assign-btn:hover, .assign-user-btn:hover {
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
.role-management-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

/* 菜单权限容器样式 */
.menu-permission-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafbfc;
  padding: 0;
  overflow: hidden;
}

.permission-actions {
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 10px;
}

.permission-actions .el-button {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.permission-tree {
  height: 100px;
  overflow-y: auto;
  padding: 10px;
  background: #fff;
}

.permission-tree::-webkit-scrollbar {
  width: 6px;
}

.permission-tree::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.permission-tree::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.permission-tree::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.permission-tree >>> .el-tree-node__content {
  padding: 2px 0;
  font-size: 13px;
}

.permission-tree >>> .el-tree-node__label {
  font-size: 13px;
  color: #606266;
}

.role-management-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.role-management-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.role-management-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.role-management-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.role-management-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.role-management-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.role-management-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.role-management-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.role-management-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.role-management-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.role-management-container >>> .el-dialog .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.role-management-container >>> .el-dialog .el-button--danger:hover {
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
.role-management-container >>> .el-switch {
  margin: 0 auto;
}

/* 表单样式美化 */
.role-management-container >>> .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.role-management-container >>> .el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.role-management-container >>> .el-input__inner,
.role-management-container >>> .el-date-editor .el-input__inner,
.role-management-container >>> .el-select .el-input__inner,
.role-management-container >>> .el-textarea__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.role-management-container >>> .el-input__inner:hover,
.role-management-container >>> .el-date-editor .el-input__inner:hover,
.role-management-container >>> .el-select .el-input__inner:hover,
.role-management-container >>> .el-textarea__inner:hover {
  border-color: #3b82f6;
}

.role-management-container >>> .el-input__inner:focus,
.role-management-container >>> .el-date-editor .el-input__inner:focus,
.role-management-container >>> .el-select .el-input__inner:focus,
.role-management-container >>> .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 下拉框样式优化 */
.role-management-container >>> .el-select-dropdown {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

/* 分配权限弹框样式 */
.role-management-container >>> .assign-permission-dialog .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.role-management-container >>> .assign-permission-dialog .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.role-management-container >>> .assign-permission-dialog .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.role-management-container >>> .assign-permission-dialog .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.role-management-container >>> .assign-permission-dialog .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

.role-management-container >>> .assign-permission-dialog .el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #909399 !important;
  cursor: not-allowed !important;
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
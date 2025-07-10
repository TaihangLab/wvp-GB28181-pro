<template>
  <div class="position-management-container">
    <div class="content-layout">
      <!-- 左侧部门架构树 -->
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

      <!-- 右侧岗位管理区域 -->
      <div class="right-panel">
        <!-- 搜索和筛选区域 -->
        <div class="filter-section">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="岗位编码">
              <el-input
                v-model="searchForm.positionCode"
                placeholder="请输入岗位编码"
                clearable
                style="width: 180px;">
              </el-input>
            </el-form-item>
            <el-form-item label="岗位名称">
              <el-input
                v-model="searchForm.positionName"
                placeholder="请输入岗位名称"
                clearable
                style="width: 180px;">
              </el-input>
            </el-form-item>
            <el-form-item label="类别编码">
              <el-input
                v-model="searchForm.categoryCode"
                placeholder="请输入类别编码"
                clearable
                style="width: 180px;">
              </el-input>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
                <el-option label="正常" value="1"></el-option>
                <el-option label="停用" value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="searchPositions">搜索</el-button>
              <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
                <!-- 岗位列表表格 -->
        <div class="table-container">
          <div class="table-operations">
            <div class="left-buttons">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="addPosition">新增</el-button>
              <el-button icon="el-icon-delete" size="small" @click="batchDelete" :disabled="multipleSelection.length === 0">删除</el-button>
              <el-button icon="el-icon-download" size="small" @click="exportPositions">导出</el-button>
            </div>
          </div>
      
      <el-table
        ref="customTable"
        :data="tableData"
        v-loading="loading"
        :border="false"
        class="custom-table"
        style="width: 100%"
        table-layout="fixed"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="positionCode" label="岗位编码" min-width="120" align="center"></el-table-column>
        <el-table-column prop="categoryCode" label="类别编码" min-width="120" align="center"></el-table-column>
        <el-table-column prop="positionName" label="岗位名称" min-width="150" align="center"></el-table-column>
        <el-table-column prop="department" label="部门" min-width="120" align="center"></el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
              {{ scope.row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button type="text" class="edit-btn" @click="editPosition(scope.row)">编辑</el-button>
              <el-button type="text" class="delete-btn" @click="deletePosition(scope.row)">删除</el-button>
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
          :total="total">
        </el-pagination>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新增/编辑岗位对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="positionDialogVisible"
      width="600px"
      class="position-dialog"
    >
      <el-form :model="positionForm" :rules="positionRules" ref="positionForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位编码" prop="positionCode" required>
              <el-input v-model="positionForm.positionCode" placeholder="请输入岗位编码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="positionName" required>
              <el-input v-model="positionForm.positionName" placeholder="请输入岗位名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类别编码" prop="categoryCode" required>
              <el-input v-model="positionForm.categoryCode" placeholder="请输入类别编码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门" prop="department" required>
              <el-select v-model="positionForm.department" placeholder="请选择部门" style="width: 100%">
                <el-option label="研发部门" value="研发部门"></el-option>
                <el-option label="XXX科技" value="XXX科技"></el-option>
                <el-option label="市场部门" value="市场部门"></el-option>
                <el-option label="财务部门" value="财务部门"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum" required>
              <el-input-number v-model="positionForm.orderNum" :min="0" :max="999" controls-position="right" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位级别">
              <el-select v-model="positionForm.level" placeholder="请选择岗位级别" style="width: 100%">
                <el-option label="高层管理" value="high"></el-option>
                <el-option label="中层管理" value="middle"></el-option>
                <el-option label="基层管理" value="basic"></el-option>
                <el-option label="普通员工" value="staff"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="岗位职责">
              <el-input type="textarea" v-model="positionForm.responsibility" :rows="3" placeholder="请输入岗位职责"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="任职要求">
              <el-input type="textarea" v-model="positionForm.requirements" :rows="3" placeholder="请输入任职要求"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="岗位状态">
              <el-radio-group v-model="positionForm.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="positionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePosition">确定</el-button>
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
        <span>确定要删除选中的岗位吗？此操作不可恢复。</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定删除</el-button>
      </span>
    </el-dialog>
    
    <!-- 导出对话框 -->
    <el-dialog
      title="导出岗位数据"
      :visible.sync="exportDialogVisible"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel格式</el-radio>
            <el-radio label="csv">CSV格式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportForm.range">
            <el-radio label="all">全部数据</el-radio>
            <el-radio label="selected">选中数据</el-radio>
            <el-radio label="current">当前页面</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="包含字段">
          <el-checkbox-group v-model="exportForm.fields">
            <el-checkbox label="positionCode">岗位编码</el-checkbox>
            <el-checkbox label="categoryCode">类别编码</el-checkbox>
            <el-checkbox label="positionName">岗位名称</el-checkbox>
            <el-checkbox label="department">部门</el-checkbox>
            <el-checkbox label="orderNum">排序</el-checkbox>
            <el-checkbox label="status">状态</el-checkbox>
            <el-checkbox label="createTime">创建时间</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确定导出</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PositionManagement',
  
  data() {
    return {
      // 部门树筛选
      filterText: '',
      
      // 部门树数据
      treeData: [
        {
          id: 1,
          label: 'XXX科技',
          children: [
            {
              id: 11,
              label: '测试测试',
              children: [
                { id: 111, label: '子部门' }
              ]
            }
          ]
        },
        {
          id: 2,
          label: '深圳总公司',
          children: [
            { id: 21, label: '研发部门', children: [
              { id: 211, label: '测试研发部门' }
            ]},
            { id: 22, label: '市场部门' },
            { id: 23, label: '测试部门' },
            { id: 24, label: '财务部门' },
            { id: 25, label: '运维部门' }
          ]
        },
        {
          id: 3,
          label: '长沙分公司',
          children: [
            { id: 31, label: '市场部门' },
            { id: 32, label: '财务部门', children: [
              { id: 321, label: '财务测试' }
            ]}
          ]
        }
      ],
      
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      
      // 搜索表单
      searchForm: {
        positionCode: '',
        positionName: '',
        categoryCode: '',
        department: '',
        status: ''
      },
      
      // 表格数据
      tableData: [
        {
          id: 1,
          positionCode: 'ceo',
          categoryCode: 'ceo',
          positionName: '董事长',
          department: '研发部门',
          orderNum: 1,
          status: 1,
          level: 'high',
          responsibility: '负责公司整体战略规划和重大决策',
          requirements: '具有丰富的企业管理经验和战略眼光',
          createTime: '2025-06-06 16:28:46'
        },
        {
          id: 2,
          positionCode: 'se',
          categoryCode: 'se',
          positionName: '项目经理',
          department: 'XXX科技',
          orderNum: 2,
          status: 1,
          level: 'middle',
          responsibility: '负责项目整体规划、执行和管理',
          requirements: '具有项目管理经验和团队协调能力',
          createTime: '2025-06-06 16:28:46'
        },
        {
          id: 3,
          positionCode: 'hr',
          categoryCode: 'hr',
          positionName: '人力资源',
          department: 'XXX科技',
          orderNum: 3,
          status: 1,
          level: 'middle',
          responsibility: '负责人员招聘、培训和绩效管理',
          requirements: '熟悉人力资源管理体系和相关法规',
          createTime: '2025-06-06 16:28:46'
        },
        {
          id: 4,
          positionCode: 'user',
          categoryCode: 'user',
          positionName: '普通员工',
          department: 'XXX科技',
          orderNum: 4,
          status: 1,
          level: 'staff',
          responsibility: '执行具体业务工作任务',
          requirements: '具备相关专业技能和责任心',
          createTime: '2025-06-06 16:28:46'
        }
      ],
      loading: false,
      multipleSelection: [],
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 4,
      
      // 对话框控制
      positionDialogVisible: false,
      deleteDialogVisible: false,
      exportDialogVisible: false,
      dialogTitle: '',
      
      // 表单数据
      positionForm: {
        id: null,
        positionCode: '',
        categoryCode: '',
        positionName: '',
        department: '',
        orderNum: 1,
        level: '',
        responsibility: '',
        requirements: '',
        status: 1
      },
      
      // 导出表单
      exportForm: {
        format: 'excel',
        range: 'all',
        fields: ['positionCode', 'categoryCode', 'positionName', 'department', 'orderNum', 'status', 'createTime']
      },
      
      // 表单验证规则
      positionRules: {
        positionCode: [
          { required: true, message: '请输入岗位编码', trigger: 'blur' }
        ],
        positionName: [
          { required: true, message: '请输入岗位名称', trigger: 'blur' }
        ],
        categoryCode: [
          { required: true, message: '请输入类别编码', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        orderNum: [
          { required: true, message: '请输入显示排序', trigger: 'blur' }
        ]
      },
      
      // 删除相关
      deleteRow: null
    }
  },
  
  methods: {
    // 搜索岗位
    searchPositions() {
      this.loading = true
      // 这里模拟搜索逻辑
      setTimeout(() => {
        this.loading = false
        this.$message.success('搜索完成')
      }, 1000)
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        positionCode: '',
        positionName: '',
        categoryCode: '',
        department: '',
        status: ''
      }
      this.searchPositions()
    },
    
    // 新增岗位
    addPosition() {
      this.dialogTitle = '新增岗位'
      this.positionForm = {
        id: null,
        positionCode: '',
        categoryCode: '',
        positionName: '',
        department: '',
        orderNum: 1,
        level: '',
        responsibility: '',
        requirements: '',
        status: 1
      }
      this.positionDialogVisible = true
    },
    
    // 编辑岗位
    editPosition(row) {
      this.dialogTitle = '编辑岗位'
      this.positionForm = { ...row }
      this.positionDialogVisible = true
    },
    
    // 保存岗位
    savePosition() {
      this.$refs.positionForm.validate((valid) => {
        if (valid) {
          if (this.positionForm.id) {
            // 编辑
            const index = this.tableData.findIndex(item => item.id === this.positionForm.id)
            if (index !== -1) {
              this.tableData.splice(index, 1, { ...this.positionForm })
            }
            this.$message.success('岗位信息更新成功')
          } else {
            // 新增
            const newPosition = {
              ...this.positionForm,
              id: Date.now(),
              createTime: new Date().toLocaleString('zh-CN')
            }
            this.tableData.unshift(newPosition)
            this.total++
            this.$message.success('岗位添加成功')
          }
          this.positionDialogVisible = false
        }
      })
    },
    
    // 删除岗位
    deletePosition(row) {
      this.deleteRow = row
      this.deleteDialogVisible = true
    },
    
    // 确认删除
    confirmDelete() {
      if (this.deleteRow) {
        const index = this.tableData.findIndex(item => item.id === this.deleteRow.id)
        if (index !== -1) {
          this.tableData.splice(index, 1)
          this.total--
          this.$message.success('岗位删除成功')
        }
      } else if (this.multipleSelection.length > 0) {
        // 批量删除
        this.multipleSelection.forEach(row => {
          const index = this.tableData.findIndex(item => item.id === row.id)
          if (index !== -1) {
            this.tableData.splice(index, 1)
            this.total--
          }
        })
        this.$message.success(`成功删除 ${this.multipleSelection.length} 个岗位`)
        this.multipleSelection = []
      }
      this.deleteDialogVisible = false
      this.deleteRow = null
    },
    
    // 批量修改
    batchModify() {
      this.$message.info('批量修改功能开发中...')
    },
    
    // 批量删除
    batchDelete() {
      this.deleteRow = null
      this.deleteDialogVisible = true
    },
    
    // 导出岗位
    exportPositions() {
      this.exportDialogVisible = true
    },
    
    // 确认导出
    confirmExport() {
      this.$message.success(`正在导出${this.exportForm.format.toUpperCase()}格式的岗位数据...`)
      this.exportDialogVisible = false
    },
    
    // 表格选择
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },
    
    // 分页
    handleSizeChange(size) {
      this.pageSize = size
      this.searchPositions()
    },
    
    handleCurrentChange(page) {
      this.currentPage = page
      this.searchPositions()
    }
  },
  
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  
     methods: {
     // 部门树相关方法
     filterNode(value, data) {
       if (!value) return true
       return data.label.indexOf(value) !== -1
     },
     
     handleNodeClick(data) {
       // 点击部门节点时筛选对应部门的岗位
       this.searchForm.department = data.label
       this.searchPositions()
     },
     
     // 搜索岗位
     searchPositions() {
       this.loading = true
       // 这里模拟搜索逻辑
       setTimeout(() => {
         this.loading = false
         this.$message.success('搜索完成')
       }, 1000)
     },
     
     // 重置搜索
     resetSearch() {
       this.searchForm = {
         positionCode: '',
         positionName: '',
         categoryCode: '',
         department: '',
         status: ''
       }
       this.searchPositions()
     },
     
     // 新增岗位
     addPosition() {
       this.dialogTitle = '新增岗位'
       this.positionForm = {
         id: null,
         positionCode: '',
         categoryCode: '',
         positionName: '',
         department: '',
         orderNum: 1,
         level: '',
         responsibility: '',
         requirements: '',
         status: 1
       }
       this.positionDialogVisible = true
     },
     
     // 编辑岗位
     editPosition(row) {
       this.dialogTitle = '编辑岗位'
       this.positionForm = { ...row }
       this.positionDialogVisible = true
     },
     
     // 保存岗位
     savePosition() {
       this.$refs.positionForm.validate((valid) => {
         if (valid) {
           if (this.positionForm.id) {
             // 编辑
             const index = this.tableData.findIndex(item => item.id === this.positionForm.id)
             if (index !== -1) {
               this.tableData.splice(index, 1, { ...this.positionForm })
             }
             this.$message.success('岗位信息更新成功')
           } else {
             // 新增
             const newPosition = {
               ...this.positionForm,
               id: Date.now(),
               createTime: new Date().toLocaleString('zh-CN')
             }
             this.tableData.unshift(newPosition)
             this.total++
             this.$message.success('岗位添加成功')
           }
           this.positionDialogVisible = false
         }
       })
     },
     
     // 删除岗位
     deletePosition(row) {
       this.deleteRow = row
       this.deleteDialogVisible = true
     },
     
     // 确认删除
     confirmDelete() {
       if (this.deleteRow) {
         const index = this.tableData.findIndex(item => item.id === this.deleteRow.id)
         if (index !== -1) {
           this.tableData.splice(index, 1)
           this.total--
           this.$message.success('岗位删除成功')
         }
       } else if (this.multipleSelection.length > 0) {
         // 批量删除
         this.multipleSelection.forEach(row => {
           const index = this.tableData.findIndex(item => item.id === row.id)
           if (index !== -1) {
             this.tableData.splice(index, 1)
             this.total--
           }
         })
         this.$message.success(`成功删除 ${this.multipleSelection.length} 个岗位`)
         this.multipleSelection = []
       }
       this.deleteDialogVisible = false
       this.deleteRow = null
     },
     
     // 批量删除
     batchDelete() {
       this.deleteRow = null
       this.deleteDialogVisible = true
     },
     
     // 导出岗位
     exportPositions() {
       this.exportDialogVisible = true
     },
     
     // 确认导出
     confirmExport() {
       this.$message.success(`正在导出${this.exportForm.format.toUpperCase()}格式的岗位数据...`)
       this.exportDialogVisible = false
     },
     
     // 表格选择
     handleSelectionChange(selection) {
       this.multipleSelection = selection
     },
     
     // 分页
     handleSizeChange(size) {
       this.pageSize = size
       this.searchPositions()
     },
     
     handleCurrentChange(page) {
       this.currentPage = page
       this.searchPositions()
     }
   },
   
   mounted() {
     // 组件挂载后的初始化操作
   }
 }
</script>

<style scoped>
/* 整体容器 */
.position-management-container {
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
  margin-bottom: 12px;
  padding: 14px 18px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.05);
  flex-shrink: 0;
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
}

/* 操作按钮区 */
.table-operations {
  padding: 14px 18px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.left-buttons {
  display: flex;
  gap: 8px;
}

.table-operations >>> .el-button {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
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

/* 表格样式改进 */
.custom-table {
  flex: 1;
  overflow: hidden;
  min-height: 500px;
  height: calc(100% - 120px);
}

.custom-table >>> .el-table__body-wrapper {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
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
  height: 50px !important;
  padding: 12px 8px !important;
  vertical-align: middle !important;
}

/* 固定列表头圆角处理 */
.position-management-container >>> .el-table__fixed-right-header-wrapper th:last-child {
  border-top-right-radius: 8px !important;
}

/* 删除选择框旁边的黑点 */
.position-management-container >>> .el-table .el-table__body .el-table__row td.el-table-column--selection::before {
  display: none !important;
}

.position-management-container >>> .el-table .el-table__body .el-table__row td.el-table-column--selection::after {
  display: none !important;
}

.position-management-container >>> .el-table .el-table__body .el-table__row td:first-child::before {
  display: none !important;
}

.position-management-container >>> .el-table .el-table__body .el-table__row td:first-child::after {
  display: none !important;
}

/* 隐藏表格行的装饰点 */
.position-management-container >>> .el-table .el-table__row::before {
  display: none !important;
}

.position-management-container >>> .el-table .el-table__row::after {
  display: none !important;
}

/* 确保选择框列样式正常 - 只针对表格体，不影响表头 */
.position-management-container >>> .el-table .el-table__body .el-table-column--selection {
  background: transparent !important;
}

.position-management-container >>> .el-table .el-table__body .el-table-column--selection .cell {
  padding: 0 !important;
  text-align: center !important;
}

/* 保持表头选择框的背景色 */
.position-management-container >>> .el-table .el-table__header .el-table-column--selection {
  background: #f5f7fa !important;
}

/* 优化选择框样式 */
.position-management-container >>> .el-table .el-checkbox {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
}

.position-management-container >>> .el-table .el-checkbox__input {
  margin: 0 !important;
}

.custom-table >>> .el-table__row td {
  text-align: center;
  vertical-align: middle;
}

.custom-table >>> .el-table .el-table__body tr:hover > td {
  background: #f5f7fa !important;
}

/* 分页器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #ebeef5;
  margin-top: auto;
  flex-shrink: 0;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0;
  margin: 0;
}

/* 通用按钮样式 */
.position-management-container >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.position-management-container >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-2px) !important;
}

.position-management-container >>> .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.position-management-container >>> .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

/* 表格样式 */
.position-management-container >>> .el-table {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

.position-management-container >>> .el-table th {
  background: #f5f7fa !important;
  color: #303133 !important;
  font-weight: bold !important;
  border-bottom: 1px solid #ebeef5 !important;
  text-align: center !important;
  height: 50px !important;
  padding: 12px 8px !important;
  vertical-align: middle !important;
}

/* 表头左上角圆角 */
.position-management-container >>> .el-table thead tr th:first-child {
  border-top-left-radius: 8px !important;
}

/* 表头右上角圆角 */
.position-management-container >>> .el-table thead tr th:last-child {
  border-top-right-radius: 8px !important;
}

.position-management-container >>> .el-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
  transition: background-color 0.3s ease !important;
  height: 50px !important;
  padding: 12px 8px !important;
  vertical-align: middle !important;
}

.position-management-container >>> .el-table tbody tr:hover > td {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%) !important;
}

/* 操作按钮样式 */
.edit-btn, .delete-btn, .add-btn {
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
  line-height: 20px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.edit-btn:hover, .delete-btn:hover, .add-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
}

/* 科技感状态标签样式 */
.position-management-container >>> .el-table .el-tag--success {
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

.position-management-container >>> .el-table .el-tag--danger {
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

/* 统一表格内所有标签样式 */
.position-management-container >>> .el-table .el-tag {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 0 8px !important;
  height: 24px !important;
  line-height: 22px !important;
  transition: all 0.3s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
}

.position-management-container >>> .el-table .el-tag:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
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

/* 弹框样式 */
.position-management-container >>> .el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
}

.position-management-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 16px 20px !important;
}

.position-management-container >>> .el-dialog__title {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.position-management-container >>> .el-dialog__close {
  color: #6b7280 !important;
  transition: color 0.3s ease !important;
}

.position-management-container >>> .el-dialog__close:hover {
  color: #3b82f6 !important;
}

.position-management-container >>> .el-dialog__body {
  padding: 20px !important;
  background: #ffffff !important;
}

.position-management-container >>> .el-dialog__footer {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid rgba(59, 130, 246, 0.1) !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* 弹框内按钮样式 */
.position-management-container >>> .el-dialog .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.position-management-container >>> .el-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.position-management-container >>> .el-dialog .el-button--default {
  background: white !important;
  border: 1px solid #d1d5db !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.position-management-container >>> .el-dialog .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.position-management-container >>> .el-dialog .el-button--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e53e3e 100%) !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3) !important;
  color: white !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-radius: 6px !important;
}

.position-management-container >>> .el-dialog .el-button--danger:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%) !important;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 表单样式美化 */
.position-management-container >>> .el-form-item__label {
  color: #303133;
  font-weight: 500;
}

.position-management-container >>> .el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.position-management-container >>> .el-input__inner,
.position-management-container >>> .el-date-editor .el-input__inner,
.position-management-container >>> .el-select .el-input__inner,
.position-management-container >>> .el-textarea__inner {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.position-management-container >>> .el-input__inner:hover,
.position-management-container >>> .el-date-editor .el-input__inner:hover,
.position-management-container >>> .el-select .el-input__inner:hover,
.position-management-container >>> .el-textarea__inner:hover {
  border-color: #3b82f6;
}

.position-management-container >>> .el-input__inner:focus,
.position-management-container >>> .el-date-editor .el-input__inner:focus,
.position-management-container >>> .el-select .el-input__inner:focus,
.position-management-container >>> .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 下拉框样式优化 */
.position-management-container >>> .el-select-dropdown {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

/* 分页样式 */
.position-management-container >>> .el-pagination {
  text-align: center;
}

.position-management-container >>> .el-pagination .el-pager li {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

.position-management-container >>> .el-pagination .el-pager li:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
}

.position-management-container >>> .el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: white;
}

/* 复选框样式 */
.position-management-container >>> .el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.position-management-container >>> .el-checkbox {
  margin-right: 0;
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
  .position-management-container {
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
  
     .left-buttons {
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
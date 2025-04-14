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
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleBind(row)">绑定服务器</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
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
.edge-box-container {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-table {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 自定义表格样式 */
.custom-table >>> .el-table__header-wrapper th {
  font-weight: bold;
}

/* 移除表格竖线 */
.custom-table >>> .el-table__cell {
  border-right: none;
}

.custom-table >>> .el-table::before {
  height: 0;
}
</style>
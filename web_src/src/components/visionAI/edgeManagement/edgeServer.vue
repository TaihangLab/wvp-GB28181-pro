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
    <el-table :data="tableData" border style="width: 100%; text-align: center;">
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
          <el-button type="text" @click="handleManage(row)">管理</el-button>
          <el-button type="text" @click="handleAuthorize(row)">授权组织</el-button>
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
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
.edge-server-container {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box .el-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-table th, 
.el-table td {
  text-align: center;
}
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessageBox } from 'element-plus'

// 定义边缘服务器数据结构
interface EdgeServer {
  id: string
  name: string
  status: 'online' | 'offline'
  ipAddress: string
  domain?: string
  visionSkills: string[]
  dataCollectionRules?: string
  authorizedGroups: string[]
}

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表格数据
const tableData = ref<EdgeServer[]>([])

// 搜索关键词
const searchKeyword = ref('')

// 模拟数据
const allData: EdgeServer[] = [
  { id: '1', name: '北京集团绿源化工厂', status: 'offline', ipAddress: '192.168.1.4', visionSkills: [], authorizedGroups: [] },
  { id: '2', name: '北京集团热电公司', status: 'online', ipAddress: '192.168.1.3', visionSkills: [], authorizedGroups: [] },
  { id: '3', name: '北京集团水泥厂', status: 'offline', ipAddress: '192.168.1.2', visionSkills: [], authorizedGroups: [] },
  { id: '4', name: '北京集团化工厂', status: 'online', ipAddress: '192.168.1.1', visionSkills: [], authorizedGroups: [] },
  { id: '5', name: '中南石化', status: 'offline', ipAddress: '127.0.0.2', visionSkills: [], authorizedGroups: [] },
  { id: '6', name: '大树石化', status: 'online', ipAddress: '127.0.0.1', visionSkills: [], authorizedGroups: [] },
  { id: '7', name: '宝山自来水厂', status: 'offline', ipAddress: '10.68.208.94', visionSkills: [], authorizedGroups: [] },
  { id: '8', name: '白云港污水处理厂', status: 'online', ipAddress: '10.68.208.94', visionSkills: [], authorizedGroups: [] },
  { id: '9', name: '石油污水处理厂', status: 'offline', ipAddress: '10.68.208.94', visionSkills: [], authorizedGroups: [] },
  { id: '10', name: '秦港污水处理厂', status: 'online', ipAddress: '10.31.76.16', visionSkills: [], authorizedGroups: [] },
  // ... 添加更多模拟数据
]

// 加载表格数据
const loadTableData = () => {
  const filteredData = allData.filter(server => server.name.includes(searchKeyword.value))
  total.value = filteredData.length
  const start = (currentPage.value - 1) * pageSize.value
  tableData.value = filteredData.slice(start, start + pageSize.value)
}

// 弹框控制
const dialogVisible = ref(false)
const newServer = ref({
  name: '',
  ipAddress: '',
  status: 'online',
  domain: '',
  visionSkills: '',
  dataCollectionRules: '',
  authorizedGroups: ''
})

// 在 script 顶部添加这些变量
const isEditing = ref(false)
const editingId = ref('')

// 注册边缘服务器
const handleAddServer = () => {
  dialogVisible.value = true
}

// 确认注册
const confirmAddServer = () => {
  if (!newServer.value.name || !newServer.value.ipAddress) {
    ElMessageBox.alert('请填写名称和IP地址', '错误', { confirmButtonText: '确定' })
    return
  }
  
  const serverData = {
    name: newServer.value.name,
    ipAddress: newServer.value.ipAddress,
    status: newServer.value.status as 'online' | 'offline',
    domain: newServer.value.domain,
    visionSkills: newServer.value.visionSkills.split(',').map(skill => skill.trim()).filter(Boolean),
    dataCollectionRules: newServer.value.dataCollectionRules,
    authorizedGroups: newServer.value.authorizedGroups.split(',').map(group => group.trim()).filter(Boolean)
  }

  if (isEditing.value) {
    // 更新现有服务器
    const index = allData.findIndex(s => s.id === editingId.value)
    if (index !== -1) {
      allData[index] = { ...allData[index], ...serverData }
      ElMessageBox.alert('边缘服务器更新成功！', '成功', {
        confirmButtonText: '确定'
      })
    }
  } else {
    // 添加新服务器
    const newId = (allData.length + 1).toString()
    allData.push({ id: newId, ...serverData })
    ElMessageBox.alert('边缘服务器注册成功！', '成功', {
      confirmButtonText: '确定'
    })
  }

  loadTableData()
  dialogVisible.value = false
  resetForm()
}

// 管理功能  
const handleManage = (server: EdgeServer) => {
  ElMessageBox.alert(`管理边缘服务器: ${server.name}`, '管理', { 
    confirmButtonText: '确定',
    message: `
      <div>
        <p>服务器名称：${server.name}</p>
        <p>IP地址：${server.ipAddress}</p>
        <p>状态：${server.status === 'online' ? '在线' : '离线'}</p>
        <p>域名：${server.domain || '未设置'}</p>
        <p>视觉技能：${server.visionSkills.join(', ') || '未设置'}</p>
        <p>数据采集规则：${server.dataCollectionRules || '未设置'}</p>
        <p>授权组织：${server.authorizedGroups.join(', ') || '未设置'}</p>
      </div>
    `,
    dangerouslyUseHTMLString: true
  })
}

// 授权组织功能
const handleAuthorize = (server: EdgeServer) => {
  ElMessageBox.prompt('请输入要添加的授权组织（多个组织用逗号分隔）', '授权组织', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: server.authorizedGroups.join(', ')
  }).then(({ value }) => {
    const index = allData.findIndex(s => s.id === server.id)
    if (index !== -1) {
      allData[index].authorizedGroups = value.split(',').map(group => group.trim()).filter(Boolean)
      loadTableData()
      ElMessageBox.alert('授权组织更新成功！', '成功', {
        confirmButtonText: '确定'
      })
    }
  })
}

// 编辑功能
const handleEdit = (server: EdgeServer) => {
  newServer.value = {
    name: server.name,
    ipAddress: server.ipAddress,
    status: server.status,
    domain: server.domain || '',
    visionSkills: server.visionSkills.join(', '),
    dataCollectionRules: server.dataCollectionRules || '',
    authorizedGroups: server.authorizedGroups.join(', ')
  }
  
  // 修改弹框标题，区分是编辑还是新增
  isEditing.value = true
  editingId.value = server.id
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  newServer.value = {
    name: '',
    ipAddress: '',
    status: 'online',
    domain: '',
    visionSkills: '',
    dataCollectionRules: '',
    authorizedGroups: ''
  }
  isEditing.value = false
  editingId.value = ''
}

// 删除功能
const handleDelete = (server: EdgeServer) => {
  ElMessageBox.confirm(
    `确定要删除边缘服务器 "${server.name}" 吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = allData.findIndex(s => s.id === server.id)
    if (index !== -1) {
      allData.splice(index, 1)
      loadTableData()
      ElMessageBox.alert('删除成功！', '成功', {
        confirmButtonText: '确定'
      })
    }
  })
}

// 刷新数据
const handleRefresh = () => {
  loadTableData()
}

// 监听页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadTableData()
}

// 监听每页显示数量变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  loadTableData()
}

onMounted(() => {
  loadTableData()
})
</script>

<template>
  <div class="edge-server-container">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddServer">
        <el-icon><Plus /></el-icon>注册边缘服务器
      </el-button>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入边缘服务器名称关键字"
          clearable
          @input="loadTableData"
        >
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
  
    <!-- 边缘服务器列表 -->
    <el-table :data="tableData" border style="width: 100%; text-align: center;">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="边缘服务器名称" min-width="180" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ipAddress" label="IP地址" width="150" align="center" />
      <el-table-column prop="domain" label="域名" min-width="200" align="center" />
      <el-table-column prop="visionSkills" label="视觉技能" min-width="150" align="center" />
      <el-table-column prop="dataCollectionRules" label="数据采集规则" min-width="150" align="center" />
      <el-table-column prop="authorizedGroups" label="授权组织" min-width="150" align="center" />
      <el-table-column label="操作" fixed="right" width="280" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleManage(row)">管理</el-button>
          <el-button link type="primary" @click="handleAuthorize(row)">授权组织</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 注册边缘服务器弹框 -->
    <el-dialog 
      :title="isEditing ? '编辑边缘服务器' : '注册边缘服务器'"
      v-model="dialogVisible"
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddServer">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.edge-server-container {
  padding: 20px;

  .operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .search-box {
      display: flex;
      gap: 10px;
      
      .el-input {
        width: 300px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .el-table th, .el-table td {
    text-align: center; /* Center align table header and content */
  }
}
</style>
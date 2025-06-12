<template>
  <div class="node-management">
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <i class="el-icon-connection"></i>
          <span>节点管理</span>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加节点</el-button>
          <el-button type="success" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="node-table">
        <el-table :data="nodeList" v-loading="loading" stripe border>
          <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
          <el-table-column prop="nodeId" label="节点ID" width="150" align="center"></el-table-column>
          <el-table-column prop="name" label="节点名称" width="200" align="center"></el-table-column>
          <el-table-column prop="host" label="主机地址" width="150" align="center"></el-table-column>
          <el-table-column prop="port" label="端口" width="100" align="center"></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastHeartbeat" label="最后心跳" width="160" align="center">
            <template slot-scope="{ row }">
              {{ row.lastHeartbeat | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template slot-scope="{ row }">
              <el-button type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NodeManagement',
  data() {
    return {
      nodeList: [],
      loading: false
    }
  },
  filters: {
    formatDate(time) {
      if (!time) return '-';
      const date = new Date(time);
      return date.toLocaleString('zh-CN');
    }
  },
  created() {
    this.fetchNodeList();
  },
  methods: {
    fetchNodeList() {
      this.loading = true;
      setTimeout(() => {
        this.nodeList = [
          { 
            id: 1, 
            nodeId: 'node-001', 
            name: '主节点', 
            host: '192.168.1.10', 
            port: 5060, 
            status: 'online',
            lastHeartbeat: new Date()
          },
          { 
            id: 2, 
            nodeId: 'node-002', 
            name: '备用节点', 
            host: '192.168.1.11', 
            port: 5060, 
            status: 'offline',
            lastHeartbeat: new Date('2024-01-20 10:30:00')
          }
        ];
        this.loading = false;
      }, 1000);
    },
    handleAdd() {
      this.$message.info('添加功能开发中...');
    },
    handleEdit(row) {
      this.$message.info('编辑功能开发中...');
    },
    handleDelete(row) {
      this.$message.success('删除成功');
    },
    handleRefresh() {
      this.fetchNodeList();
    }
  }
}
</script>

<style scoped>
.node-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.page-title i {
  font-size: 20px;
  color: #909399;
  margin-right: 8px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.node-table {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}
</style> 
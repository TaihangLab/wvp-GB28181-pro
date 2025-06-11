<template>
  <div class="pull-proxy">
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <i class="el-icon-download"></i>
          <span>拉流代理管理</span>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加代理</el-button>
          <el-button type="success" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="proxy-table">
        <el-table :data="proxyList" v-loading="loading" stripe border>
          <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
          <el-table-column prop="name" label="代理名称" width="200" align="center"></el-table-column>
          <el-table-column prop="sourceUrl" label="源地址" width="300" align="center"></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '运行中' : '已停止' }}
              </el-tag>
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
  name: 'PullProxy',
  data() {
    return {
      proxyList: [],
      loading: false
    }
  },
  created() {
    this.fetchProxyList();
  },
  methods: {
    fetchProxyList() {
      this.loading = true;
      setTimeout(() => {
        this.proxyList = [
          { id: 1, name: '测试代理1', sourceUrl: 'rtmp://example.com/live/stream1', status: 'active' },
          { id: 2, name: '测试代理2', sourceUrl: 'rtsp://example.com:554/stream2', status: 'inactive' }
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
      this.fetchProxyList();
    }
  }
}
</script>

<style scoped>
.pull-proxy {
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
  color: #E6A23C;
  margin-right: 8px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.proxy-table {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}
</style> 
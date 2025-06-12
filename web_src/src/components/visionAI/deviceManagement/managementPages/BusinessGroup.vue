<template>
  <div class="business-group">
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <i class="el-icon-s-grid"></i>
          <span>业务分组管理</span>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加分组</el-button>
          <el-button type="success" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="group-table">
        <el-table :data="groupList" v-loading="loading" stripe border>
          <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
          <el-table-column prop="name" label="分组名称" width="200" align="center"></el-table-column>
          <el-table-column prop="code" label="分组编码" width="150" align="center"></el-table-column>
          <el-table-column prop="type" label="分组类型" width="120" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="getTypeColor(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceCount" label="设备数量" width="100" align="center"></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" align="left"></el-table-column>
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
  name: 'BusinessGroup',
  data() {
    return {
      groupList: [],
      loading: false
    }
  },
  created() {
    this.fetchGroupList();
  },
  methods: {
    fetchGroupList() {
      this.loading = true;
      setTimeout(() => {
        this.groupList = [
          {
            id: 1,
            name: '监控中心',
            code: 'BG001',
            type: 'security',
            deviceCount: 150,
            status: 'active',
            description: '主要负责安全监控设备管理'
          },
          {
            id: 2,
            name: '交通管理',
            code: 'BG002',
            type: 'traffic',
            deviceCount: 80,
            status: 'active',
            description: '交通路口监控设备'
          },
          {
            id: 3,
            name: '环境监测',
            code: 'BG003',
            type: 'environment',
            deviceCount: 45,
            status: 'inactive',
            description: '环境质量监测设备'
          }
        ];
        this.loading = false;
      }, 1000);
    },
    getTypeColor(type) {
      const colors = {
        security: 'danger',
        traffic: 'warning',
        environment: 'success',
        other: 'info'
      };
      return colors[type] || 'info';
    },
    getTypeText(type) {
      const texts = {
        security: '安防',
        traffic: '交通',
        environment: '环境',
        other: '其他'
      };
      return texts[type] || '未知';
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
      this.fetchGroupList();
    }
  }
}
</script>

<style scoped>
.business-group {
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
  color: #409EFF;
  margin-right: 8px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.group-table {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}
</style> 
<template>
  <div class="administrative-division">
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <i class="el-icon-location"></i>
          <span>行政区划管理</span>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加区划</el-button>
          <el-button type="success" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="division-table">
        <el-table :data="divisionList" v-loading="loading" stripe border row-key="id" tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column prop="name" label="区划名称" width="200" align="left"></el-table-column>
          <el-table-column prop="code" label="区划编码" width="150" align="center"></el-table-column>
          <el-table-column prop="level" label="级别" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="getLevelType(row.level)" size="small">{{ getLevelText(row.level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceCount" label="设备数量" width="100" align="center"></el-table-column>
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
  name: 'AdministrativeDivision',
  data() {
    return {
      divisionList: [],
      loading: false
    }
  },
  created() {
    this.fetchDivisionList();
  },
  methods: {
    fetchDivisionList() {
      this.loading = true;
      setTimeout(() => {
        this.divisionList = [
          {
            id: 1,
            name: '北京市',
            code: '110000',
            level: 1,
            deviceCount: 1200,
            description: '首都',
            children: [
              {
                id: 11,
                name: '东城区',
                code: '110101',
                level: 2,
                deviceCount: 300,
                description: '中心城区'
              },
              {
                id: 12,
                name: '西城区',
                code: '110102',
                level: 2,
                deviceCount: 280,
                description: '中心城区'
              }
            ]
          },
          {
            id: 2,
            name: '上海市',
            code: '310000',
            level: 1,
            deviceCount: 1500,
            description: '经济中心',
            children: [
              {
                id: 21,
                name: '黄浦区',
                code: '310101',
                level: 2,
                deviceCount: 250,
                description: '市中心区域'
              }
            ]
          }
        ];
        this.loading = false;
      }, 1000);
    },
    getLevelType(level) {
      const types = { 1: 'danger', 2: 'warning', 3: 'success', 4: 'info' };
      return types[level] || 'info';
    },
    getLevelText(level) {
      const texts = { 1: '省级', 2: '市级', 3: '区县', 4: '街道' };
      return texts[level] || '未知';
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
      this.fetchDivisionList();
    }
  }
}
</script>

<style scoped>
.administrative-division {
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
  color: #F56C6C;
  margin-right: 8px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.division-table {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}
</style> 
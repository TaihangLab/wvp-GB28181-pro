<template>
  <div class="push-streams">
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <i class="el-icon-upload2"></i>
          <span>推流列表管理</span>
        </div>
        <div class="page-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAddStream">添加推流</el-button>
          <el-button type="success" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- 搜索和筛选区域 -->
      <div class="search-filter-area">
        <div class="search-row">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入应用名或流ID搜索"
            style="width: 300px; margin-right: 16px;"
            clearable
            @keyup.enter.native="handleSearch"
            @clear="handleSearch">
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
          
          <el-select
            v-model="searchForm.status"
            placeholder="推流状态"
            style="width: 120px; margin-right: 16px;"
            clearable
            @change="handleSearch">
            <el-option label="推流中" value="active"></el-option>
            <el-option label="已停止" value="inactive"></el-option>
          </el-select>

          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </div>
      </div>

      <!-- 推流列表 -->
      <div class="stream-table">
        <el-table
          :data="streamList"
          v-loading="loading"
          element-loading-text="加载中..."
          empty-text="暂无推流数据"
          stripe
          border>
          
          <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
          
          <el-table-column prop="app" label="应用名" width="120" align="center"></el-table-column>
          <el-table-column prop="stream" label="流ID" width="200" align="center"></el-table-column>
          <el-table-column prop="name" label="流名称" width="180" align="center"></el-table-column>
          
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '推流中' : '已停止' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="protocol" label="协议" width="80" align="center"></el-table-column>
          <el-table-column prop="clientIp" label="客户端IP" width="130" align="center"></el-table-column>
          
          <el-table-column prop="startTime" label="开始时间" width="160" align="center">
            <template slot-scope="{ row }">
              {{ row.startTime | formatDate }}
            </template>
          </el-table-column>
          
          <el-table-column prop="duration" label="持续时长" width="120" align="center">
            <template slot-scope="{ row }">
              {{ formatDuration(row.duration) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button 
                v-if="row.status === 'active'"
                type="warning" 
                size="mini" 
                icon="el-icon-video-pause" 
                @click="handleStopStream(row)">
                停止
              </el-button>
              <el-button 
                v-else
                type="success" 
                size="mini" 
                icon="el-icon-video-play" 
                @click="handleStartStream(row)">
                启动
              </el-button>
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handlePreview(row)">
                预览
              </el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            :current-page.sync="currentPage"
            :page-size.sync="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PushStreams',
  data() {
    return {
      searchForm: {
        keyword: '',
        status: null
      },
      streamList: [],
      loading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0
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
    this.fetchStreamList();
  },
  
  methods: {
    fetchStreamList() {
      this.loading = true;
      setTimeout(() => {
        this.streamList = [
          {
            id: 1,
            app: 'live',
            stream: 'camera001',
            name: '监控摄像头001',
            status: 'active',
            protocol: 'rtmp',
            clientIp: '192.168.1.100',
            startTime: new Date('2024-01-20 09:30:00'),
            duration: 7200000
          }
        ];
        this.total = this.streamList.length;
        this.loading = false;
      }, 1000);
    },
    
    handleSearch() {
      console.log('搜索参数:', this.searchForm);
      this.fetchStreamList();
    },
    
    handleReset() {
      this.searchForm = {
        keyword: '',
        status: null
      };
      this.fetchStreamList();
    },
    
    handleRefresh() {
      this.fetchStreamList();
    },
    
    handleAddStream() {
      this.$message.info('添加推流功能开发中...');
    },
    
    handleDelete(row) {
      this.$confirm(`确定删除推流 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功');
        this.fetchStreamList();
      });
    },
    
    handleStartStream(row) {
      this.$message.success('推流启动成功');
      this.fetchStreamList();
    },
    
    handleStopStream(row) {
      this.$message.success('推流已停止');
      this.fetchStreamList();
    },
    
    handlePreview(row) {
      this.$message.info('预览功能开发中...');
    },
    
    formatDuration(duration) {
      if (!duration || duration === 0) return '-';
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchStreamList();
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchStreamList();
    }
  }
}
</script>

<style scoped>
.push-streams {
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
  color: #67C23A;
  margin-right: 8px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-filter-area {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-row {
  display: flex;
  align-items: center;
}

.stream-table {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-table .el-button--mini {
  padding: 5px 8px;
  font-size: 12px;
  margin: 0 2px;
}
</style> 
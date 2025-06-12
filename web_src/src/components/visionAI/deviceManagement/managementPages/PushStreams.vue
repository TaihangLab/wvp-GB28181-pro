<template>
  <div class="push-streams-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-upload2"></i>
          推流列表管理
        </h2>
        <p class="page-subtitle">管理和监控所有推流通道</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="addStream">
          添加推流
        </el-button>
        <el-button type="info" icon="el-icon-info" @click="importChannel">
          通道导入
        </el-button>
        <el-button icon="el-icon-download" type="primary">
          <a style="color: #FFFFFF; text-align: center; text-decoration: none" href="/static/file/推流通道导入.zip"
             download='推流通道导入.zip'>下载模板</a>
        </el-button>
        <el-button type="success" icon="el-icon-refresh" @click="refresh" :loading="loading">
          刷新列表
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <div class="search-row">
          <div class="search-item">
            <label>关键字搜索：</label>
            <el-input
              v-model="searchSrt"
              placeholder="应用名、流ID、名称"
              style="width: 220px;"
              clearable
              @input="getPushList"
              @keyup.enter.native="getPushList"
              @clear="getPushList">
              <i slot="prefix" class="el-icon-search"></i>
            </el-input>
          </div>
          
          <div class="search-item">
            <label>流媒体：</label>
            <el-select
              v-model="mediaServerId"
              placeholder="请选择"
              style="width: 120px;"
              clearable
              @change="getPushList">
              <el-option label="全部" value=""></el-option>
              <el-option
                v-for="item in mediaServerList"
                :key="item.id"
                :label="item.id"
                :value="item.id">
              </el-option>
            </el-select>
          </div>

          <div class="search-item">
            <label>推流状态：</label>
            <el-select
              v-model="pushing"
              placeholder="请选择"
              style="width: 120px;"
              clearable
              @change="getPushList">
              <el-option label="全部" value=""></el-option>
              <el-option label="推流中" value="true"></el-option>
              <el-option label="已停止" value="false"></el-option>
            </el-select>
          </div>

          <div class="search-actions">
            <el-button type="primary" icon="el-icon-search" @click="getPushList">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 推流统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon online">
            <i class="el-icon-video-play"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ streamStats.pushing }}</div>
            <div class="stat-label">推流中</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon offline">
            <i class="el-icon-video-pause"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ streamStats.stopped }}</div>
            <div class="stat-label">已停止</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon total">
            <i class="el-icon-menu"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ total }}</div>
            <div class="stat-label">总数量</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 推流列表 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title">推流列表</span>
        <div class="card-actions">
          <el-button-group>
            <el-button :type="viewMode === 'table' ? 'primary' : ''" icon="el-icon-menu" @click="viewMode = 'table'">列表</el-button>
            <el-button :type="viewMode === 'card' ? 'primary' : ''" icon="el-icon-s-grid" @click="viewMode = 'card'">卡片</el-button>
          </el-button-group>
          <el-button
            icon="el-icon-delete"
            size="mini"
            :disabled="multipleSelection.length === 0"
            type="danger"
            @click="batchDel">
            批量删除 ({{multipleSelection.length}})
          </el-button>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'">
        <el-table
          ref="pushListTable"
          :data="pushList"
          v-loading="loading"
          element-loading-text="加载中..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          empty-text="暂无推流数据"
          style="width: 100%"
          :height="tableHeight"
          stripe
          border
          @selection-change="handleSelectionChange"
          :row-key="(row)=> row.app + row.stream">
        
        <el-table-column type="selection" :reserve-selection="true" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        
        <el-table-column prop="gbName" label="名称" min-width="160" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div class="stream-name">
              <i class="el-icon-video-camera stream-icon"></i>
              <span>{{ row.gbName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="app" label="应用名" min-width="100" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="stream" label="流ID" min-width="180" align="center" show-overflow-tooltip></el-table-column>
        
        <el-table-column label="推流状态" min-width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="medium" v-if="row.pushing && Vue.prototype.$myServerId !== row.serverId" style="border-color: #ecf1af">推流中</el-tag>
            <el-tag size="medium" v-if="row.pushing && Vue.prototype.$myServerId === row.serverId">推流中</el-tag>
            <el-tag size="medium" type="info" v-if="!row.pushing">已停止</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="gbDeviceId" label="国标编码" min-width="180" align="center" show-overflow-tooltip></el-table-column>
        
        <el-table-column label="位置信息" min-width="150" align="center">
          <template slot-scope="{ row }">
            <div v-if="row.gbLongitude && row.gbLatitude" class="location-info">
              <div>{{ row.gbLongitude }}</div>
              <div>{{ row.gbLatitude }}</div>
            </div>
            <el-tag v-else size="small" type="info">无</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="mediaServerId" label="流媒体" min-width="120" align="center" show-overflow-tooltip></el-table-column>
        
        <el-table-column label="开始时间" min-width="160" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.pushTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="350" align="center" fixed="right">
          <template slot-scope="{ row }">
            <div class="operation-buttons">
              <el-button 
                size="mini" 
                :loading="row.playLoading" 
                icon="el-icon-video-play" 
                @click="playPush(row)" 
                type="primary">
                播放
              </el-button>
              <el-button 
                size="mini" 
                icon="el-icon-edit" 
                type="success" 
                @click="edit(row)">
                编辑
              </el-button>
              <el-button 
                size="mini" 
                icon="el-icon-cloudy" 
                type="info" 
                @click="queryCloudRecords(row)">
                云端录像
              </el-button>
              <el-button 
                size="mini" 
                icon="el-icon-delete" 
                type="danger" 
                @click="deletePush(row.id)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="stream-cards">
        <div v-for="stream in pushList" :key="stream.app + stream.stream" class="stream-card-item">
          <el-card shadow="hover" class="stream-card">
            <div class="stream-card-header">
              <div class="stream-status-badge">
                <el-badge 
                  :type="stream.pushing ? 'success' : 'danger'" 
                  is-dot 
                  class="status-dot">
                </el-badge>
              </div>
              <div class="stream-title">
                <h4>{{ stream.gbName || '未命名推流' }}</h4>
                <p>{{ stream.app }}/{{ stream.stream }}</p>
              </div>
            </div>
            
            <div class="stream-card-content">
              <div class="stream-info-row">
                <span class="info-label">应用名：</span>
                <span class="info-value">{{ stream.app || '未知' }}</span>
              </div>
              <div class="stream-info-row">
                <span class="info-label">流ID：</span>
                <span class="info-value">{{ stream.stream || '未知' }}</span>
              </div>
              <div class="stream-info-row">
                <span class="info-label">国标编码：</span>
                <span class="info-value">{{ stream.gbDeviceId || '无' }}</span>
              </div>
              <div class="stream-info-row">
                <span class="info-label">流媒体：</span>
                <span class="info-value">{{ stream.mediaServerId || '未知' }}</span>
              </div>
              <div class="stream-info-row">
                <span class="info-label">开始时间：</span>
                <span class="info-value">{{ stream.pushTime || '无' }}</span>
              </div>
              <div class="stream-info-row" v-if="stream.gbLongitude && stream.gbLatitude">
                <span class="info-label">位置信息：</span>
                <span class="info-value">{{ stream.gbLongitude }}, {{ stream.gbLatitude }}</span>
              </div>
            </div>
            
            <div class="stream-card-actions">
              <div class="action-row">
                <el-button size="mini" type="primary" icon="el-icon-video-play" :loading="stream.playLoading" @click="playPush(stream)">
                  播放
                </el-button>
                <el-button size="mini" type="success" icon="el-icon-edit" @click="edit(stream)">
                  编辑
                </el-button>
              </div>
              <div class="action-row">
                <el-button size="mini" type="info" icon="el-icon-cloudy" @click="queryCloudRecords(stream)">
                  云端录像
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deletePush(stream.id)">
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="count"
          :page-sizes="[15, 25, 35, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="currentChange">
        </el-pagination>
      </div>
    </el-card>

    <!-- 弹窗组件 -->
    <devicePlayer ref="devicePlayer"></devicePlayer>
    <importChannel ref="importChannel"></importChannel>
    <stream-push-edit v-if="streamPush" :streamPush="streamPush" :closeEdit="closeEdit"></stream-push-edit>
  </div>
</template>

<script>
import devicePlayer from './dialogs/devicePlayer.vue'
import importChannel from './dialogs/importChannel.vue'
import MediaServer from './service/MediaServer'
import StreamPushEdit from "./dialogs/StreamPushEdit";
import Vue from "vue";

export default {
  name: 'PushStreams',
  components: {
    StreamPushEdit,
    devicePlayer,
    importChannel,
  },
  data() {
    return {
      pushList: [], //推流列表
      currentPage: 1,
      count: 15,
      total: 0,
      searchSrt: "",
      pushing: "",
      mediaServerId: "",
      mediaServerList: [],
      multipleSelection: [],
      loading: false,
      streamPush: null,
      updateLooper: 0, //数据刷新轮训标志
      mediaServerObj: new MediaServer(),
      tableHeight: 400,
      viewMode: 'table' // table | card
    }
  },
  
  computed: {
    Vue() {
      return Vue
    },
    streamStats() {
      const pushing = this.pushList.filter(item => item.pushing).length;
      const stopped = this.pushList.filter(item => !item.pushing).length;
      return {
        pushing,
        stopped
      }
    }
  },
  
  mounted() {
    this.initData();
    this.updateLooper = setInterval(this.getPushList, 2000);
    this.calculateTableHeight();
    window.addEventListener('resize', this.calculateTableHeight);
  },
  
  destroyed() {
    clearTimeout(this.updateLooper);
    window.removeEventListener('resize', this.calculateTableHeight);
  },
  
  methods: {
    initData: function () {
      this.loading = true;
      this.mediaServerObj.getOnlineMediaServerList((data) => {
        this.mediaServerList = data.data;
      })
      this.getPushList();
    },
    
    calculateTableHeight() {
      this.$nextTick(() => {
        const windowHeight = window.innerHeight;
        const headerHeight = 200; // 页面头部高度
        const searchHeight = 100; // 搜索区域高度
        const statsHeight = 120; // 统计卡片高度
        const paginationHeight = 80; // 分页高度
        const padding = 60; // 额外间距
        this.tableHeight = windowHeight - headerHeight - searchHeight - statsHeight - paginationHeight - padding;
        if (this.tableHeight < 300) this.tableHeight = 300;
      });
    },
    
    currentChange: function (val) {
      this.currentPage = val;
      this.getPushList();
    },
    
    handleSizeChange: function (val) {
      this.count = val;
      this.getPushList();
    },
    
    getPushList: function () {
      let that = this;
      this.$axios({
        method: 'get',
        url: `/api/push/list`,
        params: {
          page: that.currentPage,
          count: that.count,
          query: that.searchSrt,
          pushing: that.pushing,
          mediaServerId: that.mediaServerId,
        }
      }).then(function (res) {
          if (res.data.code === 0) {
            that.total = res.data.data.total;
            that.pushList = res.data.data.list;
            that.pushList.forEach(e => {
              that.$set(e, "location", "");
              that.$set(e, "playLoading", false);
              if (e.gbLongitude && e.gbLatitude) {
                that.$set(e, "location", e.gbLongitude + "," + e.gbLatitude);
              }
            });
          }
      }).catch(function (error) {
        console.error(error);
      }).finally(()=>{
        this.loading = false;
      })
    },

    playPush: function (row) {
      row.playLoading = true;
      this.$axios({
        method: 'get',
        url: '/api/push/start',
        params: {
          id: row.id
        }
      }).then((res) =>{
        if (res.data.code === 0 ) {
          this.$refs.devicePlayer.openDialog("streamPlay", null, null, {
            streamInfo: res.data.data,
            hasAudio: true
          });
        }else {
          this.$message.error(res.data.msg);
        }
      }).catch(function (error) {
        console.error(error);
      }).finally(()=>{
        row.playLoading = false;
      })
    },
    
    deletePush: function (id) {
      this.$confirm(`确定删除通道?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        this.$axios({
          method: "post",
          url: "/api/push/remove",
          params: {
            id: id,
          }
        }).then((res) => {
          if (res.data.code === 0) {
            this.initData()
          }
        }).catch(function (error) {
          console.error(error);
        });
      }).catch(() => {

      });
    },
    
    edit: function (row) {
      this.streamPush = row
    },
    
    // 结束编辑
    closeEdit: function (){
      this.streamPush = null
      this.getPushList()
    },
    
    queryCloudRecords: function (row) {
      this.$router.push(`/cloudRecordDetail/${row.app}/${row.stream}`)
    },
    
    importChannel: function () {
      this.$refs.importChannel.openDialog(() => {

      })
    },
    
    addStream: function (){
      this.streamPush = {}
    },
    
    batchDel: function () {
      this.$confirm(`确定删除选中的${this.multipleSelection.length}个通道?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = []
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id)
        }
        let that = this;
        that.$axios({
          method: "delete",
          url: "/api/push/batchRemove",
          data: {
            ids: ids
          }
        }).then((res) => {
          this.initData();
          this.$refs.pushListTable.clearSelection();
        }).catch(function (error) {
          console.error(error);
        });
      }).catch(() => {

      });
    },
    
    handleSelectionChange: function (val) {
      this.multipleSelection = val;
    },
    
    refresh: function () {
      this.initData();
    },
    
    handleReset() {
      this.searchSrt = '';
      this.pushing = '';
      this.mediaServerId = '';
      this.getPushList();
    }
  }
}
</script>

<style scoped>
.push-streams-container {
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-left .page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.header-left .page-title i {
  margin-right: 12px;
  font-size: 32px;
}

.header-left .page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.header-right .el-button {
  margin-left: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
}

.header-right .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-form .search-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-weight: 600;
  color: #606266;
  white-space: nowrap;
}

.search-actions {
  margin-left: auto;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon.online {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.offline {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon i {
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* 表格卡片样式 */
.table-card {
  flex: 1;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f8f9fa !important;
  color: #606266;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
}

.stream-name {
  display: flex;
  align-items: center;
}

.stream-icon {
  margin-right: 8px;
  color: #409EFF;
}

.location-info {
  font-size: 12px;
  line-height: 1.2;
}

.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.operation-buttons .el-button--mini {
  padding: 6px 8px;
  font-size: 12px;
}

/* 卡片视图样式 */
.stream-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.stream-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.stream-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stream-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
}

.stream-status-badge {
  position: absolute;
  top: 0;
  right: 0;
}

.stream-title {
  flex: 1;
}

.stream-title h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stream-title p {
  margin: 0;
  font-size: 13px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

.stream-card-content {
  margin-bottom: 16px;
}

.stream-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #303133;
  font-weight: 600;
  flex: 1;
  text-align: right;
  word-break: break-all;
}

.stream-card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-row {
  display: flex;
  gap: 8px;
}

.action-row .el-button {
  flex: 1;
  font-size: 12px;
  min-width: 0;
  text-align: center;
  padding: 7px 8px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-pagination {
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .push-streams-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .search-form .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-actions {
    margin-left: 0;
    margin-top: 16px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .operation-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .operation-buttons .el-button--mini {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .stream-cards {
    grid-template-columns: 1fr;
  }
  
  .action-row {
    flex-direction: column;
  }
  
  .action-row .el-button {
    margin-bottom: 4px;
  }
}
</style> 
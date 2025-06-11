<template>
  <div class="gb-devices-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-video-camera"></i>
          国标设备管理
        </h2>
        <p class="page-subtitle">管理和监控所有GB28181国标设备</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddDevice">
          添加设备
        </el-button>
        <el-button type="info" icon="el-icon-info" @click="showInfo">
          平台信息
        </el-button>
        <el-button type="success" icon="el-icon-refresh" @click="handleRefresh" :loading="getDeviceListLoading">
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
              v-model="searchForm.query"
              placeholder="设备编号、名称"
              style="width: 220px;"
              clearable
              @keyup.enter.native="handleSearch"
              @clear="handleSearch">
              <i slot="prefix" class="el-icon-search"></i>
            </el-input>
          </div>
          
          <div class="search-item">
            <label>在线状态：</label>
            <el-select
              v-model="searchForm.status"
              placeholder="请选择"
              style="width: 120px;"
              clearable
              @change="handleSearch">
              <el-option label="在线" value="true"></el-option>
              <el-option label="离线" value="false"></el-option>
            </el-select>
          </div>

          <div class="search-actions">
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 设备统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon online">
            <i class="el-icon-video-camera"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ deviceStats.online }}</div>
            <div class="stat-label">在线设备</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon offline">
            <i class="el-icon-video-pause"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ deviceStats.offline }}</div>
            <div class="stat-label">离线设备</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon total">
            <i class="el-icon-box"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ deviceStats.total }}</div>
            <div class="stat-label">设备总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon channels">
            <i class="el-icon-menu"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ deviceStats.channels }}</div>
            <div class="stat-label">通道总数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 设备列表 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title">设备列表</span>
        <div class="card-actions">
          <el-button-group>
            <el-button :type="viewMode === 'table' ? 'primary' : ''" icon="el-icon-menu" @click="viewMode = 'table'">列表</el-button>
            <el-button :type="viewMode === 'card' ? 'primary' : ''" icon="el-icon-s-grid" @click="viewMode = 'card'">卡片</el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'">
        <el-table
          :data="deviceList"
          v-loading="loading"
          element-loading-text="加载中..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          empty-text="暂无设备数据"
          style="width: 100%"
          :height="tableHeight"
          stripe
          border
          @selection-change="handleSelectionChange">
          
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
          
          <el-table-column prop="name" label="设备名称" min-width="160" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <div class="device-name">
                <i class="el-icon-video-camera device-icon"></i>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="deviceId" label="设备编号" min-width="180" align="center" show-overflow-tooltip></el-table-column>
          
          <el-table-column label="网络地址" min-width="140" align="center">
            <template slot-scope="{ row }">
              <el-tag v-if="row.hostAddress" size="small" type="info">{{ row.hostAddress }}</el-tag>
              <el-tag v-else size="small" type="warning">未知</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="manufacturer" label="厂商" min-width="100" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="transport" label="信令传输" min-width="100" align="center"></el-table-column>
          
          <el-table-column label="流传输模式" min-width="140" align="center">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.streamMode"
                size="mini"
                @change="handleStreamModeChange(row)"
                style="width: 120px">
                <el-option label="UDP" value="UDP"></el-option>
                <el-option label="TCP主动" value="TCP-ACTIVE"></el-option>
                <el-option label="TCP被动" value="TCP-PASSIVE"></el-option>
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="通道数" width="80" align="center">
            <template slot-scope="{ row }">
              <span class="channel-count">{{ row.channelCount || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <div slot="reference" class="name-wrapper">
                <el-tag size="medium" v-if="row.onLine && Vue.prototype.$myServerId !== row.serverId" style="border-color: #ecf1af">在线</el-tag>
                <el-tag size="medium" v-if="row.onLine && Vue.prototype.$myServerId === row.serverId">在线</el-tag>
                <el-tag size="medium" type="info" v-if="!row.onLine">离线</el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="订阅状态" min-width="180" align="center">
            <template slot-scope="{ row }">
              <div class="subscribe-status">
                <el-tooltip content="目录订阅" placement="top">
                  <el-checkbox 
                    :checked="row.subscribeCycleForCatalog > 0"
                    @change="(e) => handleSubscribeForCatalog(row.id, e)"
                    size="mini">目录</el-checkbox>
                </el-tooltip>
                <el-tooltip content="位置订阅" placement="top">
                  <el-checkbox 
                    :checked="row.subscribeCycleForMobilePosition > 0"
                    @change="(e) => handleSubscribeForMobilePosition(row.id, e)"
                    size="mini">位置</el-checkbox>
                </el-tooltip>
                <el-tooltip content="报警订阅" placement="top">
                  <el-checkbox 
                    :checked="row.subscribeCycleForAlarm > 0"
                    disabled
                    size="mini">报警</el-checkbox>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="keepaliveTime" label="最近心跳" min-width="140" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="registerTime" label="最近注册" min-width="140" align="center" show-overflow-tooltip></el-table-column>
          
          <el-table-column label="操作" width="280" align="center" fixed="right">
            <template slot-scope="{ row }">
              <div class="operation-buttons">
                <el-tooltip content="刷新设备" placement="top">
                  <el-button 
                    type="primary" 
                    size="mini" 
                    icon="el-icon-refresh" 
                    :disabled="!row.onLine"
                    @click="handleRefreshDevice(row)">刷新</el-button>
                </el-tooltip>
                
                <el-tooltip content="查看通道" placement="top">
                  <el-button 
                    type="success" 
                    size="mini" 
                    icon="el-icon-video-camera"
                    @click="handleViewChannels(row)">通道</el-button>
                </el-tooltip>
                
                <el-tooltip content="编辑设备" placement="top">
                  <el-button 
                    type="info" 
                    size="mini" 
                    icon="el-icon-edit"
                    @click="handleEditDevice(row)">编辑</el-button>
                </el-tooltip>
                
                <el-dropdown @command="(command) => handleMoreActions(command, row)" trigger="click">
                  <el-button size="mini" type="text">
                    更多<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="delete" style="color: #f56c6c">
                      <i class="el-icon-delete"></i> 删除设备
                    </el-dropdown-item>
                    <el-dropdown-item command="setGuard" :disabled="!row.onLine">
                      <i class="el-icon-lock"></i> 布防
                    </el-dropdown-item>
                    <el-dropdown-item command="resetGuard" :disabled="!row.onLine">
                      <i class="el-icon-unlock"></i> 撤防
                    </el-dropdown-item>
                    <el-dropdown-item command="syncBasicParam" :disabled="!row.onLine">
                      <i class="el-icon-setting"></i> 基础配置同步
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="device-cards">
        <div v-for="device in deviceList" :key="device.deviceId" class="device-card-item">
          <el-card shadow="hover" class="device-card">
            <div class="device-card-header">
              <div class="device-status-badge">
                <el-badge 
                  :type="device.onLine ? 'success' : 'danger'" 
                  is-dot 
                  class="status-dot">
                </el-badge>
              </div>
              <div class="device-title">
                <h4>{{ device.name }}</h4>
                <p>{{ device.deviceId }}</p>
              </div>
            </div>
            
            <div class="device-card-content">
              <div class="device-info-row">
                <span class="info-label">厂商：</span>
                <span class="info-value">{{ device.manufacturer || '未知' }}</span>
              </div>
              <div class="device-info-row">
                <span class="info-label">地址：</span>
                <span class="info-value">{{ device.hostAddress || '未知' }}</span>
              </div>
              <div class="device-info-row">
                <span class="info-label">通道：</span>
                <span class="info-value">{{ device.channelCount }} 个</span>
              </div>
              <div class="device-info-row">
                <span class="info-label">心跳：</span>
                <span class="info-value">{{ device.keepaliveTime || '无' }}</span>
              </div>
            </div>
            
            <div class="device-card-actions">
              <el-button size="mini" type="primary" icon="el-icon-video-camera" @click="handleViewChannels(device)">
                通道
              </el-button>
              <el-button size="mini" type="info" icon="el-icon-edit" @click="handleEditDevice(device)">
                编辑
              </el-button>
              <el-button size="mini" type="success" icon="el-icon-refresh" :disabled="!device.onLine" @click="handleRefreshDevice(device)">
                刷新
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page.sync="currentPage"
          :page-size.sync="pageSize"
          :page-sizes="[15, 25, 35, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>

    <!-- 设备编辑对话框 -->
    <deviceEdit ref="deviceEdit"></deviceEdit>
    
    <!-- 通道列表对话框 -->
    <GBDeviceChannels ref="deviceChannels"></GBDeviceChannels>
    
    <!-- 同步进度对话框 -->
    <SyncChannelProgress ref="syncChannelProgress" @refresh="handleRefresh"></SyncChannelProgress>
    
    <!-- 平台信息对话框 -->
    <configInfo ref="configInfo"></configInfo>
  </div>
</template>

<script>
import deviceEdit from '../../../dialog/deviceEdit.vue'
import GBDeviceChannels from './dialogs/GBDeviceChannels.vue'
import SyncChannelProgress from './dialogs/SyncChannelProgress.vue'
import configInfo from '../../../dialog/configInfo.vue'
import Vue from 'vue'

export default {
  name: 'GBDevices',
  components: {
    deviceEdit,
    GBDeviceChannels,
    SyncChannelProgress,
    configInfo
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        query: '',
        status: null
      },
      
      // 设备列表数据
      deviceList: [],
      loading: false,
      getDeviceListLoading: false,
      currentPage: 1,
      pageSize: 15,
      total: 0,
      selectedDevices: [],
      
      // 视图模式
      viewMode: 'table', // table | card
      
      // 设备统计
      deviceStats: {
        online: 0,
        offline: 0,
        total: 0,
        channels: 0
      },
      
      // 表格高度
      tableHeight: 600,
      
      // 轮询定时器
      updateLooper: null,
      
      // 服务ID
      serverId: null
    }
  },
  
  computed: {
    Vue() {
      return Vue
    }
  },
  
  created() {
    this.initData();
  },
  
  mounted() {
    this.calculateTableHeight();
    window.addEventListener('resize', this.calculateTableHeight);
    // 启动轮询
    this.updateLooper = setInterval(this.getDeviceList, 30000);
  },
  
  beforeDestroy() {
    if (this.updateLooper) {
      clearInterval(this.updateLooper);
    }
    window.removeEventListener('resize', this.calculateTableHeight);
  },
  
  methods: {
    // 初始化数据
    initData() {
      this.currentPage = 1;
      this.total = 0;
      this.getDeviceList();
    },
    
    // 计算表格高度
    calculateTableHeight() {
      this.$nextTick(() => {
        const windowHeight = window.innerHeight;
        const headerHeight = 200; // 大概的头部高度
        const paginationHeight = 80; // 分页高度
        const padding = 100; // 其他间距
        this.tableHeight = windowHeight - headerHeight - paginationHeight - padding;
        if (this.tableHeight < 400) {
          this.tableHeight = 400;
        }
      });
    },
    
    // 获取设备列表
    getDeviceList() {
      this.loading = true;
      this.getDeviceListLoading = true;
      
      const params = {
        page: this.currentPage,
        count: this.pageSize,
        query: this.searchForm.query,
        status: this.searchForm.status
      };
      

      
      this.$axios({
        method: 'get',
        url: '/api/device/query/devices',
        params: params
      }).then((res) => {
        if (res.data.code === 0) {
          this.total = res.data.data.total;
          this.deviceList = res.data.data.list;
          this.updateDeviceStats();
        } else {
          this.$message.error('获取设备列表失败：' + res.data.msg);
        }
      }).catch((error) => {
        console.error('获取设备列表失败:', error);
        this.$message.error('获取设备列表失败：' + error.message);
      }).finally(() => {
        this.loading = false;
        this.getDeviceListLoading = false;
      });
    },
    
    // 更新设备统计
    updateDeviceStats() {
      let online = 0;
      let offline = 0;
      let channels = 0;
      
      this.deviceList.forEach(device => {
        if (device.onLine) {
          online++;
        } else {
          offline++;
        }
        channels += device.channelCount || 0;
      });
      
      this.deviceStats = {
        online,
        offline,
        total: this.total,
        channels
      };
    },
    
    // 搜索
    handleSearch() {
      this.currentPage = 1;
      this.getDeviceList();
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        query: '',
        status: null
      };
      this.handleSearch();
    },
    
    // 刷新
    handleRefresh() {
      this.initData();
    },
    
    // 显示平台信息
    showInfo() {
      this.$axios({
        method: 'get',
        url: `/api/server/system/configInfo`,
      }).then((res) => {
        if (res.data.code === 0) {
          this.serverId = res.data.data.addOn.serverId;
          this.$refs.configInfo.openDialog(res.data.data);
        }
      }).catch((error) => {
        this.$message.error('获取平台信息失败：' + error.message);
      });
    },
    
    // 添加设备
    handleAddDevice() {
      this.$refs.deviceEdit.openDialog(null, () => {
        this.$refs.deviceEdit.close();
        this.$message({
          showClose: true,
          message: "添加成功",
          type: "success",
        });
        setTimeout(this.getDeviceList, 200);
      });
    },
    
    // 编辑设备
    handleEditDevice(row) {
      this.$refs.deviceEdit.openDialog(row, () => {
        this.$refs.deviceEdit.close();
        this.$message({
          showClose: true,
          message: "设备修改成功，通道字符集将在下次更新生效",
          type: "success",
        });
        setTimeout(this.getDeviceList, 200);
      });
    },
    
    // 刷新单个设备
    handleRefreshDevice(row) {
      this.$axios({
        method: 'get',
        url: `/api/device/query/devices/${row.deviceId}/sync`
      }).then((res) => {
        if (res.data.code !== 0) {
          this.$message.error(res.data.msg);
        } else {
          if (res.data.data && res.data.data.errorMsg) {
            this.$message.error(res.data.data.errorMsg);
            return;
          }
          this.$refs.syncChannelProgress.openDialog(row.deviceId, () => {
            this.handleRefresh();
          });
        }
      }).catch((error) => {
        console.error('刷新设备失败:', error);
        this.$message.error('刷新设备失败：' + error.message);
      });
    },
    
    // 查看通道
    handleViewChannels(row) {
      this.$refs.deviceChannels.openDialog(row);
    },
    
    // 流传输模式改变
    handleStreamModeChange(row) {
      this.$axios({
        method: 'post',
        url: `/api/device/query/transport/${row.deviceId}/${row.streamMode}`
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('传输模式修改成功');
        } else {
          this.$message.error('传输模式修改失败：' + res.data.msg);
        }
      }).catch((error) => {
        console.error('修改传输模式失败:', error);
        this.$message.error('修改传输模式失败：' + error.message);
      });
    },
    
    // 订阅目录
    handleSubscribeForCatalog(deviceId, value) {
      this.$axios({
        method: 'get',
        url: '/api/device/query/subscribe/catalog',
        params: {
          id: deviceId,
          cycle: value ? 60 : 0
        }
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success(value ? '订阅成功' : '取消订阅成功');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((error) => {
        this.$message.error('操作失败：' + error.message);
      });
    },
    
    // 订阅位置
    handleSubscribeForMobilePosition(deviceId, value) {
      this.$axios({
        method: 'get',
        url: '/api/device/query/subscribe/mobile-position',
        params: {
          id: deviceId,
          cycle: value ? 60 : 0,
          interval: value ? 5 : 0
        }
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success(value ? '订阅成功' : '取消订阅成功');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((error) => {
        this.$message.error('操作失败：' + error.message);
      });
    },
    
    // 更多操作
    handleMoreActions(command, row) {
      switch (command) {
        case 'delete':
          this.handleDeleteDevice(row);
          break;
        case 'setGuard':
          this.handleSetGuard(row);
          break;
        case 'resetGuard':
          this.handleResetGuard(row);
          break;
        case 'syncBasicParam':
          this.handleSyncBasicParam(row);
          break;
        default:
          break;
      }
    },
    
    // 删除设备
    handleDeleteDevice(row) {
      let msg = '确定删除此设备？';
      if (row.onLine) {
        msg = '在线设备删除后仍可通过注册再次上线。<br/>如需彻底删除请先将设备离线。<br/><strong>确定删除此设备？</strong>';
      }
      
      this.$confirm(msg, '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          method: 'delete',
          url: `/api/device/query/devices/${row.deviceId}/delete`
        }).then((res) => {
          if (res.data.code === 0) {
            this.$message.success('删除成功');
            this.handleRefresh();
          } else {
            this.$message.error('删除失败：' + res.data.msg);
          }
        }).catch((error) => {
          console.error('删除设备失败:', error);
          this.$message.error('删除失败：' + error.message);
        });
      });
    },
    
    // 布防
    handleSetGuard(row) {
      this.$axios({
        method: 'get',
        url: `/api/device/control/guard/${row.deviceId}/SetGuard`
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('布防成功');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((error) => {
        this.$message.error('布防失败：' + error.message);
      });
    },
    
    // 撤防
    handleResetGuard(row) {
      this.$axios({
        method: 'get',
        url: `/api/device/control/guard/${row.deviceId}/ResetGuard`
      }).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('撤防成功');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((error) => {
        this.$message.error('撤防失败：' + error.message);
      });
    },
    
    // 同步基础参数
    handleSyncBasicParam(row) {
      this.$axios({
        method: 'get',
        url: `/api/device/config/query/${row.deviceId}/BasicParam`
      }).then((res) => {
        if (res.data.code === 0) {
          const basicParam = res.data.data.BasicParam;
          this.$message.success(`配置已同步，当前心跳间隔：${basicParam.HeartBeatInterval} 心跳计数：${basicParam.HeartBeatCount}`);
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((error) => {
        this.$message.error('同步失败：' + error.message);
      });
    },
    
    // 选择改变
    handleSelectionChange(selection) {
      this.selectedDevices = selection;
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      this.getDeviceList();
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDeviceList();
    }
  }
}
</script>

<style scoped>
.gb-devices-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
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

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
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
  font-size: 24px;
  color: white;
}

.stat-icon.online {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.stat-icon.offline {
  background: linear-gradient(135deg, #F56C6C, #f78989);
}

.stat-icon.total {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
}

.stat-icon.channels {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.stat-info .stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-info .stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 表格卡片 */
.table-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
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

.device-name {
  display: flex;
  align-items: center;
}

.device-icon {
  margin-right: 8px;
  color: #409EFF;
}

.subscribe-status {
  display: flex;
  gap: 8px;
}

.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

.operation-buttons .el-button--mini {
  padding: 6px 8px;
  font-size: 12px;
}

/* 卡片视图 */
.device-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.device-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.device-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
}

.device-status-badge {
  position: absolute;
  top: 0;
  right: 0;
}

.device-title h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.device-title p {
  margin: 0;
  font-size: 13px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

.device-card-content {
  margin-bottom: 16px;
}

.device-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #303133;
  font-weight: 600;
}

.device-card-actions {
  display: flex;
  gap: 8px;
}

.device-card-actions .el-button {
  flex: 1;
  font-size: 12px;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-pagination {
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gb-devices-container {
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
  
  .device-cards {
    grid-template-columns: 1fr;
  }
}

/* 通道数样式 */
.channel-count {
  display: inline-block;
  padding: 4px 8px;
  background-color: #f0f9ff;
  color: #1d4ed8;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #dbeafe;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .gb-devices-container {
    background-color: #1a1a1a;
  }
  
  .channel-count {
    background-color: #1e3a8a;
    color: #dbeafe;
    border-color: #1e40af;
  }
}
</style> 
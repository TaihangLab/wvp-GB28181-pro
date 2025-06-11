<template>
  <el-dialog
    title="设备同步进度"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    :show-close="false"
    custom-class="sync-progress-dialog">
    
    <div class="sync-content">
      <div class="sync-header">
        <div class="device-info">
          <h4>{{ deviceName || '设备同步' }}</h4>
          <p class="device-id">设备编码：{{ deviceId }}</p>
        </div>
        <div class="sync-status">
          <el-tag :type="syncStatus === 'success' ? 'success' : syncStatus === 'error' ? 'danger' : 'primary'">
            {{ syncStatusText }}
          </el-tag>
        </div>
      </div>
      
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">同步进度</span>
          <span class="progress-text">{{ current }}/{{ total }}</span>
        </div>
        
        <el-progress
          :percentage="progressPercentage"
          :status="syncStatus === 'error' ? 'exception' : syncStatus === 'success' ? 'success' : null"
          :stroke-width="20"
          text-inside>
        </el-progress>
        
        <div class="progress-details">
          <div class="detail-item">
            <i class="el-icon-time"></i>
            <span>已用时间：{{ elapsedTime }}</span>
          </div>
          <div class="detail-item">
            <i class="el-icon-timer"></i>
            <span>预计剩余：{{ estimatedTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="sync-logs">
        <div class="logs-header">
          <span class="logs-title">同步日志</span>
          <el-button type="text" size="mini" @click="clearLogs" v-if="logs.length > 0">
            <i class="el-icon-delete"></i> 清空日志
          </el-button>
        </div>
        
        <div class="logs-content" ref="logsContent">
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="['log-item', `log-${log.type}`]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="no-logs">
            暂无同步日志...
          </div>
        </div>
      </div>
      
      <div v-if="errorMessage" class="error-section">
        <el-alert
          :title="errorMessage"
          type="error"
          :closable="false"
          show-icon>
        </el-alert>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button v-if="syncStatus === 'syncing'" @click="handleCancel" type="warning">
        取消同步
      </el-button>
      <el-button v-if="syncStatus !== 'syncing'" @click="handleRetry" type="primary">
        重新同步
      </el-button>
      <el-button @click="handleClose" :type="syncStatus === 'syncing' ? 'danger' : 'default'">
        {{ syncStatus === 'syncing' ? '强制关闭' : '关闭' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SyncChannelProgress',
  data() {
    return {
      dialogVisible: false,
      deviceId: '',
      deviceName: '',
      
      // 同步状态
      syncStatus: 'syncing', // syncing, success, error
      current: 0,
      total: 0,
      errorMessage: '',
      
      // 时间相关
      startTime: null,
      elapsedSeconds: 0,
      
      // 日志
      logs: [],
      
      // 轮询定时器
      pollTimer: null,
      timeTimer: null,
      
      // 回调函数
      callback: null
    }
  },
  
  computed: {
    progressPercentage() {
      if (this.total === 0) return 0;
      return Math.round((this.current / this.total) * 100);
    },
    
    syncStatusText() {
      switch (this.syncStatus) {
        case 'syncing':
          return '同步中';
        case 'success':
          return '同步完成';
        case 'error':
          return '同步失败';
        default:
          return '未知状态';
      }
    },
    
    elapsedTime() {
      const minutes = Math.floor(this.elapsedSeconds / 60);
      const seconds = this.elapsedSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    estimatedTime() {
      if (this.current === 0 || this.syncStatus !== 'syncing') return '--:--';
      
      const avgTimePerItem = this.elapsedSeconds / this.current;
      const remainingItems = this.total - this.current;
      const estimatedSeconds = Math.round(avgTimePerItem * remainingItems);
      
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = estimatedSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  
  methods: {
    // 打开对话框
    openDialog(deviceId, callback = null) {
      if (!deviceId) {
        this.$message.error('设备ID不能为空');
        return;
      }
      
      this.deviceId = deviceId;
      this.callback = callback;
      this.dialogVisible = true;
      
      // 重置状态
      this.resetSyncState();
      
      // 开始同步
      this.startSync();
    },
    
    // 重置同步状态
    resetSyncState() {
      this.syncStatus = 'syncing';
      this.current = 0;
      this.total = 0;
      this.errorMessage = '';
      this.elapsedSeconds = 0;
      this.logs = [];
      
      // 清除定时器
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      if (this.timeTimer) {
        clearInterval(this.timeTimer);
        this.timeTimer = null;
      }
    },
    
    // 开始同步
    startSync() {
      this.startTime = Date.now();
      this.addLog('info', '开始同步设备通道...');
      
      // 启动时间计时器
      this.timeTimer = setInterval(() => {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
      
      // 启动轮询检查同步状态
      this.pollTimer = setInterval(this.checkSyncStatus, 2000);
      
      // 立即检查一次
      this.checkSyncStatus();
    },
    
    // 检查同步状态
    checkSyncStatus() {
      this.$axios({
        method: 'get',
        url: `/api/device/query/${this.deviceId}/sync_status`
      }).then((res) => {
        if (res.data.code === 0) {
          const data = res.data.data;
          
          // 检查data是否为null
          if (!data) {
            // 如果数据为空，可能是同步还未开始或已结束
            this.addLog('info', '等待同步状态...');
            return;
          }
          
          // 更新设备名称
          if (data.deviceName && !this.deviceName) {
            this.deviceName = data.deviceName;
          }
          
          // 检查是否有错误信息
          if (data.errorMsg) {
            this.handleSyncError(data.errorMsg);
            return;
          }
          
          // 更新进度
          this.current = data.current || 0;
          this.total = data.total || 0;
          
          // 添加进度日志
          if (this.current > 0) {
            this.addLog('info', `正在同步第 ${this.current} 个通道，共 ${this.total} 个`);
          }
          
          // 检查是否完成
          if (data.completed || (this.total > 0 && this.current >= this.total)) {
            this.handleSyncSuccess();
          }
        } else {
          this.handleSyncError(res.data.msg || '获取同步状态失败');
        }
      }).catch((error) => {
        console.error('检查同步状态失败:', error);
        this.handleSyncError('网络错误，无法获取同步状态');
      });
    },
    
    // 同步成功
    handleSyncSuccess() {
      this.syncStatus = 'success';
      this.addLog('success', `同步完成！共同步 ${this.total} 个通道`);
      
      // 清除定时器
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      if (this.timeTimer) {
        clearInterval(this.timeTimer);
        this.timeTimer = null;
      }
      
      this.$message.success('设备同步完成');
      
      // 延迟关闭对话框
      setTimeout(() => {
        if (this.callback) {
          this.callback();
        }
        this.handleClose();
      }, 2000);
    },
    
    // 同步失败
    handleSyncError(errorMsg) {
      this.syncStatus = 'error';
      this.errorMessage = errorMsg;
      this.addLog('error', `同步失败：${errorMsg}`);
      
      // 清除定时器
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      if (this.timeTimer) {
        clearInterval(this.timeTimer);
        this.timeTimer = null;
      }
      
      this.$message.error('设备同步失败');
    },
    
    // 添加日志
    addLog(type, message) {
      const now = new Date();
      const time = now.toLocaleTimeString();
      
      this.logs.push({
        type,
        time,
        message
      });
      
      // 限制日志数量
      if (this.logs.length > 100) {
        this.logs.splice(0, this.logs.length - 100);
      }
      
      // 自动滚动到底部
      this.$nextTick(() => {
        const logsContent = this.$refs.logsContent;
        if (logsContent) {
          logsContent.scrollTop = logsContent.scrollHeight;
        }
      });
    },
    
    // 清空日志
    clearLogs() {
      this.logs = [];
    },
    
    // 取消同步
    handleCancel() {
      this.$confirm('确定要取消同步操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用取消同步API
        this.$axios({
          method: 'post',
          url: `/api/device/query/${this.deviceId}/cancel_sync`
        }).then((res) => {
          if (res.data.code === 0) {
            this.addLog('warning', '用户取消了同步操作');
            this.syncStatus = 'error';
            this.errorMessage = '用户取消了同步操作';
          } else {
            this.$message.error('取消同步失败：' + res.data.msg);
          }
        }).catch((error) => {
          console.error('取消同步失败:', error);
          this.$message.error('取消同步失败：' + error.message);
        });
      });
    },
    
    // 重新同步
    handleRetry() {
      this.resetSyncState();
      this.startSync();
    },
    
    // 关闭对话框
    handleClose() {
      if (this.syncStatus === 'syncing') {
        this.$confirm('同步正在进行中，确定要关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doClose();
        });
      } else {
        this.doClose();
      }
    },
    
    // 执行关闭
    doClose() {
      this.dialogVisible = false;
      
      // 清除定时器
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      if (this.timeTimer) {
        clearInterval(this.timeTimer);
        this.timeTimer = null;
      }
      
      // 重置状态
      setTimeout(() => {
        this.resetSyncState();
        this.deviceId = '';
        this.deviceName = '';
        this.callback = null;
      }, 300);
    }
  },
  
  beforeDestroy() {
    // 组件销毁时清除定时器
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
    }
  }
}
</script>

<style scoped>
.sync-progress-dialog {
  border-radius: 8px;
}

.sync-content {
  padding: 10px 0;
}

.sync-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.device-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.device-info .device-id {
  margin: 0;
  color: #606266;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-weight: 600;
  color: #303133;
}

.progress-text {
  color: #606266;
  font-family: 'Courier New', monospace;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.detail-item i {
  margin-right: 6px;
  color: #909399;
}

.sync-logs {
  margin-bottom: 16px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logs-title {
  font-weight: 600;
  color: #303133;
}

.logs-content {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.log-item {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  line-height: 1.4;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  flex-shrink: 0;
  width: 80px;
  color: #909399;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin-right: 12px;
}

.log-message {
  flex: 1;
  color: #606266;
}

.log-info .log-message {
  color: #606266;
}

.log-success .log-message {
  color: #67C23A;
  font-weight: 500;
}

.log-error .log-message {
  color: #F56C6C;
  font-weight: 500;
}

.log-warning .log-message {
  color: #E6A23C;
  font-weight: 500;
}

.no-logs {
  padding: 20px;
  text-align: center;
  color: #C0C4CC;
  font-style: italic;
}

.error-section {
  margin-bottom: 16px;
}

.dialog-footer {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

/* 滚动条样式 */
.logs-content::-webkit-scrollbar {
  width: 6px;
}

.logs-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.logs-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.logs-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sync-progress-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .sync-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .progress-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .logs-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .sync-header {
    border-bottom-color: #2c2c2c;
  }
  
  .progress-details {
    background: #2c2c2c;
  }
  
  .logs-content {
    background: #2c2c2c;
    border-color: #444;
  }
  
  .log-item {
    border-bottom-color: #444;
  }
  
  .dialog-footer {
    border-top-color: #2c2c2c;
  }
}
</style> 
<template>
  <div class="page-container">
    <!-- 左侧设备列表 -->
    <div class="device-list">
      <div class="list-header">设备列表</div>
      <div class="search-bar">
        <input type="text" placeholder="输入关键字搜索" />
      </div>
      <div class="list-content">
        <!-- 电力行业设备组 -->
        <div class="industry-group">
          <div class="industry-header" @click="toggleIndustry('power')">
            <i class="el-icon-arrow-down" :class="{ 'is-open': industryStatus.power }"></i>
            电力行业
          </div>
          <div class="industry-devices" v-show="industryStatus.power">
            <div class="device-item">
              <span>监控设备1</span>
              <span class="status-tag online">在线</span>
            </div>
            <div class="device-item">
              <span>监控设备2</span>
              <span class="status-tag offline">离线</span>
            </div>
          </div>
        </div>
        
        <!-- 油气行业设备组 -->
        <div class="industry-group">
          <div class="industry-header" @click="toggleIndustry('oil')">
            <i class="el-icon-arrow-down" :class="{ 'is-open': industryStatus.oil }"></i>
            油气行业
          </div>
          <div class="industry-devices" v-show="industryStatus.oil">
            <div class="device-item">
              <span>摄像头01</span>
              <span class="status-tag online">在线</span>
            </div>
            <div class="device-item">
              <span>消防设备</span>
              <span class="status-tag offline">离线</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间监控区域 -->
    <div class="monitoring-container">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="view-modes">
          <button 
            v-for="mode in ['single', 'four', 'nine']" 
            :key="mode"
            :class="{ active: viewMode === mode }"
            @click="switchViewMode(mode)"
          >
            {{ mode === 'single' ? '单屏' : mode === 'four' ? '四分屏' : '九分屏' }}
          </button>
        </div>
        <!-- 优化全屏按钮 -->
        <button 
          class="fullscreen-btn"
          :class="{ active: isFullscreen, disabled: selectedCamera === null }"
          :disabled="selectedCamera === null"
          @click="toggleFullscreen"
        >
          <span class="btn-icon">
            <i class="fullscreen-icon"></i>
          </span>
          <span class="btn-text">{{ isFullscreen ? '退出全屏' : '全屏监控' }}</span>
        </button>
      </div>

      <!-- 视频网格区域 -->
      <div 
        class="video-grid" 
        :class="[viewMode, { fullscreen: isFullscreen }]"
      >
        <template v-if="!isFullscreen">
          <div 
            v-for="index in generateGrids()" 
            :key="index"
            class="video-cell"
            :class="{ selected: selectedCamera === index }"
            @click="selectCamera(index)"
          >
            <div class="video-header">
              摄像头 {{ index }}
            </div>
            <div class="video-content">
              <div class="video-placeholder" :data-timestamp="currentDateTime" :data-camera="formatCameraName(index)">
                监控画面 {{ index }}
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="video-cell fullscreen">
            <div class="video-header">
              摄像头 {{ selectedCamera }}
            </div>
            <div class="video-content">
              <div class="video-placeholder" :data-timestamp="currentDateTime" :data-camera="formatCameraName(selectedCamera)">
                监控画面 {{ selectedCamera }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧预警信息 -->
    <div class="warning-list">
      <div class="list-header">实时预警</div>
      <div class="list-content">
        <div v-for="warning in warningList" 
             :key="warning.id" 
             class="warning-item"
             :class="warning.level">
          <div class="warning-video">
            <div class="video-placeholder">
              预警监控画面
            </div>
          </div>
          <div class="warning-info">
            <div class="warning-time">{{ warning.time }}</div>
            <div class="warning-detail">
              <div>{{ warning.device }}</div>
              <div>{{ warning.type }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RealTimeMonitoring",
  data() {
    return {
      // 视图模式：single, four, nine
      viewMode: 'four',
      // 选中的摄像头ID
      selectedCamera: null,
      // 是否全屏显示
      isFullscreen: false,
      // 当前时间戳
      currentDateTime: '',
      // 定时更新器
      timer: null,
      // 设备列表数据
      deviceList: [
        { id: 1, name: '摄像头01', status: 'online' },
        { id: 2, name: '摄像头02', status: 'offline' },
        { id: 3, name: '摄像头03', status: 'online' },
        { id: 4, name: '摄像头04', status: 'online' },
      ],
      // 预警列表数据
      warningList: [
        { id: 1, time: '10:30:25', device: '摄像头01', type: '未戴安全帽', level: 'high' },
        { id: 2, time: '10:28:15', device: '摄像头03', type: '未穿工作服', level: 'medium' },
      ],
      // 行业状态
      industryStatus: {
        power: true,
        oil: true
      }
    }
  },
  mounted() {
    // 启动时间更新定时器
    this.updateDateTime();
    this.timer = setInterval(this.updateDateTime, 1000);
  },
  beforeDestroy() {
    // 组件销毁时清理
    document.body.classList.remove('camera-fullscreen-mode');
    clearInterval(this.timer);
  },
  methods: {
    // 生成测试数据
    generateGrids() {
      if (this.viewMode === 'single') return [1]
      if (this.viewMode === 'four') return [1, 2, 3, 4]
      return [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    // 切换视图模式
    switchViewMode(mode) {
      this.viewMode = mode
      this.isFullscreen = false // 切换视图模式时退出全屏
      this.selectedCamera = null
      // 确保退出全屏模式
      document.body.classList.remove('camera-fullscreen-mode')
    },
    // 选择摄像头
    selectCamera(index) {
      this.selectedCamera = this.selectedCamera === index ? null : index
    },
    // 切换全屏显示
    toggleFullscreen() {
      if (this.selectedCamera !== null) {
        this.isFullscreen = !this.isFullscreen
        
        // 通过添加body类控制全屏样式
        if (this.isFullscreen) {
          document.body.classList.add('camera-fullscreen-mode')
        } else {
          document.body.classList.remove('camera-fullscreen-mode')
        }
      }
    },
    // 更新当前日期时间戳
    updateDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // 获取星期几
      const weekDay = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
      
      this.currentDateTime = `${year}年${month}月${day}日 星期${weekDay} ${hours}:${minutes}:${seconds}`;
    },
    // 格式化摄像头名称
    formatCameraName(index) {
      return `Camera ${String(index).padStart(2, '0')}`;
    },
    // 切换行业状态
    toggleIndustry(industry) {
      this.industryStatus[industry] = !this.industryStatus[industry];
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  margin: 0;
  padding: 16px;
  gap: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  display: flex;
  overflow: hidden;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

/* 左侧设备列表样式调整 - 增强色彩 */
.device-list {
  width: 240px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 32px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border-top: 3px solid #409eff;
}

.device-list .list-header {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(to right, #f0f5ff, #f5f7fa);
  color: #303133;
}

.device-list .search-bar {
  padding: 10px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

.device-list .search-bar input {
  width: 80%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  background-color: #f5f7fa;
}

.device-list .search-bar input::placeholder {
  color: #a0a9b8;
}

.device-list .list-content {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.device-list .list-content .industry-group {
  margin-bottom: 8px;
}

.device-list .list-content .industry-header {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.device-list .list-content .industry-header i {
  margin-right: 6px;
  transition: transform 0.3s;
  font-size: 12px;
  color: #909399;
}

.device-list .list-content .industry-header i.is-open {
  transform: rotate(90deg);
}

.device-list .list-content .industry-devices {
  padding: 0 16px 0 32px;
}

.device-list .list-content .device-item {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  border-radius: 0;
  margin-bottom: 0;
  border-bottom: 1px solid #f2f6fc;
}

.device-list .list-content .device-item:last-child {
  border-bottom: none;
}

.device-list .list-content .device-item .status-tag {
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
}

.device-list .list-content .device-item .status-tag.online {
  background: #f0f9eb;
  color: #67c23a;
}

.device-list .list-content .device-item .status-tag.offline {
  background: #fff0f1;
  color: #f56c6c;
}

/* 中间监控区域样式 */
.monitoring-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 600px;
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 8px;
  height: 100%;
  max-height: calc(100vh - 32px);
}

.monitoring-container .toolbar {
  padding: 6px 0;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.monitoring-container .toolbar::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(64, 158, 255, 0.3), transparent);
}

.monitoring-container .toolbar .view-modes {
  display: flex;
  gap: 10px;
}

.monitoring-container .toolbar .view-modes button {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  color: #606266;
}

.monitoring-container .toolbar .view-modes button::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(to bottom, rgba(64, 158, 255, 0.1), transparent);
  transition: height 0.3s;
}

.monitoring-container .toolbar .view-modes button:hover {
  color: #409eff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.monitoring-container .toolbar .view-modes button:hover::before {
  height: 100%;
}

.monitoring-container .toolbar .view-modes button.active {
  color: white;
  border-color: #409eff;
  background: linear-gradient(135deg, #409eff, #1890ff);
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);
}

.monitoring-container .toolbar .fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.monitoring-container .toolbar .fullscreen-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(to bottom, rgba(64, 158, 255, 0.1), transparent);
  transition: height 0.3s;
}

.monitoring-container .toolbar .fullscreen-btn:hover::before {
  height: 100%;
}

.monitoring-container .toolbar .fullscreen-btn:hover:not(.disabled) {
  color: #409eff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.monitoring-container .toolbar .fullscreen-btn.active {
  background: linear-gradient(135deg, #409eff, #1890ff);
  color: white;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.monitoring-container .toolbar .fullscreen-btn .btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitoring-container .toolbar .fullscreen-btn .fullscreen-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23409eff"><path d="M3 3h7v2H5v5H3V3m18 0h-7v2h5v5h2V3M3 21h7v-2H5v-5H3v7m18 0h-7v-2h5v-5h2v7"/></svg>');
  background-size: cover;
  transition: all 0.3s ease;
}

.monitoring-container .toolbar .fullscreen-btn.active .fullscreen-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M3 3h7v2H5v5H3V3m18 0h-7v2h5v5h2V3M3 21h7v-2H5v-5H3v7m18 0h-7v-2h5v-5h2v7"/></svg>');
}

.monitoring-container .toolbar .fullscreen-btn .btn-text {
  font-weight: 500;
}

.monitoring-container .toolbar .fullscreen-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

.monitoring-container .video-grid {
  display: grid;
  gap: 12px;
  height: calc(100vh - 130px);
}

.monitoring-container .video-grid.single {
  grid-template-columns: 1fr;
}

.monitoring-container .video-grid.four {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.monitoring-container .video-grid.nine {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.monitoring-container .video-grid .video-cell {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.monitoring-container .video-grid .video-cell .video-header {
  padding: 6px 10px;
  background: linear-gradient(to right, #0062cc, #1890ff);
  border-bottom: none;
  font-weight: 500;
  font-size: 13px;
  color: white;
}

.monitoring-container .video-grid .video-cell .video-content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: #171e2e;
}

.monitoring-container .video-grid .video-cell .video-content .video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 0;
}

.monitoring-container .video-grid .video-cell .video-content .video-placeholder::before {
  content: attr(data-timestamp);
  position: absolute;
  left: 10px;
  top: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
  font-size: 12px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  z-index: 3;
}

.monitoring-container .video-grid .video-cell .video-content .video-placeholder::after {
  content: attr(data-camera);
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
  font-size: 12px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  z-index: 3;
}

.monitoring-container .video-grid .video-cell:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.monitoring-container .video-grid .video-cell.selected {
  border: 2px solid #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

.monitoring-container .video-grid .video-cell.fullscreen {
  height: 100%;
}

.monitoring-container .video-grid .video-cell.fullscreen .video-content {
  height: calc(100% - 30px);
}

.monitoring-container .video-grid.fullscreen {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

/* 全屏模式下的水印文本样式 */
body.camera-fullscreen-mode .video-cell .video-content .video-placeholder::before {
  content: attr(data-timestamp) !important;
  position: absolute !important;
  left: 12px !important;
  top: 12px !important;
  color: #409eff !important;
  font-family: monospace !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  z-index: 3 !important;
}

body.camera-fullscreen-mode .video-cell .video-content .video-placeholder::after {
  content: attr(data-camera) !important;
  position: absolute !important;
  right: 12px !important;
  bottom: 12px !important;
  color: #409eff !important;
  font-family: monospace !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  z-index: 3 !important;
}

/* 右侧预警列表样式调整 */
.warning-list {
  width: 300px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 32px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border-top: 3px solid #f56c6c;
}

.warning-list .list-header {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(to right, #fff0f0, #fff5f5);
  color: #f56c6c;
}

.warning-list .list-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #fafbfc;
}

.warning-list .list-content .warning-item {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  position: relative;
  overflow: hidden;
}

.warning-list .list-content .warning-item.high {
  border-left: 4px solid #f56c6c;
}

.warning-list .list-content .warning-item.high::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 24px 24px 0;
  border-color: transparent #ffeeee transparent transparent;
}

.warning-list .list-content .warning-item.medium {
  border-left: 4px solid #e6a23c;
}

.warning-list .list-content .warning-item.medium::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 24px 24px 0;
  border-color: transparent #fff8e6 transparent transparent;
}

.warning-list .list-content .warning-item .warning-video {
  width: 100%;
  height: 130px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  padding: 0;
  position: relative;
}

.warning-list .list-content .warning-item .warning-video .video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 0;
}

.warning-list .list-content .warning-item .warning-info .warning-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  font-weight: 500;
}

.warning-list .list-content .warning-item .warning-info .warning-detail {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}
</style>

<!-- 全局样式，处理全屏模式 -->
<style>
/* 全屏状态下的页面容器 */
body.camera-fullscreen-mode .page-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  height: 100vh !important;
  width: 100vw !important;
  padding: 0 !important;
  margin: 0 !important;
  background: linear-gradient(135deg, #0a1526, #1e3a70) !important;
}

/* 隐藏顶部菜单栏 */
body.camera-fullscreen-mode #app > div:not(.page-container) {
  display: none !important;
}

/* 全屏状态下隐藏设备列表和预警列表 */
body.camera-fullscreen-mode .device-list,
body.camera-fullscreen-mode .warning-list {
  display: none !important;
}

/* 全屏状态下调整监控容器样式 */
body.camera-fullscreen-mode .monitoring-container {
  max-width: 100% !important;
  width: 100% !important;
  padding: 16px !important;
  height: 100vh !important;
}

/* 全屏状态下视频网格占满屏幕 */
body.camera-fullscreen-mode .video-grid {
  height: calc(100vh - 70px) !important;
}

/* 全屏状态下工具栏样式调整 */
body.camera-fullscreen-mode .toolbar {
  background: rgba(0, 0, 0, 0.7) !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  margin-bottom: 16px !important;
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  z-index: 10 !important;
  width: auto !important;
}

/* 全屏状态下按钮样式调整 */
body.camera-fullscreen-mode .toolbar button {
  color: white !important;
  border-color: #555 !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

body.camera-fullscreen-mode .toolbar button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* 确保全屏模式下没有滚动条 */
body.camera-fullscreen-mode {
  overflow: hidden !important;
}

/* 全屏模式下视频单元格样式 */
body.camera-fullscreen-mode .video-cell {
  border-width: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

body.camera-fullscreen-mode .video-cell .video-header {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  font-size: 15px !important;
  padding: 12px 16px !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

body.camera-fullscreen-mode .video-cell .video-content {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: 100% !important;
}

body.camera-fullscreen-mode .video-cell .video-content .video-placeholder {
  background: linear-gradient(135deg, #102948, #1e3c72) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

/* 添加监控视频常见的日期时间水印 */
body.camera-fullscreen-mode .video-cell .video-content .video-placeholder::before {
  content: attr(data-timestamp) !important;
  position: absolute !important;
  left: 10px !important;
  top: 10px !important;
  color: white !important;
  font-family: monospace !important;
  font-size: 14px !important;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.7) !important;
  z-index: 3 !important;
}

/* 添加摄像头ID水印 */
body.camera-fullscreen-mode .video-cell .video-content .video-placeholder::after {
  content: attr(data-camera) !important;
  position: absolute !important;
  right: 10px !important;
  bottom: 10px !important;
  color: white !important;
  font-family: monospace !important;
  font-size: 14px !important;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.7) !important;
  z-index: 3 !important;
}

/* 视频控制面板 */
body.camera-fullscreen-mode .video-controls {
  position: absolute !important;
  bottom: 10px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  background: rgba(0,0,0,0.5) !important;
  padding: 5px 10px !important;
  border-radius: 4px !important;
  display: flex !important;
  gap: 10px !important;
  z-index: 10 !important;
}

body.camera-fullscreen-mode .video-controls button {
  background: transparent !important;
  border: none !important;
  color: white !important;
  cursor: pointer !important;
  padding: 5px !important;
}
</style>

<template>
  <div class="page-container">
    <!-- 左侧设备列表 -->
    <div class="device-list">
      <div class="list-header">设备列表</div>
      <div class="list-content">
        <div v-for="device in deviceList" 
             :key="device.id" 
             class="device-item"
             :class="{ 'offline': device.status === 'offline' }">
          <span class="status-dot"></span>
          <span>{{ device.name }}</span>
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
      ]
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
    }
  }
}
</script>

<style scoped>
.page-container {
  height: calc(100vh - 120px); /* 预留顶部菜单栏空间 */
  min-height: 700px;
  display: flex;
  padding: 16px;
  gap: 16px;
  background: #f0f2f5;
  overflow: auto;
  transition: all 0.3s ease;
}

/* 左侧设备列表样式 */
.device-list {
  width: 240px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.device-list .list-header {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
}

.device-list .list-content {
  flex: 1;
  padding: 4px;
  overflow-y: auto;
}

.device-list .list-content .device-item {
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
}

.device-list .list-content .device-item:hover {
  background: #f5f5f5;
}

.device-list .list-content .device-item .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #52c41a;
}

.device-list .list-content .device-item.offline {
  color: #999;
}

.device-list .list-content .device-item.offline .status-dot {
  background: #ff4d4f;
}

/* 中间监控区域样式 */
.monitoring-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 600px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
}

.monitoring-container .toolbar {
  padding: 4px 0;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitoring-container .toolbar .view-modes {
  display: flex;
  gap: 8px;
}

.monitoring-container .toolbar .view-modes button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
}

.monitoring-container .toolbar .view-modes button:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.monitoring-container .toolbar .view-modes button.active {
  color: #1890ff;
  border-color: #1890ff;
}

.monitoring-container .toolbar .fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M3 3h7v2H5v5H3V3m18 0h-7v2h5v5h2V3M3 21h7v-2H5v-5H3v7m18 0h-7v-2h5v-5h2v7"/></svg>');
  background-size: cover;
  transition: all 0.3s ease;
}

.monitoring-container .toolbar .fullscreen-btn:hover:not(.disabled) {
  background: linear-gradient(to bottom, #ffffff, #f0f7ff);
  border-color: #1890ff;
  color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
}

.monitoring-container .toolbar .fullscreen-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);
}

.monitoring-container .toolbar .fullscreen-btn.active .fullscreen-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M3 3h7v2H5v5H3V3m18 0h-7v2h5v5h2V3M3 21h7v-2H5v-5H3v7m18 0h-7v-2h5v-5h2v7"/></svg>');
}

.monitoring-container .toolbar .fullscreen-btn.active:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.monitoring-container .toolbar .fullscreen-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f5f5f5;
  border-color: #d9d9d9;
  box-shadow: none;
}

.monitoring-container .toolbar .fullscreen-btn .btn-text {
  font-weight: 500;
}

.monitoring-container .video-grid {
  display: grid;
  gap: 8px;
  height: 500px;
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
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
}

.monitoring-container .video-grid .video-cell .video-header {
  padding: 4px 8px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  font-size: 12px;
}

.monitoring-container .video-grid .video-cell .video-content {
  flex: 1;
  position: relative;
}

.monitoring-container .video-grid .video-cell .video-content .video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.monitoring-container .video-grid .video-cell:hover {
  border-color: #1890ff;
}

.monitoring-container .video-grid .video-cell.selected {
  border: 2px solid #1890ff;
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

/* 右侧预警列表样式 */
.warning-list {
  width: 300px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.warning-list .list-header {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #f0f0f0;
}

.warning-list .list-content {
  flex: 1;
  padding: 4px;
  overflow-y: auto;
}

.warning-list .list-content .warning-item {
  padding: 8px;
  background: #fff1f0;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 13px;
}

.warning-list .list-content .warning-item.high {
  background: #fff1f0;
  border-left: 3px solid #ff4d4f;
}

.warning-list .list-content .warning-item.medium {
  background: #fff7e6;
  border-left: 3px solid #ffa940;
}

.warning-list .list-content .warning-item .warning-video {
  width: 100%;
  height: 120px;
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.warning-list .list-content .warning-item .warning-video .video-placeholder {
  width: 100%;
  height: 100%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.warning-list .list-content .warning-item .warning-info .warning-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.warning-list .list-content .warning-item .warning-info .warning-detail {
  font-size: 13px;
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
  background: #000 !important;
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
  height: calc(100vh - 60px) !important;
}

/* 全屏状态下工具栏样式调整 */
body.camera-fullscreen-mode .toolbar {
  background: rgba(0, 0, 0, 0.7) !important;
  padding: 8px 16px !important;
  border-radius: 4px !important;
  margin-bottom: 16px !important;
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
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
}

body.camera-fullscreen-mode .video-cell .video-header {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  font-size: 14px !important;
  padding: 8px !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2 !important;
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
  background: url("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAEsAZADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDOJpM0E0mavQwKTNGaTNNIY6im5paLFXFoptFFhcwUUlLSsK4UUUUCuFJS0lACUUppKBiUGlpKAsJRRRQMKSijigQUUUlMBaSnUlAxKSlxSUCEooPWkoGLSUtJQIKSikoAWkpaSgBKDRSUwCkpaSgApKWkoASkNLSGgBtJSmkoASilpKQxKQ0tIaYhtIaWkNSUMNFLikNMY004+XNIacRlM0hjKM0UU2UJmikNJmoLHUUmaKQXCiii5I6ikpQKLjHZozxTc0maLjJM0UgNFO47i5pM0AUtJiuJRRRSGFFFFABRRRQAUGikoADSUUlMAooooAKKKSgQ4GloFLTGJRRRQISiikoGFJS0lABSUtJQAlFFFMAoopKAA0lFJQACkpaSgANIaKQ0ANpDQaSgApKWkNIYlJS0hpgMNJinEU2pGANPzlaZTc8UxkYpKM0VMYUUUUAFFLikoGFFFNoAcDTqZT80aBYKKKKkYhpppaQ0DEop1NpgFFFFAgooooAKKKKACkoooEJRRSGmAUUlFAAaQ0tJSGJRRRTAKSlpKBAaSlpDQMQ0hpTSUDEpKWkoASiiigYUlLTaBAaQ0tIaAG0hpTSUhhSUtIaACkpTSGgBtJTqbTJG0lOpKQDadUNPBqkJokopu6lpoTQGmUuaY3WkDYlFAooJuFFFGaAFFFJS0FDs0lGKTFBIuafUeKkBpMaHUUUUhiE03FP7U3FMYlJTsUYoASikNJTAWkpaSgQlApcUlABRS4pKAEpDSmmmgApDQaQ0DEpDQaSgBDSUpptAwoNFJQAUlLSUAJSGlppoASim7qXNMQ6im5paQwzSZpc0maYDRThTaejZoaAfSGiiokFxhopTSVJQUlApKQgooopiBaeDUGakWpaKTJaKQ0hNIQppabS5pjFpabmlzSGFFFFACUUGmk0XHYWlpopwouAUmKKKQxhptPIplMApKWimIKQ0tJQMbSGlNJQAmaSiigBKaacabQAUhopDQAlJS0lAAabTjTaYCU006m0ALmim5opD1P//Z") !important;
  background-size: cover !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0 !important; /* 隐藏原文字 */
  color: transparent !important;
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

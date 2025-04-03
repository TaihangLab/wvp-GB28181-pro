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
              <div class="video-placeholder">
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
              <div class="video-placeholder">
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

<script setup lang="ts">
import { ref } from 'vue'

// 定义视图模式
const viewMode = ref('four')

// 选中的摄像头ID
const selectedCamera = ref<number | null>(null)

// 是否全屏显示
const isFullscreen = ref(false)

// 生成测试数据
const generateGrids = () => {
  if (viewMode.value === 'single') return [1]
  if (viewMode.value === 'four') return [1, 2, 3, 4]
  return [1, 2, 3, 4, 5, 6, 7, 8, 9]
}

// 设备列表数据
const deviceList = ref([
  { id: 1, name: '摄像头01', status: 'online' },
  { id: 2, name: '摄像头02', status: 'offline' },
  { id: 3, name: '摄像头03', status: 'online' },
  { id: 4, name: '摄像头04', status: 'online' },
])

// 预警列表数据
const warningList = ref([
  { id: 1, time: '10:30:25', device: '摄像头01', type: '未戴安全帽', level: 'high' },
  { id: 2, time: '10:28:15', device: '摄像头03', type: '未穿工作服', level: 'medium' },
])

// 切换视图模式
const switchViewMode = (mode: string) => {
  viewMode.value = mode
  isFullscreen.value = false // 切换视图模式时退出全屏
  selectedCamera.value = null
}

// 选择摄像头
const selectCamera = (index: number) => {
  selectedCamera.value = selectedCamera.value === index ? null : index
}

// 切换全屏显示
const toggleFullscreen = () => {
  if (selectedCamera.value !== null) {
    isFullscreen.value = !isFullscreen.value
  }
}
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  min-height: 800px;
  display: flex;
  padding: 16px;
  gap: 16px;
  background: #f0f2f5;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

// 左侧设备列表样式
.device-list {
  width: 240px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 800px;

  .list-header {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 1px solid #f0f0f0;
  }

  .list-content {
    flex: 1;
    padding: 4px;
    overflow-y: auto;

    .device-item {
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;

      &:hover {
        background: #f5f5f5;
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #52c41a;
      }

      &.offline {
        color: #999;
        .status-dot {
          background: #ff4d4f;
        }
      }
    }
  }
}

// 中间监控区域样式
.monitoring-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 800px;
  max-width: 1200px;
  margin: 0 auto;
  height: 800px;

  .toolbar {
    padding: 4px 0;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .view-modes {
      display: flex;
      gap: 8px;

      button {
        padding: 4px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 13px;

        &:hover {
          color: #1890ff;
          border-color: #1890ff;
        }

        &.active {
          color: #1890ff;
          border-color: #1890ff;
        }
      }
    }

    .fullscreen-btn {
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

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fullscreen-icon {
        display: inline-block;
        width: 14px;
        height: 14px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231890ff"><path d="M3 3h7v2H5v5H3V3m18 0h-7v2h5v5h2V3M3 21h7v-2H5v-5H3v7m18 0h-7v-2h5v-5h2v7"/></svg>');
        background-size: cover;
        transition: all 0.3s ease;
      }

      &:hover:not(.disabled) {
        background: linear-gradient(to bottom, #ffffff, #f0f7ff);
        border-color: #1890ff;
        color: #1890ff;
        box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
      }

      &.active {
        background: #1890ff;
        color: white;
        border-color: #1890ff;
        box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);

        .fullscreen-icon {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M3 3h7v2H5v5H3V3m18 0h-7v2h5v5h2V3M3 21h7v-2H5v-5H3v7m18 0h-7v-2h5v-5h2v7"/></svg>');
        }

        &:hover {
          background: #40a9ff;
          border-color: #40a9ff;
        }
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.6;
        background: #f5f5f5;
        border-color: #d9d9d9;
        box-shadow: none;
      }

      .btn-text {
        font-weight: 500;
      }
    }
  }

  .video-grid {
    display: grid;
    gap: 8px;
    height: 500px;
    
    &.single {
      grid-template-columns: 1fr;
    }
    
    &.four {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }
    
    &.nine {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
    }

    .video-cell {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #e8e8e8;
      height: 100%;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.3s;
      
      .video-header {
        padding: 4px 8px;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
        font-weight: 500;
        font-size: 12px;
      }

      .video-content {
        flex: 1;
        position: relative;

        .video-placeholder {
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
      }

      &:hover {
        border-color: #1890ff;
      }

      &.selected {
        border: 2px solid #1890ff;
      }

      &.fullscreen {
        height: 100%;
        
        .video-content {
          height: calc(100% - 30px);
        }
      }
    }

    &.fullscreen {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }
  }
}

// 右侧预警列表样式
.warning-list {
  width: 300px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 800px;

  .list-header {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 1px solid #f0f0f0;
  }

  .list-content {
    flex: 1;
    padding: 4px;
    overflow-y: auto;

    .warning-item {
      padding: 8px;
      background: #fff1f0;
      border-radius: 4px;
      margin-bottom: 6px;
      font-size: 13px;

      &.high {
        background: #fff1f0;
        border-left: 3px solid #ff4d4f;
      }

      &.medium {
        background: #fff7e6;
        border-left: 3px solid #ffa940;
      }

      .warning-video {
        width: 100%;
        height: 120px;
        margin-bottom: 8px;
        border-radius: 4px;
        overflow: hidden;

        .video-placeholder {
          width: 100%;
          height: 100%;
          background: #1890ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }
      }

      .warning-info {
        .warning-time {
          font-size: 12px;
          color: #999;
          margin-bottom: 2px;
        }

        .warning-detail {
          font-size: 13px;
        }
      }
    }
  }
}
</style>

<template>
  <div id="realTimeMonitoring" style="width:100vw; height: 91vh">
    <el-container v-loading="loading" style="height: 91vh;" element-loading-text="加载中">
    <!-- 左侧设备列表 -->
      <el-aside width="250px" class="device-tree-aside">
        <div class="custom-tree-header">
          <div class="header-title">
            <i class="el-icon-video-camera"></i>
            <span>通道列表</span>
          </div>
          <div class="header-switch">
            <el-switch
              v-model="showRegion"
              active-color="#13ce66"
              inactive-color="rgb(64, 158, 255)"
              active-text="行政区划"
              inactive-text="业务分组">
            </el-switch>
          </div>
        </div>
        <div class="custom-tree-container">
          <div v-if="showRegion" style="height: 100%">
            <RegionTree ref="regionTree" :edit="false" :showHeader="false" :hasChannel="true" :clickEvent="treeNodeClickEvent"></RegionTree>
          </div>
          <div v-if="!showRegion" style="height: 100%">
            <GroupTree ref="groupTree" :edit="false" :showHeader="false" :hasChannel="true" :clickEvent="treeNodeClickEvent"></GroupTree>
          </div>
        </div>
      </el-aside>
      
      <!-- 中间监控容器 -->
      <el-container :class="mainClass" style="margin: 0 0 0 4px; flex: 1; width: calc(100% - 534px); min-width: 0; padding-right: 4px;">
        <!-- 顶部工具栏 -->
        <el-header height="5vh" style="font-size: 17px; line-height:5vh; display: grid; grid-template-columns: 1fr 1fr; background: linear-gradient(to right, #f0f5ff, #f5f7fa); border-radius: 4px; margin-bottom: 8px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);">
          <div style="text-align: left; padding-left: 12px; display: flex; align-items: center;">
            <span class="header-label">分屏:</span>
            <i class="iconfont icon-a-mti-1fenpingshi btn" :class="{active: viewMode === 'single'}" @click="switchViewMode('single')"/>
            <i class="iconfont icon-a-mti-4fenpingshi btn" :class="{active: viewMode === 'four'}" @click="switchViewMode('four')"/>
            <i class="iconfont icon-a-mti-9fenpingshi btn" :class="{active: viewMode === 'nine'}" @click="switchViewMode('nine')"/>
          </div>
          <div style="text-align: right; margin-right: 10px; display: flex; align-items: center; justify-content: flex-end;">
            <div class="current-time">
              <i class="el-icon-time"></i>
              <span>{{ currentDateTime }}</span>
            </div>
            <el-tooltip content="全屏" placement="bottom" effect="light">
              <i class="el-icon-full-screen btn" @click="toggleFullscreen"/>
            </el-tooltip>
          </div>
        </el-header>

      <!-- 视频网格区域 -->
        <el-main style="padding: 0; overflow: hidden; border-radius: 4px;">
          <div ref="videoGrid" 
               :class="['video-grid', viewMode, { fullscreen: isFullscreen }]">
        <template v-if="!isFullscreen">
          <div 
            v-for="index in generateGrids()" 
            :key="index"
            class="video-cell"
            :class="{ selected: selectedCamera === index }"
            @click="selectCamera(index)"
          >
                <!-- 超薄标题栏 -->
                <div class="video-slim-header">
                  <span class="camera-name">摄像头 {{ index }}</span>
                  <div class="video-status" :class="getVideoStatus(index-1)">
                    <span class="status-dot"></span>
                    <span class="status-text">{{ getVideoStatusText(index-1) }}</span>
            </div>
                </div>
                
            <div class="video-content">
              <div class="video-placeholder" :data-timestamp="currentDateTime" :data-camera="formatCameraName(index)">
                    <div v-if="!videoUrl[index-1]" class="no-signal">
                      <i class="el-icon-video-camera-solid"></i>
                      <div>{{ videoTip[index-1] ? videoTip[index-1] : "无信号" }}</div>
                    </div>
                    <player :ref="'player'+(index-1)" v-else :videoUrl="videoUrl[index-1]" fluent autoplay @screenshot="shot"
                            @destroy="destroy"/>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div 
            v-for="index in generateGrids()" 
            :key="index"
            class="video-cell"
            :class="{ selected: selectedCamera === index }"
            @click="selectCamera(index)"
          >
            <!-- 超薄标题栏 -->
            <div class="video-slim-header">
              <span class="camera-name">摄像头 {{ index }}</span>
              <div class="video-status" :class="getVideoStatus(index-1)">
                <span class="status-dot"></span>
                <span class="status-text">{{ getVideoStatusText(index-1) }}</span>
              </div>
            </div>
                
            <div class="video-content">
              <div class="video-placeholder" :data-timestamp="currentDateTime" :data-camera="formatCameraName(index)">
                    <div v-if="!videoUrl[index-1]" class="no-signal">
                      <i class="el-icon-video-camera-solid"></i>
                      <div>{{ videoTip[index-1] ? videoTip[index-1] : "无信号" }}</div>
                    </div>
                    <player :ref="'player'+(index-1)" v-else :videoUrl="videoUrl[index-1]" fluent autoplay @screenshot="shot"
                            @destroy="destroy"/>
              </div>
            </div>
          </div>
        </template>
      </div>
        </el-main>
      </el-container>

    <!-- 右侧预警信息 -->
      <el-aside width="270px" style="margin-left: 0;">
    <div class="warning-list">
      <div class="list-header">
        <span>实时预警</span>
        <el-button type="text" class="more-btn" @click="goToMoreWarnings">更多 <i class="el-icon-arrow-right"></i></el-button>
      </div>
      <div class="list-content">
        <div v-for="warning in warningList" 
             :key="warning.id" 
             class="warning-item"
             :class="warning.level">
          <div class="warning-level-badge" :class="warning.level">{{ getWarningLevelText(warning.level) }}</div>
          <div class="warning-video">
            <div class="video-placeholder">
              <i :class="getWarningIcon(warning.level)"></i>
              <span>预警监控画面</span>
            </div>
          </div>
          <div class="warning-info">
            <div class="warning-time-location">
              <div class="warning-time">{{ warning.time }}</div>
              <div class="warning-location">{{ warning.location }}</div>
            </div>
            <div class="warning-detail">
              <div class="device-type-row">
                <span class="device-name">{{ warning.device }}</span>
                <span class="violation-type">{{ warning.type }}</span>
              </div>
            </div>
            <div class="warning-actions">
              <el-button size="mini" type="primary" plain @click="viewWarningDetail(warning)">查看详情</el-button>
              <el-button size="mini" type="success" plain @click="handleWarning(warning)">处理</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
      </el-aside>
    </el-container>

    <!-- 引入预警详情组件 -->
    <WarningDetail 
      :visible.sync="warningDetailVisible"
      :warning="currentWarning"
      @handle-warning="handleWarningFromDialog"
    />
  </div>
</template>

<script>
import player from '../../common/jessibuca.vue'
import DeviceTree from '../../common/DeviceTree.vue'
import RegionTree from '../../common/RegionTree.vue'
import GroupTree from '../../common/GroupTree.vue'
import WarningDetail from './warningDetail.vue'
import screenfull from "screenfull";

export default {
  name: "RealTimeMonitoring",
  components: {
    player, DeviceTree, RegionTree, GroupTree, WarningDetail
  },
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
      // 视频URL数组
      videoUrl: [],
      // 视频提示信息
      videoTip: [],
      // 播放器索引
      playerIdx: 0,
      // 加载状态
      loading: false,
      // 显示行政区划或业务分组
      showRegion: true,
      
      // 预警列表数据
      warningList: [
        { 
          id: 1, 
          time: '10:30:25', 
          device: '摄像头01', 
          type: '未戴安全帽', 
          level: 'level1', 
          location: '工地东北角',
          description: '检测到工作人员未佩戴安全帽，存在严重安全隐患，请立即整改并加强安全教育'
        },
        { 
          id: 2, 
          time: '10:28:15', 
          device: '摄像头03', 
          type: '未穿工作服', 
          level: 'level2', 
          location: '工地南侧',
          description: '发现工作人员未按规定穿着工作服，违反现场作业安全规范，需要立即纠正'
        },
        { 
          id: 3, 
          time: '10:15:42', 
          device: '摄像头02', 
          type: '闲杂人员', 
          level: 'level3', 
          location: '材料区',
          description: '检测到非工作人员进入施工区域，可能存在安全风险，请及时清理并加强管控'
        },
        { 
          id: 4, 
          time: '09:58:30', 
          device: '摄像头05', 
          type: '吸烟', 
          level: 'level4', 
          location: '休息区',
          description: '发现工作人员在禁烟区域吸烟，违反安全生产规定，请立即制止并进行安全教育'
        },
      ],
      warningDetailVisible: false,
      currentWarning: null,
    }
  },
  computed: {
    // 过滤后的设备分组
    filteredDeviceGroups() {
      return this.deviceGroups
        .map(group => {
          // 创建一个新的组对象，避免修改原始数据
          const newGroup = { ...group };
          
          // 根据行政区划过滤
          if (this.selectedRegion && group.region !== this.selectedRegion) {
            return null;
          }
          
          // 过滤设备
          newGroup.devices = group.devices.filter(device => {
            // 按业务分组过滤
            if (this.selectedIndustry && device.industry !== this.selectedIndustry) {
              return false;
            }
            
            // 按关键词搜索过滤
            if (this.searchKeyword && !device.name.toLowerCase().includes(this.searchKeyword.toLowerCase())) {
              return false;
            }
            
            return true;
          });
          
          // 如果组内没有设备，则不显示该组
          if (newGroup.devices.length === 0) {
            return null;
          }
          
          return newGroup;
        })
        .filter(group => group !== null);
    }
  },
  mounted() {
    // 启动时间更新定时器
    this.updateDateTime();
    this.timer = setInterval(this.updateDateTime, 1000);
    
    // 添加键盘事件监听器，用于ESC键退出全屏
    document.addEventListener('keydown', this.handleKeyDown);
    
    // 添加全屏变化事件监听器
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    // 添加窗口大小变化监听器，用于重新计算四分屏布局
    window.addEventListener('resize', this.handleResize);
    
    // 初始化视频URL和提示信息数组
    this.initVideoArrays();
    
    // 初始化后延迟刷新布局
    this.$nextTick(() => {
      setTimeout(() => {
        this.refreshFourScreenLayout();
      }, 200);
    });
  },
  beforeDestroy() {
    // 组件销毁时清理
    this.exitFullscreen();
    document.body.classList.remove('camera-fullscreen-mode');
    clearInterval(this.timer);
    
    // 移除事件监听器
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    // 移除窗口大小变化监听器
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // 切换分组展开/折叠
    toggleGroup(groupIndex) {
      this.$set(this.deviceGroups[groupIndex], 'expanded', !this.deviceGroups[groupIndex].expanded);
    },
    
    // 选择设备
    selectDevice(groupIndex, deviceIndex, device) {
      const deviceKey = 'device-' + groupIndex + '-' + deviceIndex;
      this.selectedDevice = this.selectedDevice === deviceKey ? null : deviceKey;
      
      if (this.selectedDevice) {
        // 发送设备推流请求
        this.sendDevicePush(device.channelId);
      }
    },

    // 初始化视频数组
    initVideoArrays() {
      // 初始化9个空位置用于视频URL和提示信息
      this.videoUrl = Array(9).fill('');
      this.videoTip = Array(9).fill('');
    },
    // 生成网格数量
    generateGrids() {
      if (this.viewMode === 'single') return [1]
      if (this.viewMode === 'four') return [1, 2, 3, 4]
      return [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    // 获取网格列模板
    getGridColumns() {
      if (this.viewMode === 'single') return "minmax(0, 1fr)"
      if (this.viewMode === 'four') return "minmax(0, 1fr) minmax(0, 1fr)"
      return "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
    },
    // 获取网格行模板
    getGridRows() {
      if (this.viewMode === 'single') return "minmax(0, 1fr)"
      if (this.viewMode === 'four') return "minmax(0, 1fr) minmax(0, 1fr)"
      return "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
    },
    // 切换视图模式
    switchViewMode(mode) {
      this.viewMode = mode
      if (this.isFullscreen) {
        this.exitFullscreen(); // 切换视图模式时退出全屏
      }
      this.selectedCamera = null
      
      // 如果切换到四分屏，等待DOM更新后刷新布局
      if (mode === 'four') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.refreshFourScreenLayout();
          }, 100);
        });
      }
    },
    // 选择摄像头
    selectCamera(index) {
      this.selectedCamera = this.selectedCamera === index ? null : index
      this.playerIdx = index - 1;
      
      // 在切换摄像头后，添加强制更新视图的逻辑
      if (this.viewMode === 'four') {
        this.$nextTick(() => {
          // 强制重新计算布局
          this.$forceUpdate();
        });
      }
    },
    // 切换全屏显示
    toggleFullscreen() {
      if (!this.isFullscreen) {
        this.enterFullscreen();
      } else {
        this.exitFullscreen();
      }
    },
    // 进入全屏模式
    enterFullscreen() {
      // 先加上样式类以便切换后立即显示全屏效果
      document.body.classList.add('camera-fullscreen-mode');
      
      this.isFullscreen = true;
      
      // 获取视频网格元素
      const element = this.$refs.videoGrid;
      
      try {
        // 请求全屏
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
          element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
          element.mozRequestFullScreen();
        }
      } catch (err) {
        console.error('无法进入全屏模式:', err);
        // 如果无法进入全屏模式，仍然保持样式效果
      }
    },
    // 退出全屏模式
    exitFullscreen() {
      // 移除样式类
      document.body.classList.remove('camera-fullscreen-mode');
      this.isFullscreen = false;
      
      try {
        // 判断当前是否在全屏模式
        if (
          document.fullscreenElement || 
          document.webkitFullscreenElement || 
          document.mozFullScreenElement ||
          document.msFullscreenElement
        ) {
          // 退出全屏
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
          }
        }
      } catch (err) {
        console.error('退出全屏模式时出错:', err);
      }
    },
    // 处理键盘事件
    handleKeyDown(event) {
      if (event.key === 'Escape' && this.isFullscreen) {
        this.exitFullscreen();
      }
    },
    // 处理全屏状态变化事件
    handleFullscreenChange() {
      const fullscreenElement = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement ||
        document.msFullscreenElement;
        
      // 如果没有全屏元素但我们的状态是全屏，那么退出全屏
      if (!fullscreenElement && this.isFullscreen) {
        this.exitFullscreen();
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
    // 截图功能
    shot(e) {
      let base64ToBlob = function (code) {
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;
        let uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {
          type: contentType
        });
      };
      let aLink = document.createElement('a');
      let blob = base64ToBlob(e);
      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);
      aLink.download = '截图';
      aLink.href = URL.createObjectURL(blob);
      aLink.click();
    },
    // 销毁播放器
    destroy(idx) {
      this.clear(idx.substring(idx.length - 1));
    },
    // 清除播放数据
    clear(idx) {
      this.$set(this.videoUrl, idx - 1, '');
      this.$set(this.videoTip, idx - 1, '');
    },
    // 设置播放URL
    setPlayUrl(url, idx) {
      this.$set(this.videoUrl, idx, url);
    },
    // 设备树点击事件
    treeNodeClickEvent(data) {
      if (data.leaf) {
        console.log("通道点击事件", data);
        this.sendDevicePush(data.id);
      }
    },
    // 设备树上下文菜单事件
    contextMenuEvent(device, event, data, isCatalog) {
      // 上下文菜单处理
    },
    // 向设备发送推流请求
    sendDevicePush(channelId) {
      let idxTmp = this.playerIdx;
      this.setPlayUrl("", idxTmp);
      this.$set(this.videoTip, idxTmp, "正在拉流...");
      this.loading = true;
      
      this.$axios({
        method: 'get',
        url: '/api/common/channel/play',
        params: {
          channelId: channelId
        }
      }).then((res) => {
        if (res.data.code === 0 && res.data.data) {
          let videoUrl;
          if (location.protocol === "https:") {
            videoUrl = res.data.data.wss_flv;
          } else {
            videoUrl = res.data.data.ws_flv;
          }
          this.setPlayUrl(videoUrl, idxTmp);
          
          // 视频加载后刷新布局
          setTimeout(() => {
            this.refreshFourScreenLayout();
            // 单独调整当前播放器尺寸
            this.adjustPlayerSize(idxTmp);
          }, 200);
        } else {
          this.$set(this.videoTip, idxTmp, "播放失败: " + res.data.msg);
        }
      }).catch(function (e) {
        console.error(e);
      }).finally(() => {
        this.loading = false;
      });
    },
    // 获取视频状态类
    getVideoStatus(index) {
      if (!this.videoUrl[index]) return 'offline';
      return 'online';
    },
    // 获取视频状态文本
    getVideoStatusText(index) {
      if (!this.videoUrl[index]) return '离线';
      return '在线';
    },
    // 是否可以截图 - 当前选中视频且有视频URL
    mainClass() {
      return this.viewMode === 'single' ? 'single-screen-mode' : '';
    },
    // 处理窗口大小变化
    handleResize() {
      // 延迟处理，确保DOM已更新
      setTimeout(() => {
        this.refreshFourScreenLayout();
      }, 100);
    },
    // 添加一个方法来重新计算和更新四分屏布局
    refreshFourScreenLayout() {
      if (this.viewMode !== 'four') return;
      
      // 强制更新视图
      this.$forceUpdate();
      
      // 延迟后检查并修正尺寸
      this.$nextTick(() => {
        // 获取视频网格元素
        const gridElement = this.$refs.videoGrid;
        if (!gridElement) return;
        
        // 确保网格完全填充容器
        gridElement.style.width = '100%';
        gridElement.style.height = '100%';
        
        // 处理每个视频单元格
        const cells = gridElement.querySelectorAll('.video-cell');
        cells.forEach(cell => {
          // 确保盒模型计算正确
          cell.style.boxSizing = 'border-box';
          
          // 确保内容区域正确
          const contentElement = cell.querySelector('.video-content');
          if (contentElement) {
            contentElement.style.width = '100%';
            contentElement.style.height = 'calc(100% - 26px)';
          }
        });
        
        // 调整所有播放器组件尺寸
        if (this.viewMode === 'four') {
          for (let i = 0; i < 4; i++) {
            this.adjustPlayerSize(i);
          }
        }
      });
    },
    // 添加player组件调整方法，处理播放器尺寸
    adjustPlayerSize(index) {
      // 获取player对象
      const playerKey = 'player' + index;
      if (!this.$refs[playerKey]) return;
      
      // 获取player组件实例
      let playerRef = this.$refs[playerKey];
      
      // 确保playerRef不为空且有resize方法
      if (playerRef && typeof playerRef.resize === 'function') {
        // 触发resize方法调整播放器尺寸
        playerRef.resize();
      }
    },
    // 获取预警等级文字
    getWarningLevelText(level) {
      const levelMap = {
        'level1': '一级',
        'level2': '二级',
        'level3': '三级',
        'level4': '四级'
      };
      return levelMap[level] || '未知';
    },
    // 查看预警详情
    viewWarningDetail(warning) {
      this.currentWarning = warning;
      this.warningDetailVisible = true;
    },
    // 处理预警
    handleWarning(warning) {
      this.$message({
        message: `正在处理 ${warning.device} 的 ${warning.type} 预警`,
        type: 'success'
      });
      // 这里可以添加处理预警的逻辑
    },
    // 从对话框处理预警
    handleWarningFromDialog(warning) {
      if (warning) {
        this.handleWarning(warning);
      }
    },
    // 跳转到更多预警页面
    goToMoreWarnings() {
      // 可以跳转到更详细的预警管理页面
      this.$message.info('跳转到更多预警页面');
      // this.$router.push('/warning-management');
    },
    // 获取预警图标
    getWarningIcon(level) {
      const iconMap = {
        'level1': 'el-icon-warning',
        'level2': 'el-icon-warning-outline',
        'level3': 'el-icon-warning-outline',
        'level4': 'el-icon-warning-outline'
      };
      return iconMap[level] || 'el-icon-warning';
    },
  }
}
</script>

<style scoped>
#realTimeMonitoring {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 91vh;
  overflow: hidden;
  box-sizing: border-box;
}

#realTimeMonitoring > .el-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: 91vh;
  width: 100%;
  overflow: hidden; /* 防止出现滚动条 */
  padding: 4px;
  box-sizing: border-box;
}

/* 设备树容器样式 */
.device-tree-aside {
  background-color: #ffffff;
  margin-right: 4px;
  padding: 0;
  border-radius: 8px;
  overflow: auto; /* 简单使用auto */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.custom-tree-header {
  padding: 12px;
  background: linear-gradient(135deg, #2c3e50, #3e5771);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  min-height: 80px;
  flex-shrink: 0; /* 防止收缩 */
}

/* 添加header-switch样式 */
.header-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.header-title i {
  font-size: 18px;
  margin-right: 8px;
}

.header-title span {
  font-size: 16px;
  font-weight: bold;
}

.header-switch {
  margin-top: 6px;
}

.header-switch /deep/ .el-switch__label {
  color: #ffffff !important;
  font-weight: bold !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3) !important;
}

.header-switch /deep/ .el-switch__label.is-active {
  color: #ffffff !important;
}

.custom-tree-container {
  flex: 1;
  overflow: auto;
  height: calc(100% - 80px);
  padding-bottom: 20px !important; /* 添加底部内边距 */
}

/* 覆盖树组件样式 */
.device-tree-aside /deep/ #DeviceTree {
  height: 100% !important;
}

.device-tree-aside /deep/ .el-container {
  height: 100% !important;
}

.device-tree-aside /deep/ .el-header {
  display: none !important; /* 隐藏原组件头部 */
}

.device-tree-aside /deep/ .el-main {
  padding: 0 !important;
  overflow: visible !important;
  height: auto !important;
  min-height: 100%;
}

/* 简单修复树节点样式 */
.device-tree-aside /deep/ .el-tree-node__content {
  height: auto !important; 
  min-height: 34px !important; 
  transition: all 0.2s ease !important;
  border-radius: 0 !important;
  margin: 2px 0 !important;
  padding: 0 8px !important;
}

/* 修正文字显示不全问题 */
.device-tree-aside /deep/ .custom-tree-node {
  font-size: 14px !important;
  line-height: 20px !important; 
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  width: 100% !important;
  overflow: hidden !important; 
  text-overflow: ellipsis !important;
  white-space: nowrap !important; 
  display: flex !important;
  align-items: center !important;
  padding: 0 !important; 
}

.device-tree-aside /deep/ .flow-tree {
  padding: 0 !important;
}

/* 调整右侧预警列表样式 */
#realTimeMonitoring > .el-container > .el-aside:last-child {
  margin-left: 0;
  width: 270px !important;
  flex: none;
  height: 100%;
}

.warning-list {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border-top: 3px solid #f56c6c;
  transition: all 0.3s ease;
}

/* 修复视频网格 */
.el-main {
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
  background-color: #2c3e50 !important;
  width: 100% !important;
  height: calc(100% - 5vh) !important;
}

/* 调整四分屏布局 */
.video-grid.four {
  display: flex !important;
  flex-wrap: wrap !important;
  align-content: flex-start !important;
  justify-content: space-between !important;
  gap: 4px !important;
  padding: 4px !important;
}

.video-grid.four .video-cell {
  width: calc(50% - 4px) !important;
  height: calc(50% - 4px) !important;
  margin: 0 !important;
}

.header-label {
  font-size: 15px;
  margin-right: 8px;
  color: #606266;
  font-weight: 500;
}

.current-time {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  margin-right: 15px;
  color: #606266;
  font-size: 14px;
}

.current-time i {
  margin-right: 6px;
  color: #409EFF;
}

/* 按钮样式增强 */
.btn {
  margin: 0 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  position: relative;
  padding: 3px 6px;
  border-radius: 4px;
}

.btn:hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.btn.active {
  color: #409EFF;
  font-weight: bold;
  background-color: rgba(64, 158, 255, 0.2);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  color: #c0c4cc;
}

/* 视频网格样式优化 */
.video-grid {
  width: 100%;
  height: 100%;
  background-color: #2c3e50;
  display: grid;
  gap: 0px; /* 移除间隙，确保填满 */
  padding: 0px; /* 移除内边距，确保填满 */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.video-grid.single {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.video-grid.four {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  padding: 2px;
  background-color: #2c3e50;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.video-grid.nine {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 4px; /* 九分屏保留间隙 */
  padding: 4px 8px 4px 4px; /* 右侧增加padding */
}

.video-cell {
  background: #1e2430;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  position: relative;
  animation: fadeIn 0.4s ease-out;
}

.video-cell.selected {
  border: 2px solid #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3), 0 6px 20px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
  z-index: 2;
}

.video-cell:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transform: scale(1.01); /* 稍微放大 */
  z-index: 5; /* 提升层级，确保悬停元素在最上层 */
}

.video-cell .video-content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f1620;
  min-height: 0;
  height: calc(100% - 26px); /* 减去标题栏高度 */
  width: 100%; /* 确保宽度一致 */
  overflow: hidden; /* 防止内容溢出 */
  box-sizing: border-box;
}

/* 确保视频占满容器 */
.video-cell .video-content > div {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.video-cell .video-content .video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  color: #e4e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-sizing: border-box;
}

.video-cell .video-content .no-signal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 100%;
}

.video-cell .video-content .no-signal i {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
}

/* 右侧预警列表样式增强 */
.warning-list {
  width: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border-top: 3px solid #f56c6c;
  transition: all 0.3s ease;
}

.warning-list:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.warning-list .list-header {
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(to right, #fff0f0, #fff5f5);
  color: #f56c6c;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-list .list-header .more-btn {
  color: #409EFF;
  padding: 3px 8px;
  font-size: 13px;
  font-weight: normal;
}

.warning-list .list-header .more-btn:hover {
  color: #66b1ff;
  background-color: rgba(64, 158, 255, 0.08);
  border-radius: 4px;
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
  margin-bottom: 16px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out;
}

.warning-list .list-content .warning-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.warning-list .list-content .warning-item .warning-level-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 8px;
  font-size: 12px;
  color: white;
  font-weight: bold;
  border-radius: 0 0 0 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.warning-list .list-content .warning-item .warning-level-badge.level1 {
  background-color: #f56c6c;
}

.warning-list .list-content .warning-item .warning-level-badge.level2 {
  background-color: #e6a23c;
}

.warning-list .list-content .warning-item .warning-level-badge.level3 {
  background-color: #409EFF;
}

.warning-list .list-content .warning-item .warning-level-badge.level4 {
  background-color: #67c23a;
}

.warning-list .list-content .warning-item.level1 {
  border-left: 4px solid #f56c6c;
}

.warning-list .list-content .warning-item.level2 {
  border-left: 4px solid #e6a23c;
}

.warning-list .list-content .warning-item.level3 {
  border-left: 4px solid #409EFF;
}

.warning-list .list-content .warning-item.level4 {
  border-left: 4px solid #67c23a;
}

.warning-list .list-content .warning-item .warning-info {
  padding: 4px 0;
}

.warning-list .list-content .warning-item .warning-info .warning-time-location {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.warning-list .list-content .warning-item .warning-info .warning-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex: 1;
}

.warning-list .list-content .warning-item .warning-info .warning-time:before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23909399"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>');
  background-size: contain;
}

.warning-list .list-content .warning-item .warning-info .warning-location {
  font-size: 12px;
  color: #909399;
  margin-bottom: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.warning-list .list-content .warning-item .warning-info .warning-location:before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23909399"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>');
  background-size: contain;
}

.warning-list .list-content .warning-item .warning-info .warning-detail {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  line-height: 1.6;
}

.warning-list .list-content .warning-item .warning-info .warning-detail .device-type-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.warning-list .list-content .warning-item .warning-info .warning-detail .device-name {
  font-weight: 500;
  color: #303133;
}

.warning-list .list-content .warning-item .warning-info .warning-detail .violation-type {
  color: #f56c6c;
  font-weight: 500;
  background: rgba(245, 108, 108, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.warning-list .list-content .warning-item .warning-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.warning-list .list-content .warning-item .warning-actions .el-button {
  flex: 1;
  margin: 0 4px;
  padding: 5px 10px;
  font-size: 12px;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 单分屏时调整视频比例 */
.video-grid.single .video-cell {
  border-radius: 0; /* 移除单分屏模式下的圆角 */
  box-shadow: none; /* 移除单分屏模式下的阴影 */
  border: none; /* 移除单分屏模式下的边框 */
  height: 100%;
  width: 100%;
}

.video-grid.single .video-cell.selected {
  border: none; /* 移除选中状态下的边框 */
  box-shadow: none; /* 移除选中状态下的阴影 */
  transform: none; /* 移除选中状态下的变换 */
}

/* 调整单分屏模式下的标题栏 */
.video-grid.single .video-cell .video-slim-header {
  border-radius: 0; /* 移除标题栏的圆角 */
}

/* 四分屏时调整每个单元格比例 */
.video-grid.four .video-cell {
  width: calc(50% - 4px);
  height: calc(50% - 4px);
  margin: 2px;
  box-sizing: border-box;
  flex-grow: 0;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* 九分屏时保持较小的单元格 */
.video-cell {
  background: #1e2430;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  position: relative;
  animation: fadeIn 0.4s ease-out;
}

.video-cell .video-slim-header {
  height: 26px;
  padding: 0 10px;
  background: rgba(28, 58, 112, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 5;
}

.video-cell .video-slim-header .camera-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-cell .video-slim-header .video-status {
  display: flex;
  align-items: center;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  margin-left: 8px;
}

.video-cell .video-slim-header .video-status .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.video-cell .video-slim-header .video-status.online {
  color: #95ffa5;
}

.video-cell .video-slim-header .video-status.online .status-dot {
  background-color: #67c23a;
  box-shadow: 0 0 4px #67c23a;
  animation: pulse 1.5s infinite ease-in-out;
}

.video-cell .video-slim-header .video-status.offline {
  color: #ffbbbb;
}

.video-cell .video-slim-header .video-status.offline .status-dot {
  background-color: #f56c6c;
}

/* 全屏模式下的样式调整 */
body.camera-fullscreen-mode .video-cell .video-slim-header {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  background: rgba(20, 40, 80, 0.7);
  backdrop-filter: blur(5px);
}

/* 调整el-main的填充，使视频网格居中 */
#realTimeMonitoring .el-main {
  padding: 0;
  margin: 0;
  overflow: hidden;
  background-color: #2c3e50;
  width: 100%; 
  height: calc(100% - 5vh);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保视频网格容器完全填充主区域 */
.el-main .video-grid {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
}

/* 全屏状态下的必要样式 */
body.camera-fullscreen-mode .video-cell .video-content {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

body.camera-fullscreen-mode .video-cell .video-content .video-placeholder {
  background: linear-gradient(135deg, #102948, #1e3c72) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
  font-size: 18px !important;
}

/* 全屏状态下，为监控画面增加ESC退出提示 */
body.camera-fullscreen-mode .video-cell .video-content .video-placeholder::before {
  content: "(按ESC退出全屏)" !important;
  position: absolute !important;
  right: 10px !important;
  bottom: 10px !important;
  color: white !important;
  font-family: monospace !important;
  font-size: 14px !important;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.7) !important;
  z-index: 3 !important;
  background: rgba(0, 0, 0, 0.3) !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  backdrop-filter: blur(2px) !important;
}

/* 调整el-main在单分屏模式下的样式 */
.single-screen-mode .el-main {
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.single-screen-mode .video-grid {
  width: 100%;
  height: 100%;
  background-color: #1e2430;
  border-radius: 0;
  box-shadow: none;
}

.single-screen-mode .video-grid .video-cell {
  background-color: #1e2430;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.single-screen-mode .video-grid .video-cell .video-content {
  background-color: #1e2430;
}

.single-screen-mode .video-grid .video-cell .video-content .video-placeholder {
  background: linear-gradient(45deg, #0a1526, #1e3c72);
}

/* 修复文本只显示一半的问题 */
.device-tree-aside /deep/ .custom-tree-node {
  font-size: 14px !important;
  line-height: 20px !important; 
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  width: 100% !important;
  overflow: hidden !important; 
  text-overflow: ellipsis !important;
  white-space: nowrap !important; 
  display: flex !important;
  align-items: center !important;
  padding: 0 !important; 
}

/* 调整树节点高度，确保文本显示完整 */
.device-tree-aside /deep/ .el-tree-node__content {
  height: auto !important; 
  min-height: 34px !important; 
  transition: all 0.2s ease !important;
  border-radius: 0 !important;
  margin: 2px 0 !important;
  padding: 0 8px !important;
}

/* 修改树节点悬浮效果，使其更加轻微 */
.device-tree-aside /deep/ .el-tree-node__content:hover {
  background-color: rgba(64, 158, 255, 0.1) !important;
  transform: translateX(2px) !important;
}

/* 在自定义树容器中添加底部内边距，确保最后一项完全显示 */
.custom-tree-container {
  flex: 1;
  overflow: auto;
  height: calc(100% - 80px);
  padding-bottom: 20px !important; /* 添加底部内边距 */
}

/* 添加树节点选中样式以区分悬浮状态 */
.device-tree-aside /deep/ .is-current>.el-tree-node__content {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF !important;
  font-weight: bold !important;
  transform: none !important;
}

/* 修复图标显示 */
.device-tree-aside /deep/ .iconfont {
  transition: all 0.2s ease !important;
  margin-right: 6px !important;
  font-size: 16px !important;
  min-width: 16px !important;
  text-align: center !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
}

/* 确保文本容器有足够的空间 */
.device-tree-aside /deep/ .custom-tree-node span {
  line-height: 1.5 !important;
  display: inline-block !important;
  padding-bottom: 2px !important; /* 底部添加小间距 */
  vertical-align: middle !important;
}

.warning-list .list-content .warning-item .warning-video {
  width: 100%;
  height: 130px;
  margin-bottom: 10px;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.warning-list .list-content .warning-item .warning-video .video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 0;
  position: relative;
}

.warning-list .list-content .warning-item .warning-video .video-placeholder i {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.warning-list .list-content .warning-item .warning-video .video-placeholder span {
  font-size: 13px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.warning-list .list-content .warning-item.level1 .warning-video .video-placeholder i {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.warning-list .list-content .warning-item.level2 .warning-video .video-placeholder i {
  color: #e6a23c;
}

.warning-list .list-content .warning-item.level3 .warning-video .video-placeholder i {
  color: #409EFF;
}

.warning-list .list-content .warning-item.level4 .warning-video .video-placeholder i {
  color: #67c23a;
}

.warning-media .placeholder-image,
.warning-media .placeholder-video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1e3c72, #2a5298);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.warning-media .placeholder-image i,
.warning-media .placeholder-video i {
  opacity: 0.8;
  margin-bottom: 10px;
}

.warning-media .placeholder-image i.el-icon-warning {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.warning-media .placeholder-video i.el-icon-video-camera {
  color: #409EFF;
}

</style>

<!-- 全局样式，处理全屏模式 -->
<style>
/* 全屏状态下的页面容器 */
body.camera-fullscreen-mode #realTimeMonitoring {
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

/* 全屏状态下隐藏设备列表和预警列表 */
body.camera-fullscreen-mode .el-aside {
  display: none !important;
}

/* 全屏状态下调整监控容器样式 */
body.camera-fullscreen-mode .el-container {
  max-width: 100% !important;
  width: 100% !important;
  padding: 16px !important;
  height: 100vh !important;
  max-height: 100vh !important;
}

/* 全屏状态下视频网格占满屏幕 */
body.camera-fullscreen-mode .video-grid {
  height: calc(100vh - 70px) !important;
  max-height: 100vh !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

/* 全屏状态下工具栏样式调整 */
body.camera-fullscreen-mode .el-header {
  background: rgba(0, 0, 0, 0.7) !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  margin-bottom: 16px !important;
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  z-index: 10 !important;
  width: auto !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(5px) !important;
}

/* 全屏状态下时间显示，移除背景 */
body.camera-fullscreen-mode .current-time {
  color: #ffffff !important;
}

body.camera-fullscreen-mode .current-time i {
  color: #ffffff !important;
}

body.camera-fullscreen-mode .header-label {
  color: #ffffff !important;
}

/* 全屏状态下按钮样式调整 */
body.camera-fullscreen-mode .btn {
  color: white !important;
}

body.camera-fullscreen-mode .btn:hover {
  color: #409EFF !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
}

body.camera-fullscreen-mode .btn.active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* 确保全屏模式下没有滚动条 */
body.camera-fullscreen-mode {
  overflow: hidden !important;
}

/* 全屏模式下视频单元格样式 */
body.camera-fullscreen-mode .video-cell {
  border-width: 0 !important;
  border-radius: 8px !important;
  background: rgba(0, 0, 0, 0.2) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

body.camera-fullscreen-mode .video-cell .video-overlay {
  padding: 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 100%);
}

body.camera-fullscreen-mode .video-cell .video-overlay .camera-name {
  font-size: 16px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* 添加截图按钮的数据方法 */
</style>

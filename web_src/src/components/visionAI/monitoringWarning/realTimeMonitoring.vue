<template>
  <div id="realTimeMonitoring" class="realtime-monitoring-container">
    <el-container v-loading="loading" class="main-container" element-loading-text="加载中">
    <!-- 左侧设备列表 - 科技感设计 -->
      <el-aside width="250px" class="device-tree-aside">
        <div class="custom-tree-header">
          <div class="header-title">
            <i class="el-icon-video-camera"></i>
            <span>通道列表</span>
          </div>
          <div class="header-switch">
            <el-switch
              v-model="showRegion"
              active-color="#3b82f6"
              inactive-color="#10b981"
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
      
      <!-- 中间监控容器 - 科技感设计 -->
      <el-container class="video-main-container">
        <!-- 顶部工具栏 - 科技感设计 -->
        <el-header height="50px" class="video-toolbar">
          <div class="toolbar-left">
            <span class="header-label">分屏:</span>
            <div class="view-mode-buttons">
              <i class="iconfont icon-a-mti-1fenpingshi btn" :class="{active: viewMode === 'single'}" @click="switchViewMode('single')"/>
              <i class="iconfont icon-a-mti-4fenpingshi btn" :class="{active: viewMode === 'four'}" @click="switchViewMode('four')"/>  
              <i class="iconfont icon-a-mti-9fenpingshi btn" :class="{active: viewMode === 'nine'}" @click="switchViewMode('nine')"/>
            </div>
          </div>
          <div class="toolbar-right">
            <div class="current-time">
              <i class="el-icon-time"></i>
              <span>{{ currentDateTime }}</span>
            </div>
            <el-tooltip content="全屏" placement="bottom" effect="light">
              <i class="el-icon-full-screen btn fullscreen-btn" @click="toggleFullscreen"/>
            </el-tooltip>
          </div>
        </el-header>

      <!-- 视频网格区域 - 科技感设计 -->
        <el-main class="video-main">
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
                <!-- 超薄标题栏 - 科技感设计 -->
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

    <!-- 右侧预警信息 - 科技感设计 -->
      <el-aside width="270px" class="warning-aside">
    <div class="warning-list">
      <div class="list-header">
        <span>实时预警</span>
        <el-button type="text" class="more-btn" @click="goToMoreWarnings">更多 <i class="el-icon-arrow-right"></i></el-button>
      </div>
      <div class="list-content">
        <div v-for="warning in warningList" 
             :key="warning.id" 
             class="warning-item">
          <div class="warning-video">
            <div class="warning-status-container">
              <div class="warning-level-badge" :class="warning.level">{{ getWarningLevelText(warning.level) }}</div>
              <div class="warning-status-badge" :class="getCurrentWarningStatus(warning).class">{{ getCurrentWarningStatus(warning).text }}</div>
            </div>
            <div v-if="warning.imageUrl" class="warning-image">
              <img :src="warning.imageUrl" :alt="warning.type" />
            </div>
            <div v-else class="video-placeholder">
              <i :class="getWarningIcon(warning.level)"></i>
              <span>预警监控画面</span>
            </div>
          </div>
          <div class="warning-info">
            <div class="warning-time-location">
              <div class="warning-time">{{ formatTime(warning.time) }}</div>
              <div class="warning-location">{{ warning.location }}</div>
            </div>
            <div class="warning-detail">
              <div class="device-type-row">
                <span class="device-name">{{ warning.device }}</span>
                <span class="violation-type">{{ warning.type }}</span>
              </div>
            </div>
            <div class="warning-actions">
              <el-button size="mini" plain class="report-btn" @click="viewWarningDetail(warning)">查看详情</el-button>
              <!-- 处理按钮根据状态禁用，使用与上报按钮相同的样式 -->
              <el-button 
                size="mini" 
                plain
                class="process-btn"
                :disabled="isProcessingDisabled(warning)"
                @click="handleWarningFromList(warning)">
                {{ isProcessingDisabled(warning) ? '已完成' : '处理' }}
              </el-button>
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
      source="realTimeMonitoring"
      @handle-warning="handleWarningFromDialog"
      @handle-report="handleReportFromDialog"
      @handle-archive="handleArchiveFromDialog"
      @handle-false-alarm="handleFalseAlarmFromDialog"
    />
    
    <!-- 处理意见对话框 -->
    <el-dialog
      title="处理预警"
      :visible.sync="remarkDialogVisible"
      width="30%"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="remarkForm" label-width="80px">
        <el-form-item label="处理意见" required>
          <el-input
            v-model="remarkForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见，描述具体的处理措施和结果"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="process-tip">
        <i class="el-icon-info" style="color: #909399; margin-right: 4px;"></i>
        <span style="color: #909399; font-size: 13px;">填写处理意见后，可点击"确认处理"添加处理记录，或点击"结束处理"完成整个处理流程</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRemark">确认处理</el-button>
        <el-button type="success" @click="finishProcessing">结束处理</el-button>
      </span>
    </el-dialog>
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
          time: '2024-12-18 10:30:25', 
          device: '摄像头01', 
          type: '未戴安全帽', 
          level: 'level1', 
          location: '工地东北角',
          status: 'pending',
          imageUrl: require('./images/5.jpg'),
          description: '检测到工作人员未佩戴安全帽，存在严重安全隐患，请立即整改并加强安全教育'
        },
        { 
          id: 2, 
          time: '2024-12-18 10:28:15', 
          device: '摄像头03', 
          type: '未穿工作服', 
          level: 'level2', 
          location: '工地南侧',
          status: 'pending',
          imageUrl: require('./images/4.jpg'),
          description: '发现工作人员未按规定穿着工作服，违反现场作业安全规范，需要立即纠正'
        },
        { 
          id: 3, 
          time: '10:15:42', 
          device: '摄像头02', 
          type: '闲杂人员', 
          level: 'level3', 
          location: '材料区',
          status: 'pending',
          imageUrl: require('./images/5.jpg'),
          description: '检测到非工作人员进入施工区域，可能存在安全风险，请及时清理并加强管控'
        },
        { 
          id: 4, 
          time: '09:58:30', 
          device: '摄像头05', 
          type: '吸烟', 
          level: 'level4', 
          location: '休息区',
          status: 'pending',
          imageUrl: require('./images/6.jpg'),
          description: '发现工作人员在禁烟区域吸烟，违反安全生产规定，请立即制止并进行安全教育'
        },
      ],
      warningDetailVisible: false,
      currentWarning: null,
      
      // 添加预警管理相关的数据属性
      archivesList: [],
      currentCameraId: '',
      archiveWarningId: '',
      reportWarningId: '',
      
      // 处理意见对话框
      remarkDialogVisible: false,
      remarkForm: {
        remark: ''
      },
      currentProcessingWarningId: '',
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
    },
    
    // 可用档案列表
    availableArchives() {
      return this.archivesList.filter(archive => 
        archive.cameraId === this.currentCameraId || archive.isDefault
      );
    },
    
    // 默认档案
    defaultArchive() {
      return this.availableArchives.find(archive => archive.isDefault);
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
    
    // 初始化档案列表
    this.initArchivesList();
    
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
    
    // 初始化档案列表
    initArchivesList() {
      // 模拟一些档案数据
      this.archivesList = [
        {
          id: 'archive_default_1',
          name: '可燃气体监控点默认档案',
          cameraId: 'camera_1',
          cameraName: '可燃气体监控点',
          isDefault: true,
          createTime: '2023-01-15 10:30:00'
        },
        {
          id: 'archive_default_2',
          name: '储罐区监控点默认档案',
          cameraId: 'camera_2',
          cameraName: '储罐区监控点',
          isDefault: true,
          createTime: '2023-01-15 10:30:00'
        },
        {
          id: 'archive_custom_1',
          name: '重要预警专用档案',
          cameraId: 'camera_1',
          cameraName: '可燃气体监控点',
          isDefault: false,
          createTime: '2023-02-20 14:20:00'
        }
      ];
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
    // 处理预警（原有方法，保持兼容性）
    handleWarningOld(warning) {
      this.$message({
        message: `正在处理 ${warning.device} 的 ${warning.type} 预警`,
        type: 'success'
      });
      // 这里可以添加处理预警的逻辑
    },
    
    // 从预警列表处理预警 - 使用统一的处理逻辑
    handleWarningFromList(warning) {
      if (warning && warning.id) {
        // 检查当前是否已经在处理中
        const hasProcessingRecord = warning.operationHistory && 
          warning.operationHistory.some(record => 
            record.operationType === 'processing' && record.status === 'active'
          );
        
        if (hasProcessingRecord) {
          // 如果已经有处理中记录，直接弹出处理意见对话框
          this.currentProcessingWarningId = warning.id;
          this.remarkDialogVisible = true;
        } else {
          // 如果没有处理中记录，先添加"处理中"状态
          this.startProcessingWarning(warning);
        }
      }
    },
    
    // 开始处理预警
    startProcessingWarning(warning) {
      const index = this.warningList.findIndex(item => item.id === warning.id);
      if (index !== -1) {
        // 确保有操作历史数组
        if (!this.warningList[index].operationHistory) {
          this.$set(this.warningList[index], 'operationHistory', []);
        }
        
        // 更新待处理记录为已完成状态
        this.warningList[index].operationHistory = this.warningList[index].operationHistory.map(record => {
          if (record.operationType === 'pending' && record.status === 'active') {
            return {
              ...record,
              status: 'completed',
              description: '预警已确认，开始处理'
            };
          }
          return record;
        });
        
        // 添加处理中记录
        const newRecord = {
          id: Date.now() + Math.random(),
          status: 'active',
          statusText: '处理中',
          time: this.getCurrentTime(),
          description: '处理人员正在处理此预警，可添加处理记录',
          operationType: 'processing',
          operator: this.getCurrentUserName()
        };
        
        this.warningList[index].operationHistory.unshift(newRecord);
        
        // 弹出处理意见对话框
        this.currentProcessingWarningId = warning.id;
        this.remarkDialogVisible = true;
      }
    },
    
    // 保存处理意见（添加处理中记录）
    async saveRemark() {
      if (!this.remarkForm.remark.trim()) {
        this.$message.warning('请输入处理意见');
        return;
      }
      
      try {
        this.loading = true;
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新本地数据状态 - 添加新的处理记录
        const index = this.warningList.findIndex(item => item.id === this.currentProcessingWarningId);
        if (index !== -1) {
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', []);
          }
          
          const newRecord = {
            id: Date.now() + Math.random(),
            status: 'completed',
            statusText: '处理中',
            time: this.getCurrentTime(),
            description: `处理意见：${this.remarkForm.remark}`,
            operationType: 'processing-action',
            operator: this.getCurrentUserName()
          };
          
          this.warningList[index].operationHistory.unshift(newRecord);
        }
        
        this.$message.success('处理记录已添加');
        this.closeRemarkDialog();
      } catch (error) {
        console.error('处理失败:', error);
        this.$message.error('处理失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 结束处理
    async finishProcessing() {
      try {
        this.loading = true;
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新本地数据状态
        const index = this.warningList.findIndex(item => item.id === this.currentProcessingWarningId);
        if (index !== -1) {
          if (!this.warningList[index].operationHistory) {
            this.$set(this.warningList[index], 'operationHistory', []);
          }
          
          // 更新处理中记录为已完成
          this.warningList[index].operationHistory = this.warningList[index].operationHistory.map(record => {
            if (record.operationType === 'processing' && record.status === 'active') {
              return {
                ...record,
                status: 'completed',
                statusText: '已处理',
                description: '预警处理已完成，可以进行后续操作'
              };
            }
            return record;
          });
        }
        
        this.$message.success('处理已完成，现在可以进行归档等操作');
        this.closeRemarkDialog();
      } catch (error) {
        console.error('结束处理失败:', error);
        this.$message.error('结束处理失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 关闭处理意见对话框
    closeRemarkDialog() {
      this.remarkDialogVisible = false;
      this.remarkForm = {
        remark: ''
      };
      this.currentProcessingWarningId = '';
    },
    
    // 从对话框处理预警 - 也使用处理意见流程
    handleWarningFromDialog(warning) {
      if (warning && warning.id) {
        // 如果是完成处理的事件，只更新状态，不再弹出对话框
        if (warning.action === 'finished') {
          // 更新本地预警列表的状态
          const index = this.warningList.findIndex(item => item.id === warning.id);
          if (index !== -1) {
            this.warningList[index].operationHistory = warning.operationHistory;
          }
          return;
        }
        
        // 如果是添加处理记录的事件，只更新状态，不再弹出对话框
        if (warning.action === 'record-added') {
          // 更新本地预警列表的状态
          const index = this.warningList.findIndex(item => item.id === warning.id);
          if (index !== -1) {
            this.warningList[index].operationHistory = warning.operationHistory;
          }
          return;
        }
        
        // 检查当前是否已经在处理中
        const hasProcessingRecord = warning.operationHistory && 
          warning.operationHistory.some(record => 
            record.operationType === 'processing' && record.status === 'active'
          );
        
        if (hasProcessingRecord) {
          // 如果已经有处理中记录，直接弹出处理意见对话框
          this.currentProcessingWarningId = warning.id;
          this.remarkDialogVisible = true;
        } else {
          // 如果没有处理中记录，先添加"处理中"状态
          this.startProcessingWarning(warning);
        }
      }
    },
    
    // 处理预警事件 - 复制预警管理页面的核心逻辑
    async handleWarning(id, action) {
      try {
        this.loading = true;
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新本地数据状态
        const index = this.warningList.findIndex(item => item.id === id);
        if (index !== -1) {
          if (action === 'markProcessed') {
            // 标记为已处理
            this.warningList[index].status = 'completed';
            this.$message.success('已标记为已处理');
          } else if (action === 'report') {
            // 上报
            this.reportWarningId = id;
            this.warningList[index].status = 'reported';
            this.$message.success('预警已成功上报');
          } else if (action === 'archive') {
            // 归档 - 需要选择档案
            this.archiveWarningId = id;
            // 获取当前预警的摄像头信息（实际项目中从预警数据获取）
            this.currentCameraId = this.warningList[index].cameraId || 'camera_1';
            await this.handleArchiveProcess();
            return; // 不关闭loading，等归档完成后再关闭
          } else if (action === 'falseAlarm') {
            // 误报 - 自动归档到默认档案
            this.archiveWarningId = id;
            // 获取当前预警的摄像头信息（实际项目中从预警数据获取）
            this.currentCameraId = this.warningList[index].cameraId || 'camera_1';
            await this.handleFalseAlarmArchive();
            return; // 不关闭loading，等归档完成后再关闭
          }
        }
      } catch (error) {
        console.error('处理失败:', error);
        this.$message.error('处理预警失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 处理上报事件
    handleReportFromDialog(warning) {
      if (warning && warning.id) {
        this.handleWarning(warning.id, 'report');
      }
    },
    
    // 处理归档事件
    handleArchiveFromDialog(warning) {
      if (warning && warning.id) {
        this.handleWarning(warning.id, 'archive');
      }
    },
    
    // 处理误报事件 - 预警详情组件已经处理了误报逻辑，这里只需要更新本地状态
    handleFalseAlarmFromDialog(warning) {
      if (warning && warning.id) {
        // 只更新本地预警列表状态，不显示提示（预警详情组件已经显示了）
        const index = this.warningList.findIndex(item => item.id === warning.id);
        if (index !== -1) {
          this.warningList[index].status = 'archived';
          this.warningList[index].isFalseAlarm = true;
          // 从实时预警列表中移除误报预警
          this.warningList.splice(index, 1);
        }
      }
    },
    
    // 处理归档流程
    async handleArchiveProcess() {
      try {
        let targetArchiveId = null;
        
        // 查找默认档案
        const existingDefaultArchive = this.availableArchives.find(archive => archive.isDefault);
        if (existingDefaultArchive) {
          targetArchiveId = existingDefaultArchive.id;
        } else {
          // 如果没有默认档案，自动创建
          targetArchiveId = await this.createDefaultArchive();
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案');
          return;
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新预警状态为已归档
        const index = this.warningList.findIndex(item => item.id === this.archiveWarningId);
        if (index !== -1) {
          this.warningList[index].status = 'archived';
          this.warningList[index].archiveId = targetArchiveId;
          this.warningList[index].archiveTime = new Date().toLocaleString();
          // 从实时预警列表中移除已归档的预警
          this.warningList.splice(index, 1);
        }
        
        this.$message.success('预警已成功归档');
        this.archiveWarningId = '';
      } catch (error) {
        console.error('归档失败:', error);
        this.$message.error('归档失败');
      }
    },
    
    // 处理误报事件 - 与预警管理页面保持完全一致
    async handleFalseAlarmArchive() {
      try {
        let targetArchiveId = null;
        let archiveName = '';
        
        // 查找或创建默认档案
        const existingDefaultArchive = this.availableArchives.find(archive => archive.isDefault);
        if (existingDefaultArchive) {
          targetArchiveId = existingDefaultArchive.id;
          archiveName = existingDefaultArchive.name;
        } else {
          // 如果没有默认档案，自动创建
          targetArchiveId = await this.createDefaultArchive();
          archiveName = '默认档案';
        }
        
        if (!targetArchiveId) {
          this.$message.error('无法创建默认档案');
          return;
        }
        
        // 获取当前预警信息
        const warningIndex = this.warningList.findIndex(item => item.id === this.archiveWarningId);
        if (warningIndex === -1) {
          this.$message.error('未找到预警信息');
          return;
        }
        
        const warningInfo = this.warningList[warningIndex];
        
        // 保存到智能复判记录
        await this.saveToReviewRecords(warningInfo);
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 更新本地数据
        this.warningList[warningIndex].status = 'archived';
        this.warningList[warningIndex].archiveId = targetArchiveId;
        this.warningList[warningIndex].archiveTime = new Date().toLocaleString();
        this.warningList[warningIndex].isFalseAlarm = true; // 标记为误报
        // 从实时预警列表中移除误报预警
        this.warningList.splice(warningIndex, 1);
        
        this.$message.success('误报事件已保存到智能复判');
        this.archiveWarningId = '';
      } catch (error) {
        console.error('误报归档失败:', error);
        this.$message.error('误报归档失败');
      }
    },
    
    // 保存到智能复判记录 - 与预警管理页面保持完全一致
    async saveToReviewRecords(warningInfo) {
      try {
        // 创建复判记录数据
        const reviewRecord = {
          id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalWarningId: warningInfo.id,
          warningType: warningInfo.type || warningInfo.deviceName,
          deviceName: warningInfo.device || (warningInfo.deviceInfo && warningInfo.deviceInfo.name),
          location: warningInfo.location || (warningInfo.deviceInfo && warningInfo.deviceInfo.position),
          originalTime: warningInfo.time,
          imageUrl: warningInfo.imageUrl,
          level: warningInfo.level,
          description: warningInfo.description,
          reviewResult: 'false_alarm', // 复判结果：误报
          reviewTime: this.getCurrentTime(),
          reviewer: this.getCurrentUserName(),
          reviewReason: '人工标记为误报',
          confidence: 100, // 人工复判置信度100%
          aiReviewResult: null, // AI复判结果（如果有的话）
          aiConfidence: null,
          status: 'completed',
          createTime: this.getCurrentTime()
        };
        
        // 保存到本地存储（实际项目中应该调用API保存到数据库）
        let reviewRecords = JSON.parse(localStorage.getItem('intelligentReviewRecords') || '[]');
        reviewRecords.unshift(reviewRecord);
        
        // 限制记录数量，避免本地存储过大
        if (reviewRecords.length > 1000) {
          reviewRecords = reviewRecords.slice(0, 1000);
        }
        
        localStorage.setItem('intelligentReviewRecords', JSON.stringify(reviewRecords));
        
        // 模拟API调用保存时间
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('误报记录已保存到智能复判:', reviewRecord);
        
      } catch (error) {
        console.error('保存到智能复判记录失败:', error);
        throw error;
      }
    },
    
    // 自动创建默认档案
    async createDefaultArchive() {
      try {
        // 模拟API调用创建默认档案
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newArchive = {
          id: `archive_${Date.now()}`,
          name: `${this.getCurrentCameraName()}默认档案`,
          cameraId: this.currentCameraId,
          cameraName: this.getCurrentCameraName(),
          isDefault: true,
          createTime: new Date().toLocaleString()
        };
        
        this.archivesList.push(newArchive);
        
        return newArchive.id;
      } catch (error) {
        console.error('创建默认档案失败:', error);
        this.$message.error('创建默认档案失败');
        return null;
      }
    },
    
    // 获取当前摄像头名称
    getCurrentCameraName() {
      // 实际项目中应该从摄像头数据中获取
      const cameraNames = {
        'camera_1': '可燃气体监控点',
        'camera_2': '储罐区监控点',
        'camera_3': '管道接口监控点'
      };
      return cameraNames[this.currentCameraId] || '监控点';
    },
    
    // 获取当前时间
    getCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // 获取当前用户昵称
    getCurrentUserName() {
      // 实际项目中应该从用户登录信息或Vuex store中获取
      // 这里模拟一些用户昵称
      const userNames = ['张工程师', '李主管', '王安全员', '赵技术员', '陈操作员'];
      const savedUserName = localStorage.getItem('currentUserName');
      
      if (savedUserName) {
        return savedUserName;
      } else {
        // 如果没有保存的用户名，随机选择一个并保存
        const randomName = userNames[Math.floor(Math.random() * userNames.length)];
        localStorage.setItem('currentUserName', randomName);
        return randomName;
      }
    },
    // 跳转到更多预警页面
    goToMoreWarnings() {
      // 跳转到预警管理页面
      this.$router.push({
        path: '/monitoring/warningManage'
      });
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
    
    // 获取当前预警状态
    getCurrentWarningStatus(warning) {
      if (!warning.operationHistory || warning.operationHistory.length === 0) {
        return {
          text: '待处理',
          class: 'status-pending'
        };
      }
      
      // 查找最新的状态（第一个元素）
      const latestOperation = warning.operationHistory[0];
      
      // 检查是否已归档
      const hasArchived = warning.operationHistory.some(record => 
        record.operationType === 'archive' || record.operationType === 'falseAlarm'
      ) || warning.status === 'archived';
      
      if (hasArchived) {
        return {
          text: '已归档',
          class: 'status-archived'
        };
      }
      
      // 检查是否有已处理状态
      const hasCompletedProcessing = warning.operationHistory.some(record => 
        record.operationType === 'completed'
      );
      
      if (hasCompletedProcessing) {
        return {
          text: '已处理',
          class: 'status-completed'
        };
      }
      
      // 检查是否有处理中状态
      const hasActiveProcessing = warning.operationHistory.some(record => 
        record.operationType === 'processing'
      );
      
      if (hasActiveProcessing) {
        return {
          text: '处理中',
          class: 'status-processing'
        };
      }
      
      // 检查是否已经确认开始处理（待处理状态完成）
      const hasPendingCompleted = warning.operationHistory.some(record => 
        record.operationType === 'pending' && record.status === 'completed'
      );
      
      if (hasPendingCompleted) {
        return {
          text: '处理中',
          class: 'status-processing'
        };
      }
      
      // 默认为待处理
      return {
        text: '待处理',
        class: 'status-pending'
      };
    },
    
    // 检查处理按钮是否应该禁用
    isProcessingDisabled(warning) {
      if (!warning.operationHistory || warning.operationHistory.length === 0) {
        return false; // 没有历史记录，可以处理
      }
      
      // 如果已归档，禁用处理按钮
      const hasArchived = warning.operationHistory.some(record => 
        record.operationType === 'archive' || record.operationType === 'falseAlarm'
      ) || warning.status === 'archived';
      
      if (hasArchived) {
        return true;
      }
      
      // 如果已完成处理，禁用处理按钮
      const hasCompletedProcessing = warning.operationHistory.some(record => 
        record.operationType === 'completed'
      );
      
      return hasCompletedProcessing;
    },
    
    // 格式化时间显示
    formatTime(timeString) {
      try {
        // 如果是完整的时间字符串，格式化为更友好的显示
        if (timeString.includes(' ')) {
          const [date, time] = timeString.split(' ');
          const [year, month, day] = date.split('-');
          return `${month}-${day} ${time}`;
        }
        return timeString;
      } catch (error) {
        return timeString;
      }
    },
  }
}
</script>

<style scoped>
/* 实时监控容器 - 科技感蓝色风格 */
.realtime-monitoring-container {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  background: #f5f5f5;
  padding: 0;
  overflow: hidden;
}

/* 主容器 - 科技感设计 */
.main-container {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  background: #f5f5f5;
  position: relative;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 移除蓝色渐变背景 */

/* 移除z-index设置 */

/* 设备树容器 - 科技感设计 */
.device-tree-aside {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid rgba(59, 130, 246, 0.1);
  height: 100%;
  overflow: hidden;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  margin-right: 16px;
  z-index: 10;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(59, 130, 246, 0.1);
}



.device-tree-aside > * {
  position: relative;
  z-index: 2;
}

.custom-tree-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  min-height: 80px;
  flex-shrink: 0;
  border-radius: 16px 16px 0 0;
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}



@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
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
  font-weight: 600 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

.header-switch /deep/ .el-switch__label.is-active {
  color: #ffffff !important;
}

.custom-tree-container {
  flex: 1;
  overflow: auto;
  height: calc(100% - 80px);
  padding: 16px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
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

/* 视频主容器 - 科技感设计 */
.video-main-container {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  margin: 0 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
}



.video-main-container > * {
  position: relative;
  z-index: 2;
}

/* 视频工具栏 - 科技感设计 */
.video-toolbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}



.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-mode-buttons {
  display: flex;
  gap: 8px;
}

/* 预警列表侧边栏 - 科技感设计，固定高度避免滚动条 */
.warning-aside {
  width: 270px;
  flex: none;
  height: calc(100vh - 120px);
  max-height: calc(100vh - 120px);
  position: relative;
  overflow: hidden;
}

.warning-list {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
}



.warning-list > * {
  position: relative;
  z-index: 2;
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
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.current-time i {
  color: #3b82f6;
  font-size: 16px;
}

/* 按钮样式 - 科技感设计 */
.btn {
  margin: 0 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 16px;
  color: #4b5563;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(4px);
}

.btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: #fff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.fullscreen-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.fullscreen-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  color: #c0c4cc;
}

/* 视频主区域 - 科技感设计 */
.video-main {
  padding: 16px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  overflow: hidden;
}

/* 视频网格 - 科技感设计 */
.video-grid {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  padding: 16px;
  position: relative;
  display: grid;
  gap: 16px;
}



.video-grid > * {
  position: relative;
  z-index: 2;
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

/* 视频单元格 - 科技感设计 */
.video-cell {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f3f4f6;
  position: relative;
  animation: fadeIn 0.4s ease-out;
}



.video-cell > * {
  position: relative;
  z-index: 2;
}

.video-cell.selected {
  border: 1px solid #3b82f6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
  z-index: 5;
}

.video-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

/* 视频标题栏 - 科技感设计 */
.video-slim-header {
  height: 36px;
  padding: 0 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}



@keyframes headerShimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.video-slim-header .camera-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.video-slim-header .video-status {
  display: flex;
  align-items: center;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  margin-left: 8px;
  backdrop-filter: blur(4px);
}

.video-slim-header .video-status .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.video-slim-header .video-status.online {
  color: #95ffa5;
}

.video-slim-header .video-status.online .status-dot {
  background-color: #67c23a;
  box-shadow: 0 0 4px #67c23a;
  animation: pulse 1.5s infinite ease-in-out;
}

.video-slim-header .video-status.offline {
  color: #ffbbbb;
}

.video-slim-header .video-status.offline .status-dot {
  background-color: #f56c6c;
}

.video-cell .video-content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 0;
  height: calc(100% - 36px);
  width: 100%;
  overflow: hidden;
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

/* 视频占位符 - 科技感设计 */
.video-cell .video-content .video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a1526, #1e3c72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-sizing: border-box;
  position: relative;
}



@keyframes patternMove {
  0% { background-position: 0 0; }
  100% { background-position: 20px 20px; }
}

.video-cell .video-content .no-signal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  width: 100%;
  height: 100%;
  z-index: 2;
  position: relative;
}

.video-cell .video-content .no-signal i {
  font-size: 36px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.7);
  opacity: 0.8;
}

.video-cell .video-content .no-signal div {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

/* 预警列表头部 - 科技感设计，调整高度 */
.warning-list .list-header {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}



.warning-list .list-header .more-btn {
  color: white;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.warning-list .list-header .more-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.warning-list .list-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  height: calc(100% - 60px);
}

/* 预警项目 - 科技感设计，调整尺寸减少滚动条 */
.warning-list .list-content .warning-item {
  padding: 8px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out;
}



.warning-list .list-content .warning-item > * {
  position: relative;
  z-index: 2;
}

.warning-list .list-content .warning-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.warning-list .list-content .warning-item .warning-status-container {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

/* 预警标签 - 科技感设计 */
.warning-list .list-content .warning-item .warning-level-badge {
  padding: 4px 10px;
  font-size: 12px;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.warning-list .list-content .warning-item .warning-status-badge {
  padding: 4px 10px;
  font-size: 12px;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.warning-list .list-content .warning-item .warning-level-badge.level1 {
  background-color: #f56c6c;
}

.warning-list .list-content .warning-item .warning-level-badge.level2 {
  background-color: #e6a23c;
}

.warning-list .list-content .warning-item .warning-level-badge.level3 {
  background-color: #909399;
  color: #ffffff;
}

.warning-list .list-content .warning-item .warning-level-badge.level4 {
  background-color: #67c23a;
}

/* 状态标签颜色 */
.warning-list .list-content .warning-item .warning-status-badge.status-pending {
  background-color: #909399;
}

.warning-list .list-content .warning-item .warning-status-badge.status-processing {
  background-color: #409EFF;
}

.warning-list .list-content .warning-item .warning-status-badge.status-completed {
  background-color: #67c23a;
}

.warning-list .list-content .warning-item .warning-status-badge.status-archived {
  background-color: #606266;
}



.warning-list .list-content .warning-item .warning-info {
  padding: 2px 0;
}

.warning-list .list-content .warning-item .warning-info .warning-time-location {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
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
  color: #909399;
  font-weight: 500;
  background: rgba(144, 147, 153, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* 预警操作按钮 - 与详情弹框颜色保持一致 */
.warning-list .list-content .warning-item .warning-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  gap: 6px;
}

.warning-list .list-content .warning-item .warning-actions .el-button {
  flex: 1;
  margin: 0;
  padding: 6px 8px;
  font-size: 11px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 预警操作按钮基础样式 - 与预警详情页面保持一致 */
.warning-list .list-content .warning-item .warning-actions .el-button {
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: transparent;
  border-color: #d1d5db;
  color: #4b5563;
  border-width: 1px;
  border-style: solid;
}

/* 所有按钮的悬浮效果 - 淡蓝色交互效果 */
.warning-list .list-content .warning-item .warning-actions .el-button:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

/* 禁用状态样式 */
.warning-list .list-content .warning-item .warning-actions .el-button.is-disabled,
.warning-list .list-content .warning-item .warning-actions .el-button:disabled {
  background-color: transparent;
  border-color: #e4e7ed;
  color: #c0c4cc;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.warning-list .list-content .warning-item .warning-actions .el-button.is-disabled:hover,
.warning-list .list-content .warning-item .warning-actions .el-button:disabled:hover {
  background-color: transparent;
  border-color: #e4e7ed;
  color: #c0c4cc;
  transform: none;
  box-shadow: none;
}

/* 原有的plain样式已移除，统一使用新的科技感蓝色交互效果 */

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
  height: 100px;
  margin-bottom: 8px;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.warning-list .list-content .warning-item .warning-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}

.warning-list .list-content .warning-item .warning-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.warning-list .list-content .warning-item:hover .warning-image img {
  transform: scale(1.05);
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

body.camera-fullscreen-mode .video-cell .video-content .video-placeholder i.el-icon-warning {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.process-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  border-left: 3px solid #909399;
}

/* 对话框样式优化 - 科技感设计 */
.realtime-monitoring-container >>> .el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.realtime-monitoring-container >>> .el-dialog__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  padding: 16px 20px;
}

.realtime-monitoring-container >>> .el-dialog__title {
  color: #1f2937;
  font-weight: 600;
}

.realtime-monitoring-container >>> .el-dialog__close {
  color: #6b7280;
  transition: color 0.3s ease;
}

.realtime-monitoring-container >>> .el-dialog__close:hover {
  color: #3b82f6;
}

.realtime-monitoring-container >>> .el-dialog__body {
  padding: 20px;
  background: #ffffff;
}

.realtime-monitoring-container >>> .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.realtime-monitoring-container >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.realtime-monitoring-container >>> .el-button--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.realtime-monitoring-container >>> .el-button--success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.realtime-monitoring-container >>> .el-button--default {
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.realtime-monitoring-container >>> .el-button--default:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* 输入框和选择框样式优化 */
.realtime-monitoring-container >>> .el-input__inner {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.realtime-monitoring-container >>> .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.realtime-monitoring-container >>> .el-textarea__inner {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.realtime-monitoring-container >>> .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 通道列表区域隐藏滚动条 */
.custom-tree-container::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.custom-tree-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE和Edge */
}

/* 实时预警列表滚动条 - 黑色样式 */
.warning-list .list-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.warning-list .list-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.warning-list .list-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.warning-list .list-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* 其他区域保持默认滚动条样式 */
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

/* Loading动画 - 科技感效果 */
.realtime-monitoring-container >>> .el-loading-mask {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
}

.realtime-monitoring-container >>> .el-loading-spinner {
  color: #3b82f6 !important;
}

.realtime-monitoring-container >>> .el-loading-text {
  color: #1f2937 !important;
  font-weight: 500 !important;
}

/* Pulse动画 */
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

/* 淡入动画 */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
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

/* 默认滚动条样式 - 黑色主题 */
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

<template>
  <div class="visual-center" ref="visualCenter">
    <div class="top-bar">
      <div class="time">{{ currentDetailTime }}</div>
      <div class="title">
        <span>太行视觉AI监控中心</span>
      </div>
      <div class="right-controls">
        <div class="location-info">
          <div v-if="locationInfo.loading" class="loading-indicator">
            <span>加载中...</span>
          </div>
          <template v-else>
            <div class="location">
              <i class="el-icon-location"></i>
              <span>{{ locationInfo.location }}</span>
            </div>
            <div class="weather-info">
              <i class="el-icon-sunny"></i>
              <span>{{ locationInfo.weather }}</span>
              <span class="air-quality">{{ locationInfo.airQuality }}</span>
            </div>
          </template>
        </div>
        <div class="fullscreen-btn" @click="toggleFullscreen">
          <i class="el-icon-full-screen"></i>
        </div>
      </div>
    </div>

    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧统计 -->
        <el-col :span="6">
          <div class="stat-panel panel-box panel-equal-height">
            <div class="panel-title">预警趋势</div>
            <div class="trend-chart" ref="trendChart"></div>
          </div>
          <div class="type-panel panel-box panel-equal-height">
            <div class="panel-title">预警类型排名</div>
            <div class="type-list">
              <div v-for="(item, index) in warningTypes" :key="index" class="type-item">
                <span class="type-name">{{ item.name }}</span>
                <div class="type-bar">
                  <div class="bar-inner" :style="{ width: item.value + '%' }"></div>
                </div>
                <span class="type-count">{{ item.count }}个</span>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间预警图片查看器 -->
        <el-col :span="12">
          <div class="map-panel panel-box">
            <!-- 预警图片查看器 -->
            <div class="warning-viewer">
              <!-- 主要显示区域 -->
              <div class="main-image-container">
                <img 
                  :src="currentWarningImage.image" 
                  :alt="currentWarningImage.event"
                  class="main-warning-image"
                />
                
                <!-- 顶部信息叠加层 -->
                <div class="top-info-overlay">
                  <div class="info-card warning-info-card">
                    <div class="info-icon warning-icon">
                  <i class="el-icon-warning"></i>
                </div>
                    <div class="info-content">
                      <div class="info-title">今日预警</div>
                      <div class="info-number">{{ todayWarnings }}<span class="info-unit">个</span></div>
                </div>
              </div>
                  <div class="info-card device-info-card">
                    <div class="info-icon device-icon">
                  <i class="el-icon-video-camera-solid"></i>
                </div>
                    <div class="info-content">
                      <div class="info-title">设备概览</div>
                      <div class="info-number">{{ deviceCount }}/{{ totalDevices }}</div>
                </div>
              </div>
                </div>
                
                <!-- 预警信息叠加层 -->
                <div class="warning-info-overlay">
                  <div class="warning-info-panel">
                    <div class="info-row">
                      <span class="info-label">预警时间：</span>
                      <span class="info-value">{{ currentWarningImage.time }}</span>
                </div>
                    <div class="info-row">
                      <span class="info-label">预警事件：</span>
                      <span class="info-value">{{ currentWarningImage.event }}</span>
              </div>
                    <div class="info-row">
                      <span class="info-label">预警等级：</span>
                      <span class="info-value" :class="'level-' + currentWarningImage.level">{{ currentWarningImage.levelText }}</span>
                </div>
                    <div class="info-row">
                      <span class="info-label">预警点位：</span>
                      <span class="info-value">{{ currentWarningImage.location }}</span>
                </div>
              </div>
            </div>
                </div>
              
              <!-- 底部缩略图滑动区域 -->
              <div class="thumbnail-container-bottom">
                <!-- 左侧导航按钮 -->
                <button 
                  class="slider-btn prev-btn"
                  @click="slidePrev"
                  :disabled="currentImageIndex === 0"
                >
                  <i class="el-icon-arrow-left"></i>
                </button>
                
                <!-- 中间滑动区域 -->
                <div class="thumbnail-slider" ref="thumbnailSlider">
                  <div 
                    v-for="(warning, index) in warningImages" 
                    :key="index"
                    :class="['thumbnail-item', { active: currentImageIndex === index }]"
                    @click="selectWarningImage(index)"
                  >
                    <img :src="warning.image" :alt="warning.event" />
                </div>
              </div>
                
                <!-- 右侧导航按钮 -->
                <button 
                  class="slider-btn next-btn"
                  @click="slideNext"
                  :disabled="currentImageIndex === warningImages.length - 1"
                >
                  <i class="el-icon-arrow-right"></i>
                </button>
            </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧统计 -->
        <el-col :span="6">
          <div class="level-panel panel-box panel-equal-height">
            <div class="panel-title">预警等级占比</div>
            <div class="level-chart" ref="levelChart"></div>
          </div>
          <div class="top-panel panel-box panel-equal-height">
            <div class="panel-title">组织预警 Top 5</div>
            <div class="top-list">
              <div v-for="(item, index) in topWarnings" :key="index" class="top-item">
                <span class="item-name">{{ item.name }}</span>
                <div class="item-bar">
                  <div class="bar-inner" :style="{ width: item.value + '%' }"></div>
                </div>
                <span class="item-count">{{ item.count }}个</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 底部表格 -->
      <el-row class="bottom-section" :gutter="20">
        <el-col :span="6">
          <div class="status-panel panel-box panel-bottom-equal-height">
            <div class="panel-title">预警处理情况</div>
            <div class="status-tabs">
              <div 
                v-for="(label, key) in { day: '本日', week: '本周', month: '本月' }" 
                :key="key"
                :class="['tab-item', { active: statusTimeRange === key }]"
                @click="changeStatusTimeRange(key)"
              >
                {{ label }}
              </div>
            </div>
            <div class="status-chart" ref="statusChart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="list-panel panel-box panel-bottom-equal-height">
            <div class="panel-title">预警记录</div>
            <div class="warning-table">
              <el-table 
                :data="warningList" 
                style="width: 100%" 
                :header-cell-style="headerCellStyle" 
                :cell-style="{ background: 'transparent', color: '#7EAEE5', borderBottom: '1px solid rgba(35, 88, 148, 0.3)' }"
                :row-style="{ background: 'transparent' }"
                :row-class-name="'transparent-row'"
                :height="tableHeight">
                <el-table-column prop="event" label="预警事件" min-width="120" />
                <el-table-column prop="time" label="预警时间" width="180" />
                <el-table-column prop="status" label="处理状态" width="120">
                  <template slot-scope="scope">
                    <span :class="['status-tag', scope.row.status]">{{ scope.row.statusText }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="device-panel panel-box panel-bottom-equal-height">
            <div class="panel-title">设备预警数量 Top 10</div>
            <div class="device-tabs">
              <div 
                v-for="(label, key) in { day: '本日', week: '本周', month: '本月' }" 
                :key="key"
                :class="['tab-item', { active: deviceTimeRange === key }]"
                @click="changeDeviceTimeRange(key)"
              >
                {{ label }}
              </div>
            </div>
              
            <div class="device-table">
              <el-table
                :data="deviceWarnings"
                :header-cell-style="headerCellStyle"
                :cell-style="{ background: 'transparent', color: '#7EAEE5', borderBottom: '1px solid rgba(35, 88, 148, 0.3)' }"
                :row-style="{ background: 'transparent' }"
                :row-class-name="'transparent-row'"
                style="width: 100%"
                :height="tableHeight"
              >
                <el-table-column prop="name" label="设备位置" />
                <el-table-column prop="count" label="预警数量" align="center" width="100" />
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  name: 'VisualCenter',
  data() {
    return {
      // 系统状态数据
      todayWarnings: 0,
      deviceCount: 0,
      totalDevices: 0,
      currentDetailTime: this.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      currentEvent: '',
      currentDevice: '',

      // 天气和位置信息
      locationInfo: {
        location: '',
        weather: '',
        airQuality: '',
        loading: true
      },

      // 状态数据
      statusData: {
        day: [
          { value: 5, name: '待处理', itemStyle: { color: '#FF8746' } },
          { value: 3, name: '处理中', itemStyle: { color: '#44FF9B' } },
          { value: 12, name: '已完成', itemStyle: { color: '#00FFFF' } }
        ],
        week: [
          { value: 18, name: '待处理', itemStyle: { color: '#FF8746' } },
          { value: 25, name: '处理中', itemStyle: { color: '#44FF9B' } },
          { value: 65, name: '已完成', itemStyle: { color: '#00FFFF' } }
        ],
        month: [
          { value: 42, name: '待处理', itemStyle: { color: '#FF8746' } },
          { value: 78, name: '处理中', itemStyle: { color: '#44FF9B' } },
          { value: 180, name: '已完成', itemStyle: { color: '#00FFFF' } }
        ]
      },

      // 全屏状态
      isFullscreen: false,

      // 表格样式
      headerCellStyle: {
        background: 'linear-gradient(180deg, rgba(6, 30, 93, 0.9) 0%, rgba(4, 20, 63, 1) 100%)',
        color: '#00FFFF',
        borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
        fontWeight: 'normal',
        padding: '12px 0',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
      },

      // 预警类型数据
      warningTypes: [
        { name: '未戴安全帽', count: 9, value: 100 },
        { name: '区域入侵', count: 7, value: 78 },
        { name: '垃圾堆积', count: 5, value: 56 },
        { name: '人员聚集', count: 4, value: 44 },
        { name: '烟雾识别', count: 2, value: 22 }
      ],

      // 定时器
      weatherTimer: null,
      statusTimer: null,
      timeTimer: null,

      // 图表实例
      trendChart: null,
      levelChart: null,
      statusChart: null,

      // 预警列表
      warningList: [],
      
      // 设备预警
      deviceWarnings: [],
      
      // 时间范围
      statusTimeRange: 'day',
      deviceTimeRange: 'day',
      
      // 组织预警Top5
      topWarnings: [
        { name: '生产车间A', count: 15, value: 100 },
        { name: '装配车间', count: 12, value: 80 },
        { name: '机械加工区', count: 9, value: 60 },
        { name: '原料仓库', count: 6, value: 40 },
        { name: '成品仓库', count: 3, value: 20 }
      ],

      // 表格高度
      tableHeight: 280,

      // 预警图片相关数据
      currentWarningImage: {
        image: '',
        event: '',
        time: '',
        level: '',
        levelText: '',
        location: ''
      },
      warningImages: [],
      currentImageIndex: 0
    };
  },
  mounted() {
    // 初始化模拟数据
    this.initMockData();
    
    // 初始化CSS变量 - 只保留面板相关的变量
    document.documentElement.style.setProperty('--panel-top-height', '210px');
    document.documentElement.style.setProperty('--panel-bottom-height', '330px');
    
    this.fetchWeatherData();
    this.fetchSystemStatus();
    this.updateCurrentTime();
    
    // 设置定时器
    this.weatherTimer = setInterval(this.fetchWeatherData, 5 * 60 * 1000); // 每5分钟更新天气
    this.statusTimer = setInterval(this.fetchSystemStatus, 30 * 1000); // 每30秒更新系统状态
    this.timeTimer = setInterval(this.updateCurrentTime, 1000); // 每秒更新一次时间
    
    // 监听全屏变化
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    
    // 初始化图表和3D场景
    this.$nextTick(() => {
      this.initTrendChart();
      this.initLevelChart();
      this.initStatusChart();
      this.initSimpleMapArea();
      this.generateMockData();
      this.initWarningViewer();
    });
    
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 清理定时器
    clearInterval(this.weatherTimer);
    clearInterval(this.statusTimer);
    clearInterval(this.timeTimer);
    
    // 移除事件监听
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('keydown', this.handleKeyboardNavigation);
    window.removeEventListener('resize', this.handleResize);
    
    // 销毁图表和3D资源
    if (this.trendChart) this.trendChart.dispose();
    if (this.levelChart) this.levelChart.dispose();
    if (this.statusChart) this.statusChart.dispose();
  },
  methods: {
    // 添加格式化日期的方法
    formatDate(date, formatStr) {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return formatStr
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },
    
    // 初始化模拟数据
    initMockData() {
      // 初始化数据，以避免undefined错误
      this.todayWarnings = 25;
      this.deviceCount = 120;
      this.totalDevices = 150;
      this.currentEvent = '未戴安全帽';
      this.currentDevice = '生产车间A区监控';
      
      // 初始化天气信息
      this.locationInfo = {
        location: '太行工业园区',
        weather: '晴 26°C',
        loading: false
      };
      
      // 初始化预警列表
      this.warningList = [
        { event: '未戴安全帽', time: '2023-03-28 08:23:15', status: 'pending', statusText: '待处理' },
        { event: '区域入侵', time: '2023-03-28 09:45:22', status: 'processing', statusText: '处理中' },
        { event: '垃圾堆积', time: '2023-03-28 10:12:35', status: 'completed', statusText: '已完成' },
        { event: '人员聚集', time: '2023-03-28 11:30:42', status: 'pending', statusText: '待处理' },
        { event: '未戴安全帽', time: '2023-03-28 13:15:18', status: 'completed', statusText: '已完成' },
        { event: '烟雾识别', time: '2023-03-28 14:37:51', status: 'processing', statusText: '处理中' },
        { event: '区域入侵', time: '2023-03-28 15:20:33', status: 'pending', statusText: '待处理' },
        { event: '垃圾堆积', time: '2023-03-28 16:45:27', status: 'completed', statusText: '已完成' },
        { event: '未戴安全帽', time: '2023-03-28 17:12:05', status: 'completed', statusText: '已完成' },
        { event: '区域入侵', time: '2023-03-28 18:33:19', status: 'pending', statusText: '待处理' }
      ];
      
      // 初始化设备预警
      this.deviceWarnings = [
        { name: '生产车间A区监控', count: 15 },
        { name: '装配车间北区', count: 12 },
        { name: '机械加工区西门', count: 9 },
        { name: '原料仓库大门', count: 6 },
        { name: '成品仓库监控', count: 3 },
        { name: '办公楼一层大厅', count: 2 },
        { name: '研发中心后门', count: 5 },
        { name: '食堂后厨监控', count: 4 },
        { name: '园区东门', count: 7 },
        { name: '停车场西区', count: 8 }
      ];
      
      // 初始化预警类型
      this.warningTypes = [
        { name: '未戴安全帽', count: 9, value: 100 },
        { name: '区域入侵', count: 7, value: 78 },
        { name: '垃圾堆积', count: 5, value: 56 },
        { name: '人员聚集', count: 4, value: 44 },
        { name: '烟雾识别', count: 2, value: 22 }
      ];
      
      // 初始化组织预警
      this.topWarnings = [
        { name: '生产车间A', count: 15, value: 100 },
        { name: '装配车间', count: 12, value: 80 },
        { name: '机械加工区', count: 9, value: 60 },
        { name: '原料仓库', count: 6, value: 40 },
        { name: '成品仓库', count: 3, value: 20 }
      ];
      
      // 初始化预警图片数据
      this.warningImages = [
        {
          image: 'https://via.placeholder.com/800x600/333333/FFFFFF?text=预警图片1',
          event: '识别大块异物ZMR',
          time: '2025.06.03 15:17',
          level: 'high',
          levelText: '四级',
          location: '测试zmr'
        },
        {
          image: 'https://via.placeholder.com/800x600/444444/FFFFFF?text=预警图片2',
          event: '未戴安全帽',
          time: '2025.06.03 14:52',
          level: 'medium',
          levelText: '三级',
          location: '生产车间A区'
        },
        {
          image: 'https://via.placeholder.com/800x600/555555/FFFFFF?text=预警图片3',
          event: '区域入侵',
          time: '2025.06.03 14:30',
          level: 'low',
          levelText: '二级',
          location: '装配车间北门'
        },
        {
          image: 'https://via.placeholder.com/800x600/666666/FFFFFF?text=预警图片4',
          event: '垃圾堆积',
          time: '2025.06.03 13:45',
          level: 'low',
          levelText: '一级',
          location: '原料仓库东侧'
        },
        {
          image: 'https://via.placeholder.com/800x600/777777/FFFFFF?text=预警图片5',
          event: '烟雾识别',
          time: '2025.06.03 12:20',
          level: 'urgent',
          levelText: '紧急',
          location: '机械加工区'
        }
      ];
      
      // 设置默认显示第一张图片
      if (this.warningImages.length > 0) {
        this.currentWarningImage = this.warningImages[0];
        this.currentImageIndex = 0;
      }
    },
    
    // 获取系统状态数据
    async fetchSystemStatus() {
      try {
        // 使用模拟数据代替真实API调用
        // const response = await this.$axios.get('/api/system/status').catch(() => null);
        
        // 模拟API响应
        const response = {
          data: {
            todayWarnings: 25,
            deviceCount: 120,
            totalDevices: 150,
            currentEvent: '未戴安全帽',
            currentDevice: '生产车间A区监控'
          }
        };
        
        if (response && response.data) {
          const { data } = response;
          this.todayWarnings = data.todayWarnings || 0;
          this.deviceCount = data.deviceCount || 0;
          this.totalDevices = data.totalDevices || 0;
          this.currentEvent = data.currentEvent || '';
          this.currentDevice = data.currentDevice || '';
        }
      } catch (error) {
        console.error('获取系统状态失败:', error);
      }
    },
    
    // 获取实时位置和天气信息
    async fetchWeatherData() {
      try {
        this.locationInfo.loading = true;
        
        // 模拟天气数据，避免跨域和API密钥问题
        /*
        // 首先尝试获取用户位置
        let position;
        try {
          position = await this.getCurrentPosition();
        } catch (error) {
          console.warn('无法获取用户位置，使用默认位置:', error);
          position = { latitude: 38.0428, longitude: 114.5149 }; // 石家庄默认坐标
        }
        
        // 使用获取到的位置请求天气信息
        const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
          params: {
            key: 'f0245b8d45c94ca58ba24440251703',
            q: `${position.latitude},${position.longitude}`,
            lang: 'zh',
            aqi: 'yes'
          }
        });
        */
        
        // 使用模拟数据
        const response = {
          data: {
            location: {
              name: '太行工业园区'
            },
            current: {
              condition: {
                text: '晴'
              },
              temp_c: 26,
              air_quality: {
                'us-epa-index': 2 // 良
              }
            }
          }
        };
        
        if (response && response.data && response.data.location && response.data.current) {
          const { location, current } = response.data;
          this.locationInfo.location = location.name;
          // 天气和温度合并显示
          this.locationInfo.weather = `${current.condition.text} ${current.temp_c}°C`;
          
        }
      } catch (error) {
        console.error('获取天气数据失败:', error);
        this.locationInfo.location = '太行工业园区';
        this.locationInfo.weather = '晴 26°C';
      } finally {
        this.locationInfo.loading = false;
      }
    },
    
    // 获取当前位置的Promise封装
    getCurrentPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('浏览器不支持地理位置'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });
    },
    
    // 更新当前时间
    updateCurrentTime() {
      // 获取实时时间
      const now = new Date();
      this.currentDetailTime = this.formatDate(now, 'yyyy-MM-dd HH:mm:ss');
    },
    
    // 切换全屏
    async toggleFullscreen() {
      try {
        if (!document.fullscreenElement) {
          await this.$refs.visualCenter.requestFullscreen();
          this.isFullscreen = true;
        } else {
          await document.exitFullscreen();
          this.isFullscreen = false;
        }
      } catch (err) {
        console.error('全屏切换失败:', err);
      }
    },
    
    // 处理全屏变化事件
    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement;
      
      // 根据全屏状态调整表格高度和面板高度
      if (this.isFullscreen) {
        this.tableHeight = 280; // 全屏模式下适中的表格高度
        // 调整全屏下的面板高度 - 适当缩小以避免滚动
        document.documentElement.style.setProperty('--panel-top-height', '240px');
        document.documentElement.style.setProperty('--panel-bottom-height', '320px');
      } else {
        this.tableHeight = 280; // 非全屏模式下使用与全屏相同的表格高度，确保显示效果一致
        // 恢复正常模式下的面板高度
        document.documentElement.style.setProperty('--panel-top-height', '210px');
        document.documentElement.style.setProperty('--panel-bottom-height', '330px');
      }
      
      // 全屏状态变化后，重新调整图表大小
      setTimeout(() => {
        if (this.trendChart) this.trendChart.resize();
        if (this.levelChart) this.levelChart.resize();
        if (this.statusChart) this.statusChart.resize();
      }, 300);
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.trendChart) this.trendChart.resize();
      if (this.levelChart) this.levelChart.resize();
      if (this.statusChart) this.statusChart.resize();
    },
    
    // 初始化趋势图表
    initTrendChart() {
      const trendChartDom = this.$refs.trendChart;
      if (!trendChartDom) return;
      
      this.trendChart = echarts.init(trendChartDom);
      
      const option = {
        backgroundColor: 'transparent',
        grid: {
          top: 40,
          bottom: 20,
          left: 0,
          right: 20,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.3)',
              width: 1
            }
          },
          backgroundColor: 'rgba(0, 19, 40, 0.8)',
          borderColor: 'rgba(0, 255, 255, 0.3)',
          textStyle: {
            color: '#00FFFF'
          }
        },
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#7EAEE5'
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#7EAEE5'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(35, 88, 148, 0.3)',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '预警数量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [3, 5, 10, 14, 12, 7, 5],
            lineStyle: {
              width: 3,
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#00FFFF' },
                  { offset: 1, color: '#207FFF' }
                ]
              }
            },
            itemStyle: {
              color: '#00FFFF',
              borderColor: 'rgba(0, 255, 255, 0.3)',
              borderWidth: 6
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 255, 255, 0.3)' },
                  { offset: 1, color: 'rgba(0, 255, 255, 0)' }
                ]
              }
            }
          }
        ]
      };
      
      this.trendChart.setOption(option);
    },
    
    // 初始化等级占比图表
    initLevelChart() {
      const levelChartDom = this.$refs.levelChart;
      if (!levelChartDom) return;
      
      this.levelChart = echarts.init(levelChartDom);
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(0, 19, 40, 0.8)',
          borderColor: 'rgba(0, 255, 255, 0.3)',
          textStyle: {
            color: '#00FFFF'
          }
        },
        color: ['#FF4D4F', '#FF8746', '#44FF9B', '#00C5FF'],
        legend: {
          orient: 'vertical',
          right: 0,
          top: 'center',
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 20,
          textStyle: {
            color: '#7EAEE5'
          },
          formatter: function(name) {
            return name;
          }
        },
        series: [
          {
            name: '预警等级',
            type: 'pie',
            radius: ['60%', '85%'],
            center: ['30%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: false
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 8, name: '紧急' },
              { value: 15, name: '重要' },
              { value: 21, name: '普通' },
              { value: 11, name: '提示' }
            ]
          }
        ]
      };
      
      this.levelChart.setOption(option);
    },
    
    // 初始化状态图表
    initStatusChart() {
      const statusChartDom = this.$refs.statusChart;
      if (!statusChartDom) return;
      
      this.statusChart = echarts.init(statusChartDom);
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(0, 19, 40, 0.8)',
          borderColor: 'rgba(0, 255, 255, 0.3)',
          textStyle: {
            color: '#00FFFF'
          }
        },
        series: [
          {
            name: '状态分布',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '50%'], // 修改为50%,50%使其上下左右都居中
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c}条',
              color: '#7EAEE5'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold',
                color: '#00FFFF'
              }
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 10,
              lineStyle: {
                color: 'rgba(35, 88, 148, 0.8)'
              }
            },
            data: this.statusData.day
          }
        ]
      };
      
      this.statusChart.setOption(option);
    },
    
    // 初始化简单地图区域
    initSimpleMapArea() {
      // 地图区域已移除
    },
    
    // 更新设备表格数据
    generateMockData() {
      // 生成模拟的预警列表
      this.warningList = [
        { event: '未戴安全帽', time: '2023-03-28 08:23:15', status: 'pending', statusText: '待处理' },
        { event: '区域入侵', time: '2023-03-28 09:45:22', status: 'processing', statusText: '处理中' },
        { event: '垃圾堆积', time: '2023-03-28 10:12:35', status: 'completed', statusText: '已完成' },
        { event: '人员聚集', time: '2023-03-28 11:30:42', status: 'pending', statusText: '待处理' },
        { event: '未戴安全帽', time: '2023-03-28 13:15:18', status: 'completed', statusText: '已完成' },
        { event: '烟雾识别', time: '2023-03-28 14:37:51', status: 'processing', statusText: '处理中' },
        { event: '区域入侵', time: '2023-03-28 15:20:33', status: 'pending', statusText: '待处理' },
        { event: '垃圾堆积', time: '2023-03-28 16:45:27', status: 'completed', statusText: '已完成' },
        { event: '未戴安全帽', time: '2023-03-28 17:12:05', status: 'completed', statusText: '已完成' },
        { event: '区域入侵', time: '2023-03-28 18:33:19', status: 'pending', statusText: '待处理' }
      ];
      
      // 生成模拟的设备预警
      this.deviceWarnings = [
        { name: '生产车间A区监控', count: 15 },
        { name: '装配车间北区', count: 12 },
        { name: '机械加工区西门', count: 9 },
        { name: '原料仓库大门', count: 6 },
        { name: '成品仓库监控', count: 3 },
        { name: '办公楼一层大厅', count: 2 },
        { name: '研发中心后门', count: 5 },
        { name: '食堂后厨监控', count: 4 },
        { name: '园区东门', count: 7 },
        { name: '停车场西区', count: 8 }
      ];
    },
    
    // 切换状态时间范围
    changeStatusTimeRange(range) {
      this.statusTimeRange = range;
      if (this.statusChart) {
        this.statusChart.setOption({
          series: [
            {
              data: this.statusData[range]
            }
          ]
        });
      }
    },
    
    // 切换设备时间范围
    changeDeviceTimeRange(range) {
      this.deviceTimeRange = range;
      // 这里可以根据不同时间范围加载不同设备数据
    },

    // 预警图片相关方法
    initWarningViewer() {
      // 添加键盘导航功能
      document.addEventListener('keydown', this.handleKeyboardNavigation);
      
      // 确保图片加载
      this.preloadImages();
    },
    
    handleKeyboardNavigation(event) {
      // 只在当前页面激活时处理键盘事件
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.slidePrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.slideNext();
          break;
        case 'Escape':
          event.preventDefault();
          // 可以添加退出全屏等功能
          break;
      }
    },
    
    preloadImages() {
      // 预加载所有图片以提升用户体验
      this.warningImages.forEach(warning => {
        const img = new Image();
        img.src = warning.image;
      });
    },
    
    // 滑动到指定缩略图位置
    scrollToThumbnail(index) {
      const thumbnailSlider = this.$refs.thumbnailSlider;
      if (thumbnailSlider) {
        const thumbnailItem = thumbnailSlider.children[index];
        if (thumbnailItem) {
          thumbnailItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    },
    
    // 重写选择图片方法，添加滚动效果
    selectWarningImage(index) {
      this.currentImageIndex = index;
      this.currentWarningImage = this.warningImages[index];
      this.scrollToThumbnail(index);
    },
    
    // 重写滑动方法，添加滚动效果
    slidePrev() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex = this.currentImageIndex - 1;
        this.currentWarningImage = this.warningImages[this.currentImageIndex];
        this.scrollToThumbnail(this.currentImageIndex);
      }
    },
    
    slideNext() {
      if (this.currentImageIndex < this.warningImages.length - 1) {
        this.currentImageIndex = this.currentImageIndex + 1;
        this.currentWarningImage = this.warningImages[this.currentImageIndex];
        this.scrollToThumbnail(this.currentImageIndex);
      }
    }
  }
}
</script>

<style scoped>
/* Vue2项目中使用普通CSS样式 */
:root {
  --panel-top-height: 210px;
  --panel-bottom-height: 330px;
}

/* 全局隐藏滚动条样式 */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.visual-center {
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #000B18 100%);
  color: #fff;
  padding: 20px;
  position: relative;
  overflow-x: hidden; /* 隐藏水平滚动条 */
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
  padding: 0 20px;
  height: 30px;
}

.top-bar .time {
  width: 300px;
  font-size: 18px;
  font-weight: bold;
  color: #00ffff;
  white-space: nowrap;
  line-height: 1;
}

.top-bar .title {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.top-bar .title span {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  position: relative;
}

.top-bar .title span::before,
.top-bar .title span::after {
  content: '';
  position: absolute;
  height: 2px;
  width: 70px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  top: 50%;
}

.top-bar .title span::before {
  right: calc(100% + 15px);
}

.top-bar .title span::after {
  left: calc(100% + 15px);
}

.right-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  flex: 0 0 auto;
  width: 300px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.location, .weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7EAEE5;
}

.location i, .weather-info i {
  color: #00FFFF;
  font-size: 16px;
}

.air-quality {
  margin-left: 8px;
  color: #44FF9B;
}

.exit-fullscreen-tip {
  color: #7EAEE5;
  font-size: 14px;
}

.exit-fullscreen-tip kbd {
  background-color: #061E5D;
  border: 1px solid #00FFFF;
  border-radius: 3px;
  padding: 2px 4px;
  margin: 0 2px;
  color: #00FFFF;
}

.panel-box {
  background: linear-gradient(180deg, rgba(6, 30, 93, 0.8) 0%, rgba(4, 20, 63, 0.9) 100%);
  border: 1px solid rgba(35, 88, 148, 0.5);
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.panel-title {
  color: #00FFFF;
  font-size: 16px;
  margin-bottom: 8px;
  padding-left: 10px;
  border-left: 3px solid #00FFFF;
  text-align: left;
}

.panel-equal-height {
  height: var(--panel-top-height);
  overflow: hidden;
}

.panel-bottom-equal-height {
  height: var(--panel-bottom-height);
  overflow: hidden;
}

.map-panel {
  height: calc(var(--panel-top-height) + 52px + var(--panel-top-height) + 0px); /* 精确对齐：上面板 + 间距 + 下面板 */
  margin-bottom: 20px; /* 确保与其他面板保持一致的底部间距 */
  display: flex;
  flex-direction: column;
}

/* 全屏模式下的中间面板 */
.visual-center:fullscreen .map-panel {
  height: calc(var(--panel-top-height) + 52px + var(--panel-top-height) + 0px); /* 全屏下使用相同的52px间距 */
}

.map-container {
  height: var(--map-container-height);
  background: rgba(6, 30, 93, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.2);
  flex: 1;
}

.stat-value {
  color: #00FFFF;
  font-size: 18px;
  font-weight: bold;
}

.stat-value .unit {
  font-size: 14px;
  opacity: 0.8;
  margin-left: 2px;
}

.status-tabs,
.device-tabs {
  display: flex;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.tab-item {
  padding: 8px 12px;
  cursor: pointer;
  color: #7EAEE5;
  font-size: 13px;
  position: relative;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #00FFFF;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #00FFFF;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  line-height: 1.5;
  position: relative;
  text-align: center;
  min-width: 52px;
}

.status-tag.pending {
  color: #ff8746;
  background: rgba(255, 135, 70, 0.1);
  border: 1px solid rgba(255, 135, 70, 0.3);
}

.status-tag.processing {
  color: #44ff9b;
  background: rgba(68, 255, 155, 0.1);
  border: 1px solid rgba(68, 255, 155, 0.3);
}

.status-tag.completed {
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.warning-table,
.device-table {
  height: calc(100% - 40px);
  flex: 1;
  overflow: hidden;
}

/* 特别针对预警记录表格的高度调整 */
.warning-table {
  height: calc(100% - 10px) !important;
}

/* 表格边框处理 */
.warning-table >>> .el-table,
.device-table >>> .el-table {
  border: none !important;
}

/* 完全移除表格边框和白边 */
.warning-table >>> .el-table,
.device-table >>> .el-table {
  border: none !important;
  border-collapse: collapse !important;
  border-spacing: 0 !important;
}

/* 移除表格容器边框 */
.warning-table >>> .el-table__border-left-patch,
.warning-table >>> .el-table__border-right-patch,
.device-table >>> .el-table__border-left-patch,
.device-table >>> .el-table__border-right-patch {
  display: none !important;
}

/* 移除表格外边框伪元素 */
.warning-table >>> .el-table::before,
.warning-table >>> .el-table::after,
.device-table >>> .el-table::before,
.device-table >>> .el-table::after {
  display: none !important;
}

/* 删除所有表格边框 */
.warning-table >>> .el-table td,
.warning-table >>> .el-table th,
.device-table >>> .el-table td,
.device-table >>> .el-table th {
  background-color: transparent;
  border: none !important; /* 删除所有边框 */
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: 1px solid rgba(35, 88, 148, 0.3) !important; /* 只保留底部分隔线 */
}

/* 删除表格最后一行的底部边框 */
.warning-table >>> .el-table tbody tr:last-child td,
.device-table >>> .el-table tbody tr:last-child td {
  border-bottom: none !important;
}

/* 删除表格底部边框 */
.warning-table >>> .el-table__append-wrapper,
.device-table >>> .el-table__append-wrapper {
  border: none !important;
}

/* 删除表格所有可能的边框 */
.warning-table >>> .el-table__header,
.warning-table >>> .el-table__body,
.warning-table >>> .el-table__footer,
.device-table >>> .el-table__header,
.device-table >>> .el-table__body,
.device-table >>> .el-table__footer {
  border: none !important;
}

/* 删除表格固定列边框 */
.warning-table >>> .el-table__fixed,
.warning-table >>> .el-table__fixed-right,
.device-table >>> .el-table__fixed,
.device-table >>> .el-table__fixed-right {
  border: none !important;
  box-shadow: none !important;
}

.warning-table >>> .el-table__fixed::before,
.warning-table >>> .el-table__fixed-right::before,
.device-table >>> .el-table__fixed::before,
.device-table >>> .el-table__fixed-right::before {
  display: none !important;
}

/* 统一表格高度 - 两个表格底边完全对齐 */
.warning-table {
  height: calc(100% - 15px) !important; /* 进一步增加预警记录表格高度，确保显示5行数据 */
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.device-table {
  height: calc(100% - 45px) !important; /* 设备表格有Tab，需要减去更多高度以对齐底部 */
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 移除表格包装器的边框和阴影 */
.warning-table >>> .el-table__body-wrapper,
.device-table >>> .el-table__body-wrapper {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.warning-table >>> .el-table__header-wrapper,
.device-table >>> .el-table__header-wrapper {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 移除表格内部所有可能的边框线 */
.warning-table >>> .el-table__empty-block,
.device-table >>> .el-table__empty-block {
  border: none !important;
}

.warning-table >>> .el-table__empty-text,
.device-table >>> .el-table__empty-text {
  border: none !important;
}

/* 强制移除所有可能的白色边框 */
.warning-table >>> *,
.device-table >>> * {
  border-color: transparent !important;
  outline-color: transparent !important;
}

/* 特别处理可能存在的边框伪元素 */
.warning-table >>> .el-table--border .el-table__cell:first-child::before,
.warning-table >>> .el-table--border .el-table__cell:last-child::after,
.device-table >>> .el-table--border .el-table__cell:first-child::before,
.device-table >>> .el-table--border .el-table__cell:last-child::after {
  display: none !important;
}

/* 移除表格分组相关的边框 */
.warning-table >>> .el-table--group::after,
.warning-table >>> .el-table--group::before,
.device-table >>> .el-table--group::after,
.device-table >>> .el-table--group::before {
  display: none !important;
}

.type-list,
.top-list {
  height: calc(100% - 20px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

/* 隐藏自定义滚动条 */
.type-list::-webkit-scrollbar,
.top-list::-webkit-scrollbar {
  display: none;
}

.type-item, .top-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.type-name, .item-name {
  width: 100px;
  color: #7EAEE5;
}

.type-bar, .item-bar {
  flex: 1;
  height: 6px;
  background: rgba(126, 174, 229, 0.1);
  margin: 0 10px;
  border-radius: 3px;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  background: #00FFFF;
  border-radius: 3px;
}

.type-count, .item-count {
  width: 50px;
  text-align: right;
  color: #7EAEE5;
}

/* 全屏按钮样式 */
.fullscreen-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 30, 93, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  color: #00FFFF;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fullscreen-btn:hover {
  background: rgba(0, 30, 60, 0.7);
  border-color: rgba(0, 255, 255, 0.6);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.status-chart {
  height: calc(var(--panel-top-height) - 80px);
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 更新图表组件样式 */
.status-chart >>> .ve-pie {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 调整饼图系列的位置 */
.status-chart >>> .echarts-for-vue {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100% !important;
}

/* 预警图片查看器样式 */
.warning-viewer {
  height: calc(100% - 30px); /* 适应较小面板的高度 */
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 全屏模式下的特殊样式 */
.visual-center:fullscreen .warning-viewer {
  height: calc(100% - 30px); /* 保持一致的高度计算 */
}

.visual-center:fullscreen .main-image-container {
  min-height: 350px; /* 全屏下适中的主图片区域高度 */
}

.visual-center:fullscreen .thumbnail-container-bottom {
  height: 100px; /* 全屏下保持适中的缩略图区域高度 */
}

.visual-center:fullscreen .thumbnail-item {
  width: 110px; /* 全屏下保持适中的缩略图尺寸 */  
  height: 62px; /* 保持16:9比例 */
}

.main-image-container {
  flex: 1; /* 占据剩余空间 */
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  height: calc(100% - 160px); /* 减去信息条60px和缩略图区域100px */
  border-radius: 12px; /* 添加圆角效果 */
}

.main-warning-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  background: #000;
  transition: opacity 0.3s ease;
  aspect-ratio: 16/9; /* 16:9 比例 */
  border-radius: 12px; /* 添加圆角效果 */
}

.main-warning-image.loading {
  opacity: 0.5;
}

.warning-info-overlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 15px; /* 减少padding */
  min-width: 200px; /* 减少最小宽度 */
  max-width: 280px; /* 添加最大宽度限制 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.warning-info-panel {
  background: transparent;
  padding: 0;
  border-radius: 0;
  max-width: 100%;
  max-height: 100%;
  overflow: visible;
  text-align: left; /* 确保内容居左 */
}

.info-row {
  display: flex;
  align-items: flex-start; /* 改为顶部对齐 */
  margin-bottom: 6px; /* 减少行间距 */
  font-size: 13px; /* 稍微减小字体 */
  text-align: left;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #7EAEE5;
  font-weight: normal;
  white-space: nowrap;
  min-width: 70px; /* 减少标签最小宽度 */
  text-align: left;
}

.info-value {
  color: #FFFFFF;
  margin-left: 8px; /* 减少左边距 */
  flex: 1;
  text-align: left;
  word-break: break-word; /* 允许长文本换行 */
}

.info-value.level-urgent {
  color: #FF4D4F;
  font-weight: bold;
}

.info-value.level-high {
  color: #FF8746;
  font-weight: bold;
}

.info-value.level-medium {
  color: #44FF9B;
}

.info-value.level-low {
  color: #00FFFF;
}

.thumbnail-container-bottom {
  height: 100px; /* 增加缩略图区域高度 */
  background: rgba(6, 30, 93, 0.8); /* 改为与面板一致的蓝色背景 */
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 0 20px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0; /* 不允许收缩 */
  gap: 15px; /* 按钮和滑块之间的间距 */
}

.thumbnail-slider {
  display: flex;
  align-items: center;
  gap: 20px; /* 增大缩略图间距 */
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  flex: 1; /* 占据剩余空间 */
  padding: 15px 0; /* 增大上下padding */
  scroll-behavior: smooth; /* 平滑滚动 */
}

.slider-btn {
  width: 45px; /* 增大按钮尺寸 */
  height: 45px;
  background: rgba(0, 255, 255, 0.15);
  border: 2px solid rgba(0, 255, 255, 0.4);
  border-radius: 50%;
  color: #00FFFF;
  font-size: 18px; /* 增大图标尺寸 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  flex-shrink: 0; /* 按钮不收缩 */
}

.slider-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.25);
  border-color: rgba(0, 255, 255, 0.8);
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

.slider-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.thumbnail-slider::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.thumbnail-item {
  flex-shrink: 0;
  width: 110px; /* 增大缩略图尺寸 */
  height: 62px; /* 16:9 比例 */
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.3); /* 默认白色半透明边框 */
  transition: all 0.3s ease;
  position: relative;
  background: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.thumbnail-item:hover {
  border-color: rgba(0, 255, 255, 0.8);
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.thumbnail-item.active {
  border-color: #00FFFF; /* 蓝色高亮边框 */
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  transform: scale(1.08);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
  aspect-ratio: 16/9;
}

/* 顶部信息叠加层样式 */
.top-info-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  z-index: 10;
  pointer-events: none; /* 允许点击穿透到图片 */
}

.info-card {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  pointer-events: auto; /* 恢复卡片的点击事件 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.info-card:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(0, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.2);
}

.info-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.warning-icon {
  background: linear-gradient(135deg, #FF4D4F, #FF8746);
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 77, 79, 0.4);
}

.device-icon {
  background: linear-gradient(135deg, #00FFFF, #00C5FF);
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-title {
  font-size: 12px;
  color: #7EAEE5;
  opacity: 0.9;
  line-height: 1;
}

.info-number {
  font-size: 18px;
  font-weight: bold;
  color: #00FFFF;
  line-height: 1;
}

.info-unit {
  font-size: 12px;
  color: #7EAEE5;
  opacity: 0.8;
  margin-left: 2px;
}

.trend-chart,
.level-chart,
.status-chart {
  height: calc(100% - 20px);
  width: 100%;
  position: relative;
  flex: 1;
}

/* 全屏模式下图表高度调整 */
.visual-center:fullscreen .trend-chart,
.visual-center:fullscreen .level-chart,
.visual-center:fullscreen .status-chart {
  height: calc(100% - 15px); /* 全屏下稍微减少图表高度 */
}

/* 全屏模式下整体布局优化 */
.visual-center:fullscreen {
  padding: 15px; /* 减少全屏下的内边距 */
}

.visual-center:fullscreen .main-content {
  margin-bottom: 15px; /* 减少内容区域底部间距 */
}

.visual-center:fullscreen .panel-box {
  margin-bottom: 15px; /* 减少面板间距 */
}

.visual-center:fullscreen .top-bar {
  margin-bottom: 8px; /* 减少顶部栏底部间距 */
}

/* 表格透明样式 */
.transparent-row {
  background-color: transparent !important;
}

.warning-table >>> .el-table,
.device-table >>> .el-table {
  background-color: transparent;
  color: #7EAEE5;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.warning-table >>> .el-table::-webkit-scrollbar,
.device-table >>> .el-table::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 确保Element UI表格内部滚动条也隐藏 */
.warning-table >>> .el-table__body-wrapper::-webkit-scrollbar,
.device-table >>> .el-table__body-wrapper::-webkit-scrollbar {
  display: none;
}

.warning-table >>> .el-table__body-wrapper,
.device-table >>> .el-table__body-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.warning-table >>> .el-table tr,
.device-table >>> .el-table tr {
  background-color: transparent !important;
}

.warning-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td,
.device-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: rgba(0, 255, 255, 0.1) !important;
}

.warning-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td,
.device-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: rgba(6, 30, 93, 0.3) !important;
}
</style>


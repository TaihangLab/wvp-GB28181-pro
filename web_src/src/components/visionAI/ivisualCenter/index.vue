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

        <!-- 中间3D地图 -->
        <el-col :span="12">
          <div class="map-panel panel-box">
            <div class="center-stats">
              <div class="stat-box warning-stat">
                <div class="stat-icon alert-icon">
                  <i class="el-icon-warning"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-title">今日预警</div>
                  <div class="stat-value">{{ todayWarnings }}<span class="unit">个</span></div>
                </div>
              </div>
              <div class="stat-box device-stat">
                <div class="stat-icon video-icon">
                  <i class="el-icon-video-camera-solid"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-title">设备概览</div>
                  <div class="stat-value">{{ deviceCount }}/{{ totalDevices }}</div>
                </div>
              </div>
              <div class="stat-box warning-stat">
                <div class="stat-icon alert-blue-icon">
                  <i class="el-icon-bell"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-title">当前预警</div>
                  <div class="stat-value">{{ currentEvent }}</div>
                </div>
              </div>
              <div class="stat-box location-stat">
                <div class="stat-icon location-icon">
                  <i class="el-icon-position"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-title">设备位置</div>
                  <div class="stat-value">{{ currentDevice }}</div>
                </div>
              </div>
            </div>
            <div class="map-container" ref="mapContainer">
              <!-- 3D地图将在这里渲染 -->
              <div class="map-stats">
                <div class="map-stat-item">
                  <div class="stat-label">今日预警</div>
                  <div class="stat-value">{{ todayWarnings }}<span class="unit">个</span></div>
                </div>
                <div class="map-stat-item">
                  <div class="stat-label">设备概览</div>
                  <div class="stat-value">{{ deviceCount }}<span class="unit">/{{ totalDevices }}</span></div>
                </div>
              </div>
            </div>
            <div class="map-info">
              <div class="info-title">预警信息</div>
              <div class="info-item">
                <span>时间：</span>{{ currentDetailTime }}
              </div>
              <div class="info-item">
                <span>事件：</span>{{ currentEvent }}
              </div>
              <div class="info-item">
                <span>设备名称：</span>{{ currentDevice }}
              </div>
              <div class="info-tip">
                <i class="el-icon-info"></i>
                提示：鼠标拖动可旋转视角
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
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
      tableHeight: 240
    };
  },
  mounted() {
    // 初始化模拟数据
    this.initMockData();
    
    // 初始化CSS变量
    document.documentElement.style.setProperty('--panel-top-height', '210px');
    document.documentElement.style.setProperty('--panel-bottom-height', '330px');
    document.documentElement.style.setProperty('--map-panel-height', '504px');
    document.documentElement.style.setProperty('--map-container-height', '414px');
    
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
        location: '太行山工业园区',
        weather: '晴 26°C',
        airQuality: '空气质量: 良',
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
              name: '太行山工业园区'
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
          // 空气质量
          if (current.air_quality) {
            const aqi = current.air_quality['us-epa-index'];
            const aqiText = ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染'][aqi - 1] || '未知';
            this.locationInfo.airQuality = `空气质量: ${aqiText}`;
          }
        } else {
          throw new Error('Invalid weather data');
        }
      } catch (error) {
        console.error('获取天气数据失败:', error);
        this.locationInfo.location = '太行山工业园区';
        this.locationInfo.weather = '晴 26°C';
        this.locationInfo.airQuality = '空气质量: 良';
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
      // 更改为固定时间，与截图一致
      this.currentDetailTime = '2025-04-03 15:53:39';
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
      
      // 根据全屏状态调整表格和面板高度
      if (this.isFullscreen) {
        this.tableHeight = 420; // 全屏模式下显示更多行
        // 调整全屏下的CSS变量
        document.documentElement.style.setProperty('--panel-top-height', '320px');
        document.documentElement.style.setProperty('--panel-bottom-height', '420px');
        document.documentElement.style.setProperty('--map-panel-height', '660px');
        document.documentElement.style.setProperty('--map-container-height', '570px');
      } else {
        this.tableHeight = 240; // 非全屏模式下的标准高度
        // 恢复正常模式下的CSS变量
        document.documentElement.style.setProperty('--panel-top-height', '210px');
        document.documentElement.style.setProperty('--panel-bottom-height', '330px');
        document.documentElement.style.setProperty('--map-panel-height', '504px');
        document.documentElement.style.setProperty('--map-container-height', '414px');
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
      const mapContainer = this.$refs.mapContainer;
      if (!mapContainer) return;
      
      // 清空地图容器
      while (mapContainer.firstChild) {
        mapContainer.removeChild(mapContainer.firstChild);
      }
      
      // 创建Three.js场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x04143F);
      
      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        60, 
        mapContainer.clientWidth / mapContainer.clientHeight, 
        0.1, 
        1000
      );
      camera.position.set(0, 20, 30);
      camera.lookAt(0, 0, 0);
      
      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mapContainer.appendChild(renderer.domElement);
      
      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      // 添加定向光源
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 25, 15);
      directionalLight.castShadow = true;
      
      // 设置阴影范围
      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
      scene.add(directionalLight);
      
      // 添加点光源，增强视觉效果
      const pointLight = new THREE.PointLight(0x00FFFF, 1, 30);
      pointLight.position.set(0, 15, 0);
      scene.add(pointLight);
      
      // 添加控制器以支持鼠标拖动旋转和缩放
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 15;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI / 2;
      
      // 创建地面
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x061E5D,
        roughness: 0.8,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
      
      // 添加网格辅助线
      const gridHelper = new THREE.GridHelper(100, 50, 0x00FFFF, 0x235894);
      gridHelper.material.opacity = 0.2;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
      
      // 创建工厂基地
      const baseGeometry = new THREE.BoxGeometry(40, 0.5, 35);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x061E5D, 
        transparent: true,
        opacity: 0.8,
        roughness: 0.7,
        metalness: 0.3
      });
      const baseFloor = new THREE.Mesh(baseGeometry, baseMaterial);
      baseFloor.position.set(0, 0.25, 0);
      baseFloor.receiveShadow = true;
      scene.add(baseFloor);
      
      // 添加边框线
      const edges = new THREE.EdgesGeometry(baseGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00FFFF });
      const borderLines = new THREE.LineSegments(edges, lineMaterial);
      borderLines.position.copy(baseFloor.position);
      scene.add(borderLines);
      
      // 创建道路
      const roadGeometry = new THREE.PlaneGeometry(5, 30);
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.set(15, 0.3, 0);
      scene.add(road);
      
      // 添加路径线
      const roadLine1 = new THREE.BoxGeometry(0.2, 0.1, 28);
      const roadLineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const roadLineMarking = new THREE.Mesh(roadLine1, roadLineMaterial);
      roadLineMarking.position.set(15, 0.4, 0);
      scene.add(roadLineMarking);
      
      // 添加几个工厂建筑物
      this.addBuilding(scene, -12, 0, -12, 10, 6, 8, 0x00FFFF, '生产车间A'); // 生产车间A - 蓝色
      this.addBuilding(scene, 8, 0, -12, 8, 5, 10, 0x44FF9B, '装配车间');   // 装配车间 - 绿色
      this.addBuilding(scene, -12, 0, 8, 10, 4, 7, 0xFF8746, '机械加工区'); // 机械加工区 - 橙色
      this.addBuilding(scene, 8, 0, 10, 7, 7, 5, 0x207FFF, '仓库');        // 仓库 - 蓝色
      
      // 添加小型办公楼
      this.addBuilding(scene, -2, 0, -8, 5, 8, 6, 0x00C5FF, '办公楼');
      
      // 添加围墙
      this.addWalls(scene, 40, 35);
      
      // 添加预警点
      this.addWarningPoint(scene, -12, 0, -12, 0xFF4D4F); // 生产车间A的预警
      this.addWarningPoint(scene, 8, 0, -12, 0xFF8746);   // 装配车间的预警
      this.addWarningPoint(scene, 8, 0, 10, 0x44FF9B);    // 仓库的预警
      
      // 添加环形粒子效果
      this.addParticleRing(scene);
      
      // 渲染循环
      function animate() {
        requestAnimationFrame(animate);
        
        // 更新控制器
        controls.update();
        
        // 渲染场景
        renderer.render(scene, camera);
      }
      
      // 开始动画循环
      animate();
      
      // 处理窗口大小变化
      function handleResize() {
        if (!mapContainer) return;
        
        const width = mapContainer.clientWidth;
        const height = mapContainer.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
      }
      
      window.addEventListener('resize', handleResize);
      
      // 清理函数
      this.$once('hook:beforeDestroy', function() {
        window.removeEventListener('resize', handleResize);
        
        // 销毁Three.js资源
        renderer.dispose();
        
        // 移除渲染器元素
        if (mapContainer && renderer.domElement) {
          mapContainer.removeChild(renderer.domElement);
        }
      });
    },
    
    // 添加墙体
    addWalls(scene, width, depth) {
      const wallHeight = 2;
      const wallThickness = 0.5;
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x235894,
        transparent: true,
        opacity: 0.6,
        roughness: 0.7,
        metalness: 0.3
      });
      
      // 北墙
      const northWallGeometry = new THREE.BoxGeometry(width, wallHeight, wallThickness);
      const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
      northWall.position.set(0, wallHeight/2, -depth/2);
      scene.add(northWall);
      
      // 南墙
      const southWallGeometry = new THREE.BoxGeometry(width, wallHeight, wallThickness);
      const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
      southWall.position.set(0, wallHeight/2, depth/2);
      scene.add(southWall);
      
      // 西墙
      const westWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, depth);
      const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
      westWall.position.set(-width/2, wallHeight/2, 0);
      scene.add(westWall);
      
      // 东墙
      const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, depth - 8);
      const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
      eastWall.position.set(width/2, wallHeight/2, -4);
      scene.add(eastWall);
      
      // 门柱
      const pillarGeometry = new THREE.BoxGeometry(1, wallHeight*1.5, 1);
      const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.8
      });
      
      const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar1.position.set(width/2, wallHeight*0.75, depth/2 - 4);
      scene.add(pillar1);
      
      const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar2.position.set(width/2, wallHeight*0.75, depth/2);
      scene.add(pillar2);
      
      // 添加边框线
      const addEdges = (mesh, geometry) => {
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00FFFF });
        const borderLines = new THREE.LineSegments(edges, lineMaterial);
        borderLines.position.copy(mesh.position);
        borderLines.rotation.copy(mesh.rotation);
        scene.add(borderLines);
      };
      
      addEdges(northWall, northWallGeometry);
      addEdges(southWall, southWallGeometry);
      addEdges(westWall, westWallGeometry);
      addEdges(eastWall, eastWallGeometry);
      addEdges(pillar1, pillarGeometry);
      addEdges(pillar2, pillarGeometry);
    },
    
    // 添加环形粒子效果
    addParticleRing(scene) {
      const ringRadius = 19;
      const ringGeometry = new THREE.BufferGeometry();
      const particles = 150;
      
      const positions = [];
      const colors = [];
      
      for (let i = 0; i < particles; i++) {
        // 在圆环上均匀分布点
        const angle = (i / particles) * Math.PI * 2;
        const x = Math.cos(angle) * ringRadius;
        const z = Math.sin(angle) * ringRadius;
        const y = 0.2 + Math.random() * 0.3; // 略高于地面
        
        positions.push(x, y, z);
        
        // 颜色渐变
        const hue = (i / particles); // 0-1范围的色相
        const color = new THREE.Color().setHSL(hue, 1, 0.5);
        colors.push(color.r, color.g, color.b);
      }
      
      ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const ring = new THREE.Points(ringGeometry, particleMaterial);
      scene.add(ring);
      
      // 添加动画
      const animate = () => {
        requestAnimationFrame(animate);
        
        const positions = ring.geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < particles; i++) {
          const idx = i * 3;
          const angle = (i / particles) * Math.PI * 2 + time * 0.2;
          
          positions[idx] = Math.cos(angle) * ringRadius;
          positions[idx + 2] = Math.sin(angle) * ringRadius;
          positions[idx + 1] = 0.2 + Math.sin(time + i * 0.1) * 0.2;
        }
        
        ring.geometry.attributes.position.needsUpdate = true;
      };
      
      animate();
    },
    
    // 添加建筑物
    addBuilding(scene, x, y, z, width, height, depth, color, name) {
      // 建筑几何体
      const geometry = new THREE.BoxGeometry(width, height, depth);
      
      // 半透明材质
      const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        roughness: 0.5,
        metalness: 0.5
      });
      
      // 创建建筑物
      const building = new THREE.Mesh(geometry, material);
      building.position.set(x, y + height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      
      // 添加边框线
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: color });
      const borderLines = new THREE.LineSegments(edges, lineMaterial);
      borderLines.position.copy(building.position);
      
      // 添加屋顶细节
      if (name !== '办公楼') {
        const roofDetail = this.addRoof(x, y + height, z, width, depth, color);
        scene.add(roofDetail);
      } else {
        // 办公楼添加玻璃窗效果
        const windowsMaterial = new THREE.MeshStandardMaterial({
          color: 0x88CCFF,
          transparent: true,
          opacity: 0.7,
          roughness: 0.2,
          metalness: 0.8
        });
        
        const windowsGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.7, 0.1);
        const frontWindows = new THREE.Mesh(windowsGeometry, windowsMaterial);
        frontWindows.position.set(x, y + height * 0.6, z + depth/2 + 0.05);
        scene.add(frontWindows);
        
        const backWindows = new THREE.Mesh(windowsGeometry, windowsMaterial);
        backWindows.position.set(x, y + height * 0.6, z - depth/2 - 0.05);
        scene.add(backWindows);
        
        // 添加窗户线条
        const windowFrameGeometry = new THREE.EdgesGeometry(windowsGeometry);
        const windowFrameMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
        const frontWindowFrames = new THREE.LineSegments(windowFrameGeometry, windowFrameMaterial);
        frontWindowFrames.position.copy(frontWindows.position);
        scene.add(frontWindowFrames);
        
        const backWindowFrames = new THREE.LineSegments(windowFrameGeometry, windowFrameMaterial);
        backWindowFrames.position.copy(backWindows.position);
        scene.add(backWindowFrames);
      }
      
      // 添加到场景
      scene.add(building);
      scene.add(borderLines);
      
      return building;
    },
    
    // 添加屋顶
    addRoof(x, y, z, width, depth, color) {
      const roofGroup = new THREE.Group();
      
      // 屋顶几何体
      const roofHeight = 1.5;
      const roofGeometry = new THREE.CylinderGeometry(0.1, width/2, roofHeight, 4);
      roofGeometry.rotateY(Math.PI / 4);
      roofGeometry.scale(1, 1, depth/width);
      
      const roofMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        roughness: 0.6,
        metalness: 0.4
      });
      
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(x, y + roofHeight/2, z);
      roof.castShadow = true;
      
      // 添加屋顶边框
      const roofEdges = new THREE.EdgesGeometry(roofGeometry);
      const roofLineMaterial = new THREE.LineBasicMaterial({ color: color });
      const roofLines = new THREE.LineSegments(roofEdges, roofLineMaterial);
      roofLines.position.copy(roof.position);
      
      roofGroup.add(roof);
      roofGroup.add(roofLines);
      
      return roofGroup;
    },
    
    // 添加预警点
    addWarningPoint(scene, x, y, z, color) {
      // 创建预警点几何体
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8
      });
      
      // 创建点
      const point = new THREE.Mesh(geometry, material);
      point.position.set(x, y + 8, z);
      scene.add(point);
      
      // 创建脉冲效果的多个同心环
      const rings = [];
      for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.RingGeometry(0.7 + i * 0.3, 0.9 + i * 0.3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
          color: color, 
          transparent: true,
          opacity: 0.6 - i * 0.15,
          side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, y + 8, z);
        ring.rotation.x = Math.PI / 2;
        ring.userData = { offset: i * 0.3 }; // 用于错开动画
        scene.add(ring);
        rings.push({ mesh: ring, material: ringMaterial });
      }
      
      // 垂直线
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = [
        x, y + 0.5, z,
        x, y + 8, z
      ];
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      
      const dashLineMaterial = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 0.3,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.8
      });
      
      const line = new THREE.Line(lineGeometry, dashLineMaterial);
      line.computeLineDistances();
      scene.add(line);
      
      // 添加脉冲动画
      const pulseAnimate = () => {
        requestAnimationFrame(pulseAnimate);
        
        // 对每个环进行脉冲动画，错开时间
        rings.forEach((ring, index) => {
          const time = Date.now() * 0.005 + ring.mesh.userData.offset;
          
          // 脉冲动画
          ring.material.opacity = (0.6 - index * 0.15) * (0.5 + Math.sin(time) * 0.5);
          const scale = 1 + Math.sin(time * 0.8) * 0.3;
          ring.mesh.scale.set(scale, scale, 1);
        });
        
        // 预警点脉冲
        point.scale.setScalar(0.9 + Math.sin(Date.now() * 0.006) * 0.1);
        
        // 线条动画
        dashLineMaterial.dashOffset -= 0.01;
      };
      
      pulseAnimate();
      
      return point;
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
  }
}
</script>

<style scoped>
/* Vue2项目中使用普通CSS样式 */
:root {
  --panel-top-height: 210px;
  --panel-bottom-height: 330px;
  --map-panel-height: 504px;
  --map-container-height: 414px;
}

.visual-center {
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #000B18 100%);
  color: #fff;
  padding: 20px;
  position: relative;
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
  width: 280px;
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
  min-width: 300px;
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
  height: var(--map-panel-height);
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

.map-container canvas {
  width: 100% !important;
  height: 100% !important;
  outline: none;
  cursor: grab;
}

.map-container canvas:active {
  cursor: grabbing;
}

.map-stats {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(6, 30, 93, 0.8);
  padding: 15px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.map-stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
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

.center-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-box {
  display: flex;
  align-items: center;
  background: rgba(0, 30, 60, 0.5);
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(0, 30, 60, 0.7);
  border-color: rgba(0, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.alert-icon {
  color: #FF4D4F;
}

.video-icon {
  color: #00FFFF;
}

.alert-blue-icon {
  color: #44FF9B;
}

.location-icon {
  color: #00C5FF;
}

.stat-info .stat-title {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 4px;
}

.stat-info .stat-value {
  color: #00FFFF;
  font-size: 18px;
  font-weight: bold;
}

.warning-table,
.device-table {
  height: calc(100% - 40px);
  flex: 1;
  overflow: hidden;
}

/* 确保表格各部分都完全透明 */
.warning-table >>> .el-table,
.device-table >>> .el-table,
.warning-table >>> .el-table__header-wrapper,
.device-table >>> .el-table__header-wrapper,
.warning-table >>> .el-table__body-wrapper,
.device-table >>> .el-table__body-wrapper,
.warning-table >>> .el-table__footer-wrapper,
.device-table >>> .el-table__footer-wrapper {
  background-color: transparent !important;
}

.warning-table >>> .el-table::before,
.device-table >>> .el-table::before {
  display: none;
}

.warning-table >>> .el-table tr,
.device-table >>> .el-table tr {
  background-color: transparent !important;
}

.warning-table >>> .el-table td,
.warning-table >>> .el-table th,
.device-table >>> .el-table td,
.device-table >>> .el-table th {
  background-color: transparent;
  border-bottom: 1px solid rgba(35, 88, 148, 0.3);
}

.warning-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td,
.device-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: rgba(0, 255, 255, 0.1) !important;
}

.warning-table >>> .el-table__body-wrapper::-webkit-scrollbar,
.device-table >>> .el-table__body-wrapper::-webkit-scrollbar {
  width: 0;
  height: 0;
  opacity: 0;
  transition: opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
}

.warning-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar,
.device-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  opacity: 1;
}

.warning-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar-track,
.device-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar-track {
  background: rgba(35, 88, 148, 0.1);
  border-radius: 2px;
}

.warning-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar-thumb,
.device-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 2px;
}

.warning-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar-thumb:hover,
.device-table >>> .el-table__body-wrapper:hover::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* 隐藏Firefox滚动条 */
.warning-table >>> .el-table__body-wrapper,
.device-table >>> .el-table__body-wrapper {
  scrollbar-width: none;
}

/* 隐藏IE滚动条 */
.warning-table >>> .el-table__body-wrapper,
.device-table >>> .el-table__body-wrapper {
  -ms-overflow-style: none;
}

/* 添加脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.warning-point .pulse {
  animation: pulse 1.5s infinite;
}

/* 添加扫描线动画 */
@keyframes scanLine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

.grid-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.05) 50%, transparent 100%);
  animation: scanLine 4s linear infinite;
  z-index: 1;
  pointer-events: none;
}

.warning-point {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 5;
}

.building {
  position: absolute;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00FFFF;
  z-index: 2;
}

.info-tip i {
  color: #00FFFF;
  margin-right: 5px;
}

.warning-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td,
.device-table >>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: rgba(0, 255, 255, 0.1) !important;
}

.warning-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td,
.device-table >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: rgba(6, 30, 93, 0.3) !important;
}

/* 表格边框处理 */
.warning-table >>> .el-table,
.device-table >>> .el-table {
  border: none !important;
}

.warning-table >>> .el-table__fixed-right::before,
.warning-table >>> .el-table__fixed::before,
.device-table >>> .el-table__fixed-right::before,
.device-table >>> .el-table__fixed::before {
  display: none !important;
}

.type-list,
.top-list {
  height: calc(100% - 20px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 自定义滚动条 */
.type-list::-webkit-scrollbar,
.top-list::-webkit-scrollbar {
  width: 4px;
}

.type-list::-webkit-scrollbar-track,
.top-list::-webkit-scrollbar-track {
  background: rgba(35, 88, 148, 0.1);
  border-radius: 2px;
}

.type-list::-webkit-scrollbar-thumb,
.top-list::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 2px;
}

.type-list::-webkit-scrollbar-thumb:hover,
.top-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.trend-chart,
.level-chart,
.status-chart {
  height: calc(100% - 20px);
  width: 100%;
  position: relative;
  flex: 1;
}

/* 确保地图面板中的预警信息标题也靠左对齐 */
.map-info .info-title {
  color: #00ffff;
  font-size: 16px;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #00ffff;
  text-align: left;
}

.map-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(6, 30, 93, 0.8);
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  z-index: 10;
  width: 220px;
}

.info-title {
  color: #00ffff;
  font-size: 16px;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #00ffff;
  text-align: left;
}

.info-item {
  color: #fff;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: left;
}

.info-item span {
  color: #7eaee5;
  font-weight: normal;
  width: 70px;
  display: inline-block;
}

.info-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #7eaee5;
  display: flex;
  align-items: center;
}

.info-tip i {
  color: #00FFFF;
  margin-right: 5px;
  font-size: 14px;
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
  width: 40px;
  height: 40px;
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

/* 表格透明样式 */
.transparent-row {
  background-color: transparent !important;
}

.warning-table >>> .el-table,
.device-table >>> .el-table {
  background-color: transparent;
  color: #7EAEE5;
  scrollbar-width: none; /* Firefox */
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
</style>

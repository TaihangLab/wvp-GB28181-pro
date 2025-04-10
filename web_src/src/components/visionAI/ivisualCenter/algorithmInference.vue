<template>
  <div class="algorithm-inference-platform">
    <!-- 顶部标题 -->
    <div class="main-title">太行AI算法推理平台</div>
    <div class="current-time">{{ currentTime }}</div>
    <div class="fullscreen-btn" @click="toggleFullScreen">
      <i class="el-icon-full-screen"></i>
      退出全屏
    </div>

    <div class="dashboard-container">
      <!-- 资源统计模块 -->
      <div class="dashboard-card resource-statistics">
        <div class="card-header">
          <div class="title">资源统计</div>
        </div>
        <div class="card-content">
          <div class="server-info">
            <div class="server-type">
              <i class="el-icon-s-platform server-icon"></i>
              <span>Marster: 1个</span>
            </div>
            <div class="server-type">
              <i class="el-icon-s-grid server-icon"></i>
              <span>Node: 10个</span>
            </div>
          </div>
          <div class="resource-charts">
            <div class="chart-item">
              <div class="chart-container">
                <div class="percentage-ring cpu"
                  :style="{ background: `conic-gradient(#3eaef9 ${cpuUsage * 3.6}deg, transparent 0deg)` }"></div>
                <div class="inner-circle">
                  <div class="liquid-container cpu">
                    <div class="liquid-wave"></div>
                  </div>
                </div>
                <div class="percentage-text cpu">{{ cpuUsage }}<span class="percentage-symbol">%</span></div>
              </div>
              <div class="chart-title">CPU</div>
            </div>
            <div class="chart-item">
              <div class="chart-container">
                <div class="percentage-ring disk"
                  :style="{ background: `conic-gradient(#ff9c38 ${memoryUsage * 3.6}deg, transparent 0deg)` }"></div>
                <div class="inner-circle">
                  <div class="liquid-container disk">
                    <div class="liquid-wave"></div>
                  </div>
                </div>
                <div class="percentage-text disk">{{ memoryUsage }}<span class="percentage-symbol">%</span></div>
              </div>
              <div class="chart-title">磁盘</div>
            </div>
            <div class="chart-item">
              <div class="chart-container">
                <div class="percentage-ring memory"
                  :style="{ background: `conic-gradient(#29de9c ${diskUsage * 3.6}deg, transparent 0deg)` }"></div>
                <div class="inner-circle">
                  <div class="liquid-container memory">
                    <div class="liquid-wave"></div>
                  </div>
                </div>
                <div class="percentage-text memory">{{ diskUsage }}<span class="percentage-symbol">%</span></div>
              </div>
              <div class="chart-title">内存</div>
            </div>
            <div class="chart-item">
              <div class="chart-container">
                <div class="percentage-ring gpu"
                  :style="{ background: `conic-gradient(#ff5a5a ${networkUsage * 3.6}deg, transparent 0deg)` }"></div>
                <div class="inner-circle">
                  <div class="liquid-container gpu">
                    <div class="liquid-wave"></div>
                  </div>
                </div>
                <div class="percentage-text gpu">{{ networkUsage }}<span class="percentage-symbol">%</span></div>
              </div>
              <div class="chart-title">显存</div>
            </div>
          </div>
          <div class="more-btn" @click="toggleResourcePanel">
            <span>{{ isResourceExpanded ? '收起' : '展开' }}</span>
            <i :class="isResourceExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </div>
        </div>
        <div class="expanded-content" v-if="isResourceExpanded">
          <div class="expanded-header">
            <div class="resource-detail-title">资源详情</div>
            <div class="resource-time">更新时间: {{ currentTime }}</div>
          </div>
          <div class="resource-details">
            <div class="detail-group">
              <div class="detail-item">
                <div class="detail-label">CPU平均温度</div>
                <div class="detail-value">46.5°C</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">CPU峰值温度</div>
                <div class="detail-value">68.2°C</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">CPU核心数</div>
                <div class="detail-value">32</div>
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-item">
                <div class="detail-label">内存总量</div>
                <div class="detail-value">64GB</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">已用内存</div>
                <div class="detail-value">29.2GB</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">内存频率</div>
                <div class="detail-value">3200MHz</div>
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-item">
                <div class="detail-label">存储总量</div>
                <div class="detail-value">2TB</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">已用存储</div>
                <div class="detail-value">1.2TB</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">存储类型</div>
                <div class="detail-value">NVMe SSD</div>
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-item">
                <div class="detail-label">GPU型号</div>
                <div class="detail-value">RTX 3090</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">显存总量</div>
                <div class="detail-value">24GB</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">温度</div>
                <div class="detail-value">72.5°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间部分 - 数据展示 -->
      <div class="center-container">
        <!-- 上部数据展示和立方体模型 -->
        <div class="central-visualization">
          <!-- Three.js 3D场景容器占据整个区域 -->
          <div id="threejs-cube" class="threejs-container"></div>

          <!-- 底层平台结构（作为背景） -->
          <div class="platform-structure-bg"></div>
        </div>
      </div>

      <!-- 我的算法模块 -->
      <div class="dashboard-card my-algorithms">
        <div class="card-header">
          <div class="title">我的算法</div>
        </div>
        <div class="card-content">
          <div id="algorithm-sphere-container" class="algorithm-bubbles">
            <!-- Three.js 会渲染到这个容器 -->
          </div>
        </div>
      </div>

      <!-- 实时事件模块 -->
      <div class="dashboard-card realtime-events">
        <div class="card-header">
          <div class="title">实时事件</div>
        </div>
        <div class="card-content">
          <div class="event-layout">
            <!-- 上方视频区域 - 合并为一个大框 -->
            <div class="main-video-area"></div>
            <!-- 右侧缩略图列表 -->
            <div class="thumbnail-list">
              <div class="thumbnail-item"></div>
              <div class="thumbnail-item"></div>
              <div class="thumbnail-item"></div>
            </div>
            <!-- 下方事件信息 -->
            <div class="event-info-area">
              <div class="event-info-row">
                <span class="info-label">时间</span>
                <span class="info-value">2022-12-12 15:28:46</span>
              </div>
              <div class="event-info-row">
                <span class="info-label">地点</span>
                <span class="info-value">机场马路</span>
              </div>
              <div class="event-info-row">
                <span class="info-label">事件</span>
                <span class="info-value">机动车超时停车</span>
                <span class="alarm-tag">报警</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 报警统计模块 -->
      <div class="dashboard-card alarm-statistics">
        <div class="card-header">
          <div class="title">报警统计</div>
        </div>
        <div class="card-content">
          <!-- 饼图容器 -->
          <div class="pie-chart-container" ref="alarmPieContainer">
            <svg class="alarm-pie-chart" viewBox="-100 -100 200 200" ref="alarmPieChartSvg">
              <!-- 饼图扇区将通过JS动态添加 -->
            </svg>
            <div class="chart-legend" ref="alarmPieLegend">
              <!-- 图例项将通过JS动态添加 -->
            </div>
          </div>
          <!-- 时间选择器 -->
          <div class="time-selector">
              <span class="date-btn active">今日</span>
              <span class="date-btn">近7天</span>
              <span class="date-btn">本月</span>
          </div>
        </div>
      </div>

      <!-- 设备统计模块 -->
      <div class="dashboard-card device-statistics">
        <div class="card-header">
          <div class="title">设备统计</div>
        </div>
        <div class="card-content">
          <!-- 设备接入总数 -->
          <div class="device-total">
            <div class="total-label">设备接入总数</div>
            <div class="digital-counter">
              <span class="digit">2</span>
              <span class="digit">8</span>
              <span class="digit">6</span>
              <span class="digit">5</span>
              <span class="digit">8</span>
              <span class="digit">9</span>

            </div>
          </div>
          <!-- 设备类型统计 -->
          <div class="device-types">
            <div class="type-item">
              <div class="type-circle">
                <div class="ripple-container">
                  <div class="ripple"></div>
                  <div class="ripple"></div>
                  <div class="ripple"></div>
                </div>
                <div class="circle-content">
                  <span class="number">562</span>

                </div>
              </div>
              <div class="type-name">视频流</div>
            </div>
            <div class="type-item">
              <div class="type-circle">
                <div class="ripple-container">
                  <div class="ripple"></div>
                  <div class="ripple"></div>
                  <div class="ripple"></div>
                </div>
                <div class="circle-content">
                  <span class="number">23108</span>

                </div>
              </div>
              <div class="type-name">抓图服务</div>
            </div>
            <div class="type-item">
              <div class="type-circle">
                <div class="ripple-container">
                  <div class="ripple"></div>
                  <div class="ripple"></div>
                  <div class="ripple"></div>
                </div>
                <div class="circle-content">
                  <span class="number">2389</span>

                </div>
              </div>
              <div class="type-name">NVR调用</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 报警信息模块 -->
      <div class="dashboard-card alarm-info">
        <div class="card-header">
          <div class="title">报警信息</div>
        </div>
        <div class="card-content">
          <!-- 日期筛选 -->
          <div class="date-filter">
            <div class="date-filter-left">
              <span class="date-btn">今日</span>
              <span class="date-btn">近7天</span>
              <span class="date-btn active">本月</span>
              <span class="date-range">2021/05/01 - 2021/05/31</span>
            </div>
            <!-- 图表切换，移到右边 -->
            <div class="date-filter-right">
              <div class="chart-tabs">
                <div class="tab active">
                  <i class="el-icon-data-line"></i>
                  报警趋势
                </div>
                <div class="tab">
                  <i class="el-icon-map-location"></i>
                  报警位置
                </div>
              </div>
            </div>
          </div>
          <!-- 趋势图表 -->
          <div class="trend-chart">
            <div class="chart-header">
              <div class="trend-total">
                <span class="label">报警数量</span>
                <span class="value">25000</span>
              </div>
              <div class="trend-time-selector">
                <span class="time-selector-label">时间范围:</span>
                <div class="selector-dropdown">
                  <span>近30天</span>
                  <i class="el-icon-arrow-down"></i>
                </div>
              </div>
            </div>
            <svg width="100%" height="150" viewBox="0 0 600 150" preserveAspectRatio="none">
              <!-- 横线 -->
              <g class="grid-lines">
                <line x1="0" y1="0" x2="600" y2="0" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
              </g>

              <!-- 数据曲线 -->
              <path
                d="M0,90 C20,70 40,80 60,60 C80,40 100,70 120,65 C140,60 160,50 180,55 C200,60 220,30 240,50 C260,70 280,80 300,75 C320,70 340,60 360,65 C380,70 400,80 420,60 C440,40 460,50 480,55 C500,60 520,80 540,70 C560,60 580,50 600,55"
                stroke="#0095ff" stroke-width="2" fill="none" />

              <!-- 区域填充 -->
              <path
                d="M0,90 C20,70 40,80 60,60 C80,40 100,70 120,65 C140,60 160,50 180,55 C200,60 220,30 240,50 C260,70 280,80 300,75 C320,70 340,60 360,65 C380,70 400,80 420,60 C440,40 460,50 480,55 C500,60 520,80 540,70 C560,60 580,50 600,55 L600,150 L0,150 Z"
                fill="url(#gradient)" />

              <!-- 渐变定义 -->
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#0095ff" stop-opacity="0.5" />
                  <stop offset="100%" stop-color="#0095ff" stop-opacity="0.05" />
                </linearGradient>
              </defs>

              <!-- 数据点标记 -->
              <g class="data-points">
                <circle cx="60" cy="60" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="120" cy="65" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="180" cy="55" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="240" cy="50" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="300" cy="75" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="360" cy="65" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="420" cy="60" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="480" cy="55" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
                <circle cx="540" cy="70" r="3" fill="#ffffff" stroke="#0095ff" stroke-width="1" />
              </g>

              <!-- 底部日期标签 -->
              <g class="x-labels" fill="#7888a8" font-size="10">
                <text x="0" y="165">01</text>
                <text x="20" y="165">02</text>
                <text x="40" y="165">03</text>
                <text x="60" y="165">04</text>
                <text x="80" y="165">05</text>
                <text x="100" y="165">06</text>
                <text x="120" y="165">07</text>
                <text x="140" y="165">08</text>
                <text x="160" y="165">09</text>
                <text x="180" y="165">10</text>
                <!-- 中间省略 -->
                <text x="400" y="165">23</text>
                <text x="420" y="165">24</text>
                <text x="440" y="165">25</text>
                <text x="460" y="165">26</text>
                <text x="480" y="165">27</text>
                <text x="500" y="165">28</text>
                <text x="520" y="165">29</text>
                <text x="540" y="165">30</text>
                <text x="560" y="165">31</text>
              </g>
            </svg>
          </div>

        </div>
      </div>

      <!-- 报警转发模块 -->
      <div class="dashboard-card alarm-forwarding">
        <div class="card-header">
          <div class="title">报警转发</div>
        </div>
        <div class="card-content">
          <!-- 柱状图 -->
          <div class="bar-chart">
            <svg width="100%" height="150" viewBox="0 0 350 150" preserveAspectRatio="none">
              <!-- 横线 -->
              <g class="grid-lines">
                <line x1="0" y1="0" x2="350" y2="0" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="30" x2="350" y2="30" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="60" x2="350" y2="60" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="90" x2="350" y2="90" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="120" x2="350" y2="120" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
                <line x1="0" y1="150" x2="350" y2="150" stroke="rgba(120, 140, 180, 0.2)" stroke-width="1" />
              </g>

              <!-- 柱状图 -->
              <g class="bars">
                <rect x="25" y="50" width="20" height="100" fill="url(#bar-gradient)" rx="2" />
                <rect x="75" y="70" width="20" height="80" fill="url(#bar-gradient)" rx="2" />
                <rect x="125" y="30" width="20" height="120" fill="url(#bar-gradient)" rx="2" />
                <rect x="175" y="80" width="20" height="70" fill="url(#bar-gradient)" rx="2" />
                <rect x="225" y="60" width="20" height="90" fill="url(#bar-gradient)" rx="2" />
                <rect x="275" y="100" width="20" height="50" fill="url(#bar-gradient)" rx="2" />
                <rect x="325" y="70" width="20" height="80" fill="url(#bar-gradient)" rx="2" />
              </g>

              <!-- 柱状图渐变 -->
              <defs>
                <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#1e90ff" stop-opacity="1" />
                  <stop offset="100%" stop-color="#1e90ff" stop-opacity="0.5" />
                </linearGradient>
              </defs>

              <!-- 数值标签 -->
              <g class="bar-values" fill="#ffffff" font-size="10" text-anchor="middle">
                <text x="35" y="45">24917</text>
                <text x="85" y="65">16585</text>
                <text x="135" y="25">25000</text>
                <text x="185" y="75">12532</text>
                <text x="235" y="55">15072</text>
                <text x="285" y="95">6023</text>
                <text x="335" y="65">14311</text>
              </g>

              <!-- 底部日期标签 -->
              <g class="x-labels" fill="#7888a8" font-size="10" text-anchor="middle">
                <text x="35" y="165">4日</text>
                <text x="85" y="165">5日</text>
                <text x="135" y="165">6日</text>
                <text x="185" y="165">7日</text>
                <text x="235" y="165">8日</text>
                <text x="285" y="165">9日</text>
                <text x="335" y="165">10日</text>
              </g>
            </svg>
          </div>
          <!-- 图表底部说明 -->
          <div class="chart-footer">
            <div class="chart-hint">
              <i class="el-icon-info"></i>
              <span>报警转发量表示每日处理的报警事件数量</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'AlgorithmInference',
  data() {
    return {
      currentTime: '',
      cpuUsage: 20.69,
      memoryUsage: 64.35,
      diskUsage: 45.60,
      networkUsage: 92.34,
      timerID: null,
      cubeRotateID: null,
      myAlgorithms: [
        { id: '9934', name: '打手识别', size: 1.5 },
        { id: '9926', name: '渣土车识别', size: 1.7 },
        { id: '9677', name: '人员闯入', size: 1.3 },
        { id: '9650', name: '消防通道堵塞', size: 1.4 },
        { id: '9768', name: '厨房夜间老鼠识别', size: 1.8 },
        { id: '9610', name: '火焰识别', size: 1.6 },
        { id: '9762', name: '街道垃圾识别', size: 1.4 },
        { id: '9758', name: '积水识别', size: 1.7 },
        { id: '9688', name: '其它检测', size: 1.5 },
        { id: '9684', name: '烟雾检测', size: 1.4 }
      ],
      alarmStatistics: {
        labels: ['9758-滨湖机场切面', '9614-机动车非法占用专用车道', '9728-非机动车闯红灯', '9930-机动车闯红灯检测'],
        values: [27.00, 14.85, 16.17, 16.08]
      },
      deviceStatistics: {
        total: 286589,
        videoStreams: 562,
        captureServices: 23108,
        wvpCalls: 2389
      },
      alarmData: {
        total: 2342325,
        algorithm: 90280,
        daily: [12000, 14000, 16000, 15000, 18000, 16000, 15000, 19000, 17000, 16000,
          14000, 15000, 17000, 16000, 18000, 16000, 18000, 17000, 15000, 17000,
          16000, 15000, 19000, 17000, 16000, 14000, 15000, 17000, 16000, 18000]
      },
      alarmForwarding: {
        days: ['4日', '5日', '6日', '7日', '8日', '9日', '10日'],
        values: [24917, 16585, 25000, 12532, 15072, 6023, 14311]
      },
      isResourceExpanded: false,
      // Three.js相关变量
      cubeScene: null,
      cubeCamera: null,
      cubeRenderer: null,
      cube: null,
      cubeBase: null,
      lightBeams: null,
      cubeParticles: null,
      cubeAnimationId: null,
      controls: null,
      labelGroup: null,
      particles: null,
      dataColumn: null,
      scanningLight: null,
      circuitGroup: null,
      spiralGroup: null,
      branchGroup: null,
      nodeGroup: null,
      spreadParticles: null,
      scanningRing: null,
      energyField: null,
      energyBeam: null,
      hexaStar: null,
      topRingGroup: null,
      bottomRingGroup: null,
      labelElements: null,
      modelContainer: null,
      currentDragIndex: null,
      initialX: null,
      initialY: null,
      initialPosX: null,
      initialPosY: null,
      algoScene: null,
      algoCamera: null,
      algoRenderer: null,
      algoSphereGroup: null,
      algoAnimationId: null,
      algoControls: null,
      alarmPieData: [
        { label: '滨湖机场切面', value: 27.00, color: '#3eaef9' }, // 修改了label以更简洁
        { label: '机动车非法占用', value: 14.85, color: '#ff9c38' }, // 修改了label以更简洁
        { label: '非机动车闯红灯', value: 16.17, color: '#29de9c' },
        { label: '机动车闯红灯', value: 16.08, color: '#ff5a5a' }, // 修改了label以更简洁
        { label: '其他报警', value: 25.9, color: '#a9a9a9' }     // 添加了"其他"类别使总和接近100%
      ],
    }
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
    this.$nextTick(() => {
      this.initCubeScene();
      this.initAlgorithmSphere(); // 添加初始化算法球体
      this.initResourceChart();
      this.initAlarmPieChart(); // <--- 添加调用

      // 添加窗口大小变化监听
      window.addEventListener('resize', this.handleResize);
    });
  },
  beforeDestroy() {
    clearInterval(this.timer);
    // 清除动画循环
    if (this.cubeAnimationId) {
      cancelAnimationFrame(this.cubeAnimationId);
    }
    if (this.algoAnimationId) {
      cancelAnimationFrame(this.algoAnimationId);
    }

    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('resize', this.handleAlgoResize);

    // 清除资源图表
    if (this.resourceChart) {
      this.resourceChart.dispose();
    }

    // 清除Three.js资源
    if (this.algoRenderer) {
      this.algoRenderer.dispose();
    }
  },
  methods: {
    updateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    initCubeScene() {
      // 获取容器
      const container = document.getElementById('threejs-cube');
      if (!container) return;

      // 创建场景
      this.cubeScene = new THREE.Scene();
      this.cubeScene.background = new THREE.Color(0x000611); // 更深的黑蓝色背景

      // 创建一个总容器，用于整体移动模型
      this.modelContainer = new THREE.Group();
      this.cubeScene.add(this.modelContainer);
      this.modelContainer.position.y = 1; // 整体向下移动2个单位

      // 创建相机 - 调整位置更好地观察场景
      this.cubeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      this.cubeCamera.position.set(0, 5, 35); // 更正面的视角
      this.cubeCamera.lookAt(0, 8, 0); // 向上看一点，聚焦在中心点

      // 创建渲染器
      this.cubeRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true  // 提高深度缓冲精度
      });
      this.cubeRenderer.setSize(container.clientWidth, container.clientHeight);
      this.cubeRenderer.setPixelRatio(window.devicePixelRatio);
      this.cubeRenderer.shadowMap.enabled = true;
      container.appendChild(this.cubeRenderer.domElement);

      // 增强环境光
      const ambientLight = new THREE.AmbientLight(0x0a1a2a, 0.4);
      this.cubeScene.add(ambientLight);

      // 添加多个方向光以增强效果
      const directionalLight = new THREE.DirectionalLight(0x4e79ff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      this.cubeScene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0x4e79ff, 0.5);
      directionalLight2.position.set(-5, 8, -5);
      this.cubeScene.add(directionalLight2);

      // 添加更亮的点光源在中心
      const pointLight = new THREE.PointLight(0x3a9eff, 2.5, 50);
      pointLight.position.set(0, 5, 0);
      this.cubeScene.add(pointLight);

      // 添加第二个点光源
      const pointLight2 = new THREE.PointLight(0x66ffff, 1.5, 30);
      pointLight2.position.set(0, 15, 0);
      this.cubeScene.add(pointLight2);

      // 添加相机控制
      const controls = new OrbitControls(this.cubeCamera, this.cubeRenderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true; // 允许缩放
      controls.minDistance = 20; // 设置最小距离
      controls.maxDistance = 50; // 设置最大距离
      controls.enablePan = true; // 允许平移
      controls.rotateSpeed = 0.2;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.2; // 降低旋转速度使其更加平滑
      controls.target.set(0, 8, 0); // 设置旋转中心点更高

      // 设置更合适的相机限制
      controls.minPolarAngle = Math.PI * 0.15; // 限制俯仰角最小值
      controls.maxPolarAngle = Math.PI * 0.45; // 限制俯仰角最大值

      // 设置初始视角旋转角度
      this.cubeCamera.position.x = Math.cos(-Math.PI / 6) * this.cubeCamera.position.z;
      this.cubeCamera.position.z = Math.sin(-Math.PI / 6) * this.cubeCamera.position.z * 1.2;

      this.controls = controls;

      // 创建数据柱和标签
      this.createDataColumn();
      this.createDataLabels();
      this.createBaseCircle();
      this.createBackgroundCircuitEffects(); // 添加背景电路效果

      // 开始动画循环
      this.animateCube();
    },

    // 创建底部圆环
    createBaseCircle() {
      // 创建底部主圆环
      const ringGeometry = new THREE.RingGeometry(12, 14, 64);
      const ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          color1: { value: new THREE.Color(0x0055ff) },
          color2: { value: new THREE.Color(0x00d9ff) }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          varying vec2 vUv;
          
          void main() {
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float normalizedAngle = (angle + 3.14159) / (2.0 * 3.14159);
            float wave = sin(normalizedAngle * 20.0 + time * 2.0) * 0.5 + 0.5;
            
            // 创建渐变和脉冲效果
            vec3 finalColor = mix(color1, color2, wave);
            
            // 外圈透明度渐变
            float edgeGlow = 0.8 + sin(time * 3.0) * 0.2;
            
            gl_FragColor = vec4(finalColor, 0.7 * edgeGlow);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.5;
      this.modelContainer.add(ring);

      // 存储引用以便动画更新
      this.baseRing = ring;

      // 创建内环 - 更光滑的过渡
      const innerRingGeometry = new THREE.RingGeometry(9, 9.5, 64);
      const innerRingMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          color1: { value: new THREE.Color(0x0066ff) },
          color2: { value: new THREE.Color(0x00a5ff) }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          varying vec2 vUv;
          
          void main() {
            // 旋转发光效果
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float dist = length(vec2(vUv.x - 0.5, vUv.y - 0.5));
            float pulse = 0.5 + sin(time * 2.0) * 0.5;
            float innerGlow = smoothstep(0.4, 0.5, dist) * pulse;
            
            // 环形扫描线
            float scan = mod(angle + time, 3.14159 * 2.0) / (3.14159 * 2.0);
            float scanLine = smoothstep(0.0, 0.02, scan) * smoothstep(0.04, 0.02, scan);
            
            vec3 finalColor = mix(color1, color2, innerGlow + scanLine);
            
            gl_FragColor = vec4(finalColor, 0.8 + scanLine * 0.2);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
      innerRing.rotation.x = Math.PI / 2;
      innerRing.position.y = -0.4;
      this.modelContainer.add(innerRing);

      // 存储引用以便动画更新
      this.baseInnerRing = innerRing;

      // 添加中心圆形平台 - 高科技底盘
      const platformGeometry = new THREE.CircleGeometry(9, 64);
      const platformMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          baseColor: { value: new THREE.Color(0x002040) },
          glowColor: { value: new THREE.Color(0x0088ff) }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 baseColor;
          uniform vec3 glowColor;
          varying vec2 vUv;
          
          float hexPattern(vec2 p, float scale) {
            p *= scale;
            vec2 grid = floor(p);
            vec2 f = fract(p);
            
            // 创建六边形网格
            float d = 2.0;
            for (int y = -1; y <= 1; y++) {
              for (int x = -1; x <= 1; x++) {
                vec2 offset = vec2(float(x), float(y));
                vec2 center = grid + offset + vec2(0.5);
                vec2 diff = p - center;
                float dist = max(abs(diff.x) + abs(diff.y) * 0.866, abs(diff.y / 0.866));
                d = min(d, dist);
              }
            }
            
            return smoothstep(0.2, 0.3, d) * 0.8;
          }
          
          void main() {
            vec2 centeredUV = vUv - 0.5;
            float dist = length(centeredUV);
            
            // 基础颜色
            vec3 color = baseColor;
            
            // 创建电路板图案
            float circuit1 = hexPattern(centeredUV * 10.0 + vec2(time * 0.2), 1.0);
            float circuit2 = hexPattern(centeredUV * 15.0 - vec2(time * 0.1), 1.0);
            
            // 添加扫描线效果
            float scanLine = smoothstep(0.48, 0.5, mod(dist * 10.0 - time * 0.5, 1.0)) * 0.5;
            
            // 边缘光晕
            float edge = smoothstep(0.9, 0.4, dist);
            float edgePulse = (0.7 + sin(time) * 0.3) * edge;
            
            // 内部脉冲
            float innerPulse = sin(dist * 10.0 - time * 2.0) * 0.1 + 0.1;
            
            // 将所有效果结合
            vec3 finalColor = mix(color, glowColor, circuit1 + circuit2 + scanLine + innerPulse);
            
            gl_FragColor = vec4(finalColor, 0.2 + edge * 0.1 + circuit1 * 0.3 + scanLine * 0.4);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.rotation.x = -Math.PI / 2;
      platform.position.y = -0.48;
      this.modelContainer.add(platform);

      // 存储引用以便动画更新
      this.basePlatform = platform;

      // 添加底座发光效果
      const glowGeometry = new THREE.CircleGeometry(14.5, 64);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          glowColor: { value: new THREE.Color(0x0088ff) }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 glowColor;
          varying vec2 vUv;
          
          void main() {
            vec2 centeredUV = vUv - 0.5;
            float dist = length(centeredUV);
            
            // 创建辐射状外发光
            float radialGlow = smoothstep(0.5, 0.2, dist) * 0.2;
            float pulseFactor = 0.5 + sin(time * 1.5) * 0.5;
            
            gl_FragColor = vec4(glowColor, radialGlow * pulseFactor);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.rotation.x = Math.PI / 2;
      glow.position.y = -0.55;
      this.modelContainer.add(glow);

      // 存储引用以便动画更新
      this.baseGlow = glow;
    },

    // 创建能量场效果
    createEnergyField(parent) {
      // 创建粒子系统模拟能量场
      const particleCount = 800;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      // 创建柱状分布的粒子 - 调整位置使其更靠近圆盘
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // 调整高度范围，使底部粒子更靠近圆盘
        const height = Math.random() * 16;
        const radius = 1.5 + Math.random() * 1.5; // 保持半径

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // 颜色渐变效果 - 从底到顶
        const heightFactor = height / 16;
        colors[i * 3] = 0.2 + heightFactor * 0.3; // R
        colors[i * 3 + 1] = 0.7 + heightFactor * 0.3; // G
        colors[i * 3 + 2] = 0.9; // B

        // 粒子大小变化
        sizes[i] = 0.1 + Math.random() * 0.2;
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // 使用着色器材质
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            
            // 添加随时间变化的微小运动
            vec3 pos = position;
            float moveAmount = sin(time * 2.0 + position.y * 2.0) * 0.1;
            pos.x += sin(time + position.y) * moveAmount;
            pos.z += cos(time + position.y) * moveAmount;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (40.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            // 创建圆形粒子
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (r > 0.5) discard;
            
            // 添加光晕效果
            float intensity = 1.0 - r * 2.0;
            intensity = pow(intensity, 1.5);
            
            gl_FragColor = vec4(vColor, intensity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
      });

      const energyField = new THREE.Points(particles, particleMaterial);
      // 将整个能量场向下移动，使其紧贴圆盘
      energyField.position.y = 0;
      parent.add(energyField);
      this.energyField = energyField;

      // 添加内部光束效果，同样下移
      const beamGeometry = new THREE.CylinderGeometry(0.3, 0.3, 16, 16, 1, true);
      const beamMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vHeight;
          
          void main() {
            vUv = uv;
            vHeight = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          varying float vHeight;
          
          void main() {
            // 创建上下移动的光束效果
            float beam = mod(vHeight + time * 3.0, 16.0) / 16.0;
            beam = smoothstep(0.0, 0.2, beam) * smoothstep(1.0, 0.8, beam);
            
            // 边缘辉光效果
            float edge = smoothstep(0.4, 0.5, vUv.x) * smoothstep(0.6, 0.5, vUv.x);
            
            // 组合效果
            float intensity = edge * 0.3 + beam * 0.7;
            
            vec3 color = mix(vec3(0.2, 0.8, 1.0), vec3(0.4, 1.0, 1.0), beam);
            gl_FragColor = vec4(color, intensity * 0.4);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.y = 0.5; // 调整位置使光束从圆盘开始向上
      parent.add(beam);
      this.energyBeam = beam;
    },

    // 创建中央数据柱
    createDataColumn() {
      // 创建中央结构组
      const columnGroup = new THREE.Group();
      columnGroup.scale.set(1.2, 1.2, 1.2); // 整体放大模型尺寸
      this.columnGroup = columnGroup;
      this.modelContainer.add(columnGroup); // 改为添加到modelContainer

      // 创建六角星体
      this.createHexaStar(columnGroup);

      // 创建上下光环
      this.createLightRings(columnGroup);

      // 创建能量场效果
      this.createEnergyField(columnGroup);

      // 创建垂直线分支
      this.createVerticalBranches(columnGroup);

      // 创建电路节点和连接线
      this.createCircuitNodes(columnGroup);

      // 创建扩散粒子
      this.createSpreadParticles();

      // 添加底部和顶部平台
      this.createPlatforms();

      // 创建背景电路网络
      this.createBackgroundCircuitEffects();

      // 添加电路图案扫描效果
      this.createCircuitScanEffect();
    },


    // 创建六角星体
    createHexaStar(parent) {
      // 创建六角星组
      const starGroup = new THREE.Group();

      // 创建中心立方体
      const cubeGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 0x3a9eff,
        transparent: true,
        opacity: 0.7,
        emissive: 0x1a4a7a,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
      });

      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      starGroup.add(cube);

      // 创建六个三角形延伸
      const triangleShape = new THREE.Shape();
      triangleShape.moveTo(0, 0);
      triangleShape.lineTo(0.8, 0);
      triangleShape.lineTo(0.4, 1.2);
      triangleShape.lineTo(0, 0);

      const extrudeSettings = {
        steps: 1,
        depth: 0.3,
        bevelEnabled: false
      };

      const triangleGeometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);

      // 创建六个方向的三角形
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const triangleMaterial = new THREE.MeshPhongMaterial({
          color: 0x5badff,
          transparent: true,
          opacity: 0.8,
          emissive: 0x2a6a9a,
          emissiveIntensity: 0.5,
          side: THREE.DoubleSide
        });

        const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
        triangle.position.set(0.6, 0, 0);
        triangle.rotation.z = angle;
        starGroup.add(triangle);
      }

      // 创建上下两个方向的三角形
      const verticalTriangleGeometry = triangleGeometry.clone();

      const topTriangle = new THREE.Mesh(verticalTriangleGeometry, new THREE.MeshPhongMaterial({
        color: 0x5badff,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2a6a9a,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
      }));
      topTriangle.position.set(0, 0.6, 0);
      topTriangle.rotation.z = Math.PI / 2;
      topTriangle.rotation.x = Math.PI / 2;
      starGroup.add(topTriangle);

      const bottomTriangle = new THREE.Mesh(verticalTriangleGeometry, new THREE.MeshPhongMaterial({
        color: 0x5badff,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2a6a9a,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
      }));
      bottomTriangle.position.set(0, -0.6, 0);
      bottomTriangle.rotation.z = Math.PI / 2;
      bottomTriangle.rotation.x = -Math.PI / 2;
      starGroup.add(bottomTriangle);

      // 添加中心红色点
      const coreGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3a3a,
        transparent: true,
        opacity: 0.9
      });

      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      starGroup.add(core);

      // 将星形悬浮在空中
      starGroup.position.y = 8;

      // 添加旋转动画
      this.hexaStar = starGroup;
      parent.add(starGroup);
    },

    // 创建上下光环效果
    createLightRings(parent) {
      // 创建上下两个光环组
      const topRingGroup = new THREE.Group();
      const bottomRingGroup = new THREE.Group();

      // 创建光环 - 使用两个不同的光环，可以互相缠绕，顶部环尺寸缩小
      const topRingGeometry1 = new THREE.RingGeometry(4, 4.5, 64);
      const topRingGeometry2 = new THREE.RingGeometry(4.5, 5, 64);

      // 底部环尺寸保持不变
      const bottomRingGeometry1 = new THREE.RingGeometry(6, 7, 64);
      const bottomRingGeometry2 = new THREE.RingGeometry(7, 8, 64);

      const ringMaterial1 = new THREE.MeshBasicMaterial({
        color: 0x3a9eff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });

      const ringMaterial2 = new THREE.MeshBasicMaterial({
        color: 0x66ccff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      // 第一个光环
      const topRing1 = new THREE.Mesh(topRingGeometry1, ringMaterial1);
      topRing1.rotation.x = Math.PI / 2;
      topRing1.rotation.y = Math.PI * 0.1;
      topRingGroup.add(topRing1);

      // 第二个光环
      const topRing2 = new THREE.Mesh(topRingGeometry2, ringMaterial2);
      topRing2.rotation.x = Math.PI / 2;
      topRing2.rotation.y = -Math.PI * 0.1;
      topRingGroup.add(topRing2);

      // 添加内环 - 顶部内环也要相应缩小
      const topInnerRingGeometry = new THREE.RingGeometry(3, 3.2, 64);
      const innerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x66ccff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });

      const topInnerRing = new THREE.Mesh(topInnerRingGeometry, innerRingMaterial);
      topInnerRing.rotation.x = Math.PI / 2;
      topRingGroup.add(topInnerRing);

      // 创建光晕效果 - 顶部光晕也要缩小
      const topGlowGeometry = new THREE.CircleGeometry(5, 64);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a9eff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });

      const topGlow = new THREE.Mesh(topGlowGeometry, glowMaterial);
      topGlow.rotation.x = Math.PI / 2;
      topRingGroup.add(topGlow);

      // 底部双环结构
      const bottomRing1 = new THREE.Mesh(bottomRingGeometry1, ringMaterial1);
      bottomRing1.rotation.x = Math.PI / 2;
      bottomRing1.rotation.y = Math.PI * 0.15;
      bottomRingGroup.add(bottomRing1);

      const bottomRing2 = new THREE.Mesh(bottomRingGeometry2, ringMaterial2);
      bottomRing2.rotation.x = Math.PI / 2;
      bottomRing2.rotation.y = -Math.PI * 0.15;
      bottomRingGroup.add(bottomRing2);

      // 添加内环 - 底部
      const bottomInnerRingGeometry = new THREE.RingGeometry(4, 4.5, 64);
      const bottomInnerRing = new THREE.Mesh(bottomInnerRingGeometry, innerRingMaterial);
      bottomInnerRing.rotation.x = Math.PI / 2;
      bottomRingGroup.add(bottomInnerRing);

      // 创建光晕效果 - 底部
      const bottomGlowGeometry = new THREE.CircleGeometry(8, 64);
      const bottomGlow = new THREE.Mesh(bottomGlowGeometry, glowMaterial);
      bottomGlow.rotation.x = Math.PI / 2;
      bottomRingGroup.add(bottomGlow);

      // 设置光环位置
      topRingGroup.position.y = 14;
      bottomRingGroup.position.y = 2;

      // 添加到父组
      parent.add(topRingGroup);
      parent.add(bottomRingGroup);

      // 保存引用以便动画
      this.topRingGroup = topRingGroup;
      this.bottomRingGroup = bottomRingGroup;

      // 保存引用到单独的环，以便在动画中控制
      this.topRing1 = topRing1;
      this.topRing2 = topRing2;
      this.bottomRing1 = bottomRing1;
      this.bottomRing2 = bottomRing2;
    },

    // 更新扩散粒子效果
    createSpreadParticles() {
      // 增加粒子数量
      const particleCount = 800;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const speeds = new Float32Array(particleCount); // 添加速度属性

      for (let i = 0; i < particleCount; i++) {
        // 创建三种类型的粒子: 围绕六角星的, 围绕光环的, 自由漂浮的
        const particleType = Math.random();
        let angle, height, radius;

        if (particleType < 0.35) {
          // 围绕六角星的粒子
          angle = Math.random() * Math.PI * 2;
          height = 6 + Math.random() * 4; // 大部分在六角星附近
          radius = 1.5 + Math.random() * 2.5;
        } else if (particleType < 0.7) {
          // 围绕光环的粒子
          angle = Math.random() * Math.PI * 2;

          // 一半在上环，一半在下环
          if (Math.random() > 0.5) {
            height = 12 + Math.random() * 4; // 上光环
          } else {
            height = 1 + Math.random() * 3; // 下光环
          }

          radius = 5 + Math.random() * 3;
        } else {
          // 自由漂浮的粒子
          angle = Math.random() * Math.PI * 2;
          height = Math.random() * 16;

          // 距离中心的距离，大部分集中在周围，少量分散更远
          if (Math.random() > 0.8) {
            // 远距离粒子
            radius = 7.0 + Math.random() * 8.0;
          } else {
            // 近距离粒子
            radius = 2.0 + Math.random() * 6.0;
          }
        }

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // 设置颜色 - 根据类型和位置设置不同颜色
        if (particleType < 0.35) {
          // 靠近六角星的粒子 - 带有淡蓝色
          colors[i * 3] = 0.2 + Math.random() * 0.1;
          colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
          colors[i * 3 + 2] = 1.0;
        } else if (particleType < 0.7) {
          // 靠近光环的粒子 - 更蓝一些
          colors[i * 3] = 0.1 + Math.random() * 0.1;
          colors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
          colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
        } else {
          // 自由粒子 - 带有一点白色
          colors[i * 3] = 0.3 + Math.random() * 0.2;
          colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
          colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        }

        // 粒子大小 - 近处的稍大，远处的较小
        const distanceFromCenter = Math.sqrt(
          positions[i * 3] * positions[i * 3] +
          positions[i * 3 + 2] * positions[i * 3 + 2]
        );

        if (distanceFromCenter < 4) {
          sizes[i] = 0.12 + Math.random() * 0.16; // 近处粒子较大
        } else {
          sizes[i] = 0.08 + Math.random() * 0.12; // 远处粒子较小
        }

        // 设置粒子速度 - 越靠近中心的粒子速度越快
        speeds[i] = 0.2 + (10 - Math.min(10, distanceFromCenter)) / 10 * 0.8 + Math.random() * 0.2;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      particleGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1)); // 添加速度属性

      // 创建更高级的着色器材质
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          pointTexture: { value: this.createParticleTexture() }
        },
        vertexShader: `
          attribute float size;
          attribute float speed;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            
            // 粒子运动效果
            vec3 pos = position;
            
            // 上下浮动
            pos.y += sin(time * speed + position.x * 10.0) * 0.1;
            
            // 轻微水平运动
            float angle = time * speed * 0.2 + pos.y * 0.5;
            pos.x += sin(angle) * 0.05;
            pos.z += cos(angle) * 0.05;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // 动态大小 - 随时间略微变化
            float sizePulse = sin(time * 2.0 + pos.x * 10.0 + pos.y * 5.0) * 0.1 + 1.0;
            
            gl_PointSize = size * sizePulse * (300.0 / length(mvPosition.xyz));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          
          void main() {
            // 使用纹理创建更柔和的粒子
            vec4 texColor = texture2D(pointTexture, gl_PointCoord);
            
            // 颜色混合效果
            vec3 finalColor = vColor * texColor.rgb;
            
            // 应用透明度
            float alpha = texColor.a;
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.y = 0;
      this.modelContainer.add(particles);
      this.spreadParticles = particles;
    },

    // 创建粒子纹理
    createParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;

      const context = canvas.getContext('2d');

      // 创建渐变
      const gradient = context.createRadialGradient(
        32, 32, 0, 32, 32, 32
      );

      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(120, 180, 255, 0.8)');
      gradient.addColorStop(0.7, 'rgba(70, 120, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(40, 80, 255, 0)');

      // 绘制粒子
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);

      // 创建纹理
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      return texture;
    },

    // 扩大垂直分支线效果
    createVerticalBranches(parent) {
      const branchGroup = new THREE.Group();

      // 增加分支数量
      const branchCount = 12;
      for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2;
        const radius = 1.8 + Math.random() * 1.2; // 扩大半径
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // 创建线段 - 调整起点位置从圆盘开始
        const lineGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
          x, 0, z, // 底部贴着圆盘
          x, 14.5, z  // 顶部
        ]);

        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x3a9eff,
          transparent: true,
          opacity: 0.4
        });

        const line = new THREE.Line(lineGeometry, lineMaterial);
        branchGroup.add(line);

        // 增加节点数量
        const nodeCount = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < nodeCount; j++) {
          // 调整节点位置，从0开始
          const y = j * 5 + Math.random() * 2;
          if (y > 14.5) continue;

          const nodeGeometry = new THREE.SphereGeometry(0.08, 8, 8); // 更大的节点
          const nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0x66ffff,
            transparent: true,
            opacity: 0.9
          });

          const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
          node.position.set(x, y, z);
          branchGroup.add(node);

          // 添加水平连接线
          if (Math.random() > 0.5) {
            const hLineLength = 0.4 + Math.random() * 0.6; // 更长的连接线
            const hDirection = Math.random() > 0.5 ? 1 : -1;
            const hAngle = angle + Math.PI / 2 * hDirection;

            const hEndX = x + Math.cos(hAngle) * hLineLength;
            const hEndZ = z + Math.sin(hAngle) * hLineLength;

            const hLineGeometry = new THREE.BufferGeometry();
            const hPositions = new Float32Array([
              x, y, z,
              hEndX, y, hEndZ
            ]);

            hLineGeometry.setAttribute('position', new THREE.BufferAttribute(hPositions, 3));

            const hLineMaterial = new THREE.LineBasicMaterial({
              color: 0x3a9eff,
              transparent: true,
              opacity: 0.6
            });

            const hLine = new THREE.Line(hLineGeometry, hLineMaterial);
            branchGroup.add(hLine);

            // 末端节点
            const endNodeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const endNodeMaterial = new THREE.MeshBasicMaterial({
              color: 0x66ffff,
              transparent: true,
              opacity: 0.8
            });

            const endNode = new THREE.Mesh(endNodeGeometry, endNodeMaterial);
            endNode.position.set(hEndX, y, hEndZ);
            branchGroup.add(endNode);
          }
        }
      }

      // 增加水平环线，从0高度开始
      for (let i = 0; i < 6; i++) {
        const y = i * 2.5;
        const radius = 2.3 + Math.random() * 0.5; // 更大的环半径

        const ringGeometry = new THREE.BufferGeometry();
        const ringPoints = [];

        // 创建环形
        for (let j = 0; j <= 64; j++) {
          const angle = (j / 64) * Math.PI * 2;
          ringPoints.push(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
          );
        }

        ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringPoints, 3));

        const ringMaterial = new THREE.LineBasicMaterial({
          color: 0x3a9eff,
          transparent: true,
          opacity: 0.6
        });

        const ring = new THREE.Line(ringGeometry, ringMaterial);
        branchGroup.add(ring);
      }

      // 将整个分支组下移，使其从圆盘开始
      branchGroup.position.y = 0;
      parent.add(branchGroup);
      this.branchGroup = branchGroup;
    },

    // 增强电路节点效果
    createCircuitNodes(parent) {
      const nodeGroup = new THREE.Group();

      // 创建更多的节点
      const nodePositions = [];
      const nodeCount = 24; // 增加节点数量

      for (let i = 0; i < nodeCount; i++) {
        // 分层分布节点，从0高度开始
        const layerIndex = Math.floor(i / 6);
        const baseHeight = (layerIndex / 4) * 15;
        const height = baseHeight + Math.random() * 1;

        // 圆周分布，半径更大
        const angle = ((i % 6) / 6) * Math.PI * 2 + (layerIndex * Math.PI / 6);
        const radius = 2.5 + Math.random() * 1.2; // 更大的半径

        nodePositions.push({
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          ),
          size: 0.1 + Math.random() * 0.1, // 更大的节点尺寸
          layerIndex
        });
      }

      // 创建节点和连接线
      nodePositions.forEach((node, index) => {
        // 创建节点球体
        const nodeGeometry = new THREE.SphereGeometry(node.size, 8, 8);
        const nodeMaterial = new THREE.MeshBasicMaterial({
          color: 0x66ffff,
          transparent: true,
          opacity: 0.9
        });

        const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        nodeMesh.position.copy(node.position);
        nodeGroup.add(nodeMesh);

        // 连接到中心的概率提高
        if (index % 3 === 0 || Math.random() > 0.7) {
          const centerPoint = new THREE.Vector3(0, node.position.y, 0);
          const midPoint = new THREE.Vector3().lerpVectors(
            node.position, centerPoint, 0.3
          );
          midPoint.y += 0.5 + Math.random() * 0.5; // 中点向上弯曲更多

          // 创建到中心的曲线
          const curve = new THREE.QuadraticBezierCurve3(
            node.position,
            midPoint,
            centerPoint
          );

          const curveGeometry = new THREE.BufferGeometry().setFromPoints(
            curve.getPoints(20)
          );

          const curveMaterial = new THREE.LineBasicMaterial({
            color: 0x3a9eff,
            transparent: true,
            opacity: 0.6
          });

          const curveLine = new THREE.Line(curveGeometry, curveMaterial);
          nodeGroup.add(curveLine);
        }

        // 增加节点间连接的概率
        nodePositions.forEach((otherNode, otherIndex) => {
          if (otherIndex <= index) return;
          if (Math.abs(otherNode.layerIndex - node.layerIndex) > 1) return; // 只连接邻近层
          if (Math.random() > 0.5) return; // 50%概率连接

          const midPoint = new THREE.Vector3().lerpVectors(
            node.position, otherNode.position, 0.5
          );
          midPoint.y += 0.3 + Math.random() * 0.4; // 让中点向上弯曲

          // 创建节点间的曲线
          const curve = new THREE.QuadraticBezierCurve3(
            node.position,
            midPoint,
            otherNode.position
          );

          const curveGeometry = new THREE.BufferGeometry().setFromPoints(
            curve.getPoints(20)
          );

          const curveMaterial = new THREE.LineBasicMaterial({
            color: 0x3a9eff,
            transparent: true,
            opacity: 0.4
          });

          const curveLine = new THREE.Line(curveGeometry, curveMaterial);
          nodeGroup.add(curveLine);
        });
      });

      // 将整个节点组下移，使其从圆盘开始
      nodeGroup.position.y = 0;
      parent.add(nodeGroup);
      this.nodeGroup = nodeGroup;
    },

    // 更强大的分散粒子效果
    createSpreadParticles() {
      const particleCount = 500;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        // 创建分散分布在空间中的粒子
        const angle = Math.random() * Math.PI * 2;
        // 将高度调整为从圆盘开始，不要超过原有高度
        const height = Math.random() * 15;

        // 距离中心的距离，大部分集中在周围，少量分散更远
        let radius;
        if (Math.random() > 0.6) {
          // 远距离粒子
          radius = 2.0 + Math.random() * 6.0; // 扩大范围
        } else {
          // 近距离粒子
          radius = 1.0 + Math.random() * 2.0; // 扩大范围
        }

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // 设置颜色 - 靠近中心的较亮，远离的较暗
        const distanceFactor = Math.min(1.0, 3.0 / radius);
        colors[i * 3] = 0.2 * distanceFactor;
        colors[i * 3 + 1] = 0.7 * distanceFactor;
        colors[i * 3 + 2] = 1.0 * distanceFactor;

        // 设置粒子大小 - 变大
        sizes[i] = 0.08 + Math.random() * 0.12;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // 创建着色器材质
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          void main() {
            vColor = color;
            // 轻微的上下浮动动画
            vec3 pos = position;
            pos.y += sin(time + position.x * 10.0) * 0.08;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / length(mvPosition.xyz));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            // 创建圆形粒子
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (r > 0.5) discard;
            
            // 添加光晕效果
            float intensity = 1.0 - r * 2.0;
            intensity = pow(intensity, 1.5);
            
            gl_FragColor = vec4(vColor, intensity);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      // 将粒子系统下移，紧贴圆盘
      particles.position.y = 0;
      this.modelContainer.add(particles);
      this.spreadParticles = particles;
    },

    // 创建底部和顶部平台
    createPlatforms() {
      // 创建底部圆环
      const ringGeometry = new THREE.RingGeometry(12, 14, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a9eff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.5;
      this.modelContainer.add(ring);

      // 创建内环
      const innerRingGeometry = new THREE.RingGeometry(9, 9.5, 64);
      const innerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a9eff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });

      const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
      innerRing.rotation.x = Math.PI / 2;
      innerRing.position.y = -0.4;
      this.modelContainer.add(innerRing);

      // 添加中心圆形平台
      const platformGeometry = new THREE.CircleGeometry(9, 64);
      const platformMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a9eff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });

      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.rotation.x = -Math.PI / 2;
      platform.position.y = -0.48;
      this.modelContainer.add(platform);
    },

    // 创建电路扫描效果
    createCircuitScanEffect() {
      // 创建电路扫描光环
      const scanGeometry = new THREE.RingGeometry(0.3, 0.5, 32);
      const scanMaterial = new THREE.MeshBasicMaterial({
        color: 0x66ccff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });

      this.scanningRing = new THREE.Mesh(scanGeometry, scanMaterial);
      this.scanningRing.rotation.x = Math.PI / 2;
      this.scanningRing.position.y = 0;
      this.columnGroup.add(this.scanningRing);
    },

    // 创建数据标签
    createDataLabels() {
      // 创建标签位置和内容
      const labelData = [
        // 标签位置和内容 - 使用更合理的屏幕位置
        { id: '报警事件总数', value: '2342325', position: { left: '6%', top: '17%' } },
        { id: '算法总数', value: '90280', position: { right: '6%', top: '17%' } },
        { id: '视频类', value: '2901', position: { left: '4%', top: '39%' } },
        { id: '视频类设备', value: '5249', position: { right: '4%', top: '39%' } },
        { id: '图片类', value: '2901', position: { left: '5%', top: '61%' } },
        { id: '图片类设备', value: '5249', position: { right: '5%', top: '61%' } },
        { id: '运行中算法', value: '2901', position: { left: '7%', top: '83%' } },
        { id: '已停止算法', value: '2880', position: { right: '7%', top: '83%' } }
      ];

      // 固定位置的标签容器
      const labelContainer = document.createElement('div');
      labelContainer.className = 'data-labels-container';
      labelContainer.style.position = 'absolute';
      labelContainer.style.top = '0';
      labelContainer.style.left = '0';
      labelContainer.style.width = '100%';
      labelContainer.style.height = '100%';
      labelContainer.style.overflow = 'hidden';
      labelContainer.style.pointerEvents = 'none';
      document.getElementById('threejs-cube').appendChild(labelContainer);

      // 添加标签到HTML容器
      labelData.forEach((data, index) => {
        // 创建标签元素
        const labelElement = document.createElement('div');
        labelElement.className = 'fixed-data-label';
        labelElement.style.position = 'absolute';
        labelElement.style.padding = '5px 8px';
        labelElement.style.color = '#fff';
        labelElement.style.background = 'rgba(0, 20, 50, 0.65)';
        labelElement.style.border = '1px solid rgba(58, 158, 255, 0.6)';
        labelElement.style.borderRadius = '2px';
        labelElement.style.boxShadow = '0 0 6px rgba(58, 158, 255, 0.4)';
        labelElement.style.width = '140px';
        labelElement.style.fontSize = '10px';
        labelElement.style.transition = 'all 0.3s';
        labelElement.style.opacity = '0';
        labelElement.style.transform = 'scale(0.85)';
        labelElement.style.backdropFilter = 'blur(2px)';
        labelElement.style.WebkitBackdropFilter = 'blur(2px)';
        labelElement.style.pointerEvents = 'auto';

        // 设置固定位置
        Object.keys(data.position).forEach(key => {
          labelElement.style[key] = data.position[key];
        });

        // 根据标签不同类型调整样式
        if (index < 2) { // 顶部标签 - 报警事件总数和算法总数
          labelElement.style.minHeight = '44px';
        } else {
          labelElement.style.minHeight = '36px';
        }

        // 添加科技感标签内容
        labelElement.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
            <span style="font-size:9px; color:rgba(255,255,255,0.8); position:relative; padding-left:11px;">
              <span style="position:absolute; left:0; top:50%; transform:translateY(-50%); width:5px; height:5px; background:rgba(58,158,255,0.8); border-radius:1px;"></span>
              ${data.id}
            </span>
          </div>
          <div style="display:flex; justify-content:center; align-items:center;">
            <span style="color:#3a9eff; font-family:'Digital-7',monospace; font-size:16px; font-weight:bold; text-shadow:0 0 4px rgba(58,158,255,0.4); letter-spacing:1px;">${data.value}</span>
          </div>
          <div style="position:absolute; top:0; left:0; width:6px; height:6px; border-top:1px solid #3a9eff; border-left:1px solid #3a9eff;"></div>
          <div style="position:absolute; top:0; right:0; width:6px; height:6px; border-top:1px solid #3a9eff; border-right:1px solid #3a9eff;"></div>
          <div style="position:absolute; bottom:0; left:0; width:6px; height:6px; border-bottom:1px solid #3a9eff; border-left:1px solid #3a9eff;"></div>
          <div style="position:absolute; bottom:0; right:0; width:6px; height:6px; border-bottom:1px solid #3a9eff; border-right:1px solid #3a9eff;"></div>
          <div style="position:absolute; top:0; left:25%; right:25%; height:1px; background:linear-gradient(to right, rgba(58,158,255,0), rgba(58,158,255,0.3), rgba(58,158,255,0));"></div>
        `;

        // 添加连接线
        const lineElement = document.createElement('div');
        lineElement.className = 'connector-line';
        lineElement.style.position = 'absolute';
        lineElement.style.height = '1px';
        lineElement.style.width = '30px';
        lineElement.style.top = '50%';

        // 设置左右两侧线条样式
        if (index % 2 === 0) { // 左侧标签
          lineElement.style.right = '-30px';
          lineElement.style.background = 'linear-gradient(to right, rgba(58,158,255,0.8), rgba(58,158,255,0))';
        } else { // 右侧标签
          lineElement.style.left = '-30px';
          lineElement.style.background = 'linear-gradient(to left, rgba(58,158,255,0.8), rgba(58,158,255,0))';
        }

        // 添加脉冲点
        const pulseElement = document.createElement('div');
        pulseElement.className = 'pulse-dot';
        pulseElement.style.position = 'absolute';
        pulseElement.style.width = '4px';
        pulseElement.style.height = '4px';
        pulseElement.style.borderRadius = '50%';
        pulseElement.style.backgroundColor = '#3a9eff';
        pulseElement.style.top = '50%';
        pulseElement.style.transform = 'translateY(-50%)';
        pulseElement.style.boxShadow = '0 0 4px #3a9eff';
        pulseElement.style.animation = `pulse-${index} 2s infinite`;

        if (index % 2 === 0) { // 左侧标签
          pulseElement.style.right = '-2px';
        } else { // 右侧标签
          pulseElement.style.left = '-2px';
        }

        // 创建扫描线效果
        const scanElement = document.createElement('div');
        scanElement.className = 'scan-line';
        scanElement.style.position = 'absolute';
        scanElement.style.top = '0';
        scanElement.style.bottom = '0';
        scanElement.style.left = '0';
        scanElement.style.width = '100%';
        scanElement.style.background = 'linear-gradient(to bottom, rgba(58,158,255,0) 0%, rgba(58,158,255,0.1) 50%, rgba(58,158,255,0) 100%)';
        scanElement.style.animation = `scan-${index} 3s linear infinite`;
        scanElement.style.pointerEvents = 'none';
        scanElement.style.opacity = '0.6';

        // 创建动画样式
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @keyframes pulse-${index} {
            0% { box-shadow: 0 0 4px rgba(58, 158, 255, 0.7); }
            50% { box-shadow: 0 0 8px rgba(58, 158, 255, 1); }
            100% { box-shadow: 0 0 4px rgba(58, 158, 255, 0.7); }
          }
          
          @keyframes scan-${index} {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `;
        document.head.appendChild(styleElement);

        labelElement.appendChild(lineElement);
        labelElement.appendChild(pulseElement);
        labelElement.appendChild(scanElement);
        labelContainer.appendChild(labelElement);

        // 标签悬停效果
        labelElement.addEventListener('mouseenter', () => {
          labelElement.style.transform = 'scale(1)';
          labelElement.style.zIndex = '10';
          labelElement.style.background = 'rgba(0, 30, 70, 0.85)';
          labelElement.style.boxShadow = '0 0 12px rgba(58, 158, 255, 0.7)';
        });

        labelElement.addEventListener('mouseleave', () => {
          labelElement.style.transform = 'scale(0.85)';
          labelElement.style.zIndex = '1';
          labelElement.style.background = 'rgba(0, 20, 50, 0.65)';
          labelElement.style.boxShadow = '0 0 6px rgba(58, 158, 255, 0.4)';
        });
      });

      // 保存标签元素引用
      this.labelElements = Array.from(labelContainer.querySelectorAll('.fixed-data-label'));

      // 延迟显示标签，产生淡入效果
      setTimeout(() => {
        this.labelElements.forEach((el, index) => {
          setTimeout(() => {
            el.style.opacity = '1';
          }, index * 120); // 依次显示标签
        });
      }, 500);
    },

    // 创建单个标签实体
    createLabelEntity(id, value, sub, sub2) {
      // 创建Canvas用于绘制标签
      const canvas = document.createElement('canvas');

      // 所有标签使用相同大小
      canvas.width = 256;
      canvas.height = 128;

      const context = canvas.getContext('2d');

      // 绘制背景 - 透明度降低
      context.fillStyle = 'rgba(0, 10, 25, 0.4)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 添加边框和装饰元素
      context.strokeStyle = '#3a9eff';
      context.lineWidth = 1;
      context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      // 上边的小线条装饰
      const lineCount = 10;
      const lineWidth = (canvas.width - 40) / (lineCount * 2 - 1);
      for (let i = 0; i < lineCount; i++) {
        context.fillStyle = '#3a9eff';
        context.fillRect(20 + i * lineWidth * 2, 2, lineWidth, 2);
      }

      // 下边的小线条装饰
      for (let i = 0; i < lineCount; i++) {
        context.fillStyle = '#3a9eff';
        context.fillRect(20 + i * lineWidth * 2, canvas.height - 4, lineWidth, 2);
      }

      // 左上角装饰
      context.beginPath();
      context.moveTo(2, 15);
      context.lineTo(15, 2);
      context.stroke();

      // 右上角装饰
      context.beginPath();
      context.moveTo(canvas.width - 2, 15);
      context.lineTo(canvas.width - 15, 2);
      context.stroke();

      // 左下角装饰
      context.beginPath();
      context.moveTo(2, canvas.height - 15);
      context.lineTo(15, canvas.height - 2);
      context.stroke();

      // 右下角装饰
      context.beginPath();
      context.moveTo(canvas.width - 2, canvas.height - 15);
      context.lineTo(canvas.width - 15, canvas.height - 2);
      context.stroke();

      // 添加文本 - ID
      context.font = '16px "Microsoft YaHei", Arial, sans-serif';
      context.fillStyle = '#FFFFFF';
      context.textAlign = 'center';
      context.fillText(id, canvas.width / 2, 25);

      // 添加数值 - 大号字体
      context.fillStyle = '#3a9eff';
      context.font = 'bold 38px "Digital-7", Arial, sans-serif';
      context.fillText(value, canvas.width / 2, 70);

      // 添加左侧子项
      if (sub) {
        context.font = '14px "Microsoft YaHei", Arial, sans-serif';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'left';
        context.fillText(sub.name, 20, 100);

        context.fillStyle = '#3a9eff';
        context.fillText(sub.value, 20, 118);
      }

      // 添加右侧子项
      if (sub2) {
        context.font = '14px "Microsoft YaHei", Arial, sans-serif';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'right';
        context.fillText(sub2.name, canvas.width - 20, 100);

        context.fillStyle = '#3a9eff';
        context.fillText(sub2.value, canvas.width - 20, 118);
      }

      // 创建纹理
      const texture = new THREE.CanvasTexture(canvas);

      // 创建平面 - 所有标签使用相同大小
      const labelGeometry = new THREE.PlaneGeometry(6, 3);

      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });

      return new THREE.Mesh(labelGeometry, labelMaterial);
    },

    // 创建背景电路效果
    createBackgroundCircuitEffects() {
      // 创建随机分布的电路路径点
      const circuitPoints = [];
      const circuitCount = 0; // 将电路数量设置为0以移除散线效果

      for (let i = 0; i < circuitCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 12 + Math.random() * 15;

        // 创建起点
        const startX = Math.cos(angle) * radius;
        const startZ = Math.sin(angle) * radius;
        const startY = Math.random() * 15 - 3;

        // 创建终点 - 有几率连接到中心柱
        const connectToCenter = Math.random() > 0.7;
        let endX, endZ;
        if (connectToCenter) {
          const innerRadius = 2 + Math.random() * 3;
          endX = Math.cos(angle) * innerRadius;
          endZ = Math.sin(angle) * innerRadius;
        } else {
          const endAngle = angle + (Math.random() * 0.5 - 0.25);
          const endRadius = radius + (Math.random() * 10 - 5);
          endX = Math.cos(endAngle) * endRadius;
          endZ = Math.sin(endAngle) * endRadius;
        }
        const endY = startY + (Math.random() * 6 - 3);

        // 创建中间点
        const midX = (startX + endX) / 2 + (Math.random() * 2 - 1);
        const midZ = (startZ + endZ) / 2 + (Math.random() * 2 - 1);
        const midY = (startY + endY) / 2 + (Math.random() * 2 - 1);

        circuitPoints.push({
          start: new THREE.Vector3(startX, startY, startZ),
          mid: new THREE.Vector3(midX, midY, midZ),
          end: new THREE.Vector3(endX, endY, endZ)
        });
      }

      // 创建电路线
      const circuitGroup = new THREE.Group();

      circuitPoints.forEach(points => {
        // 创建曲线
        const curve = new THREE.QuadraticBezierCurve3(
          points.start,
          points.mid,
          points.end
        );

        // 创建几何体
        const geometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(20)
        );

        // 创建材质 - 随机颜色
        const colorIntensity = 0.5 + Math.random() * 0.5;
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(0.2 * colorIntensity, 0.6 * colorIntensity, 1.0 * colorIntensity),
          transparent: true,
          opacity: 0.3 + Math.random() * 0.3
        });

        // 创建线条
        const line = new THREE.Line(geometry, material);
        circuitGroup.add(line);

        // 在连接到中心的电路末端添加发光点
        if (points.end.distanceTo(new THREE.Vector3(0, points.end.y, 0)) < 5) {
          const dotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: 0.8
          });
          const dot = new THREE.Mesh(dotGeometry, dotMaterial);
          dot.position.copy(points.end);
          circuitGroup.add(dot);
        }
      });

      this.modelContainer.add(circuitGroup);
      this.circuitGroup = circuitGroup;
    },

    // 更新动画循环
    animateCube() {
      this.cubeAnimationId = requestAnimationFrame(this.animateCube);

      // 更新控制器
      if (this.controls) {
        this.controls.update();
      }

      // 更新时间
      const time = Date.now() * 0.001;

      // 更新底座材质
      if (this.baseRing && this.baseRing.material.uniforms) {
        this.baseRing.material.uniforms.time.value = time;
      }

      if (this.baseInnerRing && this.baseInnerRing.material.uniforms) {
        this.baseInnerRing.material.uniforms.time.value = time;
      }

      if (this.basePlatform && this.basePlatform.material.uniforms) {
        this.basePlatform.material.uniforms.time.value = time;
      }

      if (this.baseGlow && this.baseGlow.material.uniforms) {
        this.baseGlow.material.uniforms.time.value = time;
      }

      // 更新能量场效果
      if (this.energyField && this.energyField.material.uniforms) {
        this.energyField.material.uniforms.time.value = time;
      }

      // 更新能量光束效果
      if (this.energyBeam && this.energyBeam.material.uniforms) {
        this.energyBeam.material.uniforms.time.value = time;
      }

      // 更新分散粒子系统
      if (this.spreadParticles && this.spreadParticles.material.uniforms) {
        this.spreadParticles.material.uniforms.time.value = time;
      }

      // 更新六角星旋转效果
      if (this.hexaStar) {
        this.hexaStar.rotation.y = time * 0.2;
        this.hexaStar.rotation.z = Math.sin(time * 0.3) * 0.1;

        // 轻微上下浮动
        this.hexaStar.position.y = 8 + Math.sin(time * 0.5) * 0.3;

        // 脉冲效果 - 通过缩放实现
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        this.hexaStar.scale.set(pulse, pulse, pulse);

        // 更新中心核心的发光效果
        if (this.hexaStar.children.length > 0) {
          const core = this.hexaStar.children[this.hexaStar.children.length - 1];
          if (core.material) {
            core.material.opacity = 0.7 + Math.sin(time * 3) * 0.3;
          }
        }
      }

      // 更新光环旋转效果
      if (this.topRingGroup) {
        // 整体光环组缓慢旋转
        this.topRingGroup.rotation.y = time * 0.05;

        // 光环1和光环2以不同的速度和方向旋转，形成缠绕效果
        if (this.topRing1) {
          // 让第一个环围绕自身倾斜旋转
          this.topRing1.rotation.z = Math.sin(time * 0.3) * 0.2;
          this.topRing1.rotation.y = Math.sin(time * 0.2) * 0.4;
        }

        if (this.topRing2) {
          // 让第二个环以相反的方向旋转，形成交错效果
          this.topRing2.rotation.z = Math.sin(time * 0.3 + Math.PI) * 0.2;
          this.topRing2.rotation.y = Math.sin(time * 0.2 + Math.PI) * 0.4;
        }

        // 轻微上下浮动
        this.topRingGroup.position.y = 14 + Math.sin(time * 0.3) * 0.2;
      }

      if (this.bottomRingGroup) {
        // 底部光环组以不同方向旋转
        this.bottomRingGroup.rotation.y = -time * 0.07;

        // 底部光环也实现缠绕效果，但方向和速度与顶部不同
        if (this.bottomRing1) {
          this.bottomRing1.rotation.z = Math.sin(time * 0.2) * 0.15;
          this.bottomRing1.rotation.y = Math.sin(time * 0.25) * 0.3;
        }

        if (this.bottomRing2) {
          this.bottomRing2.rotation.z = Math.sin(time * 0.2 + Math.PI) * 0.15;
          this.bottomRing2.rotation.y = Math.sin(time * 0.25 + Math.PI) * 0.3;
        }

        // 轻微上下浮动，与上环相反
        this.bottomRingGroup.position.y = 2 + Math.sin(time * 0.3 + Math.PI) * 0.2;
      }

      // 更新扫描环
      if (this.scanningRing) {
        // 从底部向顶部移动并循环
        this.scanningRing.position.y = ((time * 2) % 15) - 0.5;

        // 当到达顶部时，降低透明度
        if (this.scanningRing.position.y > 13) {
          const fadeOut = (15 - this.scanningRing.position.y) / 2;
          this.scanningRing.material.opacity = fadeOut * 0.8;
        } else {
          this.scanningRing.material.opacity = 0.8;
        }

        // 随高度变化缩放
        const heightFactor = Math.min(1.5, 1 + this.scanningRing.position.y / 15);
        this.scanningRing.scale.set(heightFactor, 1, heightFactor);
      }

      // 渲染场景
      this.cubeRenderer.render(this.cubeScene, this.cubeCamera);
    },
    handleResize() {
      // 更新渲染器和相机
      if (this.cubeRenderer && this.cubeCamera) {
        const container = document.getElementById('threejs-cube');
        if (container) {
          this.cubeRenderer.setSize(container.clientWidth, container.clientHeight);
          this.cubeCamera.aspect = container.clientWidth / container.clientHeight;
          this.cubeCamera.updateProjectionMatrix();
        }
      }

      // 如果饼图容器存在，重新初始化
      if (this.$refs.alarmPieContainer) {
        // 清空容器
        const container = this.$refs.alarmPieContainer;
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        // 重新初始化
        this.initAlarmPieChart();
      }

      // 更新算法球体大小 (Algo Sphere) - 确保这部分逻辑还在
      if (this.algoRenderer && this.algoCamera) {
          this.handleAlgoResize(); // 调用现有的 algo resize 处理函数
      }
    },
    toggleResourcePanel() {
      this.isResourceExpanded = !this.isResourceExpanded;
    },
    // 拖拽气泡开始
    startDrag(event, index) {
      event.preventDefault();

      // 记录当前拖拽的算法索引
      this.currentDragIndex = index;

      // 记录起始位置
      this.initialX = event.clientX;
      this.initialY = event.clientY;

      // 记录元素初始位置百分比
      this.initialPosX = this.myAlgorithms[index].x;
      this.initialPosY = this.myAlgorithms[index].y;

      // 添加移动和停止拖拽的事件监听
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);

      // 设置被拖拽的元素样式
      const element = event.target.closest('.algorithm-bubble');
      if (element) {
        element.style.animation = 'none';
        element.style.transform = 'scale(1.1)';
        element.style.zIndex = '100';
        element.style.boxShadow = '0 0 20px rgba(30, 144, 255, 0.8)';
      }
    },

    // 拖拽过程中
    onDrag(event) {
      if (this.currentDragIndex === undefined) return;

      // 获取容器
      const container = document.getElementById('algorithm-container');
      if (!container) return;

      // 计算容器的尺寸
      const rect = container.getBoundingClientRect();

      // 计算移动距离
      const deltaX = event.clientX - this.initialX;
      const deltaY = event.clientY - this.initialY;

      // 计算新位置（百分比）
      let newX = this.initialPosX + (deltaX / rect.width) * 100;
      let newY = this.initialPosY + (deltaY / rect.height) * 100;

      // 限制在容器范围内
      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(5, Math.min(95, newY));

      // 更新位置
      this.myAlgorithms[this.currentDragIndex].x = newX;
      this.myAlgorithms[this.currentDragIndex].y = newY;
    },

    // 停止拖拽
    stopDrag(event) {
      if (this.currentDragIndex === undefined) return;

      // 恢复动画
      const element = document.querySelector(`.algorithm-bubble:nth-child(${this.currentDragIndex + 1})`);
      if (element) {
        const algo = this.myAlgorithms[this.currentDragIndex];
        element.style.animation = `floating ${algo.animTime}s ease-in-out infinite`;
        element.style.transform = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
      }

      // 移除事件监听
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);

      // 重置当前拖拽索引
      this.currentDragIndex = undefined;
    },
    // 初始化算法球体
    initAlgorithmSphere() {
      const container = document.getElementById('algorithm-sphere-container');
      if (!container) return;

      // 创建场景
      this.algoScene = new THREE.Scene();

      // 创建相机，调整视场角使效果更突出
      const width = container.clientWidth;
      const height = container.clientHeight;
      this.algoCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.algoCamera.position.z = 16; // 调整相机距离，使更紧密的气泡能够正常显示

      // 创建渲染器，启用抗锯齿提高清晰度
      this.algoRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance' // 提高性能
      });
      this.algoRenderer.setSize(width, height);
      this.algoRenderer.setClearColor(0x000000, 0);
      this.algoRenderer.setPixelRatio(window.devicePixelRatio); // 根据设备像素比设置
      container.appendChild(this.algoRenderer.domElement);

      // 创建球体组
      this.algoSphereGroup = new THREE.Group();
      this.algoScene.add(this.algoSphereGroup);

      // 添加更亮的环境光和方向光
      const ambientLight = new THREE.AmbientLight(0x404040, 2.5);
      this.algoScene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0x6688ff, 2.0);
      directionalLight.position.set(1, 1, 1);
      this.algoScene.add(directionalLight);


      // 创建气泡
      this.createAlgorithmBubbles();

      // 添加交互控制，减慢自动旋转速度
      this.algoControls = new OrbitControls(this.algoCamera, this.algoRenderer.domElement);
      this.algoControls.enableDamping = true;
      this.algoControls.dampingFactor = 0.1;
      this.algoControls.rotateSpeed = 0.6;
      this.algoControls.autoRotate = true;
      this.algoControls.autoRotateSpeed = 0.2;

      // 移除旋转角度限制
      // this.algoControls.minPolarAngle = Math.PI * 0.2;
      // this.algoControls.maxPolarAngle = Math.PI * 0.8;

      // 监听窗口大小变化
      window.addEventListener('resize', this.handleAlgoResize);

      // 开始动画循环
      this.animateAlgorithmSphere();
    },

    // 创建算法气泡
    createAlgorithmBubbles() {
      // 生成均匀分布在球面上的点，减小半径从9到7，使气泡更紧密
      const points = this.generateSpherePoints(this.myAlgorithms.length, 7);

      // 创建每个气泡
      this.myAlgorithms.forEach((algo, index) => {
        // 位置
        const position = points[index];

        // 创建气泡几何体和材质，增加细分以提高平滑度
        const size = algo.size;
        const geometry = new THREE.SphereGeometry(size, 48, 48);

        // 随机颜色，但保持在蓝色系
        const hue = 0.58 + Math.random() * 0.12; // 蓝色系
        const saturation = 0.75 + Math.random() * 0.25;
        const lightness = 0.55 + Math.random() * 0.2;

        const color = new THREE.Color().setHSL(hue, saturation, lightness);

        // 创建着色器材质，增强发光效果
        const material = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: color },
            time: { value: 0 }
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
              vUv = uv;
              vNormal = normalize(normalMatrix * normal);
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
              // 边缘发光效果
              float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
              vec3 glow = color * intensity * 2.5;
              
              // 随时间变化的脉冲效果
              float pulse = 0.5 + 0.5 * sin(time * 1.5);
              vec3 finalColor = mix(color, color * 1.8, pulse * intensity);
              
              // 增加中心亮度和光泽
              vec2 center = vUv - 0.5;
              float centerDist = length(center);
              float centerGlow = smoothstep(0.5, 0.0, centerDist);
              finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), centerGlow * 0.7);
              
              // 添加一些噪点以提高视觉丰富度
              float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233)) * time * 0.1) * 43758.5453);
              finalColor += vec3(noise * 0.03);
              
              gl_FragColor = vec4(finalColor + glow, 0.92);
            }
          `,
          transparent: true
        });

        // 创建气泡
        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.set(position.x, position.y, position.z);
        bubble.userData = { algorithm: algo };
        this.algoSphereGroup.add(bubble);

        // 创建文本标签
        this.createTextLabel(algo, bubble);
      });
    },

    // 创建文本标签
    createTextLabel(algo, bubble) {
      // 创建2D画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 512; // 保持高分辨率
      canvas.height = 256;

      // 透明背景，不再绘制半透明圆形背景
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制算法ID，不使用阴影
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(algo.id, canvas.width / 2, 110);

      // 绘制算法名称，不使用阴影
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(algo.name, canvas.width / 2, 170);

      // 创建纹理
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // 创建精灵材质
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        sizeAttenuation: true
      });

      // 创建精灵
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(6, 3, 1);
      sprite.position.copy(bubble.position);
      sprite.position.multiplyScalar(1.02); // 微调位置，使标签更贴近气泡

      this.algoSphereGroup.add(sprite);
    },

    // 生成均匀分布在球面上的点
    generateSpherePoints(n, radius) {
      const points = [];
      const phi = Math.PI * (3 - Math.sqrt(5)); // 黄金角

      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;  // y从1到-1
        const radiusAtY = Math.sqrt(1 - y * y); // 半径在该y位置

        const theta = phi * i; // 黄金角旋转

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
      }

      return points;
    },

    // 处理窗口大小变化
    handleAlgoResize() {
      if (!this.algoRenderer || !this.algoCamera) return;

      const container = document.getElementById('algorithm-sphere-container');
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      this.algoCamera.aspect = width / height;
      this.algoCamera.updateProjectionMatrix();

      this.algoRenderer.setSize(width, height);
    },

    // 动画循环
    animateAlgorithmSphere() {
      if (!this.algoRenderer) return;

      this.algoAnimationId = requestAnimationFrame(this.animateAlgorithmSphere);

      // 更新控制器
      if (this.algoControls) {
        this.algoControls.update();
      }

      // 更新着色器中的时间
      const time = performance.now() * 0.001;
      this.algoSphereGroup.children.forEach(child => {
        if (child.material && child.material.uniforms && child.material.uniforms.time) {
          child.material.uniforms.time.value = time;
        }

        // 更新精灵标签，始终面向相机
        if (child.isSprite) {
          child.lookAt(this.algoCamera.position);
        }
      });

      // 渲染
      this.algoRenderer.render(this.algoScene, this.algoCamera);
    },

    initAlarmPieChart() {
      const data = this.alarmPieData;
      const svg = this.$refs.alarmPieChartSvg;
      const legendContainer = this.$refs.alarmPieLegend;
      if (!svg || !legendContainer || !data || data.length === 0) return;

      // 清空旧内容
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      while (legendContainer.firstChild) {
        legendContainer.removeChild(legendContainer.firstChild);
      }

      const totalValue = data.reduce((sum, item) => sum + item.value, 0);
      if (totalValue === 0) return; // 避免除以零

      let startAngle = -Math.PI / 2; // 从顶部开始

      data.forEach((item, index) => {
        const percentage = item.value / totalValue;
        const endAngle = startAngle + percentage * (2 * Math.PI);
        const largeArcFlag = percentage > 0.5 ? 1 : 0;

        // 计算坐标
        const startX = 90 * Math.cos(startAngle);
        const startY = 90 * Math.sin(startAngle);
        const endX = 90 * Math.cos(endAngle);
        const endY = 90 * Math.sin(endAngle);

        // 创建 <path> 元素
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = [
          `M ${startX} ${startY}`, // 移动到起点
          `A 90 90 0 ${largeArcFlag} 1 ${endX} ${endY}`, // 绘制圆弧
          'L 0 0' // 连接到圆心
        ].join(' ');

        path.setAttribute('d', d);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', '#000b18'); // 添加描边以区分扇区
        path.setAttribute('stroke-width', '1');
        path.classList.add('pie-segment'); // 添加类名用于交互

        // 添加悬停效果和提示
        path.addEventListener('mouseenter', (e) => {
           this.showPieTooltip(e, item);
        });
        path.addEventListener('mouseleave', () => {
           this.hidePieTooltip();
        });


        svg.appendChild(path);

        // 创建图例项
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        legendItem.innerHTML = `
          <span class="legend-color" style="background-color: ${item.color};"></span>
          <span class="legend-text">${item.label}</span>
          <span class="legend-value">${item.value.toFixed(2)}%</span>
        `;
        legendContainer.appendChild(legendItem);

        startAngle = endAngle;
      });

       // 添加中心圆和脉冲效果
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', '0');
        centerCircle.setAttribute('cy', '0');
        centerCircle.setAttribute('r', '50'); // 中心圆半径
        centerCircle.setAttribute('fill', 'rgba(0, 11, 24, 0.7)'); // 半透明背景
        centerCircle.setAttribute('stroke', 'rgba(30, 144, 255, 0.3)');
        centerCircle.setAttribute('stroke-width', '1');
        svg.appendChild(centerCircle);

        const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseCircle.setAttribute('cx', '0');
        pulseCircle.setAttribute('cy', '0');
        pulseCircle.setAttribute('r', '55'); // 脉冲环半径略大于中心圆
        pulseCircle.setAttribute('fill', 'none');
        pulseCircle.setAttribute('stroke', 'rgba(30, 144, 255, 0.5)');
        pulseCircle.setAttribute('stroke-width', '1');
        pulseCircle.classList.add('pulse-circle'); // 应用脉冲动画
        svg.appendChild(pulseCircle);

        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', '0');
        centerText.setAttribute('y', '0');
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('dy', '.3em');
        centerText.setAttribute('fill', '#ffffff');
        centerText.setAttribute('font-size', '14');
        centerText.textContent = '报警占比';
        svg.appendChild(centerText);
    },

    // 添加 tooltip 方法
    showPieTooltip(event, item) {
        let tooltip = document.getElementById('pie-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'pie-tooltip';
            tooltip.classList.add('pie-tooltip');
            document.body.appendChild(tooltip);
        }
        tooltip.innerHTML = `<div>${item.label}</div><div>${item.value.toFixed(2)}%</div>`;
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
        tooltip.style.display = 'block';
        tooltip.style.opacity = '1'; // 确保可见
    },

    hidePieTooltip() {
        const tooltip = document.getElementById('pie-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
            tooltip.style.opacity = '0';
        }
    },
  }
}
</script>

<style scoped>
/* 基础样式和全局设置 */
.algorithm-inference-platform {
  width: 100%;
  height: 100vh;
  background-color: #000b18;
  color: #ffffff;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  position: relative;
  overflow: hidden;
  background-image: url('/static/img/bg-pattern.png');
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

/* 背景网格线效果 */
.algorithm-inference-platform::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(to right, rgba(20, 80, 180, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(20, 80, 180, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center;
  z-index: 0;
}

/* 顶部和底部边框装饰 */
.algorithm-inference-platform::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right,
      transparent,
      rgba(30, 144, 255, 0.5) 20%,
      rgba(30, 144, 255, 0.8) 50%,
      rgba(30, 144, 255, 0.5) 80%,
      transparent);
  z-index: 2;
}

.main-title {
  text-align: center;
  font-size: 24px;
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(30, 144, 255, 0.7);
  padding: 8px 0;
  position: relative;
  z-index: 10;
  background: linear-gradient(to right,
      rgba(0, 0, 0, 0),
      rgba(10, 35, 75, 0.7) 20%,
      rgba(10, 35, 75, 0.7) 80%,
      rgba(0, 0, 0, 0));
  flex: 0 0 auto;
}

.current-time {
  position: absolute;
  top: 10px;
  left: 20px;
  color: #91a7cc;
  font-size: 12px;
  z-index: 10;
}

.fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  color: #91a7cc;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  z-index: 10;
}

.fullscreen-btn i {
  margin-right: 5px;
  font-size: 16px;
}

/* 仪表板布局 */
.dashboard-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-gap: 8px;
  flex: 1;
  padding: 8px;
  overflow: hidden;
}

/* 卡片样式 */
.dashboard-card {
  background-color: rgba(0, 11, 24, 0.8);
  border-radius: 0;
  overflow: hidden;
  border: 1px solid rgba(30, 80, 150, 0.5);
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* 卡片头部蓝色边框 */
.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(30, 80, 150, 0.8);
}

/* 卡片蓝色边角 */
.dashboard-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  border-top: 2px solid #1e90ff;
  border-left: 2px solid #1e90ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 15px;
  background-color: rgba(9, 30, 60, 0.9);
  border-bottom: 1px solid rgba(30, 80, 150, 0.5);
}

.card-header .title {
  font-size: 14px;
  font-weight: bold;
  color: #3a9eff;
  position: relative;
  padding-left: 15px;
}

.card-header .title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  height: 16px;
  width: 4px;
  background-color: #3a9eff;
}

.card-header i {
  color: #91a7cc;
  cursor: pointer;
}

.card-content {
  padding: 5px 10px;
  height: calc(100% - 40px);
  overflow: auto;
}

/* 资源统计模块样式 */
.resource-statistics {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.server-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
  margin-top: 10px;
  padding: 0 5px;
}

.server-type {
  display: flex;
  align-items: center;
  color: #7888a8;
  font-size: 13px;
  background: rgba(0, 24, 40, 0.4);
  padding: 6px 15px;
  border-radius: 4px;
  border: 1px solid rgba(30, 144, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.server-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #3eaef9;
  font-size: 18px;
}

.master-icon::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233eaef9"><path d="M4,1H20a1,1,0,0,1,1,1V22a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V2A1,1,0,0,1,4,1Z" opacity="0.5"/><path d="M5,12.5a1.5,1.5,0,1,0,1.5-1.5A1.5,1.5,0,0,0,5,12.5Zm6.5-1.5a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,11.5,11Zm5,0a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16.5,11ZM5,6.5A1.5,1.5,0,1,0,6.5,5,1.5,1.5,0,0,0,5,6.5Zm6.5-1.5a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,11.5,5Zm5,0a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16.5,5ZM5,18.5A1.5,1.5,0,1,0,6.5,17,1.5,1.5,0,0,0,5,18.5Zm6.5-1.5a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,11.5,17Zm5,0a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16.5,17Z"/></svg>');
  background-size: cover;
}

.node-icon::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233eaef9"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.5"/><path d="M17,11H13V7a1,1,0,0,0-2,0v4H7a1,1,0,0,0,0,2h4v4a1,1,0,0,0,2,0V13h4a1,1,0,0,0,0-2Z"/></svg>');
  background-size: cover;
}

.resource-charts {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding: 0 5px;
  position: relative;
}

.resource-charts::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(to right,
      rgba(30, 144, 255, 0),
      rgba(30, 144, 255, 0.3),
      rgba(30, 144, 255, 0));
}

.chart-item {
  width: 22%;
  position: relative;
  padding-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 图表容器 */
.chart-container {
  width: 65px;
  height: 65px;
  margin: 0;
  border-radius: 50%;
  background: rgba(5, 16, 39, 0.2);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  box-shadow: 0 0 15px rgba(0, 10, 30, 0.5),
    inset 0 0 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

/* 百分比环样式 */
.percentage-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  transform: rotate(-90deg);
  z-index: 2;
  -webkit-mask: radial-gradient(transparent 60%, #fff 61%, #fff 63%, transparent 64%);
  mask: radial-gradient(transparent 60%, #fff 61%, #fff 63%, transparent 64%);
}

.percentage-ring.cpu {
  background: conic-gradient(rgba(62, 174, 249, 0.95) var(--progress, 74.484deg),
      rgba(62, 174, 249, 0.15) var(--progress, 74.484deg));
  box-shadow: 0 0 20px rgba(62, 174, 249, 0.3);
}

.percentage-ring.disk {
  background: conic-gradient(rgba(255, 156, 56, 0.95) var(--progress, 231.66deg),
      rgba(255, 156, 56, 0.15) var(--progress, 231.66deg));
  box-shadow: 0 0 20px rgba(255, 156, 56, 0.3);
}

.percentage-ring.memory {
  background: conic-gradient(rgba(41, 222, 156, 0.95) var(--progress, 164.16deg),
      rgba(41, 222, 156, 0.15) var(--progress, 164.16deg));
  box-shadow: 0 0 20px rgba(41, 222, 156, 0.3);
}

.percentage-ring.gpu {
  background: conic-gradient(rgba(255, 90, 90, 0.95) var(--progress, 332.424deg),
      rgba(255, 90, 90, 0.15) var(--progress, 332.424deg));
  box-shadow: 0 0 20px rgba(255, 90, 90, 0.3);
}

/* 内部圆圈 */
.inner-circle {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  background: linear-gradient(145deg,
      rgba(5, 16, 39, 0.9),
      rgba(5, 20, 50, 0.7));
  position: relative;
  z-index: 3;
  overflow: hidden;
  box-shadow:
    inset 0 0 15px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(3px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 液体容器 */
.liquid-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 33%;
  overflow: hidden;
  border-bottom-left-radius: 100px;
  border-bottom-right-radius: 100px;
}

.liquid-container.cpu {
  background: linear-gradient(to bottom,
      rgba(62, 174, 249, 0.1),
      rgba(62, 174, 249, 0.3));
  box-shadow: 0 0 10px rgba(62, 174, 249, 0.2);
}

.liquid-container.disk {
  background: linear-gradient(to bottom,
      rgba(255, 156, 56, 0.1),
      rgba(255, 156, 56, 0.3));
  box-shadow: 0 0 10px rgba(255, 156, 56, 0.2);
}

.liquid-container.memory {
  background: linear-gradient(to bottom,
      rgba(41, 222, 156, 0.1),
      rgba(41, 222, 156, 0.3));
  box-shadow: 0 0 10px rgba(41, 222, 156, 0.2);
}

.liquid-container.gpu {
  background: linear-gradient(to bottom,
      rgba(255, 90, 90, 0.1),
      rgba(255, 90, 90, 0.3));
  box-shadow: 0 0 10px rgba(255, 90, 90, 0.2);
}

/* 波浪效果 */
.liquid-wave {
  position: absolute;
  top: -10px;
  left: -50%;
  width: 200%;
  height: 20px;
  border-radius: 43%;
  animation: wave 4s infinite ease-in-out;
  opacity: 0.8;
  filter: blur(1px);
}

.liquid-container.cpu .liquid-wave {
  background: rgba(62, 174, 249, 0.4);
  animation: wave 4s infinite ease-in-out;
}

.liquid-container.disk .liquid-wave {
  background: rgba(255, 156, 56, 0.4);
  animation: wave 4.2s infinite ease-in-out reverse;
}

.liquid-container.memory .liquid-wave {
  background: rgba(41, 222, 156, 0.4);
  animation: wave 3.8s infinite ease-in-out;
}

.liquid-container.gpu .liquid-wave {
  background: rgba(255, 90, 90, 0.4);
  animation: wave 4.4s infinite ease-in-out reverse;
}

/* 波浪动画 */
@keyframes wave {
  0% {
    transform: translateX(0) scale(1, 0.8);
  }

  50% {
    transform: translateX(-25%) scale(1, 1.2);
  }

  100% {
    transform: translateX(-50%) scale(1, 0.8);
  }
}

.liquid-container.cpu .liquid-wave::before {
  animation-direction: reverse;
}

.liquid-container.disk .liquid-wave::before {
  animation-direction: normal;
}

.liquid-container.memory .liquid-wave::before {
  animation-direction: alternate-reverse;
}

.liquid-container.gpu .liquid-wave::before {
  animation-direction: alternate;
}

.liquid-container.cpu .liquid-wave::after {
  animation-direction: alternate;
}

.liquid-container.disk .liquid-wave::after {
  animation-direction: alternate-reverse;
}

.liquid-container.memory .liquid-wave::after {
  animation-direction: normal;
}

.liquid-container.gpu .liquid-wave::after {
  animation-direction: reverse;
}

/* 百分比文本 */
.percentage-text {
  position: absolute;
  z-index: 6;
  font-size: 16px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: baseline;
  justify-content: center;
  letter-spacing: 1px;
}

.percentage-text.cpu {
  color: #3eaef9;
  text-shadow: 0 0 8px rgba(62, 174, 249, 0.5);
}

.percentage-text.disk {
  color: #ff9c38;
  text-shadow: 0 0 8px rgba(255, 156, 56, 0.5);
}

.percentage-text.memory {
  color: #29de9c;
  text-shadow: 0 0 8px rgba(41, 222, 156, 0.5);
}

.percentage-text.gpu {
  color: #ff5a5a;
  text-shadow: 0 0 8px rgba(255, 90, 90, 0.5);
}

.percentage-symbol {
  font-size: 9px;
  margin-left: 1px;
}

/* 科技感增强 */
.chart-container::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%);
  z-index: 1;
  pointer-events: none;
}

.chart-container::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
  z-index: 1;
  opacity: 0.8;
}

/* 标题样式 */
.chart-title {
  color: #7888a8;
  font-size: 13px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  margin: 0;
  padding-top: 8px;
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 5px;
  color: #7888a8;
  font-size: 12px;
  cursor: pointer;
  padding: 5px 0;
  background: rgba(30, 144, 255, 0.1);
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.more-btn::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right,
      rgba(30, 144, 255, 0),
      rgba(30, 144, 255, 0.5),
      rgba(30, 144, 255, 0));
}

.more-btn:hover {
  color: #ffffff;
  background: rgba(30, 144, 255, 0.2);
}

.more-btn i {
  margin-left: 8px;
  font-size: 12px;
}

.expanded-content {
  background: rgba(0, 11, 24, 0.8);
  border-top: 1px solid rgba(30, 80, 150, 0.5);
  padding: 10px;
  max-height: 250px;
  overflow-y: auto;
  animation: slideDown 0.3s forwards;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }

  to {
    max-height: 250px;
    opacity: 1;
  }
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(30, 80, 150, 0.3);
}

.resource-detail-title {
  font-size: 14px;
  color: #3a9eff;
  font-weight: bold;
}

.resource-time {
  font-size: 12px;
  color: #7888a8;
}

.resource-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}

.detail-group {
  background: rgba(0, 24, 40, 0.4);
  border: 1px solid rgba(30, 144, 255, 0.2);
  border-radius: 4px;
  padding: 10px;
  position: relative;
  overflow: hidden;
}

.detail-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right,
      rgba(30, 144, 255, 0.1),
      rgba(30, 144, 255, 0.4),
      rgba(30, 144, 255, 0.1));
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 12px;
  color: #7888a8;
}

.detail-value {
  font-size: 12px;
  color: #ffffff;
  font-weight: bold;
}

/* 中心显示区域 */
.center-container {
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  /* 确保内容不溢出 */
  justify-content: flex-end;
  /* 内容靠下对齐 */
}

.top-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-box {
  width: 48%;
  background-color: rgba(0, 11, 24, 0.8);
  text-align: center;
  padding: 10px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  position: relative;
}

.stat-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(30, 80, 150, 0.8);
}

.stat-title {
  font-size: 14px;
  color: #91a7cc;
  margin-bottom: 5px;
}

.digital-number {
  font-family: 'Digital-7', monospace;
  font-size: 24px;
  color: #ffffff;
  letter-spacing: 2px;
}

/* 中央立方体样式 */
.central-visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
  width: 100%;
  perspective: 1200px;
  overflow: visible;
  background-color: transparent;
  border: none;
}

/* 顶部数据框 */
.top-stats {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.stat-box {
  width: 220px;
  background-color: rgba(0, 31, 63, 0.5);
  text-align: center;
  padding: 10px;
  border: 1px solid rgba(0, 149, 255, 0.7);
  position: relative;
  box-shadow: 0 0 15px rgba(0, 100, 255, 0.3);
  z-index: 5;
}

.stat-box::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, rgba(0, 149, 255, 0), rgba(0, 149, 255, 0.9), rgba(0, 149, 255, 0));
  top: 0;
  left: 0;
}

.stat-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.digital-number {
  font-family: 'Digital-7', 'Orbitron', monospace;
  font-size: 28px;
  color: #2bbdff;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(43, 189, 255, 0.6);
}

.central-cube-container {
  width: 70%;
  height: 380px;
  /* 减小高度 */
  margin: 0 auto;
  margin-bottom: 0;
  /* 确保底部没有边距 */
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* 内容靠下对齐 */
}

/* 连接线样式 */
.stat-connector {
  position: absolute;
  bottom: -20px;
  display: flex;
  align-items: center;
  z-index: 1;
}

.stat-connector .dot {
  width: 6px;
  height: 6px;
  background-color: #2bbdff;
  border-radius: 50%;
  box-shadow: 0 0 8px #2bbdff;
}

.stat-connector .line {
  height: 1px;
  background: linear-gradient(90deg, rgba(43, 189, 255, 0.9), rgba(43, 189, 255, 0.1));
  width: 60px;
}

.stat-connector.left {
  right: 20px;
}

.stat-connector.left .line {
  background: linear-gradient(90deg, rgba(43, 189, 255, 0.1), rgba(43, 189, 255, 0.9));
}

.stat-connector.right {
  left: 20px;
}

/* 3D立方体 */
.floating-cube {
  width: 70px;
  height: 70px;
  position: absolute;
  top: 25px;
  left: 25px;
  transform-style: preserve-3d;
  animation: floatCube 6s ease-in-out infinite;
  transform: rotateX(-20deg) rotateY(45deg);
}

@keyframes floatCube {
  0% {
    transform: rotateX(-20deg) rotateY(45deg) translateY(0);
  }

  50% {
    transform: rotateX(-20deg) rotateY(45deg) translateY(-10px);
  }

  100% {
    transform: rotateX(-20deg) rotateY(45deg) translateY(0);
  }
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 12s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotateY(0);
  }

  100% {
    transform: rotateY(360deg);
  }
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(43, 189, 255, 0.1);
  border: 1px solid rgba(43, 189, 255, 0.7);
  box-shadow: 0 0 10px rgba(43, 189, 255, 0.5) inset;
  backface-visibility: visible;
}

.cube-face::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: linear-gradient(135deg,
      rgba(43, 189, 255, 0.3) 0%,
      rgba(43, 189, 255, 0.1) 50%,
      rgba(43, 189, 255, 0.3) 100%);
  opacity: 0.4;
}

.cube-face::after {
  content: '';
  position: absolute;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
  border: 1px dashed rgba(43, 189, 255, 0.5);
  opacity: 0.3;
}

.cube-face.front {
  transform: translateZ(35px);
}

.cube-face.back {
  transform: rotateY(180deg) translateZ(35px);
}

.cube-face.right {
  transform: rotateY(90deg) translateZ(35px);
}

.cube-face.left {
  transform: rotateY(-90deg) translateZ(35px);
}

.cube-face.top {
  transform: rotateX(90deg) translateZ(35px);
}

.cube-face.bottom {
  transform: rotateX(-90deg) translateZ(35px);
}

.cube-inner {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 15px;
  left: 15px;
  transform-style: preserve-3d;
  transform: translateZ(0px);
}

.cube-icon {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: translateZ(5px) rotateX(0deg) rotateY(0deg);
  animation: glow 3s ease-in-out infinite alternate;
}

.cube-icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(43, 189, 255, 0.3);
  border: 1px solid rgba(43, 189, 255, 0.5);
  transform: translateZ(0);
}

.cube-icon::after {
  content: '数据';
  position: absolute;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: bold;
  background-color: rgba(43, 189, 255, 0.2);
  transform: translateZ(2px);
  border: 1px dashed rgba(255, 255, 255, 0.5);
}

@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(43, 189, 255, 0.5);
  }

  100% {
    box-shadow: 0 0 20px rgba(43, 189, 255, 0.9);
  }
}

/* 平台结构 */
.platform-structure {
  width: 100%;
  height: 400px;
  position: relative;
  transform-style: preserve-3d;
  transform: perspective(1500px) rotateX(45deg);
  margin-top: 40px;
}

.platform {
  position: absolute;
  width: 400px;
  height: 400px;
  left: 50%;
  transform-style: preserve-3d;
  transform: translateX(-50%);
}

.platform-surface {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(9, 30, 66, 0.4);
  border: 2px solid rgba(43, 189, 255, 0.7);
  box-shadow: 0 0 20px rgba(43, 189, 255, 0.3);
  transform: translateZ(1px);
}

.platform-surface::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: radial-gradient(circle at 50% 50%, rgba(43, 189, 255, 0.2) 0%, rgba(43, 189, 255, 0.1) 20%, rgba(9, 30, 66, 0.1) 60%);
  pointer-events: none;
}

.platform-surface::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image:
    linear-gradient(90deg, rgba(43, 189, 255, 0.1) 1px, transparent 1px),
    linear-gradient(180deg, rgba(43, 189, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.top-platform .platform-surface {
  box-shadow: 0 0 30px rgba(43, 189, 255, 0.4);
  background: rgba(9, 30, 66, 0.5);
}

.mid-platform .platform-surface {
  box-shadow: 0 0 25px rgba(43, 189, 255, 0.35);
  background: rgba(9, 30, 66, 0.45);
}

.bottom-platform .platform-surface {
  box-shadow: 0 0 20px rgba(43, 189, 255, 0.3);
  background: rgba(9, 30, 66, 0.4);
}

.platform-side {
  position: absolute;
  background: rgba(7, 22, 45, 0.6);
  border: 1px solid rgba(43, 189, 255, 0.5);
}

.platform-side.front,
.platform-side.back {
  width: 100%;
  height: 10px;
}

.platform-side.left,
.platform-side.right {
  width: 10px;
  height: 100%;
}

.platform-side.front {
  transform: rotateX(90deg) translateZ(5px) translateY(-5px);
  bottom: 0;
}

.platform-side.back {
  transform: rotateX(90deg) translateZ(-5px) translateY(-5px);
  top: 0;
}

.platform-side.right {
  transform: rotateY(90deg) translateZ(5px) translateX(-5px);
  right: 0;
}

.platform-side.left {
  transform: rotateY(90deg) translateZ(-395px) translateX(-5px);
  left: 0;
}

.top-platform {
  transform: translateX(-50%) translateZ(60px);
  width: 300px;
  height: 300px;
  left: 50%;
}

.mid-platform {
  transform: translateX(-50%) translateZ(30px);
  width: 350px;
  height: 350px;
  left: 50%;
}

.bottom-platform {
  transform: translateX(-50%) translateZ(0);
  width: 400px;
  height: 400px;
  left: 50%;
}

/* 数据标签 */
.data-tag {
  position: absolute;
  display: flex;
  align-items: center;
  z-index: 10;
}

.tag-content {
  background-color: rgba(0, 31, 63, 0.7);
  border: 1px solid #2bbdff;
  padding: 5px 10px;
  display: flex;
  box-shadow: 0 0 10px rgba(43, 189, 255, 0.4);
  position: relative;
  width: 200px;
  overflow: hidden;
}

.tag-content::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(43, 189, 255, 0.05) 0%,
      rgba(43, 189, 255, 0.1) 10%,
      rgba(43, 189, 255, 0.05) 20%,
      rgba(43, 189, 255, 0.05) 30%,
      rgba(43, 189, 255, 0.1) 40%,
      rgba(43, 189, 255, 0.05) 50%,
      rgba(43, 189, 255, 0.05) 60%,
      rgba(43, 189, 255, 0.1) 70%,
      rgba(43, 189, 255, 0.05) 80%,
      rgba(43, 189, 255, 0.1) 90%,
      rgba(43, 189, 255, 0.05) 100%);
  top: 0;
  left: 0;
  opacity: 0.5;
}

.tag-content::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 100%;
  background: linear-gradient(90deg, rgba(43, 189, 255, 0), rgba(43, 189, 255, 0.2));
}

.tag-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-right: 15px;
}

.tag-value {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin-left: auto;
}

.tag-connector {
  display: flex;
  align-items: center;
}

.tag-connector .dot {
  width: 6px;
  height: 6px;
  background-color: #2bbdff;
  border-radius: 50%;
  box-shadow: 0 0 8px #2bbdff;
}

.tag-connector .line {
  height: 1px;
  background: linear-gradient(90deg, rgba(43, 189, 255, 0.9), rgba(43, 189, 255, 0.1));
  width: 30px;
}

.tag-connector.orange .dot {
  background-color: #ff9933;
  box-shadow: 0 0 8px #ff9933;
}

.tag-connector.orange .line {
  background: linear-gradient(90deg, rgba(255, 153, 51, 0.9), rgba(255, 153, 51, 0.1));
}

/* 数据标签位置 */
.data-tag.left {
  left: -230px;
  top: 50%;
  transform: translateY(-50%);
}

.data-tag.left .tag-connector {
  margin-left: 10px;
}

.data-tag.right {
  right: -230px;
  top: 50%;
  transform: translateY(-50%);
}

.data-tag.right .tag-connector {
  margin-right: 10px;
  flex-direction: row-reverse;
}

.data-tag.right .tag-connector .line {
  background: linear-gradient(90deg, rgba(43, 189, 255, 0.1), rgba(43, 189, 255, 0.9));
}

/* 装饰立方体 */
.deco-cube {
  position: absolute;
  width: 20px;
  height: 20px;
  transform-style: preserve-3d;
  animation: decoGlow 4s ease-in-out infinite alternate;
}

@keyframes decoGlow {
  0% {
    box-shadow: 0 0 5px rgba(43, 189, 255, 0.3);
  }

  100% {
    box-shadow: 0 0 15px rgba(43, 189, 255, 0.7);
  }
}

.deco-cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(43, 189, 255, 0.1);
  border: 1px solid rgba(43, 189, 255, 0.7);
  backface-visibility: visible;
}

.deco-cube-face.front {
  transform: translateZ(10px);
}

.deco-cube-face.back {
  transform: rotateY(180deg) translateZ(10px);
}

.deco-cube-face.right {
  transform: rotateY(90deg) translateZ(10px);
}

.deco-cube-face.left {
  transform: rotateY(-90deg) translateZ(10px);
}

.deco-cube-face.top {
  transform: rotateX(90deg) translateZ(10px);
}

.deco-cube-face.bottom {
  transform: rotateX(-90deg) translateZ(10px);
}

.deco-cube.top-right {
  right: 30px;
  top: 30px;
  animation-delay: 0.5s;
}

.deco-cube.mid-left {
  left: 40px;
  top: 40px;
  animation-delay: 1s;
}

/* 装饰方块 */
.decoration-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.deco-square {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 153, 51, 0.3);
  border: 1px solid rgba(255, 153, 51, 0.7);
  bottom: 40px;
  right: 80px;
  animation: squareFloat 5s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 153, 51, 0.5);
}

.deco-square-2 {
  width: 20px;
  height: 20px;
  bottom: 30px;
  right: 120px;
  animation-delay: 0.7s;
}

.deco-square-3 {
  width: 15px;
  height: 15px;
  bottom: 50px;
  right: 70px;
  animation-delay: 1.2s;
}

@keyframes squareFloat {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0);
  }
}

/* 连接线 */
.connection-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}

.vertical-line {
  position: absolute;
  width: 1px;
  height: 300px;
  background: linear-gradient(to bottom,
      rgba(43, 189, 255, 0),
      rgba(43, 189, 255, 0.7),
      rgba(43, 189, 255, 0.4),
      rgba(43, 189, 255, 0));
  animation: linePulse 4s ease-in-out infinite;
}

@keyframes linePulse {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.7;
  }

  100% {
    opacity: 0.3;
  }
}

.line-1 {
  left: 30%;
  top: 50px;
  animation-delay: 0.2s;
}

.line-2 {
  left: 40%;
  top: 20px;
  animation-delay: 0.8s;
}

.line-3 {
  right: 35%;
  top: 30px;
  animation-delay: 0.5s;
}

.line-4 {
  right: 25%;
  top: 60px;
  animation-delay: 1.1s;
}

/* 我的算法模块样式 */
.my-algorithms {
  grid-column: 1;
  grid-row: 2;
  height: 100%;
  overflow: hidden;
}

.algorithm-bubbles {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: rgba(0, 15, 30, 0.6);
  overflow: hidden;
  background-image: radial-gradient(circle at center, rgba(10, 50, 100, 0.3) 0%, rgba(0, 15, 30, 0.8) 100%);
}

.algorithm-bubble {
  position: absolute;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: move;
  transition: transform 0.2s ease-out;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 15px rgba(30, 144, 255, 0.4);
  background: radial-gradient(ellipse at center, rgba(90, 140, 250, 0.9) 0%, rgba(30, 100, 200, 0.8) 70%);
  user-select: none;
  border: 1px solid rgba(120, 160, 255, 0.5);
}

.algorithm-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(30, 144, 255, 0.6);
  z-index: 10;
}

.algo-id {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 3px;
  color: #ffffff;
}

.algo-name {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

@keyframes floating {
  0% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-10px) scale(1.05);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

/* 实时事件模块样式 */
.realtime-events {
  grid-column: 3;
  grid-row: 1;
  height: 100%;
  overflow: hidden;
}

.event-layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: auto;
  gap: 5px;
  height: 100%;
}

.main-video-area {
  grid-column: 1;
  grid-row: 1 / 3;
  background-color: #0c1932;
  background-image: url('/static/img/traffic.jpg');
  background-size: cover;
  background-position: center;
  border: 1px solid #1c3f6e;
}

.thumbnail-list {
  grid-column: 2;
  grid-row: 1 / 4;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
}

.thumbnail-item {
  flex: 1;
  background-color: #0c1932;
  background-image: url('/static/img/traffic-3.jpg');
  background-size: cover;
  background-position: center;
  border: 1px solid #1c3f6e;
}

.thumbnail-item:nth-child(2) {
  background-image: url('/static/img/traffic-1.jpg');
}

.thumbnail-item:nth-child(3) {
  background-image: url('/static/img/traffic-2.jpg');
}

.event-info-area {
  grid-column: 1;
  grid-row: 3;
  background-color: #0c1932;
  border: 1px solid #1c3f6e;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.info-label {
  color: #8aa3c8;
  width: 50px;
  font-size: 14px;
}

.info-value {
  color: #ffffff;
  flex: 1;
  font-size: 14px;
}

.alarm-tag {
  background-color: #ff5a5a;
  color: #ffffff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-left: auto;
}

/* 设备统计模块样式 */
.device-statistics {
  grid-column: 1;
  grid-row: 3;
  height: 100%;
  overflow: hidden;
}

.device-total {
  text-align: center;
  margin: 15px 0;
  padding: 15px;
  background: rgba(0, 20, 40, 0.3);
  border: 1px solid rgba(30, 144, 255, 0.2);
  border-radius: 4px;
}

.total-label {
  font-size: 13px;
  color: #91a7cc;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}

.total-label::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: linear-gradient(to right, rgba(30, 144, 255, 0), rgba(30, 144, 255, 0.8), rgba(30, 144, 255, 0));
}

.digital-counter {
  display: flex;
  justify-content: center;
  align-items: center;
}

.digit {
  width: 28px;
  height: 40px;
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.8), rgba(0, 20, 40, 0.8));
  border: 1px solid rgba(30, 144, 255, 0.3);
  color: #3a9eff;
  font-size: 24px;
  font-family: 'Digital-7', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  position: relative;
  text-shadow: 0 0 8px rgba(58, 158, 255, 0.5);
}

.digit::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, rgba(30, 144, 255, 0), rgba(30, 144, 255, 0.5), rgba(30, 144, 255, 0));
}

.digit::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, rgba(30, 144, 255, 0), rgba(30, 144, 255, 0.5), rgba(30, 144, 255, 0));
}

.unit {
  margin-left: 8px;
  color: #91a7cc;
  font-size: 14px;
  align-self: flex-end;
  padding-bottom: 8px;
}

.device-types {
  display: flex;
  justify-content: space-around;
  padding: 10px 5px;
}

.type-item {
  text-align: center;
  position: relative;
}

.type-circle {
  width: 70px;
  height: 70px;
  position: relative;
  margin: 0 auto 5px;
}

.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 149, 255, 0.8);
  border-radius: 50%;
  animation: ripple 3s cubic-bezier(0.1, 0.85, 0.5, 1) infinite;
}

.ripple:nth-child(1) {
  animation-delay: 0s;
}

.ripple:nth-child(2) {
  animation-delay: 0.3s;
}

.ripple:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
  }

  100% {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}

.circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at center,
      rgba(0, 149, 255, 0.3) 0%,
      rgba(0, 149, 255, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 149, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 149, 255, 0.3);
  z-index: 1;
}

.circle-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle at center,
      rgba(0, 149, 255, 0.2) 0%,
      transparent 70%);
  z-index: -1;
}

.number {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 2px;
}

.unit {
  color: #ffffff;
  font-size: 12px;
  opacity: 0.8;
}

.type-name {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 8px;
}

/* 报警信息模块样式 */
.alarm-info {
  grid-column: 2;
  grid-row: 3;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.date-filter {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center;
  margin-bottom: 10px;
  font-size: 11px;
}

.date-filter-left {
  display: flex;
  align-items: center; /* 垂直居中 */
}

.date-btn {
  padding: 3px 8px;
  background-color: rgba(0, 15, 30, 0.7);
  color: #91a7cc;
  margin-right: 6px;
  cursor: pointer;
  border: 1px solid rgba(30, 80, 150, 0.5);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.date-btn:hover {
  background-color: rgba(30, 144, 255, 0.2);
}

.date-btn.active {
  background-color: #1e90ff;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(30, 144, 255, 0.5);
}

.date-range {
  margin-left: 2px;
  color: #91a7cc;
  background-color: rgba(0, 15, 30, 0.7);
  padding: 3px 8px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  border-radius: 2px;
}

.date-filter-right {
  display: flex;
  align-items: center;
}

.chart-tabs {
  display: flex;
}

.trend-chart {
  background-color: rgba(0, 15, 30, 0.4);
  margin-bottom: 5px;
  padding: 10px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.trend-total {
  display: flex;
  align-items: center;
}

.trend-total .label {
  color: #91a7cc;
  font-size: 12px;
  margin-right: 8px;
}

.trend-total .value {
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
}

.trend-time-selector {
  display: flex;
  align-items: center;
}

.time-selector-label {
  color: #91a7cc;
  font-size: 12px;
  margin-right: 8px;
}

.selector-dropdown {
  background-color: rgba(0, 15, 30, 0.7);
  color: #91a7cc;
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.selector-dropdown i {
  margin-left: 4px;
  font-size: 10px;
}

.chart-tabs {
  display: flex;
  
}

.tab {
  padding: 4px 10px;
  background-color: rgba(0, 15, 30, 0.7);
  color: #91a7cc;
  margin-right: 8px;
  cursor: pointer;
  font-size: 11px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  border-radius: 2px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.tab i {
  margin-right: 4px;
  font-size: 12px;
}

.tab:hover {
  background-color: rgba(30, 144, 255, 0.2);
}

.tab.active {
  background-color: #1e90ff;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(30, 144, 255, 0.5);
}

/* 数据点悬停效果 */
.data-points circle {
  transition: r 0.2s ease;
  cursor: pointer;
}

.data-points circle:hover {
  r: 5;
  fill: #1e90ff;
}

/* 报警转发模块样式 */
.alarm-forwarding {
  grid-column: 3;
  grid-row: 3;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.alarm-forwarding .card-content {
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-title {
  color: #91a7cc;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.chart-actions {
  display: flex;
}

.chart-action-btn {
  background-color: rgba(0, 15, 30, 0.7);
  color: #91a7cc;
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  border-radius: 2px;
  display: flex;
  align-items: center;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-action-btn:hover {
  background-color: rgba(30, 144, 255, 0.2);
  color: #ffffff;
}

.chart-action-btn i {
  margin-right: 4px;
  font-size: 12px;
}

.bar-chart {
  flex: 1;
  background-color: rgba(0, 15, 30, 0.4);
  padding: 10px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  overflow: hidden;
  height: auto;
}

.bars rect {
  transition: height 0.5s ease, y 0.5s ease;
  cursor: pointer;
  filter: drop-shadow(0px 0px 3px rgba(30, 144, 255, 0.3));
}

.bars rect:hover {
  filter: drop-shadow(0px 0px 8px rgba(30, 144, 255, 0.6));
}

.chart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 11px;
}

.chart-hint {
  display: flex;
  align-items: center;
  color: #91a7cc;
}

.chart-hint i {
  margin-right: 4px;
  color: #3a9eff;
}

.chart-pagination {
  display: flex;
  align-items: center;
  color: #91a7cc;
}

.chart-pagination i {
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  transition: all 0.2s ease;
}

.chart-pagination i:hover {
  color: #ffffff;
}

.chart-pagination span {
  margin: 0 8px;
}

/* 响应式设计 */
@media (max-width: 1440px) {
  .dashboard-container {
    grid-gap: 8px;
  }

  .chart-circle {
    width: 60px;
    height: 60px;
  }

  .chart-inner {
    width: 40px;
    height: 40px;
  }

  .digit {
    width: 18px;
    height: 25px;
    font-size: 16px;
  }

  .type-circle {
    width: 50px;
    height: 50px;
  }

  .type-circle::before {
    width: 35px;
    height: 35px;
  }

  .indicator-value {
    font-size: 14px;
  }

  .digital-number {
    font-size: 22px;
  }
}

/* 底部面板公共样式 */
.alarm-info,
.alarm-forwarding,
.device-statistics {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.alarm-info .card-content,
.alarm-forwarding .card-content,
.device-statistics .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 5px 10px;
}

.trend-chart {
  background-color: rgba(0, 15, 30, 0.4);
  margin-bottom: 5px;
  padding: 5px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-tabs {
  flex: 0 0 auto;
  margin-top: 5px;
}

.date-filter {
  flex: 0 0 auto;
  margin-bottom: 5px;
}

.bar-chart {
  flex: 1;
  background-color: rgba(0, 15, 30, 0.4);
  padding: 5px;
  border: 1px solid rgba(30, 80, 150, 0.5);
  overflow: hidden;
}

.device-total {
  flex: 0 0 auto;
  text-align: center;
  margin-bottom: 5px;
}

.device-types {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* 响应式设计 */
@media (max-height: 800px) {
  .main-title {
    padding: 5px 0;
    font-size: 20px;
  }

  .dashboard-container {
    grid-gap: 5px;
    padding: 5px;
  }

  .card-header {
    padding: 4px 10px;
  }

  .card-content {
    padding: 4px 8px;
    height: calc(100% - 32px);
  }

  .chart-circle {
    width: 45px;
    height: 45px;
  }

  .chart-inner {
    width: 32px;
    height: 32px;
  }

  .chart-value {
    font-size: 12px;
  }

  .chart-label {
    font-size: 8px;
  }

  .chart-title {
    font-size: 10px;
  }
}

/* 添加底部投影 */
.floating-cube::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 10px;
  background: radial-gradient(ellipse at center, rgba(43, 189, 255, 0.5) 0%, rgba(43, 189, 255, 0) 70%);
  bottom: -40px;
  left: 0;
  transform: rotateX(90deg) scale(1.2, 1);
  opacity: 0.5;
  animation: shadowPulse 6s ease-in-out infinite;
}

@keyframes shadowPulse {
  0% {
    opacity: 0.3;
    transform: rotateX(90deg) scale(1.2, 1);
  }

  50% {
    opacity: 0.5;
    transform: rotateX(90deg) scale(1.3, 1);
  }

  100% {
    opacity: 0.3;
    transform: rotateX(90deg) scale(1.2, 1);
  }
}

/* 设置停止算法的橙色样式 */
.data-tag.stopped-algo .tag-content {
  border-color: #ff9933;
  box-shadow: 0 0 10px rgba(255, 153, 51, 0.4);
}

.data-tag.stopped-algo .tag-content::before {
  background: linear-gradient(90deg,
      rgba(255, 153, 51, 0.05) 0%,
      rgba(255, 153, 51, 0.1) 10%,
      rgba(255, 153, 51, 0.05) 20%,
      rgba(255, 153, 51, 0.05) 30%,
      rgba(255, 153, 51, 0.1) 40%,
      rgba(255, 153, 51, 0.05) 50%,
      rgba(255, 153, 51, 0.05) 60%,
      rgba(255, 153, 51, 0.1) 70%,
      rgba(255, 153, 51, 0.05) 80%,
      rgba(255, 153, 51, 0.1) 90%,
      rgba(255, 153, 51, 0.05) 100%);
}

.data-tag.stopped-algo .tag-content::after {
  background: linear-gradient(90deg, rgba(255, 153, 51, 0), rgba(255, 153, 51, 0.2));
}

.chart-bubble.cpu .chart-progress {
  background: conic-gradient(#3eaef9 var(--progress), transparent 0);
}

.chart-bubble.disk .chart-progress {
  background: conic-gradient(#ff9c38 var(--progress), transparent 0);
}

.chart-bubble.memory .chart-progress {
  background: conic-gradient(#29de9c var(--progress), transparent 0);
}

.chart-bubble.gpu .chart-progress {
  background: conic-gradient(#ff5a5a var(--progress), transparent 0);
}

/* 科技感光效果 */
.chart-container::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05) 20%,
      rgba(255, 255, 255, 0) 30%);
  z-index: 4;
  pointer-events: none;
}

.chart-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  box-shadow:
    inset 0 0 20px rgba(255, 255, 255, 0.05),
    0 0 15px rgba(255, 255, 255, 0.1);
  z-index: 5;
  pointer-events: none;
}

/* 添加扫光动画 */
@keyframes scanlight {
  0% {
    transform: translateX(-100%) rotate(45deg);
    opacity: 0;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    transform: translateX(200%) rotate(45deg);
    opacity: 0;
  }
}

.chart-container {
  position: relative;
  overflow: hidden;
}

.chart-container::before {
  animation: scanlight 4s linear infinite;
}

.threejs-container {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.central-cube-container {
  width: 70%;
  height: 380px;
  /* 减小高度 */
  margin: 0 auto;
  margin-bottom: 0;
  /* 确保底部没有边距 */
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* 内容靠下对齐 */
}

.platform-structure-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: radial-gradient(circle at center, rgba(30, 80, 150, 0.2), transparent 70%);
  z-index: 0;
}



.pie-chart-container {
  flex: 1;
  position: relative;
  margin: 5px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 15, 30, 0.3);
  border-radius: 4px;
  border: 1px solid rgba(30, 80, 150, 0.3);
  overflow: hidden;
}

.pie-chart-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(30, 144, 255, 0.1), transparent 70%);
  pointer-events: none;
  animation: pulse 4s infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.7;
  }
}

.alarm-pie-chart {
  max-height: 200px;
  position: relative;
  z-index: 1;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  padding: 5px;
  background-color: rgba(0, 15, 30, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(30, 80, 150, 0.3);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 11px;
  transition: all 0.3s ease;
  padding: 3px 5px;
  border-radius: 2px;
}

.legend-item:hover {
  background-color: rgba(30, 144, 255, 0.1);
  transform: translateX(2px);
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 8px;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.legend-text {
  flex: 1;
  color: #91a7cc;
}

.legend-value {
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(30, 144, 255, 0.5);
}

.time-selector {
  color: #91a7cc;
  font-size: 11px;
}

/* 响应式调整 */
@media (max-width: 1366px) {
  .pie-chart-container {
    margin: 3px 0;
  }

  .legend-item {
    margin-bottom: 3px;
    font-size: 10px;
  }

  .legend-color {
    width: 8px;
    height: 8px;
    margin-right: 5px;
  }
}

/* 饼图提示框样式 */
.pie-tooltip {
  position: absolute;
  background-color: rgba(0, 15, 30, 0.9);
  border: 1px solid rgba(30, 80, 150, 0.8);
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  color: #ffffff;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 0 10px rgba(30, 144, 255, 0.3);
}

.pie-tooltip div:first-child {
  font-weight: bold;
  margin-bottom: 4px;
}

/* 饼图区域动画效果 */
.pie-segment {
  transition: all 0.3s ease;
}

.pie-segment:hover {
  filter: brightness(1.2);
}

/* 脉冲动画 */
.pulse-circle {
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% {
    opacity: 0.8;
    stroke-width: 1;
  }

  50% {
    opacity: 0.3;
    stroke-width: 2;
  }

  100% {
    opacity: 0.8;
    stroke-width: 1;
  }
}
</style>

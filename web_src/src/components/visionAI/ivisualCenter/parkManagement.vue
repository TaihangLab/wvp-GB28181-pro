<template>
  <div class="park-management">
    <!-- 标题区域 -->
    <dv-border-box-12 class="header-box">
      <div class="header-wrapper">
        <!-- 左侧装饰 -->
        <div class="left-decoration">
          <dv-decoration-5 style="width:250px;height:60px;" />
          <div class="decoration-line-group">
            <div class="decoration-line line1"></div>
            <div class="decoration-line line2"></div>
            <div class="decoration-line line3"></div>
          </div>
        </div>

        <!-- 中间标题 -->
        <div class="title-container">
          <dv-decoration-8 style="width:300px;height:50px;" :reverse="true" />
          <div class="title-wrapper">
            <dv-decoration-6 style="width:200px;height:50px;" />
            <div class="title-text">施工养护综合数据</div>
            <dv-decoration-6 style="width:200px;height:50px;" :reverse="true" />
          </div>
          <dv-decoration-8 style="width:300px;height:50px;" />
        </div>

        <!-- 右侧装饰 -->
        <div class="right-decoration">
          <dv-decoration-5 style="width:250px;height:60px;" :reverse="true" />
          <div class="decoration-line-group">
            <div class="decoration-line line1"></div>
            <div class="decoration-line line2"></div>
            <div class="decoration-line line3"></div>
          </div>
        </div>
      </div>
    </dv-border-box-12>

    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 设备树状图 -->
        <dv-border-box-12 class="panel device-panel">
          <div class="panel-header">
            <span>设备树状图</span>
            <div class="watermark">TSINGSEE</div>
          </div>
          <div class="device-tree">
            <el-tree
              :data="treeData"
              :props="defaultProps"
              node-key="id"
              :default-expanded-keys="['1']"
              class="custom-tree">
            </el-tree>
          </div>
        </dv-border-box-12>
        
        <!-- CPU使用率 -->
        <dv-border-box-12 class="panel cpu-panel">
          <div class="panel-header">
            <span>内存/CPU</span>
            <div class="watermark">TSINGSEE</div>
          </div>
          <dv-charts :option="cpuOption" />
        </dv-border-box-12>
        
        <!-- 存储使用 -->
        <dv-border-box-12 class="panel storage-panel">
          <div class="panel-header">
            <span>存储使用</span>
            <div class="watermark">TSINGSEE</div>
          </div>
          <dv-charts :option="storageOption" />
        </dv-border-box-12>
      </div>

      <!-- 中间视频区域 -->
      <div class="center-panel">
        <dv-border-box-12 class="video-container">
          <div class="panel-header">
            <span>实时画面</span>
            <div class="screen-controls">
              <span>分屏：</span>
              <i class="el-icon-menu active"></i>
              <i class="el-icon-s-grid"></i>
            </div>
            <div class="watermark">TSINGSEE</div>
          </div>
          <div class="video-grid">
            <div v-for="i in 4" :key="i" class="video-item">
              <dv-border-box-8>
                <div class="video-content">
                  <img :src="getRandomImage(i)" alt="监控画面">
                  <div class="video-info">
                    <span>2023年04月14日 星期五 17:23</span>
                  </div>
                </div>
              </dv-border-box-8>
            </div>
          </div>
        </dv-border-box-12>
      </div>

      <!-- 右侧预警区域 -->
      <div class="right-panel">
        <dv-border-box-12 class="panel alert-panel">
          <div class="panel-header">
            <span>预警抓拍</span>
            <div class="watermark">TSINGSEE</div>
          </div>
          <div class="alert-list">
            <div v-for="i in 4" :key="i" class="alert-item">
              <img :src="getRandomImage(i)" alt="预警图片">
              <div class="alert-info">
                <p>抓拍时间: 2023-04-14 17:23:12</p>
                <p>布点名称: {{i}}号探头</p>
              </div>
            </div>
          </div>
        </dv-border-box-12>
      </div>
    </div>

    <!-- 底部状态区域 -->
    <div class="bottom-panel">
      <!-- 设备状态 -->
      <dv-border-box-12 class="panel status-panel">
        <div class="panel-header">
          <span>设备状态</span>
          <div class="watermark">TSINGSEE</div>
        </div>
        <div class="status-content">
          <div class="status-item">
            <dv-active-ring-chart :config="deviceStatusConfig1" />
            <div class="status-text">
              <p>在线数: 27</p>
              <p>离线数: 3</p>
            </div>
          </div>
          <div class="status-item">
            <dv-active-ring-chart :config="deviceStatusConfig2" />
            <div class="status-text">
              <p>在线: 18</p>
              <p>离线: 9</p>
            </div>
          </div>
        </div>
      </dv-border-box-12>

      <!-- 带宽使用 -->
      <dv-border-box-12 class="panel bandwidth-panel">
        <div class="panel-header">
          <span>带宽使用(Mbps)</span>
          <div class="watermark">TSINGSEE</div>
        </div>
        <dv-charts :option="bandwidthOption" />
      </dv-border-box-12>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParkManagement',
  components: {
    // 暂时注释掉data-view组件，使项目能够正常运行
    // 这些组件仅在可视化中心功能中使用，不影响系统管理功能
    /* 
    dvBorderBox8,
    dvBorderBox12,
    dvBorderBox13,
    dvDecoration5,
    dvDecoration8,
    dvDecoration6,
    dvDecoration10,
    dvActiveRingChart,
    dvCharts
    */
  },
  data() {
    return {
      treeData: [{
        id: '1',
        label: '市直单位',
        children: [{
          id: '2',
          label: '清江园区',
          children: [{
            id: '3',
            label: '清江园区-南',
            children: [{
              id: '4',
              label: '监控点1号探头'
            }, {
              id: '5',
              label: '监控点2号探头'
            }]
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      cpuOption: {
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['17:23:05', '17:23:10', '17:23:15', '17:23:20'],
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            style: {
              stroke: 'rgba(27,150,255,0.1)'
            }
          },
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        series: [{
          type: 'line',
          data: [65, 59, 80, 81],
          smooth: true,
          lineStyle: {
            stroke: '#1B96FF',
            width: 2
          },
          areaStyle: {
            fill: 'rgba(27,150,255,0.3)'
          }
        }]
      },
      storageOption: {
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['内存1', '内存2', '内存3', '内存4', '内存5', '内存6', '内存7'],
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            style: {
              stroke: 'rgba(27,150,255,0.1)'
            }
          },
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        series: [{
          type: 'bar',
          data: [60, 40, 20, 70, 30, 50, 10],
          barWidth: 20,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                {offset: 0, color: 'rgba(27,150,255,0.8)'},
                {offset: 1, color: 'rgba(27,150,255,0.3)'}
              ]
            }
          }
        }]
      },
      bandwidthOption: {
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '10%',
          containLabel: true
        },
        legend: {
          data: ['上行带宽', '下行带宽'],
          textStyle: {
            fill: '#fff'
          },
          right: 0,
          top: 0
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['17:23:05', '17:23:10', '17:23:15', '17:23:20', '17:23:25', '17:23:30'],
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            style: {
              stroke: 'rgba(27,150,255,0.1)'
            }
          },
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        series: [{
          name: '上行带宽',
          type: 'line',
          data: [2.39687, 2.39687, 2.39687, 2.39687, 2.39687, 2.39687],
          smooth: true,
          lineStyle: {
            stroke: '#1B96FF'
          }
        }, {
          name: '下行带宽',
          type: 'line',
          data: [2.39687, 2.39687, 2.39687, 2.39687, 2.39687, 2.39687],
          smooth: true,
          lineStyle: {
            stroke: '#FFD700'
          }
        }]
      },
      deviceStatusConfig1: {
        data: [
          {name: '在线', value: 27},
          {name: '离线', value: 3}
        ],
        color: ['#1B96FF', 'rgba(27,150,255,0.2)'],
        radius: '80%',
        activeRadius: '85%'
      },
      deviceStatusConfig2: {
        data: [
          {name: '在线', value: 18},
          {name: '离线', value: 9}
        ],
        color: ['#1B96FF', 'rgba(27,150,255,0.2)'],
        radius: '80%',
        activeRadius: '85%'
      }
    }
  },
  methods: {
    getRandomImage(index) {
      // 这里应该返回实际的监控画面或预警图片
      return `https://picsum.photos/400/300?random=${index}`
    }
  }
}
</script>

<style scoped>
.park-management {
  width: 100%;
  height: 100vh;
  background-color: #000B2A;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-box {
  width: 100%;
  height: 80px;
  margin: 0;
  background: linear-gradient(180deg, rgba(1,19,56,0.8) 0%, rgba(1,19,56,0.6) 100%);
}

.header-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.left-decoration,
.right-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 300px;
}

.decoration-line-group {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.decoration-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(180deg, rgba(51,255,255,0.8) 0%, rgba(51,255,255,0) 100%);
  position: relative;
}

.decoration-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #33ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(51,255,255,0.8);
}

.decoration-line.line1 {
  height: 40px;
}

.decoration-line.line2 {
  height: 25px;
  margin-top: 15px;
}

.decoration-line.line3 {
  height: 15px;
  margin-top: 25px;
}

.right-decoration .decoration-line-group {
  transform: scaleX(-1);
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(51,255,255,0.5);
  letter-spacing: 4px;
  position: relative;
  padding: 0 20px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.center-panel {
  flex: 1;
}

.right-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel {
  background: #001135;
  border: 1px solid #0a2550;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background: linear-gradient(90deg, #001135 0%, rgba(0,17,53,0.8) 100%);
  border-bottom: 1px solid #0a2550;
  font-size: 14px;
}

.panel-header::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1B96FF;
  position: absolute;
  left: 0;
  margin-left: -15px;
}

.device-panel {
  height: 40%;
}

.cpu-panel {
  height: 30%;
}

.storage-panel {
  height: 30%;
}

.device-tree {
  padding: 10px;
  height: calc(100% - 36px);
  overflow: auto;
}

.video-container {
  height: 100%;
  background: #001135;
  border: 1px solid #0a2550;
  border-radius: 4px;
  overflow: hidden;
}

.video-grid {
  height: calc(100% - 36px);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
  background: #001135;
}

.video-item {
  position: relative;
  background: #000;
  border: 1px solid #0a2550;
  border-radius: 2px;
  overflow: hidden;
}

.video-content {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.video-content img {
  flex: 1;
  width: 100%;
  object-fit: cover;
}

.video-info {
  height: 30px;
  line-height: 30px;
  background: rgba(0,17,53,0.9);
  padding: 0 10px;
  font-size: 12px;
  color: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.alert-list {
  height: calc(100% - 36px);
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  background: #001135;
  border: 1px solid #0a2550;
  border-radius: 4px;
  overflow: hidden;
}

.alert-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.alert-info {
  padding: 10px;
  font-size: 12px;
  background: rgba(0,17,53,0.9);
}

.alert-info p {
  margin: 5px 0;
  color: #7a8baa;
}

.screen-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.screen-controls span {
  font-size: 12px;
  color: #7a8baa;
}

.screen-controls i {
  cursor: pointer;
  font-size: 16px;
  color: #7a8baa;
  transition: color 0.3s;
}

.screen-controls i.active {
  color: #1B96FF;
}

.watermark {
  font-size: 12px;
  color: #7a8baa;
  opacity: 0.5;
}

/* 树形控件样式覆盖 */
.custom-tree {
  background: transparent;
  color: #fff;
  font-size: 12px;
}

.custom-tree >>> .el-tree-node__content {
  background: transparent;
  color: #7a8baa;
  height: 32px;
  border-bottom: 1px solid rgba(10,37,80,0.5);
}

.custom-tree >>> .el-tree-node__content:hover {
  background: rgba(27,150,255,0.1);
  color: #fff;
}

.custom-tree >>> .el-tree-node__expand-icon {
  color: #7a8baa;
}

.custom-tree >>> .el-tree-node__expand-icon.expanded {
  transform: rotate(90deg);
}

.custom-tree >>> .el-tree-node__expand-icon.is-leaf {
  color: transparent;
}

.chart-wrapper {
  height: calc(100% - 36px);
  padding: 10px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: #001135;
}

::-webkit-scrollbar-thumb {
  background: #0a2550;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1B96FF;
}

/* 底部面板样式 */
.bottom-panel {
  height: 200px;
  display: flex;
  gap: 10px;
}

.status-panel {
  width: 400px;
}

.bandwidth-panel {
  flex: 1;
}

.status-content {
  height: calc(100% - 36px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
}

.status-item {
  text-align: center;
}

.status-text {
  margin-top: 10px;
  font-size: 12px;
  color: #7a8baa;
}

.status-text p {
  margin: 5px 0;
}
</style> 
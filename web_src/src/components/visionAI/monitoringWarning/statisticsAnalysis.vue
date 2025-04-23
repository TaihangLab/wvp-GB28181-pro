<script>
import * as echarts from 'echarts'

export default {
  name: "StatisticsAnalysis",
  data() {
    return {
      // 页面数据
      statisticsData: {
        totalCount: 10,
        successRate: 81.36,
        warningCount: 13,
        processedCount: 8
      },
      
      // 时间筛选相关
      timeRange: 'today',
      customDateRange: [],
      
      // 导出对话框
      exportDialogVisible: false,
      exportLoading: false,
      exportFormat: 'excel',
      
      // 图表实例
      charts: {
        trendChart: null,
        warningStatusChart: null,
        warningLevelChart: null,
        topWarningTypeChart: null
      },
      
      // 设备预警数量TOP10
      deviceWarnings: [
        { name: '中控测试摄像头01', count: 42, percent: 26 },
        { name: '门禁监控设备A32', count: 38, percent: 23 },
        { name: '仓库角落摄像头B12', count: 31, percent: 19 },
        { name: '办公室入口监控', count: 24, percent: 15 },
        { name: '停车场监控C区', count: 18, percent: 11 },
        { name: '后门通道摄像头', count: 15, percent: 9 },
        { name: '前台监控设备', count: 12, percent: 7 },
        { name: '会议室摄像头', count: 9, percent: 5 },
        { name: '电梯监控', count: 7, percent: 4 },
        { name: '楼梯间摄像头', count: 5, percent: 3 }
      ],
      
      // 时间范围
      deviceTimeRange: 'day',
      
      // 刷新状态
      refreshing: false
    }
  },
  mounted() {
    this.initCharts();
    window.addEventListener('resize', this.handleResize);
    
    // 初始化CSS变量 - 设置适当的面板高度
    document.documentElement.style.setProperty('--panel-top-height', '380px');
    document.documentElement.style.setProperty('--panel-bottom-height', '350px');
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.disposeCharts();
  },
  methods: {
    // 初始化所有图表
    initCharts() {
      this.$nextTick(() => {
        this.initTrendChart();
        this.initWarningStatusChart();
        this.initWarningLevelChart();
        this.initTopWarningTypeChart();
      });
    },
    
    // 销毁所有图表实例
    disposeCharts() {
      Object.keys(this.charts).forEach(key => {
        if (this.charts[key]) {
          this.charts[key].dispose();
          this.charts[key] = null;
        }
      });
    },
    
    // 窗口大小变化时重新调整图表
    handleResize() {
      Object.keys(this.charts).forEach(key => {
        if (this.charts[key]) {
          this.charts[key].resize();
        }
      });
    },
    
    // 初始化预警趋势图
    initTrendChart() {
      const trendChart = document.getElementById('trendChart');
      if (!trendChart) return;
      
      this.charts.trendChart = echarts.init(trendChart);
      const { xData, yData } = this.generateTimeData(this.timeRange);
      
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
          data: xData,
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#7EAEE5',
            rotate: this.timeRange === 'month' ? 45 : 0,
            interval: this.timeRange === 'month' ? 'auto' : 0
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
          name: '预警数量',
          nameTextStyle: {
            color: '#7EAEE5'
          },
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
        series: [{
          name: '预警数量',
          data: yData,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
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
        }]
      };
      
      this.charts.trendChart.setOption(option);
    },
    
    // 生成不同时间维度的数据
    generateTimeData(timeType) {
      const now = new Date();
      
      switch (timeType) {
        case 'today':
          // 生成24小时的数据
          return {
            xData: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
            yData: [40, 38, 10, 19, 5, 3, 20, 15, 30, 12, 7, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          };
          
        case 'week':
          // 生成最近7天的数据
          return {
            xData: Array.from({ length: 7 }, (_, i) => {
              const date = new Date(now);
              date.setDate(date.getDate() - (6 - i));
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
            yData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50))
          };
          
        case 'month':
          // 生成当月每天的数据
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          return {
            xData: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`),
            yData: Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 50))
          };
          
        case 'year':
          // 生成12个月的数据
          return {
            xData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            yData: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50))
          };
          
        default:
          return {
            xData: [],
            yData: []
          };
      }
    },
    
    // 初始化预警状态图表
    initWarningStatusChart() {
      const warningStatusChart = document.getElementById('warningStatusChart');
      if (!warningStatusChart) return;
      
      this.charts.warningStatusChart = echarts.init(warningStatusChart);
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
        legend: {
          orient: 'vertical',
          right: '0%',
          top: 'center',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#7EAEE5'
          },
          formatter: (name) => {
            const data = option.series[0].data;
            const item = data.find(i => i.name === name);
            return `${name} ${item.value}% ${item.count}次`;
          }
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['30%', '50%'],
          label: {
            show: false
          },
          data: [
            { value: 45, name: '待处理', count: 26, itemStyle: { color: '#FF8746' } },
            { value: 28, name: '处理中', count: 16, itemStyle: { color: '#44FF9B' } },
            { value: 18, name: '已完成', count: 10, itemStyle: { color: '#00FFFF' } },
            { value: 9, name: '已忽略', count: 5, itemStyle: { color: '#ee6666' } }
          ]
        }]
      };
      this.charts.warningStatusChart.setOption(option);
    },
    
    // 初始化预警等级图表
    initWarningLevelChart() {
      const warningLevelChart = document.getElementById('warningLevelChart');
      if (!warningLevelChart) return;
      
      this.charts.warningLevelChart = echarts.init(warningLevelChart);
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
        legend: {
          orient: 'vertical',
          right: '0%',
          top: 'center',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#7EAEE5'
          },
          formatter: (name) => {
            const data = option.series[0].data;
            const item = data.find(i => i.name === name);
            return `${name} ${item.value}% ${item.count}次`;
          }
        },
        series: [{
          type: 'pie',
          radius: '60%',
          center: ['30%', '50%'],
          label: {
            show: false
          },
          data: [
            { value: 40, name: '四级预警', count: 23, itemStyle: { color: '#00C5FF' } },
            { value: 32, name: '三级预警', count: 18, itemStyle: { color: '#44FF9B' } },
            { value: 18, name: '二级预警', count: 10, itemStyle: { color: '#FF8746' } },
            { value: 10, name: '一级预警', count: 6, itemStyle: { color: '#FF4D4F' } }
          ]
        }]
      };
      this.charts.warningLevelChart.setOption(option);
    },
    
    // 初始化TOP预警类型图表
    initTopWarningTypeChart() {
      const topWarningTypeChart = document.getElementById('topWarningTypeChart');
      if (!topWarningTypeChart) return;
      
      this.charts.topWarningTypeChart = echarts.init(topWarningTypeChart);
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(0, 19, 40, 0.8)',
          borderColor: 'rgba(0, 255, 255, 0.3)',
          textStyle: {
            color: '#00FFFF'
          }
        },
        legend: {
          data: ['预警数', '已完成'],
          top: 0,
          right: 0,
          textStyle: {
            color: '#7EAEE5'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '40px',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisTick: {
            show: false
          },
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
        yAxis: {
          type: 'category',
          data: ['车辆识别', '烟火', '人员异常', '室内人群聚集', '人员闯入'],
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 255, 255, 0.3)'
            }
          },
          axisLabel: {
            color: '#7EAEE5'
          }
        },
        series: [
          {
            name: '预警数',
            type: 'bar',
            stack: 'total',
            data: [35, 28, 22, 15, 8],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#00FFFF' },
                { offset: 1, color: '#207FFF' }
              ])
            },
            barWidth: '60%'
          },
          {
            name: '已完成',
            type: 'bar',
            stack: 'total',
            data: [15, 12, 8, 5, 3],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#44FF9B' },
                { offset: 1, color: '#00C5FF' }
              ])
            }
          }
        ]
      };
      this.charts.topWarningTypeChart.setOption(option);
    },
    
    // 更新趋势图配置
    updateTrendChart(timeType) {
      if (!this.charts.trendChart) return;
      
      const { xData, yData } = this.generateTimeData(timeType);
      
      const option = {
        xAxis: { data: xData },
        series: [{ data: yData }]
      };
      
      this.charts.trendChart.setOption(option);
    },
    
    // 处理时间范围变化
    handleTimeRangeChange(value) {
      this.timeRange = value;
      if (value !== 'custom') {
        this.updateTrendChart(value);
        this.refreshData();
      }
    },
    
    // 刷新数据
    refreshData() {
      if (this.refreshing) return;
      
      this.refreshing = true;
      const loadingInstance = this.$loading({
        lock: true,
        text: '正在刷新数据...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 模拟数据刷新
      setTimeout(() => {
        // 更新统计数据
        this.statisticsData = {
          totalCount: Math.floor(Math.random() * 30) + 30,
          successRate: (Math.random() * 20 + 70).toFixed(2),
          processedCount: Math.floor(Math.random() * 20) + 5
        };
        
        // 更新图表数据
        this.updateTrendChart(this.timeRange);
        this.initWarningStatusChart();
        this.initWarningLevelChart();
        this.initTopWarningTypeChart();
        
        // 更新设备数据
        this.deviceWarnings = this.deviceWarnings.map(device => {
          const count = Math.floor(Math.random() * 40) + 5;
          return {
            ...device,
            count,
            percent: Math.floor((count / 50) * 100)
          };
        }).sort((a, b) => b.count - a.count);
        
        loadingInstance.close();
        this.refreshing = false;
        this.$message.success('数据刷新成功');
      }, 1500);
    },
    
    // 导出数据
    exportData() {
      this.exportLoading = true;
      
      // 准备要导出的数据
      const headers = ['设备名称', '预警数量', '百分比'];
      const data = this.deviceWarnings.map(device => [
        device.name,
        device.count,
        device.percent + '%'
      ]);
      
      // 生成CSV内容
      let csvContent = headers.join(',') + '\n';
      data.forEach(row => {
        csvContent += row.join(',') + '\n';
      });
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // 设置下载属性
      const timestamp = new Date().getTime();
      const fileName = `预警统计数据_${timestamp}.csv`;
      
      // 设置下载属性并触发下载
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 完成下载后的处理
      this.exportLoading = false;
      this.$message({
        message: `数据已成功导出为: ${fileName}`,
        type: 'success'
      });
    },
    
    // 关闭导出对话框 - 可以保留但不再使用
    handleCloseExportDialog() {
      this.exportDialogVisible = false;
      this.exportLoading = false;
    },
    
    // 获取总预警数
    getTotalWarnings() {
      return this.statisticsData.totalCount;
    }
  }
}
</script>

<template>
  <div class="visual-statistics">
    <!-- 顶部标题栏和时间选择器 -->
    <div class="header-bar">
      <div class="time-filter">
        <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
          <el-radio-button label="today">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="year">年</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="page-title">
        <span>太行视觉AI预警统计分析</span>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" size="small" icon="el-icon-download" @click="exportData">导出</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>
    
    <!-- 顶部统计数据卡片 -->
    <div class="statistics-header">
      <div class="stat-card">
        <div class="stat-icon alert-icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="stat-info">
          <div class="stat-title">预警总数</div>
          <div class="stat-value">{{ statisticsData.totalCount }}<span class="unit">个</span></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate-icon">
          <i class="el-icon-data-analysis"></i>
        </div>
        <div class="stat-info">
          <div class="stat-title">预警准确率</div>
          <div class="stat-value">{{ statisticsData.successRate }}<span class="unit">%</span></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon process-icon">
          <i class="el-icon-finished"></i>
        </div>
        <div class="stat-info">
          <div class="stat-title">已处理预警数</div>
          <div class="stat-value">{{ statisticsData.processedCount }}<span class="unit">个</span></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending-icon">
          <i class="el-icon-bell"></i>
        </div>
        <div class="stat-info">
          <div class="stat-title">未处理预警数</div>
          <div class="stat-value">{{ statisticsData.totalCount - statisticsData.processedCount }}<span class="unit">个</span></div>
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <!-- 上方面板：预警趋势和预警类型TOP5 -->
      <el-row :gutter="20">
        <!-- 左侧 - 预警趋势图表 -->
        <el-col :span="12">
          <div class="panel-box panel-equal-height">
            <div class="panel-title">预警趋势</div>
            <div id="trendChart" class="trend-chart"></div>
          </div>
        </el-col>
        
        <!-- 右侧 - 预警类型TOP5 -->
        <el-col :span="12">
          <div class="panel-box panel-equal-height">
            <div class="panel-title">预警类型TOP5</div>
            <div id="topWarningTypeChart" class="top-chart"></div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 下方面板：预警状态、预警等级和设备预警数量TOP10 -->
      <el-row :gutter="20" class="bottom-section">
        <!-- 左侧 - 预警状态饼图 -->
        <el-col :span="8">
          <div class="panel-box panel-bottom-equal-height">
            <div class="panel-title">预警状态</div>
            <div id="warningStatusChart" class="status-chart"></div>
          </div>
        </el-col>
        
        <!-- 中间 - 预警等级饼图 -->
        <el-col :span="8">
          <div class="panel-box panel-bottom-equal-height">
            <div class="panel-title">预警等级</div>
            <div id="warningLevelChart" class="level-chart"></div>
          </div>
        </el-col>
        
        <!-- 右侧 - 设备预警数量TOP10 -->
        <el-col :span="8">
          <div class="panel-box panel-bottom-equal-height">
            <div class="panel-title">设备预警数量TOP10</div>
            <div class="device-tabs">
              <div 
                v-for="(label, key) in { day: '本日', week: '本周', month: '本月' }" 
                :key="key"
                :class="['tab-item', { active: deviceTimeRange === key }]"
                @click="deviceTimeRange = key"
              >
                {{ label }}
              </div>
            </div>
            <div class="device-top-list">
              <div v-for="(device, index) in deviceWarnings" :key="index" class="device-item">
                <span class="device-rank">{{ index + 1 }}</span>
                <span class="device-name">{{ device.name }}</span>
                <div class="device-progress">
                  <div class="progress-bar" :style="{ width: device.percent + '%' }"></div>
                </div>
                <span class="device-count">{{ device.count }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
:root {
  --panel-top-height: 380px;
  --panel-bottom-height: 350px;
}

.visual-statistics {
  min-height: 100vh;
  background: linear-gradient(135deg, #001529 0%, #000B18 100%);
  color: #fff;
  padding: 16px;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
  overflow-x: hidden;
}

/* 顶部标题栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #001529;
  padding: 12px 20px;
  position: relative;
  border-bottom: 1px solid #002140;
  margin-bottom: 20px;
}

.page-title {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
}

.page-title span {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  position: relative;
  padding: 0 10px;
}

.page-title span::before,
.page-title span::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0) 0%, #00ffff 50%, rgba(0, 255, 255, 0) 100%);
  transform: translateY(-50%);
}

.page-title span::before {
  right: 100%;
}

.page-title span::after {
  left: 100%;
}

/* 时间筛选器和操作按钮 */
.time-filter {
  display: flex;
  justify-content: flex-start;
  width: 330px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 330px;
}

.time-filter >>> .el-radio-button__inner {
  background-color: rgba(6, 30, 93, 0.5) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  color: #7EAEE5 !important;
}

.time-filter >>> .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: rgba(0, 255, 255, 0.2) !important;
  border-color: #00FFFF !important;
  color: #00FFFF !important;
  box-shadow: -1px 0 0 0 #00FFFF !important;
}

.action-buttons >>> .el-button--primary {
  background-color: rgba(0, 255, 255, 0.2) !important;
  border-color: #00FFFF !important;
  color: #00FFFF !important;
}

.action-buttons >>> .el-button {
  background-color: rgba(6, 30, 93, 0.5) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  color: #7EAEE5 !important;
}

.action-buttons >>> .el-button:hover {
  background-color: rgba(0, 255, 255, 0.1) !important;
  border-color: #00FFFF !important;
  color: #00FFFF !important;
}

/* 面板盒子样式 */
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

.panel-box:hover {
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.panel-title {
  color: #00FFFF;
  font-size: 16px;
  margin-bottom: 15px;
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

/* 顶部统计卡片 */
.statistics-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
}

.stat-card {
  flex: 1;
  background: linear-gradient(180deg, rgba(6, 30, 93, 0.8) 0%, rgba(4, 20, 63, 0.9) 100%);
  border: 1px solid rgba(35, 88, 148, 0.5);
  border-radius: 4px;
  padding: 15px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  background: rgba(0, 30, 60, 0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.alert-icon {
  color: #FF8746;
}

.rate-icon {
  color: #00FFFF;
}

.process-icon {
  color: #44FF9B;
}

.pending-icon {
  color: #FF4D4F;
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: #7EAEE5;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.stat-value .unit {
  font-size: 14px;
  color: #7EAEE5;
  margin-left: 2px;
}

/* 主内容区域 */
.main-content {
  padding: 0;
}

/* 图表样式 */
.trend-chart,
.status-chart,
.level-chart,
.top-chart {
  height: calc(100% - 20px);
  width: 100%;
  position: relative;
  flex: 1;
}

/* 设备TOP10列表 */
.device-tabs {
  display: flex;
  margin-bottom: 15px;
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

.device-top-list {
  height: calc(100% - 50px);
  overflow-y: auto;
  padding: 10px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.device-top-list::-webkit-scrollbar {
  width: 0;
  display: none; /* Chrome, Safari and Opera */
}

.device-top-list.no-scroll {
  overflow-y: auto;
}

.device-item {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(35, 88, 148, 0.3);
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.device-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.device-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 50%;
  background: rgba(0, 255, 255, 0.1);
  color: #00FFFF;
  font-size: 12px;
  font-weight: bold;
}

.device-name {
  font-size: 14px;
  color: #7EAEE5;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-progress {
  width: 120px;
  height: 8px;
  background: rgba(35, 88, 148, 0.3);
  border-radius: 4px;
  margin: 0 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00FFFF 0%, #207FFF 100%);
}

.device-count {
  width: 40px;
  font-size: 14px;
  color: #00FFFF;
  font-weight: bold;
  text-align: right;
}

/* 底部分区 */
.bottom-section {
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .header-bar {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 15px 10px;
  }
  
  .page-title {
    order: -1;
    margin-bottom: 10px;
  }
  
  .time-filter,
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .statistics-header {
    flex-wrap: wrap;
  }
  
  .stat-card {
    flex: 1 1 calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .statistics-header {
    flex-direction: column;
  }
  
  .stat-card {
    width: 100%;
  }
  
  .panel-equal-height,
  .panel-bottom-equal-height {
    height: auto;
    min-height: 300px;
  }
  
  .trend-chart,
  .status-chart,
  .level-chart,
  .top-chart {
    height: 300px;
  }
}

/* 添加媒体查询确保在任何屏幕尺寸下内容都能充满整个宽度 */
@media (min-width: 1200px) {
  .visual-statistics {
    padding: 16px 0;
  }
  
  .header-bar,
  .statistics-header,
  .main-content {
    padding-left: 16px;
    padding-right: 16px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}
</style>

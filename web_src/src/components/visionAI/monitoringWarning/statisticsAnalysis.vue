<script>
import * as echarts from 'echarts'

export default {
  name: "StatisticsAnalysis",
  data() {
    return {
      // 页面数据
      statisticsData: {
        totalCount: 58,
        successRate: 96.55,
        warningCount: 33,
        processedCount: 33
      },
      
      // 时间筛选相关
      timeRange: 'today',
      customDateRange: [],
      timeOptions: [
        { label: '日', value: 'today' },
        { label: '周', value: 'week' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' },
        { label: '自定义', value: 'custom' }
      ],
      
      // 表格数据
      tableData: [
        { device: '中控测试', warningType: '预警类型1', warningCount: 56, processRate: 0, status: '0.00%' },
        { device: '摄像头测试', warningType: '预警类型2', warningCount: 1, processRate: 0, status: '0.00%' },
        { device: '打电话测试', warningType: '预警类型3', warningCount: 1, processRate: 0, status: '0.00%' }
      ],
      
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 100
      },
      
      // 图表实例
      charts: {
        trendChart: null,
        warningTypeChart: null,
        warningStatusChart: null,
        topDeviceChart: null
      }
    }
  },
  mounted() {
    this.initCharts();
    window.addEventListener('resize', this.handleResize);
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
        this.initWarningTypeChart();
        this.initWarningStatusChart();
        this.initTopDeviceChart();
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
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: (params) => {
            const data = params[0];
            return `${data.name}<br/>${data.seriesName}：${data.value}`;
          }
        },
        grid: {
          top: 30,
          right: 20,
          bottom: 30,
          left: 40
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            rotate: this.timeRange === 'month' ? 45 : 0,
            interval: this.timeRange === 'month' ? 'auto' : 0
          }
        },
        yAxis: {
          type: 'value',
          name: '预警数量',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [{
          name: '预警数量',
          data: yData,
          type: 'line',
          smooth: true,
          symbolSize: 6,
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64,158,255,0.3)' },
              { offset: 1, color: 'rgba(64,158,255,0.1)' }
            ])
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
            yData: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50))
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
    
    // 初始化预警类型图表
    initWarningTypeChart() {
      const warningTypeChart = document.getElementById('warningTypeChart');
      if (!warningTypeChart) return;
      
      this.charts.warningTypeChart = echarts.init(warningTypeChart);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          right: '0%',
          top: 'center',
          itemWidth: 10,
          itemHeight: 10,
          formatter: (name) => {
            const data = option.series[0].data;
            const item = data.find(i => i.name === name);
            return `${name}  ${item.value}%  ${item.count}次`;
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
            { value: 100, name: '待处理', count: 58 },
            { value: 0, name: '处理中', count: 0 },
            { value: 0, name: '已完成', count: 0 },
            { value: 0, name: '已忽略', count: 0 }
          ]
        }]
      };
      this.charts.warningTypeChart.setOption(option);
    },
    
    // 初始化预警状态图表
    initWarningStatusChart() {
      const warningStatusChart = document.getElementById('warningStatusChart');
      if (!warningStatusChart) return;
      
      this.charts.warningStatusChart = echarts.init(warningStatusChart);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          right: '0%',
          top: 'center',
          itemWidth: 10,
          itemHeight: 10,
          formatter: (name) => {
            const data = option.series[0].data;
            const item = data.find(i => i.name === name);
            return `${name}  ${item.value}%  ${item.count}次`;
          }
        },
        series: [{
          type: 'pie',
          radius: '50%',
          center: ['30%', '50%'],
          label: {
            show: false
          },
          data: [
            { value: 84.48, name: '四级预警', count: 49 },
            { value: 15.52, name: '三级预警', count: 9 },
            { value: 0, name: '二级预警', count: 0 },
            { value: 0, name: '一级预警', count: 0 }
          ]
        }]
      };
      this.charts.warningStatusChart.setOption(option);
    },
    
    // 初始化TOP设备图表
    initTopDeviceChart() {
      const topDeviceChart = document.getElementById('topDeviceChart');
      if (!topDeviceChart) return;
      
      this.charts.topDeviceChart = echarts.init(topDeviceChart);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
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
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: ['设备1', '设备2', '设备3', '设备4', '设备5'],
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          }
        },
        series: [
          {
            name: '预警数量',
            type: 'bar',
            data: [35, 28, 22, 15, 8],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#409eff' },
                { offset: 1, color: '#53a8ff' }
              ])
            },
            barWidth: '60%'
          }
        ]
      };
      this.charts.topDeviceChart.setOption(option);
    },
    
    // 刷新数据
    refreshData() {
      // 在实际项目中调用API获取数据
      console.log('正在刷新数据，时间范围:', this.timeRange);
    },
    
    // 处理分页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.refreshData();
    },
    
    // 处理分页大小变化  
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
      this.refreshData();
    }
  }
}
</script>

<template>
  <div class="statistics-container">
    <!-- 顶部统计数据 -->
    <div class="statistics-header">
      <div class="stat-card">
        <div class="stat-title">预警总数</div>
        <div class="stat-value">{{ statisticsData.totalCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">正确率</div>
        <div class="stat-value">{{ statisticsData.successRate }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">预警次数</div>
        <div class="stat-value">{{ statisticsData.warningCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">已处理</div>
        <div class="stat-value">{{ statisticsData.processedCount }}</div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 预警趋势 -->
      <div class="chart-card trend-chart">
        <div class="chart-header">
          <div class="chart-title">预警趋势</div>
          <div class="chart-tools">
            <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
              <el-radio-button v-for="option in timeOptions" 
                              :key="option.value" 
                              :label="option.value">{{ option.label }}</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-if="timeRange === 'custom'"
              v-model="customDateRange"
              type="daterange"
              size="small"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleCustomDateChange">
            </el-date-picker>
          </div>
        </div>
        <div id="trendChart" class="chart-content"></div>
      </div>
      
      <!-- 小型图表区域 -->
      <div class="small-charts">
        <!-- 预警类型分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">预警类型分布</div>
          </div>
          <div id="warningTypeChart" class="chart-content"></div>
        </div>
        
        <!-- 预警状态分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">预警状态分布</div>
          </div>
          <div id="warningStatusChart" class="chart-content"></div>
        </div>
      </div>
      
      <!-- 预警设备TOP5 -->
      <div class="chart-card device-chart">
        <div class="chart-header">
          <div class="chart-title">预警设备TOP5</div>
        </div>
        <div id="topDeviceChart" class="chart-content"></div>
      </div>
    </div>
    
    <!-- 表格区域 -->
    <div class="table-container">
      <div class="table-header">
        <div class="table-title">预警列表</div>
        <div class="table-tools">
          <el-button size="small" type="primary" icon="el-icon-download">导出数据</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </div>
      </div>
      <el-table :data="tableData" border style="width: 100%" v-loading="false">
        <el-table-column prop="device" label="设备" min-width="120"></el-table-column>
        <el-table-column prop="warningType" label="预警类型" min-width="120"></el-table-column>
        <el-table-column prop="warningCount" label="预警次数" min-width="100"></el-table-column>
        <el-table-column prop="status" label="处理率" min-width="100"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="mini" type="text">查看</el-button>
            <el-button size="mini" type="text">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
  padding: 16px;
  background: #f0f2f5;
  overflow: auto;
}

.statistics-container {
  max-width: 1200px;
  margin: 0 auto;
}

.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.statistics-header .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.statistics-header .time-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.statistics-header .time-filter .filter-label {
  font-size: 14px;
  color: #666;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-cards .card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-cards .card .card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.summary-cards .card .card-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.summary-cards .card .card-value.warning-count {
  color: #ff4d4f;
}

.summary-cards .card .card-value.online-rate {
  color: #52c41a;
}

.summary-cards .card .card-value.coverage-rate {
  color: #1890ff;
}

.statistics-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.statistics-charts .chart-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  height: 360px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.statistics-charts .chart-card .chart-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.statistics-charts .chart-card .chart-container {
  height: calc(100% - 40px);
}

.warning-types-table {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.warning-types-table .table-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}
</style>

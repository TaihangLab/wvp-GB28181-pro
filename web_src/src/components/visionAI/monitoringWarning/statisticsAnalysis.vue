<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElDatePicker } from 'element-plus'
import type { TableInstance } from 'element-plus'

// 定义数据结构
interface StatisticsData {
  totalCount: number
  successRate: number
  warningCount: number
  processedCount: number
}

// 页面数据
const statisticsData = ref<StatisticsData>({
  totalCount: 58,
  successRate: 96.55,
  warningCount: 33,
  processedCount: 33
})

// 时间筛选相关
const timeRange = ref('today')
const customDateRange = ref([])
const timeOptions = [
  { label: '日', value: 'today' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
  { label: '自定义', value: 'custom' }
]

// 表格数据
interface TableData {
  device: string
  warningType: string
  warningCount: number
  processRate: number
  status: string
}

const tableData = ref<TableData[]>([
  { device: '中控测试', warningType: '预警类型1', warningCount: 56, processRate: 0, status: '0.00%' },
  { device: '摄像头测试', warningType: '预警类型2', warningCount: 1, processRate: 0, status: '0.00%' },
  { device: '打电话测试', warningType: '预警类型3', warningCount: 1, processRate: 0, status: '0.00%' }
])

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 生成不同时间维度的数据
const generateTimeData = (timeType: string) => {
  const now = new Date()
  
  switch (timeType) {
    case 'today':
      // 生成24小时的数据
      return {
        xData: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        yData: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50))
      }
      
    case 'week':
      // 生成最近7天的数据
      return {
        xData: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now)
          date.setDate(date.getDate() - (6 - i))
          return `${date.getMonth() + 1}/${date.getDate()}`
        }),
        yData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50))
      }
      
    case 'month':
      // 生成当月每天的数据
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      return {
        xData: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`),
        yData: Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 50))
      }
      
    case 'year':
      // 生成12个月的数据
      return {
        xData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        yData: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50))
      }
      
    default:
      return {
        xData: [],
        yData: []
      }
  }
}

// 更新趋势图配置
const updateTrendChart = (timeType: string) => {
  const chart = echarts.getInstanceByDom(document.getElementById('trendChart') as HTMLElement)
  if (!chart) return

  const { xData, yData } = generateTimeData(timeType)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}：${data.value}`
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
        rotate: timeType === 'month' ? 45 : 0, // 当月份数据较多时旋转标签
        interval: timeType === 'month' ? 'auto' : 0, // 自动隐藏部分标签避免重叠
        formatter: (value: string) => {
          // 根据不同时间维度格式化显示
          switch (timeType) {
            case 'today':
              return value
            case 'week':
              return value
            case 'month':
              return value
            case 'year':
              return value
            default:
              return value
          }
        }
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
  }
  
  chart.setOption(option)
}

// 处理时间范围变化
const handleTimeRangeChange = (value: string) => {
  timeRange.value = value
  if (value !== 'custom') {
    updateTrendChart(value)
    refreshData()
  }
}

// 处理自定义日期变化
const handleCustomDateChange = (value: [Date, Date]) => {
  if (!value || value.length !== 2) return
  
  customDateRange.value = value
  const days = Math.ceil((value[1].getTime() - value[0].getTime()) / (1000 * 60 * 60 * 24))
  
  const chart = echarts.getInstanceByDom(document.getElementById('trendChart') as HTMLElement)
  if (!chart) return

  // 生成自定义日期范围的数据
  const xData = Array.from({ length: days }, (_, i) => {
    const date = new Date(value[0].getTime() + i * 24 * 60 * 60 * 1000)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  
  const option = {
    xAxis: {
      data: xData,
      axisLabel: {
        rotate: days > 30 ? 45 : 0,
        interval: days > 30 ? 'auto' : 0
      }
    },
    series: [{
      data: Array.from({ length: days }, () => Math.floor(Math.random() * 50))
    }]
  }
  
  chart.setOption(option)
  refreshData()
}

// 刷新数据
const refreshData = async () => {
  try {
    // 模拟API调用
    const mockData = {
      statistics: {
        totalCount: Math.floor(Math.random() * 100),
        successRate: Number((Math.random() * 20 + 80).toFixed(2)),
        warningCount: Math.floor(Math.random() * 50),
        processedCount: Math.floor(Math.random() * 30)
      },
      trendData: Array(12).fill(0).map(() => Math.floor(Math.random() * 50)),
      typeData: [
        { value: 35, name: '待处理', count: 35 },
        { value: 25, name: '处理中', count: 25 },
        { value: 20, name: '已完成', count: 20 },
        { value: 15, name: '已忽略', count: 15 }
      ],
      statusData: [
        { value: 84.48, name: '四级预警', count: 49 },
        { value: 15.52, name: '三级预警', count: 9 },
        { value: 0, name: '二级预警', count: 0 },
        { value: 0, name: '一级预警', count: 0 }
      ]
    }
 
    // 确保数据类型匹配
    const newStatistics: StatisticsData = {
      totalCount: mockData.statistics.totalCount,
      successRate: mockData.statistics.successRate,
      warningCount: mockData.statistics.warningCount,
      processedCount: mockData.statistics.processedCount
    }
  
    // 更新数据
    statisticsData.value = newStatistics
  
    // 获取所有图表实例
    const trendChart = echarts.getInstanceByDom(document.getElementById('trendChart') as HTMLElement)
    const typeChart = echarts.getInstanceByDom(document.getElementById('warningTypeChart') as HTMLElement)
    const statusChart = echarts.getInstanceByDom(document.getElementById('warningStatusChart') as HTMLElement)
    const topChart = echarts.getInstanceByDom(document.getElementById('warningTopChart') as HTMLElement)

    // 更新趋势图
    if (trendChart) {
      trendChart.setOption({
        series: [{ data: mockData.trendData }]
      })
    }

    // 更新预警状态图
    if (typeChart) {
      typeChart.setOption({
        series: [{ data: mockData.typeData }]
      })
    }

    // 更新预警等级图
    if (statusChart) {
      statusChart.setOption({
        series: [{ data: mockData.statusData }]
      })
    }

    // 更新表格数据
    tableData.value = [
      { device: '中控测试', warningType: '预警类型1', warningCount: 56, processRate: 0, status: '0.00%' },
      { device: '摄像头测试', warningType: '预警类型2', warningCount: 1, processRate: 0, status: '0.00%' },
      { device: '打电话测试', warningType: '预警类型3', warningCount: 1, processRate: 0, status: '0.00%' }
    ]

  } catch (error) {
    console.error('更新数据失败:', error)
    ElMessage.error('数据刷新失败')
  }
}

// 导出数据
const exportData = () => {
  try {
    // 创建CSV内容
    const headers = ['设备', '预警类型', '预警数量', '处理率', '状态']
    const csvContent = [
      headers.join(','),
      ...tableData.value.map(row => 
        [row.device, row.warningType, row.warningCount, row.processRate, row.status].join(',')
      )
    ].join('\n')

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `预警统计_${new Date().toLocaleDateString()}.csv`
    link.click()
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 处理分页
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  refreshData()
}

// 确保图表实例在组件卸载时被销毁
const charts = ref<echarts.ECharts[]>([])

onMounted(() => {
  // 初始化所有图表
  const trendChart = echarts.init(document.getElementById('trendChart') as HTMLElement)
  const typeChart = echarts.init(document.getElementById('warningTypeChart') as HTMLElement)
  const statusChart = echarts.init(document.getElementById('warningStatusChart') as HTMLElement)
  const topChart = echarts.init(document.getElementById('warningTopChart') as HTMLElement)

  // 保存图表实例以便后续清理
  charts.value = [trendChart, typeChart, statusChart, topChart]

  // 初始化图表配置
  initTrendChart()
  initWarningTypeChart()
  initWarningStatusChart()
  initWarningTopChart()

  // 初始加载数据
  refreshData()
})

// 组件卸载时清理图表实例
onUnmounted(() => {
  charts.value.forEach(chart => {
    chart?.dispose()
  })
})

// 初始化趋势图
const initTrendChart = () => {
  const chart = echarts.init(document.getElementById('trendChart'))
  const { xData, yData } = generateTimeData('today') // 默认显示今日数据
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
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
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '预警数量'
    },
    series: [{
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
  }
  
  chart.setOption(option)
}

// 初始化预警状态图表
const initWarningTypeChart = () => {
  const chart = echarts.init(document.getElementById('warningTypeChart'))
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
      formatter: (name: string) => {
        const data = option.series[0].data
        const item = data.find((i: any) => i.name === name)
        return `${name}  ${item.value}%  ${item.count}次`
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
  }
  chart.setOption(option)
}

// 初始化预警等级图表
const initWarningStatusChart = () => {
  const chart = echarts.init(document.getElementById('warningStatusChart'))
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
      formatter: (name: string) => {
        const data = option.series[0].data
        const item = data.find((i: any) => i.name === name)
        return `${name}  ${item.value}%  ${item.count}次`
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
  }
  chart.setOption(option)
}

// 初始化预警类型TOP5图表
const initWarningTopChart = () => {
  const chart = echarts.init(document.getElementById('warningTopChart'))
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['人员聚集', '室内人员打闹', '人员异常', '烟火', '车辆文明']
    },
    series: [
      {
        name: '已处理',
        type: 'bar',
        stack: 'total',
        data: [3, 2, 4, 15, 45]
      },
      {
        name: '预警数',
        type: 'bar',
        stack: 'total',
        data: [5, 3, 6, 20, 50]
      }
    ],
    legend: {
      data: ['已处理', '预警数'],
      right: '10%',
      top: '5%'
    }
  }
  chart.setOption(option)
}
</script>

<template>
  <div class="statistics-analysis">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="time-filter">
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button v-for="option in timeOptions" 
                          :key="option.value" 
                          :label="option.value">
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
        
        <el-date-picker v-if="timeRange === 'custom'"
                       v-model="customDateRange"
                       type="daterange"
                       range-separator="至"
                       start-placeholder="开始日期"
                       end-placeholder="结束日期"
                       @change="handleCustomDateChange" />
      </div>
      
      <div class="actions">
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <div class="statistics-cards">
      <div class="stat-card">
        <div class="label">预警总数</div>
        <div class="value">{{ statisticsData.totalCount }}</div>
      </div>
      <div class="stat-card">
        <div class="label">预警准确率</div>
        <div class="value">{{ statisticsData.successRate }}%</div>
      </div>
      <div class="stat-card">
        <div class="label">已处理预警数</div>
        <div class="value">{{ statisticsData.warningCount }}</div>
      </div>
      <div class="stat-card">
        <div class="label">未处理预警数</div>
        <div class="value">{{ statisticsData.processedCount }}</div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="chart-container">
      <div class="chart-title">预警趋势</div>
      <div id="trendChart" class="chart"></div>
    </div>

    <!-- 预警分析图表 -->
    <div class="charts-row">
      <div class="chart-container">
        <div class="chart-title">预警状态</div>
        <div id="warningTypeChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-title">预警等级</div>
        <div id="warningStatusChart" class="chart"></div>
      </div>
    </div>

    <!-- 预警TOP分析 -->
    <div class="charts-row">
      <div class="chart-container">
        <div class="chart-title">预警类型TOP5</div>
        <div id="warningTopChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-title">设备预警数量TOP10</div>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="device" label="设备名称" />
          <el-table-column prop="warningCount" label="预警数量(次)" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.statistics-analysis {
  padding: 20px;

  .statistics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

      .label {
        color: #666;
        font-size: 14px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-top: 8px;
      }
    }
  }

  .chart-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .chart-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
    }

    .chart {
      height: 300px;
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .warning-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f5f7fa;
      font-weight: normal;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .time-filter {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.chart-container {
  .chart {
    height: 300px;
    position: relative;
  }
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  .chart-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.el-table {
  margin-top: 20px;
}
</style>

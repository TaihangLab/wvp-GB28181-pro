<template>
  <div class="device-skills-container">
    <!-- 顶部搜索和筛选区域 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form :inline="true">
            <el-form-item label="状态">
              <el-select 
                v-model="tempFilterStatus" 
                placeholder="选择状态"
                clearable
              >
                <el-option label="已发布" value="published" />
                <el-option label="未发布" value="unpublished" />
              </el-select>
            </el-form-item>
            <el-form-item label="技能类型">
              <el-select 
                v-model="tempFilterType" 
                placeholder="选择类型"
                clearable
              >
                <el-option 
                  v-for="type in skillTypes" 
                  :key="type" 
                  :label="type" 
                  :value="type"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="tempSearchQuery"
            placeholder="搜索技能名称"
            clearable
          >
            <i slot="prefix" class="el-icon-search"></i>
            <el-button slot="append" @click="handleSearch">搜索</el-button>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 技能列表卡片区域 -->
    <div class="skills-grid">
      <el-row :gutter="20">
        <el-col
          v-for="skill in displaySkills"
          :key="skill.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="6"
        >
          <el-card class="skill-card" shadow="hover">
            <div class="skill-thumbnail">
              <div 
                class="thumbnail-bg" 
                :style="{ background: skill.thumbnail }"
              ></div>
              <div
                class="status-badge"
                :class="skill.status === 'published' ? 'published' : 'unpublished'"
              >
                {{ skill.status === 'published' ? '已发布' : '未发布' }}
              </div>
            </div>
            <div class="skill-info">
              <h3>{{ skill.name }}</h3>
              <p>版本：{{ skill.version }}</p>
              <p>关联设备：{{ skill.deviceCount }}</p>
              <p>类型：{{ skill.type }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size.sync="pageSize"
        :total="filteredSkills.length"
        :page-sizes="[8, 16, 32, 64]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceSkills',
  
  data() {
    return {
      // 搜索和筛选条件
      tempSearchQuery: '',
      tempFilterStatus: '',
      tempFilterType: '',
      // 实际用于过滤的条件
      searchQuery: '',
      filterStatus: '',
      filterType: '',

      // 技能列表数据
      skillsList: [],

      // 分页配置
      currentPage: 1,
      pageSize: 8,
      total: 0
    }
  },

  computed: {
    // 获取所有技能类型选项
    skillTypes() {
      const types = new Set(this.skillsList.map(skill => skill.type))
      return Array.from(types)
    },

    // 筛选后的技能列表
    filteredSkills() {
      return this.skillsList.filter(skill => {
        const matchStatus = !this.filterStatus || skill.status === this.filterStatus
        const matchType = !this.filterType || skill.type === this.filterType
        const matchQuery = !this.searchQuery || 
          skill.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        return matchStatus && matchType && matchQuery
      })
    },

    // 计算当前页显示的数据
    displaySkills() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSkills.slice(start, end)
    }
  },

  mounted() {
    this.fetchSkills()
  },

  methods: {
    // 重置筛选条件
    resetFilters() {
      this.tempSearchQuery = ''
      this.tempFilterStatus = ''
      this.tempFilterType = ''
      this.searchQuery = ''
      this.filterStatus = ''
      this.filterType = ''
      this.currentPage = 1
    },

    // 处理搜索
    handleSearch() {
      // 将临时变量的值复制到实际用于过滤的变量
      this.searchQuery = this.tempSearchQuery
      this.filterStatus = this.tempFilterStatus
      this.filterType = this.tempFilterType
      this.currentPage = 1 // 重置页码
    },

    // 获取技能列表数据
    async fetchSkills() {
      try {
        // 这里模拟API调用
        const mockData = [
          {
            id: '1',
            name: 'human_attribute_detection',
            version: 'v1.0.0',
            status: 'published',
            deviceCount: 5,
            type: '人体检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '2',
            name: 'vehicle_detection',
            version: 'v2.1.0',
            status: 'published',
            deviceCount: 8,
            type: '车辆检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '3',
            name: 'face_recognition',
            version: 'v1.5.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '人脸识别',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '4',
            name: 'object_tracking',
            version: 'v2.0.0',
            status: 'published',
            deviceCount: 12,
            type: '目标跟踪',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '5',
            name: 'crowd_analysis',
            version: 'v1.2.0',
            status: 'published',
            deviceCount: 3,
            type: '人群分析',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '6',
            name: 'license_plate_recognition',
            version: 'v1.0.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '车牌识别',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '7',
            name: 'behavior_analysis',
            version: 'v1.3.0',
            status: 'published',
            deviceCount: 6,
            type: '行为分析',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '8',
            name: 'traffic_monitoring',
            version: 'v2.2.0',
            status: 'published',
            deviceCount: 15,
            type: '交通监控',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '9',
            name: 'smoke_detection',
            version: 'v1.0.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '烟雾检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '10',
            name: 'helmet_detection',
            version: 'v1.1.0',
            status: 'published',
            deviceCount: 4,
            type: '安全帽检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '11',
            name: 'intrusion_detection',
            version: 'v1.4.0',
            status: 'published',
            deviceCount: 7,
            type: '入侵检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '12',
            name: 'fire_detection',
            version: 'v1.0.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '火灾检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '13',
            name: 'gesture_recognition',
            version: 'v1.2.0',
            status: 'published',
            deviceCount: 5,
            type: '手势识别',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '14',
            name: 'falling_detection',
            version: 'v1.0.0',
            status: 'published',
            deviceCount: 3,
            type: '跌倒检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          },
          {
            id: '15',
            name: 'weapon_detection',
            version: 'v1.1.0',
            status: 'unpublished',
            deviceCount: 0,
            type: '武器检测',
            thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
          }
        ]

        // 设置总数据量
        this.total = mockData.length
        this.skillsList = mockData
      } catch (error) {
        console.error('获取技能列表失败:', error)
        this.$message.error('获取技能列表失败')
      }
    },

    // 处理页码改变
    handleCurrentChange(page) {
      this.currentPage = page
    },

    // 处理每页显示数量改变
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1 // 重置到第一页
    }
  }
}
</script>

<style scoped>
.device-skills-container {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section .el-form .el-form-item {
  margin-bottom: 0;
}

.filter-section .el-input {
  width: 100%;
}

.skills-grid {
  margin-bottom: 20px;
}

.skills-grid .skill-card {
  margin-bottom: 20px;
  cursor: pointer;
}

.skills-grid .skill-card .skill-thumbnail {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.skills-grid .skill-card .skill-thumbnail .thumbnail-bg {
  width: 100%;
  height: 100%;
}

.skills-grid .skill-card .skill-thumbnail .status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.skills-grid .skill-card .skill-thumbnail .status-badge.published {
  background-color: #67c23a;
}

.skills-grid .skill-card .skill-thumbnail .status-badge.unpublished {
  background-color: #909399;
}

.skills-grid .skill-card .skill-info {
  padding: 12px;
}

.skills-grid .skill-card .skill-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.skills-grid .skill-card .skill-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: -20px;
  padding: 20px 0;
}

/* 深度选择器 */
.pagination >>> .el-pagination {
  justify-content: center;
}
</style>

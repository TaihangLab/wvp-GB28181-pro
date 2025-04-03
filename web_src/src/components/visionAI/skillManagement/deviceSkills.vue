<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

// 定义技能列表数据结构
interface Skill {
  id: string
  name: string
  version: string
  status: 'published' | 'unpublished'
  deviceCount: number
  type: string
  thumbnail: string
}

// 搜索和筛选条件
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')

// 技能列表数据
const skillsList = ref<Skill[]>([])

// 分页配置
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 获取所有技能类型选项
const skillTypes = computed(() => {
  const types = new Set(skillsList.value.map(skill => skill.type))
  return Array.from(types)
})

// 筛选后的技能列表
const filteredSkills = computed<Skill[]>(() => {
  return skillsList.value.filter(skill => {
    const matchStatus = !filterStatus.value || skill.status === filterStatus.value
    const matchType = !filterType.value || skill.type === filterType.value
    const matchQuery = !searchQuery.value || 
      skill.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchType && matchQuery
  })
})

// 计算当前页显示的数据
const displaySkills = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSkills.value.slice(start, end)
})

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterType.value = ''
  currentPage.value = 1
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置页码
  // 触发计算属性更新
  filteredSkills.value // 访问计算属性以触发更新
}

// 获取技能列表数据
const fetchSkills = async () => {
  try {
    // 这里模拟API调用
    const mockData: Skill[] = [
      {
        id: '1',
        name: 'human_attribute_detection',
        version: 'v1.0.0',
        status: 'published' as const,
        deviceCount: 5,
        type: '人体检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '2',
        name: 'vehicle_detection',
        version: 'v2.1.0',
        status: 'published' as const,
        deviceCount: 8,
        type: '车辆检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '3',
        name: 'face_recognition',
        version: 'v1.5.0',
        status: 'unpublished' as const,
        deviceCount: 0,
        type: '人脸识别',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '4',
        name: 'object_tracking',
        version: 'v2.0.0',
        status: 'published' as const,
        deviceCount: 12,
        type: '目标跟踪',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '5',
        name: 'crowd_analysis',
        version: 'v1.2.0',
        status: 'published' as const,
        deviceCount: 3,
        type: '人群分析',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '6',
        name: 'license_plate_recognition',
        version: 'v1.0.0',
        status: 'unpublished' as const,
        deviceCount: 0,
        type: '车牌识别',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '7',
        name: 'behavior_analysis',
        version: 'v1.3.0',
        status: 'published' as const,
        deviceCount: 6,
        type: '行为分析',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '8',
        name: 'traffic_monitoring',
        version: 'v2.2.0',
        status: 'published' as const,
        deviceCount: 15,
        type: '交通监控',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '9',
        name: 'smoke_detection',
        version: 'v1.0.0',
        status: 'unpublished' as const,
        deviceCount: 0,
        type: '烟雾检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '10',
        name: 'helmet_detection',
        version: 'v1.1.0',
        status: 'published' as const,
        deviceCount: 4,
        type: '安全帽检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '11',
        name: 'intrusion_detection',
        version: 'v1.4.0',
        status: 'published' as const,
        deviceCount: 7,
        type: '入侵检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '12',
        name: 'fire_detection',
        version: 'v1.0.0',
        status: 'unpublished' as const,
        deviceCount: 0,
        type: '火灾检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '13',
        name: 'gesture_recognition',
        version: 'v1.2.0',
        status: 'published' as const,
        deviceCount: 5,
        type: '手势识别',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '14',
        name: 'falling_detection',
        version: 'v1.0.0',
        status: 'published' as const,
        deviceCount: 3,
        type: '跌倒检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      },
      {
        id: '15',
        name: 'weapon_detection',
        version: 'v1.1.0',
        status: 'unpublished' as const,
        deviceCount: 0,
        type: '武器检测',
        thumbnail: 'linear-gradient(45deg, #409EFF, #1890ff)'
      }
    ]

    // 设置总数据量
    total.value = mockData.length
    skillsList.value = mockData
  } catch (error) {
    console.error('获取技能列表失败:', error)
    ElMessage.error('获取技能列表失败')
  }
}

// 处理页码改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 处理每页显示数量改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

onMounted(() => {
  fetchSkills()
})
</script>

<template>
  <div class="device-skills-container">
    <!-- 顶部搜索和筛选区域 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form :inline="true">
            <el-form-item label="状态">
              <el-select 
                v-model="filterStatus" 
                placeholder="选择状态"
                clearable
              >
                <el-option label="已发布" value="published" />
                <el-option label="未发布" value="unpublished" />
              </el-select>
            </el-form-item>
            <el-form-item label="技能类型">
              <el-select 
                v-model="filterType" 
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
            v-model="searchQuery"
            placeholder="搜索技能名称"
            prefix-icon="Search"
            clearable
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
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
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredSkills.length"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.device-skills-container {
  padding: 20px;

  .filter-section {
    margin-bottom: 20px;
  }

  .skills-grid {
    margin-bottom: 20px;

    .skill-card {
      margin-bottom: 20px;
      cursor: pointer;

      .skill-thumbnail {
        position: relative;
        height: 160px;
        overflow: hidden;

        .thumbnail-bg {
          width: 100%;
          height: 100%;
        }

        .status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: white;

          &.published {
            background-color: #67c23a;
          }

          &.unpublished {
            background-color: #909399;
          }
        }
      }

      .skill-info {
        padding: 12px;

        h3 {
          margin: 0 0 8px;
          font-size: 16px;
        }

        p {
          margin: 4px 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px 0;
    
    :deep(.el-pagination) {
      justify-content: center;
    }
  }
}

.filter-section {
  margin-bottom: 20px;
  
  .el-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .el-input {
    width: 100%;
  }
}
</style>

<template>
  <div class="camera-management-main">
    <!-- 顶部导航栏 -->
    <div class="management-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>
            <el-button type="text" icon="el-icon-arrow-left" @click="goBack">
              返回设备列表
            </el-button>
          </el-breadcrumb-item>
          <el-breadcrumb-item>摄像头管理</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentMenuName">{{ currentMenuName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <span class="management-title">摄像头设备管理中心</span>
      </div>
    </div>

    <div class="management-content">
      <!-- 左侧菜单 -->
      <div class="sidebar-menu">
        <div class="menu-header">
          <i class="el-icon-setting"></i>
          <span class="menu-title">管理菜单</span>
        </div>
        
        <el-menu
          :default-active="activeMenuIndex"
          class="management-menu"
          @select="handleMenuSelect"
          background-color="#f5f7fa"
          text-color="#606266"
          active-text-color="#409EFF">
          
          <el-menu-item index="gb-devices">
            <i class="el-icon-video-camera"></i>
            <span slot="title">国标设备</span>
          </el-menu-item>
          
          <el-menu-item index="push-streams">
            <i class="el-icon-upload2"></i>
            <span slot="title">推流列表</span>
          </el-menu-item>
          
          <el-menu-item index="pull-proxy">
            <i class="el-icon-download"></i>
            <span slot="title">拉流代理</span>
          </el-menu-item>
          
          <el-menu-item index="node-management">
            <i class="el-icon-connection"></i>
            <span slot="title">节点管理</span>
          </el-menu-item>
          
          <el-submenu index="channel-management">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>通道管理</span>
            </template>
            <el-menu-item index="administrative-division">
              <i class="el-icon-location"></i>
              <span slot="title">行政区划</span>
            </el-menu-item>
            <el-menu-item index="business-group">
              <i class="el-icon-s-grid"></i>
              <span slot="title">业务分组</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="content-wrapper">
          <!-- 默认欢迎页面 -->
          <div v-if="!currentComponent" class="welcome-content">
            <div class="welcome-card">
              <div class="welcome-icon">
                <i class="el-icon-video-camera"></i>
              </div>
              <h2 class="welcome-title">摄像头设备管理中心</h2>
              <p class="welcome-desc">请从左侧菜单选择要管理的设备类型</p>
              <div class="feature-list">
                <div class="feature-item">
                  <i class="el-icon-video-camera"></i>
                  <span>国标设备管理</span>
                </div>
                <div class="feature-item">
                  <i class="el-icon-upload2"></i>
                  <span>推流设备管理</span>
                </div>
                <div class="feature-item">
                  <i class="el-icon-download"></i>
                  <span>拉流代理管理</span>
                </div>
                <div class="feature-item">
                  <i class="el-icon-connection"></i>
                  <span>节点管理</span>
                </div>
                <div class="feature-item">
                  <i class="el-icon-menu"></i>
                  <span>通道管理</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 动态组件区域 -->
          <component 
            v-else
            :is="currentComponent" 
            :key="activeMenuIndex"
            @back="handleComponentBack">
          </component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入各个管理页面组件
import GBDevices from './managementPages/GBDevices.vue'
import PushStreams from './managementPages/PushStreams.vue'
import PullProxy from './managementPages/PullProxy.vue'
import NodeManagement from './managementPages/NodeManagement.vue'
import AdministrativeDivision from './managementPages/AdministrativeDivision.vue'
import BusinessGroup from './managementPages/BusinessGroup.vue'

export default {
  name: 'CameraManagementMain',
  components: {
    GBDevices,
    PushStreams,
    PullProxy,
    NodeManagement,
    AdministrativeDivision,
    BusinessGroup
  },
  data() {
    return {
      activeMenuIndex: '',
      currentComponent: null,
      currentMenuName: '',
      // 菜单项与组件的映射关系
      menuComponentMap: {
        'gb-devices': { component: 'GBDevices', name: '国标设备' },
        'push-streams': { component: 'PushStreams', name: '推流列表' },
        'pull-proxy': { component: 'PullProxy', name: '拉流代理' },
        'node-management': { component: 'NodeManagement', name: '节点管理' },
        'administrative-division': { component: 'AdministrativeDivision', name: '行政区划' },
        'business-group': { component: 'BusinessGroup', name: '业务分组' }
      }
    }
  },
  created() {
    // 检查是否有路由参数指定默认页面
    if (this.$route.params.type) {
      this.activeMenuIndex = this.$route.params.type;
      this.handleMenuSelect(this.activeMenuIndex);
    }
  },
  methods: {
    // 返回设备列表
    goBack() {
      this.$router.go(-1);
    },

    // 处理菜单选择
    handleMenuSelect(index) {
      this.activeMenuIndex = index;
      const menuConfig = this.menuComponentMap[index];
      
      if (menuConfig) {
        this.currentComponent = menuConfig.component;
        this.currentMenuName = menuConfig.name;
        
        // 更新路由（不刷新页面）
        this.$router.replace({ 
          name: 'CameraManagementMain', 
          params: { type: index } 
        });
      } else {
        console.warn('未找到对应的组件配置:', index);
      }
    },

    // 处理组件返回事件
    handleComponentBack() {
      this.activeMenuIndex = '';
      this.currentComponent = null;
      this.currentMenuName = '';
      
      // 更新路由
      this.$router.replace({ name: 'CameraManagementMain' });
    }
  }
}
</script>

<style scoped>
.camera-management-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left .el-breadcrumb {
  font-size: 14px;
}

.header-left .el-button {
  color: #409EFF;
  font-size: 14px;
  padding: 0;
}

.header-left .el-button:hover {
  color: #66b1ff;
}

.management-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.management-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-menu {
  width: 260px;
  background: #f5f7fa;
  border-right: 1px solid #e8eaec;
  display: flex;
  flex-direction: column;
}

.menu-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
}

.menu-header i {
  font-size: 18px;
  color: #409EFF;
  margin-right: 8px;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.management-menu {
  flex: 1;
  border: none;
}

.management-menu .el-menu-item,
.management-menu .el-submenu__title {
  height: 50px;
  line-height: 50px;
  padding-left: 24px !important;
}

.management-menu .el-menu-item i,
.management-menu .el-submenu__title i {
  margin-right: 8px;
  font-size: 16px;
}

.management-menu .el-submenu .el-menu-item {
  padding-left: 48px !important;
  height: 45px;
  line-height: 45px;
}

.content-area {
  flex: 1;
  background: #fff;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
}

.welcome-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-card {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.welcome-icon {
  margin-bottom: 24px;
}

.welcome-icon i {
  font-size: 64px;
  color: #409EFF;
}

.welcome-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 600;
}

.welcome-desc {
  font-size: 16px;
  color: #909399;
  margin-bottom: 32px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fc;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.feature-item i {
  font-size: 18px;
  color: #409EFF;
  margin-right: 8px;
}

.feature-item span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .management-content {
    flex-direction: column;
  }
  
  .sidebar-menu {
    width: 100%;
    height: auto;
  }
  
  .management-menu {
    display: flex;
    overflow-x: auto;
  }
  
  .management-menu .el-menu-item,
  .management-menu .el-submenu {
    min-width: 120px;
    text-align: center;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style> 
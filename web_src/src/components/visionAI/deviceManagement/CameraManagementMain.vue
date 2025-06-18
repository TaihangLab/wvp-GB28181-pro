<template>
  <div class="camera-management-main management-page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <el-button type="text" icon="el-icon-arrow-left" @click="goBack" class="back-btn">
            返回设备列表
          </el-button>
          <div class="title-info">
            <i class="el-icon-video-camera"></i>
            <span>摄像头设备管理</span>
            <span v-if="currentMenuName" class="subtitle">/ {{ currentMenuName }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="management-content">
      <!-- 左侧菜单 -->
      <div class="sidebar-menu">
        <el-card class="menu-card" shadow="never">
          <div slot="header" class="menu-header" @click="handleBackToHome">
            <i class="el-icon-setting"></i>
            <span>管理菜单</span>
            <i class="el-icon-refresh-right back-to-home-icon"></i>
          </div>
          
          <el-menu
            :default-active="activeMenuIndex"
            class="management-menu"
            @select="handleMenuSelect"
            background-color="transparent"
            text-color="#606266"
            active-text-color="#409EFF">
            
            <el-menu-item index="gb-devices" class="menu-item">
              <div class="menu-item-content">
                <div class="menu-icon">
                  <i class="el-icon-video-camera"></i>
                </div>
                <span class="menu-text">国标设备</span>
              </div>
            </el-menu-item>
            
            <el-menu-item index="push-streams" class="menu-item">
              <div class="menu-item-content">
                <div class="menu-icon">
                  <i class="el-icon-upload2"></i>
                </div>
                <span class="menu-text">推流列表</span>
              </div>
            </el-menu-item>
            
            <el-menu-item index="pull-proxy" class="menu-item">
              <div class="menu-item-content">
                <div class="menu-icon">
                  <i class="el-icon-download"></i>
                </div>
                <span class="menu-text">拉流代理</span>
              </div>
            </el-menu-item>
            
            <el-menu-item index="node-management" class="menu-item">
              <div class="menu-item-content">
                <div class="menu-icon">
                  <i class="el-icon-connection"></i>
                </div>
                <span class="menu-text">节点管理</span>
              </div>
            </el-menu-item>
            
            <el-submenu index="channel-management" class="menu-submenu">
              <template slot="title">
                <div class="menu-item-content">
                  <div class="menu-icon">
                    <i class="el-icon-menu"></i>
                  </div>
                  <span class="menu-text">通道管理</span>
                </div>
              </template>
              <el-menu-item index="administrative-division" class="menu-sub-item">
                <div class="menu-item-content sub-item">
                  <div class="menu-icon">
                    <i class="el-icon-location"></i>
                  </div>
                  <span class="menu-text">行政区划</span>
                </div>
              </el-menu-item>
              <el-menu-item index="business-group" class="menu-sub-item">
                <div class="menu-item-content sub-item">
                  <div class="menu-icon">
                    <i class="el-icon-s-grid"></i>
                  </div>
                  <span class="menu-text">业务分组</span>
                </div>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-card>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="content-wrapper">
          <!-- 默认管理页面 -->
          <div v-if="!currentComponent" class="default-content">
            <el-card class="welcome-card" shadow="never">
              <div class="welcome-content">
                <div class="welcome-icon">
                  <i class="el-icon-video-camera"></i>
                </div>
                <h3 class="welcome-title">摄像头设备管理中心</h3>
                <p class="welcome-desc">请从左侧菜单选择要管理的设备类型</p>
              </div>
            </el-card>

            <!-- 功能卡片网格 -->
            <div class="feature-grid">
              <el-card 
                v-for="(item, key) in menuComponentMap" 
                :key="key"
                class="feature-card" 
                shadow="hover"
                @click.native="handleMenuSelect(key)">
                <div class="feature-content">
                  <div class="feature-icon">
                    <i :class="getFeatureIcon(key)"></i>
                  </div>
                  <div class="feature-info">
                    <div class="feature-title">{{ item.name }}</div>
                    <div class="feature-desc">{{ getFeatureDesc(key) }}</div>
                  </div>
                </div>
              </el-card>
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
import MediaServerManager from './managementPages/MediaServerManager.vue'
import AdministrativeDivision from './managementPages/AdministrativeDivision.vue'
import BusinessGroup from './managementPages/BusinessGroup.vue'

export default {
  name: 'CameraManagementMain',
  components: {
    GBDevices,
    PushStreams,
    PullProxy,
    MediaServerManager,
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
        'node-management': { component: 'MediaServerManager', name: '节点管理' },
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
    },

    // 获取功能图标
    getFeatureIcon(key) {
      const icons = {
        'gb-devices': 'el-icon-video-camera',
        'push-streams': 'el-icon-upload2',
        'pull-proxy': 'el-icon-download',
        'node-management': 'el-icon-connection',
        'administrative-division': 'el-icon-location',
        'business-group': 'el-icon-s-grid'
      };
      return icons[key] || 'el-icon-menu';
    },

    // 获取功能描述
    getFeatureDesc(key) {
      const descs = {
        'gb-devices': '管理国标设备连接',
        'push-streams': '管理推流通道',
        'pull-proxy': '管理拉流代理',
        'node-management': '管理服务节点',
        'administrative-division': '管理行政区划',
        'business-group': '管理业务分组'
      };
      return descs[key] || '设备管理';
    },

    // 处理返回主页事件
    handleBackToHome() {
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
/* 引入通用管理页面样式 */
@import './managementPages/common-style.css';

/* ========================================
   科技感蓝色UI样式 - 与 camera.vue 一致
   ======================================== */

.camera-management-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  padding: 16px;
}

/* 页面头部 - 科技感卡片样式 */
.page-header {
  margin-bottom: 16px;
}

.header-content {
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: #3b82f6 !important;
  font-size: 14px !important;
  padding: 8px 16px !important;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
}

.back-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
  transform: translateY(-2px) !important;
}

.title-info {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
}

.title-info i {
  font-size: 20px;
  color: #3b82f6;
  margin-right: 8px;
}

.subtitle {
  color: #6b7280;
  font-weight: 400;
  margin-left: 8px;
}

/* 主要内容区域 */
.management-content {
  display: flex;
  flex: 1;
  gap: 16px;
  overflow: hidden;
}

/* 左侧菜单 - 科技感卡片样式 */
.sidebar-menu {
  width: 280px;
  flex-shrink: 0;
}

.menu-card {
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08) !important;
  border: 1px solid rgba(59, 130, 246, 0.1) !important;
  overflow: hidden !important;
}

.menu-card >>> .el-card__header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1) !important;
  padding: 20px !important;
}

.menu-card >>> .el-card__body {
  padding: 16px !important;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.menu-header:hover {
  color: #3b82f6;
}

.menu-header i {
  font-size: 18px;
  color: #3b82f6;
}

.back-to-home-icon {
  font-size: 14px;
  color: #6b7280;
  transition: all 0.3s;
}

.menu-header:hover .back-to-home-icon {
  color: #3b82f6;
  transform: rotate(180deg);
}

.management-menu {
  border: none;
  padding: 8px 0;
  background: transparent !important;
}

/* 菜单项样式 - 科技感优化 */
.menu-item,
.menu-sub-item,
.menu-submenu {
  margin: 8px 0;
  border-radius: 12px;
  transition: all 0.3s;
}

.menu-item-content {
  display: flex;
  align-items: center;
  padding: 2px 0;
}

.menu-item-content.sub-item {
  padding-left: 16px;
}

.menu-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-right: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s;
}

.menu-icon i {
  font-size: 18px;
  color: #6b7280;
  transition: all 0.3s;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.3s;
}

/* 菜单项悬停效果 - 科技感优化 */
.management-menu .el-menu-item:hover .menu-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.management-menu .el-menu-item:hover .menu-icon i {
  color: #3b82f6;
}

.management-menu .el-menu-item:hover .menu-text {
  color: #1e40af;
  font-weight: 600;
}

/* 激活状态 - 科技感优化 */
.management-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.management-menu .el-menu-item.is-active .menu-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.management-menu .el-menu-item.is-active .menu-icon i {
  color: #fff;
}

.management-menu .el-menu-item.is-active .menu-text {
  color: #1e40af;
  font-weight: 600;
}

/* 子菜单样式 - 科技感优化 */
.management-menu .el-submenu__title:hover .menu-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.management-menu .el-submenu__title:hover .menu-icon i {
  color: #3b82f6;
}

.management-menu .el-submenu__title:hover .menu-text {
  color: #1e40af;
}

.management-menu .el-submenu.is-active .el-submenu__title .menu-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
}

.management-menu .el-submenu.is-active .el-submenu__title .menu-icon i {
  color: #fff;
}

.management-menu .el-submenu.is-active .el-submenu__title .menu-text {
  color: #1e40af;
  font-weight: 600;
}

/* 子菜单项样式 */
.menu-sub-item .menu-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.menu-sub-item .menu-icon i {
  font-size: 14px;
}

.menu-sub-item .menu-text {
  font-size: 13px;
}

/* 移除原有的菜单项样式 */
.management-menu .el-menu-item,
.management-menu .el-submenu__title {
  height: auto;
  line-height: normal;
  padding: 16px !important;
  border-radius: 12px;
  margin: 8px 0;
  border: none;
  background: transparent !important;
}

/* 特别处理submenu标题的对齐问题 */
.management-menu .el-submenu__title {
  padding: 16px !important;
  margin: 8px 0;
  position: relative;
}

/* 重置submenu默认样式，确保与menu-item对齐 */
.management-menu .el-submenu > .el-submenu__title {
  padding-left: 16px !important;
  padding-right: 16px !important;
}

/* 调整submenu展开图标位置 */
.management-menu .el-submenu__title .el-submenu__icon-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 0;
  margin-left: 0;
  color: #6b7280;
  transition: all 0.3s;
}

.management-menu .el-submenu__title:hover .el-submenu__icon-arrow {
  color: #3b82f6;
}

/* 确保submenu内容与其他菜单项内容对齐 */
.management-menu .el-submenu__title .menu-item-content {
  margin-right: 30px; /* 为展开图标留出空间 */
}

.management-menu .el-menu-item:hover,
.management-menu .el-submenu__title:hover {
  background-color: transparent !important;
}

.management-menu .el-submenu .el-menu-item {
  padding: 12px 16px !important;
  height: auto;
  line-height: normal;
  margin: 4px 0;
}

/* 右侧内容区域 - 科技感优化 */
.content-area {
  flex: 1;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  overflow-y: auto;
}

/* 默认内容 - 科技感优化 */
.default-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08) !important;
  border: 1px solid rgba(59, 130, 246, 0.1) !important;
  overflow: hidden !important;
}

.welcome-card >>> .el-card__body {
  padding: 40px !important;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.welcome-icon i {
  font-size: 64px;
  color: #3b82f6;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-title {
  font-size: 24px;
  color: #1e40af;
  margin-bottom: 12px;
  font-weight: 600;
}

.welcome-desc {
  font-size: 16px;
  color: #6b7280;
}

/* 功能卡片网格 - 科技感优化 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.feature-card {
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08) !important;
  border: 1px solid rgba(59, 130, 246, 0.1) !important;
  overflow: hidden !important;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
}

.feature-card >>> .el-card__body {
  padding: 20px !important;
}

.feature-content {
  display: flex;
  align-items: center;
  padding: 0;
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  margin-right: 16px;
  transition: all 0.3s;
}

.feature-card:hover .feature-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.feature-icon i {
  font-size: 24px;
  color: #3b82f6;
  transition: all 0.3s;
}

.feature-card:hover .feature-icon i {
  color: #fff;
}

.feature-info {
  flex: 1;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 6px;
}

.feature-desc {
  font-size: 14px;
  color: #6b7280;
}

/* 科技感按钮样式 - 与 camera.vue 一致 */
.camera-management-main >>> .el-button {
  height: 32px;
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0;
}

.camera-management-main >>> .el-button--primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(30, 64, 175, 0.3) !important;
  position: relative !important;
  overflow: hidden !important;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
}

.camera-management-main >>> .el-button--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.camera-management-main >>> .el-button--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 4px 8px rgba(30, 64, 175, 0.4) !important;
  transform: translateY(-2px) !important;
}

.camera-management-main >>> .el-button--primary:hover::before {
  left: 100%;
}

.camera-management-main >>> .el-button:not(.el-button--primary) {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  color: #4b5563 !important;
  transition: all 0.3s ease !important;
}

.camera-management-main >>> .el-button:not(.el-button--primary):hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
  transform: translateY(-1px) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .management-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .sidebar-menu {
    width: 100%;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style> 
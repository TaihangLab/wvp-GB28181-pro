<template>
  <div id="UiHeader">
    <el-menu router
      :default-active="activeIndex"
      menu-trigger="click"
      background-color="#001F3F"
      text-color="#CCD6F6"
      active-text-color="#4BD8FF"
      mode="horizontal"
      :unique-opened="true"
      class="modern-menu">

      <!-- Logo区域 -->
      <div class="logo-container">
        <img src="static/logo.png" alt="Logo" class="logo-image"/>
        <div class="logo-text-container">
          <div class="logo-brand-name">
            <span class="brand-group">太行</span>
            <span class="brand-dot">·</span>
            <span class="brand-group">慧眼</span>
          </div>
          <div class="logo-text-right">
            <span class="logo-text">太行视觉AI平台</span>
            <span class="logo-subtitle"><span class="logo-subtitle-highlight">洞察万象，识图于微</span></span>
          </div>
        </div>
      </div>

      <!-- 监控预警菜单 -->
      <el-submenu index="/monitoring" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-video-camera"></i>
          <span>监控预警</span>
        </template>
        <el-menu-item index="/monitoring/realtime">实时监控</el-menu-item>
        <el-menu-item index="/monitoring/statistics">统计分析</el-menu-item>
        <el-menu-item index="/monitoring/warningArchive">预警档案</el-menu-item>
        <el-menu-item index="/monitoring/warningManage">预警管理</el-menu-item>
        <el-menu-item index="/monitoring/intelligentReview">智能复判</el-menu-item>
      </el-submenu>

      <!-- 设备管理菜单 -->
      <el-submenu index="/deviceManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-cpu"></i>
          <span>设备配置</span>
        </template>
        <el-menu-item index="/deviceManage/camera">摄像头</el-menu-item>
        <el-menu-item index="/deviceManage/sensor">传感器设备</el-menu-item>
        <el-menu-item index="/deviceManage/network">网络设备</el-menu-item>
        <el-menu-item index="/deviceManage/storage">存储设备</el-menu-item>
      </el-submenu>

      <!-- 模型管理菜单 -->
      <el-submenu index="/modelManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-data-analysis"></i>
          <span>模型管理</span>
        </template>
        <el-menu-item index="/modelManage/modelList">模型列表</el-menu-item>
        <el-menu-item index="/modelManage/modelTrain">模型训练</el-menu-item>
        <el-menu-item index="/modelManage/modelDeploy">模型部署</el-menu-item>
      </el-submenu>

      <!-- 技能管理菜单 -->
      <el-submenu index="/skillManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-magic-stick"></i>
          <span>技能管理</span>
        </template>
        <el-menu-item index="/skillManage/deviceSkills">视觉模型技能</el-menu-item>
        <el-menu-item index="/skillManage/multimodalLlmSkills">多模态大模型技能</el-menu-item>
        <el-menu-item index="/skillManage/multimodalReview">多模态大模型复判</el-menu-item>
      </el-submenu>

      <!-- 智能管控菜单 -->
      <el-submenu index="/intelligentControl" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-monitor"></i>
          <span>智能管控</span>
        </template>
        <el-menu-item index="/intelligentControl/logRecord">日志记录</el-menu-item>
        <el-menu-item index="/edgeManage/edgeServer">边缘服务器</el-menu-item>
        <el-menu-item index="/edgeManage/edgeBox">边缘盒子</el-menu-item>
      </el-submenu>

      <!-- 系统管理菜单 -->
      <el-submenu index="/systemManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/systemManage/appSettings">应用设置</el-menu-item>
        <el-menu-item index="/systemManage/userManagement">用户管理</el-menu-item>
        <el-menu-item index="/systemManage/roleManagement">角色管理</el-menu-item>
        <el-menu-item index="/systemManage/tenantManagement">租户管理</el-menu-item>
        <el-menu-item index="/systemManage/departmentManagement">部门管理</el-menu-item>
        <el-menu-item index="/systemManage/positionManagement">岗位管理</el-menu-item>
        <el-menu-item index="/systemManage/knowledgeBase">知识库管理</el-menu-item>
      </el-submenu>

      <!-- 可视中心菜单 -->
      <el-submenu index="/visualAI" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-view"></i>
          <span>可视中心</span>
        </template>
        <el-menu-item index="/visualCenter">可视中心首页</el-menu-item>
        <el-menu-item index="/algorithmInference">算法推理平台</el-menu-item>
        <el-menu-item index="/visualCenter/parkManagement">园区封闭管理平台</el-menu-item>
      </el-submenu>



      <!-- 用户菜单 -->
      <el-submenu index="" class="user-menu" popper-class="modern-submenu">
        <template slot="title">
          <el-avatar :size="28" icon="el-icon-user" class="user-avatar"></el-avatar>
          <span>{{ username }}</span>
        </template>
        <el-menu-item @click="goToProfile">
          <i class="el-icon-user-solid"></i>
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item @click="changePassword">
          <i class="el-icon-key"></i>
          <span>修改密码</span>
        </el-menu-item>
        <el-menu-item @click="loginout">
          <i class="el-icon-switch-button"></i>
          <span>注销</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    <changePasswordDialog ref="changePasswordDialog"></changePasswordDialog>
  </div>
</template>

<script>
import changePasswordDialog from '../components/dialog/changePassword.vue'
import userService from '../components/service/UserService'
import {Notification} from 'element-ui';

export default {
  name: "UiHeader",
  components: {Notification, changePasswordDialog},
  data() {
    return {
      username: userService.getUser().username,
      activeIndex: this.$route.path.indexOf("/", 1)>0?this.$route.path.substring(0, this.$route.path.indexOf("/", 1)):this.$route.path,
      editUser: userService.getUser() ? userService.getUser().role.id === 1 : false
    };
  },
  created() {
    console.log(34334)
    console.log(this.$route.path)
    console.log(this.$route.path.indexOf("/", 1))
    console.log(this.activeIndex)
    if (this.$route.path.startsWith("/channelList")) {
      this.activeIndex = "/deviceList"
    }
  },
  mounted() {
    // 添加通道管理菜单的特殊处理
    this.$nextTick(() => {
      // 获取到通道管理的菜单项
      const channelSubmenu = document.querySelector('.el-submenu[index="/channel"]');
      if (channelSubmenu) {
        const channelTitle = channelSubmenu.querySelector('.el-submenu__title');
        if (channelTitle) {
          // 阻止点击通道管理时的冒泡，防止触发父菜单的关闭
          channelTitle.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
      }
    });
  },
  methods: {
    loginout() {
      this.$axios({
        method: 'get',
        url: "/api/user/logout"
      }).then((res) => {
        // 删除用户信息，回到登录页面
        userService.clearUserInfo()
        this.$router.push('/login');
        // 刷新页面，确保登录界面布局正常
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }).catch((error) => {
        console.error("登出失败")
        console.error(error)
        // 即使登出API失败，也要清除本地信息并刷新
        userService.clearUserInfo()
        this.$router.push('/login');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      });
    },
    changePassword() {
      this.$refs.changePasswordDialog.openDialog()
    },
    goToProfile() {
      this.$router.push('/systemManage/profile');
    },
    openDoc() {
      console.log(process.env.BASE_API)
      window.open(!!process.env.BASE_API ? process.env.BASE_API + "/doc.html" : "/doc.html")
    }
  },
  destroyed() {
    // 组件销毁时的清理工作
  },

}

</script>
<style>
#UiHeader {
  width: 100%;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 现代化菜单 */
.modern-menu {
  width: 100%;
  padding: 0;
  margin: 0;
  border-right: none;
  border-bottom: none;
  display: flex;
  align-items: center;
  height: 60px;
  /* 保持原来的深蓝色背景 */
  background-color: #001F3F;
  position: relative;
  overflow: hidden;
}

/* 添加科技感光效 */
.modern-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(75, 216, 255, 0.1) 50%, 
    transparent 100%);
  animation: shimmer 8s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Logo样式 */
.logo-container {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-right: 20px;
  height: 60px;
  border-right: 1px solid rgba(75, 216, 255, 0.2);
  position: relative;
  z-index: 2;
  min-width: 280px;
}

.logo-image {
  height: 36px;
  width: auto;
  margin-right: 10px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.logo-container:hover .logo-image {
  transform: scale(1.05);
  filter: drop-shadow(0 0 10px rgba(75, 216, 255, 0.6));
}

.logo-text-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 1.2;
  gap: 12px;
}

.logo-brand-name {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: #4BD8FF;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 0 12px rgba(75, 216, 255, 0.6);
  border-right: 2px solid rgba(75, 216, 255, 0.3);
  padding-right: 8px;
  height: 42px;
  gap: 3px;
}

.brand-group {
  writing-mode: vertical-lr;
  text-orientation: upright;
  letter-spacing: 0.5px;
  line-height: 1;
}

.brand-dot {
  font-size: 8px;
  color: #00BFFF;
  text-shadow: 0 0 10px rgba(0, 191, 255, 0.8);
  margin: 0;
  line-height: 1;
  align-self: center;
  width: 8px;
  text-align: center;
}

.logo-text-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.logo-text {
  color: #4BD8FF;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 0 0 15px rgba(75, 216, 255, 0.6);
  position: relative;
  margin-bottom: 2px;
}

.logo-subtitle {
  color: #CCD6F6;
  font-size: 11px;
  font-weight: 400;
  white-space: nowrap;
  letter-spacing: 0.3px;
  text-shadow: 0 0 8px rgba(204, 214, 246, 0.4);
  opacity: 0.8;
  transition: all 0.3s ease;
}

.logo-subtitle-highlight {
  font-size: 13px;
  font-weight: 500;
  color: #4BD8FF;
  text-shadow: 0 0 12px rgba(75, 216, 255, 0.6);
  opacity: 1;
}

.logo-container:hover .logo-brand-name {
  color: #00BFFF;
  text-shadow: 0 0 15px rgba(0, 191, 255, 0.8);
  border-right-color: rgba(0, 191, 255, 0.6);
}

.logo-container:hover .brand-group {
  color: #00BFFF;
  text-shadow: 0 0 15px rgba(0, 191, 255, 0.8);
}

.logo-container:hover .brand-dot {
  color: #FFFFFF;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.9);
}

.logo-container:hover .logo-subtitle {
  opacity: 1;
  color: #4BD8FF;
  text-shadow: 0 0 10px rgba(75, 216, 255, 0.5);
}

.logo-container:hover .logo-subtitle-highlight {
  color: #00BFFF;
  text-shadow: 0 0 15px rgba(0, 191, 255, 0.8);
}

.logo-text::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4BD8FF, #06b6d4);
  transition: width 0.3s ease;
}

.logo-container:hover .logo-text::after {
  width: 100%;
}

/* 用户菜单 */
.user-menu {
  margin-left: auto !important;
  position: relative;
  z-index: 2;
}

.user-menu .el-submenu__title {
  padding: 0 20px;
  position: relative;
  transition: all 0.3s ease;
}

.user-avatar {
  margin-right: 8px;
  background: linear-gradient(135deg, #4BD8FF 0%, #06b6d4 100%);
  border: 2px solid rgba(75, 216, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(75, 216, 255, 0.3);
}

.user-menu:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(75, 216, 255, 0.8);
  border-color: rgba(75, 216, 255, 0.8);
}

/* 样式已移除，不再需要switch-label */

/* 菜单项样式 */
.modern-menu .el-menu-item,
.modern-menu .el-submenu__title {
  height: 60px;
  line-height: 60px;
  padding: 0 15px;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  border-radius: 4px;
  margin: 0 2px;
}

.modern-menu .el-menu-item:hover,
.modern-menu .el-submenu__title:hover {
  background: linear-gradient(135deg, 
    rgba(75, 216, 255, 0.1) 0%, 
    rgba(75, 216, 255, 0.05) 100%) !important;
  color: #4BD8FF !important;
  box-shadow: 0 4px 15px rgba(75, 216, 255, 0.2);
  transform: translateY(-1px);
}

.modern-menu .el-menu-item i,
.modern-menu .el-submenu__title i {
  margin-right: 5px;
  font-size: 18px;
  vertical-align: middle;
  transition: all 0.3s ease;
}

.modern-menu .el-menu-item:hover i,
.modern-menu .el-submenu__title:hover i {
  transform: translateY(-2px) scale(1.1);
  text-shadow: 0 0 10px rgba(75, 216, 255, 0.8);
}

/* 子菜单样式 */
.modern-submenu {
  background: linear-gradient(135deg, #002B56 0%, #003B76 100%) !important;
  border: 1px solid rgba(75, 216, 255, 0.2) !important;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
              0 0 20px rgba(75, 216, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-submenu .el-menu-item {
  color: #CCD6F6 !important;
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin: 2px 4px;
}

.modern-submenu .el-menu-item:hover {
  background: linear-gradient(135deg, 
    rgba(75, 216, 255, 0.15) 0%, 
    rgba(75, 216, 255, 0.08) 100%) !important;
  color: #4BD8FF !important;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(75, 216, 255, 0.2);
}

.modern-submenu .el-menu-item.is-active {
  background: linear-gradient(135deg, 
    rgba(75, 216, 255, 0.2) 0%, 
    rgba(75, 216, 255, 0.1) 100%) !important;
  color: #4BD8FF !important;
  border-left: 3px solid #4BD8FF;
}

/* 嵌套子菜单 */
.nested-submenu {
  min-width: 150px;
}

/* 活动状态样式 */
#UiHeader .el-menu-item.is-active {
  color: #4BD8FF !important;
  background: linear-gradient(135deg, 
    rgba(75, 216, 255, 0.15) 0%, 
    rgba(75, 216, 255, 0.08) 100%) !important;
  border-bottom: 3px solid #4BD8FF;
  box-shadow: 0 4px 15px rgba(75, 216, 255, 0.3);
  position: relative;
}

#UiHeader .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(75, 216, 255, 0.1) 50%, 
    transparent 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

#UiHeader .el-submenu.is-active .el-submenu__title {
  color: #4BD8FF !important;
  background: linear-gradient(135deg, 
    rgba(75, 216, 255, 0.15) 0%, 
    rgba(75, 216, 255, 0.08) 100%) !important;
  border-bottom: 3px solid #4BD8FF;
  box-shadow: 0 4px 15px rgba(75, 216, 255, 0.3);
}

#UiHeader .el-submenu.is-active .el-submenu__icon-arrow {
  color: #4BD8FF !important;
  text-shadow: 0 0 10px rgba(75, 216, 255, 0.8);
}

/* 箭头图标位置调整 */
.el-submenu__icon-arrow {
  margin-top: 0;
  font-size: 12px;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.el-submenu:hover .el-submenu__icon-arrow {
  transform: rotate(180deg);
}

/* 调整菜单响应式行为 */
@media screen and (max-width: 1200px) {
  .modern-menu .el-menu-item,
  .modern-menu .el-submenu__title {
    padding: 0 10px;
  }

  .logo-container {
    padding: 0 10px;
    margin-right: 10px;
  }

  .logo-text {
    font-size: 16px;
  }
}

@media screen and (max-width: 992px) {
  .modern-menu .el-menu-item span,
  .modern-menu .el-submenu__title span {
    display: none;
  }

  .modern-menu .el-menu-item i,
  .modern-menu .el-submenu__title i {
    margin-right: 0;
    font-size: 20px;
  }

  .logo-text {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .logo-container {
    min-width: auto;
    padding: 0 15px;
  }
  
  .logo-text-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .logo-brand-name {
    flex-direction: row;
    border-right: none;
    border-bottom: 2px solid rgba(75, 216, 255, 0.3);
    padding-right: 0;
    padding-bottom: 4px;
    height: auto;
    width: 100%;
    justify-content: center;
    gap: 4px;
  }
  
  .logo-text {
    font-size: 14px;
    display: block;
  }
  
  .logo-subtitle-highlight {
    font-size: 11px;
  }
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

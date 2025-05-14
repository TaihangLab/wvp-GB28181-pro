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
        <span class="logo-text">太行视觉AI平台</span>
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
      </el-submenu>
      
      <!-- 设备管理菜单 -->
      <el-submenu index="/deviceManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-cpu"></i>
          <span>设备配置</span>
        </template>
        <el-menu-item index="/deviceManage/camera">摄像头</el-menu-item>
      </el-submenu>
      
      <!-- 模型管理菜单 -->
      <el-submenu index="/modelManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-data-analysis"></i>
          <span>模型管理</span>
        </template>
        <el-menu-item index="/modelManage/modelList">模型列表</el-menu-item>
      </el-submenu>
      
      <!-- 技能管理菜单 -->
      <el-submenu index="/skillManage" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-magic-stick"></i>
          <span>技能管理</span>
        </template>
        <el-menu-item index="/skillManage/deviceSkills">技能列表</el-menu-item>
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
      
      <!-- WVP菜单 -->
      <el-submenu index="/videoMonitor" popper-class="modern-submenu">
        <template slot="title">
          <i class="el-icon-video-play"></i>
          <span>流媒体中心</span>
        </template>
        <el-menu-item index="/console">控制台</el-menu-item>
        <el-menu-item index="/live">分屏监控</el-menu-item>
        <el-menu-item index="/deviceList">国标设备</el-menu-item>
        <el-menu-item index="/streamPushList">推流列表</el-menu-item>
        <el-menu-item index="/streamProxyList">拉流代理</el-menu-item>
        <el-menu-item index="/recordPlan">录制计划</el-menu-item>
        <el-menu-item index="/cloudRecord">云端录像</el-menu-item>
        <el-menu-item index="/mediaServerManger">节点管理</el-menu-item>
        <el-menu-item index="/platformList/15/1">国标级联</el-menu-item>
        
        <el-submenu index="/channel" popper-append-to-body popper-class="modern-submenu nested-submenu">
          <template slot="title">通道管理</template>
          <el-menu-item index="/channel/region">行政区划</el-menu-item>
          <el-menu-item index="/channel/group">业务分组</el-menu-item>
        </el-submenu>

        <el-menu-item v-if="editUser" index="/userManager">
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/operations">
          <span>运维中心</span>
        </el-menu-item>
      </el-submenu>
      
      <!-- 用户菜单 -->
      <el-submenu index="" class="user-menu" popper-class="modern-submenu">
        <template slot="title">
          <el-avatar :size="28" icon="el-icon-user" class="user-avatar"></el-avatar>
          <span>{{ username }}</span>
        </template>
        <!-- <el-menu-item @click="openDoc">
          <i class="el-icon-document"></i>
          <span>在线文档</span>
        </el-menu-item> -->
        <el-menu-item>
          <i class="el-icon-bell"></i>
          <el-switch v-model="alarmNotify" 
            active-color="#13ce66" 
            inactive-color="#ff4949" 
            @change="alarmNotifyChannge">
          </el-switch>
          <span class="switch-label">报警信息推送</span>
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
      alarmNotify: false,
      sseSource: null,
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
    window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
    this.alarmNotify = this.getAlarmSwitchStatus() === "true";

    // TODO: 此处延迟连接 sse, 避免 sse 连接时 browserId 还未生成, 后续待优化
    setTimeout(() => {
      this.sseControl()
    }, 3000);
    
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
        if (this.sseSource != null) {
          this.sseSource.close();
        }

      }).catch((error) => {
        console.error("登出失败")
        console.error(error)
      });
    },
    changePassword() {
      this.$refs.changePasswordDialog.openDialog()
    },
    openDoc() {
      console.log(process.env.BASE_API)
      window.open(!!process.env.BASE_API ? process.env.BASE_API + "/doc.html" : "/doc.html")
    },
    beforeunloadHandler() {
      this.sseSource.close();
    },
    alarmNotifyChannge() {
      this.setAlarmSwitchStatus()
      this.sseControl()
    },
    sseControl() {
      let that = this;
      if (this.alarmNotify) {
        console.log("申请SSE推送API调用，浏览器ID: " + this.$browserId);
        let url = (process.env.NODE_ENV === 'development' ? "debug" : "") + 'api/emit?browserId=' + this.$browserId
        this.sseSource = new EventSource(url);
        this.sseSource.addEventListener('message', function (evt) {
          console.log("收到信息：" + evt.data);
          let data = JSON.parse(evt.data)
          that.$notify({
            title: '报警信息',
            dangerouslyUseHTMLString: true,
            message: `<strong>设备名称：</strong> <i> ${data.deviceName}</i>` +
                     `<br><strong>设备编号：</strong> <i>${ data.deviceId}</i>` +
                     `<br><strong>通道编号：</strong> <i>${ data.channelId}</i>` +
                     `<br><strong>报警级别：</strong> <i>${ data.alarmPriorityDescription}</i>` +
                     `<br><strong>报警方式：</strong> <i>${ data.alarmMethodDescription}</i>` +
                     `<br><strong>报警类型：</strong> <i>${ data.alarmTypeDescription}</i>` +
                     `<br><strong>报警时间：</strong> <i>${ data.alarmTime}</i>`,
            type: 'warning',
            position: 'bottom-right',
            duration: 5000
          });
        });
        this.sseSource.addEventListener('open', function (e) {
          console.log("SSE连接打开.");
        }, false);
        this.sseSource.addEventListener('error', function (e) {
          if (e.target.readyState == EventSource.CLOSED) {
            console.log("SSE连接关闭");
          } else {
            console.log(e.target.readyState);
          }
        }, false);
      } else {
        if (this.sseSource != null) {
          this.sseSource.removeEventListener('open', null);
          this.sseSource.removeEventListener('message', null);
          this.sseSource.removeEventListener('error', null);
          this.sseSource.close();
        }

      }
    },
    getAlarmSwitchStatus() {
      if (localStorage.getItem("alarmSwitchStatus") == null) {
        localStorage.setItem("alarmSwitchStatus", false);
      }
      return localStorage.getItem("alarmSwitchStatus");
    },
    setAlarmSwitchStatus() {
      localStorage.setItem("alarmSwitchStatus", this.alarmNotify);
    }
  },
  destroyed() {
    window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
    if (this.sseSource != null) {
      this.sseSource.removeEventListener('open', null);
      this.sseSource.removeEventListener('message', null);
      this.sseSource.removeEventListener('error', null);
      this.sseSource.close();
    }
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
}

/* Logo样式 */
.logo-container {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-right: 20px;
  height: 60px;
  border-right: 1px solid rgba(204, 214, 246, 0.1);
}

.logo-image {
  height: 36px;
  width: auto;
  margin-right: 10px;
  object-fit: contain;
}

.logo-text {
  color: #4BD8FF;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(75, 216, 255, 0.4);
}

/* 用户菜单 */
.user-menu {
  margin-left: auto !important;
}

.user-menu .el-submenu__title {
  padding: 0 20px;
  position: relative;
}

.user-avatar {
  margin-right: 8px;
  background-color: #4BD8FF;
  border: 2px solid rgba(75, 216, 255, 0.2);
  transition: all 0.3s ease;
}

.user-menu:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(75, 216, 255, 0.5);
}

.switch-label {
  margin-left: 8px;
  font-size: 14px;
}

/* 菜单项样式 */
.modern-menu .el-menu-item, 
.modern-menu .el-submenu__title {
  height: 60px;
  line-height: 60px;
  padding: 0 15px;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
}

.modern-menu .el-menu-item:hover, 
.modern-menu .el-submenu__title:hover {
  background-color: rgba(75, 216, 255, 0.05) !important;
  color: #4BD8FF !important;
}

.modern-menu .el-menu-item i, 
.modern-menu .el-submenu__title i {
  margin-right: 5px;
  font-size: 18px;
  vertical-align: middle;
  transition: transform 0.3s ease;
}

.modern-menu .el-menu-item:hover i, 
.modern-menu .el-submenu__title:hover i {
  transform: translateY(-2px);
}

/* 子菜单样式 */
.modern-submenu {
  background-color: #002B56 !important;
  border: none !important;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;
}

.modern-submenu .el-menu-item {
  color: #CCD6F6 !important;
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
}

.modern-submenu .el-menu-item:hover {
  background-color: #003B76 !important;
  color: #4BD8FF !important;
}

.modern-submenu .el-menu-item.is-active {
  background-color: #004C97 !important;
  color: #4BD8FF !important;
}

/* 嵌套子菜单 */
.nested-submenu {
  min-width: 150px;
}

/* 活动状态样式 */
#UiHeader .el-menu-item.is-active {
  color: #4BD8FF !important;
  background-color: rgba(75, 216, 255, 0.1) !important;
  border-bottom: 2px solid #4BD8FF;
}

#UiHeader .el-submenu.is-active .el-submenu__title {
  color: #4BD8FF !important;
  background-color: rgba(75, 216, 255, 0.1) !important;
  border-bottom: 2px solid #4BD8FF;
}

#UiHeader .el-submenu.is-active .el-submenu__icon-arrow {
  color: #4BD8FF !important;
}

/* 箭头图标位置调整 */
.el-submenu__icon-arrow {
  margin-top: 0;
  font-size: 12px;
  margin-left: 5px;
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

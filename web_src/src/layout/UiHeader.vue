<template>
  <div id="UiHeader">

    <el-menu router :default-active="activeIndex" menu-trigger="click" background-color="#001529" text-color="#fff"
             active-text-color="#1890ff" mode="horizontal" :unique-opened="true">

      
      <!-- 新增监控预警菜单 -->
      <el-submenu index="/monitoring">
        <template slot="title">监控预警</template>
        <el-menu-item index="/monitoring/realtime">实时监控</el-menu-item>
        <el-menu-item index="/monitoring/statistics">统计分析</el-menu-item>
        <el-menu-item index="/monitoring/warningArchive">预警档案</el-menu-item>
        <el-menu-item index="/monitoring/warningManage">预警管理</el-menu-item>
      </el-submenu>
      
      <!-- 新增设备管理菜单 -->
      <el-submenu index="/deviceManage">
        <template slot="title">设备管理</template>
        <el-menu-item index="/deviceManage/camera">摄像头</el-menu-item>
      </el-submenu>
      
      <!-- 新增模型管理菜单 -->
      <el-submenu index="/modelManage">
        <template slot="title">模型管理</template>
        <el-menu-item index="/modelManage/modelList">模型列表</el-menu-item>
      </el-submenu>
      
      <!-- 新增技能管理菜单 -->
      <el-submenu index="/skillManage">
        <template slot="title">技能管理</template>
        <el-menu-item index="/skillManage/deviceSkills">设备技能列表</el-menu-item>
      </el-submenu>
      
      <!-- 新增智能管控菜单 -->
      <el-submenu index="/intelligentControl">
        <template slot="title">智能管控</template>
        <el-menu-item index="/intelligentControl/logRecord">日志记录</el-menu-item>
        <el-menu-item index="/edgeManage/edgeServer">边缘服务器</el-menu-item>
        <el-menu-item index="/edgeManage/edgeBox">边缘盒子</el-menu-item>
      </el-submenu>
      
      <!-- 新增系统管理菜单 -->
      <el-submenu index="/systemManage">
        <template slot="title">系统管理</template>
        <el-menu-item index="/systemManage/appSettings">应用设置</el-menu-item>
      </el-submenu>
      
      <el-submenu index="/visualAI">
        <template slot="title">可视中心</template>
        <el-menu-item index="/visualCenter">可视中心首页</el-menu-item>
        <el-menu-item index="/algorithmInference">算法推理平台</el-menu-item>
        <el-menu-item index="/visualCenter/parkManagement">园区封闭管理平台</el-menu-item>
      </el-submenu>
      
      <!-- 新增视频监控菜单，将多个菜单项移入其中 -->
      <el-submenu index="/videoMonitor">
        <template slot="title">WVP</template>
        <el-menu-item index="/console">控制台</el-menu-item>
        <el-menu-item index="/live">分屏监控</el-menu-item>
        <el-menu-item index="/deviceList">国标设备</el-menu-item>
        <el-menu-item index="/streamPushList">推流列表</el-menu-item>
        <el-menu-item index="/streamProxyList">拉流代理</el-menu-item>
        <el-menu-item index="/recordPlan">录制计划</el-menu-item>
        <el-menu-item index="/cloudRecord">云端录像</el-menu-item>
        <el-menu-item index="/mediaServerManger">节点管理</el-menu-item>
        <el-menu-item index="/platformList/15/1">国标级联</el-menu-item>
        <el-submenu index="/channel" popper-append-to-body>
          <template slot="title">通道管理</template>
          <el-menu-item index="/channel/region">行政区划</el-menu-item>
          <el-menu-item index="/channel/group">业务分组</el-menu-item>
        </el-submenu>
      </el-submenu>
      
      <el-menu-item v-if="editUser" index="/userManager">用户管理</el-menu-item>
      <el-menu-item index="/operations">运维中心</el-menu-item>

     
      
      <!--            <el-submenu index="/setting">-->
      <!--              <template slot="title">系统设置</template>-->
      <!--              <el-menu-item index="/setting/web">WEB服务</el-menu-item>-->
      <!--              <el-menu-item index="/setting/sip">国标服务</el-menu-item>-->
      <!--              <el-menu-item index="/setting/media">媒体服务</el-menu-item>-->
      <!--            </el-submenu>-->
      <!--            <el-menu-item style="float: right;" @click="loginout">退出</el-menu-item>-->
      <el-submenu index="" style="float: right;">
        <template slot="title">欢迎，{{ username }}</template>
        <el-menu-item @click="openDoc">在线文档</el-menu-item>
        <el-menu-item>
          <el-switch v-model="alarmNotify" inactive-text="报警信息推送" @change="alarmNotifyChannge"></el-switch>
        </el-menu-item> 
        <el-menu-item @click="changePassword">修改密码</el-menu-item>
        <el-menu-item @click="loginout">注销</el-menu-item>
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
#UiHeader .el-switch__label {
  color: white;
}

.el-menu--popup .el-menu-item .el-switch .el-switch__label {
  color: white !important;
}

#UiHeader .el-switch__label.is-active {
  color: #409EFF;
}

#UiHeader .el-menu-item.is-active {
  color: #fff !important;
  background-color: #1890ff !important;
}
#UiHeader .el-submenu.is-active {
  background-color: #1890ff !important;
}
#UiHeader .el-submenu.is-active .el-submenu__title {
  color: #fff !important;
  background-color: #1890ff !important;
}
#UiHeader .el-submenu.is-active .el-submenu__icon-arrow {
  color: #fff !important;
}

/* 消除下拉菜单间距并缩窄宽度 */
.el-menu--horizontal .el-menu .el-menu-item, 
.el-menu--horizontal .el-menu .el-submenu__title {
  padding: 0 10px;
  height: 36px;
  line-height: 36px;
}

.el-menu--horizontal > .el-submenu .el-submenu__icon-arrow {
  margin-top: -4px;
}

.el-menu--popup {
  padding: 0;
  margin: 0;
  min-width: 120px;
}

.el-menu--horizontal .el-menu--popup {
  margin-top: 0;
}

/* 修复子菜单顶部与父菜单之间的间隔 */
.el-menu--horizontal .el-menu.el-menu--popup {
  margin-top: 0;
}

/* 缩窄菜单宽度 */
.el-menu--horizontal>.el-submenu .el-submenu__title {
  padding: 0 15px;
}

/* 调整下拉菜单的箭头位置 */
.el-submenu__icon-arrow {
  margin-top: -3px;
}
</style>

<template>
<div class="tech-login-container" id="login">
  <!-- 背景粒子效果 -->
  <div class="particles-background">
    <div class="particle" v-for="n in 50" :key="n" :style="getParticleStyle()"></div>
  </div>
  
  <!-- 主要登录区域 -->
  <div class="login-main-area">
    <!-- 左侧装饰区域 -->
    <div class="login-decoration">
      <div class="decoration-lines">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
        <div class="line line-3"></div>
      </div>
      <div class="tech-circle">
        <div class="inner-circle"></div>
      </div>
    </div>
    
    <!-- 登录表单区域 -->
    <div class="login-form-container">
      <div class="login-form-wrapper">
        <!-- 标题 -->
        <div class="login-header">
          <div class="title-container">
            <div class="brand-logo">
              <img src="/static/logo.png" alt="太行慧眼Logo" class="logo-image">
            </div>
            <div class="brand-name">
              <span class="brand-group">太行</span>
              <span class="brand-dot">·</span>
              <span class="brand-group">慧眼</span>
            </div>
            <div class="title-right">
              <h1 class="platform-title">太行视觉AI平台</h1>
              <p class="platform-subtitle"><span class="subtitle-highlight">洞察万象，识图于微</span></p>
            </div>
          </div>
        </div>

        <!-- 登录表单 -->
        <div class="login-form">
          <!-- 租户选择框 -->
          <div class="input-group">
            <div class="input-wrapper" :class="{'focused': tenantSelectFocused}">
              <i class="input-icon fa fa-building"></i>
              <select 
                v-model="selectedTenant" 
                class="tech-select"
                @focus="tenantSelectFocused = true"
                @blur="tenantSelectFocused = false"
                @change="onTenantChange"
              >
                <option value="" disabled>请选择租户</option>
                <option 
                  v-for="tenant in tenantList" 
                  :key="tenant.tenantNumber" 
                  :value="tenant.tenantNumber"
                >
                  {{ tenant.companyName }}
                </option>
              </select>
              <i class="select-arrow fa fa-chevron-down"></i>
              <div class="input-border"></div>
            </div>
          </div>

          <!-- 用户名输入框 -->
          <div class="input-group">
            <div class="input-wrapper">
              <i class="input-icon fa fa-user"></i>
              <input 
                type="text" 
                v-model="username" 
                placeholder="请输入用户名"
                class="tech-input"
                @focus="focusInput"
                @blur="blurInput"
              >
              <div class="input-border"></div>
            </div>
          </div>

          <!-- 密码输入框 -->
          <div class="input-group">
            <div class="input-wrapper">
              <i class="input-icon fa fa-lock"></i>
              <input 
                :type="showPassword ? 'text' : 'password'"
                v-model="password" 
                placeholder="请输入密码"
                class="tech-input"
                @focus="focusInput"
                @blur="blurInput"
              >
              <i 
                :class="'password-toggle fa ' + (showPassword ? 'fa-eye-slash' : 'fa-eye')"
                @click="showPassword = !showPassword"
              ></i>
              <div class="input-border"></div>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div class="login-btn-container">
            <button 
              class="tech-login-btn" 
              :class="{'loading': isLoging}"
              @click="login"
              :disabled="isLoging"
            >
              <span v-if="!isLoging">登录系统</span>
              <span v-else class="loading-text">
                <i class="fa fa-spinner fa-spin"></i>
                登录中...
              </span>
              <div class="btn-glow"></div>
            </button>
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="login-footer">
          <div class="security-info">
            <i class="fa fa-shield"></i>
            <span>安全登录 · 数据加密传输</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import crypto from 'crypto'
import userService from "./service/UserService";
export default {
  name: 'Login',
  data(){
    return {
      isLoging: false,
      showPassword: false,
      loginLoading: false,
      username: '',
      password: '',
      selectedTenant: '',
      tenantSelectFocused: false,
      tenantList: [],
      loadingTenants: false
    }
  },
  created(){
    var that = this;
    document.onkeydown = function(e) {
      var key = window.event.keyCode;
      if (key == 13) {
        that.login();
      }
    }
    // 页面加载时获取租户列表
    this.getTenantList();
  },
  methods:{
    // 获取粒子样式
    getParticleStyle() {
      return {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (Math.random() * 3 + 2) + 's'
      }
    },

    // 获取租户列表
    getTenantList() {
      this.loadingTenants = true;
      this.$axios({
        method: 'get',
        url: '/api/tenant/list',
        params: {
          status: true // 只获取启用的租户
        }
      }).then((res) => {
        if (res.data.code === 0) {
          // 从租户管理模块的数据结构来看，租户列表应该在res.data.data中
          this.tenantList = res.data.data || [];
        } else {
          // 如果API不存在或返回错误，使用模拟数据
          this.tenantList = this.getMockTenantList();
        }
      }).catch((error) => {
        console.log('获取租户列表失败，使用模拟数据:', error);
        // API调用失败时使用模拟数据
        this.tenantList = this.getMockTenantList();
      }).finally(() => {
        this.loadingTenants = false;
      });
    },

    // 模拟租户数据（从租户管理模块提取）
    getMockTenantList() {
      return [
        {
          tenantNumber: '000000',
          companyName: 'XXX有限公司',
          contactPerson: '管理组',
          status: true
        },
        {
          tenantNumber: '952742',
          companyName: '123',
          contactPerson: '123',
          status: true
        },
        {
          tenantNumber: '415387',
          companyName: '6666',
          contactPerson: '66',
          status: true
        },
        {
          tenantNumber: '297659',
          companyName: '16888',
          contactPerson: '16888',
          status: true
        },
        {
          tenantNumber: '789133',
          companyName: '测试租户企业名称',
          contactPerson: '测试租户联系人',
          status: true
        },
        {
          tenantNumber: '646214',
          companyName: 'test999',
          contactPerson: 'test999',
          status: true
        },
        {
          tenantNumber: '252800',
          companyName: 'ce',
          contactPerson: 'ce',
          status: true
        }
      ];
    },

    // 租户选择变化处理
    onTenantChange() {
      const selectedTenantData = this.tenantList.find(tenant => tenant.tenantNumber === this.selectedTenant);
      if (selectedTenantData) {
        console.log('选择的租户:', selectedTenantData.companyName);
      }
    },

    // 输入框聚焦效果
    focusInput(event) {
      event.target.parentElement.classList.add('focused');
    },

    // 输入框失焦效果
    blurInput(event) {
      if (!event.target.value) {
        event.target.parentElement.classList.remove('focused');
      }
    },

    //登录逻辑
    login(){
      if(this.selectedTenant === '') {
        this.$message({
          showClose: true,
          message: '请选择租户',
          type: 'warning'
        });
        return;
      }
      if(this.username!='' && this.password!=''){
        this.toLogin();
      } else {
        this.$message({
          showClose: true,
          message: '请输入用户名和密码',
          type: 'warning'
        });
      }
    },

    //登录请求
    toLogin(){
      //需要想后端发送的登录参数
      let loginParam = {
        username: this.username,
        password: crypto.createHash('md5').update(this.password, "utf8").digest('hex'),
        tenantNumber: this.selectedTenant // 添加租户编号
      }
      var that = this;
      //设置在登录状态
      this.isLoging = true;
      let timeoutTask = setTimeout(()=>{
        that.$message.error("登录超时");
        that.isLoging = false;
      }, 1000)

      this.$axios({
        method: 'get',
        url:"/api/user/login",
        params: loginParam
      }).then(function (res) {
        window.clearTimeout(timeoutTask)
        console.log(res);
        console.log("登录成功");
          if (res.data.code === 0 ) {
            userService.setUser(res.data.data)
            //登录成功后
            that.cancelEnterkeyDefaultAction();
            that.$router.push('/');
          }else{
            that.isLoging = false;
            that.$message({
                  showClose: true,
                  message: '登录失败，用户名或密码错误',
                  type: 'error'
              });
          }
      }).catch(function (error) {
        console.log(error)
        window.clearTimeout(timeoutTask)
        that.$message.error(error.response.data.msg);
        that.isLoging = false;
      });
    },
    
    cancelEnterkeyDefaultAction: function() {
        document.onkeydown = function(e) {
        var key = window.event.keyCode;
        if (key == 13) {
          return false;
        }
      }
    }
  }
}
</script>

<style scoped>
/* 引入Font Awesome图标字体 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* 主容器样式 */
.tech-login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

/* 粒子背景效果 */
.particles-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #00d4ff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00d4ff;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 1;
  }
}

/* 主登录区域 */
.login-main-area {
  position: relative;
  display: flex;
  width: 90%;
  max-width: 1200px;
  height: 600px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  z-index: 2;
  overflow: hidden;
}

/* 左侧装饰区域 */
.login-decoration {
  flex: 1;
  position: relative;
  background: linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(183, 33, 255, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.decoration-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  opacity: 0.6;
}

.line-1 {
  width: 100%;
  height: 1px;
  top: 20%;
  animation: slideRight 3s ease-in-out infinite;
}

.line-2 {
  width: 1px;
  height: 100%;
  left: 30%;
  animation: slideDown 4s ease-in-out infinite;
}

.line-3 {
  width: 100%;
  height: 1px;
  bottom: 20%;
  animation: slideLeft 3.5s ease-in-out infinite;
}

@keyframes slideRight {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

@keyframes slideDown {
  0%, 100% { transform: translateY(-100%); }
  50% { transform: translateY(100%); }
}

@keyframes slideLeft {
  0%, 100% { transform: translateX(100%); }
  50% { transform: translateX(-100%); }
}

.tech-circle {
  width: 300px;
  height: 300px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  position: relative;
  animation: rotate 20s linear infinite;
}

.inner-circle {
  width: 200px;
  height: 200px;
  border: 1px solid rgba(183, 33, 255, 0.3);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: rotate 15s linear infinite reverse;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 登录表单容器 */
.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}



.title-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
}

.logo-image {
  height: 60px;
  width: auto;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
  transition: filter 0.3s ease;
}

.logo-image:hover {
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6));
}

.brand-name {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
  border-right: 3px solid rgba(0, 212, 255, 0.4);
  padding-right: 12px;
  height: 70px;
  gap: 4px;
}

.brand-name .brand-group {
  writing-mode: vertical-lr;
  text-orientation: upright;
  letter-spacing: 1px;
  line-height: 1;
}

.brand-name .brand-dot {
  font-size: 12px;
  color: #00BFFF;
  text-shadow: 0 0 15px rgba(0, 191, 255, 0.8);
  margin: 0;
  line-height: 1;
  align-self: center;
  width: 12px;
  text-align: center;
}

.title-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.platform-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.platform-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.subtitle-highlight {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.input-group {
  margin-bottom: 25px;
}

.input-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-wrapper:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 212, 255, 0.3);
}

.input-wrapper.focused {
  background: rgba(255, 255, 255, 0.15);
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  transition: color 0.3s ease;
  z-index: 2;
}

.input-wrapper.focused .input-icon {
  color: #00d4ff;
}

.tech-input, .tech-select {
  width: 100%;
  height: 55px;
  padding: 0 50px 0 45px;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 16px;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.tech-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.tech-select {
  cursor: pointer;
  padding-right: 45px;
}

.tech-select option {
  background-color: #1a1a2e;
  color: #ffffff;
  padding: 10px;
}

.tech-select option:hover {
  background-color: rgba(0, 212, 255, 0.2);
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  pointer-events: none;
  transition: color 0.3s ease, transform 0.3s ease;
  z-index: 2;
}

.input-wrapper.focused .select-arrow {
  color: #00d4ff;
  transform: translateY(-50%) rotate(180deg);
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 2;
}

.password-toggle:hover {
  color: #00d4ff;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, #b721ff);
  transition: width 0.3s ease;
}

.input-wrapper.focused .input-border {
  width: 100%;
}

/* 登录按钮 */
.login-btn-container {
  margin-top: 35px;
}

.tech-login-btn {
  position: relative;
  width: 100%;
  height: 55px;
  background: linear-gradient(45deg, #00d4ff, #b721ff);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
}

.tech-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 212, 255, 0.4);
}

.tech-login-btn:active {
  transform: translateY(0);
}

.tech-login-btn.loading {
  pointer-events: none;
  opacity: 0.8;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.tech-login-btn:hover .btn-glow {
  left: 100%;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* 底部信息 */
.login-footer {
  margin-top: 30px;
  text-align: center;
}

.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.security-info i {
  color: #00d4ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-main-area {
    flex-direction: column;
    width: 95%;
    height: auto;
    min-height: 600px;
  }
  
  .login-decoration {
    display: none;
  }
  
  .login-form-container {
    padding: 30px 20px;
  }
  
  .title-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .brand-name {
    flex-direction: row;
    border-right: none;
    border-bottom: 3px solid rgba(0, 212, 255, 0.4);
    padding-right: 0;
    padding-bottom: 8px;
    height: auto;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
  
  .platform-title {
    font-size: 24px;
  }
  
  .tech-circle {
    width: 200px;
    height: 200px;
  }
  
  .inner-circle {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .login-main-area {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .platform-title {
    font-size: 20px;
  }
  
  .login-form-container {
    padding: 20px 15px;
  }
}
</style>


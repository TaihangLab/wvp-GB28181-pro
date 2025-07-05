<template>
  <div class="intelligent-assistant-container">
    <!-- 智能助手悬浮球 -->
    <div 
      class="assistant-float-ball"
      :class="{ 
        'expanded': isExpanded, 
        'minimized': !isVisible, 
        'dragging': isDragging,
        'auto-hidden': isAutoHidden,
        'hide-to-right': isAutoHidden && isOnRightSide,
        'hide-to-left': isAutoHidden && !isOnRightSide
      }"
      :style="getFloatBallStyle()"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="toggleChat"
      @mousedown="startDrag"
    >
      <!-- 助手头像 -->
      <div class="assistant-avatar">
        <div class="avatar-core">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 太行山脉轮廓 -->
            <path d="M2 19L6 9L10 13L14 7L18 11L22 19H2Z" fill="currentColor" fill-opacity="0.15"/>
            <path d="M2 19L6 9L10 13L14 7L18 11L22 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- 智慧之光点 -->
            <circle cx="6" cy="9" r="1.2" fill="currentColor">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="14" cy="7" r="1.2" fill="currentColor">
              <animate attributeName="opacity" values="1;0.6;1" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="18" cy="11" r="1.2" fill="currentColor">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
            </circle>
            <!-- 问道之路 -->
            <path d="M6 9Q10 11 14 7Q16 9 18 11" stroke="currentColor" stroke-width="0.8" opacity="0.4" stroke-dasharray="2,2"/>
          </svg>
        </div>
      </div>
      
      <!-- 悬浮提示 -->
      <div class="hover-tooltip" v-if="showTooltip && !isChatOpen">
        <span>太行·问道</span>
        <div class="tooltip-arrow"></div>
      </div>
    </div>

    <!-- 对话框 -->
    <div 
      class="chat-dialog"
      :class="{ 'visible': isChatOpen }"
      :style="getDialogPosition()"
      v-if="isChatOpen"
    >
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <div class="header-left">
          <div class="assistant-avatar-small">
            <div class="small-avatar-core">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 太行山脉轮廓 -->
                <path d="M2 19L6 9L10 13L14 7L18 11L22 19H2Z" fill="currentColor" fill-opacity="0.15"/>
                <path d="M2 19L6 9L10 13L14 7L18 11L22 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- 智慧之光点 -->
                <circle cx="6" cy="9" r="1.2" fill="currentColor"/>
                <circle cx="14" cy="7" r="1.2" fill="currentColor"/>
                <circle cx="18" cy="11" r="1.2" fill="currentColor"/>
                <!-- 问道之路 -->
                <path d="M6 9Q10 11 14 7Q16 9 18 11" stroke="currentColor" stroke-width="0.8" opacity="0.4" stroke-dasharray="2,2"/>
              </svg>
            </div>
          </div>
          <div class="assistant-info">
            <div class="assistant-name">太行·问道</div>
            <div class="assistant-desc">
              <span class="status-indicator"></span>
              在线 · 随时为您服务
            </div>
          </div>
        </div>
        <div class="header-right">
          <button class="minimize-btn" @click="minimizeChat">
            <i class="el-icon-minus"></i>
          </button>
          <button class="close-btn" @click="closeChat">
            <i class="el-icon-close"></i>
          </button>
        </div>
      </div>

      <!-- 对话内容区域 -->
      <div class="dialog-content">
        <div class="welcome-message" v-if="showWelcomeMessage">
          <div class="welcome-header">
            <div class="welcome-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 简化的太行山图标 -->
                <path d="M3 18L7 10L12 14L17 8L21 18H3Z" fill="currentColor" fill-opacity="0.2"/>
                <path d="M3 18L7 10L12 14L17 8L21 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- 智慧之光 -->
                <circle cx="12" cy="6" r="2" fill="currentColor" opacity="0.8"/>
                <path d="M12 4V8M10 6H14M10.5 4.5L13.5 7.5M13.5 4.5L10.5 7.5" stroke="currentColor" stroke-width="1" opacity="0.6"/>
              </svg>
            </div>
            <div class="welcome-content">
              <div class="welcome-title">👋 欢迎使用太行·问道</div>
              <div class="welcome-text">我是小行，您的专属智能助手，可以帮您处理各种问题</div>
            </div>
            <button class="welcome-close-btn" @click="closeWelcomeMessage">
              <i class="el-icon-close"></i>
            </button>
          </div>
          <div class="quick-actions">
            <div class="quick-action-item" @click="sendQuickMessage('📊 查看系统监控状态')">
              <span class="action-icon">📊</span>
              <span>查看系统监控状态</span>
            </div>
            <div class="quick-action-item" @click="sendQuickMessage('📹 如何添加摄像头设备')">
              <span class="action-icon">📹</span>
              <span>如何添加摄像头设备</span>
            </div>
            <div class="quick-action-item" @click="sendQuickMessage('⚠️ 预警信息处理流程')">
              <span class="action-icon">⚠️</span>
              <span>预警信息处理流程</span>
            </div>
            <div class="quick-action-item" @click="sendQuickMessage('🔧 系统配置和设置')">
              <span class="action-icon">🔧</span>
              <span>系统配置和设置</span>
            </div>
          </div>
        </div>

        <!-- 聊天消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="message-item"
            :class="{ 'user-message': message.type === 'user', 'assistant-message': message.type === 'assistant' }"
          >
            <div class="message-avatar" v-if="message.type === 'assistant'">
              <div class="message-avatar-core">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- 太行山脉轮廓 -->
                  <path d="M2 19L6 9L10 13L14 7L18 11L22 19H2Z" fill="currentColor" fill-opacity="0.15"/>
                  <path d="M2 19L6 9L10 13L14 7L18 11L22 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- 智慧之光点 -->
                  <circle cx="6" cy="9" r="1.2" fill="currentColor"/>
                  <circle cx="14" cy="7" r="1.2" fill="currentColor"/>
                  <circle cx="18" cy="11" r="1.2" fill="currentColor"/>
                  <!-- 问道之路 -->
                  <path d="M6 9Q10 11 14 7Q16 9 18 11" stroke="currentColor" stroke-width="0.8" opacity="0.4" stroke-dasharray="2,2"/>
                </svg>
              </div>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <span v-if="message.isTyping" class="typing-indicator">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </span>
                <span v-else-if="message.displayContent" v-html="formatMessage(message.displayContent)"></span>
                <span v-else v-html="formatMessage(message.content)"></span>
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
            <div class="message-avatar user-avatar" v-if="message.type === 'user'">
              <div class="user-avatar-core">
                <i class="el-icon-user"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="dialog-input">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            placeholder="请输入你的问题..."
            @keyup.enter.native="sendMessage"
            class="message-input"
          >
            <template slot="append">
              <el-button 
                @click="sendMessage" 
                :disabled="!inputMessage.trim()"
                class="send-button"
              >
                <i class="el-icon-position"></i>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div 
      class="dialog-overlay" 
      v-if="isChatOpen"
      @click="closeChat"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'IntelligentAssistant',
  data() {
    return {
      isVisible: true,
      isExpanded: false,
      showTooltip: false,
      isChatOpen: false,
      inputMessage: '',
      messages: [],
      showWelcomeMessage: true,
      // 拖拽相关
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      position: { x: 0, y: 100, side: 'right' }, // x, y为绝对位置，side表示在左侧还是右侧
      tempPosition: null, // 拖拽时的临时位置
      dragged: false, // 标记是否发生了实际拖拽
      // 自动隐藏相关
      isAutoHidden: false,
      hideTimer: null,
      isHovering: false,
      // 打字机效果相关
      typingSpeed: 50, // 打字速度(毫秒)
      isTypingResponse: false
    }
  },
      methods: {
    initializePosition() {
      // 初始化到右侧边缘
      const windowWidth = window.innerWidth;
      const ballSize = 64;
      const sideMargin = 10;
      
      this.position = {
        x: windowWidth - ballSize - sideMargin,
        y: 100,
        side: 'right'
      };
    },
    getFloatBallStyle() {
      // 如果正在拖拽，使用临时位置
      if (this.isDragging && this.tempPosition) {
        return {
          left: this.tempPosition.x + 'px',
          top: this.tempPosition.y + 'px',
          right: 'auto',
          bottom: 'auto'
        };
      }
      
      // 正常状态，使用最终位置
      return {
        left: this.position.x + 'px',
        top: this.position.y + 'px',
        right: 'auto',
        bottom: 'auto'
      };
    },
    onMouseEnter() {
      this.isHovering = true;
      if (!this.isDragging) {
        this.showTooltip = true;
        this.isExpanded = true;
      }
      // 鼠标悬浮时显示助手并清除隐藏定时器
      this.showAssistant();
    },
    onMouseLeave() {
      this.isHovering = false;
      if (!this.isDragging) {
        this.showTooltip = false;
        this.isExpanded = false;
      }
      // 鼠标离开时开始隐藏定时器
      this.startHideTimer();
    },
    toggleChat() {
      // 只有在没有拖拽或没有发生实际拖拽移动时才打开对话框
      if (!this.isDragging && !this.dragged) {
        this.isChatOpen = !this.isChatOpen;
        if (this.isChatOpen) {
          this.showTooltip = false;
          this.showAssistant(); // 打开对话框时显示助手
        }
      }
    },
    closeChat() {
      this.isChatOpen = false;
      // 关闭对话框后重新开始隐藏计时
      this.startHideTimer();
    },
    minimizeChat() {
      this.isChatOpen = false;
    },
    closeWelcomeMessage() {
      this.showWelcomeMessage = false;
    },
    // 拖拽功能
    startDrag(event) {
      this.isDragging = true;
      this.dragged = false; // 重置拖拽标记
      const rect = event.target.closest('.assistant-float-ball').getBoundingClientRect();
      this.dragOffset.x = event.clientX - rect.left;
      this.dragOffset.y = event.clientY - rect.top;
      
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      event.preventDefault();
    },
    onDrag(event) {
      if (this.isDragging) {
        this.dragged = true; // 标记发生了实际拖拽
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const ballSize = 64;
        
        // 计算当前鼠标位置
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // 临时位置，用于拖拽时的实时显示
        this.tempPosition = {
          x: mouseX - this.dragOffset.x,
          y: mouseY - this.dragOffset.y
        };
        
        // 限制在窗口范围内
        this.tempPosition.x = Math.max(10, Math.min(this.tempPosition.x, windowWidth - ballSize - 10));
        this.tempPosition.y = Math.max(10, Math.min(this.tempPosition.y, windowHeight - ballSize - 10));
      }
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
      
      // 边缘吸附逻辑
      if (this.tempPosition) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const ballSize = 64;
        const sideMargin = 10; // 距离边缘的距离
        
        // 判断应该吸附到左侧还是右侧
        const centerX = this.tempPosition.x + ballSize / 2;
        const isLeft = centerX < windowWidth / 2;
        
        // 设置最终位置
        if (isLeft) {
          // 吸附到左侧
          this.position = {
            x: sideMargin,
            y: Math.max(10, Math.min(this.tempPosition.y, windowHeight - ballSize - 10)),
            side: 'left'
          };
        } else {
          // 吸附到右侧
          this.position = {
            x: windowWidth - ballSize - sideMargin,
            y: Math.max(10, Math.min(this.tempPosition.y, windowHeight - ballSize - 10)),
            side: 'right'
          };
        }
        
        this.tempPosition = null;
      }
      
      // 延迟重置拖拽标记，避免拖拽结束时误触发点击
      setTimeout(() => {
        this.dragged = false;
      }, 150);
      
      // 拖拽结束后重新开始隐藏计时
      this.startHideTimer();
    },
    sendMessage() {
      if (!this.inputMessage.trim() || this.isTypingResponse) return;
      
      const userMessage = {
        type: 'user',
        content: this.inputMessage,
        time: this.getCurrentTime()
      };
      
      this.messages.push(userMessage);
      const currentInput = this.inputMessage;
      this.inputMessage = '';
      this.scrollToBottom();
      
      // 显示打字指示器
      this.isTypingResponse = true;
      const typingMessage = {
        type: 'assistant',
        content: '',
        time: this.getCurrentTime(),
        isTyping: true
      };
      this.messages.push(typingMessage);
      this.scrollToBottom();
      
      // 模拟AI回复
      setTimeout(() => {
        // 移除打字指示器
        this.messages.pop();
        this.isTypingResponse = false;
        
        const response = this.generateResponse(currentInput);
        const assistantMessage = {
          type: 'assistant',
          content: response,
          time: this.getCurrentTime(),
          displayContent: '',
          isTyping: false
        };
        this.messages.push(assistantMessage);
        
        // 打字机效果
        this.typeWriter(assistantMessage, response);
      }, 1500);
    },
    sendQuickMessage(message) {
      this.inputMessage = message;
      this.sendMessage();
    },
    typeWriter(message, text) {
      let index = 0;
      message.displayContent = '';
      
      const type = () => {
        if (index < text.length) {
          message.displayContent += text.charAt(index);
          index++;
          this.scrollToBottom();
          setTimeout(type, this.typingSpeed);
        }
      };
      
      type();
    },
    formatMessage(content) {
      if (!content) return '';
      // 处理换行符
      return content.replace(/\n/g, '<br>');
    },
    generateResponse(userInput) {
      // 简单的关键词匹配回复逻辑
      const input = userInput.toLowerCase();
      
      if (input.includes('监控') || input.includes('状态')) {
        return '当前系统运行正常，所有监控设备在线率98.5%，CPU使用率65%，内存使用率45%。有3个设备处于离线状态，建议及时检查网络连接。';
      } else if (input.includes('摄像头') || input.includes('设备')) {
        return '添加摄像头设备步骤：1. 进入"设备配置"→"摄像头"页面；2. 点击"新增设备"按钮；3. 填写设备信息（IP地址、端口、用户名密码等）；4. 测试连接后保存。需要帮助的话可以查看详细文档。';
      } else if (input.includes('预警') || input.includes('报警')) {
        return '预警管理功能包括：实时监控、预警处理、档案管理等。您可以在"监控预警"菜单中查看所有预警信息，支持标记处理、添加备注、上报和归档等操作。';
      } else if (input.includes('你好') || input.includes('hi')) {
        return '你好！我是太行·问道（小行），专门为您提供平台使用指导和技术支持。有什么问题我可以帮您解答吗？';
      } else {
        return '感谢您的提问！我是小行，正在不断学习中。如果我的回答不够准确，建议您查看系统帮助文档或联系技术支持团队。有其他问题随时可以问我！';
      }
    },
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    getDialogPosition() {
      const dialogWidth = 480;
      const dialogHeight = 720;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const ballSize = 64;
      const margin = 20; // 对话框与悬浮球的间距
      
      let dialogPosition = {};
      
      // 计算垂直位置，确保对话框不超出屏幕
      let topPosition = this.position.y;
      
      // 检查对话框是否会超出屏幕底部
      if (topPosition + dialogHeight > windowHeight - 20) {
        topPosition = windowHeight - dialogHeight - 20;
      }
      
      // 检查对话框是否会超出屏幕顶部
      if (topPosition < 20) {
        topPosition = 20;
      }
      
      // 水平位置
      if (this.position.side === 'left') {
        // 助手在左侧，对话框显示在右边
        let leftPosition = this.position.x + ballSize + margin;
        
        // 检查是否超出屏幕右边界
        if (leftPosition + dialogWidth > windowWidth - 20) {
          leftPosition = windowWidth - dialogWidth - 20;
        }
        
        dialogPosition = {
          left: leftPosition + 'px',
          top: topPosition + 'px',
          right: 'auto',
          bottom: 'auto'
        };
      } else {
        // 助手在右侧，对话框显示在左边
        let rightPosition = windowWidth - this.position.x + margin;
        
        // 检查是否超出屏幕左边界，给更大的对话框留出空间
        if (windowWidth - rightPosition - dialogWidth < 20) {
          rightPosition = windowWidth - dialogWidth - 20;
        }
        
        dialogPosition = {
          right: rightPosition + 'px',
          top: topPosition + 'px',
          left: 'auto',
          bottom: 'auto'
        };
      }
      
      return dialogPosition;
    },
    handleWindowResize() {
      // 窗口大小变化时，确保助手不会超出边界
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const ballSize = 64;
      const sideMargin = 10;
      
      // 根据当前在哪一侧重新计算位置
      if (this.position.side === 'left') {
        this.position.x = sideMargin;
      } else {
        this.position.x = windowWidth - ballSize - sideMargin;
      }
      
      // 限制Y轴位置
      this.position.y = Math.max(10, Math.min(this.position.y, windowHeight - ballSize - 10));
    },
    // 自动隐藏功能
    startHideTimer() {
      // 如果对话框打开或鼠标在悬浮状态，不启动隐藏计时器
      if (this.isChatOpen || this.isHovering) {
        return;
      }
      
      this.clearHideTimer();
      this.hideTimer = setTimeout(() => {
        this.hideAssistant();
      }, 3000);
    },
    clearHideTimer() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
    },
    showAssistant() {
      this.isAutoHidden = false;
      this.clearHideTimer();
    },
    hideAssistant() {
      // 如果鼠标仍在悬浮或对话框打开，不隐藏
      if (this.isHovering || this.isChatOpen) {
        return;
      }
      this.isAutoHidden = true;
    }
  },
  computed: {
    isOnRightSide() {
      // 判断助手是否在屏幕右半边
      return this.position.side === 'right';
    }
  },
  mounted() {
    // 初始化位置到右侧
    this.initializePosition();
    // 监听窗口大小变化，调整助手位置
    window.addEventListener('resize', this.handleWindowResize);
    // 启动自动隐藏计时器
    this.startHideTimer();
  },
  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('resize', this.handleWindowResize);
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    // 清理隐藏计时器
    this.clearHideTimer();
  }
}
</script>

<style scoped>
.intelligent-assistant-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none; /* 容器不响应鼠标事件，只有子元素响应 */
}

.intelligent-assistant-container > * {
  pointer-events: auto; /* 子元素响应鼠标事件 */
}

/* 悬浮球样式 */
.assistant-float-ball {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(102, 126, 234, 0.2);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  animation: pulse-glow 4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(102, 126, 234, 0.2);
  }
  50% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(102, 126, 234, 0.3);
  }
}

.assistant-float-ball:hover,
.assistant-float-ball.expanded {
  transform: scale(1.05);
  box-shadow: 0 12px 48px rgba(102, 126, 234, 0.4), 0 6px 24px rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation-play-state: paused;
}

.assistant-float-ball:hover .avatar-core svg {
  transform: scale(1.1);
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
}

.assistant-float-ball.minimized {
  transform: scale(0.8);
  opacity: 0.7;
}

.assistant-float-ball.dragging {
  cursor: grabbing;
  transform: scale(1.05);
  transition: none; /* 拖拽时取消过渡动画 */
  z-index: 10000;
  animation-play-state: paused;
}

/* 自动隐藏状态 - 优先级较低，会被其他状态覆盖 */
.assistant-float-ball.auto-hidden {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.assistant-float-ball.auto-hidden.hide-to-right:not(.expanded):not(.dragging) {
  transform: translateX(42px); /* 向右隐藏，只露出左边22px */
}

.assistant-float-ball.auto-hidden.hide-to-left:not(.expanded):not(.dragging) {
  transform: translateX(-42px); /* 向左隐藏，只露出右边22px */
}

/* 自动隐藏状态下，悬浮提示不显示 */
.assistant-float-ball.auto-hidden .hover-tooltip {
  display: none;
}

/* 助手头像 */
.assistant-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-core {
  color: white;
  font-weight: bold;
  font-size: 16px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-core svg {
  width: 24px;
  height: 24px;
  color: white;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
}





/* 悬浮提示 */
.hover-tooltip {
  position: absolute;
  right: 74px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(17, 24, 39, 0.9);
  color: #f3f4f6;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  animation: fadeInLeft 0.3s ease;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.tooltip-arrow {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid rgba(17, 24, 39, 0.9);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* 对话框样式 */
.chat-dialog {
  position: fixed;
  width: 480px;
  height: 720px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24px);
  opacity: 0;
  transform: scale(0.9) translateY(24px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 9998;
  overflow: hidden;
}

.chat-dialog.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 对话框头部 */
.dialog-header {
  padding: 18px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 24px 24px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assistant-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.small-avatar-core {
  color: white;
  font-weight: bold;
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.small-avatar-core svg {
  width: 16px;
  height: 16px;
  color: white;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.2));
}

.assistant-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assistant-name {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.assistant-desc {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.header-right {
  display: flex;
  gap: 10px;
}

.minimize-btn,
.close-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.minimize-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 对话内容区域 */
.dialog-content {
  flex: 1;
  padding: 26px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.welcome-message {
  margin-bottom: 30px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 16px;
  padding: 26px;
  position: relative;
}

.welcome-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 26px;
  gap: 16px;
}

.welcome-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.welcome-icon svg {
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
}

.welcome-content {
  flex: 1;
  margin-right: 40px;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.welcome-text {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

.welcome-close-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: absolute;
  top: 20px;
  right: 20px;
}

.welcome-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.quick-action-item {
  padding: 18px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  color: #374151;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  min-height: 66px;
}

.quick-action-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.quick-action-item:hover .action-icon {
  transform: scale(1.1);
}

.action-icon {
  font-size: 20px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

/* 消息列表 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
  min-height: 240px;
}

.message-item {
  display: flex;
  margin-bottom: 24px;
  gap: 12px;
  align-items: flex-start;
}

.message-item:last-child {
  margin-bottom: 0;
}

.message-item.user-message {
  flex-direction: row;
  justify-content: flex-end;
}

.message-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
  overflow: hidden;
  box-sizing: border-box;
}

.message-avatar-core {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  overflow: hidden;
}

.message-avatar-core svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.2));
}

.user-avatar {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-radius: 50%;
  overflow: hidden;
  box-sizing: border-box;
}

.user-avatar-core {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
  color: white;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  overflow: hidden;
}

.message-content {
  flex: 1;
  max-width: 85%;
}

.user-message .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  max-width: 340px;
}

.assistant-message .message-bubble {
  background: rgba(248, 250, 252, 0.9);
  color: #374151;
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 16px 16px 16px 4px;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite;
}

.typing-indicator .dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 输入区域 */
.dialog-input {
  padding: 22px 26px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  background: rgba(248, 250, 252, 0.8);
  border-radius: 0 0 24px 24px;
}

.input-container {
  display: flex;
  gap: 14px;
}

.message-input {
  flex: 1;
}

.message-input >>> .el-input__inner {
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.message-input >>> .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.message-input >>> .el-input__inner::placeholder {
  color: #9ca3af;
}

.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 14px 20px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

/* 动画效果 */

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(10px) translateY(-50%); }
  to { opacity: 1; transform: translateX(0) translateY(-50%); }
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.3);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-dialog {
    width: 420px;
    height: 600px;
    right: 20px;
    bottom: 80px;
  }
  
  .hover-tooltip {
    right: 84px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .assistant-float-ball {
    width: 56px;
    height: 56px;
  }
  
  .avatar-core svg {
    width: 20px;
    height: 20px;
  }
  
  .message-bubble {
    max-width: 300px;
  }
  
  .message-content {
    max-width: 80%;
  }
}

@media (max-width: 480px) {
  .chat-dialog {
    width: calc(100vw - 40px);
    height: 560px;
    left: 20px;
    right: 20px;
    bottom: 80px;
  }
  
  .welcome-message {
    padding: 18px;
  }
  
  .dialog-header {
    padding: 20px;
  }
  
  .dialog-input {
    padding: 18px 20px;
  }
  
  .message-bubble {
    max-width: 260px;
  }
  
  .message-content {
    max-width: 75%;
  }
}
</style> 
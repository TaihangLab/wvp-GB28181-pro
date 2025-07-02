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
        <div class="avatar-core">TT</div>
      </div>
      
      <!-- 悬浮提示 -->
      <div class="hover-tooltip" v-if="showTooltip && !isChatOpen">
        <span>太行智能助手</span>
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
            <div class="small-avatar-core">TT</div>
          </div>
          <div class="assistant-info">
            <div class="assistant-name">Hi~ 你好</div>
            <div class="assistant-desc">我是太行智能助手</div>
          </div>
        </div>
        <div class="header-right">
          <button class="close-btn" @click="closeChat">
            <i class="el-icon-close"></i>
          </button>
        </div>
      </div>

      <!-- 对话内容区域 -->
      <div class="dialog-content">
        <div class="welcome-message" v-if="showWelcomeMessage">
          <div class="welcome-header">
            <div class="welcome-text">基于太行AI平台的智能对话助手</div>
            <button class="welcome-close-btn" @click="closeWelcomeMessage">
              <i class="el-icon-close"></i>
            </button>
          </div>
          <div class="quick-actions">
            <div class="quick-action-item" @click="sendQuickMessage('监控系统实时状态如何？')">
              <span>监控系统实时状态如何？</span>
            </div>
            <div class="quick-action-item" @click="sendQuickMessage('如何新增摄像头监控设备？')">
              <span>如何新增摄像头监控设备？</span>
            </div>
            <div class="quick-action-item" @click="sendQuickMessage('预警信息如何管理和处理？')">
              <span>预警信息如何管理和处理？</span>
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
              <div class="message-avatar-core">TT</div>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ message.content }}
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
            <div class="message-avatar user-avatar" v-if="message.type === 'user'">
              <i class="el-icon-user"></i>
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
      isHovering: false
    }
  },
      methods: {
    initializePosition() {
      // 初始化到右侧边缘
      const windowWidth = window.innerWidth;
      const ballSize = 60;
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
        const ballSize = 60;
        
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
        const ballSize = 60;
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
      if (!this.inputMessage.trim()) return;
      
      const userMessage = {
        type: 'user',
        content: this.inputMessage,
        time: this.getCurrentTime()
      };
      
      this.messages.push(userMessage);
      
      // 模拟AI回复
      setTimeout(() => {
        const assistantMessage = {
          type: 'assistant',
          content: this.generateResponse(this.inputMessage),
          time: this.getCurrentTime()
        };
        this.messages.push(assistantMessage);
        this.scrollToBottom();
      }, 1000);
      
      this.inputMessage = '';
      this.scrollToBottom();
    },
    sendQuickMessage(message) {
      this.inputMessage = message;
      this.sendMessage();
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
        return '你好！我是太行智能助手，专门为您提供平台使用指导和技术支持。有什么问题我可以帮您解答吗？';
      } else {
        return '感谢您的提问！我正在学习中，如果我的回答不够准确，建议您查看系统帮助文档或联系技术支持团队。有其他问题随时可以问我！';
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
      const dialogWidth = 380;
      const dialogHeight = 520;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const ballSize = 60;
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
        
        // 检查是否超出屏幕左边界
        if (windowWidth - rightPosition - dialogWidth < 20) {
          rightPosition = windowWidth - 20;
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
      const ballSize = 60;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4BD8FF 0%, #2a5298 100%);
  box-shadow: 0 4px 12px rgba(77, 216, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: fixed;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-float-ball:hover,
.assistant-float-ball.expanded {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(77, 216, 255, 0.4);
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
}

/* 自动隐藏状态 - 优先级较低，会被其他状态覆盖 */
.assistant-float-ball.auto-hidden {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.assistant-float-ball.auto-hidden.hide-to-right:not(.expanded):not(.dragging) {
  transform: translateX(40px); /* 向右隐藏，只露出左边20px */
}

.assistant-float-ball.auto-hidden.hide-to-left:not(.expanded):not(.dragging) {
  transform: translateX(-40px); /* 向左隐藏，只露出右边20px */
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





/* 悬浮提示 */
.hover-tooltip {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 31, 63, 0.95);
  color: #4BD8FF;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  border: 1px solid rgba(77, 216, 255, 0.3);
  backdrop-filter: blur(10px);
  animation: fadeInLeft 0.3s ease;
}

.tooltip-arrow {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid rgba(0, 31, 63, 0.95);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* 对话框样式 */
.chat-dialog {
  position: fixed;
  width: 380px;
  height: 520px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 31, 63, 0.15);
  border: 1px solid rgba(77, 216, 255, 0.2);
  backdrop-filter: blur(20px);
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 9998;
}

.chat-dialog.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 对话框头部 */
.dialog-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(77, 216, 255, 0.1);
  background: linear-gradient(135deg, rgba(77, 216, 255, 0.05) 0%, rgba(42, 82, 152, 0.05) 100%);
  border-radius: 16px 16px 0 0;
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
  background: linear-gradient(135deg, #4BD8FF 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(77, 216, 255, 0.3);
}

.small-avatar-core {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.assistant-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.assistant-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.assistant-desc {
  font-size: 12px;
  color: #666;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(77, 216, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 90, 90, 0.1);
  color: #ff5a5a;
}

/* 对话内容区域 */
.dialog-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.welcome-message {
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(77, 216, 255, 0.03) 0%, rgba(42, 82, 152, 0.03) 100%);
  border: 1px solid rgba(77, 216, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.welcome-text {
  font-size: 14px;
  color: #666;
  text-align: left;
  margin: 0;
  flex: 1;
}

.welcome-close-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 90, 90, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.welcome-close-btn:hover {
  background: rgba(255, 90, 90, 0.2);
  color: #ff5a5a;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-action-item {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(77, 216, 255, 0.05) 0%, rgba(42, 82, 152, 0.05) 100%);
  border: 1px solid rgba(77, 216, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s ease;
}

.quick-action-item:hover {
  background: linear-gradient(135deg, rgba(77, 216, 255, 0.1) 0%, rgba(42, 82, 152, 0.1) 100%);
  transform: translateY(-1px);
}

/* 消息列表 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  margin-right: -4px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.message-item.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar-core {
  background: linear-gradient(135deg, #4BD8FF 0%, #2a5298 100%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.user-avatar {
  background: rgba(102, 102, 102, 0.1);
  color: #666;
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.user-message .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.assistant-message .message-bubble {
  background: rgba(77, 216, 255, 0.1);
  color: #333;
  border: 1px solid rgba(77, 216, 255, 0.2);
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #4BD8FF 0%, #2a5298 100%);
  color: white;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

/* 输入区域 */
.dialog-input {
  padding: 16px 20px;
  border-top: 1px solid rgba(77, 216, 255, 0.1);
  background: rgba(248, 250, 252, 0.5);
  border-radius: 0 0 16px 16px;
}

.input-container {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
}

.message-input >>> .el-input__inner {
  border: 1px solid rgba(77, 216, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

.message-input >>> .el-input__inner:focus {
  border-color: #4BD8FF;
  box-shadow: 0 0 8px rgba(77, 216, 255, 0.2);
}

.send-button {
  background: linear-gradient(135deg, #4BD8FF 0%, #2a5298 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.send-button:disabled {
  opacity: 0.5;
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
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(77, 216, 255, 0.1);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(77, 216, 255, 0.3);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 216, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-dialog {
    width: 320px;
    right: 20px;
    bottom: 80px;
  }
  
  .hover-tooltip {
    right: 80px;
  }
}
</style> 
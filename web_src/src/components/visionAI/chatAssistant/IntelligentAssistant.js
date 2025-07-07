import VisionAIService from '../../service/VisionAIService.js'

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
        // 全屏聊天相关
        isFullScreen: false,
        isExitingFullScreen: false, // 退出全屏动画状态
        justExitedFullScreen: false, // 刚退出全屏状态
        currentChatId: null,
        chatHistories: [], // 历史聊天会话
        currentChatIndex: -1,
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
        isTypingResponse: false,
        // 新增：搜索功能
        searchQuery: '',
        // 新增：分组功能
        userGroups: [], // 用户创建的分组
        selectedGroupId: null, // 当前选中的分组ID
        // 新增：右键菜单
        showContextMenu: false,
        contextMenuStyle: {},
        selectedChatId: null,
        hoveredChatId: null,
        // 新增：对话框状态
        showGroupDialog: false,
        showMoveDialog: false,
        // 新增：表单数据
        groupForm: { name: '' },
        groupRules: {
          name: [
            { required: true, message: '请输入分组名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
          ]
        },
        // 新增：侧边栏状态
        sidebarCollapsed: false,
        // 新增：移动分组选择
        selectedGroupForMove: null,
        // 新增：分组悬停状态
        hoveredGroupId: null,
        // 新增：API相关状态
        currentEventSource: null, // 当前的EventSource连接
        isConnecting: false, // 是否正在连接中
        apiError: null, // API错误信息
        retryCount: 0, // 重试次数
        maxRetries: 3, // 最大重试次数
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
      // 全屏聊天相关方法
      toggleFullScreen() {
        this.isFullScreen = !this.isFullScreen;
        if (this.isFullScreen) {
          // 进入全屏模式
          this.isChatOpen = false;
          this.showAssistant(); // 确保助手可见
          // 如果当前没有聊天会话，创建新的
          if (this.currentChatId === null) {
            this.createNewChat();
          }
          // 进入全屏后强制设置Element UI组件z-index
          this.$nextTick(() => {
            this.forceElementUIZIndex();
          });
        } else {
          // 如果是从全屏模式切换回来，重置状态
          this.exitFullScreen();
        }
      },
      exitFullScreen() {
        // 开始退出动画
        this.isExitingFullScreen = true;
        
        // 保存当前聊天
        if (this.messages.length > 0) {
          this.saveCurrentChat();
        }
        
        // 延迟执行实际的状态切换，让动画先播放
        const exitDuration = window.innerWidth <= 480 ? 500 : 650; // 全屏消失时间（移动端0.5s，桌面端0.65s）
        const appearDuration = window.innerWidth <= 480 ? 450 : 550;
        
        setTimeout(() => {
          this.isFullScreen = false;
          this.isExitingFullScreen = false;
          this.justExitedFullScreen = true;
          this.showAssistant();
          this.isVisible = true;
          
          // 短暂延迟后移除出现动画状态
          setTimeout(() => {
            this.justExitedFullScreen = false;
          }, appearDuration);
        }, exitDuration);
      },
      createNewChat() {
        // 如果当前有消息，先保存当前对话
        if (this.messages.length > 0) {
          this.saveCurrentChat();
        }
        
        // 重置当前会话状态，让下次发送消息时自动创建新会话
        this.currentChatId = null;
        this.currentChatIndex = -1;
        this.messages = [];
        this.showWelcomeMessage = true;
        this.inputMessage = '';
        
        console.log('创建新聊天会话');
      },
      saveCurrentChat() {
        // 后端API会自动保存会话，这里只需要更新本地状态
        if (this.currentChatId && this.messages.length > 0) {
          const chatIndex = this.chatHistories.findIndex(chat => chat.conversation_id === this.currentChatId);
          if (chatIndex !== -1) {
            // 更新本地缓存的会话信息
            this.chatHistories[chatIndex].messages = [...this.messages];
            this.chatHistories[chatIndex].last_message_time = new Date().toISOString();
            
            // 根据第一条用户消息生成标题
            const firstUserMessage = this.messages.find(msg => msg.type === 'user');
            if (firstUserMessage) {
              const title = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
              this.chatHistories[chatIndex].title = title;
            }
          }
        }
        console.log('本地会话状态已更新');
      },
      async loadChatHistory(chatId) {
        try {
          // 先保存当前聊天
          this.saveCurrentChat();
          
          // 停止当前聊天请求
          this.stopCurrentChat();
          
          console.log('加载会话历史:', chatId);
          
          // 从API加载会话消息
          const response = await VisionAIService.chatAssistantAPI.getChatMessages(chatId);
          
          console.log('会话消息API响应:', response.data); // 添加调试日志
          
          // 适配后端返回的格式: {code: 0, msg: 'success', data: Array}
          let messagesData = [];
          
          if (response.data && response.data.code === 0 && Array.isArray(response.data.data)) {
            messagesData = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            // 兼容直接返回数组的格式
            messagesData = response.data;
          } else {
            console.error('会话消息格式错误:', response.data);
            this.$message.error('加载会话历史失败：数据格式错误');
            return;
          }
          
          // 转换API返回的消息格式为前端格式
          this.messages = messagesData.map(msg => ({
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            time: this.formatTimestamp(msg.timestamp || new Date().toISOString()),
            displayContent: msg.content,
            isTyping: false
          }));
          
          this.currentChatId = chatId;
          this.currentChatIndex = this.chatHistories.findIndex(c => c.conversation_id === chatId);
          this.showWelcomeMessage = this.messages.length === 0;
          this.inputMessage = '';
          this.scrollToBottom();
          
          console.log('会话历史加载成功:', this.messages.length, '条消息');
          
        } catch (error) {
          console.error('加载会话历史失败:', error);
          this.$message.error('加载会话历史失败，请稍后重试');
          
          // 回退到本地缓存的消息（如果有）
          const chat = this.chatHistories.find(c => c.conversation_id === chatId);
          if (chat && chat.messages) {
            this.currentChatId = chatId;
            this.currentChatIndex = this.chatHistories.findIndex(c => c.conversation_id === chatId);
            this.messages = [...chat.messages];
            this.showWelcomeMessage = this.messages.length === 0;
            this.inputMessage = '';
            this.scrollToBottom();
            console.log('使用本地缓存的会话历史');
          }
        }
      },
      async deleteChatHistory(chatId) {
        try {
          console.log('删除会话:', chatId);
          
          // 调用API删除会话
          await VisionAIService.chatAssistantAPI.deleteChatConversation(chatId);
          
          // 删除本地缓存
          const chatIndex = this.chatHistories.findIndex(chat => chat.conversation_id === chatId);
          if (chatIndex !== -1) {
            this.chatHistories.splice(chatIndex, 1);
            
            // 如果删除的是当前聊天
            if (this.currentChatId === chatId) {
              if (this.chatHistories.length > 0) {
                // 切换到第一个聊天
                this.loadChatHistory(this.chatHistories[0].conversation_id);
              } else {
                // 没有聊天历史了，创建新的
                this.createNewChat();
              }
            }
            
            this.$message.success('会话删除成功');
            console.log('会话删除成功:', chatId);
          }
          
        } catch (error) {
          console.error('删除会话失败:', error);
          this.$message.error('删除会话失败，请稍后重试');
        }
      },
      formatChatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return '今天';
        } else if (diffDays === 1) {
          return '昨天';
        } else if (diffDays < 7) {
          return `${diffDays}天前`;
        } else {
          return date.toLocaleDateString();
        }
      },
      
      /**
       * 格式化时间戳为显示时间
       * @param {string} timestamp ISO时间戳
       * @returns {string} 格式化的时间
       */
      formatTimestamp(timestamp) {
        try {
          const date = new Date(timestamp);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch (error) {
          console.error('时间格式化错误:', error);
          return this.getCurrentTime();
        }
      },
      getCurrentChatTitle() {
        if (!this.currentChatId) {
          return '新的对话';
        }
        const currentChat = this.chatHistories.find(c => c.id === this.currentChatId);
        return currentChat ? currentChat.title : '新的对话';
      },
      getExitAnimationStyle() {
        if (!this.isExitingFullScreen) {
          return {};
        }
        
        // 计算悬浮球的最终位置（百分比）
        const ballSize = 64;
        const finalX = this.position.x + ballSize / 2;
        const finalY = this.position.y + ballSize / 2;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 转换为百分比，确保动画精确
        const finalXPercent = (finalX / windowWidth) * 100;
        const finalYPercent = (finalY / windowHeight) * 100;
        
        return {
          '--final-x': finalXPercent + '%',
          '--final-y': finalYPercent + '%',
          '--final-x-px': finalX + 'px',
          '--final-y-px': finalY + 'px',
          '--final-size': ballSize + 'px'
        };
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
      async sendMessage() {
        if (!this.inputMessage.trim() || this.isTypingResponse || this.isConnecting) return;
        
        // 用户开始发送消息时，关闭欢迎提示
        if (this.showWelcomeMessage) {
          this.showWelcomeMessage = false;
        }
        
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
        this.isConnecting = true;
        this.apiError = null;
        
        const typingMessage = {
          type: 'assistant',
          content: '',
          time: this.getCurrentTime(),
          isTyping: true
        };
        this.messages.push(typingMessage);
        this.scrollToBottom();
        
        try {
          // 准备聊天数据（使用适合"太行·问道"的系统提示词）
          const systemPrompt = `你是太行·问道，一个专业的智能视频分析系统的AI助手。你的使命是帮助用户更好地使用这个智能安防监控平台。

你的特点：
- 专业：精通视频监控、智能分析、安防技术等领域
- 友好：以温和、专业的语气回答问题  
- 实用：提供具体、可操作的建议和指导
- 简洁：回答准确且不冗长

你可以帮助用户：
- 系统操作指导（设备管理、预警处理等）
- 技术问题解答（摄像头配置、算法解释等）
- 功能介绍（监控功能、智能分析能力等）
- 故障排除建议

请用中文回答，保持专业和友好的语调。`;

          const chatData = {
            message: currentInput,
            conversation_id: this.currentChatId,
            stream: true,
            system_prompt: systemPrompt
          };
          
          // 创建助手回复消息
          const assistantMessage = {
            type: 'assistant',
            content: '',
            time: this.getCurrentTime(),
            displayContent: '',
            isTyping: false
          };
          
          // 移除打字指示器
          this.messages.pop();
          this.messages.push(assistantMessage);
          this.isTypingResponse = false;
          this.isConnecting = false;
          this.scrollToBottom();
          
          // 创建流式连接
          this.currentEventSource = await VisionAIService.chatAssistantAPI.createChatStream(
            chatData,
            // onMessage回调 - 接收流式数据
            (chunk, fullResponse, conversationId) => {
              // 如果获取到新的会话ID，更新当前会话ID
              if (conversationId && !this.currentChatId) {
                this.currentChatId = conversationId;
                console.log('设置新的会话ID:', this.currentChatId);
              }
              
              assistantMessage.displayContent = fullResponse;
              this.scrollToBottom();
            },
            // onError回调 - 处理错误
            (error) => {
              console.error('聊天API错误:', error);
              this.handleChatError(error, assistantMessage);
            },
            // onComplete回调 - 完成响应
            async (fullResponse, conversationId) => {
              // 确保会话ID设置正确
              if (conversationId && !this.currentChatId) {
                this.currentChatId = conversationId;
                console.log('完成时设置会话ID:', this.currentChatId);
              }
              
              assistantMessage.content = fullResponse;
              assistantMessage.displayContent = fullResponse;
              this.isTypingResponse = false;
              this.isConnecting = false;
              this.currentEventSource = null;
              this.retryCount = 0;
              
              // 保存当前聊天（主要是本地状态管理）
              this.saveCurrentChat();
              this.scrollToBottom();
              
              // 重新加载会话列表以显示新会话
              await this.loadChatConversations();
              
              // 如果是新对话的第一条消息，自动生成标题
              if (this.messages.length === 2) { // 用户消息 + 助手回复
                try {
                  const response = await VisionAIService.chatAssistantAPI.autoGenerateTitle(this.currentChatId);
                  if (response.data && response.data.success) {
                    // 再次更新对话列表以显示新标题
                    await this.loadChatConversations();
                    console.log('自动生成标题成功:', response.data.data.title);
                  }
                } catch (error) {
                  console.warn('自动生成标题失败:', error);
                  // 不阻断正常流程，只记录警告
                }
              }
              
              console.log('聊天完成:', fullResponse);
            }
          );
          
        } catch (error) {
          console.error('发送消息失败:', error);
          this.handleChatError(error);
        }
      },
      sendQuickMessage(message) {
        this.inputMessage = message;
        this.sendMessage();
      },
      
      /**
       * 处理聊天错误
       * @param {Error} error 错误对象
       * @param {Object} assistantMessage 助手消息对象
       */
      handleChatError(error, assistantMessage = null) {
        this.isTypingResponse = false;
        this.isConnecting = false;
        this.apiError = error;
        
        // 关闭当前连接
        if (this.currentEventSource) {
          this.currentEventSource.close();
          this.currentEventSource = null;
        }
        
        // 移除打字指示器（如果存在）
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage && lastMessage.isTyping) {
          this.messages.pop();
        }
        
        let errorMessage = '抱歉，遇到了一些问题。';
        
        if (error.message && error.message.includes('network')) {
          errorMessage = '网络连接异常，请检查网络后重试。';
        } else if (error.message && error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试。';
        } else if (this.retryCount < this.maxRetries) {
          // 自动重试
          this.retryCount++;
          errorMessage = `连接异常，正在重试 (${this.retryCount}/${this.maxRetries})...`;
          
          setTimeout(() => {
            this.sendMessage();
          }, 2000);
          
          // 显示重试消息
          if (assistantMessage) {
            assistantMessage.content = errorMessage;
            assistantMessage.displayContent = errorMessage;
          } else {
            this.messages.push({
              type: 'assistant',
              content: errorMessage,
              time: this.getCurrentTime(),
              displayContent: errorMessage,
              isTyping: false,
              isError: true
            });
          }
          this.scrollToBottom();
          return;
        } else {
          errorMessage = '服务暂时不可用，请稍后再试。如果问题持续，请联系技术支持。';
        }
        
        // 显示错误消息
        if (assistantMessage) {
          assistantMessage.content = errorMessage;
          assistantMessage.displayContent = errorMessage;
          assistantMessage.isError = true;
        } else {
          this.messages.push({
            type: 'assistant',
            content: errorMessage,
            time: this.getCurrentTime(),
            displayContent: errorMessage,
            isTyping: false,
            isError: true
          });
        }
        
        this.scrollToBottom();
        console.error('聊天错误处理:', error);
      },
      
      /**
       * 停止当前聊天请求
       */
      stopCurrentChat() {
        if (this.currentEventSource) {
          this.currentEventSource.close();
          this.currentEventSource = null;
        }
        this.isTypingResponse = false;
        this.isConnecting = false;
        
        // 移除打字指示器
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage && lastMessage.isTyping) {
          this.messages.pop();
        }
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
          if (this.$refs.fullscreenMessagesContainer) {
            this.$refs.fullscreenMessagesContainer.scrollTop = this.$refs.fullscreenMessagesContainer.scrollHeight;
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
      },
      // 输入框聚焦方法
      focusInput(event) {
        // 避免点击发送按钮时触发
        if (event.target.closest('.fullscreen-send-button')) {
          return;
        }
        
        // 聚焦到输入框
        this.$nextTick(() => {
          if (this.$refs.fullscreenInput) {
            this.$refs.fullscreenInput.focus();
          }
        });
      },
      
      // === 新增功能方法 ===
      
      // 收起/展开侧边栏
      toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        // 收起侧边栏时清除搜索
        if (this.sidebarCollapsed) {
          this.searchQuery = '';
          this.selectedGroupId = null; // 重置分组选择
        }
        
        console.log('侧边栏状态:', this.sidebarCollapsed ? '收起' : '展开');
        console.log('分组数量:', this.userGroups.length);
        console.log('分组数据:', this.userGroups);
      },
      
      // 搜索相关方法
      onSearchInput() {
        // 搜索功能在计算属性中实现
      },
      
      clearSearch() {
        this.searchQuery = '';
      },
      
      // 分组相关方法
      selectGroup(groupId) {
        this.selectedGroupId = this.selectedGroupId === groupId ? null : groupId;
      },
      
      getGroupChatCount(groupId) {
        // 使用分组数据中已经计算好的对话数量
        const group = this.userGroups.find(g => g.id === groupId);
        return group ? group.conversation_count : 0;
      },
      
      getFilteredChats() {
        let chats;
        
        // 如果选中了某个分组，只显示该分组的对话
        if (this.selectedGroupId) {
          chats = this.chatHistories.filter(chat => chat.group_id === this.selectedGroupId);
        } else {
          // 显示所有不属于任何分组的对话
          chats = this.chatHistories.filter(chat => !chat.group_id);
        }
        
        // 如果有搜索关键词，进行过滤
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase();
          chats = chats.filter(chat => 
            chat.title.toLowerCase().includes(query) ||
            (chat.messages && chat.messages.some(msg => msg.content.toLowerCase().includes(query)))
          );
        }
        
        return chats;
      },
      
      // 显示新建分组对话框
      showAddGroupDialog() {
        this.groupForm.name = '';
        this.showGroupDialog = true;
        
        // 确保对话框z-index正确
        this.$nextTick(() => {
          this.forceElementUIZIndex();
        });
      },
      
      // 创建新分组
      async createGroup() {
        this.$refs.groupForm.validate(async (valid) => {
          if (valid) {
            try {
              const response = await VisionAIService.chatAssistantAPI.createGroup(this.groupForm.name.trim());
              
              console.log('创建分组API响应:', response.data); // 添加调试日志
              
              // 适配后端返回的格式
              let isSuccess = false;
              if (response.data && response.data.code === 0) {
                isSuccess = true;
              } else if (response.data && response.data.success) {
                isSuccess = true;
              }
              
              if (isSuccess) {
                // 重新加载分组列表和会话列表
                await this.loadUserGroups();
                await this.loadChatConversations();
                
                this.showGroupDialog = false;
                this.$message.success(`分组"${this.groupForm.name}"创建成功`);
                
                console.log('创建新分组成功:', response.data);
              } else {
                throw new Error(response.data && response.data.msg ? response.data.msg : '创建分组失败');
              }
            } catch (error) {
              console.error('创建分组失败:', error);
              this.$message.error('创建分组失败：' + (error.message || '请稍后重试'));
            }
          }
        });
      },
      
      // 显示分组操作按钮
      showGroupActions(groupId) {
        this.hoveredGroupId = groupId;
      },
      
      // 隐藏分组操作按钮
      hideGroupActions() {
        this.hoveredGroupId = null;
      },
      
      // 确认删除分组
      confirmDeleteGroup(groupId) {
        const group = this.userGroups.find(g => g.id === groupId);
        if (!group) {
          this.$message.error('未找到要删除的分组');
          return;
        }
        
        const groupChatCount = this.getGroupChatCount(groupId);
        
        // 确保确认对话框z-index正确
        this.$nextTick(() => {
          this.forceElementUIZIndex();
        });
        
        let confirmMessage = `确定要删除分组"${group.name}"吗？`;
        if (groupChatCount > 0) {
          confirmMessage += `\n\n该分组下有 ${groupChatCount} 个对话，删除后这些对话将移动到"无分组"。`;
        }
        
        this.$confirm(confirmMessage, '删除分组', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: false
        }).then(() => {
          this.deleteGroup(groupId);
        }).catch(() => {
          // 用户取消
        });
      },
      
      // 删除分组
      async deleteGroup(groupId) {
        const group = this.userGroups.find(g => g.id === groupId);
        if (!group) {
          this.$message.error('未找到要删除的分组');
          return;
        }
        
        try {
          const response = await VisionAIService.chatAssistantAPI.deleteGroup(groupId);
          
          console.log('删除分组API响应:', response.data); // 添加调试日志
          
          // 适配后端返回的格式
          let isSuccess = false;
          if (response.data && response.data.code === 0) {
            isSuccess = true;
          } else if (response.data && response.data.success) {
            isSuccess = true;
          }
          
          if (isSuccess) {
            // 重新加载分组列表和对话列表
            await this.loadUserGroups();
            await this.loadChatConversations();
            
            // 如果当前选中的是被删除的分组，切换到无分组
            if (this.selectedGroupId === groupId) {
              this.selectedGroupId = null;
            }
            
            this.$message.success(`分组"${group.name}"已删除，相关对话已移动到无分组`);
            
            console.log('删除分组成功：', group);
          } else {
            throw new Error(response.data && response.data.msg ? response.data.msg : '删除分组失败');
          }
        } catch (error) {
          console.error('删除分组失败:', error);
          this.$message.error('删除分组失败：' + (error.message || '请稍后重试'));
        }
      },
      
      // 注：移除localStorage持久化功能，保持纯前端内存状态
      // 刷新页面后数据将重置
      
      // 聊天项鼠标事件
      showChatActions(chatId) {
        this.hoveredChatId = chatId;
      },
      
      hideChatActions() {
        this.hoveredChatId = null;
      },
      
      // 显示右键菜单
      showChatMenu(chatId, event) {
        console.log('=== 显示右键菜单 ===');
        console.log('传入的chatId:', chatId);
        console.log('当前chatHistories:', this.chatHistories);
        
        this.selectedChatId = chatId;
        this.showContextMenu = true;
        
        console.log('设置selectedChatId为:', this.selectedChatId);
        
        // 计算菜单位置
        const x = event.clientX;
        const y = event.clientY;
        
        this.contextMenuStyle = {
          position: 'fixed',
          left: x + 'px',
          top: y + 'px',
          zIndex: 20006
        };
      },
      
      // 隐藏右键菜单
      hideContextMenu() {
        this.showContextMenu = false;
        // 注意：不要在这里重置selectedChatId，因为移动对话框可能还在使用它
        // this.selectedChatId = null;
      },
      
      // 编辑聊天标题
      editChatTitle() {
        const chat = this.chatHistories.find(c => c.id === this.selectedChatId);
        if (chat) {
          // 确保prompt对话框z-index正确
          this.$nextTick(() => {
            this.forceElementUIZIndex();
          });
          
          this.$prompt('请输入新的标题', '编辑标题', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: chat.title,
            inputValidator: (value) => {
              if (!value || !value.trim()) {
                return '标题不能为空';
              }
              if (value.length > 50) {
                return '标题不能超过50个字符';
              }
              return true;
            }
          }).then(async ({ value }) => {
            try {
              // 调用后端API更新标题
              const response = await VisionAIService.chatAssistantAPI.updateConversationTitle(
                this.selectedChatId, 
                value.trim()
              );
              
              console.log('更新标题API响应:', response.data); // 添加调试日志
              
              // 适配后端返回的格式
              let isSuccess = false;
              if (response.data && response.data.code === 0) {
                isSuccess = true;
              } else if (response.data && response.data.success) {
                isSuccess = true;
              }
              
              if (isSuccess) {
                // 更新本地状态
                chat.title = value.trim();
                chat.updatedAt = new Date().toISOString();
                
                // 重新加载会话列表以同步数据
                await this.loadChatConversations();
                
                this.$message.success('标题修改成功');
                console.log('标题修改成功:', value.trim());
              } else {
                throw new Error(response.data && response.data.msg ? response.data.msg : '标题修改失败');
              }
            } catch (error) {
              console.error('修改标题失败:', error);
              this.$message.error('修改标题失败：' + (error.message || '请稍后重试'));
            }
            
            this.selectedChatId = null; // 编辑完成后重置选中的聊天ID
          }).catch(() => {
            // 用户取消
            this.selectedChatId = null; // 取消时也重置选中的聊天ID
          });
        }
        this.hideContextMenu();
      },
      
      // 显示移动到分组对话框
      showMoveToGroupDialog() {
        console.log('=== 显示移动到分组对话框 ===');
        console.log('selectedChatId:', this.selectedChatId);
        console.log('chatHistories:', this.chatHistories);
        
        const chat = this.chatHistories.find(c => c.id === this.selectedChatId);
        console.log('找到的聊天记录:', chat);
        
        this.selectedGroupForMove = chat ? chat.groupId : null;
        
        console.log('显示移动到分组对话框，当前分组ID：', this.selectedGroupForMove);
        console.log('可用分组数量：', this.userGroups.length);
        
        this.showMoveDialog = true;
        this.hideContextMenu();
        
        // 确保对话框z-index正确
        this.$nextTick(() => {
          this.forceElementUIZIndex();
        });
      },
      
      // 选择移动的分组
      selectGroupForMove(groupId) {
        this.selectedGroupForMove = groupId;
        console.log('选择分组ID：', groupId);
      },
      
      // 取消移动到分组
      cancelMoveToGroup() {
        this.showMoveDialog = false;
        this.selectedGroupForMove = null;
        this.selectedChatId = null; // 取消时重置选中的聊天ID
        console.log('取消移动操作');
      },
      
      // 确认移动到分组
      async confirmMoveToGroup() {
        console.log('=== 开始移动到分组 ===');
        console.log('selectedChatId:', this.selectedChatId);
        console.log('selectedGroupForMove:', this.selectedGroupForMove);
        
        // 检查是否有选中的聊天ID
        if (!this.selectedChatId) {
          console.error('没有选中的聊天ID');
          this.$message.error('请先选择要移动的对话');
          this.cancelMoveToGroup();
          return;
        }
        
        try {
          const response = await VisionAIService.chatAssistantAPI.updateConversationGroup(
            this.selectedChatId, 
            this.selectedGroupForMove
          );
          
          console.log('移动对话API响应:', response.data); // 添加调试日志
          
          // 适配后端返回的格式
          let isSuccess = false;
          if (response.data && response.data.code === 0) {
            isSuccess = true;
          } else if (response.data && response.data.success) {
            isSuccess = true;
          }
          
          if (isSuccess) {
            // 重新加载对话列表和分组列表
            await this.loadChatConversations();
            await this.loadUserGroups();
            
            // 显示成功消息
            if (this.selectedGroupForMove === null) {
              this.$message.success('已移动到无分组');
            } else {
              const targetGroup = this.userGroups.find(g => g.id === this.selectedGroupForMove);
              this.$message.success(`已移动到"${targetGroup ? targetGroup.name : '未知分组'}"`);
            }
            
            this.showMoveDialog = false;
            this.selectedGroupForMove = null;
            this.selectedChatId = null;
            
            console.log('移动操作完成');
          } else {
            throw new Error(response.data && response.data.msg ? response.data.msg : '移动对话失败');
          }
        } catch (error) {
          console.error('移动对话失败:', error);
          this.$message.error('移动对话失败：' + (error.message || '请稍后重试'));
          this.cancelMoveToGroup();
        }
      },
      
      // 确认删除聊天
      confirmDeleteChat() {
        // 确保确认对话框z-index正确
        this.$nextTick(() => {
          this.forceElementUIZIndex();
        });
        
        this.$confirm('此操作将永久删除该对话, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteChatHistory(this.selectedChatId);
          this.$message.success('删除成功');
          this.hideContextMenu();
          this.selectedChatId = null; // 删除完成后重置选中的聊天ID
          
          // 如果删除的是当前全屏聊天，且没有其他聊天了，退出全屏
          if (this.isFullScreen && this.chatHistories.length === 0) {
            this.exitFullScreen();
          }
        }).catch(() => {
          // 用户取消，也要关闭右键菜单
          this.hideContextMenu();
          this.selectedChatId = null; // 取消时也重置选中的聊天ID
        });
      },
      // 全局点击处理，关闭右键菜单
      handleGlobalClick() {
        if (this.showContextMenu) {
          this.hideContextMenu();
        }
      },
      

      

      

      
      /**
       * 从API加载会话列表
       */
      async loadChatConversations() {
        try {
          console.log('加载会话列表...');
          const response = await VisionAIService.chatAssistantAPI.getChatConversations({ limit: 50 });
          
          console.log('会话API响应:', response.data); // 添加调试日志
          
          // 适配后端返回的格式: {code: 0, msg: 'success', data: Array}
          let conversationsData = [];
          
          if (response.data && response.data.code === 0 && Array.isArray(response.data.data)) {
            conversationsData = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            // 兼容直接返回数组的格式
            conversationsData = response.data;
          } else {
            console.warn('会话列表格式错误或为空:', response.data);
            this.$set(this, 'chatHistories', []);
            return;
          }
          
          // 转换API返回的会话格式为前端格式
          const newChatHistories = conversationsData.map(conv => ({
            id: conv.conversation_id, // 添加id字段用于前端操作
            conversation_id: conv.conversation_id,
            title: conv.title || '新的对话',
            message_count: conv.message_count || 0,
            last_message_time: conv.last_message_time,
            created_at: conv.created_at,
            updatedAt: conv.last_message_time, // 添加updatedAt字段用于时间显示
            group_id: conv.group_id, // 保持后端字段名
            groupId: conv.group_id, // 同时支持前端习惯的字段名
            messages: [] // 消息将在需要时单独加载
          }));
          
          // 使用 Vue.set 确保响应式更新
          this.$set(this, 'chatHistories', newChatHistories);
          
          console.log('会话列表加载成功:', this.chatHistories.length, '个会话');
          console.log('会话详细数据:', this.chatHistories);
          
          // 强制触发Vue重新渲染
          this.$forceUpdate();
          
        } catch (error) {
          console.error('加载会话列表失败:', error);
          // 不显示错误消息，保持默认的空列表
          this.$set(this, 'chatHistories', []);
        }
      },
      
      /**
       * 从API加载用户分组列表
       */
      async loadUserGroups() {
        try {
          console.log('加载分组列表...');
          const response = await VisionAIService.chatAssistantAPI.getGroups();
          
          console.log('分组API响应:', response.data); // 添加调试日志
          
          // 适配后端返回的格式: {code: 0, msg: 'success', data: Array}
          let groupsData = [];
          
          if (response.data && response.data.code === 0 && Array.isArray(response.data.data)) {
            groupsData = response.data.data;
          } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
            // 兼容 {success: true, data: Array} 格式
            groupsData = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            // 兼容直接返回数组的格式
            groupsData = response.data;
          } else {
            console.warn('分组列表格式错误或为空:', response.data);
            this.$set(this, 'userGroups', []);
            return;
          }
          
          // 转换API返回的分组格式为前端格式
          const newGroups = groupsData.map(group => ({
            id: group.id,
            name: group.name,
            conversation_count: group.conversation_count || 0,
            created_at: group.created_at,
            updated_at: group.updated_at
          }));
          
          // 使用 Vue.set 确保响应式更新
          this.$set(this, 'userGroups', newGroups);
          
          console.log('分组列表加载成功:', this.userGroups.length, '个分组');
          console.log('分组详细数据:', this.userGroups);
          
          // 强制触发Vue重新渲染
          this.$forceUpdate();
          
        } catch (error) {
          console.error('加载分组列表失败:', error);
          // 不显示错误消息，保持默认的空列表
          this.$set(this, 'userGroups', []);
        }
      },
      
      // 强制设置Element UI组件的z-index
      forceElementUIZIndex() {
        console.log('强制设置Element UI组件z-index...');
        
        // 设置对话框z-index
        const dialogWrappers = document.querySelectorAll('.el-dialog__wrapper');
        dialogWrappers.forEach(wrapper => {
          wrapper.style.zIndex = '30000';
        });
        
        const dialogs = document.querySelectorAll('.el-dialog');
        dialogs.forEach(dialog => {
          dialog.style.zIndex = '30001';
        });
        
        // 设置消息确认框z-index
        const messageBoxWrappers = document.querySelectorAll('.el-message-box__wrapper');
        messageBoxWrappers.forEach(wrapper => {
          wrapper.style.zIndex = '30002';
        });
        
        const messageBoxes = document.querySelectorAll('.el-message-box');
        messageBoxes.forEach(box => {
          box.style.zIndex = '30003';
        });
        
        // 设置下拉框z-index
        const dropdowns = document.querySelectorAll('.el-select-dropdown');
        dropdowns.forEach(dropdown => {
          dropdown.style.zIndex = '30004';
        });
        
        console.log('Element UI组件z-index设置完成');
      },
      
      // 调试方法：手动检查组件状态
      debugGroupsDisplay() {
        console.log('=== 分组显示调试信息 ===');
        console.log('是否在全屏模式:', this.isFullScreen);
        console.log('侧边栏是否收起:', this.sidebarCollapsed);
        console.log('分组数量:', this.userGroups.length);
        console.log('分组数据:', this.userGroups);
        console.log('会话数量:', this.chatHistories.length);
        console.log('会话数据:', this.chatHistories);
        
        // 检查DOM元素
        const fullscreenContainer = document.querySelector('.fullscreen-chat-container');
        const sidebarElement = document.querySelector('.chat-history-sidebar');
        const groupsSection = document.querySelector('.groups-section');
        const groupsList = document.querySelector('.groups-list');
        const groupItems = document.querySelectorAll('.group-item');
        const chatItems = document.querySelectorAll('.chat-history-item');
        
        console.log('全屏容器DOM元素:', fullscreenContainer);
        console.log('侧边栏DOM元素:', sidebarElement);
        console.log('分组区域DOM元素:', groupsSection);
        console.log('分组列表DOM元素:', groupsList);
        console.log('分组项数量:', groupItems.length);
        console.log('会话项数量:', chatItems.length);
        
        if (sidebarElement) {
          const sidebarStyles = window.getComputedStyle(sidebarElement);
          console.log('侧边栏样式:', {
            display: sidebarStyles.display,
            visibility: sidebarStyles.visibility,
            opacity: sidebarStyles.opacity,
            width: sidebarStyles.width
          });
        }
        
        if (groupsSection) {
          const styles = window.getComputedStyle(groupsSection);
          console.log('分组区域样式:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity
          });
        }
        
        // 强制刷新数据
        this.loadUserGroups();
        this.loadChatConversations();
        
        return {
          isFullScreen: this.isFullScreen,
          sidebarCollapsed: this.sidebarCollapsed,
          groupsCount: this.userGroups.length,
          groupsData: this.userGroups,
          chatsCount: this.chatHistories.length,
          chatsData: this.chatHistories
        };
      },
      
      // 手动测试API调用
      async testAPICalls() {
        console.log('=== 手动测试API调用 ===');
        
        try {
          // 1. 测试获取分组列表
          console.log('1. 测试获取分组列表...');
          const groupsResponse = await VisionAIService.chatAssistantAPI.getGroups();
          console.log('分组列表响应:', groupsResponse);
          console.log('分组列表响应数据:', groupsResponse.data);
          
          // 2. 测试获取会话列表
          console.log('2. 测试获取会话列表...');
          const chatsResponse = await VisionAIService.chatAssistantAPI.getChatConversations();
          console.log('会话列表响应:', chatsResponse);
          console.log('会话列表响应数据:', chatsResponse.data);
          
          // 3. 测试创建分组
          console.log('3. 测试创建分组...');
          const createResponse = await VisionAIService.chatAssistantAPI.createGroup('测试分组' + Date.now());
          console.log('创建分组响应:', createResponse);
          console.log('创建分组响应数据:', createResponse.data);
          
          // 4. 再次获取分组列表
          console.log('4. 创建后再次获取分组列表...');
          const groupsResponse2 = await VisionAIService.chatAssistantAPI.getGroups();
          console.log('创建后分组列表响应:', groupsResponse2);
          console.log('创建后分组列表响应数据:', groupsResponse2.data);
          
          return {
            groupsResponse: groupsResponse.data,
            chatsResponse: chatsResponse.data,
            createResponse: createResponse.data,
            groupsAfterCreate: groupsResponse2.data
          };
          
        } catch (error) {
          console.error('API测试失败:', error);
          return { error: error.message };
        }
      },
      
      // 监听Element UI组件的创建
      observeElementUIComponents() {
        // 创建观察器来监听DOM变化
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // 检查是否是Element UI组件
                if (node.classList && (
                  node.classList.contains('el-dialog__wrapper') ||
                  node.classList.contains('el-message-box__wrapper') ||
                  node.classList.contains('el-select-dropdown')
                )) {
                  // 延迟设置z-index，确保组件完全渲染
                  setTimeout(() => {
                    this.forceElementUIZIndex();
                  }, 50);
                }
              }
            });
          });
        });
        
        // 开始观察
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // 保存观察器引用以便后续清理
        this._elementUIObserver = observer;
      }
    },
    computed: {
      isOnRightSide() {
        // 判断助手是否在屏幕右半边
        return this.position.side === 'right';
      },
      // 过滤的聊天列表（用于搜索）
      filteredChats() {
        if (!this.searchQuery.trim()) {
          return this.chatHistories;
        }
        
        const query = this.searchQuery.toLowerCase();
        return this.chatHistories.filter(chat => 
          chat.title.toLowerCase().includes(query) ||
          chat.messages.some(msg => msg.content.toLowerCase().includes(query))
        );
              }
          },
    watch: {
      // 监听移动对话框的关闭，确保状态重置
      showMoveDialog(newVal) {
        if (!newVal) {
          // 对话框关闭时重置状态
          this.selectedGroupForMove = null;
          this.selectedChatId = null;
        }
      }
    },
    async mounted() {
      console.log('=== 智能助手组件初始化 ===');
      
      // 初始化位置到右侧
      this.initializePosition();
      
      // 确保侧边栏初始状态为展开（重要！）
      this.sidebarCollapsed = false;
      console.log('侧边栏初始化为展开状态');
      
      // 监听窗口大小变化，调整助手位置
      window.addEventListener('resize', this.handleWindowResize);
      
      // 启动自动隐藏计时器
      this.startHideTimer();
      
      // 添加全局点击监听器，用于关闭右键菜单
      document.addEventListener('click', this.handleGlobalClick);
      
      // 启动Element UI组件观察器
      this.observeElementUIComponents();
      
      // 加载会话列表和分组列表
      await this.loadChatConversations();
      await this.loadUserGroups();
      
      // 初始化时强制设置Element UI组件z-index
      this.$nextTick(() => {
        this.forceElementUIZIndex();
        console.log('组件初始化完成 - 已连接后端API');
        console.log('当前侧边栏状态:', this.sidebarCollapsed ? '收起' : '展开');
        console.log('当前分组数量:', this.userGroups.length);
      });
    },
    beforeDestroy() {
      // 清理聊天连接
      this.stopCurrentChat();
      
      // 清理事件监听器
      window.removeEventListener('resize', this.handleWindowResize);
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
      document.removeEventListener('click', this.handleGlobalClick);
      
      // 清理隐藏计时器
      this.clearHideTimer();
      
      // 清理Element UI组件观察器
      if (this._elementUIObserver) {
        this._elementUIObserver.disconnect();
        this._elementUIObserver = null;
      }
      
      console.log('智能助手组件已销毁，所有连接已清理');
    }
  }
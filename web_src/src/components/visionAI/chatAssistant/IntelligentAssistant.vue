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
        'hide-to-left': isAutoHidden && !isOnRightSide,
        'appearing-from-fullscreen': justExitedFullScreen
      }"
      :style="getFloatBallStyle()"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="toggleChat"
      @mousedown="startDrag"
      v-if="!isFullScreen"
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
      v-if="isChatOpen && !isFullScreen"
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
          <button class="fullscreen-btn" @click="toggleFullScreen">
            <i class="el-icon-full-screen"></i>
          </button>
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

    <!-- 全屏聊天界面 -->
    <div class="fullscreen-chat-container" v-if="isFullScreen" :class="{ 'exiting': isExitingFullScreen }" :style="getExitAnimationStyle()">
      <!-- 左侧历史聊天 -->
      <div class="chat-history-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- 顶部操作按钮组 -->
        <div class="sidebar-header">
          <div class="header-actions">
            <div class="action-btn" @click="toggleSidebar" :title="sidebarCollapsed ? '展开侧栏' : '收起侧栏'">
              <i :class="sidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
            </div>
            <div class="action-btn" @click="createNewChat" title="新建对话">
              <i class="el-icon-plus"></i>
            </div>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="search-container">
          <div class="search-wrapper">
            <i class="el-icon-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索对话" 
              class="search-input"
              @input="onSearchInput"
            />
            <i v-if="searchQuery" class="el-icon-close clear-icon" @click="clearSearch"></i>
          </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-list-container">
          <!-- 分组区域 -->
          <div class="groups-section">
            <div class="section-header">
              <span class="section-title">分组</span>
              <div class="section-actions">
                <i class="el-icon-plus add-group-btn" @click="showAddGroupDialog" title="新建分组"></i>
              </div>
            </div>
            <div class="groups-list">
              <div 
                v-for="group in userGroups" 
                :key="group.id"
                class="group-item"
                :class="{ 'active': selectedGroupId === group.id }"
                @click="selectGroup(group.id)"
                @mouseenter="showGroupActions(group.id)"
                @mouseleave="hideGroupActions"
              >
                <div class="group-info">
                  <span class="group-name">{{ group.name }}</span>
                  <span class="group-count">({{ getGroupChatCount(group.id) }})</span>
                </div>
                <div class="group-actions" v-show="hoveredGroupId === group.id">
                  <div class="group-action-btn" @click.stop="confirmDeleteGroup(group.id)" title="删除分组">
                    <i class="el-icon-delete"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天区域 -->
          <div class="chats-section">
            <div class="section-header">
              <span class="section-title clickable-title" 
                    :class="{ 'active': selectedGroupId === null }"
                    @click="selectGroup(null)"
                    title="点击查看无分组对话">聊天</span>
            </div>
            <div class="chats-list">
              <div 
                v-for="chat in getFilteredChats()" 
                :key="chat.id"
                class="chat-history-item"
                :class="{ 'active': chat.id === currentChatId }"
                @click="loadChatHistory(chat.id)"
                @mouseenter="showChatActions(chat.id)"
                @mouseleave="hideChatActions"
              >
                <div class="chat-info">
                  <div class="chat-title">{{ chat.title }}</div>
                  <div class="chat-time">{{ formatChatTime(chat.updatedAt) }}</div>
                </div>
                <div class="chat-actions" v-show="hoveredChatId === chat.id">
                  <div class="chat-more-btn" @click.stop="showChatMenu(chat.id, $event)">
                    <i class="el-icon-more"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索结果为空时的提示 -->
          <div v-if="searchQuery && filteredChats.length === 0" class="empty-search">
            <div class="empty-icon">
              <i class="el-icon-search"></i>
            </div>
            <div class="empty-text">未找到相关对话</div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-main-area" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- 顶部工具栏 -->
        <div class="chat-toolbar">
          <div class="toolbar-left">
            <div class="current-chat-title">
              {{ getCurrentChatTitle() }}
            </div>
          </div>
          <div class="toolbar-right">
            <button class="exit-fullscreen-btn" @click="exitFullScreen">
              <i class="el-icon-close"></i>
              <span>退出全屏</span>
            </button>
          </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="fullscreen-chat-content">
          <div class="fullscreen-welcome-wrapper" v-if="showWelcomeMessage">
            <div class="welcome-message">
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
          </div>

          <!-- 聊天消息列表 -->
          <div class="fullscreen-messages-container" ref="fullscreenMessagesContainer">
            <div class="fullscreen-messages-wrapper">
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
        </div>

        <!-- 输入区域 -->
        <div class="fullscreen-input-area">
          <div class="fullscreen-input-container">
            <div class="fullscreen-input-wrapper" @click="focusInput">
              <el-input
                ref="fullscreenInput"
                v-model="inputMessage"
                placeholder="有什么我可以帮您的吗？"
                @keyup.enter.native="sendMessage"
    
                class="fullscreen-message-input"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                resize="none"
              >
              </el-input>
              <el-button 
                @click="sendMessage" 
                :disabled="!inputMessage.trim()"
                class="fullscreen-send-button"
                circle
              >
                <i class="el-icon-position"></i>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="showContextMenu" class="context-menu" :style="contextMenuStyle" @click.stop>
      <div class="menu-item" @click="editChatTitle">
        <i class="el-icon-edit"></i>
        <span>编辑标题</span>
      </div>
      <div class="menu-item" @click="showMoveToGroupDialog">
        <i class="el-icon-folder"></i>
        <span>移动到分组</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item danger" @click="confirmDeleteChat">
        <i class="el-icon-delete"></i>
        <span>删除对话</span>
      </div>
    </div>

    <!-- 新建分组对话框 -->
    <el-dialog
      title="新建分组"
      :visible.sync="showGroupDialog"
      width="400px"
      :close-on-click-modal="false"
      custom-class="modern-dialog"
    >
      <el-form ref="groupForm" :model="groupForm" :rules="groupRules" label-position="top">
        <el-form-item label="分组名称" prop="name">
          <el-input 
            v-model="groupForm.name" 
            placeholder="请输入分组名称"
            maxlength="20"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showGroupDialog = false">取 消</el-button>
        <el-button type="primary" @click="createGroup">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 移动到分组对话框 - 重新设计 -->
    <el-dialog
      title="移动到分组"
      :visible.sync="showMoveDialog"
      width="400px"
      :close-on-click-modal="false"
      custom-class="modern-dialog"
    >
      <div style="margin-bottom: 20px;">
        <p style="color: #666; margin-bottom: 15px;">选择要移动到的分组：</p>
        
        <!-- 无分组选项 -->
        <div 
          class="group-option-item" 
          :class="{ 'selected': selectedGroupForMove === null }"
          @click="selectGroupForMove(null)"
        >
          <i class="el-icon-folder-opened"></i>
          <span>📁 无分组</span>
          <i v-if="selectedGroupForMove === null" class="el-icon-check check-icon"></i>
        </div>
        
        <!-- 分组选项列表 -->
        <div v-if="userGroups.length > 0">
          <div 
            v-for="group in userGroups" 
            :key="group.id"
            class="group-option-item"
            :class="{ 'selected': selectedGroupForMove === group.id }"
            @click="selectGroupForMove(group.id)"
          >
            <i class="el-icon-folder"></i>
            <span>📂 {{ group.name }}</span>
            <i v-if="selectedGroupForMove === group.id" class="el-icon-check check-icon"></i>
          </div>
        </div>
        
        <!-- 无分组提示 -->
        <div v-if="userGroups.length === 0" style="padding: 20px; text-align: center; color: #999;">
          <i class="el-icon-folder-add" style="font-size: 32px; margin-bottom: 10px;"></i>
          <p>暂无分组，请先创建分组</p>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelMoveToGroup">取 消</el-button>
        <el-button type="primary" @click="confirmMoveToGroup">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 全局点击处理，关闭右键菜单 -->
    <div v-if="showContextMenu" class="context-menu-overlay" @click="hideContextMenu"></div>

    <!-- 遮罩层 -->
    <div 
      class="dialog-overlay" 
      v-if="isChatOpen && !isFullScreen"
      @click="closeChat"
    ></div>
  </div>
</template>

<script>
import IntelligentAssistant from './IntelligentAssistant.js'
export default IntelligentAssistant
</script>

<style scoped>
@import './IntelligentAssistant.css';
</style> 
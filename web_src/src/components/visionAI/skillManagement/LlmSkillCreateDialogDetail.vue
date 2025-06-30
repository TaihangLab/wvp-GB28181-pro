<template>
    <div class="create-detail-wrapper">
      <div class="create-detail-container">
        <!-- 进度导航 -->
        <div class="progress-nav">
          <div class="progress-step completed">
            <div class="step-circle">
              <i class="el-icon-check"></i>
            </div>
            <div class="step-info">
              <div class="step-title">基础信息</div>
              <div class="step-desc">已完成</div>
            </div>
          </div>
          <div class="progress-line active"></div>
          <div class="progress-step active">
            <div class="step-circle">2</div>
            <div class="step-info">
              <div class="step-title">详细配置</div>
              <div class="step-desc">进行中</div>
            </div>
          </div>
        </div>

        <!-- 头部信息 -->
        <div class="header-info">
          <div class="skill-basic-info">
            <div class="skill-icon">
              <img :src="skillInfo.iconUrl || '/static/logo.png'" alt="技能图标" />
            </div>
            <div class="skill-details">
              <h2 class="skill-name">{{ skillInfo.name }}</h2>
              <div class="skill-meta">
                <div class="skill-id-badge">
                  <span class="id-label">ID</span>
                  <span class="id-value">{{ skillInfo.skillId }}</span>
                </div>
                <el-tag size="small" type="primary">{{ skillInfo.scenario === 'vision' ? '视频分析' : '图片处理' }}</el-tag>
                <el-tag size="small">{{ skillInfo.tags }}</el-tag>
              </div>
            </div>
          </div>
          <div class="skill-description">{{ skillInfo.description }}</div>
          <div class="header-actions">
            <el-button @click="goBack" icon="el-icon-back">返回</el-button>
            <el-button type="primary" @click="saveSkill" :loading="saving" icon="el-icon-check">
              保存技能
            </el-button>
          </div>
        </div>
  
        <div class="content-layout">
          <!-- 上方布局 -->
          <div class="top-content">
            <!-- 左侧：提示词配置 -->
          <div class="left-content">
              <div class="prompt-section">
                <h3 class="section-title">
                  <i class="el-icon-chat-line-square"></i>
                  提示词配置
                </h3>
                
                <div class="prompt-editor">
                  <div class="prompt-header">
                    <span>提示词模板</span>
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="useTemplate" 
                      class="template-btn">
                      使用模板
                    </el-button>
                  </div>
                  
                  <div class="smart-prompt-editor" ref="promptEditor" @click="handleEditorClick" @dblclick="handleEditorDblclick" @keydown="handleEditorKeydown" @input="handleEditorInput" @paste="handleEditorPaste" @beforeinput="handleBeforeInput" @dragstart="handleDragStart" @drop="handleDrop" tabindex="0" contenteditable="true">
                    <div v-if="!promptTemplate.trim()" class="editor-placeholder">
                      请输入提示词模板或点击"使用模板"开始
                    </div>
                    <div v-else class="editor-content">
                      <div 
                        v-for="(segment, index) in parsedPrompt" 
                        :key="index"
                        :class="getSegmentClass(segment)"
                        @click="handleSegmentClick(segment, index)">
                        <span v-if="segment.type === 'text'" v-html="formatText(segment.content)"></span>
                        <textarea 
                          v-else-if="segment.type === 'input'"
                          :placeholder="segment.placeholder"
                          v-model="segment.value"
                          @focus="handleInputFocus"
                          @blur="handleInputBlur"
                          @input="handleInputChange"
                          @keydown="handleTextareaKeydown"
                          @paste="handleTextareaPaste"
                          class="inline-input"
                          :ref="`input-${index}`"
                          rows="1"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：效果验证 -->
            <div class="right-content">
              <div class="validation-section">
                <h3 class="section-title">
                  <i class="el-icon-view"></i>
                  效果验证
                </h3>
                
                <div class="validation-content">
                  <div class="validation-steps">
                    <div class="step-item">
                      <div class="step-number">1</div>
                      <div class="step-text">上传测试图片</div>
                    </div>
                    <div class="step-item">
                      <div class="step-number">2</div>
                      <div class="step-text">AI 分析处理</div>
                    </div>
                    <div class="step-item">
                      <div class="step-number">3</div>
                      <div class="step-text">查看输出结果</div>
                    </div>
                  </div>
                  
                  <div class="upload-area">
                    <el-upload
                      class="image-uploader"
                      action="#"
                      :show-file-list="false"
                      :auto-upload="false"
                      :on-change="handleImageUpload"
                      accept="image/*"
                      drag>
                      <div v-if="uploadedImage" class="uploaded-image">
                        <img :src="uploadedImage" alt="上传的图片" />
                        <div class="image-overlay">
                          <i class="el-icon-refresh-right"></i>
                          <span>点击更换图片</span>
                        </div>
                      </div>
                      <div v-else class="upload-placeholder">
                        <i class="el-icon-upload2"></i>
                        <div class="upload-text">将图片拖拽到此处</div>
                        <div class="upload-text">或 <span class="upload-link">点击上传</span></div>
                        <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 5MB</div>
                      </div>
                    </el-upload>
                  </div>

                  <div class="test-actions">
                    <el-button 
                      type="primary" 
                      @click="runValidation" 
                      :loading="validating"
                      :disabled="!uploadedImage || !promptTemplate.trim()"
                      icon="el-icon-cpu"
                      size="medium">
                      <span v-if="validating">分析中...</span>
                      <span v-else>开始分析</span>
                    </el-button>
                  </div>

                  <div class="ai-result" v-if="validationResult">
                    <div class="result-header">
                      <h4>
                        <i class="el-icon-success"></i>
                        AI分析结果
                      </h4>
                      <el-button type="text" size="small" icon="el-icon-copy-document" @click="copyResult">
                        复制结果
                      </el-button>
                    </div>
                    <div class="result-content">
                      <pre>{{ validationResult }}</pre>
                    </div>
                    <div class="result-actions">
                      <el-button size="small" icon="el-icon-refresh" @click="runValidation" :loading="validating">
                        重新分析
                      </el-button>
                    </div>
                  </div>

                  <div class="validation-help" v-else>
                    <div class="help-title">
                      <i class="el-icon-info"></i>
                      验证说明
                    </div>
                    <ul class="help-list">
                      <li>上传一张测试图片验证提示词效果</li>
                      <li>确保提示词模板已配置完成</li>
                      <li>分析结果将展示AI对图片的理解</li>
                      <li>可根据结果调整提示词内容</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 下方：技能配置 -->
          <div class="bottom-content">
            <div class="config-section">
              <h3 class="section-title">
                <i class="el-icon-setting"></i>
                技能配置
              </h3>
              
              <!-- 输出参数 -->
              <div class="config-group">
                <h4 class="group-title">
                  <i class="el-icon-data-line"></i>
                  输出参数配置
                </h4>
                <div class="param-help">
                  配置AI分析后的输出参数，这些参数将用于后续的预警条件判断
                </div>
                <div class="output-params">
                  <div class="param-header">
                    <span class="header-item">
                      参数名称
                      <el-tooltip 
                        content="支持输入1～30字中英文、数字或下划线；必须以中英文开头" 
                        placement="top">
                        <i class="el-icon-question param-help-icon"></i>
                      </el-tooltip>
                    </span>
                    <span class="header-item">数据类型</span>
                    <span class="header-item">参数描述</span>
                    <span class="header-item">是否必填</span>
                    <span class="header-item">操作</span>
                  </div>
                  
                  <div class="param-list">
                  <div 
                    v-for="(param, index) in outputParams" 
                    :key="index" 
                      class="param-item">
                      <div class="param-field">
                    <el-input 
                      v-model="param.name" 
                          placeholder="如：检测结果、置信度" 
                      size="small">
                    </el-input>
                      </div>
                      <div class="param-field">
                    <el-select 
                      v-model="param.type" 
                          placeholder="选择类型" 
                      size="small">
                          <el-option label="字符串 (string)" value="string">
                            <span style="float: left">string</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">文本内容</span>
                          </el-option>
                          <el-option label="整数 (int)" value="int">
                            <span style="float: left">int</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">整数值</span>
                          </el-option>
                          <el-option label="浮点数 (float)" value="float">
                            <span style="float: left">float</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">小数值</span>
                          </el-option>
                          <el-option label="布尔值 (boolean)" value="boolean">
                            <span style="float: left">boolean</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">true/false</span>
                          </el-option>
                    </el-select>
                      </div>
                      <div class="param-field">
                    <el-input 
                      v-model="param.description" 
                          placeholder="描述参数的用途和含义" 
                      size="small">
                    </el-input>
                      </div>
                      <div class="param-field checkbox-field">
                        <el-checkbox v-model="param.required" size="small">必填</el-checkbox>
                      </div>
                      <div class="param-field action-field">
                    <el-button 
                      type="danger" 
                      icon="el-icon-delete" 
                      size="mini" 
                          circle
                          @click="removeParam(index)"
                          :disabled="outputParams.length <= 1">
                    </el-button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="add-param-container">
                  <el-button 
                      type="primary" 
                      plain
                    icon="el-icon-plus" 
                    @click="addParam" 
                    class="add-param-btn">
                      添加输出参数
                  </el-button>
                  </div>
                </div>
              </div>
  
              <!-- 预警条件 -->
              <div class="config-group">
                <h4 class="group-title">预警条件</h4>
                <div class="warning-conditions-new">
                  <div class="condition-description">
                    <span>如果多模态大模型的输出参数满足下列条件，且条件组关系为</span>
                    <el-select 
                      v-model="globalRelation" 
                      size="small" 
                      class="relation-select">
                      <el-option label="且（全部满足）" value="and"></el-option>
                      <el-option label="或（任意满足）" value="or"></el-option>
                      <el-option label="非（全不满足）" value="not"></el-option>
                    </el-select>
                    <span>，则条件成立并产生预警</span>
                  </div>
                  
                  <div class="condition-groups">
                    <div 
                      v-for="(group, groupIndex) in conditionGroups" 
                      :key="groupIndex"
                      class="condition-group">
                      <div class="group-header">
                        <span class="group-label">满足</span>
                                                 <el-select 
                           v-model="group.relation" 
                           size="small" 
                           class="group-relation-select">
                           <el-option label="且（全部满足）" value="all"></el-option>
                           <el-option label="或（任意满足）" value="any"></el-option>
                           <el-option label="非（全不满足）" value="not"></el-option>
                         </el-select>
                        <span>条件时，条件组成立</span>
                        <el-button 
                          v-if="conditionGroups.length > 1"
                          type="danger" 
                          icon="el-icon-delete" 
                          size="mini" 
                          circle
                          @click="removeConditionGroup(groupIndex)"
                          class="delete-group-btn">
                        </el-button>
                      </div>
                      
                      <div class="conditions-list">
                        <div class="condition-row-header">
                          <span class="header-item">引用参数</span>
                          <span class="header-item">选择条件</span>
                          <span class="header-item">条件值</span>
                          <span class="header-item">操作</span>
                        </div>
                        
                        <div 
                          v-for="(condition, conditionIndex) in group.conditions" 
                          :key="conditionIndex"
                          class="condition-row">
                          <div class="condition-field">
                            <el-select 
                              v-model="condition.field" 
                              placeholder="请选择参数" 
                              size="small">
                              <el-option 
                                v-for="param in outputParams.filter(p => p.name.trim())" 
                                :key="param.name" 
                                :label="param.name" 
                                :value="param.name">
                              </el-option>
                            </el-select>
                          </div>
                          <div class="condition-field">
                            <el-select 
                              v-model="condition.operator" 
                              placeholder="请选择" 
                              size="small">
                              <el-option label="等于" value="eq"></el-option>
                              <el-option label="不等于" value="ne"></el-option>
                              <el-option label="大于" value="gt"></el-option>
                              <el-option label="小于" value="lt"></el-option>
                              <el-option label="大于等于" value="gte"></el-option>
                              <el-option label="小于等于" value="lte"></el-option>
                              <el-option label="包含" value="contains"></el-option>
                              <el-option label="不包含" value="not_contains"></el-option>
                              <el-option label="为空" value="is_empty"></el-option>
                              <el-option label="不为空" value="is_not_empty"></el-option>
                            </el-select>
                          </div>
                          <div class="condition-field">
                            <el-input 
                              v-model="condition.value" 
                              :placeholder="getValuePlaceholder(condition.operator)" 
                              size="small"
                              :disabled="condition.operator === 'is_empty' || condition.operator === 'is_not_empty'">
                            </el-input>
                          </div>
                          <div class="condition-field">
                            <el-button 
                              type="danger" 
                              icon="el-icon-delete" 
                              size="mini" 
                              circle
                              @click="removeCondition(groupIndex, conditionIndex)"
                              :disabled="group.conditions.length <= 1">
                            </el-button>
                          </div>
                        </div>
                        
                        <div class="add-condition-container">
                          <el-button 
                            type="text" 
                            icon="el-icon-plus" 
                            @click="addCondition(groupIndex)" 
                            class="add-condition-btn">
                            添加条件
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="add-group-container">
                    <el-button 
                      type="primary" 
                      plain
                      icon="el-icon-plus" 
                      @click="addConditionGroup" 
                      class="add-group-btn">
                      添加条件组
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LlmSkillCreateDialogDetail',
    data() {
      return {
        saving: false,
        validating: false,
        skillInfo: {},
        uploadedImage: '',
        validationResult: '',
        
        // 输出参数
        outputParams: [
          { name: '', type: 'boolean', description: '', required: true }
        ],
        
        // 预警条件
        globalRelation: 'and', // 条件组之间的关系
        conditionGroups: [
          {
            relation: 'all', // 组内条件关系：all(所有) 或 any(任一)
            conditions: [
              {
                field: '',
                operator: 'eq',
                value: ''
              }
            ]
          }
        ],
        
        // 提示词模板
        promptTemplate: '',
        
        // 解析后的提示词段落
        parsedPrompt: [],
        
        // 避免循环更新的标志
        isUpdatingPrompt: false,
        
        // 输入防抖定时器
        inputTimer: null,
        
        // 默认模板
        defaultTemplate: `// 描述技能时，先对技能的实现条件进行拆解，定义可通过视觉判断出的独立子任务，最终借助逻辑运算判断综合判断。
  请分析图片，并分别回答以下几个问题：
  1. {#InputSlot placeholder="为了实现技能，需要判断的第一个子任务"#}{#/InputSlot#}
  // 详细对任务进行描述，对任务中涉及的目标进行外观描述，并可通过举反例排除异常情况。例如：识别画面中的包装袋上是否有粉色标签，标签是印有二维码的粉色贴纸。
  2. {#InputSlot placeholder="为了实现技能，需要判断的第二个子任务"#}{#/InputSlot#}
  3. {#InputSlot placeholder="为了实现技能，需要判断的第三个子任务"#}{#/InputSlot#}`
      }
    },
    
    created() {
      // 从路由参数或本地存储获取技能信息
      this.skillInfo = this.$route.params.skillInfo || JSON.parse(localStorage.getItem('tempSkillInfo') || '{}')
      
      if (!this.skillInfo.name) {
        this.$message.warning('未找到技能信息，请重新创建')
        this.goBack()
      }
      
      // 监听提示词模板变化
      this.$watch('promptTemplate', (newVal) => {
        if (!this.isUpdatingPrompt) {
          this.parsePromptTemplate(newVal)
        }
      }, { immediate: true })
    },
    
    beforeDestroy() {
      // 清理定时器
      if (this.inputTimer) {
        clearTimeout(this.inputTimer)
      }
    },
    
    methods: {
      // 返回上一页
      goBack() {
        this.$router.go(-1)
      },
      
      // 添加输出参数
      addParam() {
        this.outputParams.push({
          name: '',
          type: 'boolean',
          description: '',
          required: false
        })
      },
      
      // 删除输出参数
      removeParam(index) {
        if (this.outputParams.length > 1) {
          this.outputParams.splice(index, 1)
        }
      },
      
      // 添加预警条件
      addCondition(groupIndex) {
        this.conditionGroups[groupIndex].conditions.push({
          field: '',
          operator: 'eq',
          value: ''
        })
      },
      
      // 删除预警条件
      removeCondition(groupIndex, conditionIndex) {
        if (this.conditionGroups[groupIndex].conditions.length > 1) {
          this.conditionGroups[groupIndex].conditions.splice(conditionIndex, 1)
        }
      },
      
      // 添加条件组
      addConditionGroup() {
        this.conditionGroups.push({
          relation: 'all',
          conditions: [
            {
              field: '',
              operator: 'eq',
              value: ''
            }
          ]
        })
      },
      
      // 删除条件组
      removeConditionGroup(groupIndex) {
        if (this.conditionGroups.length > 1) {
          this.conditionGroups.splice(groupIndex, 1)
        }
      },
      
      // 使用模板
      useTemplate() {
        // 停止更新标志，避免循环更新
        this.isUpdatingPrompt = true
        
        // 清空现有内容
        this.promptTemplate = ''
        this.parsedPrompt = []
        
        // 清理定时器
        if (this.inputTimer) {
          clearTimeout(this.inputTimer)
          this.inputTimer = null
        }
        
        // 等待DOM更新完成后设置模板
        this.$nextTick(() => {
          // 设置新模板
          this.promptTemplate = this.defaultTemplate
          
          // 重置更新标志
          this.isUpdatingPrompt = false
          
          // 解析新模板
          this.parsePromptTemplate(this.defaultTemplate)
          
          // 延迟初始化输入框
          setTimeout(() => {
            this.initInputWidths()
          }, 200)
        })
        
        this.$message.success('已应用默认模板')
      },
      

      
      // 隐藏所有输入框
      hideAllInputs() {
        const inputs = document.querySelectorAll('.inline-input')
        inputs.forEach(input => {
          input.classList.remove('initialized')
        })
      },
      
      // 解析提示词模板
      parsePromptTemplate(template) {
        if (!template || template.trim() === '') {
          this.parsedPrompt = []
          return
        }
        
        const segments = []
        const regex = /\{#InputSlot placeholder="([^"]*)"#\}(.*?)\{#\/InputSlot#\}/g
        let lastIndex = 0
        let match
        
        while ((match = regex.exec(template)) !== null) {
          // 添加前面的文本段落
          if (match.index > lastIndex) {
            const textContent = template.substring(lastIndex, match.index)
            if (textContent.trim() || textContent.includes('\n')) {
              segments.push({
                type: 'text',
                content: textContent
              })
            }
          }
          
          // 添加输入段落
          segments.push({
            type: 'input',
            placeholder: match[1],
            value: match[2] || '',
            originalMatch: match[0]
          })
          
          lastIndex = regex.lastIndex
        }
        
        // 添加最后的文本段落
        if (lastIndex < template.length) {
          const textContent = template.substring(lastIndex)
          if (textContent.trim() || textContent.includes('\n')) {
            segments.push({
              type: 'text',
              content: textContent
            })
          }
        }
        
        this.parsedPrompt = segments
      },
      
      // 获取段落样式类
      getSegmentClass(segment) {
        return {
          'editor-segment': true,
          'text-segment': segment.type === 'text',
          'input-segment': segment.type === 'input'
        }
      },
      
      // 格式化文本内容
      formatText(content) {
        return content.split('\n').map(line => {
          if (line.trim().startsWith('//')) {
            return `<span class="comment-line" contenteditable="false">${line}</span>`
          }
          return line
        }).join('<br/>')
      },
      
      // 处理编辑器点击
      handleEditorClick(event) {
        // 如果点击的是空白区域，可以添加新的输入框或处理其他逻辑
      },
      
      // 处理编辑器输入事件
      handleEditorInput(event) {
        // 延迟更新模板，避免频繁更新
        clearTimeout(this.inputTimer)
        this.inputTimer = setTimeout(() => {
          this.updatePromptFromEditor()
        }, 200)
      },
      
      // 处理粘贴事件
      handleEditorPaste(event) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          
          // 检查粘贴位置是否在注释行内
          if (this.isCursorInCommentLine(range)) {
            event.preventDefault()
            this.$message.warning('注释行不能编辑')
            return false
          }
        }
      },
      
      // 处理beforeinput事件（更早期的输入拦截）
      handleBeforeInput(event) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          
          // 检查输入位置是否在注释行内
          if (this.isCursorInCommentLine(range)) {
            // 如果不是删除整个注释行的操作，就阻止输入
            if (!(event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') || 
                selection.toString() === '') {
              event.preventDefault()
              return false
            }
          }
        }
      },
      
      // 处理拖拽开始事件
      handleDragStart(event) {
        const target = event.target
        if (this.isNodeInCommentLine(target)) {
          event.preventDefault()
          return false
        }
      },
      
      // 处理拖拽放置事件
      handleDrop(event) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          
          // 检查放置位置是否在注释行内
          if (this.isCursorInCommentLine(range)) {
            event.preventDefault()
            this.$message.warning('不能在注释行内放置内容')
            return false
          }
        }
      },
      
      // 处理段落点击
      handleSegmentClick(segment, index) {
        if (segment.type === 'input') {
          this.$nextTick(() => {
            const inputRef = this.$refs[`input-${index}`]
            if (inputRef && inputRef.length) {
              inputRef[0].focus()
            }
          })
        }
      },
      
      // 处理输入框获得焦点
      handleInputFocus(event) {
        event.target.style.backgroundColor = '#e8f3ff'
        event.target.style.borderColor = '#409eff'
        // 确保焦点时宽度正确
        this.adjustInputWidth(event.target)
        // 确保显示状态
        event.target.classList.add('initialized')
      },
      
      // 处理输入框失去焦点
      handleInputBlur(event) {
        event.target.style.backgroundColor = '#f0f8ff'
        event.target.style.borderColor = '#d0e7ff'
      },
      
      // 更新提示词模板
      updatePromptTemplate() {
        let newTemplate = ''
        
        this.parsedPrompt.forEach(segment => {
          if (segment.type === 'text') {
            newTemplate += segment.content
          } else if (segment.type === 'input') {
            newTemplate += `{#InputSlot placeholder="${segment.placeholder}"#}${segment.value}{#/InputSlot#}`
          }
        })
        
        // 避免无限循环，只在内容真正改变时更新
        if (newTemplate !== this.promptTemplate) {
          this.isUpdatingPrompt = true
          this.promptTemplate = newTemplate
          this.$nextTick(() => {
            this.isUpdatingPrompt = false
          })
        }
      },
      
      // 处理图片上传
      handleImageUpload(file) {
        if (file.raw) {
          const isValidImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.raw.type)
          const isValidSize = file.raw.size / 1024 / 1024 < 5
          
          if (!isValidImage) {
            this.$message.error('上传图片只能是 JPG/PNG 格式!')
            return
          }
          if (!isValidSize) {
            this.$message.error('上传图片大小不能超过 5MB!')
            return
          }
          
          this.uploadedImage = URL.createObjectURL(file.raw)
        }
      },
      
      // 运行验证
      runValidation() {
        if (!this.uploadedImage) {
          this.$message.warning('请先上传图片')
          return
        }
        
        if (!this.promptTemplate.trim()) {
          this.$message.warning('请先配置提示词模板')
          return
        }
        
        this.validating = true
        
        // 模拟AI分析
        setTimeout(() => {
          this.validationResult = `基于提供的图片和配置的提示词，AI分析结果如下：
  
  1. 第一个子任务判断结果：检测到目标物体，符合预设条件
  2. 第二个子任务判断结果：未检测到异常情况，状态正常  
  3. 第三个子任务判断结果：环境参数在正常范围内
  
  综合判断：当前场景满足技能要求，无需预警。
  
  输出参数：
  - 检测结果: true
  - 置信度: 0.95
  - 异常类型: null`
          
          this.validating = false
        }, 3000)
      },
      
      // 复制结果
      copyResult() {
        if (this.validationResult) {
          navigator.clipboard.writeText(this.validationResult).then(() => {
            this.$message.success('结果已复制到剪贴板')
          }).catch(() => {
            this.$message.error('复制失败，请手动复制')
          })
        }
      },
      
      // 保存技能
      saveSkill() {
        // 验证必填项
        if (!this.promptTemplate.trim()) {
          this.$message.warning('请配置提示词模板')
          return
        }
        
        const validParams = this.outputParams.filter(param => param.name.trim())
        if (validParams.length === 0) {
          this.$message.warning('请至少配置一个输出参数')
          return
        }
        
        this.saving = true
        
        // 模拟保存
        setTimeout(() => {
          this.$message.success('技能创建成功！')
          this.saving = false
          
          // 清除临时数据
          localStorage.removeItem('tempSkillInfo')
          
          // 返回技能列表
          this.$router.push('/skillManage/multimodalLlmSkills')
        }, 2000)
      },
      
      // 处理编辑器键盘事件
      handleEditorKeydown(event) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const selectedText = selection.toString()
          
          // 检查是否只选中了注释行（注释行只能删除替换，不能直接编辑）
          const isOnlyCommentSelected = this.isOnlyCommentInSelection(range, selectedText)
          
          // 检查光标是否在注释行内部（阻止在注释行内部插入字符）
          const isCursorInComment = this.isCursorInCommentLine(range)
          
          // 处理字符输入
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            // 如果光标在注释行内部且没有选中内容，阻止输入
            if (isCursorInComment && selectedText === '') {
              event.preventDefault()
              return
            }
            
            // 如果有选中内容（包括注释行或其他内容），允许替换
            if (selectedText !== '') {
              event.preventDefault()
              
              // 删除选中内容
              range.deleteContents()
              
              // 创建新的文本节点替换选中内容
              const textNode = document.createTextNode(event.key)
              range.insertNode(textNode)
              
              // 将光标移到新插入文本的末尾
              range.setStartAfter(textNode)
              range.setEndAfter(textNode)
              selection.removeAllRanges()
              selection.addRange(range)
              
              // 更新模板内容
              this.updatePromptFromEditor()
            }
            // 如果没有选中内容且不在注释行内，允许正常输入
          }
          // 处理删除键
          else if (event.key === 'Delete' || event.key === 'Backspace') {
            // 如果有选中内容，处理删除
            if (selectedText !== '') {
              event.preventDefault()
              this.handleSelectedContentDeletion(range)
              this.updatePromptFromEditor()
            }
            // 如果光标在注释行内部，阻止删除
            else if (isCursorInComment) {
              event.preventDefault()
              return
            }
            // 其他情况允许正常删除
          }
          // 处理回车键
          else if (event.key === 'Enter') {
            // 如果光标在注释行内部，阻止换行
            if (isCursorInComment && selectedText === '') {
              event.preventDefault()
              return
            }
            // 其他情况允许正常换行
          }
          // 处理其他特殊键（方向键、Home、End等）
          else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
            // 允许在编辑器内自由移动光标
          }
        }
      },
      
      // 检查是否只选中了注释行内容
      isOnlyCommentInSelection(range, selectedText) {
        // 如果选中的文本以//开头，很可能是注释行
        if (selectedText.trim().startsWith('//')) {
          return true
        }
        
        // 检查选区的起始和结束是否都在注释行内
        const startInComment = this.isNodeInCommentLine(range.startContainer)
        const endInComment = this.isNodeInCommentLine(range.endContainer)
        
        return startInComment && endInComment
      },
      
      // 检查光标是否在注释行内部
      isCursorInCommentLine(range) {
        // 如果是选中状态，不算作光标在注释行内
        if (!range.collapsed) {
          return false
        }
        
        return this.isNodeInCommentLine(range.startContainer)
      },
      
      // 检查节点是否在注释行内
      isNodeInCommentLine(node) {
        let currentNode = node
        while (currentNode && currentNode !== this.$refs.promptEditor) {
          // 检查节点本身是否是注释行
          if (currentNode.classList && currentNode.classList.contains('comment-line')) {
            return true
          }
          // 检查节点是否有contenteditable="false"属性
          if (currentNode.getAttribute && currentNode.getAttribute('contenteditable') === 'false') {
            return true
          }
          // 检查父节点
          if (currentNode.parentNode && currentNode.parentNode.classList && 
              currentNode.parentNode.classList.contains('comment-line')) {
            return true
          }
          currentNode = currentNode.parentNode
        }
        return false
      },
      
      // 处理选中内容的删除
      handleSelectedContentDeletion(range) {
        // 获取选中范围内的所有节点
        const contents = range.cloneContents()
        
        // 扩展选择范围以包含完整的段落和相邻的换行符
        this.expandSelectionRange(range)
        
        // 删除选中的内容
        range.deleteContents()
        
        // 创建一个空的文本节点保持光标位置
        const textNode = document.createTextNode('')
        range.insertNode(textNode)
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      },
      
      // 扩展选择范围以包含完整的元素和换行符
      expandSelectionRange(range) {
        const startContainer = range.startContainer
        const endContainer = range.endContainer
        
        // 处理开始位置
        if (startContainer.nodeType === Node.TEXT_NODE && startContainer.parentNode) {
          const parentNode = startContainer.parentNode
          if (parentNode.classList && (parentNode.classList.contains('comment-line') || parentNode.classList.contains('input-segment'))) {
            // 如果选中了元素的一部分，则选中整个元素
            if (range.startOffset === 0 || range.toString().includes(startContainer.textContent)) {
              range.setStartBefore(parentNode)
            }
          }
        }
        
        // 处理结束位置
        if (endContainer.nodeType === Node.TEXT_NODE && endContainer.parentNode) {
          const parentNode = endContainer.parentNode
          if (parentNode.classList && (parentNode.classList.contains('comment-line') || parentNode.classList.contains('input-segment'))) {
            // 如果选中了元素的一部分，则选中整个元素
            if (range.endOffset === endContainer.textContent.length || range.toString().includes(endContainer.textContent)) {
              range.setEndAfter(parentNode)
              
              // 检查是否有相邻的br标签需要一起删除
              let nextNode = parentNode.nextSibling
              if (nextNode && nextNode.nodeName === 'BR') {
                range.setEndAfter(nextNode)
              }
            }
          }
        }
        
        // 处理直接选中input-segment的情况
        if (startContainer.classList && startContainer.classList.contains('input-segment')) {
          range.setStartBefore(startContainer)
        }
        if (endContainer.classList && endContainer.classList.contains('input-segment')) {
          range.setEndAfter(endContainer)
          
          // 检查是否有相邻的br标签需要一起删除
          let nextNode = endContainer.nextSibling
          if (nextNode && nextNode.nodeName === 'BR') {
            range.setEndAfter(nextNode)
          }
        }
      },
      
      // 从编辑器DOM更新模板内容
      updatePromptFromEditor() {
        const editorContent = this.$refs.promptEditor.querySelector('.editor-content')
        if (editorContent) {
          let newTemplate = ''
          
          // 递归处理所有节点
          const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              return node.textContent
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.nodeName === 'BR') {
                return '\n'
              } else if (node.classList && node.classList.contains('text-segment')) {
                let textContent = ''
                for (let child of node.childNodes) {
                  textContent += processNode(child)
                }
                return textContent
              } else if (node.classList && node.classList.contains('input-segment')) {
                const textarea = node.querySelector('textarea')
                if (textarea) {
                  const placeholder = textarea.getAttribute('placeholder')
                  const value = textarea.value || ''
                  return `{#InputSlot placeholder="${placeholder}"#}${value}{#/InputSlot#}`
                }
                return ''
              } else if (node.classList && node.classList.contains('comment-line')) {
                return node.textContent
              } else {
                // 处理其他元素的子节点
                let textContent = ''
                for (let child of node.childNodes) {
                  textContent += processNode(child)
                }
                return textContent
              }
            }
            return ''
          }
          
          // 如果编辑器被直接编辑，获取整个编辑器的内容
          if (!editorContent.children.length) {
            newTemplate = this.$refs.promptEditor.textContent || this.$refs.promptEditor.innerText || ''
          } else {
            // 处理所有子节点
            for (let child of editorContent.childNodes) {
              newTemplate += processNode(child)
            }
          }
          
          // 清理多余的换行符
          newTemplate = newTemplate.replace(/\n\s*\n/g, '\n').trim()
          
          // 避免无限循环更新
          if (newTemplate !== this.promptTemplate) {
            this.isUpdatingPrompt = true
            this.promptTemplate = newTemplate
            this.$nextTick(() => {
              this.isUpdatingPrompt = false
            })
          }
        }
      },
      
      // 处理编辑器双击事件
      handleEditorDblclick(event) {
        const target = event.target
        
        // 检查是否双击了注释行或输入框区域
        if (target.classList.contains('comment-line') || target.classList.contains('inline-input') || target.closest('.input-segment')) {
          event.preventDefault()
          
          // 选中整个元素及其相邻的换行符
          const selection = window.getSelection()
          const range = document.createRange()
          
          try {
            let elementToSelect = target
            
            // 如果双击的是输入框，选中整个input-segment
            if (target.classList.contains('inline-input') || target.closest('.input-segment')) {
              elementToSelect = target.closest('.input-segment') || target
            }
            
            // 扩展选择范围以包含可能的换行符
            range.setStartBefore(elementToSelect)
            
            // 查找下一个相邻的br标签或文本节点
            let nextNode = elementToSelect.nextSibling
            if (nextNode && nextNode.nodeName === 'BR') {
              range.setEndAfter(nextNode)
            } else {
              range.setEndAfter(elementToSelect)
            }
            
            selection.removeAllRanges()
            selection.addRange(range)
            
            // 给编辑器设置焦点，准备接收键盘输入
            this.$refs.promptEditor.focus()
          } catch (error) {
            console.warn('无法选中元素:', error)
          }
        }
      },
      
      // 处理输入框输入变化
      handleInputChange(event) {
        const input = event.target
        this.adjustInputWidth(input)
        this.updatePromptTemplate()
      },
      
      // 自动调整输入框宽度和高度
      adjustInputWidth(input) {
        if (!input) return
        
        // 先调整高度（对于textarea）
        this.adjustTextareaHeight(input)
        
        // 创建一个临时元素来测量文本宽度
        const tempSpan = document.createElement('span')
        tempSpan.style.visibility = 'hidden'
        tempSpan.style.position = 'absolute'
        tempSpan.style.top = '-9999px'
        tempSpan.style.left = '-9999px'
        tempSpan.style.fontFamily = window.getComputedStyle(input).fontFamily
        tempSpan.style.fontSize = window.getComputedStyle(input).fontSize
        tempSpan.style.fontWeight = window.getComputedStyle(input).fontWeight
        tempSpan.style.letterSpacing = window.getComputedStyle(input).letterSpacing
        tempSpan.style.whiteSpace = 'pre'
        tempSpan.style.lineHeight = window.getComputedStyle(input).lineHeight
        
        // 设置测量文本（输入值或占位符）
        const textToMeasure = input.value || input.placeholder || ''
        
        // 计算最长行的宽度
        const lines = textToMeasure.split('\n')
        let maxLineWidth = 0
        
        lines.forEach(line => {
          tempSpan.textContent = line || ' ' // 空行用空格代替
          document.body.appendChild(tempSpan)
          const lineWidth = tempSpan.offsetWidth
          maxLineWidth = Math.max(maxLineWidth, lineWidth)
          document.body.removeChild(tempSpan)
        })
        
        // 获取文本宽度，加上一些padding
        const padding = 20 // 左右padding总和
        const minWidth = 120 // 最小宽度
        const maxWidth = 500 // 最大宽度
        
        // 计算新宽度
        let newWidth = Math.max(maxLineWidth + padding, minWidth)
        newWidth = Math.min(newWidth, maxWidth)
        
        // 设置输入框宽度
        input.style.width = newWidth + 'px'
        
        // 确保输入框可见
        if (!input.classList.contains('initialized')) {
          input.classList.add('initialized')
        }
      },
      
      // 自动调整textarea高度
      adjustTextareaHeight(textarea) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') return
        
        // 如果没有内容或只有占位符，保持单行
        if (!textarea.value || textarea.value.trim() === '') {
          textarea.style.height = '24px'
          textarea.style.overflowY = 'hidden'
          return
        }
        
        // 重置高度以获取正确的scrollHeight
        textarea.style.height = 'auto'
        
        // 计算内容高度
        const minHeight = 24 // 最小高度
        const maxHeight = 200 // 最大高度
        const contentHeight = textarea.scrollHeight
        
        // 设置新高度
        const newHeight = Math.max(Math.min(contentHeight, maxHeight), minHeight)
        textarea.style.height = newHeight + 'px'
        
        // 如果内容超过最大高度，显示滚动条
        if (contentHeight > maxHeight) {
          textarea.style.overflowY = 'auto'
        } else {
          textarea.style.overflowY = 'hidden'
        }
      },
      
      // 初始化所有输入框宽度
      initInputWidths() {
        this.$nextTick(() => {
          // 再次确保DOM已完全渲染
          setTimeout(() => {
            if (this.parsedPrompt && this.parsedPrompt.length > 0) {
              this.parsedPrompt.forEach((segment, index) => {
                if (segment.type === 'input') {
                  const inputRef = this.$refs[`input-${index}`]
                  if (inputRef && inputRef.length && inputRef[0]) {
                    const textarea = inputRef[0]
                    try {
                      // 先重置textarea状态
                      textarea.style.height = 'auto'
                      textarea.rows = 1
                      // 然后调整尺寸
                      this.adjustInputWidth(textarea)
                      // 调整完成后显示输入框
                      textarea.classList.add('initialized')
                    } catch (error) {
                      console.warn('初始化输入框失败:', error)
                    }
                  }
                }
              })
            }
          }, 50)
        })
      },
      
      // 处理textarea键盘事件
      handleTextareaKeydown(event) {
        // 允许正常的换行操作
        if (event.key === 'Enter') {
          // 不阻止默认行为，允许换行
          setTimeout(() => {
            // 延迟调整高度，确保内容已更新
            this.adjustInputWidth(event.target)
            this.updatePromptTemplate()
          }, 0)
        }
      },
      
      // 处理textarea粘贴事件
      handleTextareaPaste(event) {
        // 延迟调整，确保粘贴内容已经被处理
        setTimeout(() => {
          this.adjustInputWidth(event.target)
          this.updatePromptTemplate()
        }, 10)
      },
      
      // 获取条件值输入框的提示文本
      getValuePlaceholder(operator) {
        switch(operator) {
          case 'is_empty':
            return '无需输入值'
          case 'is_not_empty':
            return '无需输入值'
          case 'eq':
          case 'ne':
            return '请输入比较值'
          case 'gt':
          case 'gte':
            return '请输入数值'
          case 'lt':
          case 'lte':
            return '请输入数值'
          case 'contains':
          case 'not_contains':
            return '请输入包含的内容'
          default:
            return '请输入'
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .create-detail-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%);
    padding: 20px;
  }
  
  .create-detail-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* 进度导航 */
  .progress-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    padding: 25px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .progress-step {
    display: flex;
    align-items: center;
    position: relative;
  }

  .progress-step.completed .step-circle {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  }

  .progress-step.active .step-circle {
    background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  .step-circle {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    margin-right: 12px;
  }

  .step-info {
    display: flex;
    flex-direction: column;
  }

  .step-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 2px;
  }

  .step-desc {
    font-size: 12px;
    color: #6b7280;
  }

  .progress-step.completed .step-title,
  .progress-step.active .step-title {
    color: #1f2937;
  }

  .progress-step.completed .step-desc {
    color: #67c23a;
  }

  .progress-step.active .step-desc {
    color: #409eff;
  }

  .progress-line {
    width: 80px;
    height: 3px;
    background: #e5e7eb;
    margin: 0 20px;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .progress-line.active {
    background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
  }
  
  /* 头部信息 */
  .header-info {
    position: relative;
    background: white;
    border-radius: 16px;
    margin-bottom: 25px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .skill-basic-info {
    display: flex;
    gap: 20px;
    padding: 25px 25px 20px 25px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e5e7eb;
  }
  
  .skill-icon {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 3px solid white;
  }
  
  .skill-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .skill-details {
    flex: 1;
    min-width: 0;
  }
  
  .skill-name {
    margin: 0 0 12px 0;
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.2;
    letter-spacing: -0.8px;
  }
  
  .skill-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  
  .skill-id-badge {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 8px 14px;
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .skill-id-badge:hover {
    border-color: #9ca3af;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }

  .id-label {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    color: white;
    padding: 4px 10px;
    border-radius: 8px;
    font-weight: 600;
    margin-right: 12px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .id-value {
    color: #374151;
    font-weight: 600;
    letter-spacing: 0.5px;
    font-size: 13px;
  }
  
  .skill-description {
    margin: 0;
    padding: 20px 25px 25px 25px;
    background: white;
    color: #4b5563;
    font-size: 15px;
    line-height: 1.7;
    position: relative;
  }

  .skill-description::before {
    content: '';
    position: absolute;
    top: 0;
    left: 25px;
    right: 25px;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
    border-radius: 0 0 3px 3px;
  }
  
  .header-actions {
    position: absolute;
    top: 25px;
    right: 25px;
    display: flex;
    gap: 12px;
  }

  .header-actions .el-button {
    padding: 10px 20px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .header-actions .el-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  /* 内容布局 */
  .content-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .top-content {
    display: flex;
    gap: 20px;
  }
  
  .left-content,
  .right-content {
    flex: 1;
    width: 50%;
  }
  
  .bottom-content {
    width: 100%;
  }
  
  /* 配置区域 */
  .config-section,
  .prompt-section,
  .validation-section {
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .prompt-section,
  .validation-section {
    height: 600px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 20px 0;
    padding: 20px 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    flex-shrink: 0;
  }
  
  .section-title i {
    color: #409eff;
  }
  
  .prompt-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 20px 20px;
  }

  .prompt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .prompt-textarea {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
  }

  .prompt-textarea >>> .el-textarea__inner {
    height: 100% !important;
    resize: none;
  }

  /* 智能编辑器样式 */
  .smart-prompt-editor {
    flex: 1;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: white;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    cursor: text;
    outline: none;
  }

  .smart-prompt-editor:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .editor-placeholder {
    padding: 15px;
    color: #c0c4cc;
    font-style: italic;
    text-align: left;
  }

  .editor-content {
    padding: 15px;
    min-height: 100%;
    text-align: left;
  }

  .editor-segment {
    display: inline;
  }

  .text-segment {
    color: #303133;
    white-space: pre-wrap;
  }

  /* 注释行样式 */
  .text-segment >>> .comment-line {
    background-color: #f5f5f5;
    color: #909399;
    padding: 2px 4px;
    border-radius: 3px;
    display: inline;
    line-height: 1.8;
    cursor: not-allowed;
    user-select: text;
    transition: all 0.3s ease;
    border: 1px solid #e4e7ed;
    position: relative;
    -webkit-user-modify: read-only;
  }

  .text-segment >>> .comment-line:hover {
    background-color: #e9e9e9;
    color: #7d7d7d;
    cursor: pointer;
    border-color: #c0c4cc;
  }

  .text-segment >>> .comment-line::selection {
    background-color: #409eff;
    color: white;
  }

  .text-segment >>> .comment-line::before {
    content: '🔒';
    font-size: 10px;
    position: absolute;
    top: -2px;
    right: -2px;
    background: #f56c6c;
    color: white;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: normal;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .text-segment >>> .comment-line:hover::before {
    opacity: 1;
  }

  .input-segment {
    display: inline-block;
    margin: 0 2px;
    position: relative;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .input-segment:hover {
    background-color: rgba(64, 158, 255, 0.1);
  }

  .input-segment::selection,
  .input-segment *::selection {
    background-color: #409eff;
    color: white;
  }

  /* 当input-segment被选中时的样式 */
  .input-segment.selected {
    background-color: rgba(64, 158, 255, 0.2);
    border: 1px dashed #409eff;
    padding: 2px;
    margin: -2px 0px;
  }

  .inline-input {
    display: inline-block;
    min-width: 120px;
    max-width: 100%;
    width: auto;
    height: 24px;
    min-height: 24px;
    padding: 4px 8px;
    border: 1px solid #d0e7ff;
    border-radius: 4px;
    background: #f0f8ff;
    color: #409eff;
    font-family: inherit;
    font-size: inherit;
    line-height: 1.4;
    outline: none;
    transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease;
    resize: none;
    overflow: hidden;
    box-sizing: border-box;
    vertical-align: top;
    word-wrap: break-word;
    opacity: 0;
    user-select: text;
    cursor: text;
  }

  .inline-input.initialized {
    opacity: 1;
  }

  .inline-input:focus {
    background: #e8f3ff !important;
    border-color: #409eff !important;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .inline-input::placeholder {
    color: #a3c7ff;
    font-style: italic;
  }

  .validation-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 20px 20px;
  }

  .validation-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .step-number {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 11px;
  }

  .step-text {
    white-space: nowrap;
  }
  
  .upload-area {
    margin-bottom: 16px;
    flex-shrink: 0;
  }
  
  .image-uploader >>> .el-upload-dragger {
    width: 100%;
    height: 160px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    background: #fafbfc;
    transition: all 0.3s ease;
  }

  .image-uploader >>> .el-upload-dragger:hover {
    border-color: #409eff;
    background: #f0f7ff;
  }
  
  .uploaded-image {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
  }
  
  .uploaded-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 13px;
    opacity: 0;
    transition: opacity 0.3s;
    gap: 6px;
  }
  
  .uploaded-image:hover .image-overlay {
    opacity: 1;
  }

  .image-overlay i {
    font-size: 20px;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: #8c939d;
  }
  
  .upload-placeholder i {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 12px;
  }
  
  .upload-text {
    font-size: 14px;
    margin-bottom: 4px;
    color: #6b7280;
  }
  
  .upload-link {
    color: #409eff;
    font-weight: 500;
  }
  
  .upload-tip {
    color: #9ca3af;
    font-size: 12px;
    margin-top: 8px;
  }

  .test-actions {
    text-align: center;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .test-actions .el-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .ai-result {
    background: linear-gradient(135deg, #f0fdf4 0%, #f7fef7 100%);
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 18px;
    background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
    border-bottom: 1px solid #bbf7d0;
    flex-shrink: 0;
  }

  .result-header h4 {
    margin: 0;
    font-size: 15px;
    color: #166534;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .result-header i {
    color: #22c55e;
  }

  .result-content {
    padding: 18px;
    flex: 1;
    overflow-y: auto;
  }

  .result-content pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #374151;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .result-actions {
    padding: 12px 18px;
    border-top: 1px solid #bbf7d0;
    background: #f0fdf4;
    text-align: center;
    flex-shrink: 0;
  }

  .validation-help {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .help-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 12px;
  }

  .help-title i {
    color: #94a3b8;
  }

  .help-list {
    margin: 0;
    padding-left: 20px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
  }

  .help-list li {
    margin-bottom: 6px;
  }

  .help-list li:last-child {
    margin-bottom: 0;
  }

  /* 配置区域样式 */
  .config-group {
    padding: 0 20px 20px;
    margin-bottom: 20px;
  }
  
  .group-title {
    margin: 0 0 15px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
  
  /* 参数配置样式 */
  .param-help {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
  }

  .output-params {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .param-header {
    display: grid;
    grid-template-columns: 1fr 120px 1.5fr 80px 60px;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 13px;
    color: #374151;
  }

  .header-item {
    display: flex;
    align-items: center;
  }

  .param-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .param-item {
    display: grid;
    grid-template-columns: 1fr 120px 1.5fr 80px 60px;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s ease;
  }

  .param-item:hover {
    background: #f9fafb;
  }

  .param-item:last-child {
    border-bottom: none;
  }

  .param-field {
    display: flex;
    align-items: center;
  }

  .checkbox-field {
    justify-content: center;
  }

  .action-field {
    justify-content: center;
  }

  .add-param-container {
    padding: 16px;
    text-align: center;
    border-top: 1px solid #f3f4f6;
    background: #fafbfc;
  }

  .add-param-btn {
    padding: 8px 20px;
    font-size: 13px;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  /* 参数帮助图标样式 */
  .param-help-icon {
    margin-left: 4px;
    color: #909399;
    font-size: 12px;
    cursor: help;
    transition: color 0.3s ease;
  }

  .param-help-icon:hover {
    color: #409eff;
  }
  
  /* 新预警条件样式 */
  .warning-conditions-new {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    overflow: hidden;
  }

  .condition-description {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    flex-wrap: wrap;
  }

  .relation-select {
    min-width: 140px;
  }

  .condition-groups {
    padding: 20px;
  }

  .condition-group {
    background: #fafbfc;
    border: 1px solid #f0f2f5;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .condition-group:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .condition-group:last-child {
    margin-bottom: 0;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e5e7eb;
    font-size: 13px;
    color: #4b5563;
    font-weight: 500;
  }

  .group-label {
    color: #6b7280;
  }

  .group-relation-select {
    min-width: 140px;
  }

  .delete-group-btn {
    margin-left: auto;
  }

  .conditions-list {
    background: white;
  }

  .condition-row-header {
    display: grid;
    grid-template-columns: 1fr 140px 1fr 60px;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 12px;
    color: #6b7280;
  }

  .condition-row {
    display: grid;
    grid-template-columns: 1fr 140px 1fr 60px;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s ease;
  }

  .condition-row:hover {
    background: #f9fafb;
  }

  .condition-row:last-child {
    border-bottom: none;
  }

  .condition-field {
    display: flex;
    align-items: center;
  }

  .condition-field:last-child {
    justify-content: center;
  }

  .add-condition-container {
    padding: 12px 16px;
    text-align: center;
    border-top: 1px solid #f3f4f6;
    background: #fafbfc;
  }

  .add-condition-btn {
    padding: 6px 16px;
    font-size: 13px;
    color: #409eff;
    border: none;
    background: transparent;
    transition: all 0.3s ease;
  }

  .add-condition-btn:hover {
    background: rgba(64, 158, 255, 0.1);
    color: #296ed8;
  }

  .add-group-container {
    padding: 16px 20px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .add-group-btn {
    padding: 8px 20px;
    font-size: 13px;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .add-group-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
  
  /* 响应式设计 */
  @media (max-width: 1200px) {
    .top-content {
      flex-direction: column;
    }
    
    .right-content {
      width: 100%;
    }

    .param-header,
    .param-item {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .param-field {
      margin-bottom: 8px;
    }

    .header-item {
      display: none;
    }

    .condition-row-header,
    .condition-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .condition-row-header {
      display: none;
    }

    .condition-field {
      margin-bottom: 8px;
    }

    .condition-description {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .relation-select {
      min-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .create-detail-wrapper {
      padding: 15px;
    }

    .progress-nav {
      padding: 20px 15px;
    }

    .progress-line {
      width: 50px;
      margin: 0 15px;
    }

    .step-title {
      font-size: 14px;
    }

    .step-desc {
      font-size: 11px;
    }

    .header-info {
      flex-direction: column;
      gap: 20px;
    }

    .skill-basic-info {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 15px;
    }

    .header-actions {
      width: 100%;
      justify-content: center;
      gap: 12px;
    }

    .content-layout {
      gap: 15px;
    }

    .config-section,
    .prompt-section,
    .validation-section {
      margin-bottom: 15px;
    }

    .section-title {
      font-size: 14px;
    }

    .group-title {
      font-size: 13px;
    }

    .validation-steps {
      flex-direction: column;
      gap: 12px;
    }

    .step-item {
      justify-content: center;
    }

    .upload-placeholder i {
      font-size: 36px;
    }

    .upload-text {
      font-size: 13px;
    }
  }
  </style> 
// 技能数据管理器 - 用于在组件间共享技能数据
class SkillDataManager {
  constructor() {
    this.skills = [
      {
        id: 'ab189acff35841d38b7f8575a4e5ab5a',
        name: '明火识别',
        description: '实时监测矿井下是否出现明火，及时发现火灾隐患，确保矿工安全',
        status: 'online',
        categories: ['事件检测', '安全']
      },
      {
        id: 'b56c5d016b2e44bf8d533d7d03043cd8',
        name: '烟雾检测',
        description: '智能识别矿井环境中的烟雾情况，提前预警火灾风险，保障矿山作业安全',
        status: 'online',
        categories: ['事件检测', '安全']
      },
      {
        id: '82a3fbaa379442f8baa236699b2684bb',
        name: '矿车识别',
        description: '自动识别矿井内运输车辆类型、车牌信息，实现智能化车辆管理',
        status: 'online',
        categories: ['事件检测']
      },
      {
        id: '26e15ed2d7be4800bb792d70106c730a',
        name: '支护结构检测',
        description: '检测矿井支护结构的完整性和稳定性，预防坍塌事故发生',
        status: 'online',
        categories: ['安全', '质量总站测试-功能']
      },
      {
        id: '48f64c95336642ea959120f42a996b',
        name: '安全帽佩戴检测',
        description: '智能识别矿工是否正确佩戴安全帽，确保作业人员安全防护到位',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '46abbb20f6304d1d8fa47c61405e133f',
        name: '瓦斯浓度监测',
        description: '实时监测矿井瓦斯浓度变化，及时预警瓦斯超标情况，防止瓦斯爆炸',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '3e7b2b7a98ff41e0bacecbe77debf99f',
        name: '通风系统检测',
        description: '监测矿井通风系统运行状态，确保井下空气流通正常',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: 'c7a1afe769224570bd594464ca1f5562',
        name: '人员定位追踪',
        description: '实时追踪矿工在井下的位置信息，确保人员安全管理',
        status: 'online',
        categories: ['安全']
      },
      {
        id: 'f5de83736b2445756316c27ce18a4138',
        name: '设备故障诊断',
        description: '智能诊断矿山设备运行状态，预测设备故障，提高设备可靠性',
        status: 'offline',
        categories: ['质量总站测试-功能']
      },
      {
        id: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
        name: '粉尘浓度监测',
        description: '监测矿井作业环境粉尘浓度，预防尘肺病发生，保护矿工健康',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '1f2e3d4c5b6a7b8c9d0e1f2a3b4c5d6e',
        name: '巷道变形监测',
        description: '实时监测矿井巷道变形情况，及时发现地质灾害隐患',
        status: 'online',
        categories: ['安全', '质量总站测试-功能']
      },
      {
        id: '7f8e9d0c1b2a3b4c5d6e7f8a9b0c1d2e',
        name: '违规行为识别',
        description: '智能识别矿工违规操作行为，及时纠正不安全作业方式',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v',
        name: '爆破安全检测',
        description: '监测爆破作业安全距离和防护措施，确保爆破作业安全',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '9w8x7y6z5a4b3c2d1e0f9g8h7i6j5k4l',
        name: '提升机安全监控',
        description: '实时监控矿井提升机运行状态，防止提升事故发生',
        status: 'online',
        categories: ['安全', '质量总站测试-功能']
      },
      {
        id: '5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b',
        name: '电气设备检测',
        description: '检测矿井电气设备绝缘状态和接地情况，防止触电事故',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: '1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r',
        name: '水害预警系统',
        description: '监测矿井涌水情况，预警水害风险，保障矿井安全',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h',
        name: '应急救援定位',
        description: '紧急情况下快速定位被困人员位置，提高救援效率',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x',
        name: '噪声监测',
        description: '监测矿井作业噪声水平，保护矿工听力健康',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: '9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n',
        name: '温度监测',
        description: '实时监测矿井温度变化，预防高温作业危害',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
        name: '有毒气体检测',
        description: '检测矿井有害气体浓度，及时预警气体中毒风险',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t',
        name: '机械设备监控',
        description: '监控矿山机械设备运行参数，预防设备事故',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: '7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j',
        name: '井口安全管控',
        description: '监控井口人员进出和车辆通行，确保井口安全秩序',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z',
        name: '照明系统检测',
        description: '检测矿井照明系统工作状态，确保作业环境光照充足',
        status: 'offline',
        categories: ['质量总站测试-功能']
      },
      {
        id: '9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p',
        name: '围岩稳定性分析',
        description: '分析矿井围岩稳定性，预测地质灾害风险',
        status: 'online',
        categories: ['安全', '质量总站测试-功能']
      },
      {
        id: '5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f',
        name: '排水系统监控',
        description: '监控矿井排水系统运行状态，防止积水事故',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: '1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v',
        name: '逃生路线规划',
        description: '智能规划最优逃生路线，提高紧急撤离效率',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l',
        name: '作业环境评估',
        description: '综合评估矿井作业环境安全性，制定安全作业方案',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b',
        name: '防护装备检查',
        description: '检查矿工个人防护装备佩戴情况，确保防护到位',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r',
        name: '危险区域标识',
        description: '自动识别和标记矿井危险区域，提醒作业人员注意安全',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h',
        name: '班组安全管理',
        description: '管理班组安全作业状态，确保团队协作安全',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x',
        name: '设备维护提醒',
        description: '智能提醒设备维护保养时间，确保设备安全运行',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: '7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n',
        name: '安全培训考核',
        description: '智能化安全培训考核系统，提高矿工安全意识',
        status: 'offline',
        categories: ['安全']
      },
      {
        id: '3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d',
        name: '事故预警分析',
        description: '基于历史数据分析预测事故风险，提前采取预防措施',
        status: 'online',
        categories: ['安全', '事件检测']
      },
      {
        id: '9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t',
        name: '智能调度系统',
        description: '智能调度矿井作业任务，优化作业流程，提高安全效率',
        status: 'online',
        categories: ['质量总站测试-功能']
      },
      {
        id: '5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j',
        name: '环境质量监测',
        description: '全面监测矿井环境质量指标，确保作业环境符合安全标准',
        status: 'offline',
        categories: ['安全', '质量总站测试-功能']
      },
      {
        id: '1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
        name: '应急物资管理',
        description: '智能管理应急救援物资配置和调度，提高应急响应能力',
        status: 'online',
        categories: ['安全']
      },
      {
        id: '7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p',
        name: '安全风险评估',
        description: '综合评估矿井各项安全风险，制定针对性安全措施',
        status: 'online',
        categories: ['安全', '事件检测']
      }
    ]
    
    this.listeners = []
  }

  // 获取所有技能
  getAllSkills() {
    return [...this.skills]
  }

  // 根据ID获取技能
  getSkillById(id) {
    return this.skills.find(skill => skill.id === id)
  }

  // 更新技能
  updateSkill(skillData) {
    const index = this.skills.findIndex(skill => skill.id === skillData.id)
    if (index !== -1) {
      this.skills[index] = { ...skillData }
      this.notifyListeners('update', skillData)
      return true
    }
    return false
  }

  // 添加新技能
  addSkill(skillData) {
    // 确保有ID
    if (!skillData.id) {
      skillData.id = this.generateSkillId()
    }
    
    this.skills.unshift(skillData)
    this.notifyListeners('add', skillData)
    return skillData
  }

  // 删除技能
  deleteSkill(skillId) {
    const index = this.skills.findIndex(skill => skill.id === skillId)
    if (index !== -1) {
      const skill = this.skills[index]
      // 检查技能状态，已上线的技能不可删除
      if (skill.status === 'online') {
        console.warn(`技能 "${skill.name}" 已上线，无法删除`)
        return false
      }
      
      const deletedSkill = this.skills.splice(index, 1)[0]
      this.notifyListeners('delete', deletedSkill)
      return true
    }
    return false
  }

  // 批量删除技能
  deleteSkills(skillIds) {
    const deletedSkills = []
    const onlineSkills = []
    
    skillIds.forEach(id => {
      const index = this.skills.findIndex(skill => skill.id === id)
      if (index !== -1) {
        const skill = this.skills[index]
        // 检查技能状态，已上线的技能不可删除
        if (skill.status === 'online') {
          onlineSkills.push(skill)
        } else {
          deletedSkills.push(this.skills.splice(index, 1)[0])
        }
      }
    })
    
    // 如果有已上线的技能，记录警告
    if (onlineSkills.length > 0) {
      const onlineSkillNames = onlineSkills.map(skill => skill.name).join('、')
      console.warn(`以下技能已上线无法删除：${onlineSkillNames}`)
    }
    
    if (deletedSkills.length > 0) {
      this.notifyListeners('batchDelete', deletedSkills)
    }
    
    return deletedSkills
  }

  // 生成技能ID
  generateSkillId() {
    return 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 注册监听器
  addListener(callback) {
    this.listeners.push(callback)
  }

  // 移除监听器
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 通知所有监听器
  notifyListeners(action, data) {
    this.listeners.forEach(callback => {
      callback(action, data)
    })
  }
}

// 创建单例实例
const skillDataManager = new SkillDataManager()

export default skillDataManager 
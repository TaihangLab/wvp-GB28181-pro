<template>
  <div class="park-management">
    <!-- 标题区域 -->
    <dv-border-box-12 class="header-box">
      <div class="header-wrapper">
        <!-- 左侧装饰 -->
        <div class="left-decoration">
          <dv-decoration-5 style="width:250px;height:60px;" />
          <div class="decoration-line-group">
            <div class="decoration-line line1"></div>
            <div class="decoration-line line2"></div>
            <div class="decoration-line line3"></div>
          </div>
        </div>

        <!-- 中间标题 -->
        <div class="title-container">
          <dv-decoration-8 style="width:300px;height:50px;" :reverse="true" />
          <div class="title-wrapper">
            <dv-decoration-6 style="width:200px;height:50px;" />
            <div class="title-text">施工养护综合数据</div>
            <dv-decoration-6 style="width:200px;height:50px;" :reverse="true" />
          </div>
          <dv-decoration-8 style="width:300px;height:50px;" />
        </div>

        <!-- 右侧装饰 -->
        <div class="right-decoration">
          <dv-decoration-5 style="width:250px;height:60px;" :reverse="true" />
          <div class="decoration-line-group">
            <div class="decoration-line line1"></div>
            <div class="decoration-line line2"></div>
            <div class="decoration-line line3"></div>
          </div>
          <!-- 全屏按钮 -->
          <div class="fullscreen-btn" @click="toggleFullScreen">
            <i :class="isFullScreen ? 'el-icon-close' : 'el-icon-full-screen'"></i>
          </div>
        </div>
      </div>
    </dv-border-box-12>

    <div class="content-wrapper">
      <div class="main-content">
        <!-- 左侧面板 -->
        <div class="left-panel">
          <!-- 设备树状图 -->
          <dv-border-box-12 class="panel device-panel">
            <div class="panel-header">
              <span>设备树状图</span>
              <div class="watermark">TSINGSEE</div>
            </div>
            <div class="device-tree">
              <el-tree
                :data="treeData"
                :props="defaultProps"
                node-key="id"
                :default-expanded-keys="['1']"
                class="custom-tree">
              </el-tree>
            </div>
          </dv-border-box-12>
          
          <!-- CPU使用率 -->
          <dv-border-box-12 class="panel cpu-panel">
            <div class="panel-header">
              <span>内存/CPU</span>
              <div class="watermark">TSINGSEE</div>
            </div>
            <dv-charts :option="cpuOption" />
          </dv-border-box-12>
          
          <!-- 存储使用 -->
          <dv-border-box-12 class="panel storage-panel">
            <div class="panel-header">
              <span>存储使用</span>
              <div class="watermark">TSINGSEE</div>
            </div>
            <dv-charts :option="storageOption" />
          </dv-border-box-12>
        </div>

        <!-- 中间视频区域 -->
        <div class="center-panel">
          <dv-border-box-12 class="video-container">
            <div class="panel-header">
              <span>实时画面</span>
              <div class="screen-controls">
                <span>分屏：</span>
                <i class="el-icon-menu active"></i>
                <i class="el-icon-s-grid"></i>
              </div>
              <div class="watermark">TSINGSEE</div>
            </div>
            <div class="video-grid">
              <div v-for="i in 4" :key="i" class="video-item">
                <dv-border-box-8>
                  <div class="video-content">
                    <img :src="getRandomImage(i)" alt="监控画面">
                  </div>
                </dv-border-box-8>
              </div>
            </div>
          </dv-border-box-12>
        </div>

        <!-- 右侧预警区域 -->
        <div class="right-panel">
          <dv-border-box-12 class="panel alert-panel">
            <div class="panel-header">
              <span>预警抓拍</span>
              <div class="watermark">TSINGSEE</div>
            </div>
            <div class="alert-list">
              <div class="alert-item">
                <div class="category-label">在岗检测</div>
                <div class="alert-image-container">
                  <img :src="getRandomImage(14)" alt="在岗检测">
                </div>
                <div class="alert-info single-line">
                  <div class="info-content">
                    <p>抓拍时间: 2023-04-14 17:23:12</p>
                    <p>布点名称: 115号探头</p>
                  </div>
                  <div class="view-btn">
                    <span class="view-large" @click="showLargeImage(14)">查看大图</span>
                  </div>
                </div>
              </div>

              <div class="alert-item">
                <div class="category-label">安全帽检测</div>
                <div class="alert-image-container">
                  <img :src="getRandomImage(12)" alt="安全帽检测">
                </div>
                <div class="alert-info single-line">
                  <div class="info-content">
                    <p>抓拍时间: 2023-04-14 17:23:12</p>
                    <p>布点名称: 115号探头</p>
                  </div>
                  <div class="view-btn">
                    <span class="view-large" @click="showLargeImage(12)">查看大图</span>
                  </div>
                </div>
              </div>

              <div class="alert-item">
                <div class="category-label">安全帽检测</div>
                <div class="alert-image-container">
                  <img :src="getRandomImage(13)" alt="安全帽检测">
                </div>
                <div class="alert-info single-line">
                  <div class="info-content">
                    <p>抓拍时间: 2023-04-14 17:23:12</p>
                    <p>布点名称: 115号探头</p>
                  </div>
                  <div class="view-btn">
                    <span class="view-large" @click="showLargeImage(13)">查看大图</span>
                  </div>
                </div>
              </div>

              <div class="alert-item">
                <div class="category-label">在岗检测</div>
                <div class="alert-image-container">
                  <img :src="getRandomImage(11)" alt="在岗检测">
                </div>
                <div class="alert-info single-line">
                  <div class="info-content">
                    <p>抓拍时间: 2023-04-14 17:23:12</p>
                    <p>布点名称: 115号探头</p>
                  </div>
                  <div class="view-btn">
                    <span class="view-large" @click="showLargeImage(11)">查看大图</span>
                  </div>
                </div>
              </div>
            </div>
          </dv-border-box-12>
        </div>
      </div>

      <!-- 底部状态区域 -->
      <div class="bottom-container">
        <div class="bottom-area">
          <!-- 设备状态 -->
          <dv-border-box-12 class="panel status-panel">
            <div class="panel-header">
              <span>设备状态</span>
              <div class="watermark">TSINGSEE</div>
            </div>
            <div class="status-content">
              <div class="status-item">
                <dv-active-ring-chart :config="deviceStatusConfig1" />
                <div class="status-text">
                  <p>总数量: 27</p>
                  <p>离线数: 3</p>
                </div>
              </div>
              <div class="status-item">
                <dv-active-ring-chart :config="deviceStatusConfig2" />
                <div class="status-text">
                  <p>在线: 18</p>
                  <p>离线: 9</p>
                </div>
              </div>
            </div>
          </dv-border-box-12>

          <!-- 带宽使用 -->
          <dv-border-box-12 class="panel bandwidth-panel">
            <div class="panel-header">
              <span>带宽使用(Mbps)</span>
              <div class="watermark">TSINGSEE</div>
            </div>
            <div class="bandwidth-content">
              <dv-charts :option="bandwidthOption" />
            </div>
          </dv-border-box-12>
        </div>
      </div>
    </div>
    
    <!-- 大图查看模态框 -->
    <div class="modal-overlay" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <span v-if="modalType === 'parking'" class="category-badge parking">泊车库检测</span>
            <span v-else-if="modalType === 'helmet'" class="category-badge helmet">安全帽检测</span>
            <span v-else class="category-badge duty">在岗检测</span>
            {{ modalTitle }}
          </div>
          <span class="close-modal" @click="closeModal">&times;</span>
        </div>
        <div class="modal-body">
          <img :src="largeImage" alt="大图查看">
        </div>
        <div class="modal-footer">
          <div class="info-row">
            <span class="info-label">抓拍时间:</span>
            <span class="info-value">2023-04-14 17:23:12</span>
          </div>
          <div class="info-row">
            <span class="info-label">布点名称:</span>
            <span class="info-value">115号探头</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParkManagement',
  components: {
    // 暂时注释掉data-view组件，使项目能够正常运行
    // 这些组件仅在可视化中心功能中使用，不影响系统管理功能
    /* 
    dvBorderBox8,
    dvBorderBox12,
    dvBorderBox13,
    dvDecoration5,
    dvDecoration8,
    dvDecoration6,
    dvDecoration10,
    dvActiveRingChart,
    dvCharts
    */
  },
  data() {
    return {
      isFullScreen: false,
      treeData: [{
        id: '1',
        label: '市直单位',
        children: [{
          id: '2',
          label: '清江园区',
          children: [{
            id: '3',
            label: '清江园区-南',
            children: [{
              id: '4',
              label: '监控点1号探头'
            }, {
              id: '5',
              label: '监控点2号探头'
            }]
          }, {
            id: '6',
            label: '清江园区-西',
            children: [{
              id: '7',
              label: '监控点19号探头'
            }, {
              id: '8',
              label: '监控点21号探头'
            }]
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      cpuOption: {
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['17:23:05', '17:23:10', '17:23:15', '17:23:20'],
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            style: {
              stroke: 'rgba(27,150,255,0.1)'
            }
          },
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        series: [{
          type: 'line',
          data: [65, 59, 80, 81],
          smooth: true,
          lineStyle: {
            stroke: '#1B96FF',
            width: 2
          },
          areaStyle: {
            fill: 'rgba(27,150,255,0.3)'
          }
        }]
      },
      storageOption: {
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['内存1', '内存2', '内存3', '内存4', '内存5', '内存6', '内存7'],
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            style: {
              stroke: 'rgba(27,150,255,0.1)'
            }
          },
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        series: [{
          type: 'bar',
          data: [60, 40, 20, 70, 30, 50, 10],
          barWidth: 20,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                {offset: 0, color: 'rgba(27,150,255,0.8)'},
                {offset: 1, color: 'rgba(27,150,255,0.3)'}
              ]
            }
          }
        }]
      },
      bandwidthOption: {
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '10%',
          containLabel: true
        },
        legend: {
          data: ['上行带宽', '下行带宽'],
          textStyle: {
            fill: '#fff'
          },
          right: 0,
          top: 0
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['17:23:05', '17:23:10', '17:23:15', '17:23:20', '17:23:25', '17:23:30'],
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true,
            style: {
              stroke: 'rgba(27,150,255,0.1)'
            }
          },
          axisLine: {
            style: {
              stroke: '#1B96FF'
            }
          },
          axisLabel: {
            style: {
              fill: '#fff'
            }
          }
        },
        series: [{
          name: '上行带宽',
          type: 'line',
          data: [2.39687, 2.39687, 2.39687, 2.39687, 2.39687, 2.39687],
          smooth: true,
          lineStyle: {
            stroke: '#1B96FF'
          }
        }, {
          name: '下行带宽',
          type: 'line',
          data: [2.39687, 2.39687, 2.39687, 2.39687, 2.39687, 2.39687],
          smooth: true,
          lineStyle: {
            stroke: '#FFD700'
          }
        }]
      },
      deviceStatusConfig1: {
        data: [
          {name: '在线', value: 27},
          {name: '离线', value: 3}
        ],
        color: ['#1B96FF', 'rgba(27,150,255,0.2)'],
        radius: '80%',
        activeRadius: '85%'
      },
      deviceStatusConfig2: {
        data: [
          {name: '在线', value: 18},
          {name: '离线', value: 9}
        ],
        color: ['#1B96FF', 'rgba(27,150,255,0.2)'],
        radius: '80%',
        activeRadius: '85%'
      },
      showModal: false,
      largeImage: '',
      modalTitle: '',
      modalType: '',
    }
  },
  methods: {
    getRandomImage(index) {
      // 根据索引返回不同类型的工业场景图片
      const industrialImages = [
        // 管道设施图片
        'https://images.unsplash.com/photo-1574172367057-93d703ae5bad?w=800&h=450&fit=crop',
        // 工业储罐图片
        'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&h=450&fit=crop',
        // 工厂设备图片
        'https://images.unsplash.com/photo-1631651738795-b89747292eb0?w=800&h=450&fit=crop',
        // 货运卡车图片
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=450&fit=crop',
        // 安全帽工人
        'https://images.unsplash.com/photo-1531973486364-5fa64260d75b?w=400&h=300&fit=crop',
        // 工厂作业
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop',
        // 安全检查
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
        // 工厂监督
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop'
      ];
      
      // 选择合适的图片索引
      let imgIndex = (index - 1) % industrialImages.length;
      if (index > 10) imgIndex = index % 4 + 4; // 预警图片使用后面的索引
      
      return industrialImages[imgIndex];
    },
    
    // 显示大图
    showLargeImage(index) {
      this.largeImage = this.getRandomImage(index);
      
      // 设置标题和类型
      if (index === 11) {
        this.modalTitle = "预警详情";
        this.modalType = "parking";
      } else if (index === 12 || index === 13) {
        this.modalTitle = "预警详情";
        this.modalType = "helmet";
      } else {
        this.modalTitle = "预警详情";
        this.modalType = "duty";
      }
      
      this.showModal = true;
      
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
    },
    
    // 关闭模态框
    closeModal() {
      this.showModal = false;
      this.largeImage = '';
      
      // 恢复页面滚动
      document.body.style.overflow = 'auto';
    },
    
    // 添加窗口大小变化监听
    handleResize() {
      // 在窗口大小变化时可以进行额外调整
      // 此处仅作为示例，实际实现可能需要调整其他组件
      console.log('Window resized');
    },
    
    // 添加全屏切换方法
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
      
      const navBar = document.querySelector('.el-header');
      
      if (this.isFullScreen) {
        // 请求全屏
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
        
        // 隐藏导航栏
        if (navBar) navBar.style.display = 'none';
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        
        // 显示导航栏
        if (navBar) navBar.style.display = '';
      }
    }
  },
  mounted() {
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 移除监听器避免内存泄漏
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style scoped>
.park-management {
  width: 100%;
  height: 100vh;
  background-color: #000B2A;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.header-box {
  width: 100%;
  height: 80px;
  margin: 0;
  background: linear-gradient(180deg, rgba(1,19,56,0.8) 0%, rgba(1,19,56,0.6) 100%);
}

.header-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.left-decoration,
.right-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 300px;
}

.decoration-line-group {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.decoration-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(180deg, rgba(51,255,255,0.8) 0%, rgba(51,255,255,0) 100%);
  position: relative;
}

.decoration-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #33ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(51,255,255,0.8);
}

.decoration-line.line1 {
  height: 40px;
}

.decoration-line.line2 {
  height: 25px;
  margin-top: 15px;
}

.decoration-line.line3 {
  height: 15px;
  margin-top: 25px;
}

.right-decoration .decoration-line-group {
  transform: scaleX(-1);
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(51,255,255,0.5);
  letter-spacing: 4px;
  position: relative;
  padding: 0 20px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 0 20px;
  height: calc(100vh - 290px);
  position: relative;
  z-index: 1;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.device-panel {
  flex: 1.1;
  min-height: 302px;
}

.cpu-panel, .storage-panel {
  flex: 0.95;
  min-height: 253px;
}

.device-panel, .cpu-panel, .storage-panel {
  height: auto;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.right-panel {
  width: 310px;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: transparent;
  position: relative;
}

.panel {
  background: #001135;
  border: 1px solid #0a2550;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background: linear-gradient(90deg, #001135 0%, rgba(0,17,53,0.8) 100%);
  border-bottom: 1px solid #0a2550;
  font-size: 14px;
  position: relative;
}

.panel-header::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1B96FF;
  position: absolute;
  left: 0;
  margin-left: -15px;
}

.device-tree {
  padding: 10px;
  height: calc(100% - 36px);
  overflow: auto;
}

.video-container {
  flex: 1;
  background: #001135;
  border: 1px solid #0a2550;
  border-radius: 4px;
  overflow: hidden;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
  background: #001135;
  height: calc(100% - 36px);
  min-height: 400px;
}

.video-item {
  position: relative;
  background: #000;
  border: 1px solid #0a2550;
  border-radius: 2px;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

.video-content {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.video-content img {
  flex: 1;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.video-info {
  height: 24px;
  line-height: 24px;
  background: rgba(0,17,53,0.9);
  padding: 0 10px;
  font-size: 11px;
  color: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-panel {
  height: 100%;
  min-height: 832px;
  position: relative;
  overflow: visible;
}

.alert-list {
  height: calc(100% - 60px);
  padding: 10px;
  padding-bottom: 5px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.alert-item {
  background: #000B2A;
  border: 1px solid #0a2550;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  height: auto;
  flex: 0 0 auto;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  position: relative;
  width: 100%;
}

.category-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #000B2A;
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 2px;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.alert-image-container {
  width: 100%;
  padding: 0;
  position: relative;
  overflow: hidden;
  height: 180px;
}

.alert-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alert-info {
  padding: 8px 12px;
  font-size: 12px;
  background: #000B2A;
  border-top: 1px solid rgba(10,37,80,0.5);
}

.alert-info.single-line {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-content {
  flex: 1;
}

.view-btn {
  width: auto;
}

.alert-info p {
  margin: 4px 0;
  color: #7a8baa;
}

.view-large {
  color: #1B96FF;
  cursor: pointer;
  font-size: 12px;
  font-weight: normal;
  padding: 2px 5px;
  border-radius: 2px;
  transition: all 0.3s;
}

.view-large:hover {
  text-decoration: underline;
  color: #33ffff;
  background: rgba(27, 150, 255, 0.1);
}

.screen-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.screen-controls span {
  font-size: 12px;
  color: #7a8baa;
}

.screen-controls i {
  cursor: pointer;
  font-size: 16px;
  color: #7a8baa;
  transition: color 0.3s;
}

.screen-controls i.active {
  color: #1B96FF;
}

.watermark {
  font-size: 12px;
  color: #7a8baa;
  opacity: 0.5;
}

/* 树形控件样式覆盖 */
.custom-tree {
  background: transparent;
  color: #fff;
  font-size: 12px;
}

.custom-tree >>> .el-tree-node__content {
  background: transparent;
  color: #7a8baa;
  height: 32px;
  border-bottom: 1px solid rgba(10,37,80,0.5);
}

.custom-tree >>> .el-tree-node__content:hover {
  background: rgba(27,150,255,0.1);
  color: #fff;
}

.custom-tree >>> .el-tree-node__expand-icon {
  color: #7a8baa;
}

.custom-tree >>> .el-tree-node__expand-icon.expanded {
  transform: rotate(90deg);
}

.custom-tree >>> .el-tree-node__expand-icon.is-leaf {
  color: transparent;
}

.chart-wrapper {
  height: calc(100% - 36px);
  padding: 10px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: #001135;
}

::-webkit-scrollbar-thumb {
  background: #0a2550;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1B96FF;
}

/* 底部容器样式 */
.bottom-container {
  position: relative;
  height: 180px;
  padding: 0 20px;
  margin-top: 10px;
  z-index: 2;
}

/* 底部区域样式 */
.bottom-area {
  display: flex;
  gap: 10px;
  height: 100%;
  /* 中间区域的布局定位 */
  margin-left: 310px; /* 左侧面板宽度 + gap */
  width: calc(100% - 630px); /* 屏幕宽度 - (左面板宽度 + 右面板宽度 + 边距) */
}

.status-panel, .bandwidth-panel {
  flex: 1;
  height: 100%;
}

.status-content, .bandwidth-content {
  height: calc(100% - 36px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px;
}

.status-item {
  text-align: center;
}

.status-text {
  margin-top: 10px;
  font-size: 12px;
  color: #7a8baa;
}

.status-text p {
  margin: 5px 0;
}

/* 修改媒体查询以适应新布局 */
@media screen and (max-height: 900px) {
  .main-content {
    height: calc(100vh - 270px);
  }
  
  .device-panel {
    min-height: 180px;
  }
  
  .cpu-panel, .storage-panel {
    min-height: 130px;
  }
  
  .video-grid {
    min-height: 360px;
  }
  
  .alert-panel {
    min-height: 550px;
  }
  
  .bottom-container {
    height: 170px;
  }
}

@media screen and (max-height: 750px) {
  .main-content {
    height: calc(100vh - 250px);
  }
  
  .device-panel {
    min-height: 160px;
  }
  
  .cpu-panel, .storage-panel {
    min-height: 120px;
  }
  
  .video-grid {
    min-height: 320px;
  }
  
  .alert-panel {
    min-height: 500px;
  }
  
  .alert-item {
    margin-bottom: 0;
  }
  
  .alert-image-container {
    height: 150px;
  }
  
  .bottom-container {
    height: 150px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  transition: all 0.3s ease;
}

.modal-content {
  background: #001642;
  border: 1px solid #0a2550;
  border-radius: 4px;
  width: 80%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 11, 42, 0.8);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 12px 15px;
  background: linear-gradient(90deg, #001135 0%, rgba(0,17,53,0.8) 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #0a2550;
}

.modal-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.modal-title .category-badge {
  margin-right: 10px;
}

.close-modal {
  cursor: pointer;
  font-size: 24px;
  color: #7a8baa;
  transition: color 0.3s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-modal:hover {
  color: #1B96FF;
  background: rgba(27, 150, 255, 0.1);
}

.modal-body {
  padding: 0;
  overflow: hidden;
  text-align: center;
  background: #000;
}

.modal-body img {
  width: 100%;
  max-height: calc(90vh - 120px);
  object-fit: contain;
}

.modal-footer {
  padding: 12px 15px;
  background: rgba(0,17,53,0.9);
  border-top: 1px solid #0a2550;
}

.info-row {
  display: flex;
  margin-bottom: 5px;
}

.info-label {
  width: 80px;
  color: #7a8baa;
  font-size: 13px;
}

.info-value {
  color: #fff;
  font-size: 13px;
}

.category-badge {
  display: inline-block;
  padding: 3px 8px;
  color: #fff;
  border-radius: 2px;
  font-size: 13px;
  margin-right: 10px;
}

.category-badge.parking {
  background-color: #1B96FF;
}

.category-badge.helmet {
  background-color: #FF6B00;
}

.category-badge.duty {
  background-color: #00B42A;
}

.fullscreen-btn {
  position: absolute;
  top: 22px;
  right: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 17, 53, 0.5);
  border: 1px solid #0a2550;
  border-radius: 4px;
  color: #1B96FF;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.fullscreen-btn:hover {
  background: rgba(27, 150, 255, 0.2);
  color: #33ffff;
  transform: scale(1.05);
}
</style> 
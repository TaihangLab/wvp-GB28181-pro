<template>
	<div class="media-server-manager management-page-container">
		<!-- 页面头部 -->
		<div class="page-header management-page-header">
			<div class="header-left">
				<h2 class="page-title">
					<i class="el-icon-connection"></i>
					媒体节点管理
				</h2>
				<p class="page-subtitle">管理和监控所有媒体服务节点</p>
			</div>
			<div class="header-right">
				<el-button type="primary" icon="el-icon-plus" @click="add">
					添加节点
				</el-button>
				<el-button type="success" icon="el-icon-refresh" @click="initData">
					刷新列表
				</el-button>
			</div>
		</div>

		<!-- 节点统计卡片 -->
		<div class="stats-cards management-stats-cards">
			<el-card class="stat-card management-stat-card" shadow="hover">
				<div class="stat-content">
					<div class="stat-icon online">
						<i class="el-icon-connection"></i>
					</div>
					<div class="stat-info">
						<div class="stat-number">{{ mediaServerList.filter(item => item.status).length }}</div>
						<div class="stat-label">在线节点</div>
					</div>
				</div>
			</el-card>
			
			<el-card class="stat-card management-stat-card" shadow="hover">
				<div class="stat-content">
					<div class="stat-icon offline">
						<i class="el-icon-close"></i>
					</div>
					<div class="stat-info">
						<div class="stat-number">{{ mediaServerList.filter(item => !item.status).length }}</div>
						<div class="stat-label">离线节点</div>
					</div>
				</div>
			</el-card>
			
			<el-card class="stat-card management-stat-card" shadow="hover">
				<div class="stat-content">
					<div class="stat-icon total">
						<i class="el-icon-box"></i>
					</div>
					<div class="stat-info">
						<div class="stat-number">{{ mediaServerList.length }}</div>
						<div class="stat-label">节点总数</div>
					</div>
				</div>
			</el-card>
			
			<el-card class="stat-card management-stat-card" shadow="hover">
				<div class="stat-content">
					<div class="stat-icon default">
						<i class="el-icon-star-on"></i>
					</div>
					<div class="stat-info">
						<div class="stat-number">{{ mediaServerList.filter(item => item.defaultServer).length }}</div>
						<div class="stat-label">默认节点</div>
					</div>
				</div>
			</el-card>
		</div>

		<!-- 节点列表 -->
		<el-card class="server-list-card management-table-card" shadow="never">
			<div slot="header" class="card-header">
				<span class="card-title">节点列表</span>
			</div>

			<div class="server-grid" v-loading="loading" element-loading-text="加载节点列表中...">
				<el-card 
					v-for="item in mediaServerList" 
					:key="item.id"
					shadow="hover" 
					:body-style="{ padding: '0px'}" 
					class="server-card">
					
					<!-- 节点类型图标 -->
					<div class="server-type-section">
						<div v-if="item.type === 'zlm'" class="card-img-zlm"></div>
						<div v-if="item.type === 'abl'" class="card-img-abl"></div>
					</div>
					
					<!-- 节点信息 -->
					<div class="server-info">
						<div class="server-header">
							<h4 class="server-name">{{ item.id }}</h4>
							<div class="server-actions">
								<el-button 
									v-if="!item.defaultServer" 
									icon="el-icon-edit" 
									size="mini"
									type="text" 
									@click="edit(item)">编辑</el-button>
								<el-button 
									v-if="item.defaultServer" 
									icon="el-icon-view" 
									size="mini"
									type="text" 
									@click="edit(item)">查看</el-button>
								<el-button 
									v-if="!item.defaultServer" 
									icon="el-icon-delete" 
									size="mini"
									type="text" 
									@click="del(item)">移除</el-button>
							</div>
						</div>
						
						<div class="server-details">
							<div class="detail-row">
								<span class="detail-label">IP地址:</span>
								<span class="detail-value">{{ item.ip }}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">创建时间:</span>
								<span class="detail-value">{{ item.createTime }}</span>
							</div>
						</div>
					</div>
					
					<!-- 状态标识 -->
					<div class="server-badges">
						<el-badge 
							v-if="item.status" 
							value="在线" 
							class="status-badge online" 
							type="success">
						</el-badge>
						<el-badge 
							v-if="!item.status" 
							value="离线" 
							class="status-badge offline" 
							type="info">
						</el-badge>
						<el-badge 
							v-if="item.defaultServer" 
							value="默认" 
							class="default-badge" 
							type="warning">
						</el-badge>
					</div>
				</el-card>
				
				<!-- 空状态 -->
				<div v-if="!loading && mediaServerList.length === 0" class="empty-state">
					<div class="empty-icon">
						<i class="el-icon-box"></i>
					</div>
					<div class="empty-text">暂无节点数据</div>
					<el-button type="primary" icon="el-icon-plus" @click="add">添加第一个节点</el-button>
				</div>
			</div>
		</el-card>

		<!-- 编辑弹窗 -->
		<mediaServerEdit ref="mediaServerEdit"></mediaServerEdit>
	</div>
</template>

<script>
import Vue from 'vue'
import MediaServer from './service/MediaServer'
import mediaServerEdit from './dialogs/MediaServerEdit'

export default {
	name: 'MediaServerManager',
	components: {
		mediaServerEdit
	},
	data() {
		return {
			mediaServerObj: new MediaServer(),
			mediaServerList: [], //设备列表
			winHeight: window.innerHeight - 200,
			updateLooper: false,
			currentPage: 1,
			count: 15,
			num: this.getNumberByWidth(),
			total: 0,
			loading: false, // 添加loading状态
		};
	},
	computed: {
		Vue() {
			return Vue
		}
	},
	mounted() {
		this.initData();
		this.updateLooper = setInterval(this.initData, 2000);
	},
	destroyed() {
		clearTimeout(this.updateLooper);
	},
	methods: {
		initData: function() {
			this.getServerList()
		},
		currentChange: function(val){
			this.currentPage = val;
			this.getServerList();
		},
		handleSizeChange: function(val){
			this.count = val;
			this.getServerList();
		},
		getServerList: function(){
			this.loading = true;
			this.mediaServerObj.getMediaServerList((data)=>{
				this.mediaServerList = data.data;
				this.loading = false;
			}).catch(() => {
				this.loading = false;
			});
		},
		add: function (){
			this.$refs.mediaServerEdit.openDialog(null, this.initData)
		},
		edit: function (row){
			this.$refs.mediaServerEdit.openDialog(row, this.initData)
		},
		del: function (row){
			this.$confirm('确认删除此节点？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.mediaServerObj.delete(row.id, (data)=>{
					if (data.code === 0) {
						this.$message({
							type: 'success',
							message: '删除成功!'
						});
					}
				})

			}).catch(() => {
			});

		},
		getNumberByWidth(){
			let candidateNums = [1, 2, 3, 4, 6, 8, 12, 24]
			let clientWidth = window.innerWidth - 30;
			let interval = 20;
			let itemWidth = 360;
			let num = (clientWidth + interval)/(itemWidth + interval)
			let result = Math.ceil(24/num);
			let resultVal = 24;
			for (let i = 0; i < candidateNums.length; i++) {
				let value = candidateNums[i]
				if (i + 1 >= candidateNums.length) {
					return  24;
				}
				if (value <= result && candidateNums[i + 1] > result ) {
					return  value;
				}
			}

			return resultVal;
		},
		dateFormat: function(/** timestamp=0 **/) {
			var ts = arguments[0] || 0;
			var t,y,m,d,h,i,s;
			t = ts ? new Date(ts*1000) : new Date();
			y = t.getFullYear();
			m = t.getMonth()+1;
			d = t.getDate();
			h = t.getHours();
			i = t.getMinutes();
			s = t.getSeconds();
			// 可根据需要在这里定义时间格式
			return y+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d)+' '+(h<10?'0'+h:h)+':'+(i<10?'0'+i:i)+':'+(s<10?'0'+s:s);
		}

	}
};
</script>

<style scoped>
/* 引入通用管理页面样式 */
@import './common-style.css';

.media-server-manager {
	padding: 20px;
	background-color: #f5f7fa;
	min-height: 100vh;
}

/* 页面头部 */
.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
	padding: 24px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12px;
	color: white;
	box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-left h2.page-title {
	font-size: 28px;
	font-weight: 700;
	margin: 0 0 8px 0;
	display: flex;
	align-items: center;
}

.header-left .page-title i {
	margin-right: 12px;
	font-size: 32px;
}

.page-subtitle {
	font-size: 16px;
	opacity: 0.9;
	margin: 0;
	font-weight: 400;
}

.header-right .el-button {
	margin-left: 12px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	background: rgba(255, 255, 255, 0.1);
	color: white;
	font-weight: 600;
}

.header-right .el-button:hover {
	background: rgba(255, 255, 255, 0.2);
	border-color: rgba(255, 255, 255, 0.5);
}

/* 统计卡片 */
.stats-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 20px;
	margin-bottom: 24px;
}

.stat-card {
	border-radius: 12px;
	border: none;
	overflow: hidden;
	transition: all 0.3s ease;
}

.stat-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-content {
	display: flex;
	align-items: center;
	padding: 8px 0;
}

.stat-icon {
	width: 60px;
	height: 60px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16px;
	font-size: 24px;
	color: white;
}

.stat-icon.online {
	background: linear-gradient(135deg, #67C23A, #85ce61);
}

.stat-icon.offline {
	background: linear-gradient(135deg, #F56C6C, #f78989);
}

.stat-icon.total {
	background: linear-gradient(135deg, #409EFF, #66b1ff);
}

.stat-icon.default {
	background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.stat-info .stat-number {
	font-size: 32px;
	font-weight: 700;
	color: #303133;
	line-height: 1;
}

.stat-info .stat-label {
	font-size: 14px;
	color: #909399;
	margin-top: 4px;
}

/* 节点列表卡片 */
.server-list-card {
	border-radius: 12px;
	border: none;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.card-title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
}

/* 节点网格 */
.server-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
	gap: 20px;
}

/* 单个节点卡片 */
.server-card {
	position: relative;
	border-radius: 12px;
	border: none;
	transition: all 0.3s ease;
	overflow: hidden;
}

.server-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 节点类型图标区域 */
.server-type-section {
	height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.card-img-zlm {
	width: 160px; 
	height: 160px;
	background: url('~@static/images/zlm-logo.png') no-repeat center;
	background-position: center;
	background-size: contain;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-img-abl {
	width: 160px; 
	height: 160px;
	background: url('~@static/images/abl-logo.jpg') no-repeat center;
	background-position: center;
	background-size: contain;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 节点信息区域 */
.server-info {
	padding: 20px;
}

.server-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16px;
}

.server-name {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: #303133;
}

.server-actions {
	display: flex;
	gap: 8px;
}

.server-actions .el-button--text {
	padding: 4px 8px;
	font-size: 12px;
	border-radius: 4px;
}

.server-details {
	margin-bottom: 12px;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8px;
	font-size: 14px;
}

.detail-label {
	color: #606266;
	font-weight: 500;
}

.detail-value {
	color: #303133;
	font-weight: 600;
	font-family: 'Courier New', monospace;
}

/* 状态标识 */
.server-badges {
	position: absolute;
	top: 16px;
	right: 16px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.status-badge, .default-badge {
	font-size: 12px;
}

/* 空状态 */
.empty-state {
	grid-column: 1 / -1;
	text-align: center;
	padding: 60px 20px;
	color: #909399;
}

.empty-icon {
	font-size: 64px;
	color: #c0c4cc;
	margin-bottom: 16px;
}

.empty-text {
	font-size: 16px;
	margin-bottom: 24px;
	color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.media-server-manager {
		padding: 10px;
	}
	
	.page-header {
		flex-direction: column;
		text-align: center;
		gap: 16px;
	}
	
	.server-grid {
		grid-template-columns: 1fr;
	}
	
	.stats-cards {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 480px) {
	.stats-cards {
		grid-template-columns: 1fr;
	}
	
	.server-header {
		flex-direction: column;
		gap: 8px;
	}
	
	.server-actions {
		align-self: stretch;
	}
}
</style>

import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from "../layout/index.vue"




import gbRecordDetail from '../components/visionAI/deviceManagement/managementPages/GBRecordDetail.vue'



import login from '../components/Login.vue'


import cloudRecordDetail from '../components/visionAI/deviceManagement/managementPages/CloudRecordDetail.vue'





import deviceTree from '../components/common/DeviceTree.vue'


import wasmPlayer from '../components/common/jessibuca.vue'
import rtcPlayer from '../components/dialog/rtcPlayer.vue'




import visualCenter from '../components/visionAI/ivisualCenter/index.vue'
import algorithmInference from '../components/visionAI/ivisualCenter/algorithmInference.vue'
import realTimeMonitoring from '../components/visionAI/monitoringWarning/realTimeMonitoring.vue'
import statisticsAnalysis from '../components/visionAI/monitoringWarning/statisticsAnalysis.vue'
import warningArchives from '../components/visionAI/monitoringWarning/warningArchives.vue'
import warningManagement from '../components/visionAI/monitoringWarning/warningManagement.vue'
import reviewRecords from '../components/visionAI/monitoringWarning/reviewRecords.vue'
import intelligentReview from '../components/visionAI/monitoringWarning/intelligentReview.vue'
import camera from '../components/visionAI/deviceManagement/camera.vue'
import CameraManagementMain from '../components/visionAI/deviceManagement/CameraManagementMain.vue'
import modelList from '../components/visionAI/modelManagement/modelList.vue'
import deviceSkills from '../components/visionAI/skillManagement/deviceSkills.vue'
import multimodalLlmSkills from '../components/visionAI/skillManagement/multimodalLlmSkills.vue'
import multimodalCreateDetail from '../components/visionAI/skillManagement/LlmSkillCreateDialogDetail.vue'
import multimodalReview from '../components/visionAI/skillManagement/multimodalReview.vue'
import multimodalReviewCreate from '../components/visionAI/skillManagement/multimodalReviewCreate.vue'
import logRecords from '../components/visionAI/smartControl/logRecords.vue'
import edgeServer from '../components/visionAI/edgeManagement/edgeServer.vue'
import edgeBox from '../components/visionAI/edgeManagement/edgeBox.vue'
import applicationSettings from '../components/visionAI/systemManagement/applicationSettings.vue'
import userManagement from '../components/visionAI/systemManagement/userManagement.vue'
import roleManagement from '../components/visionAI/systemManagement/roleManagement.vue'
import roleAssignment from '../components/visionAI/systemManagement/roleAssignment.vue'
import userAssignment from '../components/visionAI/systemManagement/userAssignment.vue'
import tenantManagement from '../components/visionAI/systemManagement/tenantManagement.vue'
import departmentManagement from '../components/visionAI/systemManagement/departmentManagement.vue'
import positionManagement from '../components/visionAI/systemManagement/positionManagement.vue'
import profile from '../components/visionAI/systemManagement/profile.vue'
import parkManagement from '../components/visionAI/ivisualCenter/parkManagement.vue'
import knowledgeBase from '../components/visionAI/systemManagement/knowledgeBase.vue'
import knowledgeBaseDetail from '../components/visionAI/systemManagement/knowledgeBaseDetail.vue'
// 知识库管理

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)


export default new VueRouter({
  mode:'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Layout,
      redirect: '/visualCenter',
      children: [





        {
          path: '/visualCenter',
          component: visualCenter,
        },
        {
          path: '/algorithmInference',
          component: algorithmInference,
        },
        {
          path: '/visualCenter/parkManagement',
          name: 'parkManagement',
          component: parkManagement,
        },
        {
          path: '/monitoring/realtime',
          name: 'realTimeMonitoring',
          component: realTimeMonitoring,
        },
        {
          path: '/monitoring/statistics',
          name: 'statisticsAnalysis',
          component: statisticsAnalysis,
        },
        {
          path: '/monitoring/warningArchive',
          name: 'warningArchives',
          component: warningArchives,
        },
        {
          path: '/monitoring/warningManage',
          name: 'warningManagement',
          component: warningManagement,
        },
        {
          path: '/monitoring/reviewRecords',
          name: 'reviewRecords',
          component: reviewRecords,
        },
        {
          path: '/monitoring/intelligentReview',
          name: 'intelligentReview',
          component: intelligentReview,
        },
        {
          path: '/deviceManage/camera',
          name: 'camera',
          component: camera,
        },
        {
          path: '/deviceManage/cameraManagement',
          name: 'CameraManagementMain',
          component: CameraManagementMain,
        },
        {
          path: '/device/camera',
          redirect: '/deviceManage/camera'
        },
        {
          path: '/modelManage/modelList',
          name: 'modelList',
          component: modelList,
        },
        {
          path: '/skillManage/deviceSkills',
          name: 'deviceSkills',
          component: deviceSkills,
        },
        {
          path: '/skillManage/multimodalLlmSkills',
          name: 'multimodalLlmSkills',
          component: multimodalLlmSkills,
        },
        {
          path: '/skillManage/multimodalCreateDetail',
          name: 'multimodalCreateDetail',
          component: multimodalCreateDetail,
        },
        {
          path: '/skillManage/multimodalReview',
          name: 'multimodalReview',
          component: multimodalReview,
        },
        {
          path: '/skillManage/multimodalReviewCreate',
          name: 'multimodalReviewCreate',
          component: multimodalReviewCreate,
        },
        {
          path: '/intelligentControl/logRecord',
          name: 'logRecords',
          component: logRecords,
        },
        {
          path: '/edgeManage/edgeServer',
          name: 'edgeServer',
          component: edgeServer,
        },
        {
          path: '/edgeManage/edgeBox',
          name: 'edgeBox',
          component: edgeBox,
        },
        {
          path: '/systemManage/appSettings',
          name: 'applicationSettings',
          component: applicationSettings,
        },
        {
          path: '/systemManage/userManagement',
          name: 'userManagement',
          component: userManagement,
        },
        {
          path: '/systemManage/roleManagement',
          name: 'roleManagement',
          component: roleManagement,
        },
              {
        path: '/systemManage/roleAssignment/:userId/:userName',
        name: 'RoleAssignment',
        component: roleAssignment,
        },
        {
          path: '/visionAI/systemManagement/userAssignment',
          name: 'userAssignment',
          component: userAssignment,
        },
        {
          path: '/systemManage/tenantManagement',
          name: 'tenantManagement',
          component: tenantManagement,
        },
        {
          path: '/systemManage/departmentManagement',
          name: 'departmentManagement',
          component: departmentManagement,
        },
        {
          path: '/systemManage/positionManagement',
          name: 'positionManagement',
          component: positionManagement,
        },
        {
          path: '/systemManage/knowledgeBase',
          name: 'knowledgeBase',
          component: knowledgeBase,
        },
        {
          path: '/system/knowledge-detail',
          name: 'knowledgeBaseDetail',
          component: knowledgeBaseDetail,
        },
        {
          path: '/systemManage/profile',
          name: 'profile',
          component: profile,
        },

        {
          path: '/gbRecordDetail/:deviceId/:channelId/',
          name: 'gbRecordDetail',
          component: gbRecordDetail,
        },



        {
          path: '/cloudRecordDetail/:app/:stream',
          name: 'cloudRecordDetail',
          component: cloudRecordDetail,
        },
        {
          path: '/cloudRecordDetail/:mediaServerId/:app/:stream',
          name: 'cloudRecordDetail',
          component: cloudRecordDetail,
        },











        ]
    },
    {
      path: '/login',
      name: '登录',
      component: login,
    },
    {
      path: '/test',
      name: 'deviceTree',
      component: deviceTree,
    },
    {
      path: '/play/wasm/:url',
      name: 'wasmPlayer',
      component: wasmPlayer,
    },
    {
      path: '/play/rtc/:url',
      name: 'rtcPlayer',
      component: rtcPlayer,
    },
  ]
})

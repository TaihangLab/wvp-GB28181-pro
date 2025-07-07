import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from "../layout/index.vue"

import console from '../components/console.vue'
import deviceList from '../components/DeviceList.vue'
import channelList from '../components/channelList.vue'
import gbRecordDetail from '../components/visionAI/deviceManagement/managementPages/GBRecordDetail.vue'
import streamPushList from '../components/StreamPushList.vue'
import streamProxyList from '../components/StreamProxyList.vue'
import map from '../components/map.vue'
import login from '../components/Login.vue'
import platform from '../components/PlatformList.vue'
import cloudRecord from '../components/CloudRecord.vue'
import cloudRecordDetail from '../components/visionAI/deviceManagement/managementPages/CloudRecordDetail.vue'
import mediaServerManger from '../components/MediaServerManger.vue'
import web from '../components/setting/Web.vue'
import sip from '../components/setting/Sip.vue'
import media from '../components/setting/Media.vue'
import live from '../components/live.vue'
import deviceTree from '../components/common/DeviceTree.vue'
import userManager from '../components/UserManager.vue'
import userApiKeyManager from '../components/UserApiKeyManager.vue'
import wasmPlayer from '../components/common/jessibuca.vue'
import rtcPlayer from '../components/dialog/rtcPlayer.vue'
import region from '../components/region.vue'
import group from '../components/group.vue'
import operations from '../components/operations.vue'
import recordPLan from '../components/RecordPLan.vue'
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
import tenantManagement from '../components/visionAI/systemManagement/tenantManagement.vue'
import departmentManagement from '../components/visionAI/systemManagement/departmentManagement.vue'
import positionManagement from '../components/visionAI/systemManagement/positionManagement.vue'
import profile from '../components/visionAI/systemManagement/profile.vue'
import parkManagement from '../components/visionAI/ivisualCenter/parkManagement.vue'
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
          path: '/console',
          component: console,
        },
        {
          path: '/live',
          component: live,
        },
        {
          path: '/deviceList',
          component: deviceList,
        },
        {
          path: '/streamPushList',
          component: streamPushList,
        },
        {
          path: '/streamProxyList',
          component: streamProxyList,
        },
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
          path: '/systemManage/profile',
          name: 'profile',
          component: profile,
        },
        {
          path: '/channelList/:deviceId/:parentChannelId/',
          name: 'channelList',
          component: channelList,
        },
        {
          path: '/gbRecordDetail/:deviceId/:channelId/',
          name: 'gbRecordDetail',
          component: gbRecordDetail,
        },
        {
          path: '/platformList/:count/:page',
          name: 'platformList',
          component: platform,
        },
        {
          path: '/map/:deviceId/:parentChannelId/:count/:page',
          name: 'map',
          component: map,
        },
        {
          path: '/cloudRecord',
          name: 'cloudRecord',
          component: cloudRecord,
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
        {
          path: '/mediaServerManger',
          name: 'mediaServerManger',
          component: mediaServerManger,
        },
        {
          path: '/setting/web',
          name: 'web',
          component: web,
        },
        {
          path: '/setting/sip',
          name: 'sip',
          component: sip,
        },
        {
          path: '/setting/media',
          name: 'media',
          component: media,
        },
        {
          path: '/map',
          name: 'map',
          component: map,
        },
        {
          path: '/userManager',
          name: 'userManager',
          component: userManager,
        },
        {
          path: '/userApiKeyManager/:userId',
          name: 'userApiKeyManager',
          component: userApiKeyManager,
        },
        {
          path: '/channel/region',
          name: 'region',
          component: region,
        },
        {
          path: '/channel/group',
          name: 'group',
          component: group,
        },
        {
          path: '/operations',
          component: operations,
        },
        {
          path: '/recordPLan',
          component: recordPLan,
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

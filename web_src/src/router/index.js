import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from "../layout/index.vue"

import console from '../components/console.vue'
import deviceList from '../components/DeviceList.vue'
import channelList from '../components/channelList.vue'
import gbRecordDetail from '../components/GBRecordDetail.vue'
import streamPushList from '../components/StreamPushList.vue'
import streamProxyList from '../components/StreamProxyList.vue'
import map from '../components/map.vue'
import login from '../components/Login.vue'
import platform from '../components/PlatformList.vue'
import cloudRecord from '../components/CloudRecord.vue'
import cloudRecordDetail from '../components/CloudRecordDetail.vue'
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
      redirect: '/console',
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

import axios from 'axios';

class MediaServer{

  constructor() {
    this.$axios = axios;
  }

  getOnlineMediaServerList(callback){
    this.$axios({
      method: 'get',
      url:`/api/server/media_server/online/list`,
    }).then((res) => {
      if (typeof (callback) == "function") callback(res.data)
    }).catch((error) => {
      console.log(error);
    });
  }
  getMediaServerList(callback){
    this.$axios({
      method: 'get',
      url:`/api/server/media_server/list`,
    }).then(function (res) {
      if (typeof (callback) == "function") callback(res.data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  getMediaServer(id, callback){
    this.$axios({
      method: 'get',
      url:`/api/server/media_server/one/` + id,
    }).then(function (res) {
      if (typeof (callback) == "function") callback(res.data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  checkServer(param, callback){
    this.$axios({
      method: 'get',
      url:`/api/server/media_server/check`,
      params: {
        ip: param.ip,
        port: param.httpPort,
        secret: param.secret,
        type: param.type
      }
    }).then(function (res) {
      if (typeof (callback) == "function") callback(res.data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  checkRecordServer(param, callback){
    this.$axios({
      method: 'get',
      url:`/api/server/media_server/record/check`,
      params: {
        ip: param.ip,
        port: param.recordAssistPort
      }
    }).then(function (res) {
      if (typeof (callback) == "function") callback(res.data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  addServer(param, callback){
    this.$axios({
      method: 'post',
      url:`/api/server/media_server/save`,
      data: param
    }).then(function (res) {
      if (typeof (callback) == "function") callback(res.data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  delete(id, callback) {
    this.$axios({
      method: 'delete',
      url:`/api/server/media_server/delete`,
      params: {
        id: id
      }
    }).then(function (res) {
      if (typeof (callback) == "function") callback(res.data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  /**
   * 获取通道截图路径
   * @param {string|number} channelId 通道ID
   * @param {Function} callback 回调函数，返回截图路径
   */
  getChannelSnap(channelId, callback) {
    if (!channelId) {
      if (typeof callback === 'function') callback({ code: -1, msg: '缺少通道ID' });
      return;
    }

    console.log('正在获取通道截图路径, channelId:', channelId);
    
    this.$axios({
      method: 'get',
      url: `/api/common/channel/snap?channelId=${channelId}`,
      timeout: 10000, // 增加超时时间
    })
    .then(function (response) {
      console.log('获取通道截图路径响应:', response.data);
      if (typeof callback === 'function') callback(response.data);
    })
    .catch(function (error) {
      console.error('获取通道截图路径错误:', error);
      if (typeof callback === 'function') callback({ code: -1, msg: error.message || '网络错误' });
    });
  }

  /**
   * 从文件路径中提取时间戳，支持多种格式
   * @param {string} path 文件路径
   * @returns {string} 提取的时间戳
   */
  extractTimestampFromPath(path) {
    if (!path) return '';
    try {
      console.log('尝试从路径提取时间戳:', path);
      
      // 获取文件名
      const parts = path.split('/');
      const fileName = parts[parts.length - 1];
      console.log('文件名:', fileName);
      
      // 尝试多种方法提取时间戳
      
      // 方法1: 匹配文件名末尾的数字（不包括扩展名）
      let match = fileName.match(/(\d+)\.[^.]+$/);
      if (match && match[1]) {
        console.log('方法1成功，时间戳:', match[1]);
        return match[1];
      }
      
      // 方法2: 匹配最后一个下划线之后的数字
      match = fileName.match(/_(\d+)\.[^.]+$/);
      if (match && match[1]) {
        console.log('方法2成功，时间戳:', match[1]);
        return match[1];
      }
      
      // 方法3: 提取任何长度为14的数字序列（可能是日期时间戳 YYYYMMDDhhmmss）
      match = fileName.match(/(\d{14})/);
      if (match && match[1]) {
        console.log('方法3成功，时间戳:', match[1]);
        return match[1];
      }
      
      // 方法4: 尝试提取文件名中的任何数字序列，选择最长的一个
      const allNumbers = fileName.match(/\d+/g) || [];
      if (allNumbers.length > 0) {
        // 按长度降序排序，取最长的数字序列
        const longestNumber = allNumbers.sort((a, b) => b.length - a.length)[0];
        console.log('方法4成功，时间戳:', longestNumber);
        return longestNumber;
      }
      
      // 如果都提取不到，返回空字符串
      console.error('所有方法均未从文件名中提取到时间戳:', fileName);
      return '';
    } catch (e) {
      console.error('提取时间戳过程中出错:', e, '路径:', path);
      return '';
    }
  }

  /**
   * 获取通道截图图片
   * @param {string|number} channelId 通道ID
   * @param {string} mark 时间戳标记
   * @param {Function} callback 回调函数，返回图片数据
   */
  getChannelSnapImage(channelId, mark, callback) {
    if (!channelId || !mark) {
      console.error('获取图像失败: 参数不完整', {channelId, mark});
      if (typeof callback === 'function') callback(null);
      return;
    }

    console.log('正在获取通道截图图像, channelId:', channelId, ', mark:', mark);
    
    this.$axios({
      method: 'get',
      url: `/api/common/channel/getsnap?channelId=${channelId}&mark=${mark}`,
      responseType: 'blob',
      timeout: 15000, // 增加超时时间
    })
    .then(function (response) {
      console.log('获取通道截图图像成功, contentType:', response.headers['content-type'], 
                  ', size:', response.data.size);
      
      // 检查返回的数据是否是图像
      if (response.data instanceof Blob && response.data.type.startsWith('image/')) {
        if (typeof callback === 'function') callback(response.data);
      } else {
        console.error('返回的数据不是图像类型:', response.data);
        // 尝试读取错误内容
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const textContent = reader.result;
            console.error('返回的非图像内容:', textContent);
          } catch (e) {
            console.error('无法读取返回内容');
          }
          if (typeof callback === 'function') callback(null);
        };
        reader.readAsText(response.data);
      }
    })
    .catch(function (error) {
      console.error('获取通道截图图像错误:', error);
      if (typeof callback === 'function') callback(null);
    });
  }

  /**
   * 获取通道截图并直接返回图片
   * @param {string|number} channelId 通道ID
   * @param {Function} callback 回调函数，返回图片数据和时间戳
   */
  getChannelSnapWithImage(channelId, callback) {
    const self = this;
    if (!channelId) {
      if (typeof callback === 'function') callback({ success: false, message: '缺少通道ID' });
      return;
    }

    // 首先获取图像路径
    this.getChannelSnap(channelId, function(response) {
      if (response.code === 0 && response.data) {
        try {
          // 显示实际路径
          const path = response.data;
          console.log('服务器返回的图像路径:', path);
          
          // 使用改进后的方法提取时间戳
          const timestamp = self.extractTimestampFromPath(path);
          
          if (!timestamp) {
            console.error('无法从图像路径提取时间戳:', path);
            if (typeof callback === 'function') callback({ 
              success: false, 
              message: '无法获取时间戳',
              path: path // 添加路径信息以便调试
            });
            return;
          }
          
          console.log('成功提取时间戳:', timestamp, '从路径:', path);

          // 使用时间戳获取图像
          self.getChannelSnapImage(channelId, timestamp, function(imageData) {
            if (imageData) {
              console.log('成功获取图像数据，大小:', imageData.size, 'bytes');
              if (typeof callback === 'function') callback({ 
                success: true, 
                imageData: imageData,
                timestamp: timestamp
              });
            } else {
              console.error('获取图像数据失败，使用的时间戳:', timestamp);
              if (typeof callback === 'function') callback({ 
                success: false, 
                message: '获取图像数据失败',
                timestamp: timestamp
              });
            }
          });
        } catch (error) {
          console.error('处理图像路径时出错:', error, '路径:', response.data);
          if (typeof callback === 'function') callback({ 
            success: false, 
            message: '处理图像路径时出错: ' + error.message,
            path: response.data
          });
        }
      } else {
        console.error('获取截图路径失败:', response);
        if (typeof callback === 'function') callback({ 
          success: false, 
          message: response.msg || '获取截图路径失败'
        });
      }
    });
  }
}

export default MediaServer;


export default {

  /**
   * 存储用户信息 - 保留用于页面显示
   */
  setUser(user){
    localStorage.setItem("wvp-user", JSON.stringify(user));
  },

  /**
   * 获取用户信息 - 保留用于页面显示
   */
  getUser(){
    return JSON.parse(localStorage.getItem("wvp-user")) || {};
  },

  /**
   * 清理用户信息
   */
  clearUserInfo(){
    localStorage.removeItem("wvp-user");
  },

  // 以下方法保留兼容性，但实际认证由Python后端处理
  getToken(){
    return null; // 不再使用前端token
  },

  setToken(token) {
    // 空实现，保持兼容性
  }
}

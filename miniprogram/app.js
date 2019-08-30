//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'dev-xgy',
        traceUser: true, // 跟踪用户，作用：在云开发控制台跟踪访问小程序的用户
      })
    }

     // 设置全局属性、方法
    this.globalData = {
      playingMusicId: -1,
      userInfo: {}
    }
  },
  setGlobalData(dataItem, val) { // 设置全局属性
    this.globalData[dataItem] = val
  },
  getGlobalData(dataItem) { // 获取全局属性
    return this.globalData[dataItem]
  }
})

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    playHistory:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const openid = app.globalData.openid //从全局属性获取openid
    const playHistory = wx.getStorageSync(openid) // 读取本地播放历史数据

    if (playHistory.length !== 0) { // 有播放历史
      this.setData({
        playHistory
      })
      wx.setStorage({ // storage里把musiclist（播放列表）的内容换成播放历史的列表
        key: 'musiclist',
        data: playHistory,
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
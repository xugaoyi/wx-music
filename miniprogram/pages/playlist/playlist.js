
const MAX_LIMIT = 15

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [{
      url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
    }, {
      url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
    }, {
      url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg'
    }],
    playlist: [],
    playlistLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this._getPlaylist()

    wx.cloud.callFunction({ // 获取总数据长度
      name: 'music',
      data: {
        $url: 'getPlaylistLength'
      }
    }).then((res) => {
      this.setData({
        playlistLength: res.result.total
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._getPlaylist('reach')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  // 获取歌单列表
  _getPlaylist(v) {
    if (v === 'reach') {
      if (this.data.playlist.length === this.data.playlistLength) { // 数据已加载完
        return
      }
    }
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'music', // 云函数名称
      data: { // 传给云函数的值
        $url: 'playlist', // tcb-router 路由名称
        start: v === 'reach' ? this.data.playlist.length : 0,
        count: MAX_LIMIT
      }
    }).then((res) => {
      let data = res.result.data
      if (v === 'reach') { // 上拉加载时为数据拼接，否则为数据替换
        data = this.data.playlist.concat(data)
      }
      this.setData({
        playlist: data
      })
      wx.stopPullDownRefresh() // 停止下拉刷新动画
      wx.hideLoading() // 隐藏loading
    }).catch((err) => {
      console.error(err)
      wx.hideLoading() // 隐藏loading
    })
  }
})
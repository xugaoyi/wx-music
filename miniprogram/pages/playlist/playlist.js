const MAX_LIMIT = 12
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [
      // {
      //   url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      // }, {
      //   url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      // }, {
      //   url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg'
      // }
    ],
    playlist: [],
    playlistLength: 0,
    loadMore: true // 加载更多文字
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._getSwiper()
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    
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
    this._getSwiper()
    this._getPlaylist()
    wx.showLoading({
      title: '正在刷新'
    })
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
        this.setData({
          loadMore: false
        })
        return
      }
      // this.setData({
      //   loadMore: true
      // })
    } else {
      // wx.showLoading({
      //   title: '加载中'
      // })
    }
    
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
      } else {
        wx.hideLoading() // 隐藏loading
      }
      this.setData({
        playlist: data
      })
      wx.stopPullDownRefresh() // 停止下拉刷新动画
      
      // 设置轮播图点击跳转的歌单
      this.data.swiperImgUrls.forEach((item, i) => {
        item.playlistid = this.data.playlist[i].id
      })
      this.setData({
        swiperImgUrls: this.data.swiperImgUrls
      })

    }).catch((err) => {
      console.error(err)
      wx.hideLoading() // 隐藏loading
    })
  },

  // 获取轮播图
  _getSwiper() {
    db.collection('swiper').get().then((res) => {
      res.data.forEach((item) => {
        item.playlistid = ''
      })
      this.setData({
        swiperImgUrls: res.data
      })
    })
  },

  // 点击轮播图
  goToMusiclist(event) {
    wx.navigateTo({ // 跳转链接 并传入参数，在目标页面的js中的onLoad方法的options参数接收传入的参数
      url: `../../pages/musiclist/musiclist?playlistId=${event.target.dataset.id}`,
    })
  }
})
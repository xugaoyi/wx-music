let musiclist = []
let nowPlayingIndex = 0

// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { // options包含地址链接中传过来的参数
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist') // 读取本地存储的数据
    this._loadMusicDetail(options.musicId)
  },

  // 加载歌曲信息
  _loadMusicDetail(musicId) {
    backgroundAudioManager.stop() // 暂停上一首播放的歌曲
    let music = musiclist[nowPlayingIndex]
    wx.setNavigationBarTitle({ // 设置title
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    //获取歌曲播放链接
    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then((res) => {
      let result = JSON.parse(res.result)
      backgroundAudioManager.src = result.data[0].url //歌曲播放链接
      backgroundAudioManager.title = music.name // 歌曲名称
      backgroundAudioManager.coverImgUrl = music.al.picUrl // 歌曲图片
      backgroundAudioManager.singer = music.ar[0].name // 歌手
      backgroundAudioManager.epname = music.al.name // 专辑

      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
    })
  },

  // 播放与暂停
  togglePlaying() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause() // 暂停
    } else {
      backgroundAudioManager.play() // 播放
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 上一首
  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 下一首
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
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
let musiclist = []
let nowPlayingIndex = 0

// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

// 调用全局属性、方法（即app.js中的方法）
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicName: '',
    singer: '',
    picUrl: '',
    isPlaying: false,
    isLyricShow: false,
    lyric: '',
    isSame: false // 用于判断从歌单重新进入时是否为同一首歌曲
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
    if (musicId == app.getGlobalData('playingMusicId')) { // 判断新的歌曲和原来的歌曲是否为同一首
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }


    if (this.data.isSame) { // 是同一首歌时
      backgroundAudioManager.play()
    } else {  // 非同一首歌时
      backgroundAudioManager.stop() // 暂停上一首播放的歌曲
    }

    let music = musiclist[nowPlayingIndex]

    wx.setNavigationBarTitle({ // 设置title
      title: music.name,
    })
    this.setData({
      musicName: music.name, // 歌曲名称
      singer: music.ar[0].name, // 歌手
      picUrl: music.al.picUrl, // 唱片图片
      isPlaying: false
    })

    // 设置全局属性
    app.setGlobalData('playingMusicId', parseInt(musicId))

    // 显示加载动画
    if (!this.data.isSame) {
      // wx.showLoading({
      //   title: '歌曲加载中',
      // })
    }
    //获取歌曲播放链接
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then((res) => {
      let result = JSON.parse(res.result)

      if (result.data[0].url == null) { // 当前歌曲为网易云vip才能播放时
        wx.showToast({
          icon:'none',
          title: 'sorry，该歌曲无权限播放',
          duration: 2000
        })
        setTimeout(() => {
          wx.showToast({
            icon: 'none',
            title: '正在进入下一首...',
            duration: 2000
          })
          setTimeout(() => {
            this.onNext()
          },2000)
        },2000)
        
        return
      }

      if (!this.data.isSame) { // 不是同一首歌时
        backgroundAudioManager.src = result.data[0].url //歌曲播放链接
        backgroundAudioManager.title = music.name // 歌曲名称
        backgroundAudioManager.coverImgUrl = music.al.picUrl // 歌曲图片
        backgroundAudioManager.singer = music.ar[0].name // 歌手
        backgroundAudioManager.epname = music.al.name // 专辑
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) => {
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })

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

  // 显示隐藏歌词
  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  // 正在播放音乐时
  timeUpdate(event) {
    // 选择组件，并传入事件和参数， update()自定义事件，子组件内相应定义update()方法
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  // 监控到音乐播放（微信后台播放暂停按钮）
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },

  // 监控到音乐暂停（微信后台播放暂停按钮）
  onPause() {
    this.setData({
      isPlaying: false
    })
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
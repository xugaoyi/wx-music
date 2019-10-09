// 播放列表
let musiclist = []

// 当前播放歌曲索引
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
    nowLyric: '', // 单行歌词
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

    
    const pages = getCurrentPages() // 页面栈
    const urrentPage = pages[pages.length - 1].route  // 当前页面url

    if(urrentPage.indexOf('player') !== -1) { // 判断是否在播放器页面
      wx.setNavigationBarTitle({ // 设置title
        title: music.name + ' - ' + music.ar[0].name,
      })
    }

    this.setData({
      picUrl: music.al.picUrl, // 唱片图片
      isPlaying: false
    })

    // 设置全局属性
    app.setGlobalData('playingMusicId', parseInt(musicId))

    // 显示加载动画
    // if (!this.data.isSame) {
    //   wx.showLoading({
    //     title: '歌曲加载中',
    //   })
    // }

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

        // 保存播放历史到本地存储
        this.savePlayHistory()
      }
      this.setData({
        isPlaying: true
      })
      // wx.hideLoading()
    })

    // 加载歌词
    this.setData({
      lyric: '[00:00.000] 加载歌词中...'
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'lyric'
      }
    }).then((res) => {
      const lrc = JSON.parse(res.result).lrc
      this.setData({
        lyric: lrc ? lrc.lyric : '暂无歌词'
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
    if (nowPlayingIndex < 0) { // 第一首时
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 下一首
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) { // 最后一首时
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

  // 单行歌词更新
  nowLyric(event) {
    this.setData({
      nowLyric: event.detail
    })
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

  // 保存播放历史到本地存储
  savePlayHistory() {
    const currentSong = musiclist[nowPlayingIndex] // 当前播放歌曲
    const openid = app.globalData.openid // 从全局属性获取openid
    const playHistory = wx.getStorageSync(openid) // 从本地存储获取播放历史数组

    for (let i = 0, len = playHistory.length; i < len; i++) {
      if (playHistory[i].id === currentSong.id) { // 当前播放歌曲已存在播放历史中
        playHistory.splice(i, 1) // 删除原纪录
        break
      }
    }

    playHistory.unshift(currentSong) // 在数组开头插入
    wx.setStorage({ // 存入本地
      key: openid,
      data: playHistory
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
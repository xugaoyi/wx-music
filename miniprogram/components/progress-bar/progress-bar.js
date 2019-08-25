// components/progress-bar/progress-bar.js
let movableWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1
let duration = 0 // 音乐总时长
let isMoving = false
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0 //进度（百分比）
  },

  lifetimes: {
    ready() { // 生命周期函数，组件在视图层布局完成后执行
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) { // 进度条改变时触发（包括手动拖动和播放中都会触发）
      // 触发类型为手动拖拽
      if (event.detail.source === 'touch') {
        // 注意：不是通过setData修改的值不会同步到页面(只是在this.data上新增属性)
        this.data.progress = event.detail.x / movableWidth * 100,
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd() { // 进度条拖动结束

      //设置音乐进度
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      isMoving = false
    },
    _getMovableDis() {
      const query = this.createSelectorQuery() // createSelectorQuery小程序方法，用于查询节点等操作
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((res) => {
        movableWidth = res[0].width - res[1].width // 取得进度条x轴最大偏移量
      })
    },

    // 音乐播放的各种事件
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => { // 播放
        isMoving = false
      })
      backgroundAudioManager.onStop(() => { // 停止

      })
      backgroundAudioManager.onPause(() => { // 暂停

      })
      backgroundAudioManager.onWaiting(() => { // 正在加载
        
      })
      backgroundAudioManager.onCanplay(() => { // 进入可以播放状态
        duration = backgroundAudioManager.duration // 音乐总时长
        if (typeof duration != 'undefined') { // 有概率会出现undefined的情况
          this._setTime()
        } else {
          setTimeout(() => {
            duration = backgroundAudioManager.duration
            this._setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => { // 监听音乐播放进度（仅小程序在前台时执行）
        if (isMoving) { // 是否在拖动
          return
        }
        const currentTime = backgroundAudioManager.currentTime // 当前已经播放的时间
        const sec = currentTime.toString().split('.')[0]
        if (sec != currentSec) { // 性能优化 (因为onTimeUpdate事件每秒约执行4次，频繁的setData影响性能)
          const currentTimeFmt = this._dateFormat(currentTime) // 格式化时间

          this.setData({
            // 进度条圆点的位置更新
            movableDis: movableWidth * currentTime / duration,
            // 进度条白色背景宽度更新
            progress: currentTime / duration * 100,
            // 设置当前播放的时间
            ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
          })
          currentSec = sec
        }
      })
      backgroundAudioManager.onEnded(() => { // 音乐播放结束
        this.triggerEvent('musicEnd') // 触发事件 传给父组件
      })
      backgroundAudioManager.onError((res) => { // 出现错误
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误：' + res.errCode
        })
      })
    },

    // 设置歌曲时长
    _setTime() {
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: durationFmt.min + ':' + durationFmt.sec
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },

    // 补零
    _parse0(v) {
      return v < 10 ? '0' + v : v
    }
  }
})

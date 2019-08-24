// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
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
    progress: 0
  },

  lifetimes: {
    ready() { // 生命周期函数，组件在视图层布局完成后执行
      this._getMovableDis()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getMovableDis() {
      const query = this.createSelectorQuery() // createSelectorQuery小程序方法，用于查询节点等操作
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((res) => {
        movableAreaWidth = res[0].width
        movableViewWidth = res[1].width
      })
    },

    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => { // 播放

      })
      backgroundAudioManager.onStop(() => { // 停止

      })
      backgroundAudioManager.onPause(() => { // 暂停

      })
      backgroundAudioManager.onWaiting(() => { // 正在加载

      })
      backgroundAudioManager.onCanplay(() => { // 进入可以播放状态

      })
    }
  }
})

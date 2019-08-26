// components/lyric/lyric.js
let lyricHeight = 0
let isTouch = false
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },

  // 对数据的监听(数据初次加载完成也会执行)
  observers: {
    lyric(lrc){
      if (lrc == '暂无歌词') {
        this.setData({
          lrcList: [
            {
              lrc,
              time: 10000
            }
          ],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, // 当前高亮歌词索引
    scrollTop: 0
  },

  // 生命周期
  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success(res) { // 获取到手机信息
          // 求出1rpx的大小,64为1行歌词的固定高度
          lyricHeight = res.screenWidth / 750 * 64
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 父组件传递来的事件和参数，歌曲正在播放时不断触发，进行歌词高亮
    update(currentTime) { // currentTime 取得播放进度时间
      let lrcList = this.data.lrcList
      if (lrcList == 0) {
        return
      }
      // 对最后一行歌词无法高亮的处理
      if (currentTime > lrcList[lrcList.length - 1].time) { // 当前播放的时间大于歌词最后一行的时间
        if (isTouch) {
          this.setData({
            nowLyricIndex: lrcList.length - 1
          })
        } else {
          this.setData({
            nowLyricIndex: lrcList.length - 1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for(let i = 0, len = lrcList.length; i < len; i++) {
        if (currentTime <= lrcList[i].time) {
          if (isTouch) {
            this.setData({
              nowLyricIndex: i - 1 // 歌词高亮
            })
          } else {
            this.setData({
              nowLyricIndex: i - 1, // 歌词高亮
              scrollTop: (i - 1) * lyricHeight // 歌词滚动条位置
            })
          }
          break
        }
      }
    },
    scrollTouchStart() {
      clearTimeout(this.data._timer)
      isTouch = true
    },
    scrollTouchEnd() {
      this.data._timer = setTimeout(()=>{
        isTouch = false
      }, 1000)
    },
    // 解析歌词
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      let  _lrcList = []
      line.forEach((elem) => {
        // 匹配 歌词内的时间
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          let lrc = elem.split(time)[1] // 取到每行歌词
          let timeReg = time[0].match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/)
          // 把时间转化成秒
          let time2Sec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000

          // 得到一个 有秒单位对应相应行歌词 的数组
          _lrcList.push({
            lrc,
            time: time2Sec
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})

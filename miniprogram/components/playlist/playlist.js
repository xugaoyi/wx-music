// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist:{
      type: Object
    }
  },

  /**
   * 对数据的监听
   */
  observers: {
    ['playlist.playCount'](count) { // ['playlist.playCount'] 是对playlist对象底下playCount的监听
      this.setData({ // 注意这里不能给当前监听的数据 ['playlist.playCount'] 赋值，否则会造成死循环
        _count: this._tranNunber(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToMusiclist() {
      wx.navigateTo({ // 跳转链接 并传入参数，在目标页面的js中的onLoad方法的options参数接收传入的参数
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },
    _tranNunber(num, point) {
      let numStr = num.toString().split('.')[0] // 去掉小数点后面数
      let numStrL = numStr.length
      if (numStrL < 6) { // 小于10万直接显示
        return numStr
      } else if (numStrL >= 6 && numStrL <= 8) { // 10万以上，1亿以下
        let decimal = numStr.substring(numStrL - 4, numStrL - 4 + point) // 截取字符串，用作小数点后面的数，千位和百位数
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万'
      } else if (numStrL > 8) { // 1亿以上
        let decimal = numStr.substring(numStrL - 8, numStrL - 8 + point) // 截取亿位后2位数
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
    }
  }
})

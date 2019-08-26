// components/musiclist/musiclist.js
const app = getApp() // 全局对象

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array // 父组件传递来的数据
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  // 组件所在页面的生命周期
  pageLifetimes: {
    show() { // 页面被展示时执行
      this.setData({
        playingId: app.getGlobalData('playingMusicId')
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      this.setData({ // 设置当前点中的样式效果
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})

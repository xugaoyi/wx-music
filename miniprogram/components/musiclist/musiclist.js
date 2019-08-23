// components/musiclist/musiclist.js
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

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {
      const musicid = event.currentTarget.dataset.musicid
      this.setData({ // 设置当前点中的样式效果
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicid=${musicid}`,
      })
    }
  }
})

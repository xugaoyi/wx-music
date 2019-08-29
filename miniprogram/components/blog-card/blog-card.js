
import formatTime from '../../utils/formatTime.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object
  },

  // 数据监听
  observers: {
    ['blog.createTime'](val) {
      if (val) {
        this.setData({
          _createTime: formatTime(new Date(val))
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 预览图片
    onPreviewImage(event) {
      const ds = event.target.dataset // 获取标签的自定义属性
      wx.previewImage({
        urls: ds.imgs,
        current: ds.imgsrc,
      })
    }
  }
})

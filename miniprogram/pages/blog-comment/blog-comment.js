import formatTime from '../../utils/formatTime.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog: {},
    commentList: [],
    blogId: '',
    isComment: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      blogId: options.blogId
    })
    this._getBlogDetail()
  },

  // 获取数据
  _getBlogDetail() {
    wx.showLoading({
      title: '加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        blogId: this.data.blogId,
        $url: 'blogDetail'
      }
    }).then((res) => {
      wx.hideLoading()

      let commentList = res.result.commentList.data

      // 时间格式化
      commentList.forEach((item) => {
        item.createTime = formatTime(new Date(item.createTime))
      })

      this.setData({
        commentList,
        blog: res.result.detail[0]
      })

      // 是否有评论
      if(this.data.commentList.length > 0) {
        this.setData({
          isComment: true
        })
      } else {
        this.setData({
          isComment: false
        })
      }
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
    // 对分享卡片的设置
    let blogObj = this.data.blog
    return {
      title: blogObj.content,
      // path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      path: `/pages/blog/blog?blogId=${blogObj._id}&share=1`,
      // imageUrl: '' // 自定义图片，不支持云存储的图片
    }
  }
})
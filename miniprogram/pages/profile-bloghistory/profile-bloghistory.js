// pages/profile-bloghistory/profile-bloghistory.js
const MAX_LIMIT = 10
let blogListLength = 0

const db = wx.cloud.database() // 初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: [],
    isBlog: true, // 是否有博客数据
    isMore: true // 是否还有更多数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getListByCloudFn() // 云函数端获取数据
    // this._getListByMiniprogram() // 小程序端获取数据

    this._getMyBlogListLength() // 获取博客总计数
  },

  // 云函数端获取数据
  _getListByCloudFn() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getListByOpenid',
        start: this.data.blogList.length,
        count: MAX_LIMIT
      }
    }).then((res) => {
      wx.hideLoading()

      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })

      if (this.data.blogList.length === 0) {
        this.setData({
          isBlog: false
        })
      }
      
    })
  },

  // 获取博客总计数
  _getMyBlogListLength() {
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getMyBlogListLength'
      }
    }).then((res) => {
      blogListLength = res.result.total
    })
  },

  // 小程序端查询数据库，享有权限管理的功能
  _getListByMiniprogram() {
    wx.showLoading({
      title: '加载中',
    })

    // 权限管理中设置为‘仅创建者可读写’的话，
    // 不需要传openid的查询条件，能查到的数据仅为当前用户的数据
    db.collection('blog').skip(this.data.blogList.length)
      .limit(MAX_LIMIT).orderBy('createTime', 'desc').get().then((res) => {
      wx.hideLoading()

      // 处理时间格式问题
      let _bloglist = res.data
      _bloglist.forEach((item) => {
        item.createTime = item.createTime.toString()
      })

      this.setData({
        blogList: this.data.blogList.concat(_bloglist)
      })

      if (this.data.blogList.length === 0) {
        this.setData({
          isBlog: false
        })
      }
    })

  },

  // 跳转到博客详情
  goComment(event) {
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
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
    let bl = this.data.blogList.length
    if (bl != blogListLength) {
      this._getListByCloudFn() // 云函数端获取数据
      // this._getListByMiniprogram() // 小程序端获取数据
    } else {
      this.setData({
        isMore: false
      })
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    // 对分享卡片的设置
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      // path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      path: `/pages/blog/blog?blogId=${blogObj._id}&share=1`,
      // imageUrl: '' // 自定义图片，不支持云存储的图片
    }
  }
})
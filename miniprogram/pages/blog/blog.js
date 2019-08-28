// pages/blog/blog.js
let blogListLength = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false, // 控制底部弹出层是否显示
    blogList: [],
    isMore: true // 是否还有更多数据
  },

  //发布功能
  onPublish() {
    // 判断用户是否授权
    wx.getSetting({
      success: (res) => { // 这里使用箭头函数可改变内部this指向为外部的this
        if (res.authSetting['scope.userInfo']) { // 已授权
         wx.getUserInfo({ // 获取用户信息
           success: (res) => { // 这里使用箭头函数可改变内部this指向为外部的this
             this.onLoginSuccess({
               detail: res.userInfo
             })
           }
         })
        } else { // 未授权
          this.setData({ // 打开弹出层，显示获取用户信息按钮
            modalShow: true
          })
        }
      }
    })
  },
  
  // 用户授权成功
  onLoginSuccess(event) {
    const detail = event.detail
    wx.navigateTo({ // 跳转到博客编辑页
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  // 用户拒绝授权
  onLoginFail() {
    wx.showModal({
      title: '授权的用户才能发布',
      content: '',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList(0)
    
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getBlogListLength'
      }
    }).then((res) => {
      blogListLength = res.result.total
    })
  },

  // 加载博客列表数据
  _loadBlogList(start, mode) {

    let loadingTielt = '拼命加载中'
    if (mode === 'refresh') {
      loadingTielt = '正在刷新'
      
      this.setData({
        isMore: true
      })
    }
    wx.showLoading({
      title: loadingTielt,
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        start,
        count: 10,
        $url: 'blogList'
      }
    }).then((res) => {
      if (mode === 'refresh') {
        this.setData({
          blogList: []
        })
      }
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
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
    this._loadBlogList(0,'refresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let bl = this.data.blogList.length
    if (bl != blogListLength){
      this._loadBlogList(bl)
    } else {
      this.setData({
        isMore: false
      })
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
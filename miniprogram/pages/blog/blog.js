// pages/blog/blog.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false // 控制底部弹出层是否显示
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
    console.log(event.detail)
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

  }
})
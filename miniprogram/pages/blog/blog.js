let blogListLength = 0
let keyword = '' // 搜索关键字
const app = getApp()
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
    // 此判断对已存在用户数据时可减少卡顿
    if (Object.keys(app.getGlobalData('userInfo')).length != 0) { // 是否已经授权过并且获取了昵称头像
      this.onLoginSuccess({
        detail: app.getGlobalData('userInfo')
      })
    } else {
      // 判断用户是否授权
      wx.getSetting({
        success: (res) => { // 这里使用箭头函数可改变内部this指向为外部的this
          if (res.authSetting['scope.userInfo']) { // 已授权
            wx.getUserInfo({ // 获取用户信息
              success: (res) => { // 这里使用箭头函数可改变内部this指向为外部的this

                app.setGlobalData('userInfo', res.userInfo) // 设置app全局属性

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
    }
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
      showCancel: false,
      content: '',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.share == 1) { // 从分享卡片进入时
      wx.navigateTo({
        url: `../blog-comment/blog-comment?blogId=${options.blogId}`,
      })
    }

    this._loadBlogList(0) // 加载博客列表

    // // 小程序端调用云数据库示例
    // const db = wx.cloud.database() // 初始化数据库
    // // orderBy 根据createTime字段 deac降序 /asc 升序 查询 
    // db.collection('blog').orderBy('createTime','deac').get().then((res) => {
    //   const data = res.data
    //   data.forEach((item) => { // createTime 字段的类型需要转成字符串 （小程序的坑）
    //     item.createTime = item.createTime.toString()
    //   })
    //   this.setData({
    //     blogList: data
    //   })
    // })
    
    this._getBlogListLength() // 获取博客总计数
  },

  // 搜索
  onSearch(event) {
    keyword = event.detail.keyword
    this.setData({
      blogList: []
    })
    this._loadBlogList(0)
  },

  // 加载博客列表数据
  _loadBlogList(start, mode) {

    let loadingTielt = '拼命加载中'
    if (mode === 'refresh') {
      loadingTielt = '正在刷新'
      this._getBlogListLength() // 获取博客总计数
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
        keyword,
        start,
        count: 15, // 每次加载几条
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

  // 获取博客总计数
  _getBlogListLength() {
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getBlogListLength'
      }
    }).then((res) => {
      blogListLength = res.result.total
    })
  },

  // 进入博客卡片详情
  goComment(event) {
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
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
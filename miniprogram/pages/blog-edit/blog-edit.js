const MAX_WORDS_NUM = 140

const db = wx.cloud.database() // 初始化数据库
let content = '' // 输入的文字内容
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0, // 输入的文字个数
    footerBottom: 0, // 底部栏距离底部位置，为了不被键盘遮挡
    images: [], // 选择的图片
    MAX_IMG_NUM: 9 // 最多能选几张图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) { // options包含url链接的参数： 昵称、头像
    userInfo = options
  },

  // 输入事件
  onInput(event) {
    const detail = event.detail
    let wordsNum = detail.cursor

    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = '最大字数为' + MAX_WORDS_NUM
    }
    this.setData({
      wordsNum
    })
    content = detail.value
  },

  // 获取焦点
  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height // 键盘的高度
    })
  },

  // 失去焦点
  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },

  // 选择图片
  onChooseImage() {
    let maxImg = this.data.MAX_IMG_NUM - this.data.images.length // 还能再选几张图片
    wx.chooseImage({
      count: maxImg, // 还能再选几张图片
      sizeType: ['original', 'compressed'], //所选的图片的尺寸 初始值 and 压缩过的
      sourceType: ['album', 'camera'], // 手机相册选择 and 拍照选择
      success: (res) => { // 箭头函数改变this指向
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
      },
    })
  },

  // 删除图片
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1) // splice会改变原有数组
    this.setData({
      images: this.data.images
    })
  },

  // 全屏预览图片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images, // 图片地址列表
      current: event.target.dataset.imgsrc // 当前预览图片地址
    })
  },

  // 发布
  send() {
    // 验证是否输入内容
    if (content.trim() === '') { // trim() 去掉字符串空格
      // wx.showModal({
      //   title: '请输入内容',
      //   content: '',
      // })
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '发布中',
    })
    /**
     * 实现思路及步骤：
     * 1、图片 -> 上传 云存储  -> 生成 图片fineID（云文件ID） 
     * 2、数据 -> 录入 云数据库
     *    数据包括：文字内容、图片fineID、昵称、头像、发布时间、openId(用户唯一标识，在插入数据库是系统会自动添加_openId字段，不需要另外插入)
     */
    let promiseArr = []
    let fileIds = []
    // 图片上传云存储
    this.data.images.forEach((item) => {
      let p = new Promise((resolve, reject) => {
        let suffix = /\.\w+$/.exec(item)[0] // 文件扩展名(文件后缀)
        wx.cloud.uploadFile({ // 每次只能上传一个文件
          /**
           * cloudPath 云路径。如果路径相同，后上传的文件会覆盖原文件
           * 路径：blog/云存储中的文件夹 + Date.now()时间戳 + Math.random()*1000000随机数 + 文件后缀
           */
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item, // 文件本地临时路径
          success: (res) => {
            fileIds.push(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    })
    
    // 存入云数据库
    Promise.all(promiseArr).then((res) => { // 待文件全部上传完成
      db.collection('blog').add({
        data: {
          ...userInfo, // 昵称、头像
          content, // 内容
          img: fileIds, // 图片fileID列表
          createTime: db.serverDate() // 创建时间，取服务端时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回博客页面，并刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        // 取到上一个页面
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()

      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '抱歉，发布失败',
        icon: 'none'
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
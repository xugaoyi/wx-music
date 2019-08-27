const MAX_WORDS_NUM = 140
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0, // 输入的文字个数
    footerBottom: 0 // 底部栏距离底部位置，为了不被键盘遮挡
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) { // options包含url链接的参数
    console.log(options)
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
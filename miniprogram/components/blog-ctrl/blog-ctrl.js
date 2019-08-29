let userInfo = {}

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  // 调用外部样式
  externalClasses: [
    'iconfont', 'icon-pinglun', 'icon-fenxiang'
  ],

  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false,
    modalShow: false // 是否显示评论输入框
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 评论
    onComment() {
      // 此判断对已存在用户数据时可减少卡顿
      if (Object.keys(userInfo).length != 0) { // 是否已经授权过并且获取了昵称头像
        // 显示评论弹出层
        this.setData({
          modalShow: true
        })
      } else {
        // 判断用户是否授权
        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.userInfo']) { // 已授权
              wx.getUserInfo({ // 获取用户信息（昵称、头像）
                success: (res) => {
                  userInfo = res.userInfo
                  // 显示评论弹出层
                  this.setData({
                    modalShow: true
                  })
                }
              })
            } else { // 未授权
              this.setData({ // 显示授权按钮
                loginShow: true
              })
            }
          }
        })
      }

    },

    // 授权成功
    onLoginSuccess() {
      this.setData({ // 隐藏授权按钮
        loginShow: false
      }, () => { // 回调函数
        // 显示评论弹出层
        this.setData({
          modalShow: true
        })
      })
    },

    // 拒绝授权
    onLoginFail() {
      wx.showModal({
        title: '授权用户才能评论',
        content: '',
      })
    }
  }
})

const app = getApp()
const db = wx.cloud.database()
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
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
    modalShow: false, // 是否显示评论输入框
    isFocus: false,
    content: '', // 输入的评论
    footerBottom: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 评论
    onComment() {
      // 此判断对已存在用户数据时可减少卡顿
      if (Object.keys(app.getGlobalData('userInfo')).length != 0) { // 是否已经授权过并且获取了昵称头像
        // 显示评论弹出层
        this._modalShow()
      } else {
        // 判断用户是否授权
        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.userInfo']) { // 已授权
              wx.getUserInfo({ // 获取用户信息（昵称、头像）
                success: (res) => {

                  app.setGlobalData('userInfo', res.userInfo) // 设置app全局属性

                  // 显示评论弹出层
                  this._modalShow()
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

    // 显示弹出层
    _modalShow() {
      this.setData({
        modalShow: true,
        isFocus: true
      })

    },

    // 授权成功
    onLoginSuccess(event) {
      app.setGlobalData('userInfo', event.detail)
      this.setData({ // 隐藏授权按钮
        loginShow: false
      }, () => { // 回调函数
        this._modalShow()
      })
    },
    
    // 拒绝授权
    onLoginFail() {
      wx.showModal({
        title: '授权的用户才能评论',
        showCancel: false,
        content: '',
      })
    },

    // 获取到焦点
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

    // 发送评论
    onSend(event) {
     
      let formId = event.detail.formId // form提交会产生一个formId
      let content = event.detail.value.content
      if (content.trim() == '') {
        wx.showToast({
          title: '评论内容不能为空',
          icon: 'none'
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true,
      })

       // 插入数据库
      const userInfo = app.getGlobalData('userInfo')
      db.collection('blog-comment').add({ // 小程序端插入数据库，默认带_openId字段
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId, // 对哪条博客进行评论的 blogId
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        // 推送模板消息
        wx.cloud.callFunction({
          name: 'sendMessage',
          data: {
            content,
            formId,
            time: formatTime(new Date(), false),
            blogId: this.properties.blogId
          }
        }).then((res) => {
          console.log(res)
        })

        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          isFocus: false,
          content: '',
        })

        // 父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })
    }

  }
})

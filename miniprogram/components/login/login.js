// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGetUserInfo(event) { // 获取用户信息
      const userInfo = event.detail.userInfo
      if (userInfo) { // 用户允许授权
        this.setData({
          modalShow: false
        })
        this.triggerEvent('loginSuccess', userInfo) // 给父组件传用户数据
      } else { // 用户拒绝授权
        this.triggerEvent('loginFail')
      }
    }
  }
})
let keyword = ''

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: { // 占位符
      type: String,
      value: '请输入关键字'
    }
  },

  // 组件外部样式
  externalClasses: [
    'iconfont',
    'icon-sousuo'
  ],


  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      keyword = event.detail.value
    },
    onSearch() {
      this.triggerEvent('search',{ // 把搜索事件抛给父组件，提高组件的可重用性
        keyword
      })
    }
  }
})

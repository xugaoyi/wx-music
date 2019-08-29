// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database() // 初始化数据库
const blogCollection = db.collection('blog') // 博客的数据库集合

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event }) // 初始化TcbRouter

  // 获取博客列表
  app.router('blogList', async (ctx, next) => {
    const keyword = event.keyword // 搜索关键字
    let w = {}
    if (keyword.trim() != '') {
      w = {
        content: db.RegExp({ // 正则
          regexp: keyword,
          options: 'i' // i表示忽略大小写
        })
      }
    }

    // where查询条件 skip 从第几条开始查，limit 查几条数据，orderBy(排序字段，排序方式) 排序，排序方式desc降序/asc升序
    ctx.body =  await blogCollection.where(w).skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc').get().then((res) => {
      return res.data
    })
    
  })
  
  // 获取博客列表总长度
  app.router('getBlogListLength', async (ctx, next) => {
    ctx.body = await blogCollection.count()
  })

  return app.serve() // 必需返回
}
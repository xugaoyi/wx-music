// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database() // 初始化数据库
const blogCollection = db.collection('blog') // 博客的数据库集合
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  }) // 初始化TcbRouter

  // 获取博客列表
  app.router('blogList', async(ctx, next) => {
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
    let data = await blogCollection.where(w).skip(event.start).limit(event.count)
      .orderBy('createTime', 'desc').get().then((res) => {
        return res.data
      })

    // 获取评论条数
    let commentCount = {}
    for(let i=0;i<data.length;i++){
      commentCount = await db.collection('blog-comment').where({
        blogId: data[i]._id
      }).count()
      // 不能直接在.count()后面添加 total，因为是异步函数，没获取到数据直接添加total取到的是undefined
      data[i].commentLength = commentCount.total
    }

    ctx.body = data
  })

  // 获取博客列表总长度
  app.router('getBlogListLength', async(ctx, next) => {
    ctx.body = await blogCollection.count()
  })

  // 博客详情(博客内容、评论)
  app.router('blogDetail', async(ctx, next) => {
    let blogId = event.blogId

    // 博客内容
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })

    // 评论查询
    const countResult = await db.collection('blog-comment').count()
    const total = countResult.total
    let commentList = {
      data: []
    }
    if (total > 0) {
      // 突破100条限制
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT).where({
            blogId
          }).orderBy('createTime', 'desc').get()
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }

    }
    ctx.body = {
      detail,
      commentList
    }
  })

  return app.serve() // 必需返回
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router') // 引入tcb-router 

const rp = require('request-promise') // 向服务器发送请求的依赖

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event}) // 初始化tcb-router

  /**
   * 查询playlist数据：
   * 
   * 参数：event包含调用此函数时传过来的参数
   * 
   * cloud.database() 初始化数据库
   * .collection('playlist') 获取数据库集合playlist
   * .skip() 从第几条开始查询
   * .limit() 查询几条数据
   * .orderBy(fieldName: string, order: string) 排序 参数：字段名 排序方式：asc升序/desc降序
   * .get() 获取数据
   */
  //未使用tcb-router的方式
  // return await cloud.database().collection('playlist')
  // .skip(event.start)
  // .limit(event.count)
  // .orderBy('createTime', 'desc')
  // .get()
  // .then((res) => {
  //   return res
  // })

  // 获取歌单列表
  app.router('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })

  // 获取歌单列表总长度
  app.router('getPlaylistLength', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist').count()
  })

  // 根据歌单id获取歌曲列表
  app.router('musiclist', async (ctx, next) => {
    // 向服务器发送请求
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
    .then((res) => {
      return JSON.parse(res)
    })
  })

  // 获取歌曲链接
  app.router('musicUrl', async (ctx, next) => {
    ctx.body = await rp(`${BASE_URL}/song/url?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  // 加载歌词
  app.router('lyric', async (ctx, next) => {
    ctx.body = await rp(`${BASE_URL}/lyric?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  // 别忘了返回app.serve()哦
  return app.serve() 
}
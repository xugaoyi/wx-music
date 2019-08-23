// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database() // 初始化数据库

const rp = require('request-promise') // 需安装依赖包 npm i -S request & npm i -S request-promise

const URL = 'http://musicapi.xiecheng.live/personalized' // 第三方服务器地址（老师从网易云获取的数据部署在其服务器，每天的数据会更新）

const playlistCollection = db.collection('playlist') // 获取到数据库playlist集合

const MAX_LIMIT = 100 // 定义常量-获取数据库条数最大的限制

// 云函数入口函数
exports.main = async (event, context) => {
  /**
   * 注：
   * - 关于数据库的操作都是异步操作，都需添加await关键字
   * - console.log 打印在云开发控制台 云函数测试内查看，或再云函数日志查看打印记录
   * - 单次获取数据库数据有条数限制，云函数端最多获取100条，小程序端最多获取20条
   */

  // const list = await playlistCollection.get() // 获取数据库集合的数据 （因为有条数限制，不直接用此方法）
  
  // 突破条数限制 （为了读取到全部数据然后与第三方服务器获取的数据进行对比去重）
  const countResult = await playlistCollection.count() // 获取数据总条数 返回为对象
  const total = countResult.total // 取得总条数
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for(let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get() // 从第 skip 条开始取，最多取 limit 条数据
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => { // reduce数组方法 累积拼接
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

 
  // 获取第三方服务器端数据
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })

  // 数据库与服务器数据对比去重（数据已存在数据库的无需再重复添加）
  const newData = []
  for(let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for(let j = 0, len2 = list.data.length; j < len2; j++) {
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }

  // 把数据插入数据库，需要单条插入
  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection.add({ // 给数据库集合添加数据
      data: {
        ...newData[i],
        createTime: db.serverDate(), // db.serverDate() 获取服务器时间
      }
    }).then((res) => { // 数据添加成功
      console.log('数据添加成功')
    }).catch((err) => { // 失败
      console.error(err)
    })
  }

  return newData.length // 插入多少条数据
}
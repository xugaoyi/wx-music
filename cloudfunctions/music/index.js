// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
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
  return await cloud.database().collection('playlist')
  .skip(event.start)
  .limit(event.count)
  .orderBy('createTime', 'desc')
  .get()
  .then((res) => {
    return res
  })
}
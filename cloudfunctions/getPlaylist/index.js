// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const rp = require('request-promise') // 需安装依赖包

const URL = 'http://musicapi.xiecheng.live/personalized'

// 云函数入口函数
exports.main = async (event, context) => {
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  console.log(playlist)
}
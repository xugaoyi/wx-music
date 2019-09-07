// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID, // 链接参数 不一定传openid，可传其他任意数据，然后通过此数据，在别人扫码进入时就可用于判断
    // page: "pages/blog/blog" // 默认进入主页
    // lineColor: { // 线条颜色
    //   'r': 211,
    //   'g': 60,
    //   'b': 57
    // },
    // isHyaline: true // 是否透明
  })
  
  // result为二进制数据, 先上传到云存储

  // 上传云存储
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/qrcode' + Date.now() + Math.random() + '.png',
    fileContent: result.buffer
  })

  return upload.fileID
}
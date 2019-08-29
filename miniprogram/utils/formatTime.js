// 时间格式化 模块封装
module.exports = (date) => { // date 数据格式为 date

  let day = showText(date) // 判断今天、昨天、前天
  let fmt = ''
  let o = {}

  if (day != '') {
    fmt = 'hh:mm'
    o = {
      'h+': date.getHours(),
      'm+': date.getMinutes()
    }
  } else {
    fmt = 'yyyy年MM月dd日hh:mm' // 预定格式
    o = {
      // + 正则中的1个或多个
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes()
    }
    if (/(y+)/.test(fmt)) {
      // $1 表示正则中的第一个，即(y+)
      fmt = fmt.replace(RegExp.$1, date.getFullYear()) // replace 替换
    }
  }

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, o[k].toString().length === 1 ? '0' + o[k] : o[k])
    }
  }

  return day + fmt
}


// 判断今天、昨天、前天
function showText(date) {
  let today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  // today 为今天凌晨的时间
  let dayTime = 24 * 60 * 60 * 1000
  let delta = today - date // 得到相差的时间 ms
  if (delta > 0) {
    if (delta <= dayTime) {
      return '昨天'
    } else if (delta <= 2 * dayTime) {
      return '前天'
    }
  } else if (-delta < dayTime) {
    return '今天'
  }
  return ''
}
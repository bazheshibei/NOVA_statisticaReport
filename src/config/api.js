// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
// const host = '/api_d/'
// const host = '/api_t/'
const host = '/api_f/' // 83服务器
// const host = '/api_x/' // 80服务器
// const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '指标': 'statisticalTypeShowAction.ndo?action=getStatisticsReportList',
  '数据': 'statisticalTypeShowAction.ndo?action=getCustomStatistics',
  '合计': 'statisticalTypeShowAction.ndo?action=getCustomStatisticsTotalQuantity',
  '删除': 'statisticalTypeShowAction.ndo?action=deleteStatisAccessories'
}

/**
 * [请求接口时，如果需要 loading 效果时，显示的文字]
 */
// const Loading = {
//   '下单接口': '下单中...'
// }

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request

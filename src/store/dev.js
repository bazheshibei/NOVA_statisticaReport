
// import Tool from './tool.js'
import LocalData from '@/localData/data.js'

/**
 * 本地开发代码
 * @ [调用本地数据]
 * @ [不请求接口]
 */
const Dev = {}

/**
 * [请求：指标]
 */
Dev.A_getCode = function (state, commit, dispatch, that) {
  const self = this
  const res = LocalData['指标_other'] || []
  /* 返回：整理后的指标数组 */
  const searchData = {} //    指标
  const oldList = [] //       指标原始数据：高级查询用到
  const asdObj = {} //        合并单元格用到
  const reportCodeObj = {} // 请求数据用到
  res.forEach((item, index) => {
    const { indicatorlist = [], report_code, report_name } = item
    indicatorlist.forEach((val, key) => {
      const { indicator_name, indicator_code, type_code } = val
      val.label = indicator_name
      val.code = indicator_code
      /* 指标：searchData */
      if (!searchData[item.report_name]) {
        searchData[item.report_name] = []
      }
      val.columnKey = val.type_code === 'dh_relate' || val.type_code === 'kf_relate' || val.type_code === 'sj_relate' || val.type_code === 'customerorder_info' ? 1 : 0
      searchData[item.report_name].push(val)
      /* 指标原始数据 */
      if (key === 0) {
        item.code = type_code
        item.label = report_name
      }
      /* 记录：是否合并 */
      if (String(val.secondtype) === '1') {
        if (!asdObj[report_name]) {
          asdObj[report_name] = {}
        }
        asdObj[report_name][val.indicator_code] = true
      }
    })
    oldList.push(item)
    reportCodeObj[report_name] = report_code
  })
  /* 默认选中过去一年 */
  const [start, end] = self._returnAFewDaysAgo(365)
  const time_1 = self._returnYearMonthDay(start)
  const time_2 = self._returnYearMonthDay(end)
  const searchTime = {}
  /* 赋值 */
  console.log('指标 ----- res:', res, oldList)
  state.asdObj = Object.assign({}, asdObj)
  state.searchData = Object.assign({}, searchData)
  state.reportCodeObj = Object.assign(({}, reportCodeObj))
  state.oldList = oldList
  if (oldList.length) {
    state.active = oldList[0].report_name
    oldList.forEach(item => {
      searchTime[item.report_name] = [time_1, time_2]
    })
    state.searchTime = Object.assign({}, searchTime)
  }
  /* 请求：数据 */
  dispatch('A_getData', { operationType: 'search', isLoading: true })
}

/**
 * [请求：数据]
 */
Dev.A_getData = function (state, commit, getters, dispatch, params) {
  const { operationType = 'search' } = params // 'export' 导出
  const { active } = state

  const { searchData } = state
  console.log('searchData ----- ', searchData[active])

  // const { searchTime = {} } = state
  // const [tttreport_begin_time, tttreport_end_time] = searchTime[active] || []

  // const { pagenum, rownum, searchText, searchHeader, advancedQuery: advancedQueryArr } = state
  // const columncondition = JSON.stringify(Tool.returnColumncondition(state))
  // const itemname = searchText.trim() || ''
  // const searchcontent = JSON.stringify(searchHeader[active])
  // const advancedQuery = JSON.stringify(advancedQueryArr[active])
  // const obj = {
  //   operationType, //                                          搜索 || 导出
  //   columncondition, //                                        { 大类: [{ 指标 }] }
  //   pagenum, //                                                页数
  //   rownum, //                                                 每页条数
  //   itemname, //                                               项目名称
  //   searchcontent, //                                          表头搜索
  //   advancedQuery //                                           高级查询
  // }
  // console.log('数据 ----- obj:', obj)

  const res = LocalData['其他数据'] || {} // 单行数据, 合并数据, 其他数据
  console.log('数据 ----- res:', res)
  const typeObj = { search: 'is_A_search', export: 'is_A_export' }
  //
  state[typeObj[operationType]] = true //                       可以：搜索 / 导出
  state.isLoading = false //                                    关闭：加载动画
  const { datalist, datanum = 0 } = res
  state.pageCount[active] = datanum //                          赋值：总条数
  state.dataList[active] = datalist === null ? [] : datalist // 赋值：表格数据
  state.countData[active] = {} //                               重置：合计
}

/**
 * [请求：合计]
 */
Dev.A_count = function (state, commit, getters, dispatch) {
  const res = LocalData['合计'] || {}
  state.is_A_count = true // 是否：可以合计
  state.countData = res //   赋值：合计数据
}

/**
 * [请求：删除文件]
 */
Dev.A_exportDelete = function () {
  const path = localStorage.getItem('NOVA_total_export_path') || ''
  if (path.length) {
    console.log('要删除的文件地址： ', path)
  }
}

/**
 * [返回：几天前]
 * @param  {[Int]}  num                          天数
 * @return {[type]} ['2020-01-01', '2020-02-01'] 起始日期
 */
Dev._returnAFewDaysAgo = function (num) {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * num)
  return [start, end]
}

/**
 * [提取：年月日]
 */
Dev._returnYearMonthDay = function (strOrNum) {
  const d = new Date(strOrNum)
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}

export default Dev

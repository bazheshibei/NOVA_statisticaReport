
import Api from '@/config/api'
import Tool from './tool.js'

/**
 * 生产环境代码
 */
const Prod = {}

/**
 * [请求：指标]
 */
Prod.A_getCode = function (state, commit, dispatch, that) {
  /** 请求：删除文件 **/
  dispatch('A_exportDelete')
  /* 发送请求 */
  const name = '指标'
  const suc = function (res) {
    // console.log('指标_other ----- ', res)
    // localStorage.setItem('指标_other', JSON.stringify(res))
    /* 返回：整理后的指标数组 */
    const searchData = {} // 指标
    const oldList = [] //    指标原始数据：高级查询用到
    const pagenum = {} //    页数
    const rownum = {} //     每页条数
    const pageCount = {} //  总条数
    const isGaoJi = {} //    是否可以高级查询
    res.forEach((item, index) => {
      const { indicatorlist = [], report_name } = item
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
          isGaoJi[report_name] = true
        }
      })
      oldList.push(item)
      /* 分页 */
      pagenum[item.report_name] = 1
      rownum[item.report_name] = 10
      pageCount[item.report_name] = 0
    })
    /* 赋值 */
    state.searchData = Object.assign({}, searchData)
    state.pagenum = Object.assign({}, pagenum)
    state.rownum = Object.assign({}, rownum)
    state.pageCount = Object.assign({}, pageCount)
    state.isGaoJi = Object.assign({}, isGaoJi)
    state.oldList = oldList
    if (oldList.length) {
      state.active = oldList[0].report_name
    }
    /* 请求：数据 */
    commit('assignData1', { name: 'isLoading', obj: true })
    dispatch('A_getData', { operationType: 'search', isLoading: true })
  }
  Api({ name, obj: {}, suc, loading: '正在获取指标' })
}

/**
 * [请求：数据]
 */
Prod.A_getData = function (state, commit, getters, dispatch, params) {
  const { operationType = 'search' } = params // 'export' 导出
  const typeObj = { search: 'is_A_search', export: 'is_A_export' }
  if (state[typeObj[operationType]] === true) { // 可以[搜索 || 导出]
    state[typeObj[operationType]] = false
    /** 请求：删除文件 **/
    dispatch('A_exportDelete')
    /* 整理数据 */
    const { active, pagenum, rownum, searchText, searchHeader, advancedQuery: advancedQueryArr } = state
    const columncondition = JSON.stringify(Tool.returnColumncondition(state))
    const itemname = searchText[active] ? searchText[active].trim() : ''
    const searchcontent = JSON.stringify(searchHeader[active])
    const advancedQuery = JSON.stringify(advancedQueryArr[active])
    /* 请求 */
    const name = '数据'
    const method = 'post'
    const obj = {
      operationType, //            搜索 || 导出
      statisticsIndexNum: '', //   { name: 大类数组, color: 颜色数组 }
      columncondition, //          { 大类: [{ 指标 }] }
      pagenum: pagenum[active], // 页数
      rownum: rownum[active], //   每页条数
      itemname, //                 项目名称
      searchcontent, //            表头搜索
      advancedQuery //             高级查询
    }
    if (operationType === 'search') {
      /* 搜索 */
      const suc = function (res) {
        // console.log('数据_other ----- res:', res)
        // localStorage.setItem('数据_other', JSON.stringify(res))
        state[typeObj[operationType]] = true //                                                可以：搜索 / 导出
        const { datalist, datanum = 0 } = res
        commit('assignData1', { name: 'isLoading', obj: false }) //                            关闭：加载动画
        commit('assignData1', { name: 'pageCount', obj: datanum }) //                          赋值：总条数
        commit('assignData1', { name: 'dataList', obj: datalist === null ? [] : datalist }) // 赋值：表格数据
        commit('assignData1', { name: 'countData', obj: {} }) //                               重置：合计
      }
      Api({ name, obj, suc, method, loading: '请求数据中...' })
    } else if (operationType === 'export') {
      /* 导出 */
      const suc = function (res) {
        state[typeObj[operationType]] = true //                           可以：搜索 / 导出
        commit('assignData1', { name: 'isLoading', obj: false }) //       关闭：加载动画
        localStorage.setItem('NOVA_total_other_export_path', res.data) // 保存：文件地址
        /* 下载 */
        // const host = 'http://10.10.0.226:8080/nova'
        const host = window.location.origin + '/nova'
        const a = document.createElement('a')
        a.href = host + res.data
        a.download = '统计报表'
        a.click()
      }
      Api({ name, obj, suc, method })
    }
  }
}

/**
 * [请求：合计]
 */
Prod.A_count = function (state, commit, getters, dispatch) {
  if (state.is_A_count === true) { // 可以合计
    state.is_A_count = false
    /** 请求：删除文件 **/
    dispatch('A_exportDelete')
    /* 整理数据 */
    const { active, pagenum, rownum, searchText, searchHeader, advancedQuery: advancedQueryArr } = state
    const columncondition = JSON.stringify(Tool.returnColumncondition(state))
    const itemname = searchText[active] ? searchText[active].trim() : ''
    const searchcontent = JSON.stringify(searchHeader[active])
    const advancedQuery = JSON.stringify(advancedQueryArr[active])
    /* 请求 */
    const name = '合计'
    const method = 'post'
    const obj = {
      columncondition, //          { 大类: [{ 指标 }] }
      pagenum: pagenum[active], // 页数
      rownum: rownum[active], //   每页条数
      itemname, //                 项目名称
      searchcontent, //            表头搜索
      advancedQuery //             高级查询
    }
    const suc = function (res) {
      // console.log('合计 ----- res:', res)
      // localStorage.setItem('合计', JSON.stringify(res))
      state.is_A_count = true //                                是否：可以合计
      commit('assignData1', { name: 'countData', obj: res }) // 赋值：合计数据
    }
    Api({ name, obj, suc, method })
  }
}

/**
 * [请求：删除文件]
 */
Prod.A_exportDelete = function () {
  const path = localStorage.getItem('NOVA_total_other_export_path') || ''
  if (path.length) {
    const name = '删除'
    const obj = { filePath: encodeURI(path) }
    const suc = function (res) {
      localStorage.removeItem('NOVA_total_other_export_path')
    }
    Api({ name, obj, suc })
  }
}

export default Prod

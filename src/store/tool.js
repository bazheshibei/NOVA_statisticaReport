
const Tool = {}

/**
 * [返回：请求数据时的 columncondition 字段]
 */
Tool.returnColumncondition = function (state) {
  const { oldList = [], active = '' } = state
  const obj = {}
  oldList.forEach(item => {
    if (item.report_name === active) {
      const { indicatorlist = [] } = item
      indicatorlist.forEach(val => {
        const { type_code = '', indicator_code = '', indicator_name = '' } = val
        if (!obj[type_code]) {
          obj[type_code] = []
        }
        obj[type_code].push({ statistics_field_name: indicator_code, statistics_remark: indicator_name })
      })
    }
  })
  return obj
}

/** ----- getters ----- **/

/**
 * [表格数据]
 */
Tool._tableData = function (state) {
  const that = this
  const { dataList = {}, active = '' } = state
  const columncondition = this.returnColumncondition(state)
  const activeData = dataList[active] || []
  let list = []
  /* 循环：原始数据 */
  activeData.forEach(function (item, index) { // item: 单束原始数据：单条  index: 单束数据索引
    const arr = that._tableRow(item, columncondition, index) /** 表格：单束数据 **/
    arr[0].arrLength = arr.length
    list = list.concat(arr)
  })
  return list
}

/**
 * [表格：单束数据]
 * @param {[Object]} item [原始数据：单条]
 * @param {[Object]} data [选中：大类]
 * @param {[Int]}   index [原始数据：索引]
 */
Tool._tableRow = function (item, data, index) {
  const { custom_dress_series_name, custom_name, mr_dh_item_name, dress_type_name, style_name } = item
  const fixedData = { custom_dress_series_name, custom_name, mr_dh_item_name, dress_type_name, style_name, index } // 每条的固定数据
  const otherData = {} //                                                                                             抽取的数据
  const returnList = [] //                                                                                            返回的数据
  for (const x in data) {
    const val = data[x] || [] // 选中的大类： x = dh_relate, val = [{ type_code: 'dh_relate', type_name: '大货相关', statistics_field_name: 'dh_item_status', statistics_remark: '项目状态' }]
    if (item[x] === null || !item[x]) {
      /* 不存在 */
    } else if (item[x].length) {
      /* 抽取数据：数组 */
      const list = this._forEachArr(item[x], val) /** 抽取数据：数组 **/
      list.forEach(function (val, key) {
        if (!returnList[key]) {
          returnList[key] = { key }
        }
        returnList[key] = Object.assign({}, returnList[key], fixedData, val)
      })
    } else {
      /* 抽取数据：对象 */
      val.forEach(function (str) {
        otherData[str.statistics_field_name] = item[x][str.statistics_field_name] || ''
      })
    }
  }
  if (Object.keys(otherData).length) {
    /* 抽取的数据：有 (抽取数据：对象) */
    if (returnList.length) {
      const list = []
      returnList.forEach(function (val, key) {
        list.push(Object.assign({}, val, { key }, otherData))
      })
      return list
    } else {
      return [Object.assign({}, otherData, fixedData)]
    }
  } else if (returnList.length) {
    /* 抽取数据：数组 */
    return returnList
  } else {
    /* 抽取的数据：无 */
    return [fixedData]
  }
}

/**
 * [抽取数据：数组]
 * @param  {[Array]} attrArr   [原始数据：单条 -> 某一数组属性]
 * @param  {[Array]} selectArr [选中的大类 -> 某一下拉框的选项]
 * @return {[Array]} list      [原始数据中，符合下拉框选项的数据]
 */
Tool._forEachArr = function (attrArr, selectArr) {
  const list = [] // 此数组属性中，符合下拉选项的数据
  attrArr.forEach(function (obj) {
    const data = {}
    let isPush = false // 是否 push
    selectArr.forEach(function (str) {
      data[str.statistics_field_name] = obj[str.statistics_field_name] || ''
      if (obj[str]) {
        isPush = true
      }
    })
    /* [原始数据：单条 -> 某一数组属性]  单条数据中全空则不录用 */
    if (isPush) {
      list.push(data)
    }
  })
  return list
}

/**
 * [是否变化：表头]
 */
Tool._changeHeader = function (state) {
  let headerStatus = false
  const { searchHeader, active } = state
  const obj = searchHeader[active] || {}
  for (const x in obj) {
    if (obj[x]) {
      headerStatus = true
      break
    }
  }
  return headerStatus
}

export default Tool

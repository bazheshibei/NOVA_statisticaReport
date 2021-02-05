
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
    const val = data[x] || [] // 选中的大类： x = badorder_info, val = ['bad_bearer_type', 'bad_bearer_name']
    let objOrArr = item[x] //    数据中的大类对象或数组
    if (x === 'purchasedeliver_info' || x === 'purchaseorder_info') {
      objOrArr = item['material_info'] || [] // purchasedeliver_info 和 purchaseorder_info 用 material_info 的数据
    }
    if (objOrArr === null || !objOrArr) {
      /* 不存在 */
    } else if (objOrArr.length) {
      /* 抽取数据：数组（其他大类） */
      const list = this._forEachArr(objOrArr, val, x) /** 抽取数据：数组 **/
      list.forEach(function (val, key) {
        if (!returnList[key]) {
          returnList[key] = { key }
        }
        returnList[key] = Object.assign({}, returnList[key], fixedData, val)
      })
    } else {
      /* 抽取数据：对象（大货、开发、设计相关） */
      val.forEach(function (str) {
        otherData[str.statistics_field_name] = objOrArr[str.statistics_field_name] !== null ? objOrArr[str.statistics_field_name] : ''
      })
    }
  }
  /* ----- 导出 ----- */
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
 * @param  {[Array]}  attrArr   [原始数据：单条 -> 某一数组属性]
 * @param  {[Array]}  selectArr [选中的大类 -> 某一下拉框的选项]
 * @param  {[String]} code_p    [大类code] purchasedeliver_info、purchaseorder_info、material_info 匹配不到导出空对象
 * @return {[Array]} list      [原始数据中，符合下拉框选项的数据]
 */
Tool._forEachArr = function (attrArr, selectArr, code_p) {
  const list = [] //  此数组属性中，符合下拉选项的数据
  if (code_p === 'purchasedeliver_info' || code_p === 'purchaseorder_info' || code_p === 'material_info') {
    /* ----- 相关联的三个大类 ----- */
    let asd_id = ''
    let asd_num = 1
    let asd_index = 0
    attrArr.forEach(function (obj, index) {
      const data = {}
      selectArr.forEach(function (str) {
        data[str.statistics_field_name] = obj[str.statistics_field_name] !== null ? obj[str.statistics_field_name] : ''
      })
      list.push(data)
      /* ----- 统计合并 ----- */
      const countObj = {
        material_info: {
          name_1: 'mi_system_material_statistics_id',
          name_2: 'asd_mi'
        },
        purchaseorder_info: {
          name_1: 'puro_purchase_order_detail_id',
          name_2: 'asd_puro'
        }
      }
      const { name_1 = '', name_2 = '' } = countObj[code_p] || {}
      if (name_1) {
        if (asd_id && asd_id !== obj[name_1]) {
          /* ----- 遇到新的ID ----- */
          /* 记录上一模块的合并数据 */
          list[asd_index][name_2] = asd_num // 添加合并记录
          if (obj[name_1]) {
            /* 当前行__有值：重新计算合并 */
            asd_id = obj[name_1] // 重新记录：值
            asd_num = 1 //          重新记录：合并行数
            asd_index = index //    重新记录：合并起始行索引
          } else {
            /* 当前行__没值：记录当前模块合并数据 && 重新计算合并 */
            list[index][name_2] = 1 // 添加合并记录
            asd_id = '' //             重新记录：值
            asd_num = 1 //             重新记录：合并行数
            asd_index = index + 1 //   重新记录：合并起始行索引
          }
        } else if (asd_id && asd_id === obj[name_1]) {
          /* ----- 相同ID，合并记录+1 ----- */
          asd_num += 1
        } else if (!asd_id) {
          /* ----- asd_id === ''时 ----- */
          if (obj[name_1]) {
            /* 当前行__有值：记录当前的 值 和 index */
            asd_id = obj[name_1] // 记录：值
            asd_index = index //    记录：合并起始行索引
          } else {
            // 当前行__没值：记录当前模块合并数据
            list[index][name_2] = 1 // 添加合并记录
            asd_id = '' //             重新记录：合并行数
            asd_num = 1 //             重新记录：合并行数
          }
        }
        if (index === attrArr.length - 1) {
          /* 添加合并记录 */
          list[index][name_2] = asd_num
        }
      }
    })
  } else {
    /* ----- 其他大类 ----- */
    attrArr.forEach(function (obj) {
      const data = {}
      let isPush = false // 是否 push
      selectArr.forEach(function (str) {
        data[str.statistics_field_name] = obj[str.statistics_field_name] !== null ? obj[str.statistics_field_name] : ''
        if (obj[str.statistics_field_name] !== null) {
          isPush = true
        }
      })
      /* [原始数据：单条 -> 某一数组属性]  单条数据中全空则不录用 */
      if (isPush) {
        list.push(data)
      }
    })
  }
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

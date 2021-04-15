
import Vue from 'vue'
import Vuex from 'vuex'
import Dev from './dev.js' //   本地开发代码
import Prod from './prod.js' // 生产环境代码
import Tool from './tool.js'
Vue.use(Vuex)

const store = new Vuex.Store({

  state: {
    nowCodeType: 'Prod', //     当前代码类型
    codeObj: { Dev, Prod }, // 代码类型 { Dev: '开发', Prod: '生产' }
    /* 接口返回 */
    oldList: [], //       指标原始数据
    searchData: {}, //    指标
    reportCodeObj: {}, // report_code 请求数据用到
    //
    asdObj: {}, //        需要合并的指标 { 指标code: true }
    dataList: {}, //      表格数据[未处理] *
    /* 页面操作 */
    active: '', //        当前激活的页签
    activeNum: 1, //      递增，重新渲染表格
    activeCode: '', //    当前激活的页签的 code：高级查询用
    tableHeight: 0, //    表格高度
    isGaoJi: {}, //       是否可以高级查询 { 设计相关： true }
    searchText: '', //    搜索：input *
    searchTime: {}, //    搜索：起始日期 *
    searchHeader: {}, //  搜索：表头 *
    /* 高级查询 */
    isDialog: {}, //      是否显示：高级查询 *
    advancedQuery: {}, // 查询条件 *
    /**/
    tableSignArr: [], //  表格签名数组  [用于下拉框选项变更后，生成新的表格]
    /* 加载中 */
    isLoading: {},
    /* 合计 */
    countData: {}, //     合计数据 *
    /* 导出 */
    // exportSelect: { // 导出用到的，下拉选项数据
    //   dh_relate: [{ statistics_field_name: 'dh_item_name', statistics_remark: '项目名称' }]
    // },
    /* 分页 */
    pagenum: {}, //       页数 *
    rownum: {}, //        每页条数 *
    pageCount: {}, //     总条数 *
    /* 状态 */
    is_A_search: true, // 是否可以：搜索
    is_A_export: true, // 是否可以：导出
    is_A_count: true //   是否可以：合计
  },
  getters: {
    /**
     * [表格数据]
     */
    tableData: state => {
      const arr = Tool._tableData(state)
      if (arr.length) {
        state.activeNum += 1
      }
      return arr
    },
    /**
     * [是否需要：搜索]
     */
    isSearch: (state, getter) => {
      const { changeHeader, tableData } = getter
      return changeHeader || !tableData.length // 表头变化 || 没有表格数据
    },
    /**
     * [是否变化：表头]
     */
    changeHeader: state => {
      return Tool._changeHeader(state)
    },
    /**
     * [表头签名]
     */
    tableSign: state => {
      state.tableSignArr.push(1)
      return state.tableSignArr.length
    }
  },

  mutations: {
    /**
     * [保存数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    saveData(state, params) {
      const { name, obj } = params
      state[name] = obj
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    assignData(state, params) {
      const { name, obj } = params
      const data = state[name] || {}
      state[name] = Object.assign({}, data, obj)
    },
    assignData1(state, params) {
      const { name, obj } = params
      const { active } = state
      const data = state[name] || {}
      if (!data[active]) {
        data[active] = {}
      }
      data[active] = obj
      state[name] = Object.assign({}, data)
    },
    /**
     * [添加数据：二级]
     * @param {[String]} name  属性名
     * @param {[Object]} obj   属性值
     * @param {[String]} index 二级属性
     */
    assignData2(state, params) {
      const { name, obj, index } = params
      const { active } = state
      const data = state[name] || {}
      if (!data[active]) {
        data[active] = {}
      }
      if (!data[active][index]) {
        data[active][index] = {}
      }
      data[active][index] = Object.assign({}, data[active][index], obj)
      data[active] = Object.assign({}, data[active])
      state[name] = Object.assign({}, data)
    }
  },
  actions: {
    /**
     * [请求：指标]
     */
    A_getCode({ state, commit, dispatch }, { that }) {
      state.codeObj[state.nowCodeType].A_getCode(state, commit, dispatch, that)
    },
    /**
     * [请求：数据]
     */
    A_getData({ state, commit, dispatch, getters }, params = {}) {
      state.codeObj[state.nowCodeType].A_getData(state, commit, getters, dispatch, params)
    },
    /**
     * [请求：合计]
     */
    A_count({ state, commit, dispatch, getters }) {
      state.codeObj[state.nowCodeType].A_count(state, commit, getters, dispatch)
    },
    /**
     * [请求：删除文件]
     */
    A_exportDelete({ state }) {
      state.codeObj[state.nowCodeType].A_exportDelete()
    },
    /**
     * [查询 / 导出]
     */
    search({ state, dispatch }, params = {}) {
      /** 请求：数据 **/
      const { operationType, isLoading } = params
      dispatch('A_getData', { operationType, isLoading })
    }
  }
})

export default store

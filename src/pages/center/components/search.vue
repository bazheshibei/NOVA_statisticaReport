
<!-- 搜索模块 -->
<template>
  <el-collapse-transition>
    <div class="comBox">

      <!-- 项目名称 -->
      <div class="searchBox">
        <div class="searchName">项目名称：</div>
        <el-input class="nameInput" size="mini" v-model="projectName" placeholder="多个查询空格分隔" @input="inputProjectName"></el-input>
      </div>

      <!-- 起始日期 -->
      <!-- 还 -->
      <!-- 没 -->
      <!-- 传 -->
      <div class="searchBox" style="width: 350px;">
        <div class="searchName">起始日期：</div>
        <el-date-picker size="mini" type="daterange" unlink-panels value-format="yyyy-MM--dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
          v-model="time" @change="changeTime"
        >
        </el-date-picker>
      </div>
      <!-- 按钮组 -->
      <div class="searchBtnBox">
        <!-- 查询禁用：不能搜索 -->
        <el-button type="primary" size="mini" :plain="!isSearch" :disabled="!is_A_search" @click="submit({ operationType: 'search' })">
          查询 <i class="el-icon-search"></i>
        </el-button>
        <!-- 高级查询禁用：不能搜索 -->
        <el-button type="primary" size="mini" :plain="!isSearch" :disabled="!is_A_search || !isGaoJi[active]" @click="showAdvancedQuery">
          高级查询 <i class="el-icon-s-tools"></i>
        </el-button>
        <el-button type="primary" size="mini" plain @click="reset">
          重置 <i class="el-icon-refresh"></i>
        </el-button>
        <!-- 合计禁用：不能合计 -->
        <el-button type="warning" size="mini" plain :disabled="!is_A_count" @click="clickCount">
          合计 <i class="el-icon-s-data" v-if="is_A_count"></i><i class="el-icon-loading" v-else></i>
        </el-button>
        <!-- 导出禁用 -->
        <el-button type="success" size="mini" plain  @click="submit({ operationType: 'export' })">
          导出 <i class="el-icon-download" v-if="is_A_export"></i><i class="el-icon-loading" v-else></i>
        </el-button>
      </div>

    </div>
  </el-collapse-transition>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data() {
    return {
      isShow: true, //    是否显示搜索条件
      projectName: '', // 项目名称
      time: [] //         起始日期
    }
  },
  created() {
    /* 默认选中过去一年 */
    const [start, end] = this._returnAFewDaysAgo(365)
    this.time = [start, end]
    this.$store.commit('assignData1', { name: 'searchTime', obj: [this._returnYearMonthDay(start), this._returnYearMonthDay(end)] })
  },
  computed: {
    ...mapState(['is_A_search', 'is_A_export', 'is_A_count', 'isGaoJi', 'active', 'searchTime']),
    ...mapGetters(['isSearch'])
  },
  methods: {
    /**
     * [项目名称：输入搜索文字]
     */
    inputProjectName(event) {
      this.$store.commit('assignData1', { name: 'searchText', obj: event })
    },
    /**
     * [起始日期]
     * @param {[Array]} event 选中的日期区间
     */
    changeTime(event) {
      this.$store.commit('assignData1', { name: 'searchTime', obj: event })
    },
    /**
     * [显示：高级查询]
     */
    showAdvancedQuery() {
      this.$store.commit('assignData1', { name: 'isDialog', obj: true })
    },
    /**
     * [查询 / 导出]
     * @param {[String]}  operationType 搜索 / 导出
     * @param {[Boolean]} isLoading     是否显示加载动画
     */
    submit(params = {}) {
      const { operationType = 'search', isLoading = true } = params
      /** 查询 / 导出 **/
      this.$store.dispatch('search', { operationType, isLoading })
    },
    /**
     * [合计]
     */
    clickCount() {
      /** 请求：合计 **/
      this.$store.dispatch('A_count')
    },
    /**
     * [重置]
     */
    reset() {
      /* 接口返回 */
      this.$store.commit('assignData1', { name: 'dataList', obj: [] }) //      表格数据
      /* 页面操作 */
      this.$store.commit('assignData1', { name: 'searchText', obj: '' }) //    搜索：input
      this.$store.commit('assignData1', { name: 'searchTime', obj: [] }) //    搜索：起始日期
      this.$store.commit('assignData1', { name: 'searchHeader', obj: {} }) //  搜索：表头
      /* 高级查询 */
      this.$store.commit('assignData1', { name: 'advancedQuery', obj: [] }) // 查询条件
      /* 合计 */
      this.$store.commit('assignData1', { name: 'countData', obj: {} }) //     合计
      /* 分页 */
      this.$store.commit('assignData1', { name: 'pagenum', obj: 1 }) //        页数
      this.$store.commit('assignData1', { name: 'rownum', obj: 10 }) //        每页条数
      this.$store.commit('assignData1', { name: 'pageCount', obj: 0 }) //      总条数
      /* 本页 */
      this.projectName = '' //                                                 项目名称
    },
    /**
     * [返回：几天前]
     * @param  {[Int]}  num                          天数
     * @return {[type]} ['2020-01-01', '2020-02-01'] 起始日期
     */
    _returnAFewDaysAgo(num) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * num)
      return [start, end]
    },
    /**
     * [提取：年月日]
     */
    _returnYearMonthDay(strOrNum) {
      const d = new Date(strOrNum)
      const year = d.getFullYear()
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      return `${year}-${month}-${day}`
    }
    //
  }
}
</script>

<style scoped>
.comBox { /* 表单容器 */
  margin-right: 40px;
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.searchBox { /* 单个组件块 */
  width: 290px;
  font-size: 12px;
  margin: 5px 0 0 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.searchBtnBox {
  font-size: 12px;
  margin: 5px 10px 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex: 1;
}
.searchName { /* 单个 label */
  white-space: nowrap;
}
</style>

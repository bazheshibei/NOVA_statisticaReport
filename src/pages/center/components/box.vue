
<!-- 页签内部容器 -->

<template>
  <div ref="box">
     <!-- v-loading="showLoading" element-loading-text="请求数据中" -->
    <!-- 搜索模块 -->
    <div ref="search" style="margin-bottom: 5px;">
      <com-search @recount="recount"></com-search>
    </div>
    <!-- 表格模块 -->
    <div class="ComTable" ref="table">
      <com-table :tableHeight="tableHeight"></com-table>
    </div>
    <!-- 分页 -->
    <div class="paginationBox" ref="pagination">
      <el-pagination class="comPagination" :page-size="rownum[active]" :page-sizes="[10, 20, 30, 50, 100]" :total="pageCount[active]" :current-page="pagenum[active]"
        layout="prev, pager, next, total, jumper, sizes" prev-text="上一页" next-text="下一页"
        @size-change="pageChange('rownum', $event)" @current-change="pageChange('pagenum', $event)"
      >
      </el-pagination>
    </div>
    <!-- 高级查询 -->
    <com-advancedQuery v-if="tab === active"></com-advancedQuery>
    <!-- 隐藏 -->
    <p style="display: none;">{{tableSign}}用于触发统计 tableSignArr</p>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ComSearch from './search' //               搜索模块
import ComTable from './table' //                 表格模块
import ComAdvancedQuery from './advancedQuery' // 高级查询
export default {
  components: { ComSearch, ComTable, ComAdvancedQuery },
  props: ['tab', 'tabIndex'],
  data() {
    return {}
  },
  created() {
    if (this.tabIndex === 0) {
      /* 计算：表格高度 */
      this._countHeight()
    }
  },
  computed: {
    ...mapState(['tableHeight', 'isLoading']),
    ...mapState(['tableSignArr', 'pagenum', 'rownum', 'pageCount', 'oldList', 'active', 'isDialog']),
    ...mapGetters(['tableSign']),
    showLoading(state) {
      const { isLoading = {}, active = '', tab } = this
      return isLoading[active] && tab === active
    }
  },
  methods: {
    /**
     * [重新计算表格高度]
     */
    recount() {
      this._countHeight()
    },
    /**
     * [分页切换]
     * @param {[String]} name 属性名
     * @param {[Int]}    val  属性值
     */
    pageChange(name, val) {
      this.$store.commit('assignData1', { name, obj: val })
      if (name === 'rownum') {
        this.$store.commit('assignData1', { name: 'pagenum', obj: 1 })
      }
      /** 查询 **/
      this.$store.dispatch('search', { operationType: 'search', isLoading: true })
    },
    /**
     * [计算：表格高度]
     */
    _countHeight() {
      const that = this
      let i = 0
      const timer = setInterval(function () {
        if (Object.keys(that.$refs).length) {
          const { box, search, pagination } = that.$refs
          if (box.clientHeight && search.clientHeight && pagination.clientHeight) {
            const num = box.clientHeight - search.clientHeight - pagination.clientHeight - 10
            that.$store.commit('saveData', { name: 'tableHeight', obj: num })
            clearInterval(timer)
          }
        }
        if (i > 100) {
          clearInterval(timer)
        }
        i++
      }, 100)
    }
    //
  }
}
</script>

<style scoped>
/*** 表格模块 ***/
.ComTable {
  width: 100%;
  border-top: 1px solid #EBEEF5;
  border-bottom: 1px solid #EBEEF5;
  flex: 1;
}
td >.cell {
  display: flex;
  align-items: flex-start;
}
/*** 分页 ***/
.paginationBox {
  margin: 2px 15px;
  display: flex;
  justify-content: flex-end;
}
</style>


<!-- 表格模块 -->

<template>
  <div class="tableBox">

    <el-table class="comTable"
      :data="tableData" :height="tableHeight" size="mini" border :show-summary="true" :summary-method="_summaryMethod"
      :row-style="_rowStyle" :span-method="_objectSpanMethod"
    >
      <el-table-column prop="custom_name" fixed>
        <template slot="header" slot-scope="scope">
          <div class="thText">客户名称</div>
        </template>
      </el-table-column>
      <el-table-column prop="dress_type_name" fixed>
        <template slot="header" slot-scope="scope">
          <div class="thText">服装品类</div>
        </template>
      </el-table-column>
      <el-table-column prop="custom_dress_series_name" fixed>
        <template slot="header" slot-scope="scope">
          <div class="thText">系列名称</div>
        </template>
      </el-table-column>
      <el-table-column prop="style_name" fixed>
        <template slot="header" slot-scope="scope">
          <div class="thText">款式名称</div>
        </template>
      </el-table-column>

      <el-table-column v-for="(val, key) in nodeData" :key="'val_' + key + '_' + val.code" min-width="100"
        :column-key="key + '^' + val.columnKey + '^' + val.type_code + '^' + val.code"
      >
        <template slot="header" slot-scope="scope">
          <el-popover placement="top" width="250" trigger="click">
            <el-input :ref="'input_' + key" clearable v-model="searchObj[val.code]" size="mini" placeholder="多个查询空格分隔" @clear="clear(val.code)" @change="change(val.code, $event, val.type_code)"></el-input>
            <div class="thText" slot="reference" :title="val.describecontent" @click="tableHeaderClick(key)">
              {{val.label}}<span>&nbsp;<i class="el-icon-search" :class="searchObj[val.code] ? 'thActive' : ''"></i></span>
            </div>
          </el-popover>
        </template>
        <template slot-scope="scope">
          <div class="ComTableCell">
            <!-- <span v-if="scope.row[val.code] || scope.row[val.code] === 0">{{scope.row[val.code]}}</span> -->
            <span v-if="scope.row[val.code] || scope.row[val.code] === 0" v-html="scope.row[val.code]"></span>
          </div>
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['tableHeight'],
  data() {
    return {
      searchObj: {} // 表头搜索
    }
  },
  computed: {
    ...mapState(['countData', 'searchData', 'active']),
    ...mapGetters(['tableData']),
    nodeData(state) {
      const { searchData, active } = state
      return searchData[active] || []
    }
  },
  methods: {
    /**
     * [点击表头，input自动聚焦]
     * @param {[Int]} key 索引：小类
     */
    tableHeaderClick(key) {
      const that = this
      setTimeout(function () {
        const ref = that.$refs[`input_${key}`]
        if (ref.length && ref.length === 1) {
          that.$refs[`input_${key}`][0].focus()
        } else if (ref.length && ref.length === 2) {
          that.$refs[`input_${key}`][1].focus()
        }
      }, 100)
    },
    /**
     * [表头：清空输入框]
     * @param {[String]} name 字段名
     */
    clear(name) {
      this.searchObj[name] = ''
    },
    /**
     * [表头：改变值]
     * @param {[String]} key   属性名
     * @param {[String]} value 属性值
     * @param {[String]} index 大类code
     */
    change(key, value, index) {
      const obj = { [key]: value.trim() }
      /** 添加数据 **/
      this.$store.commit('assignData2', { name: 'searchHeader', obj, index })
      /** 请求：数据 **/
      this.$store.dispatch('A_getData')
    },
    /**
     * [合计内容]
     */
    _summaryMethod({ columns, data }) {
      const { countData, active } = this
      const countNowData = countData[active] || {}
      const arr = []
      columns.forEach(function (item, index) {
        if (index === 0) {
          arr.push('合计')
        } else if (item.columnKey && item.columnKey.length > 6) {
          const [, , word, value] = item.columnKey.split('^')
          if (countNowData[word]) {
            arr.push(countNowData[word][value])
          } else {
            arr.push('')
          }
        } else {
          arr.push('')
        }
      })
      return arr
    },
    /**
     * [合并：表格单元格]
     */
    _objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < 4 || (typeof column.columnKey === 'string' && column.columnKey.split('^')[1] === '1')) {
        if (row.arrLength) {
          return { rowspan: row.arrLength, colspan: 1 } // 合并
        } else {
          return { rowspan: 0, colspan: 0 } //      隐藏
        }
      }
    },
    /**
     * [改变样式：隔行变色]
     */
    _rowStyle({ row, rowIndex }) {
      if (row.index % 2 === 1) {
        return { background: 'oldlace' }
      }
    }
    //
  }
}
</script>

<style scoped>
.tableBox {
  width: 100%;
  height: 100%;
  position: relative;
}
.comTable {
  border: 0;
}
.thActive {
  color: #E6A23C;
  font-weight: bold;
}
.thText {
  text-align: center;
  line-height: 14px;
}
</style>

<style>
.comTable::before, .comTable::after {
  height: 0 !important;
}
.el-table__fixed::before, .el-table__fixed::after {
  height: 0 !important;
}
.comTable > .el-table__footer-wrapper { /* 滚动部分：合计行定位到底部 */
  position: absolute;
  bottom: 0;
}
.el-table td, .el-table th { /* 单元格内文字顶部对齐 */
  vertical-align: top !important;
}
.el-table thead {
  color: #303133;
}

/* 最后一行 padding，防止合计行遮挡[固定部分、滚动部分] */
.tableBox > div > .el-table__fixed > .el-table__fixed-body-wrapper > table > tbody > tr:last-child > td, .tableBox > div > .el-table__body-wrapper > table > tbody > tr:last-child > td {
  /* padding-bottom: 32px !important; */
  padding-bottom: 12px !important;
}
/* 合计防换行[固定部分、滚动部分] */
.tableBox > div > .el-table__fixed > .el-table__fixed-footer-wrapper > table > tbody > tr > td > .cell, .tableBox > div > .el-table__footer-wrapper > table > tbody > tr > td > .cell {
  height: 23px !important;
  line-height: 12px !important;
  display: flex !important;
  align-items: center !important;
}
</style>

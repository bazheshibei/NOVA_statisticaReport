
<!-- 自定义统计 -->

<template>
  <div class="pageBox" ref="page">

    <el-tabs ref="tabs" type="border-card" @tab-click="changeTab">
      <el-tab-pane v-if="tabHeight" v-for="(item, index) in oldList" :key="'tab_' + index" :tabCode="item.code" :label="item.report_name">
        <com-box v-for="num in activeNum" :key="'box_' + num"
          v-if="active === item.report_name && num === activeNum"
          :style="{ height: tabHeight }" :tab="item.report_name" :tabIndex="index"
        >
        </com-box>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import ComBox from './components/box.vue' // 页签内部容器
import Store from '@/store'

/* 回车：查询 */
document.addEventListener('keyup', (event) => {
  if (String(event.keyCode) === '13') {
    Store.dispatch('search', { operationType: 'search', isLoading: true })
  }
})

export default {
  components: { ComBox },
  data() {
    return {
      tabHeight: '' // tab 高度
    }
  },
  created() {
    /* 计算：表格高度 */
    this._countHeight()
    /** 请求：指标 **/
    this.$store.dispatch('A_getCode', { that: this })
  },
  computed: {
    ...mapState(['dataList', 'active', 'activeNum']),
    ...mapState({
      oldList(state) {
        const { oldList = [] } = state
        if (oldList.length) {
          const active = oldList[0].report_name
          const activeCode = oldList[0].code || ''
          this.$store.commit('saveData', { name: 'active', obj: active })
          this.$store.commit('saveData', { name: 'activeCode', obj: activeCode })
        }
        return oldList
      }
    })
  },
  methods: {
    /**
     * [切换页签]
     * @param {[Object]} event 页签实例
     */
    changeTab(event) {
      const { dataList, activeNum } = this
      const { label = '' } = event
      const attrs = event.$attrs || {}
      const { tabCode = '' } = attrs
      this.$store.commit('saveData', { name: 'active', obj: label })
      this.$store.commit('saveData', { name: 'activeCode', obj: tabCode })
      this.$store.commit('saveData', { name: 'pageNum', obj: activeNum + 1 })
      if (!dataList[label]) {
        this.$store.commit('assignData1', { name: 'isLoading', obj: true })
        /** 请求：数据 **/
        this.$store.dispatch('A_getData')
      }
    },
    /**
     * [计算：表格高度]
     */
    _countHeight() {
      const that = this
      let i = 0
      const timer = setInterval(function () {
        if (Object.keys(that.$refs).length) {
          const { page = {}, tabs = {} } = that.$refs
          if (page.clientHeight && tabs.$el && tabs.$el.clientHeight) {
            const num = page.clientHeight - tabs.$el.clientHeight
            that.tabHeight = num + 'px'
            clearInterval(timer)
          }
        }
        if (i > 100) {
          clearInterval(timer)
        }
        i++
      }, 100)
    }
  }
}
</script>

<style scoped>
.pageBox {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex: 0;
}
</style>

<style>
/**
 * [页签 tabs]
 */
.el-tabs {
  border: 0 !important;
  box-shadow: none !important;
}
.el-tabs__header {
  padding-top: 3px !important;
  background: #91b5d6 !important;
}
.el-tabs__item { /* tab 顶部 */
  height: 30px !important;
  color: var(--thColor) !important;
  font-size: 12px !important;
  line-height: 30px !important;
  margin-left: 3px !important;
  padding: 0 10px !important;
  background: #ffffff !important;
  border-top-left-radius: 6px !important;
  border-top-right-radius: 6px !important;
}
.el-tabs__item.is-active { /* tab 激活 */
  color: #d37521 !important;
}
.el-tabs__content { /* tab 内容 */
  padding: 0 !important;
  position: absolute !important;
  top: 30px !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
}
</style>

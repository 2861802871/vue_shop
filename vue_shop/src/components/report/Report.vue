<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <div id="main" style="min-width: 800px;min-height:450px;">

      </div>
    </el-card>
  </div>
</template>

<script>
// 导入Echarts
import echarts from 'echarts'

//合并对象
import _ from 'lodash'

export default {
  data () {
    return {
      // 需要合并的数据选项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },

  //   页面上的元素渲染完毕后
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    // 获取图标数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取数据失败')

    var data = _.merge(res.data, this.options)
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(data);
  },

  created () {

  },

  methods: {
  },
}
</script>

<style lang="less" scoped>
 #main{
  width: 600px;
width: 400px;
 }
</style>
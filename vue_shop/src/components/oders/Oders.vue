<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table stripe border :data="odersList" style="width: 100%">
        <el-table-column type="index" label="序号"></el-table-column>

        <el-table-column prop="order_number" label="订单编号" min-width="300px"></el-table-column>

        <el-table-column prop="order_price" label="订单价格" width="90px"></el-table-column>

        <el-table-column prop="order_pay" label="是否付款" width="124px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay==='0'" type="danger">未付款</el-tag>
            <el-tag v-else-if="scope.row.order_pay==='1'" type="success">已付款</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="is_send" label="是否发货" width="90px"></el-table-column>

        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">
            <span>{{scope.row.create_time | dateFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150px">
          <template slot-scope="{}">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressEdit"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="odersInfo.pagenum" :page-sizes="[1,,5,6,8,10,20,50,100, 200, 300, 400]" :page-size="odersInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClose">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">

        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>

        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 显示物流对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <el-timeline :reverse="false">

        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 导入城市数据
import cityData from './citydata.js'
// 物流数据
const progressData = [
  {
    "time": "2018-05-10 09:39:00",
    "ftime": "2018-05-10 09:39:00",
    "context": "已签收,感谢使用顺丰,期待再次为您服务",
    "location": ""
  },
  {
    "time": "2018-05-10 08:23:00",
    "ftime": "2018-05-10 08:23:00",
    "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
    "location": ""
  },
  {
    "time": "2018-05-10 07:32:00",
    "ftime": "2018-05-10 07:32:00",
    "context": "快件到达 [北京海淀育新小区营业点]",
    "location": ""
  },
  {
    "time": "2018-05-10 02:03:00",
    "ftime": "2018-05-10 02:03:00",
    "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
    "location": ""
  },
  {
    "time": "2018-05-09 23:05:00",
    "ftime": "2018-05-09 23:05:00",
    "context": "快件到达 [北京顺义集散中心]",
    "location": ""
  },
  {
    "time": "2018-05-09 21:21:00",
    "ftime": "2018-05-09 21:21:00",
    "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
    "location": ""
  },
  {
    "time": "2018-05-09 13:07:00",
    "ftime": "2018-05-09 13:07:00",
    "context": "顺丰速运 已收取快件",
    "location": ""
  },
  {
    "time": "2018-05-09 12:25:03",
    "ftime": "2018-05-09 12:25:03",
    "context": "卖家发货",
    "location": ""
  },
  {
    "time": "2018-05-09 12:22:24",
    "ftime": "2018-05-09 12:22:24",
    "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
    "location": ""
  },
  {
    "time": "2018-05-08 21:36:04",
    "ftime": "2018-05-08 21:36:04",
    "context": "商品已经下单",
    "location": ""
  }
]
export default {
  data () {
    return {
      // 订单列表数据
      odersList: [],
      //   数据总数
      total: 0,
      //获取订单列表请求参数
      odersInfo: {
        query: '',
        pagenum: 1,
        pagesize: 8,
      },
      //修改地显示与否
      addressVisible: false,
      //地址表单数据
      addressForm: {
        address1: [],
        address2: ''
      },
      //表单验证规则
      addressFormRules: {
        address1: [{ required: true, message: '请选择地区', trigger: 'blur' },],
        address2: [{ required: true, message: '请填写详细地址', triggre: 'blur' }]
      },
      // 城市数据
      cityData,
      //显示物流进度
      progressVisible: false,
      // 物流数据
      progressInfo: progressData,

    }
  },
  created () {
    this.getOdersList()
  },
  methods: {
    //   获取订单列表
    async getOdersList () {
      const { data: res } = await this.$http.get(`orders`, { params: this.odersInfo })

      if (res.meta.status !== 200) return this.$message.error('获取数据失败')

      this.odersList = res.data.goods
      this.total = res.data.total
      console.log(this.odersList);
    },

    //-----分页----------

    // 页面显示条数变化
    handleSizeChange (newSize) {
      this.odersInfo.pagesize = newSize
      this.odersInfo.pagenum = 1//重置到第一页
      this.getOdersList()
    },

    //切换页面
    handleCurrentChange (newNum) {
      this.odersInfo.pagenum = newNum
      this.getOdersList()
    },
    //-----------------修改地址---------------------
    //修改地址
    addressEdit () {
      this.addressVisible = true
    },

    //关闭修改地址对话框
    addressDialogClose () {
      this.$refs.addressFormRef.resetFields()
    },

    //-----------查看物流状态-------------------

    async showProgress () {

      this.progressVisible = true
      // const { data: res } = await this.$http.get(`/kuaidi/1106975712662`)
      // if (res.meta.status !== 200) return this.error('查询物流信息失败')
      // this.progressInfo = res.data
      console.log(this.progressInfo);
    }

  }
}
</script>

<style lang="less" scoped>
.el-pagination{margin-top: 15px;}
.el-cascader{width: 100%;}
</style>
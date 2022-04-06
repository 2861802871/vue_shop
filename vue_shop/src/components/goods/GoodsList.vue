<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索框和添加按钮 :gutter间隔-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable placeholder="请输入内容" v-model="queryInfo.query" @keyup.enter.native="searchData" @clear="getAlllist">
            <el-button slot="append" icon="el-icon-search" @click="searchData"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="goodsList">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" min-width="300px"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="80px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px">
          <!-- 使用定义的时间过滤器 -->
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3,5,6,8,10,20,50,100, 200, 300, 400]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取商品列表请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 6,
      },
      // 商品列表
      goodsList: [],
      // 商品总数
      total: 0,
    }
  }, created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
      // console.log(this.goodsList);
      // console.log(this.total);
    },
    // 分页显示数据条数发生变化时触发
    handleSizeChange (size) {
      this.queryInfo.pagesize = size
      this.getGoodsList()
    },
    // 显示页码发生变化时触发
    handleCurrentChange (num) {
      this.queryInfo.pagenum = num
      this.getGoodsList()
    },
    // 搜索功能
    searchData () {
      if (!this.queryInfo.query.trim()) return
      this.queryInfo.query = this.queryInfo.query.trim()
      this.getGoodsList()
    },
    //clear清空是搜索框请求所有数据
    getAlllist () {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    //--------删除------------
    removeById (goodsId) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${goodsId}`)
        if (res.meta.status !== 200) return his.$message.error('删除错误！')
        this.getGoodsList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    //-----------添加商品--------------
    addGoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination{margin-top: 15px;}
</style>
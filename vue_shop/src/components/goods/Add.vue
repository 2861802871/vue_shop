<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
      </el-alert>
      <!-- 步骤条 -0字符串转数字-->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片 "></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <!-- 级联选择器 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="CatesList" :props="catProps" @change="handleChange"></el-cascader>
            </el-form-item>

            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染产品参数表单 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item1" border size="mini" v-for="(item1,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染产品属性表单 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 上传图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- 文件上传地址 -->
            <el-upload class="upload-demo" :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addgoods" @click="add">确定添加商品</el-button>
          </el-tab-pane>
        </el-tabs>

      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="60%" @close="previewDialogClose">
      <img :src="previewPath" alt="">
    </el-dialog>
  </div>
</template>
   
<script>
// 导入lodash
import _ from 'lodash'

export default {
  data () {
    return {
      // 步骤和tabs标签激活项
      activeIndex: '0',
      //   添加商品表单数据
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        // 商品所属分类数组
        goods_cat: [],
        pics: [],//上传商品图片临时地址
        goods_introduce: '',//商品介绍
        attrs: []//动态参数和静态参数
      },
      //   表单验证规则
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' },],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' },],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' },],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' },],
        goods_cat: [{ required: true, message: '请选择产品分类', trigger: 'blur' },],
      },
      //   产品分类列表
      CatesList: [],
      // 级联选择器配置
      catProps: {
        expandTrigger: 'hover',
        value: 'cat_id',//选中值
        label: 'cat_name',//显示值
        children: 'children',//子级
      },
      //   // 级联选择器选中值
      checkedId: [],
      //产品参数列表
      manyTableData: [],
      //静态参数列表
      onlyTableData: [],
      //上传商品图片地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      //上传商品图片请求头
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      // 预览图片的url
      previewPath: '',
      // 预览图片对话框显示与否
      previewDialogVisible: false,
    }
  },
  created () {
    this.GetCateList()
  },
  methods: {
    //   获取商品分类数据
    async GetCateList () {
      const { data: res } = await this.$http.get('/categories/')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败！')
      this.CatesList = res.data
    },
    // 级联选择器值发生变化时
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        return this.addForm.goods_cat = []
      }
      // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
      console.log(this.addForm.goods_cat);
    },
    //切换tabs标签前的钩子函数判断是否允许切换
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName == '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    //点击标签切换时
    async tabClicked () {
      // 判断是否为动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cartId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取数据失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        console.log(res);
        this.manyTableData = res.data
      }
      //判断是否为静态属性
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cartId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取数据失败')
        }
        // res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // })
        console.log(res);
        this.onlyTableData = res.data
      }
    },
    //----------图片上传-------------
    // 预览图片
    handlePreview (file) {
      // 显示对话框
      this.previewDialogVisible = true

      console.log(file);
      // 获取url
      this.previewPath = file.response.data.url

    },
    // 关闭预览图片对话框
    previewDialogClose () {
      this.previewDialogVisible = false
    },
    //移除图片钩子函数
    handleRemove (file) {
      console.log(file);
      // 获取要删除的文件的索引
      const filePath = file.response.data.tmp_path
      // 查找临时地址的索引
      const i = this.addForm.pics.findIndex(x => {
        const filePath = file.response.data.tmp_path
        x.pic === filePath
      })
      // 根据索引删除查找到的数组项
      this.addForm.pics.splice(i, 1)
    },
    // 上传文件成功后的钩子函数
    handleSuccess (response) {
      console.log(response);
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm.pics);
    },
    //---------添加商品-------------
    add () {
      // 表单数据预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('数据预验证不通过请检查')
        // 表单预验证通过
        // 处理请求数据先深拷贝一份表单数据
        const form = _.cloneDeep(this.addForm)
        // 转为字符串
        form.goods_cat = form.goods_cat.join(',')
        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          }
          this.addForm.attrs.push(newInfo)
        })
        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form);

        const { data: res } = await this.$http.post('goods', form)
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error('提交失败')
        this.$message.success('创建商品成功')
        console.log(res.data);
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    cartId () {
      if (this.addForm.goods_cat.length !== 3) return null
      return this.addForm.goods_cat[2]
    }
  }
}
</script>


<style lang="less" scoped>

.el-checkbox{margin: 0 12px 0 0;}
.el-dialog img{
    width: 100%;
  }
.addgoods{
  margin-top: 15px;
}
</style>
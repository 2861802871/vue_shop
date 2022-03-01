<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片曲 -->
    <el-card class="box-card">
      <!-- 輸入框 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input clearable placeholder="请输入内容" v-model="queryInfor.query" @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="AddDialogVisible = true">添加用戶</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表表格 -->
      <el-table :data="UserList" :border="true" :stripe="true">
        <!-- 索引列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <!-- 用户名 -->
        <el-table-column prop="username" label="用户名">

        </el-table-column>
        <!-- 身份 -->
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>

        <el-table-column prop="mobile" label="电话">
        </el-table-column>

        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="UserStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="176px">
          <template slot-scope="scope">
            <!-- <template slot-scope="{}"> -->
            <!-- {{scope.rows.id}} -->
            <!-- 修改按钮 -->
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="ShowEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="DeleteUserByid(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" :enterable="false" content="分配角色" placement="top-start">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="SetRoleDialog(scope.row)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfor.pagenum" :page-sizes="[1, 2,4, 5, 10,20,50]" :page-size="queryInfor.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="AddDialogVisible" width="50%" @close="AddDialogClosed">
      <!-- 主体 -->
      <el-form :model="AddForm" :rules="AddFormRules" ref="AddFormRef" label-width="100px" class="demo-ruleForm">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="AddForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="AddForm.password"></el-input>
        </el-form-item>
        <!-- 手机 -->
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="AddForm.mobile"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="AddForm.email"></el-input>
        </el-form-item>
      </el-form>
      <!-- 页脚 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AddUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息 -->
    <el-dialog title="修改用户信息" :visible.sync="EditDialogVisible" width="50%" @close="EditDialogClose">
      <!-- 与添加用户共用一套验证规则 -->
      <el-form :model="EditForm" :rules="AddFormRules" ref="EditFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="EditForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="EditForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="EditForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色区域 -->
    <el-dialog title="分配角色" :visible.sync="SetRoleDialogVisible" width="50%" @close="SelectedRosleClose">
      <div>
        <p>用户名：{{UserInfo.username}}</p>
        <p>用户名：{{UserInfo.role_name}}</p>
        <!-- 分配角色选择框 -->
        <p>分配角色：
          <el-select v-model="SelectedRosleId" placeholder="请选择">
            <el-option v-for="item in RolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="SetRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfor: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      UserList: [],
      total: 0,
      // 添加用户Dialog显示与否
      AddDialogVisible: false,
      //修改用户信息Dialog显示与否
      EditDialogVisible: false,
      // 分配角色 Dialog显示与否
      SetRoleDialogVisible: false,
      // 分配角色用户信息
      UserInfo: {},
      // 角色列表
      RolesList: [],
      // 已选择的角色id
      SelectedRosleId: '',
      // 数据对象
      AddForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      // 修改用户信息查询到的数据
      EditForm: {},
      // 添加用户表单验证规则//修改用户共用一套规则
      AddFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到20个字符', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在3到10个字符', trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '长度11个字符', trigger: 'blur' },
          {
            pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
            message: '请输入正确的手机号码', trigger: 'blur'
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      },
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 查询用户
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfor })
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.UserList = res.data.users
      this.total = res.data.total
      // console.log(this.UserList)
      // console.log(this.total);
    },
    // 每页多少条数据触发事件
    handleSizeChange (NewSize) {
      // console.log(NewSize);
      this.queryInfor.pagesize = NewSize
      this.getUserList()
    },
    // 切换页码时处理事件
    handleCurrentChange (NewPage) {
      // console.log(NewPage);
      this.queryInfor.pagenum = NewPage
      this.getUserList()
    },
    async UserStateChanged (user) {
      const { data: res } = await this.$http.put(`users/${user.id}/state/${user.mg_state}`)
      if (res.meta.status !== 200) {
        user.user.mg_state = !user.user.mg_state
        return this.$message.error('修改用户状态失败！')
      }
      this.$message.success('修改成功')
    },
    // 关闭dialog重置表单处理函数
    AddDialogClosed () {
      this.$refs.AddFormRef.resetFields()
    },
    // 添加用户处理函数
    AddUser () {
      this.$refs.AddFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('添加用户数据验证失败')//用户数据预验证不通过
        const { data: res } = await this.$http.post('users', this.AddForm)
        console.log(res);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        //隐藏dialog
        this.AddDialogVisible = false
        //刷新用户列表
        this.getUserList()
      })
    },
    //修改用户信息
    async ShowEditDialog (id) {
      // console.log(id);
      const { data: res } = await this.$http.get(`users/${id}`)
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.EditDialogVisible = true
      this.EditForm = res.data

    },

    //修改用户信息弹出关闭重置表单
    EditDialogClose () {
      this.$refs.EditFormRef.resetFields()
    },
    // 提交用户信息修改
    EditUserInfo () {
      this.$refs.EditFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('数据修改验证失败！')
        this.EditDialogVisible = true
        const { data: res } = await this.$http.put('users/' + this.EditForm.id, { mobile: this.EditForm.mobile, email: this.EditForm.email })
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error('修改用户数据信息失败！')
        this.$message.success(res.meta.msg)
        // 刷新数据列表
        this.getUserList()
        //关闭弹窗
        this.EditDialogVisible = false
      })
    },

    // 删除操作确认消息
    DeleteUserByid (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 调用接口删除
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$mesage.error('删除失败！')
        //  刷新列表
        this.getUserList()
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
    // 分配角色
    async SetRoleDialog (UserInfo) {
      this.SetRoleDialogVisible = true
      this.UserInfo = UserInfo
      console.log(this.UserInfo)
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.RolesList = res.data
      console.log(res);
    },
    async SetRole () {
      if (!this.SelectedRosleId) return this.$message.error('请选择要绑定的角色')
      console.log(this.SelectedRosleId);
      const { data: res } = await this.$http.put(`users/${this.UserInfo.id}/role`, { rid: this.SelectedRosleId })
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error('修改用户角色失败！')
      this.$message.success('修改用户角色成功')
      this.getUserList()
      this.SetRoleDialogVisible = false
    },
    // 关闭dialog重置数据
    SelectedRosleClose () {
      this.SelectedRosleId = ''
      this.UserInfo = {}
    }

  }
}
</script>

<style lang="less" scoped>
  div{
    padding: 0;
    }
</style>
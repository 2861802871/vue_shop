<template>
  <div class="login_contaier">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" label-width="0px" :rules="loginFormRules" class="login_form" :model="loginForm">
        <!-- 账号 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" placeholder="请输入账号admin" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" prefix-icon="el-icon-lock" placeholder="请输入密码123456" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 登录数据验证对象
      loginFormRules: {
        username: [
          { required: true, message: "请输入登录用户名", trigger: "blur" },
          { min: 3, max: 10, message: "输入长度在3~10个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 20, message: "输入长度在6~20个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 重置表单方法
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields();
    },

    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return; //验证不通过
        const { data: res } = await this.$http.post("login", this.loginForm);
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error("登录失败");
        this.$message.success("登录成功");
        // 保存token到sessionStorage页面关闭清除token
        window.sessionStorage.setItem("token", res.data.token);
        // 通过编程式导航跳转到后台主页路由地址是/home
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang='less' scoped>
// 大盒子
.login_contaier {
  background: url("./login_bg.jpg");
  background-repeat: no-repeat;
  background-size: 100%;
  height: 100%;
}
// 登录盒子
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 4px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
// 图标
.avatar_box {
  height: 130px;
  width: 130px;
  //   padding: 3px;
  border: 1px solid #eee;
  border-radius: 50%;
  //   background-color: #eee;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
}
// button
.btns {
  display: flex;
  justify-content: flex-end;
}
// 表单
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0 4%;
  box-sizing: border-box;
}
</style>

<template>
  <div class="login-container">
    <h1 class="login-title">LOGIN</h1>
    <div class="login-form">
      <el-input v-model="username" placeholder="帐号" class="login-input"></el-input>
      <el-input placeholder="请输入密码" v-model="password" show-password class="login-input"></el-input>
      <el-button type="primary" @click="login" class="login-button">登录</el-button>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    login() {
      // 在这里处理登录逻辑，可以向后端发送请求进行验证
      request.post("user/login",{
        name:this.username,
        password:this.password
      }).then(res =>{
        if (res.code === '0') {
          this.$message.success('登录成功');
          this.$router.push("/admin")
        } else {
          this.$message.error(res.msg);
        }

      })

    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-input {
  width: 300px;
  margin-bottom: 10px;
}

.login-button {
  width: 300px;
}
</style>

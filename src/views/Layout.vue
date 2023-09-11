<template>
  <div id="app">

    <el-container>
      <el-header style="background-color: #0f2027; color: white; font-size: 20px; position: relative;">
        <img src="@/assets/logo.png" style="width: 35px">
        <span>工厂生产管理系统</span>
        <div class="dropdown-container">
          <el-dropdown trigger="click" placement="bottom-end">
            <span class="el-dropdown-link" style="color: #FF9900;">
              {{user.name}}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown" style="background-color: #333;">
              <el-dropdown-item icon="el-icon-switch-button"><div @click="logout()">退出登录</div></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
    </el-container>

    <el-container>
      <el-aside style="overflow:hidden;min-height:100vh;background-color: #203A43" main>
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/">
            <i class="el-icon-user-solid"></i>
            <span slot="title">主页</span>
          </el-menu-item>
          <el-submenu v-if="user.group === '管理员'" index="1" >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>人员管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/admin">员工</el-menu-item>

              <el-menu-item index="/notice">系统公告</el-menu-item>

            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2"  >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>仓库管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/parts" v-if="user.group === '零件仓库' || user.group === '管理员'|| user.group === '半成品仓库' || user.group === '总成仓库'">零件库存</el-menu-item>
              <el-menu-item index="/log"　 v-if="user.group === '管理员'">修改日志</el-menu-item>
              <el-menu-item index="/product" >产品库存</el-menu-item>
            </el-menu-item-group>

          </el-submenu>
          <el-submenu index="3" v-if="user.group === '计划部'|| user.group === '管理员'">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>计划部</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/newplan">新增计划管理</el-menu-item>
              <el-menu-item index="/oldplan">现有计划管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="4" v-if="user.group === '科技部'|| user.group === '管理员'">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>科技部</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/tec">研发项目</el-menu-item>

            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="5" v-if="user.group === '生产部'|| user.group === '管理员'">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>生产车间</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/factory">确认项目</el-menu-item>

            </el-menu-item-group>
          </el-submenu>



        </el-menu>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>


  </div>
</template>
<script>
  import request from "@/utils/request";

  export default {
    name: "Layout",
    data() {
      return {
        user:localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{}
      };
    },
    methods: {
      logout(){
        console.log("aaa")
        localStorage.removeItem("user")
        this.$router.push({path: "/login"})
      }
    }
  };
</script>

<style>
  .dropdown-container {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }
</style>

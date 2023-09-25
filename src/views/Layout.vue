<template>
  <div id="app">
    <el-container>
      <el-header style="background-color: #0f2027; color: white; font-size: 20px; position: relative;">
        <img src="@/assets/logo.png" style="width: 35px">
        <div class="dropdown-container">
          <el-dropdown trigger="click" placement="bottom-end">
        <span class="el-dropdown-link" style="color: #FF9900;">
          <p>{{ currentTime }}</p> <!-- 时间显示在用户名之前 -->
          {{user.name}}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
            <el-dropdown-menu slot="dropdown" style="background-color: #333;">
              <el-dropdown-item icon="el-icon-switch-button"><div @click="logout()">退出登录</div></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <span>工厂生产管理系统</span> <!-- 时间和用户名之间的文字 -->
      </el-header>
    </el-container>


    <el-container>
      <el-aside style="overflow:hidden;min-height:100vh;background-color: #203A43" main>
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/">
            <i class="el-icon-user-solid"></i>
            <span slot="title">主页</span>
          </el-menu-item>
          <el-submenu  index="1" >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item  v-if="user.group === '管理员'" index="/admin">员工</el-menu-item>

              <el-menu-item   index="/notice">系统公告</el-menu-item>

            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2"  >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>仓库管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/parts" v-if="user.group === '零件仓库' || user.group === '计划部' ||user.group === '管理员'|| user.group === '半成品仓库' || user.group === '总成仓库'">零件库存</el-menu-item>
              <el-menu-item index="/log"　 v-if="user.group === '管理员'">修改日志</el-menu-item>
              <el-menu-item index="/product" >产品库存</el-menu-item>
            </el-menu-item-group>

          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>计划部</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/newplan"  v-if="user.group === '计划部'|| user.group === '管理员'">新增计划管理</el-menu-item>
              <el-menu-item index="/oldplan">现有计划管理</el-menu-item>
              <el-menu-item index="/loss"  v-if="user.group === '计划部'|| user.group === '管理员'">损耗管理</el-menu-item>
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
              <el-menu-item index="/factory">已交付数量</el-menu-item>
              <el-menu-item index="/partsconfirm">零件确认</el-menu-item>
              <el-menu-item index="/lostconfirm">损耗确认</el-menu-item>

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
        user:localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{},
        currentTime: ""
      };
    },
    created() {
      // 在组件创建时启动定时器，每秒更新一次系统时间
      this.updateCurrentTime();
      setInterval(this.updateCurrentTime, 1000); // 1000毫秒 = 1秒
    },
    methods: {
      logout(){
        console.log("aaa")
        localStorage.removeItem("user")
        this.$router.push({path: "/login"})
      },
      updateCurrentTime() {
        const now = new Date(); // 获取当前时间
        const year = now.getFullYear().toString().padStart(4, "0"); // 年
        const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 月
        const day = now.getDate().toString().padStart(2, "0"); // 日
        const hours = now.getHours().toString().padStart(2, "0"); // 时
        const minutes = now.getMinutes().toString().padStart(2, "0"); // 分
        const seconds = now.getSeconds().toString().padStart(2, "0"); // 秒

        // 将时间拼接成字符串格式 HH:MM:SS
        this.currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      },
    },
  };
</script>

<style>
.dropdown-container {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 20px; /* 调整时间和用户名之间的距离 */
}

.user-info p {
  margin-right: 10px; /* 调整时间和用户名之间的距离 */
}
</style>>

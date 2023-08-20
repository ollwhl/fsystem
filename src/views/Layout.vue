<template>
  <div id="app">

    <el-container>
      <el-header style="background-color: #0f2027">
        <img src="@/assets/logo.png" style="width: 35px">


      </el-header>
    </el-container>

    <el-container>
      <el-aside style="overflow:hidden;min-height:100vh;background-color: #203A43" main>
        <el-menu :default-active="$route.path" router>
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>人员管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/admin">管理员</el-menu-item>
              <el-menu-item index="/stuff">员工</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>零件管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/parts">零件库存</el-menu-item>
              <el-menu-item index="/log">修改日志</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span slot="title">设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>


  </div>
</template>

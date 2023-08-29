<template>
  <div class="home">
    <h1>home</h1>
  </div>
</template>
<template>
  <el-menu :default-active="$route.path" router>
    <!-- 主页菜单项 -->
    <el-menu-item index="/">主页</el-menu-item>

    <!-- 根据用户权限动态生成菜单项 -->
    <el-submenu v-if="hasPermission('人员管理')" index="people">
      <template slot="title">
        <i class="el-icon-location"></i>
        <span>人员管理</span>
      </template>
      <el-menu-item v-if="hasPermission('管理员')" index="/admin">管理员</el-menu-item>
      <el-menu-item v-if="hasPermission('员工')" index="/stuff">员工</el-menu-item>
      <!-- 其他权限相关的菜单项 -->
    </el-submenu>

    <el-submenu v-if="hasPermission('零件管理')" index="parts">
      <template slot="title">
        <i class="el-icon-location"></i>
        <span>零件管理</span>
      </template>
      <el-menu-item v-if="hasPermission('零件库存')" index="/parts">零件库存</el-menu-item>
      <el-menu-item v-if="hasPermission('修改日志')" index="/log">修改日志</el-menu-item>
      <!-- 其他权限相关的菜单项 -->
    </el-submenu>

    <!-- 其他权限相关的菜单项 -->
  </el-menu>
</template>
<script>
export default {
  data() {
    return {
      userPermissions: ["管理员", "员工"], // 用户的权限列表
      menuItems: [
        // 定义所有菜单项，包括title、icon、path等信息
      ]
    };
  },
  methods: {
    hasPermission(permission) {
      // 判断用户是否具有某个权限
      return this.userPermissions.includes(permission);
    }
  }
};
</script>




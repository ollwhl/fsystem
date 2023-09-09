<template>
  <div class="home">
    <h1 >Welcome, {{ user.name }}! Role: {{ user.group }}</h1>
    <div class="system-announcements">
      <h2>公告</h2>
      <el-table :data="tableData":style="{ width: '100%' }" height="700">
        <el-table-column prop="name" label="公告标题" width="120"></el-table-column>
        <el-table-column prop="content" label="公告内容" width="300"></el-table-column>
        <el-table-column prop="time" label="发布时间" width="300"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  data() {
    return {
      user: {
        name: "",
        phone: "",
        group: "",
      },
      systemAnnouncements: [],
      tableData: [], // 添加tableData变量
      total: 0, // 添加total变量
    };
  },
  mounted() {
    // 从 localStorage 获取用户信息
    const userFromLocalStorage = localStorage.getItem("user");

    // 检查 localStorage 中是否存在用户信息
    if (userFromLocalStorage) {
      try {
        // 解析用户信息为 JSON 对象
        this.user = JSON.parse(userFromLocalStorage);
      } catch (error) {
        console.error("Error parsing user information:", error);
      }
    }

    // 在组件加载时调用load方法获取系统公告数据
    this.load();
  },
  methods: {
    load() {
      const noticeUrl = "user/notice";
      request.get(noticeUrl, {
        params: this.params,
      }).then((res) => {
        if (res.code === '0') {
          // 更新tableData和total变量
          this.tableData = res.data.list;
          this.total = res.data.total;

          // 更新systemAnnouncements变量
          this.systemAnnouncements = res.data.list; // 示例：假设系统公告数据与表格数据相同
        }
      });
    },
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  margin: 10px;
}
</style>

<template>
  <div class="home">
    <h1 >Welcome, {{ user.name }}! Role: {{ user.group }}</h1>
    <div class="system-announcements">
      <h2>公告</h2>
      <div v-for="(item, index) in tableData" :key="index">
        <!-- 在这里渲染每个项目 -->
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ item.title }}</span>
            <span style="float: right; padding: 3px 0; font-size: 12px" type="text">{{item.time}}</span>
          </div>
          <div class="text item">
            {{item.msg}}
          </div>
        </el-card>
      </div>
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
      const noticeUrl = "notice";
      request.get(noticeUrl,{
        params:{
          keyword:"",
          pageNum: 1,
          pageSize: 10,
        },
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

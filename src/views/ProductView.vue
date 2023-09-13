<template>
  <div>
    <div class="container">
    <el-input v-model="params.keyword"   :style="{ width: '50%' }" placeholder="输入产品名"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>

    </div>
    <el-table
        :data="tableData"
        height="1000"
        border
        style="width: 100%"
        class="parts-table"
    >
      <el-table-column prop="name" label="产品名" width="180"></el-table-column>
      <el-table-column prop="num" label="数量" width="180"></el-table-column>
      <el-table-column prop="standard" label="规格"></el-table-column>
      <el-table-column prop="planNum"  label="计划数量">
        <template slot-scope="scope">
          <span :style="{ color: 'red' }">{{ scope.row.planNum }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-popover placement="top" width="160" v-model="scope.row.addVisible">
            <el-input v-model="scope.row.addInput" placeholder="请输入内容"></el-input>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row, 'add')">取消</el-button>
              <el-button type="primary" size="mini" @click="submit(scope.row, 'add')">确定</el-button>
            </div>
            <el-button slot="reference">入库</el-button>
          </el-popover>
          <el-popover placement="top" width="160" v-model="scope.row.redVisible">
            <el-input v-model="scope.row.redInput" placeholder="请输入内容"></el-input>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row, 'red')">取消</el-button>
              <el-button type="primary" size="mini" @click="submit(scope.row, 'red')">确定</el-button>
            </div>
            <el-button slot="reference">出库</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <span class="demonstration"></span>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="params.pageNum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="params.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
  </div>

</template>


<script>
import request from "@/utils/request";
export default {
  name:"PartsView",
  data(){
    return {
      params:{
        group:"",
        keyword:"",
        pageNum:1,
        pageSize:10,
      },
      total: 0,
      successMsg:"",
      addVisible: false,
      id:"",
      countNum:"",//出入库
      min:"",
      addInput:"",
      redInput:"",
      tableData: [],

      user:localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{}

    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },
  methods:{
    load() {
      const productUrl = "parts/getProduct?keyword=" + this.params.keyword + "&pageNum=" + this.params.pageNum + "&pageSize=" + this.params.pageSize ;
      request.get(productUrl).then((res) => {
        if (res.code === '0') {
          this.tableData = res.data.list;
          this.total = res.data.total;
        }
      });
    },

    cancel(row, popoverName) {
      row.addInput = "";
      row.redInput = "";
      row[`${popoverName}Visible`] = false;
    },

    submit(row, popoverName) {
      const input = popoverName === 'add' ? row.addInput : row.redInput;

      request.post("parts/count", {
        confirm: popoverName === 'add' ? input : -input, // 如果是入库操作，则传入正数，如果是出库操作，则传入负数
        name: row.name, // 零件的name，用于标识要操作的零件

      }).then(res => {
        if (res.code === '0') {
          this.$message.success("操作成功"); // 在操作成功时显示成功消息
          row[`${popoverName}Visible`] = false; // 关闭弹出框
          // 如果需要，你可能需要重新加载数据以更新表格
          this.load();
        } else {
          this.$message.error(res.msg); // 在操作失败时显示错误消息，错误消息的内容从响应中获取
        }
      });
    },
    handleSizeChange(pageSize){
      this.params.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    search(){
      request.get("parts/searchProduct",{
        params:this.params
      }).then(res => {
        if (res.code === '0') {
          this.tableData = res.data.list
          this.total = res.data.total
        } else {
          this.$message({
            message: this.res.msg,
            type: 'error'
          });
        }
      })
    },
  }



}
</script>


<style scoped>
/* 自定义 CSS 样式规则 */
.parts-table {
  width: 100%; /* 设置表格容器的宽度为100% */
}
.container {
  margin-bottom: 20px; /* 在底部添加20像素的外边距，根据需要调整间距大小 */
}
</style>
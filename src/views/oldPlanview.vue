<template>
  <div>
    <el-input v-model="params.keyword" :style="{ width: '50%' }" placeholder="请输入计划名称"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>




    <el-table
        :data="tableData"
        height="250"
        border
        style="width: 100%"
    >
      <!--      <el-table-column prop="name" label="产品名称" width="180"></el-table-column>-->
      <el-table-column prop="name" label="产品名称" width="180"></el-table-column>
      <el-table-column prop="planNum" label="计划数量"></el-table-column>
      <el-table-column prop="madeNum" label="已完成数量"></el-table-column>
      <el-table-column prop="planDate" label="截止期限"></el-table-column>

      <el-table-column label="操作" width="200">


        <template slot-scope="scope">
          <el-button type="primary" @click="editPlan(scope.row)">修改</el-button>
          <el-popover placement="top" width="160" v-model="scope.row.delVisible">
            <p>确定完成吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row,'del')">取消</el-button>
              <el-button type="primary" size="mini" @click="delPlan(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" style="margin-left: 10px">确认完成</el-button>
          </el-popover>

        </template>


      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog :visible.sync="editVisible" title="编辑计划">
      <el-form :model="editRow" ref="editForm" label-width="100px">
        <el-form-item label="计划数量">
          <el-input v-model="editRow.planNum"></el-input>
        </el-form-item>
          <el-form-item label="已完成数量">
            <el-input v-model="editRow.madeNum"></el-input>
          </el-form-item>
            <el-form-item label="截止日期">
              <el-input v-model="editRow.planDate"></el-input>
            </el-form-item>

      </el-form>
      <div slot="footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </div>
    </el-dialog>




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

        keyword:"",
        pageNum:1,
        pageSize:10,
      },
      total: 0,
      successMsg:"",
      addVisible: false,
      id:"",
      date:"",
      productName:"",
      tableData: [],
      name: "",

      editVisible: false,
      editRow: {},
      addRow: {},

    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },
  methods:{
    load(){
      request.get("plan/getPlan",{
        params:this.params
      }).then(res=>{
        if(res.code==='0'){
          this.tableData=res.data.list
          this.total=res.data.total
        }
      })
    },
    // 打开编辑弹窗，并将要编辑的行数据保存到 editRow 变量中
    editPlan(row) {
      this.editRow = { ...row };
      this.editVisible = true;
    },
    // 取消编辑
    cancelEdit() {
      this.editVisible = false;
    },
    // 保存编辑
    saveEdit() {
      request.post("plan/editPlan", this.editRow).then((res) => {
        if (res.code === "0") {
          this.$message.success("计划修改成功");
          this.editVisible = false;
          // 如果需要，你可能需要重新加载数据以更新表格
          this.load();
        } else {
          this.$message.error(res.msg);
        }
      });
    },



    cancel(row, popoverName) {
      row[`${popoverName}Visible`] = false;
    },
    delPlan(row) {
      request.post("plan/delPlan", { name: row.name }).then(res => {
        if (res.code === '0') {
          this.$message.success("计划删除成功");
          // 如果需要，你可能需要重新加载数据以更新表格
          this.load();
        } else {
          this.$message.error(res.msg);
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
      request.get("plan/search",{
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
        this.load()//后台更新数据后重新显示
      })
    },
  }



}
</script>
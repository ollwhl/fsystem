<template>
  <div>

    <!-- 生产进度条 -->
    <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    <el-table
        :data="tableData"
        height="1000"
        border
        style="width: 100%"
    >
      <!--      <el-table-column prop="name" label="产品名称" width="180"></el-table-column>-->
      <el-table-column prop="name" label="产品名称" width="180"></el-table-column>
      <el-table-column prop="planNum" label="计划数量">
        <template slot-scope="scope">
          <span :style="{ color: 'green' }">{{ scope.row.planNum }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="produced" label="已生产数量">
        <template slot-scope="scope">
          <span :style="{ color: 'blue' }">{{ scope.row.produced }}</span>
        </template>
      </el-table-column>


      <el-table-column prop="planDate" label="截止期限">
        <template slot-scope="scope">
          <span :style="{ color: isDeadlineNear(scope.row.planDate) ? 'red' : 'green' }">{{ scope.row.planDate }}</span>
        </template>
      </el-table-column>

      <el-table-column  v-if ="user.group === '管理员' || user.group === '计划部'" label="操作" width="200">


        <template slot-scope="scope">
          <el-button  v-if ="user.group === '管理员' || user.group === '计划部'"
                     type="primary"
                     @click="editPlan(scope.row)">修改</el-button>
          <el-popover placement="top" width="160" v-model="scope.row.delVisible">
            <p>确定完成吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row,'del')">取消</el-button>
              <el-button type="primary" size="mini" @click="delPlan(scope.row)">确定</el-button>
            </div>
            <el-button  v-if ="user.group === '管理员' || user.group === '生产部'"

                        slot="reference"
                        style="margin-left: 10px">
              确认完成
            </el-button>
          </el-popover>

        </template>


      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog :visible.sync="editVisible" title="编辑计划" width="40%">
      <el-form :model="editRow" ref="editForm" label-width="100px">
        <el-form-item label="计划数量" class="quarter-width">
          <el-input v-model="editRow.planNum"></el-input>
        </el-form-item>
          <el-form-item label="已完成数量" class="quarter-width">
            <el-input v-model="editRow.produced"></el-input>
          </el-form-item>
            <el-form-item label="截止日期">
                <el-date-picker v-model="editRow.planDate"

                    placeholder="选择日期时间"
                                value-format="yyyy-MM-dd">

              </el-date-picker>
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

      showProgressbar: false, // 是否显示生产进度条
      progressPercentage: 0, // 生产进度百分比
      user:localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{},


    }
  },
  created() {//页面创建时调用的方法
    this.load()
    setInterval(this.checkDeadlines, 600000) // 600,000 毫秒 = 10 分钟

  },
  methods:{
    load(){
      request.get("plan/getPlan",{
        params:this.params
      }).then(res=>{
        if (res.code === '0'){
          this.showProgress().then(()=> {
            this.tableData = res.data.list
            this.total =res.data.total//更新总条数
            this.checkDeadlines();
          })
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

    isDeadlineNear(planDate) {
      const currentTime = new Date().getTime();
      const deadlineTime = new Date(planDate).getTime();
      const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数

      // 如果截止日期距离当前时间不足一天，则返回 true，否则返回 false
      return deadlineTime - currentTime < oneDay;
    },

    // 定时检查截止日期
    checkDeadlines() {
      // 遍历表格数据，更新视图
      this.tableData.forEach((row) => {
        row.isDeadlineNear = this.isDeadlineNear(row.planDate);
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
    showProgress() {
      return new Promise((resolve) => {
        this.showProgressbar = true; // 设置为显示生产进度条
        this.progressPercentage = 0; // 重置进度为0

        // 模拟生产进度更新，实际中需要根据您的业务逻辑来更新进度
        const interval = setInterval(() => {
          if (this.progressPercentage < 100) {
            this.progressPercentage += 10; // 每次增加10%
          } else {
            clearInterval(interval); // 达到100%后停止更新
            this.showProgressbar = false;
            resolve(); // 进度条完成后调用resolve
          }
        }, 120); // 更新频率，可以根据需要调整
      });
    },

  }



}
</script>


<style scoped>
/* 自定义 CSS 样式规则 */

.quarter-width{
  width: 300px;
}
</style>
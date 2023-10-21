<template>
  <div>
    <div class="container">
    <el-input v-model="params.keyword" :style="{ width: '50%' }" placeholder="请输入计划名称"></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>
　　　</div>

      <!-- 生产进度条 -->
      <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    <!-- 新增弹窗 -->
    <el-dialog :visible.sync="addVisible" title="新增计划" width="40%">
      <el-form :model="addRow" ref="addForm" label-width="90px" class="form-container">

        <el-form-item label="产品名称" class="quarter-width">
          <el-input v-model="addRow.name" :disabled="true" ></el-input>
        </el-form-item>
        <el-form-item label="数量" class="quarter-width">
          <el-input v-model="addRow.planNum" ></el-input>
        </el-form-item>
        <el-form-item label="零件最晚入库时间">
          <el-date-picker v-model="addRow.partsDate" placeholder="选择日期时间" value-format="yyyy-MM-dd "></el-date-picker>
        </el-form-item>
        <el-form-item label="半成品最晚入库">
          <el-date-picker v-model="addRow.halfDate"

                          placeholder="选择日期时间"
                          value-format="yyyy-MM-dd">

          </el-date-picker>
        </el-form-item>
        <el-form-item label="车间最迟完工">
          <el-date-picker v-model="addRow.producerDate"

                          placeholder="选择日期时间"
                          value-format="yyyy-MM-dd">

          </el-date-picker>
        </el-form-item>
        <el-form-item label="最迟发货">
          <el-date-picker v-model="addRow.exportDate"

                          placeholder="选择日期时间"
                          value-format="yyyy-MM-dd">

          </el-date-picker>
        </el-form-item>
        <el-form-item label="截止日期">
          <!-- Use el-date-picker for selecting a date -->
          <el-date-picker v-model="addRow.planDate" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cancelAdd">取消</el-button>
        <el-button type="primary" @click="saveAdd">保存</el-button>
      </div>
    </el-dialog>



    <el-table
        :data="tableData"
        height="1000"
        border
        style="width: 100%"
    >
<!--      <el-table-column prop="name" label="产品名称" width="180"></el-table-column>-->
      <el-table-column prop="name" label="产品名称" width="180"></el-table-column>
      <el-table-column prop="produced" label="已完成数量" ></el-table-column>
      <el-table-column prop="planNum" label="计划数量" ></el-table-column>
      <el-table-column prop="planDate" label="截止期限" width="300"></el-table-column>

      <el-table-column label="操作" width="200">


        <template slot-scope="scope">
          <el-button type="primary" class="action-button" @click="openAddDialog(scope.row)">新增</el-button>
        </template>


      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog :visible.sync="editVisible" title="编辑计划">
      <el-form :model="editRow" ref="editForm" label-width="75px">
        <el-form-item label="计划数量"  width="180">
          <el-input v-model="editRow.planNum"></el-input>
        </el-form-item>

        <el-form-item label="截止日期"  width="180">
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
      planDate:"",
      planNum:"",
      tableData: [],
      name: "",

      editVisible: false,
      editRow: {},
      addRow: {},

        showProgressbar: false, // 是否显示生产进度条
        progressPercentage: 0, // 生产进度百分比

    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },

  methods:{
    load() {
      // 先请求获取产品数据
      // request.get("parts/getProduct").then(productRes => {
      //   if (productRes.code === '0') {
      //     // 保存产品数据到 name 变量
      //     this.name = productRes.data; // 假设产品数据存储在 data 字段中
      //   } else {
      //     this.$message.error(productRes.msg);
      //   }

        // 然后请求获取计划数据
        request.get("parts/getProduct", {
          params: this.params
        }).then(res => {
            if (res.code === '0'){
                this.showProgress().then(()=> {
                    this.tableData = res.data.list
                    this.total =res.data.total//更新总条数
                })
            } else {
            this.$message.error(res.msg);
          }
        });
      // });
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


// 打开新增弹窗
    openAddDialog(row) {
      this.addRow = {
        name: row.name,
        planNum: '',

        planDate: ''
      }; // 清空新增数据
      this.addVisible = true;
    },
    // 取消新增
    cancelAdd() {
      this.addVisible = false;
    },
    // 保存新增
    saveAdd() {
      const partsTimeTimestamp = new Date(this.editRow.partsDate).getTime();
      const halfTimeTimestamp = new Date(this.editRow.halfDate).getTime();
      const exportTimeTimestamp = new Date(this.editRow.exportDate).getTime();
      const planDateTimestamp = new Date(this.editRow.planDate).getTime();
      const producerTimestamp = new Date(this.editRow.producerDate).getTime();
      if (partsTimeTimestamp > producerTimestamp || halfTimeTimestamp > producerTimestamp) {
        this.$message.error("零件最晚入库时间和半成品最晚入库时间不能晚于最晚完工时间");
        return;
      }

      // 检查最晚完工时间是否晚于最迟发货时间
      if (producerTimestamp > exportTimeTimestamp) {
        this.$message.error("最晚完工时间不能晚于最迟发货时间");
        return;
      }

      // 检查最迟发货时间是否晚于截止日期
      if (exportTimeTimestamp > planDateTimestamp) {
        this.$message.error("最迟发货时间不能晚于截止日期");
        return;
      }

      // 检查数量和截止日期是否为空
      if (!this.addRow.planNum || !this.addRow.planDate) {
        this.$message.error("数量和截止日期不能为空");
        return;
      }

      request.post("plan/editPlan", this.addRow

      ).then((res) => {
        if (res.code === "0") {
          this.$message.success("新增计划成功");
          this.addVisible = false;
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
      request.post("plan/delPlan", { id: row.id }).then(res => {
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
.container {
  margin-bottom: 20px; /* 在底部添加20像素的外边距，根据需要调整间距大小 */
}
.quarter-width{
  width: 300px;
}

</style>
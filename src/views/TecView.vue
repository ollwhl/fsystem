<template>

  <div>
    <el-input
        v-model="params.productName"
        placeholder="输入产品名进行搜索合成表"
        :style="{ width: '25%' }"
        style="margin-bottom: 10px"
    ></el-input>
    <el-button type="warning" class="action-button" @click="search()">查询</el-button>
    <el-button type="primary" class="action-button" @click="openDialog">新增产品</el-button>
    <!--    <el-button type="primary" class="action-button" @click="openPartsDialog">新增零件</el-button>-->

    <!-- 生产进度条 -->
    <el-progress v-if="showProgressbar" :percentage="progressPercentage" />

    <template>
      <div>

        <el-dialog :visible.sync="dialogData.dialogVisible" title="添加产品构成">
          <div>
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px;">产品名：</span>
              <el-input v-model="dialogData.productName" :style="{ width: '50%' ,marginBottom: '10px'}" @input="handleInput" placeholder="在这里输入内容" />
              <span>{{dialogData.checkMessage}}</span>
            </div>
            <template v-if="showProductDetails">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <el-input v-model="dialogData.productId" :style="{ width: '50%' ,marginBottom: '5px'}" placeholder="产品编号" />
                <div style="width: 10px;"></div>
              <el-input v-model="dialogData.productStandard" :style="{ width: '50%' ,marginBottom: '5px' }" placeholder="产品规格" />
                <div style="width: 10px;"></div>
              <el-input v-model="dialogData.productDescription"  :style="{ width: '50%' ,marginBottom: '5px'}"placeholder="产品描述" />
              </div>
            </template>
            <div v-for="(text, index) in dialogData.partNameList" :key="index">
              <div style="display: flex; align-items: center;">
                <span style="margin-right: 10px;">零件 {{ index + 1 }}：</span>
                <el-input v-model="dialogData.partNameList[index]" style="margin-right: 10px;" @input="handleInputForAddedInput(index)" :placeholder="'零件 ' + (index + 1)" />

                <span style="margin-right: 10px;">数量：</span>
                <el-input v-model="dialogData.numList[index]" @input="handleInputForAddedNum(index)" :placeholder="'零件数量'" />
                <el-button @click="removePart(index)" icon="el-icon-close"></el-button>
              </div>
            </div>
            <span>{{dialogData.checkPartsMessage}}</span>
            <template v-if="dialogData.checkPartsMessage === '仓库中不存在该零件，请先向仓库添加该零件'">
              <el-button type="primary" class="action-button" @click="openPartsDialog()">向仓库添加新零件</el-button>
            </template>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="addInputBox" :disabled="isDisabled">添加零件</el-button>
            <el-button type="success" @click="submitForm">提交表格</el-button>
            <el-button @click="closeDialog">关闭</el-button>
          </span>
        </el-dialog>
      </div>
    </template>



    <!--
       +-------------------------------------------------+
       |                                                 |
       |        这里table-column的顺序很j8重要别tm动!!       |
       |                                                 |
       +-------------------------------------------------+
    -->
    <el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%"  height="750">
      <el-table-column label="产品名称" prop="productName"></el-table-column>
      <el-table-column label="产品规格" prop="productStandard"></el-table-column>
      <el-table-column label="零件名" prop="partsName"></el-table-column>
      <el-table-column prop="preWarn" label="备件数"></el-table-column>
      <el-table-column label="所需数量" prop="num"></el-table-column>
      <el-table-column label="所在仓库" prop="partsGroup"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="edit(scope.row)" >修改</el-button>
          <el-popover
              placement="top"
              width="160"
              v-model="scope.row.delVisible">
            <p>确定删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancel(scope.row,'del')">取消</el-button>
              <el-button type="primary" size="mini" @click="delParts(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" style="margin-left: 10px" >删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!-- 编辑弹窗 -->
    <el-dialog :visible.sync="editVisible" title="编辑零件数量">
      <el-form :model="editRow" ref="editForm" label-width="100px">
        <el-form-item label="零件数量">
          <el-input v-model.number="editRow.num"></el-input>
        </el-form-item>
        <el-form-item label="备件数">
          <el-input v-model.number="editRow.preWarn"></el-input>
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

    <el-dialog :visible.sync="partDialogVisible" title="新增零件" :style="{ 'z-index': 9999 }">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="margin-right: 12px;">零件编号：</span>
          <el-input v-model="newPartsForm.id" :style="{ width: '48%' }"  placeholder="在这里输入零件描述" />
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="margin-right: 12px;">零件名：</span>
          <el-input v-model="newPartsForm.name" :style="{ width: '48%' }" placeholder="在这里输入零件名" />
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="margin-right: 12px;">零件类型：</span>
          <el-select v-model="newPartsForm.group" placeholder="请选择仓库类型" style="width: 48%;">
            <el-option label="零件" value="零件仓库"></el-option>
            <el-option label="半成品" value="半成品仓库"></el-option>
          </el-select>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="margin-right: 12px;">零件规格：</span>
          <el-input v-model="newPartsForm.standard" :style="{ width: '48%' }" placeholder="在这里输入零件描述" />
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="margin-right: 12px;">备件数：</span>
          <el-input v-model="newPartsForm.preWarn" :style="{ width: '48%' }" placeholder="在这里输入备件数" />
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="margin-right: 12px;">零件描述：</span>
          <el-input v-model="newPartsForm.note" :style="{ width: '48%' }" placeholder="在这里输入零件描述" />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitAddPartsForm">确定</el-button>
              <el-button @click="partDialogVisible = false">取消</el-button>
            </span>
    </el-dialog>
  </div>

</template>


<script>
import request from "@/utils/request";

export default {
  name: "TecView",
  data() {
    return {
      //别tm动下面两行
      margeArray: [],
      tableData: [],

      params: {
        keyword: "",
        pageSize:10,
        pageNum:1,
      },
      total: 0,


      index:0,
      addProductDialogVisible: false,
      newProductForm: {
        productName: "",
        partsName:"",
        num:"",
      },

      partDialogVisible:false,
      newPartsForm:{
        id:"",
        name:"",
        standard:"",
        preWarn:"",
        note:"",
        group:"",
      },


      //edit
      editVisible: false,
      editRow: {},

      dialogData: {
        dialogVisible: false,
        productName: '',
        productId:'',
        partNameList: [''], // 初始有一个输入框
        numList: [''],
        checkMessage: '', // 存储检查后的消息
        checkPartsMessage: "",
        productStandard: "",
        productDescription: ""
      },

      showProductDetails: true,
      showPartsDetails:true,


      successMsg: "",
      formLabelWidth: '120px',

      showProgressbar: false, // 是否显示生产进度条
      progressPercentage: 0, // 生产进度百分比
    }
  },
  created() {//页面创建时调用的方法
    this.load()
  },
  computed: {
    isDisabled() {
      return this.dialogData.checkPartsMessage === "仓库中不存在该零件，请先向仓库添加该零件"|| this.dialogData.checkPartsMessage === ""
    }
  },
  methods: {
    // +-----------------------------------+
    // |                                   |
    // |          千万别tm动load()!!!!      |
    // |          可以调用但别动内容          |
    // |                                   |
    // +-----------------------------------+
    load() {
      request.get("tech", {//get获取
        params: this.params
      }).then(res => {//使用get方法请求/amdin
        if (res.code === '0'){
          this.showProgress().then(()=> {
            this.tableData = res.data.list
            //开始 调用方法计算需要合并的数据
            if (this.tableData.length === 0){
              return
            }
            for (let i = 0; i < Object.keys(this.tableData[0]).length; i++) {
              // 首先添加一个存放合并行数据的变量
              this.margeArray.push({Arr: [], Position: 0,})
              // 得到下标对应的key值
              const element = Object.keys(this.tableData[0])[i];
              // 调用合并，
              this.rowspan(this.tableData, this.margeArray[i].Arr, this.margeArray[i].Position, element);
              this.total = res.data.total//更新总条数
            }
          })
        }
       })
    },
    handleSizeChange(pageSize) {
      this.params.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) {
      this.params.pageNum = pageNum
      this.load()
    },

    cancel(row, popoverName) {
      row.delParts = "";

      row[`${popoverName}Visible`] = false;
      row.delVisible = false;

    },
    search() {
      request.get("tech/search", {
        params: this.params
      }).then(res => {
        if (res.code === '0') {
          this.tableData = res.data.list//从返回的数据更新到当前页面
          this.total = res.data.total//更新所有返回数据的总条数
        } else {

        }
      })
    },

    openDialog() {
      this.index=0;
      this.dialogData = {
        dialogVisible: false,
        productName: '',
        partNameList: [''], // 初始有一个输入框
        numList: [''],
        checkMessage: '', // 存储检查后的消息
        checkPartsMessage: ""
      },
          this.dialogData.dialogVisible = true;
    },
    handleInput() {
      const productName = this.dialogData.productName;
      request.get(`parts/findProductByName?name=${productName}`)
          .then(res => {
            if (res.code === '0') {
              this.dialogData.checkMessage = "产品已存在,新增构成";
              this.showProductDetails = false;
              //console.log("ok");
            } else {
              this.dialogData.checkMessage = "新增产品";
              //console.log("not ok");
              this.showProductDetails = true;
            }
          });
    },

    handleInputForAddedInput(index) {
      const partsName = this.dialogData.partNameList[index];
      request.get(`parts/findPartsByName?name=${partsName}`)
          .then(res => {
            if (res.code === '0') {
              this.dialogData.checkPartsMessage = "零件存在"
              console.log("ok")
            } else {
              this.dialogData.checkPartsMessage = "仓库中不存在该零件，请先向仓库添加该零件"
              console.log(" no ok")
            }
          });
    },
    handleInputForAddedNum(index) {
    },
    addInputBox() {
      this.dialogData.checkPartsMessage = ""
      this.dialogData.partNameList.push('');
      this.dialogData.numList.push('');
      this.index++
      console.log(this.index)
    },
    removePart(index) {
      this.dialogData.partNameList.splice(index, 1);
      this.dialogData.numList.splice(index, 1);
      this.index--
      this.dialogData.checkPartsMessage = "零件存在"
    },
    submitForm() {//提交产品零件
      if (this.dialogData.checkMessage === "新增产品") {
        if (!this.dialogData.productId) {
          this.$message.error('产品编号不能为空');
          return; // 如果产品编号为空且产品不存在，不执行后续操作
        }
      }
      for (let i = 0; i < this.dialogData.partNameList.length; i++) {
        request.post("tech/addTechRow", {
          productName: this.dialogData.productName,
          productId: this.dialogData.productId,
          productNote:this.dialogData.productDescription,
          productStandard:this.dialogData.productStandard,
          partsName: this.dialogData.partNameList[i],
          num: this.dialogData.numList[i]
        }).then(
            res => {
              if (res.code === '0') {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.load();
                this.dialogData.dialogVisible = false;
              } else {
                this.$message.error(res.msg);
              }
            }
        )
      }
      //location.reload();
    },
    closeDialog() {
      this.dialogData.dialogVisible = false;
      this.timeoutIds = []; // 关闭弹窗时清除计时器ID
    },

    openPartsDialog(){
      const partsName = this.dialogData.partNameList[this.index];
      console.log('openPartsDialog() method is called.');
      console.log(this.index)
      this.newPartsForm={}
      this.newPartsForm.name = partsName
      this.partDialogVisible = true;
      console.log("???")
    },
    submitAddPartsForm() {//提交表单调用该方法
      if (!this.newPartsForm.id) {
        this.$message.error('零件编号不能为空');
        return; // 如果零件编号为空，不执行后续操作
      }
      if (!this.newPartsForm.group) {
        this.$message.error('仓库不能为空');
        return;
      }


      request.post("parts/addParts", {
        id:this.newPartsForm.id,
        name:this.newPartsForm.name,
        group:this.newPartsForm.group,
        standard:this.newPartsForm.standard,
        note:this.newPartsForm.note
      }).then(res => {
        if (res.code === '0') {
          this.partDialogVisible = false
          this.dialogData.checkPartsMessage = "零件存在"
          this.$message({
            message: '零件添加成功',
            type: 'success'
          });
        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          });
        }

      })
    },



    //这tm干啥用的
    submitAddForm(dialogName) {//提交表单调用该方法
      request.post("tech/add", {
        productName: this.addForm.productName, // Use entered product name
        partsName: this.addForm.partsName,     // Use entered parts name
      }).then(res => {
        if (res.code === '0') {
          this[`${dialogName}Visible`] = false
          this.$message({
            message: this.successMsg,
            type: 'success'
          });
          this.load();

        } else {
          this.$message({
            message: res.msg,
            type: 'error'
          });
        }

      })
      //location.reload();
    },
    edit(row){
      // 将行数据复制到编辑行数据中
      this.editRow = { ...row };
      this.editVisible = true;
    },
    cancelEdit() {
      this.editVisible = false; // 关闭编辑弹窗
    },
    saveEdit(row) {
      // 保存编辑后的数据
      // 提交编辑的逻辑，例如发送请求更新后端数据
      request.post("tech/edit",{
        id:this.editRow.id,
        preWarn:this.editRow.preWarn,
        num:this.editRow.num,
      }).then(res=>
      {
        if(res.code==='0'){
          this.$message.success("修改成功");
        }else {
          this.$message.error(res.msg);
        }
      })
      console.log('编辑提交', this.editRow);
      // 关闭编辑弹窗
      this.editVisible = false;
      //location.reload();
    },

    delParts(row){
      request.post("/tech/delParts", {id: row.id}).then(res=>{

        if(res.code==='0'){
          this.$message({
            message:"删除成功",
            type: 'success'
          });
        }else{
          this.$message({
            message:res.msg,
            type: 'error'
          })
        }
      })
      row.delVisible=false
    },

    //new part add










    // +-----------------------------------+
    // |                                   |
    // |          也别tm动这块!!!            |
    // |                                   |
    // +-----------------------------------+
    rowspan(tableData, spanArr, position, spanName) {
      tableData.forEach((item, index) => {
        if (index === 0) {
          spanArr.push(1);
          position = 0;
        } else {
          if (tableData[index][spanName] === tableData[index - 1][spanName]) {
            spanArr[position] += 1;
            spanArr.push(0);
          } else {
            spanArr.push(1);
            position = index;
          }
        }
      });
    },
    // +-----------------------------------+
    // |                                   |
    // |          这块也tm别动!!!            |
    // |                                   |
    // +-----------------------------------+
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      // 计算一共有几列数据
      let arraynum = Object.keys(this.tableData[0]).length
      for (let i = 0; i < 2; i++) {
        if (columnIndex == i) {
          const _row = this.margeArray[i].Arr[rowIndex];
          const _col = _row > 0 ? 1 : 0;
          return {
            rowspan: _row,
            colspan: _col,
          };
        }
      }
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


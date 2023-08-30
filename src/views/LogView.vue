<template>
  <div>
    <el-button @click="openDialog" type="primary">打开弹窗</el-button>

    <el-dialog :visible.sync="dialogData.dialogVisible" title="自动生成输入框和自动检查">
      <div>
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 12px;">产品名：</span>
          <el-input v-model="dialogData.inputText" @input="handleInput" placeholder="在这里输入内容" />
        </div>
        <span>{{ dialogData.checkMessage }}</span>
        <div v-for="(text, index) in dialogData.inputList" :key="index">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">输入框 {{ index + 2 }}：</span>
            <el-input v-model="dialogData.inputList[index]" @input="handleInputForAddedInput(index)" :placeholder="'输入框 ' + (index + 2)" />
            <span>{{ dialogData.checkMessages[index] }}</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <el-button type="primary" @click="addInputBox">新增输入框</el-button>
          <el-button type="success" @click="submitForm">提交表格</el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        dialogData: {
          dialogVisible: false,
          inputText: '',
          inputList: [''], // 初始有一个输入框
          checkMessage: '', // 存储检查后的消息
          checkMessages: ['','','','','']
        },
        timeoutIds: [] // 存储每个输入框的计时器ID
      };
    },
    methods: {
      openDialog() {
        this.dialogData.dialogVisible = true;
      },
      handleInput() {
        clearTimeout(this.timeoutIds[0]);
        this.timeoutIds[0] = setTimeout(() => {
          this.performCheck();
        }, 3000);
      },
      handleInputForAddedInput(index) {
        clearTimeout(this.timeoutIds[index + 1]);
        this.timeoutIds[index + 1] = setTimeout(() => {
          this.performCheckForAddedInput(index);
        }, 3000);
      },
      performCheck() {
        // 模拟检查操作
        this.dialogData.checkMessage = '检查完成';
        setTimeout(() => {
          this.dialogData.checkMessage = ''; // 清除消息
        }, 2000);
      },
      performCheckForAddedInput(index) {
        // 模拟检查操作
        this.dialogData.checkMessages[index] = (index + '检查完成');
        console.log(index + this.dialogData.checkMessages[index]);

        setTimeout(() => {
          this.dialogData.checkMessages[index] = ""; // 清除消息
        }, 2000);
        console.log(index + this.dialogData.checkMessages[index]);
      },
      addInputBox() {
        if (this.dialogData.inputList.length < 5) {
          this.dialogData.inputList.push('');
          this.timeoutIds.push(null); // 新增输入框时，添加一个新的计时器ID
        }
      },
      submitForm() {
        // 提交表格的逻辑
        console.log('表格已提交');
      },
      closeDialog() {
        this.dialogData.dialogVisible = false;
        this.timeoutIds = []; // 关闭弹窗时清除计时器ID
      }
    }
  };
</script>
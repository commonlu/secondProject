<template>
  <div class="employee-page">
    <!-- 顶部工具区 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <h3 class="page-title">
          <el-icon><User /></el-icon>
          员工列表
        </h3>
        <p class="page-subtitle">查看与管理员工基础信息，支持搜索、导出与打印</p>
      </div>
      <div class="page-header-actions">
        <!-- 仅管理员可新增员工 -->
        <el-button type="primary" @click="handleAdd" v-if="canOperate()">
          新增员工
        </el-button>
        <el-button type="success" @click="handleExport">
          数据导出
        </el-button>
        <el-button @click="handlePrintPreview">
          数据打印
        </el-button>
        <el-button type="primary" plain @click="toggleChatbot">
          AI助手
        </el-button>
      </div>
    </div>

    <!-- 内容卡片 -->
    <div class="employee-card">
      <!-- Element Plus 的加载动画 -->
      <el-skeleton :rows="5" animated v-if="loading" />

      <!-- 表格与筛选 -->
      <div v-else>
        <!-- 筛选区域 -->
        <div class="filter-container">
          <div class="filter-row">
            <div class="filter-item">
              <span class="filter-label">员工编号：</span>
              <el-input
                v-model="searchCode"
                placeholder="请输入员工编号"
                clearable
                size="small"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">员工姓名：</span>
              <el-input
                v-model="searchName"
                placeholder="请输入员工姓名"
                clearable
                size="small"
              />
            </div>
            <div class="filter-actions">
              <el-button type="primary" size="small" @click="handleSearch">
                搜索
              </el-button>
              <el-button size="small" @click="resetSearch">
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 表格区域 -->
        <el-table :data="employeeList" stripe border class="employee-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="code" label="员工编号" />
          <el-table-column prop="name" label="员工姓名" />
          <el-table-column prop="gender" label="性别" />
          <el-table-column prop="birthday" label="出生日期" />
          <el-table-column prop="phone" label="手机号码" />
          <el-table-column prop="pwd" label="密码">
            <template #default="scope">
              <span v-if="scope.row.pwd">●●●●●●</span>
              <span v-else>无密码</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="员工地址" />
          <el-table-column prop="remark" label="员工备注" />
          <el-table-column prop="deptId" label="部门编号" />
          <el-table-column prop="status" label="员工状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '在职' : '离职' }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 操作列 -->
          <el-table-column label="操作" width="200">
            <template #default="scope">
          <el-button
              v-if="canOperate()"
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
              v-if="canOperate()"
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 编辑/新增对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="30%">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="员工编号">
          <el-input v-model="formData.code"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="formData.gender" placeholder="请选择">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
              v-model="formData.birthday"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="formData.phone"></el-input>
        </el-form-item>
        <el-form-item label="员工地址">
          <el-input v-model="formData.address"></el-input>
        </el-form-item>
        <el-form-item label="员工备注">
          <el-input v-model="formData.remark"></el-input>
        </el-form-item>
        <el-form-item label="部门编号">
          <el-input v-model.number="formData.deptId"></el-input>
        </el-form-item>
        <el-form-item label="员工状态">
          <el-select v-model="formData.status" placeholder="请选择">
            <el-option label="在职" value="1"></el-option>
            <el-option label="离职" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 打印预览对话框 -->
    <el-dialog
        title="打印预览"
        v-model="printPreviewVisible"
        width="80%"
        :before-close="handlePrintPreviewClose">
      <div id="print-area">
        <h2 style="text-align: center; margin-bottom: 20px;">员工信息列表</h2>
        <el-table :data="employeeList" stripe style="width: 100%" id="print-table">
          <el-table-column prop="id" label="ID" width="60"/>
          <el-table-column prop="code" label="员工编号" width="100"/>
          <el-table-column prop="name" label="员工姓名" width="100"/>
          <el-table-column prop="gender" label="性别" width="60"/>
          <el-table-column prop="birthday" label="出生日期" width="120"/>
          <el-table-column prop="phone" label="手机号码" width="120"/>
          <el-table-column prop="address" label="员工地址"/>
          <el-table-column prop="status" label="员工状态" width="80">
            <template #default="scope">
              <span>{{ scope.row.status === 1 ? '在职' : '离职' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="printPreviewVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePrint">确认打印</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <!-- 聊天机器人浮动按钮 -->
  <div class="chatbot-container" :class="{ 'expanded': chatbotExpanded }">

    <div class="chatbot-body" v-show="chatbotExpanded">
      <div class="chat-messages" ref="messagesContainer">
        <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="['message', message.type]"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
            v-model="userInput"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            :disabled="isBotThinking"
        >
          <template #append>
            <el-button
                :loading="isBotThinking"
                @click="sendMessage"
                :disabled="!userInput.trim() || isBotThinking"
            >
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User } from '@element-plus/icons-vue';

export default {
  name: 'EmployeeList',
  components: {
    User,
  },
  data() {
    return {
      employeeList: [],
      loading: true,
      dialogVisible: false,
      printPreviewVisible: false,
      dialogTitle: '',
      isEditMode: false,
      searchCode: '',     // 搜索用的员工编号
      searchName: '',     // 搜索用的员工姓名
      formData: {
        id: null,
        name: '',
        gender: '',
        status: '',
        phone: '',
        pwd: '',
        address: '',
        remark: '',
        birthday: '',
        code: '',
        deptId: null,
      },
      // 聊天机器人相关数据
      chatbotExpanded: false,
      chatMessages: [
        {
          type: 'bot',
          content: '您好！我是您的HR助手，可以帮您查询员工信息、解答系统使用问题等。请问有什么可以帮助您的吗？',
          timestamp: new Date()
        }
      ],
      userInput: '',
      isBotThinking: false,
      // 用户角色相关
      currentUser: {
        role: 'user', // 默认视为普通用户，实际从后端获取
        username: ''
      },
    };
  },
  methods: {
    // 获取当前用户信息（基于后端解析 JWT）
    fetchCurrentUser() {
      axios.get('/api/employees/current')
          .then(response => {
            this.currentUser = response.data;
          })
          .catch(error => {
            console.error('获取用户信息失败:', error);
          });
    },
    // 判断是否为管理员
    isAdmin() {
      return this.currentUser.role === 'admin';
    },

    // 判断是否显示操作按钮
    canOperate() {
      return this.isAdmin();
    },


    fetchEmployees() {
      this.loading = true;
      axios.get('/api/employees')
          .then(response => {
            this.employeeList = response.data;
            console.log('员工数据获取成功:', this.employeeList);
          })
          .catch(error => {
            console.error('获取员工数据失败:', error);
            this.$message.error('获取员工数据失败，请检查后端服务是否启动。');
          })
          .finally(() => {
            this.loading = false;
          });
    },

    // 编辑员工
    handleEdit(row) {
      console.log('编辑员工:', row);
      this.dialogTitle = '编辑员工';
      this.isEditMode = true;

      // 将当前行的数据复制到表单中（实现预填充）
      this.formData = { ...row };

      // 显示对话框
      this.dialogVisible = true;
    },

    // 新增员工
    handleAdd() {
      console.log('新增员工');
      this.dialogTitle = '新增员工';
      this.isEditMode = false;

      // 重置表单数据
      this.formData = {
        id: null,
        name: '',
        gender: '',
        status: '',
        phone: '',
        pwd: '',
        address: '',
        remark: '',
        birthday: '',
        code: '',
        deptId: null,
      };

      // 显示对话框
      this.dialogVisible = true;
    },

    //导出数据
    handleExport(){
      axios({
        method: 'get',
        url: '/api/employees/export',
        responseType: 'blob' // 关键：指定响应类型为blob
      })
          .then(response => {
            // 创建一个Blob对象
            const blob = new Blob([response.data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // 创建下载链接
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'employees.xlsx'; // 设置下载文件名

            // 触发下载
            document.body.appendChild(link);
            link.click();

            // 清理
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            console.log('导出成功');
            ElMessage.success('导出成功');
          })
          .catch(error => {
            console.error('导出失败:', error);
            const errorMsg = error.response?.data?.message || error.message || '导出失败';
            ElMessage.error('导出失败: ' + errorMsg);
          });
    },

    // 打印预览
    handlePrintPreview() {
      this.printPreviewVisible = true;
    },

    // 处理打印预览关闭
    handlePrintPreviewClose(done) {
      this.$confirm('确认关闭打印预览吗？')
          .then(() => {
            done();
          })
          .catch(() => {
            // 取消关闭
          });
    },

    // 执行打印
    handlePrint() {
      // 获取打印区域内容
      const printContent = document.getElementById('print-area').innerHTML;

      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>员工信息打印</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h2 { text-align: center; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // 等待内容加载完成后打印
      printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
      };

      // 关闭预览窗口
      this.printPreviewVisible = false;
    },

    // 提交表单（新增或编辑）
    submitForm() {
      // 数据预处理
      const submitData = { ...this.formData };

      // 确保 deptId 是数字类型或 null
      if (submitData.deptId !== null && submitData.deptId !== '') {
        submitData.deptId = Number(submitData.deptId);
      } else {
        submitData.deptId = null;
      }

      if (this.isEditMode) {
        // 编辑模式：调用更新API
        axios.put(`/api/employees/${submitData.id}`, submitData)
            .then(response => {
              console.log('更新成功:', response);
              ElMessage.success('更新成功');
              this.dialogVisible = false;
              this.fetchEmployees();
            })
            .catch(error => {
              console.error('更新失败:', error);
              const errorMsg = error.response?.data?.message || error.message || '更新失败';
              ElMessage.error('更新失败: ' + errorMsg);
            });
      } else {
        // 新增模式：调用新增API
        axios.post('/api/employees', submitData)
            .then(response => {
              console.log('新增成功:', response);
              ElMessage.success('新增成功');
              this.dialogVisible = false;
              this.fetchEmployees();
            })
            .catch(error => {
              console.error('新增失败:', error);
              const errorMsg = error.response?.data?.message || error.message || '新增失败';
              ElMessage.error('新增失败: ' + errorMsg);
            });
      }
    },

    handleDelete(row) {
      console.log('删除员工:', row);
      ElMessageBox.confirm(
          `确定要删除员工【${row.name}】吗？此操作不可恢复。`,
          '警告',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
          }
      )
          .then(() => {
            console.log('用户确认删除，员工ID:', row.id);

            axios.delete(`/api/employees/${row.id}`)
                .then(response => {
                  console.log('删除成功:', response.data);
                  ElMessage({
                    type: 'success',
                    message: response.data,
                  });
                  this.fetchEmployees();
                })
                .catch(error => {
                  console.error('删除失败:', error);
                  const errorMsg = error.response?.data?.message || error.message || '删除失败';
                  ElMessage.error('删除失败: ' + errorMsg);
                });
          })
          .catch(() => {
            console.log('用户取消了删除操作');
            ElMessage.info('已取消删除');
          });
    },

    // 搜索员工方法
    handleSearch() {
      console.log('搜索员工:', this.searchCode, this.searchName);

      // 构造搜索参数
      const params = {};
      if (this.searchCode) {
        params.code = this.searchCode;
      }
      if (this.searchName) {
        params.name = this.searchName;
      }

      // 如果没有搜索条件，则获取所有员工
      if (Object.keys(params).length === 0) {
        this.fetchEmployees();
        return;
      }

      // 调用搜索API
      this.loading = true;
      axios.get('/api/employees/search', { params })
          .then(response => {
            this.employeeList = response.data;
            console.log('搜索结果:', this.employeeList);
          })
          .catch(error => {
            console.error('搜索失败:', error);
            this.$message.error('搜索失败，请稍后重试');
          })
          .finally(() => {
            this.loading = false;
          });
    },

    // 重置搜索条件并获取所有员工
    resetSearch() {
      this.searchCode = '';
      this.searchName = '';
      this.fetchEmployees();
    },
    // 聊天机器人相关方法
    toggleChatbot() {
      this.chatbotExpanded = !this.chatbotExpanded;
      if (this.chatbotExpanded) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    sendMessage() {
      if (!this.userInput.trim() || this.isBotThinking) return;

      const userMessage = {
        type: 'user',
        content: this.userInput,
        timestamp: new Date()
      };

      this.chatMessages.push(userMessage);
      const question = this.userInput;
      this.userInput = '';
      this.isBotThinking = true;

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // 🚀 改为调用真实后端 AI 接口
      axios.post('/api/ai/chat', { question })
          .then(response => {
            const botMessage = {
              type: 'bot',
              content: response.data.answer, // 后端返回的 answer 字段
              timestamp: new Date()
            };
            this.chatMessages.push(botMessage);
          })
          .catch(error => {
            console.error('AI服务调用失败:', error);
            const errorMessage = {
              type: 'bot',
              content: '抱歉，AI服务暂时不可用，请稍后再试。',
              timestamp: new Date()
            };
            this.chatMessages.push(errorMessage);
          })
          .finally(() => {
            this.isBotThinking = false;
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          });
    },


    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

  },


  mounted() {
    this.fetchEmployees();
    this.fetchCurrentUser(); // 获取当前用户信息

  }
};
</script>

<style scoped>
.employee-page {
  padding: 20px 24px 40px;
}

.employee-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 150, 199, 0.12);
  padding: 16px 20px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title-wrap {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title i {
  color: #00acc1;
}

.page-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.page-header-actions :deep(.el-button) + .el-button {
  margin-left: 8px;
}

.filter-container {
  margin-bottom: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  background: #e0f7fa;
  border: 1px solid #b2ebf2;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  color: #00838f;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.employee-table {
  width: 100%;
  margin-top: 4px;
}

.employee-table :deep(.el-table__header th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #374151;
}

#print-table th,
#print-table td {
  padding: 5px !important;
  font-size: 12px;
}

/* 聊天机器人样式 */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
}

.chatbot-container.expanded {
  height: 500px;
}

.chatbot-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
}

.chatbot-body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #f9f9f9;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.bot {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message.user .message-content {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 5px;
}

.message.bot .message-content {
  background: #e9ecef;
  color: #333;
  border-bottom-left-radius: 5px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #eee;
  background: white;
}

</style>

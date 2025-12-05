<template>
  <div class="salary-page">
    <div class="page-header">
      <div class="page-title-wrap">
        <h3 class="page-title">
          <el-icon><Money /></el-icon>
          薪资管理
        </h3>
        <p class="page-subtitle">查看员工薪酬构成，支持导出报表</p>
      </div>
      <div class="page-header-actions">
        <el-button 
          v-if="isAdmin()" 
          type="success" 
          @click="handleExport" 
          icon="el-icon-download">
          数据导出
        </el-button>
      </div>
    </div>

    <div class="salary-card">
      <!-- Element Plus employee-container的加载动画 -->
      <el-skeleton :rows="5" animated v-if="loading" />

      <!-- Element Plus 的表格组件 -->
      <el-table v-else :data="salaryList" stripe border class="salary-table">
        <el-table-column prop="id" label="ID" width="80" sortable></el-table-column>
        <el-table-column prop="staffId" label="员工编号" sortable></el-table-column>
        <el-table-column prop="employeeName" label="员工姓名" sortable></el-table-column>
        <el-table-column prop="baseSalary" label="基本工资" sortable>
          <template #default="scope">
            {{ scope.row.baseSalary ? '¥' + scope.row.baseSalary : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="subside" label="生活补贴" sortable>
          <template #default="scope">
            {{ scope.row.subside ? '¥' + scope.row.subside : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="bonus" label="奖金" sortable>
          <template #default="scope">
            {{ scope.row.bonus ? '¥' + scope.row.bonus : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="lateDeduct" label="迟到扣款" sortable>
          <template #default="scope">
            {{ scope.row.lateDeduct ? '¥' + scope.row.lateDeduct : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="leaveDeduct" label="早退扣款" sortable>
          <template #default="scope">
            {{ scope.row.leaveDeduct ? '¥' + scope.row.leaveDeduct : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalSalary" label="总工资" sortable>
          <template #default="scope">
            <span style="font-weight: bold; color: #409EFF;">
              {{ scope.row.totalSalary ? '¥' + scope.row.totalSalary : '待计算' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="month" label="发放日期" sortable>
          <template #default="scope">
            {{ scope.row.month ? scope.row.month : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>



<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Money } from '@element-plus/icons-vue';

export default {
  name: 'SalaryList',
  components: {
    Money,
  },
  data() {
    return {
      salaryList: [],
      loading: true,
      // 当前用户角色
      currentUser: {
        role: 'user',
        username: ''
      }
    };
  },
  methods: {
    // 获取当前用户信息
    fetchCurrentUser() {
      const role = localStorage.getItem('role') || 'user';
      const username = localStorage.getItem('username') || '';
      this.currentUser = {
        role: role,
        username: username
      };
    },
    // 判断是否为管理员
    isAdmin() {
      return this.currentUser.role === 'admin';
    },
    fetchSalaryList() {
      this.loading = true;
      axios.get('/api/salaries')  // 修改API端点，假设后端提供 /api/salaries
          .then(response => {
            this.salaryList = response.data;
            console.log('工资数据获取成功:', this.salaryList);
          })
          .catch(error => {
            console.error('获取工资数据失败:', error);
            ElMessage.error('获取工资数据失败，请检查后端服务是否启动。');
          })
          .finally(() => {
            this.loading = false;
          });
    },
    //导出数据
    handleExport(){
      axios({
        method: 'get',
        url: '/api/salaries/export',
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
            link.download = 'salaries.xlsx'; // 设置下载文件名

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
  },

  mounted() {
    this.fetchCurrentUser();
    this.fetchSalaryList();
  }
};
</script>

<style scoped>
.salary-page {
  padding: 20px 24px 40px;
}

.salary-card {
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

.salary-table {
  width: 100%;
  margin-top: 4px;
}

.salary-table :deep(.el-table__header th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

:deep(.el-table .cell) {
  text-align: center;
}
</style>

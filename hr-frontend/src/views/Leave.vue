<template>
  <div class="leave-container">
    <!-- Element Plus 的加载动画 -->
    <el-skeleton :rows="5" animated v-if="loading"/>
    <!-- Element Plus 的表格组件 -->
    <div v-else>
      <div class="filter-container" style="background-color: #f0f9ff; border: 1px solid #b3e0ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <span style="margin-right: 15px; color: #11998e; font-weight: bold;">员工编号：</span>
        <el-input v-model="searchCode" placeholder="员工编号" style="width: 120px; margin-right: 20px;"></el-input>
        <span style="margin-right: 15px; color: #11998e; font-weight: bold;">员工姓名：</span>
        <el-input v-model="searchName" placeholder="员工姓名" style="width: 120px; margin-right: 20px;"></el-input>
        <el-button type="primary" @click="handleSearch" style="margin-right: 10px;">
          搜索
        </el-button>
        <el-button @click="resetSearch">
          重置
        </el-button>
      </div>

      <el-table :data="leaveList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="staffId" label="员工编号"/>
        <el-table-column prop="employeeName" label="员工姓名"/>
        <el-table-column prop="days" label="请假天数"/>
        <el-table-column prop="typeNum" label="请假类型">
          <template #default="scope">
            <el-tag :type="scope.row.typeNum === 1 ? 'success' : 'danger'">
              {{ scope.row.typeNum === 1 ? '事假' : '病假' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期"/>
        <el-table-column prop="status" label="员工状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="请假备注"/>
        <el-table-column prop="createTime" label="发起时间"/>
        <el-table-column prop="updateTime" label="更新时间">
        </el-table-column>
        <el-table-column label="操作" width="200" v-if="canOperate()">
          <template #default="scope">
            <div v-if="scope.row.approvalStatus === 'approved'">
              <el-tag type="success">已批准</el-tag>
            </div>
            <div v-else-if="scope.row.approvalStatus === 'rejected'">
              <el-tag type="danger">已驳回</el-tag>
            </div>
            <div v-else>
              <el-button
                  type="primary"
                  size="small"
                  @click="handleEdit(scope.row)">
                批准
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)">
                驳回
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'leaveList',
  data() {
    return {
      leaveList: [],
      loading: true,
      dialogVisible: false,
      dialogTitle: '',
      isEditMode: false,
      searchCode: '',     // 搜索用的员工编号
      searchName: '',     // 搜索用的员工姓名
      formData: {
        id: null,
        staffId: '',
        employeeName: '',
        days: '',
        typeNum: '',
        startDate: '',
        status: '',
        remark: '',
        createTime: '',
        updateTime: '',
        approvalStatus: '' // 添加审批状态字段
      },
      // 用户角色相关
      currentUser: {
        role: 'admin', // 默认为管理员，实际应从localStorage获取
        username: ''
      },
    };
  },
  methods: {
    // 获取当前用户信息
    fetchCurrentUser() {
      const role = localStorage.getItem('role') || 'admin';
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

    // 判断是否显示操作按钮
    canOperate() {
      return this.isAdmin();
    },

    fetchLeaveList() {
      this.loading = true;
      axios.get('/api/leaves')
          .then(response => {
            // 为每条记录添加审批状态字段，默认为待审批
            this.leaveList = response.data.map(item => ({
              ...item,
              approvalStatus: item.approvalStatus || 'pending'
            }));
            console.log('请假数据获取成功:', this.leaveList);
          })
          .catch(error => {
            console.error('获取请假数据失败:', error);
            this.$message.error('获取请假数据失败，请检查后端服务是否启动。');
          })
          .finally(() => {
            this.loading = false;
          });
    },

    // 批准请假申请
    handleEdit(row) {
      console.log('批准请假申请:', row);
      // 更新本地数据状态为已批准
      const index = this.leaveList.findIndex(item => item.id === row.id);
      if (index !== -1) {
        this.leaveList[index].approvalStatus = 'approved';
      }
    },

    // 驳回请假申请
    handleDelete(row) {
      console.log('驳回请假申请:', row);
      // 更新本地数据状态为已驳回
      const index = this.leaveList.findIndex(item => item.id === row.id);
      if (index !== -1) {
        this.leaveList[index].approvalStatus = 'rejected';
      }
    },

    // 搜索请假记录方法
// 搜索请假记录方法
    handleSearch() {
      console.log('搜索请假记录:', this.searchCode, this.searchName);

      // 构造搜索参数
      const params = {};
      if (this.searchCode) {
        params.staffId = this.searchCode;
      }
      if (this.searchName) {
        params.employeeName = this.searchName;
      }

      // 如果没有搜索条件，则获取所有请假记录
      if (Object.keys(params).length === 0) {
        this.fetchLeaveList();
        return;
      }

      // 调用搜索API
      this.loading = true;
      axios.get('/api/leaves/search', { params })
          .then(response => {
            console.log('搜索接口返回原始数据:', response.data);

            // 确保返回的是数组格式
            let rawData = [];
            if (Array.isArray(response.data)) {
              rawData = response.data;
            } else if (response.data && typeof response.data === 'object') {
              // 检查是否是分页数据或其他包装格式
              if (Array.isArray(response.data.data)) {
                rawData = response.data.data;
              } else if (Array.isArray(response.data.list)) {
                rawData = response.data.list;
              } else {
                // 如果是单个对象，包装成数组
                rawData = [response.data];
              }
            } else {
              console.warn('无法识别的数据格式:', response.data);
              rawData = [];
            }

            // 为搜索结果添加审批状态字段
            this.leaveList = rawData.map(item => ({
              ...item,
              approvalStatus: item.approvalStatus || 'pending'
            }));
            console.log('处理后的搜索结果:', this.leaveList);
          })
          .catch(error => {
            console.error('搜索失败:', error);
            this.$message.error('搜索失败，请稍后重试');
            this.leaveList = [];
          })
          .finally(() => {
            this.loading = false;
          });
    },


    // 重置搜索条件并获取所有请假记录
    resetSearch() {
      this.searchCode = '';
      this.searchName = '';
      this.fetchLeaveList();
    },
  },

  mounted() {
    this.fetchCurrentUser();
    this.fetchLeaveList();
  }
};
</script>

<style scoped>
.employee-container {
  padding: 20px;
}
</style>

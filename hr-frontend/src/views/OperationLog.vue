<template>
  <div class="operation-log-page">
    <div class="page-header">
      <div class="page-title-wrap">
        <h3 class="page-title">
          <el-icon><Document /></el-icon>
          操作日志
        </h3>
        <p class="page-subtitle">查看系统操作记录，追踪关键操作历史</p>
      </div>
    </div>

    <div class="log-card">
      <!-- 筛选区域 -->
      <div class="filter-container">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">用户名：</span>
            <el-input
              v-model="filters.username"
              placeholder="请输入用户名"
              clearable
              size="small"
              style="width: 150px;"
            />
          </div>
          <div class="filter-item">
            <span class="filter-label">操作模块：</span>
            <el-select
              v-model="filters.module"
              placeholder="请选择模块"
              clearable
              size="small"
              style="width: 150px;"
            >
              <el-option label="员工管理" value="employee" />
              <el-option label="请假管理" value="leave" />
              <el-option label="薪资管理" value="salary" />
              <el-option label="文件管理" value="document" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">操作类型：</span>
            <el-select
              v-model="filters.operationType"
              placeholder="请选择类型"
              clearable
              size="small"
              style="width: 150px;"
            >
              <el-option label="新增" value="add" />
              <el-option label="修改" value="update" />
              <el-option label="删除" value="delete" />
              <el-option label="批准" value="approve" />
              <el-option label="驳回" value="reject" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">开始时间：</span>
            <el-date-picker
              v-model="filters.startTime"
              type="datetime"
              placeholder="选择开始时间"
              size="small"
              style="width: 180px;"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <div class="filter-item">
            <span class="filter-label">结束时间：</span>
            <el-date-picker
              v-model="filters.endTime"
              type="datetime"
              placeholder="选择结束时间"
              size="small"
              style="width: 180px;"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <div class="filter-actions">
            <el-button type="primary" size="small" @click="handleSearch">
              搜索
            </el-button>
            <el-button size="small" @click="resetFilters">
              重置
            </el-button>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table :data="logList" stripe border class="log-table" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="操作模块" width="120">
          <template #default="scope">
            <el-tag type="primary">{{ getModuleName(scope.row.module) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="scope">
            <el-tag :type="getOperationTypeColor(scope.row.operationType)">
              {{ getOperationTypeName(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="操作对象ID" width="120" />
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="createTime" label="操作时间" width="180" sortable />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Document } from '@element-plus/icons-vue';

export default {
  name: 'OperationLog',
  components: {
    Document,
  },
  data() {
    return {
      logList: [],
      loading: false,
      filters: {
        username: '',
        module: '',
        operationType: '',
        startTime: '',
        endTime: '',
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
      },
    };
  },
  methods: {
    // 获取操作日志列表
    fetchLogs() {
      this.loading = true;
      const params = {
        page: this.pagination.page,
        pageSize: this.pagination.pageSize,
        ...this.filters,
      };

      // 移除空值
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      axios.get('/api/operation-logs', { params })
          .then(response => {
            if (response.data.error) {
              this.$message.error(response.data.error);
              this.logList = [];
              this.pagination.total = 0;
            } else {
              this.logList = response.data.list || [];
              this.pagination.total = response.data.total || 0;
            }
          })
          .catch(error => {
            console.error('获取操作日志失败:', error);
            this.$message.error('获取操作日志失败，请检查权限或网络连接');
            this.logList = [];
            this.pagination.total = 0;
          })
          .finally(() => {
            this.loading = false;
          });
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1; // 重置到第一页
      this.fetchLogs();
    },

    // 重置筛选条件
    resetFilters() {
      this.filters = {
        username: '',
        module: '',
        operationType: '',
        startTime: '',
        endTime: '',
      };
      this.pagination.page = 1;
      this.fetchLogs();
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.page = 1;
      this.fetchLogs();
    },

    // 页码改变
    handlePageChange(page) {
      this.pagination.page = page;
      this.fetchLogs();
    },

    // 获取模块名称
    getModuleName(module) {
      const moduleMap = {
        employee: '员工管理',
        leave: '请假管理',
        salary: '薪资管理',
        document: '文件管理',
      };
      return moduleMap[module] || module;
    },

    // 获取操作类型名称
    getOperationTypeName(type) {
      const typeMap = {
        add: '新增',
        update: '修改',
        delete: '删除',
        approve: '批准',
        reject: '驳回',
      };
      return typeMap[type] || type;
    },

    // 获取操作类型颜色
    getOperationTypeColor(type) {
      const colorMap = {
        add: 'success',
        update: 'warning',
        delete: 'danger',
        approve: 'success',
        reject: 'info',
      };
      return colorMap[type] || '';
    },
  },
  mounted() {
    this.fetchLogs();
  },
};
</script>

<style scoped>
.operation-log-page {
  padding: 20px 24px 40px;
}

.log-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 150, 199, 0.12);
  padding: 16px 20px 20px;
}

.page-header {
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

.filter-container {
  margin-bottom: 16px;
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

.log-table {
  width: 100%;
  margin-top: 4px;
}

.log-table :deep(.el-table__header th) {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #374151;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>


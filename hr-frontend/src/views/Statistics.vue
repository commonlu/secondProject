<template>
  <div class="statistics-container">
    <h2 class="page-title">
      <el-icon><DataAnalysis /></el-icon>
      数据统计中心
    </h2>

    <!-- 第一个区域：核心人力指标 -->
    <div class="stats-section">
      <h3 class="section-title">核心人力指标</h3>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ employeeStats.total || 0 }}</h3>
            <p>员工总数</p>
            <span class="stat-desc">当前系统内所有员工</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-success">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ employeeStats.active || 0 }}</h3>
            <p>在职员工</p>
            <span class="stat-desc">在职率: {{ employeeStats.total > 0 ? ((employeeStats.active / employeeStats.total) * 100).toFixed(1) : 0 }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-danger">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ employeeStats.inactive || 0 }}</h3>
            <p>离职员工</p>
            <span class="stat-desc">流失率: {{ employeeStats.total > 0 ? ((employeeStats.inactive / employeeStats.total) * 100).toFixed(1) : 0 }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ employeeStats.malePercentage || 0 }}</h3>
            <p>男性员工</p>
            <span class="stat-desc">占比: {{ employeeStats.total > 0 ? ((employeeStats.malePercentage / employeeStats.total) * 100).toFixed(1) : 0 }}%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-info">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ employeeStats.femalePercentage || 0 }}</h3>
            <p>女性员工</p>
            <span class="stat-desc">占比: {{ employeeStats.total > 0 ? ((employeeStats.femalePercentage / employeeStats.total) * 100).toFixed(1) : 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二个区域：员工信息滚动列表（原薪资结构分析部分） -->
    <div class="stats-section">
      <h3 class="section-title">员工信息</h3>
      <div class="section-subtitle">所有员工信息列表</div>
      <div class="employee-scroll-container">
        <div class="employee-list" ref="employeeList">
          <div class="employee-item" v-for="employee in employees" :key="employee.id">
            <div class="employee-info">
              <div class="employee-name">{{ employee.name }}</div>
              <div class="employee-details">
                <span class="employee-dept">{{ employee.deptId }}</span>
                <span class="employee-position">{{ employee.position }}</span>
                <span class="employee-phone">{{ employee.phone }}</span>
              </div>
            </div>
            <div class="employee-status" :class="{ 'active': employee.status === 1, 'inactive': employee.status === 0 }">
              {{ employee.status === 1 ? '在职' : '离职' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三个区域：请假统计分析 -->
    <div class="stats-section">
      <h3 class="section-title">请假统计分析</h3>
      <div class="section-subtitle">按请假类型统计本月请假情况</div>
      <div class="chart-container">
        <div class="leave-chart">
          <div class="leave-bar" v-for="(item, index) in leaveStats" :key="index">
            <div class="bar-container">
              <div class="bar-fill" :style="{ height: (item.count / maxLeaveCount) * 50 + '%' }"></div>
            </div>
            <div class="bar-label">{{ item.type }}</div>
            <div class="bar-value">{{ item.count }}次</div>
            <div class="bar-percentage" v-if="getTotalLeaveCount() > 0">
              {{ ((item.count / getTotalLeaveCount()) * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
      <div class="chart-summary">
        <span>总请假次数: <strong>{{ getTotalLeaveCount() }}</strong></span>
        <span>平均每人: <strong>{{ employeeStats.active > 0 ? (getTotalLeaveCount() / employeeStats.active).toFixed(1) : 0 }}</strong> 次</span>
      </div>
    </div>

    <!-- 第四个区域：文件统计卡片 -->
    <div class="stats-section">
      <h3 class="section-title">文件统计</h3>
      <div class="file-stats-cards">
        <div class="file-stat-card">
          <div class="file-stat-icon bg-primary">
            <el-icon><Document /></el-icon>
          </div>
          <div class="file-stat-info">
            <h3>{{ fileStats.totalCount || 0 }}</h3>
            <p>文件总数</p>
          </div>
        </div>

        <div class="file-stat-card">
          <div class="file-stat-icon bg-success">
            <el-icon><Box /></el-icon>
          </div>
          <div class="file-stat-info">
            <h3>{{ fileStats.totalSize || 0 }} MB</h3>
            <p>占用空间</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {
  DataAnalysis,
  User,
  UserFilled,
  Check,
  Close,
  Document,
  Box,
} from '@element-plus/icons-vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Statistics',
  components: {
    DataAnalysis,
    User,
    UserFilled,
    Check,
    Close,
    Document,
    Box,
  },
  data() {
    return {
      loading: true,
      // 员工统计数据
      employeeStats: {
        total: 0,
        active: 0,
        inactive: 0,
        malePercentage: 0,
        femalePercentage: 0
      },
      // 员工列表数据
      employees: [],
      // 自动滚动相关
      scrollInterval: null,
      scrollSpeed: 1,
      // 请假统计数据
      leaveStats: [
        { type: '事假', count: 0 },
        { type: '病假', count: 0 },
        { type: '年假', count: 0 },
        { type: '调休', count: 0 },
        { type: '婚假', count: 0 },
        { type: '产假', count: 0 }
      ],
      maxLeaveCount: 1,
      // 文件统计数据
      fileStats: {
        totalCount: 0,
        totalSize: 0
      },
      currentMonth: ''
    };
  },
  methods: {
    async fetchAllStats() {
      this.loading = true;
      try {
//         后端API建议：
//         为了支持这个统计页面，后端需要提供以下接口：
// /api/employees/stats - 员工统计数据
//         /api/leaves/stats - 请假统计数据
//         /api/documents/stats - 文件统计数据
//         /api/salaries/distribution - 工资分布数据
//         你可以将这个组件添加到路由中，并在导航菜单中添加相应的链接。
        // 获取员工统计数据
        await this.fetchEmployeeStats();

        // 获取所有员工信息
        await this.fetchEmployees();

        // 获取请假统计数据
        await this.fetchLeaveStats();

        // 获取文件统计数据
        await this.fetchFileStats();

        // 设置当前月份
        const now = new Date();
        this.currentMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;
      } catch (error) {
        console.error('获取统计数据失败:', error);
        this.$message.error('获取统计数据失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    // 获取所有员工信息
    async fetchEmployees() {
      try {
        const response = await axios.get('/api/employees');
        this.employees = response.data;
        // 启动自动滚动
        this.startAutoScroll();
      } catch (error) {
        console.error('获取员工数据失败:', error);
      }
    },

    // 启动自动滚动
    startAutoScroll() {
      const container = this.$refs.employeeList;
      if (!container) return;
      
      // 清除之前的定时器
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
      }
      
      // 设置自动滚动定时器
      this.scrollInterval = setInterval(() => {
        container.scrollTop += this.scrollSpeed;
        
        // 滚动到顶部时重新开始
        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          container.scrollTop = 0;
        }
      }, 50);
    },

    // 停止自动滚动
    stopAutoScroll() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },

    async fetchEmployeeStats() {
      try {
        const response = await axios.get('/api/employees/stats');
        this.employeeStats = response.data;

        // 计算最大请假数量用于图表比例
        const leaveCounts = this.leaveStats.map(item => item.count);
        this.maxLeaveCount = Math.max(...leaveCounts, 1);
      } catch (error) {
        console.error('获取员工统计数据失败:', error);
      }
    },

    async fetchLeaveStats() {
      try {
        const response = await axios.get('/api/leaves/stats');
        // 假设后端返回的数据格式为 { type: count }
        const leaveData = response.data;

        // 更新请假统计数据
        this.leaveStats = this.leaveStats.map(item => ({
          ...item,
          count: leaveData[item.type] || 0
        }));

        // 计算最大请假数量用于图表比例
        const leaveCounts = this.leaveStats.map(item => item.count);
        this.maxLeaveCount = Math.max(...leaveCounts, 1);
      } catch (error) {
        console.error('获取请假统计数据失败:', error);
      }
    },

    async fetchFileStats() {
      try {
        const response = await axios.get('/api/documents/stats');
        this.fileStats = response.data;
      } catch (error) {
        console.error('获取文件统计数据失败:', error);
      }
    },
    // 计算总请假次数
    getTotalLeaveCount() {
      return this.leaveStats.reduce((sum, item) => sum + item.count, 0);
    }
  },
  mounted() {
    this.fetchAllStats();
  },
  // 组件销毁时清除定时器，避免内存泄漏
  beforeUnmount() {
    this.stopAutoScroll();
  }
};
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
}

.page-title i {
  margin-right: 10px;
  color: #409eff;
}

.stats-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 20px;
  font-style: italic;
}

/* 员工统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.bg-primary {
  background: linear-gradient(135deg, #4b6cb7, #182848);
}

.bg-success {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.bg-danger {
  background: linear-gradient(135deg, #f7971e, #ff0000);
}

.bg-warning {
  background: linear-gradient(135deg, #f7971e, #ffd200);
}

.bg-info {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-info h3 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: #333;
}

.stat-info p {
  color: #777;
  margin: 0;
  font-weight: 600;
}

.stat-desc {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
  font-weight: normal;
}

/* 文件统计卡片 */
.file-stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.file-stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.file-stat-card:hover {
  transform: translateY(-5px);
}

.file-stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.file-stat-info h3 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: #333;
}

.file-stat-info p {
  color: #777;
  margin: 0;
}

/* 图表容器 */
.chart-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 请假统计图表 */
.leave-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
}

.leave-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14%;
}

.bar-container {
  width: 40px;
  height: 130px;
  background: linear-gradient(180deg, #e0f2ff, #ffffff);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  border: none;
  box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.5);
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #4b6cb7, #182848);
  border-radius: 5px;
  transition: height 1s ease;
}

.bar-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-bottom: 5px;
  font-weight: bold;
}

.bar-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: bold;
}

.bar-percentage {
  font-size: 0.7rem;
  color: #999;
  margin-top: 2px;
}

.chart-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
  color: #666;
}

.chart-summary strong {
  color: #409eff;
  font-size: 1rem;
}

/* 工资分布图表 */
.salary-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
}

.salary-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 15%;
}

.salary-bar-container {
  width: 40px;
  height: 130px;
  background: linear-gradient(180deg, #fef9c3, #ffffff);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  border: none;
  box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.35);
}

.salary-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #11998e, #38ef7d);
  border-radius: 5px;
  transition: height 1s ease;
}

.salary-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-bottom: 5px;
  font-weight: bold;
}

.salary-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: bold;
}

/* 员工信息滚动容器 */
.employee-scroll-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  height: 300px;
  overflow: hidden;
  position: relative;
}

/* 员工列表 */
.employee-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.employee-list::-webkit-scrollbar {
  display: none;
}

/* 员工项 */
.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.employee-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 员工信息 */
.employee-info {
  flex: 1;
}

.employee-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.employee-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 0.85rem;
  color: #666;
}

.employee-dept, .employee-position, .employee-phone {
  display: flex;
  align-items: center;
}

/* 员工状态 */
.employee-status {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  min-width: 60px;
}

.employee-status.active {
  background: #d1fae5;
  color: #065f46;
}

.employee-status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards,
  .file-stats-cards {
    grid-template-columns: 1fr;
  }

  .leave-chart {
    flex-wrap: wrap;
    height: auto;
  }

  .leave-bar {
    width: 30%;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
  
  /* 员工列表响应式 */
  .employee-scroll-container {
    height: 250px;
  }
  
  .employee-details {
    gap: 10px;
    font-size: 0.8rem;
  }
}
</style>

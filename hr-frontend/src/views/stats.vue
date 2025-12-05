<template>
  <div class="stats-cards">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="1" animated />
    </div>
    <template v-else>
      <!-- 员工总数 -->
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalEmployees || 0 }}</h3>
          <p>员工总数</p>
        </div>
      </div>

      <!-- 部门数量 -->
      <div class="stat-card">
        <div class="stat-icon bg-success">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalDepartments || 6 }}</h3>
          <p>部门数量</p>
        </div>
      </div>

      <!-- 出勤率 -->
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ stats.attendanceRate || '98' }}%</h3>
          <p>出勤率</p>
        </div>
      </div>

      <!-- 待处理 -->
      <div class="stat-card">
        <div class="stat-icon bg-info">
          <el-icon><Tickets /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ stats.pendingLeaves || 0 }}</h3>
          <p>待处理</p>
        </div>
      </div>
    </template>
  </div>

  <!-- 图表区域 -->
  <div class="tech-section">
    <!-- 下方区域：左侧图表 + 右侧快捷入口 -->
    <div class="tech-layout">
      <!-- 图表网格布局：修改为2列（适配工资分布+考勤记录） -->
      <div class="charts-grid">
      <!-- 员工性别比例图 -->
      <div class="chart-card">
        <h3 class="section-title">员工性别比例</h3>
        <div class="chart-meta">
          <div class="meta-badge meta-primary">
            <span class="meta-label">男性</span>
            <span class="meta-value">{{ genderSummary.maleCount }}人</span>
          </div>
          <div class="meta-badge meta-orange">
            <span class="meta-label">女性</span>
            <span class="meta-value">{{ genderSummary.femaleCount }}人</span>
          </div>
          <div class="meta-badge meta-slate">
            <span class="meta-label">总人数</span>
            <span class="meta-value">{{ genderSummary.total }}人</span>
          </div>
        </div>
        <div class="chart-container">
          <div class="gender-stats">
            <div class="gender-item">
              <div class="gender-label male">男 {{ genderRatio.male }}%</div>
              <div class="gender-bar">
                <div class="gender-bar-fill male-fill" :style="{ width: genderRatio.male + '%' }"></div>
              </div>
            </div>
            <div class="gender-item">
              <div class="gender-label female">女 {{ genderRatio.female }}%</div>
              <div class="gender-bar">
                <div class="gender-bar-fill female-fill" :style="{ width: genderRatio.female + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 部门员工分布图 -->
      <div class="chart-card">
        <h3 class="section-title">部门员工分布</h3>
        <div class="chart-meta">
          <div class="meta-badge meta-primary">
            <span class="meta-label">覆盖部门</span>
            <span class="meta-value">{{ departmentSummary.totalDepartments }}个</span>
          </div>
          <div class="meta-badge meta-green">
            <span class="meta-label">人数最多</span>
            <span class="meta-value">{{ departmentSummary.topDepartment.name }}</span>
          </div>
          <div class="meta-badge meta-slate">
            <span class="meta-label">人数</span>
            <span class="meta-value">{{ departmentSummary.topDepartment.count }}人</span>
          </div>
        </div>
        <div class="chart-container">
          <div class="department-chart">
            <div class="department-bar" v-for="(dept, index) in departmentData" :key="index">
              <div class="bar-container">
                <div class="bar-fill" :style="{ height: dept.percentage + '%' }"></div>
              </div>
              <div class="bar-label">{{ dept.name }}</div>
              <div class="bar-value">{{ dept.count }}人</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工资结构折线图 -->
      <div class="chart-card">
        <h3 class="section-title">工资结构趋势</h3>
        <div class="chart-meta">
          <div class="meta-badge meta-primary">
            <span class="meta-label">覆盖员工</span>
            <span class="meta-value">{{ salarySummary.totalCount }}人</span>
          </div>
          <div class="meta-badge meta-purple">
            <span class="meta-label">最高区间</span>
            <span class="meta-value">{{ salarySummary.topRange.range }}</span>
          </div>
          <div class="meta-badge meta-slate">
            <span class="meta-label">人数</span>
            <span class="meta-value">{{ salarySummary.topRange.count }}人</span>
          </div>
        </div>
        <div class="chart-container salary-line-chart">
          <svg
              class="line-chart-svg"
              :viewBox="'-5 -5 130 110'"
              preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="salaryLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#bfdbfe" stop-opacity="0.05"/>
              </linearGradient>
            </defs>
            <polygon
                v-if="salaryLineAreaPoints"
                class="line-area"
                :points="salaryLineAreaPoints"
            />
            <polyline
                v-if="salaryLinePoints"
                class="line-path"
                :points="salaryLinePoints"
            />
            <g v-for="(point, index) in salaryChartPoints" :key="'salary-point-' + index">
              <circle class="line-point" :cx="point.x" :cy="point.y" r="4"/>
              <text class="line-value" :x="point.x" :y="point.y - 8">{{ point.count }}</text>
            </g>
          </svg>
          <div class="line-labels">
            <div class="line-label" v-for="(point, index) in salaryChartPoints" :key="'salary-label-' + index">
              <span class="label-dot"></span>
              <span class="label-range">{{ point.range }}</span>
            </div>
          </div>
        </div>
      </div>

        <!-- 今日考勤记录：网格卡片布局（替换原表格部分） -->
        <div class="chart-card">
          <h3 class="section-title">今日考勤记录</h3>
          <div class="chart-meta meta-wrap">
            <div class="meta-badge meta-primary">
              <span class="meta-label">总记录</span>
              <span class="meta-value">{{ attendanceSummary.total }}条</span>
            </div>
            <div class="meta-badge meta-green">
              <span class="meta-label">正常</span>
              <span class="meta-value">{{ attendanceSummary.normal }}</span>
            </div>
            <div class="meta-badge meta-orange">
              <span class="meta-label">迟到</span>
              <span class="meta-value">{{ attendanceSummary.late }}</span>
            </div>
            <div class="meta-badge meta-danger">
              <span class="meta-label">缺勤/请假</span>
              <span class="meta-value">{{ attendanceSummary.absent }}</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="attendance-grid">
              <!-- 有数据时渲染卡片 -->
              <div
                  v-for="(record, index) in attendanceData"
                  :key="index"
                  class="attendance-card"
                  :class="'status-' + record.status.toLowerCase()"
              >
                <div class="card-header">
                  <span class="employee-name">{{ record.employeeName }}</span>
                  <span class="status-badge">{{ record.status }}</span>
                </div>
                <div class="card-body">
                  <div class="info-row">
                    <el-icon class="info-icon"><OfficeBuilding /></el-icon>
                    <span>{{ record.department }}</span>
                  </div>
                  <div class="info-row">
                    <el-icon class="info-icon"><Timer /></el-icon>
                    <span>{{ record.checkInTime || '未打卡' }}</span>
                  </div>
                  <div class="info-row remark">
                    <el-icon class="info-icon"><Notebook /></el-icon>
                    <span>{{ record.remark || '无备注' }}</span>
                  </div>
                </div>
              </div>

              <!-- 无数据时显示 -->
              <div v-if="attendanceData.length === 0" class="empty-state">
                <el-icon><Document /></el-icon>
                <p>暂无今日考勤数据</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      <!-- 右侧快捷入口 + 公告（同尺寸卡片） -->
      <div class="sidebar-column">
        <aside class="quick-actions">
          <h3 class="qa-title">快捷入口</h3>
          <p class="qa-subtitle">常用操作一键直达</p>
          <div class="qa-list">
            <div class="qa-item" @click="goShortcut('employee')">
              <div class="qa-icon qa-icon-blue">
                <el-icon><User /></el-icon>
              </div>
              <div class="qa-info">
                <h4>员工管理</h4>
                <p>查看与维护员工信息</p>
              </div>
            </div>

            <div class="qa-item" @click="goShortcut('attendance')">
              <div class="qa-icon qa-icon-green">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="qa-info">
                <h4>请假审批</h4>
                <p>处理员工请假与考勤</p>
              </div>
            </div>

            <div class="qa-item" @click="goShortcut('salary')">
              <div class="qa-icon qa-icon-orange">
                <el-icon><Tickets /></el-icon>
              </div>
              <div class="qa-info">
                <h4>薪资管理</h4>
                <p>发放与调整员工薪资</p>
              </div>
            </div>

            <div class="qa-item" @click="goShortcut('department')">
              <div class="qa-icon qa-icon-purple">
                <el-icon><Document /></el-icon>
              </div>
              <div class="qa-info">
                <h4>文件管理</h4>
                <p>上传与归档人事文件</p>
              </div>
            </div>
          </div>
        </aside>

        <aside
            v-if="announcementList.length"
            class="mini-announcements"
        >
          <div class="mini-ann-header">
            <div>
              <h3>最新公告</h3>
              <p>实时同步系统通知</p>
            </div>
            <button class="mini-ann-more" @click="handleViewMoreAnnouncements">更多</button>
          </div>
          <ul class="mini-ann-list">
            <li
                v-for="(item, index) in announcementList"
                :key="item.id || index"
                class="mini-ann-item"
            >
              <span class="mini-ann-dot" :class="'dot-' + getAnnouncementTagType(item)"></span>
              <div class="mini-ann-text">
                <p class="mini-ann-title">{{ item.title || '系统公告' }}</p>
                <p class="mini-ann-content">{{ item.content || '敬请关注更多系统通知～' }}</p>
              </div>
              <span class="mini-ann-time">{{ formatAnnouncementTime(item) }}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import {
  User,
  OfficeBuilding,
  Calendar,
  Tickets,
  Timer,
  Notebook,
  Document,
} from '@element-plus/icons-vue';

export default {
  name: 'DashboardStats',
  emits: ['switchTab'], // 声明组件会抛出的事件
  props: {
    announcements: {
      type: Array,
      default: () => []
    }
  },
  components: {
    User,
    OfficeBuilding,
    Calendar,
    Tickets,
    Timer,
    Notebook,
    Document,
  },
  data() {
    return {
      stats: {
        totalEmployees: 0,
        pendingLeaves: 0,
        totalDepartments: 6,
        attendanceRate: '98'
      },
      loading: false,
      genderRatio: {
        male: 50,
        female: 50
      },
      departmentData: [
        { name: '技术部', count: 2, percentage: 25 },
        { name: '销售部', count: 1, percentage: 12.5 },
        { name: '人事部', count: 2, percentage: 25 },
        { name: '财务部', count: 1, percentage: 12.5 },
        { name: '市场部', count: 1, percentage: 12.5 },
        { name: '运营部', count: 1, percentage: 12.5 }
      ],
      salaryData: [
        { range: '<5K', count: 1, percentage: 12.5 },
        { range: '5K-10K', count: 3, percentage: 37.5 },
        { range: '10K-15K', count: 2, percentage: 25 },
        { range: '15K-20K', count: 1, percentage: 12.5 },
        { range: '>20K', count: 1, percentage: 12.5 }
      ],
      // 今日考勤记录数据（可从接口获取，此处为模拟数据）
      attendanceData: [
        { employeeName: '张三', department: '技术部', status: '正常', checkInTime: '08:25', remark: '无' },
        { employeeName: '李四', department: '销售部', status: '迟到', checkInTime: '09:10', remark: '交通延误' },
        { employeeName: '王五', department: '人事部', status: '正常', checkInTime: '08:40', remark: '无' },
        { employeeName: '赵六', department: '财务部', status: '缺勤', checkInTime: '', remark: '请假1天' },
        { employeeName: '孙七', department: '市场部', status: '正常', checkInTime: '08:15', remark: '无' },
        { employeeName: '周八', department: '运营部', status: '正常', checkInTime: '08:30', remark: '无' }
      ],
      lineChartWidth: 100,
      lineChartHeight: 100
    };
  },
  computed: {
    announcementList() {
      return (this.announcements || []).slice(0, 4);
    },
    genderSummary() {
      const total = this.stats.totalEmployees || 0;
      const malePercent = Number(this.genderRatio.male) || 0;
      const femalePercent = Number(this.genderRatio.female) || 0;
      const maleCount = Math.round((malePercent / 100) * total);
      const femaleCount = Math.round((femalePercent / 100) * total);
      return {
        total,
        maleCount,
        femaleCount
      };
    },
    departmentSummary() {
      const data = Array.isArray(this.departmentData) ? this.departmentData : [];
      if (!data.length) {
        return {
          totalDepartments: 0,
          topDepartment: { name: '-', count: 0 }
        };
      }
      const topDepartment = data.reduce((prev, curr) => ((curr.count || 0) > (prev.count || 0) ? curr : prev), data[0]);
      return {
        totalDepartments: data.length,
        topDepartment: {
          name: topDepartment.name || '-',
          count: topDepartment.count || 0
        }
      };
    },
    salarySummary() {
      const data = Array.isArray(this.salaryData) ? this.salaryData : [];
      if (!data.length) {
        return {
          totalCount: 0,
          topRange: { range: '-', count: 0 }
        };
      }
      const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
      const topRange = data.reduce((prev, curr) => ((curr.count || 0) > (prev.count || 0) ? curr : prev), data[0]);
      return {
        totalCount,
        topRange: {
          range: topRange.range || '-',
          count: topRange.count || 0
        }
      };
    },
    attendanceSummary() {
      const data = Array.isArray(this.attendanceData) ? this.attendanceData : [];
      const summary = {
        total: data.length,
        normal: 0,
        late: 0,
        absent: 0
      };
      data.forEach(item => {
        const status = (item.status || '').trim();
        if (status === '正常') summary.normal += 1;
        else if (status === '迟到') summary.late += 1;
        else summary.absent += 1;
      });
      return summary;
    },
    salaryChartPoints() {
      const width = this.lineChartWidth;
      const height = this.lineChartHeight;
      const data = Array.isArray(this.salaryData) ? this.salaryData : [];
      const max = this.maxSalaryCount || Math.max(...data.map(d => d.count || 0), 1);
      if (data.length === 0) return [];
      const step = data.length > 1 ? width / (data.length - 1) : 0;
      const topPadding = 10;
      const bottomPadding = 10;
      const usableHeight = height - topPadding - bottomPadding;
      return data.map((item, index) => {
        const count = item.count || 0;
        const x = data.length > 1 ? index * step : width / 2;
        const ratio = max > 0 ? count / max : 0;
        const y = topPadding + (usableHeight - ratio * usableHeight);
        return {
          x,
          y: Number.isFinite(y) ? y : height - bottomPadding,
          range: item.range,
          count
        };
      });
    },
    salaryLinePoints() {
      if (!this.salaryChartPoints.length) return '';
      return this.salaryChartPoints.map(point => `${point.x},${point.y}`).join(' ');
    },
    salaryLineAreaPoints() {
      if (!this.salaryChartPoints.length) return '';
      const baseY = this.lineChartHeight;
      const firstX = this.salaryChartPoints[0].x;
      const lastX = this.salaryChartPoints[this.salaryChartPoints.length - 1].x;
      const middlePoints = this.salaryChartPoints.map(point => `${point.x},${point.y}`).join(' ');
      return `${firstX},${baseY} ${middlePoints} ${lastX},${baseY}`;
    }
  },
  methods: {
    async fetchStats() {
      this.loading = true;
      try {
        const response = await this.$axios.get('/api/stats/dashboard');
        // 更新基础统计数据
        this.stats = {
          totalEmployees: response.data.totalEmployees || 0,
          pendingLeaves: response.data.pendingLeaves || 0,
          totalDepartments: response.data.totalDepartments || 6,
          attendanceRate: response.data.attendanceRate || '98'
        };
        // 按需更新图表数据
        if (response.data.genderRatio) this.genderRatio = response.data.genderRatio;
        if (response.data.departmentData) this.departmentData = response.data.departmentData;
        if (response.data.salaryData) this.salaryData = response.data.salaryData;
        // 关键：从接口获取真实考勤数据（替换模拟数据）
        if (response.data.attendanceData) this.attendanceData = response.data.attendanceData;
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        this.loading = false;
      }
    },
    startAutoRefresh() {
      // 每5分钟自动刷新（含考勤数据）
      setInterval(() => this.fetchStats(), 5 * 60 * 1000);
    },
    // 向父组件抛出事件，请求切换到对应模块
    goShortcut(tab) {
      this.$emit('switchTab', tab);
    },
    getAnnouncementTagType(item) {
      const level = item?.level;
      if (level === 'urgent' || level === 1) return 'activity';
      if (level === 'important' || level === 2) return 'info';
      return 'notice';
    },
    getAnnouncementTagText(item) {
      const level = item?.level;
      if (level === 'urgent' || level === 1) return '活动';
      if (level === 'important' || level === 2) return '消息';
      return '通知';
    },
    formatAnnouncementTime(item) {
      if (!item?.createTime && !item?.startTime) return '';
      const time = item.createTime || item.startTime;
      return time?.slice(0, 10) || '';
    },
    handleViewMoreAnnouncements() {
      this.$message?.info?.('更多公告功能正在规划中～');
    }
  },
  mounted() {
    this.fetchStats();
    this.startAutoRefresh();
  }
};
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 25px 30px;
  /* 首页上方统计区域背景：柔和浅灰蓝，减少与下方区域的对比感 */
  background-color: #f3f6fb;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  /* 阴影弱化一点，整体更轻盈 */
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.08);
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
  /* 统一主色：偏青蓝 */
  background: linear-gradient(135deg, #00bcd4, #2196f3);
}

.bg-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.bg-warning {
  background: linear-gradient(135deg, #f97316, #fdba74);
}

.bg-info {
  background: linear-gradient(135deg, #38bdf8, #0284c7);
}

.stat-info h3 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: #333;
}

.stat-info p {
  color: #777;
  margin: 0;
}

/* 图表区域 */
.tech-section {
  padding: 20px 30px;
  /* 改为浅色背景，避免与上方区域反差过大 */
  background: #f5f7fb;
  color: #1f2933;
}

/* 下方整体布局：左侧图表 + 右侧快捷入口 */
.tech-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: flex-start;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 图表网格布局：适配4个组件 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  /* 改为实体卡片，白底+浅阴影，整体更简洁 */
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.chart-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.chart-meta.meta-wrap {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 6px;
}

.meta-badge {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f3f4f6;
}

.meta-label {
  font-size: 0.7rem;
  color: #6b7280;
}

.meta-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.meta-primary {
  background: rgba(37, 99, 235, 0.1);
}

.meta-green {
  background: rgba(16, 185, 129, 0.12);
}

.meta-orange {
  background: rgba(249, 115, 22, 0.12);
}

.meta-purple {
  background: rgba(139, 92, 246, 0.12);
}

.meta-slate {
  background: rgba(107, 114, 128, 0.15);
}

.meta-danger {
  background: rgba(248, 113, 113, 0.18);
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #2563eb;
  text-align: center;
}

.chart-container {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧快捷入口样式 */
.quick-actions {
  background: #ffffff;
  border-radius: 10px;
  height: 340px;
  padding: 18px 18px 16px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.qa-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.qa-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 12px;
}

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qa-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.qa-item:hover {
  background-color: #f3f4ff;
  transform: translateY(-1px);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
}

.qa-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-right: 10px;
  font-size: 16px;
}

.qa-icon-blue {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.qa-icon-green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.qa-icon-orange {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.qa-icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.qa-icon-cyan {
  background: linear-gradient(135deg, #06b6d4, #0ea5e9);
}

.qa-info h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px;
}

.qa-info p {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
}

/* 右侧公告卡片（与快捷入口同尺寸） */
.mini-announcements {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.mini-ann-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.mini-ann-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #111827;
}

.mini-ann-header p {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.mini-ann-more {
  border: none;
  background: #e0e7ff;
  color: #4c51bf;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.mini-ann-more:hover {
  background: #c7d2fe;
}

.mini-ann-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mini-ann-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.mini-ann-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.mini-ann-text {
  flex: 1;
  min-width: 0;
  max-width: 180px;
}

.mini-ann-title {
  margin: 0;
  font-size: 0.9rem;
  color: #111827;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-ann-content {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-ann-time {
  font-size: 0.72rem;
  color: #9ca3af;
  white-space: nowrap;
  margin-left: 6px;
}

.dot-notice {
  background: #60a5fa;
}

.dot-info {
  background: #f59e0b;
}

.dot-activity {
  background: #f87171;
}

/* 性别比例图 */
.gender-stats {
  width: 100%;
  padding: 20px;
}

.gender-item {
  margin-bottom: 15px;
}

.gender-label {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  display: block; /* 确保标签独占一行 */
}

.gender-label.male {
  color: #1d4ed8;
}

.gender-label.female {
  color: #f97316;
}

.gender-bar {
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.gender-bar-fill {
  height: 100%;
  transition: width 1s ease;
  position: relative;
}

.male-fill {
  background: linear-gradient(
      120deg,
      #bfdbfe,
      #60a5fa,
      #3b82f6,
      #2563eb,
      #1d4ed8
  );
  background-size: 300% 300%;
  animation: genderGradient 3s ease-in-out infinite;
}

.female-fill {
  background: linear-gradient(
      120deg,
      #ffe4e6,
      #fbcfe8,
      #fb7185,
      #f97316,
      #fbbf24
  );
  background-size: 300% 300%;
  animation: genderGradient 3s ease-in-out infinite reverse;
}

@keyframes genderGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.gender-bar-fill::after {
  content: '';
  position: absolute;
  top: -30%;
  left: -10%;
  width: 40%;
  height: 160%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.8), transparent);
  transform: skewX(-20deg);
  animation: genderShine 2.5s linear infinite;
  pointer-events: none;
}

@keyframes genderShine {
  0% {
    transform: translateX(-60%) skewX(-20deg);
    opacity: 0;
  }
  40% {
    opacity: 0.7;
  }
  100% {
    transform: translateX(220%) skewX(-20deg);
    opacity: 0;
  }
}

/* 部门分布图 */
.department-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 200px;
}

.department-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14%;
}

.bar-container {
  width: 30px;
  height: 150px;
  background: #e5e7eb;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #1d4ed8);
  border-radius: 5px;
  transition: height 1s ease;
  overflow: hidden;
}

.bar-fill::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 160%;
  background:
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.55), transparent 45%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.4), transparent 50%);
  opacity: 0.35;
  animation: barWaveFlow 3.5s ease-in-out infinite;
}

.bar-fill::after {
  content: '';
  position: absolute;
  left: -25%;
  top: -10px;
  width: 150%;
  height: 24px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
  animation: barWaveSurface 2s ease-in-out infinite;
}

@keyframes barWaveFlow {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10%, -8%);
  }
  100% {
    transform: translate(0, 0);
  }
}

@keyframes barWaveSurface {
  0% {
    transform: translateX(-8%) scaleY(1);
  }
  50% {
    transform: translateX(8%) scaleY(0.85);
  }
  100% {
    transform: translateX(-8%) scaleY(1);
  }
}

.bar-label {
  font-size: 0.7rem;
  color: #90a4ae;
  text-align: center;
  margin-bottom: 5px;
}

.bar-value {
  font-size: 0.8rem;
  color: white;
  font-weight: bold;
}

/* 工资结构折线图 */
.salary-line-chart {
  width: 100%;
  height: 100px;
}

.chart-container.salary-line-chart {
  height: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 10px 0 0;
}

.line-chart-svg {
  width: 100%;
  height: 210px;
}

.line-path {
  fill: none;
  stroke: #2563eb;
  stroke-width: 1;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.line-area {
  fill: url(#salaryLineGradient);
}

.line-point {
  fill: #ffffff;
  stroke: #2563eb;
  stroke-width: 1;
}

.line-value {
  font-size: 6px;
  fill: #1f2933;
  text-anchor: middle;
  font-weight: 500;
}

.line-labels {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-top: 14px;
  font-size: 0.85rem;
  color: #4b5563;
  flex-wrap: wrap;
  width: 100%;
}

.line-label {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 90px;
  min-width: 80px;
}

.label-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  display: inline-block;
}

.label-range {
  font-weight: 600;
  white-space: nowrap;
}

/* 考勤记录网格布局 —— 紧凑版 */
.attendance-grid {
  display: grid;
  /* 更紧凑：最小140px，最多4列 */
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px; /* 缩小间距 */
  width: 100%;
  padding: 8px;
  max-height: 220px; /* 限制高度，防止撑开容器 */
  overflow-y: auto; /* 内容过多时可滚动 */
}

.attendance-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px; /* 稍微减小圆角 */
  padding: 12px; /* 减小内边距 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 0.85rem; /* 整体缩小字号 */
}

.attendance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 避免对齐问题 */
  margin-bottom: 8px;
}

.employee-name {
  font-weight: 600;
  font-size: 0.95rem; /* 稍微缩小 */
  color: #e0e0e0;
  line-height: 1.3;
  word-break: break-all; /* 防止名字太长溢出 */
}

.status-badge {
  padding: 2px 8px; /* 缩小标签 */
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: bold;
  color: white;
  line-height: 1;
}

/* 状态颜色保持不变 */
.status-正常 {
  border-left: 3px solid #13ce66;
}
.status-正常 .status-badge {
  background-color: #13ce66;
}

.status-迟到 {
  border-left: 3px solid #e6a23c;
}
.status-迟到 .status-badge {
  background-color: #e6a23c;
}

.status-缺勤 {
  border-left: 3px solid #f56c6c;
}
.status-缺勤 .status-badge {
  background-color: #f56c6c;
}

.card-body .info-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px; /* 减小行间距 */
  font-size: 0.75rem;
  color: #b0b0b0;
  line-height: 1.4;
}

.info-icon {
  margin-right: 6px;
  font-size: 12px;
  color: #999;
}

.card-body .remark {
  font-style: italic;
  color: #aaa;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1; /* 限制备注1行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 空状态样式 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px 10px;
  color: #90a4ae;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

/* 响应式优化：小屏变1列，中屏2~3列 */
@media (max-width: 1024px) {
  .tech-layout {
    grid-template-columns: 1.8fr 1fr;
  }

  .attendance-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
}

@media (max-width: 768px) {
  .tech-layout {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    margin-top: 16px;
  }

  .attendance-grid {
    grid-template-columns: repeat(2, 1fr); /* 手机横屏也可显示2列 */
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .attendance-grid {
    grid-template-columns: 1fr; /* 超小屏1列 */
  }

  .employee-name {
    font-size: 0.9rem;
  }
}

</style>

<template>
  <div id="app" class="app-with-frame">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <el-icon>
            <UserFilled />
          </el-icon>
          <div class="nav-logo-content">
            <span class="nav-logo-title">人事管理系统</span>
            <span class="nav-logo-time">{{ currentTime }}</span>
          </div>
        </div>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'home' }" @click.prevent="switchTab('home')">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'employee' }" @click.prevent="switchTab('employee')">
              <el-icon><User /></el-icon>
              <span>员工管理</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'department' }" @click.prevent="switchTab('department')">
              <el-icon><Document /></el-icon>
              <span>文件管理</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'attendance' }" @click.prevent="switchTab('attendance')">
              <el-icon><Calendar /></el-icon>
              <span>请假管理</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'salary' }" @click.prevent="switchTab('salary')">
              <el-icon><Money /></el-icon>
              <span>薪资管理</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'statistics' }" @click.prevent="switchTab('statistics')">
              <el-icon><DataAnalysis /></el-icon>
              <span>信息统计</span>
            </a>
          </li>
          <li class="nav-item" v-if="isAdmin()">
            <a href="#" class="nav-link" :class="{ active: activeTab === 'operationLog' }" @click.prevent="switchTab('operationLog')">
              <el-icon><Document /></el-icon>
              <span>操作日志</span>
            </a>
          </li>
        </ul>
        <div class="nav-user">
          <el-button type="primary" @click="showChangePasswordDialog">修改密码</el-button>
          <el-button type="primary" @click="handleLoginOut">退出登录</el-button>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ currentUserRole === 'admin' ? '管理员' : '用户' }}
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changeAvatar">
                  <el-icon><Avatar /></el-icon>
                  更改头像
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-avatar class="nav-avatar" :size="40" :src="userAvatar">
            {{ userAvatar ? '' : (currentUserRole === 'admin' ? '管' : '用') }}
          </el-avatar>
        </div>
      </div>
    </nav>
    <!-- 更改头像对话框 -->
    <el-dialog
        title="更改头像"
        v-model="changeAvatarDialogVisible"
        width="500px"
        :before-close="handleAvatarDialogClose">
      <div class="avatar-upload-container">
        <div class="avatar-preview">
          <el-avatar :size="150" :src="avatarPreview">
            {{ avatarPreview ? '' : (currentUserRole === 'admin' ? '管' : '用') }}
          </el-avatar>
        </div>
        <div class="avatar-upload-actions">
          <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              accept="image/*">
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
          </el-upload>
          <el-button @click="removeAvatar" v-if="avatarPreview">
            移除头像
          </el-button>
        </div>
        <div class="avatar-tips">
          <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelChangeAvatar">取 消</el-button>
          <el-button type="primary" @click="confirmChangeAvatar">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
        title="修改密码"
        v-model="changePasswordDialogVisible"
        width="400px"
        :before-close="handlePasswordDialogClose">
      <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordForm"
          label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入原密码">
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码">
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="cancelChangePassword">取 消</el-button>
      <el-button type="primary" @click="submitChangePassword">确 定</el-button>
    </span>
      </template>
    </el-dialog>



    <!-- 主要内容区域 -->
    <main class="main-container">
      <div class="dashboard">
        <!-- 首页滚动公告栏 -->
        <div class="announcement-bar" v-if="announcements.length">
          <div class="announcement-label">公告：</div>
          <div class="announcement-track">
            <div class="announcement-items">
              <span
                  v-for="item in announcements"
                  :key="item.id"
                  class="announcement-item"
              >
                【{{ item.title || '系统公告' }}】{{ item.content }}
              </span>
            </div>
          </div>
        </div>
        <!-- 首页内容 -->
        <div v-if="activeTab === 'home'">
          <!-- 首页仪表盘，接收子组件抛出的快捷入口事件 -->
          <DashboardStats
              :announcements="announcements"
              @switchTab="switchTab"
          />
        </div>

        <!-- 员工管理内容 -->
        <div v-if="activeTab === 'employee'" class="content-section">
          <h2 style="margin: 0; color: #11998e; text-align: center;">
            <el-icon><User /></el-icon>
            员工管理
          </h2>
          <div class="section-header"/>
          <EmployeeList></EmployeeList>
        </div>

        <!-- 文件管理内容 -->
        <div v-if="activeTab === 'department'" class="content-section">
          <h2 style="margin: 0; color: #11998e; text-align: center;">
            <el-icon><Document /></el-icon>
            文件管理
          </h2>
          <div class="section-header"/>
          <documentList></documentList>
        </div>

        <!-- 考勤管理内容 -->
        <div v-if="activeTab === 'attendance'" class="content-section">
          <h2 style="margin: 0; color: #11998e; text-align: center;">
            <el-icon><Calendar /></el-icon>
            请假管理
          </h2>
          <div class="section-header">
            <leaveList></leaveList>
          </div>

        </div>

        <!-- 薪资管理内容 -->
        <div v-if="activeTab === 'salary'" class="content-section">
          <h2 style="margin: 0; color: #11998e; text-align: center;">
            <el-icon><Money /></el-icon>
            薪资管理
          </h2>
          <div class="section-header">
          </div>
          <SalaryList></SalaryList>
        </div>

        <!-- 信息统计内容 -->
        <div v-if="activeTab === 'statistics'" class="content-section">
          <h2 style="margin: 0; color: #11998e; text-align: center;">
            <el-icon><DataAnalysis /></el-icon>
            信息统计
          </h2>
          <div class="section-header">
          </div>
          <Statistics></Statistics>
        </div>

        <!-- 操作日志内容 -->
        <div v-if="activeTab === 'operationLog'" class="content-section">
          <h2 style="margin: 0; color: #11998e; text-align: center;">
            <el-icon><Document /></el-icon>
            操作日志
          </h2>
          <div class="section-header">
          </div>
          <OperationLog></OperationLog>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import EmployeeList from '../views/EmployeeList.vue'
import SalaryList from "../views/Salary.vue";
import leaveList from "../views/Leave.vue"
import documentList from "../views/Document.vue"
import DashboardStats from '../views/stats.vue';
import Statistics from "../views/Statistics.vue"
import OperationLog from "../views/OperationLog.vue"
import { Avatar, Upload } from '@element-plus/icons-vue'


export default {
  name: 'App',
  components: {
    SalaryList,
    EmployeeList,
    leaveList,
    documentList,
    DashboardStats,
    Statistics,
    OperationLog,
    Avatar,
    Upload
  },
  data() {

    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    return {
      activeTab: 'home', // 默认显示首页
      loginDialogVisible: false, // 登录对话框可见性
      changePasswordDialogVisible: false, // 修改密码对话框可见性
      loginForm: {
        username: '',
        password: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordLoading: false, // 添加加载状态
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      departments: [
      ],
      attendanceRecords: [
      ],
      salaryRecords: [
      ],
      // 首页公告数据
      announcements: [],
      // 当前用户角色（用于控制菜单显示）
      currentUserRole: 'user',
      // 更改头像相关
      changeAvatarDialogVisible: false,
      avatarPreview: '', // 预览头像
      userAvatar: '', // 当前用户头像
      // 顶部当前时间
      currentTime: ''
    }

  },
  methods: {
    // 判断是否为管理员
    isAdmin() {
      return this.currentUserRole === 'admin';
    },
    switchTab(tabName) {
      this.activeTab = tabName;
    },
    // 显示登录对话框
    showLoginDialog() {
      this.loginDialogVisible = true;
    },
    // 显示修改密码对话框
    showChangePasswordDialog() {
      this.changePasswordDialogVisible = true;
    },
    // 关闭登录对话框前的处理
    handleLoginClose(done) {
      this.$refs.loginForm.resetFields();
      done();
    },
    // 关闭修改密码对话框前的处理
    handlePasswordDialogClose(done) {
      this.$refs.passwordForm.resetFields();
      done();
    },
    // 取消登录
    cancelLogin() {
      this.loginDialogVisible = false;
      this.$refs.loginForm.resetFields();
    },
    // 取消修改密码
    cancelChangePassword() {
      this.changePasswordDialogVisible = false;
      this.$refs.passwordForm.resetFields();
    },
    // 提交登录
    submitLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          // 这里可以添加实际的登录逻辑
          console.log('登录信息:', this.loginForm);
          this.$message.success('登录成功');
          this.loginDialogVisible = false;
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },
    // 提交修改密码
    submitChangePassword() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          // 显示加载状态
          this.passwordLoading = true;

          // 实际调用后端API
          this.$axios.post('/api/user/change-password', {
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          })
              .then(response => {
                if (response.data.success) {
                  this.$message.success('密码修改成功，请重新登录');
                  this.changePasswordDialogVisible = false;
                  this.$refs.passwordForm.resetFields();

                  // 可选：修改密码后强制退出登录
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('token');
                  localStorage.removeItem('userInfo');
                  this.$router.push('/login');
                } else {
                  this.$message.error(response.data.message || '密码修改失败');
                }
              })
              .catch(error => {
                console.error('修改密码失败:', error);
                let errorMessage = '修改密码失败';

                if (error.response) {
                  // 后端返回的错误信息
                  errorMessage = error.response.data.message || errorMessage;
                } else if (error.request) {
                  // 网络错误
                  errorMessage = '网络错误，请检查网络连接';
                }

                this.$message.error(errorMessage);
              })
              .finally(() => {
                // 无论成功失败，都关闭加载状态
                this.passwordLoading = false;
              });
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },

    //退出登录
    handleLoginOut(){
      this.$confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除登录状态（使用 JWT 后清理 token 和基础信息）
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        localStorage.removeItem('userAvatar') // 清除头像

        this.$message.success('退出登录成功')
        this.$router.push('/login') // 跳转到登录页
      }).catch(() => {
        // 用户取消退出
      })
    },
    // 下拉菜单命令处理
    handleCommand(command) {
      if (command === 'changeAvatar') {
        this.showChangeAvatarDialog();
      }
    },
    // 显示更改头像对话框
    showChangeAvatarDialog() {
      // 加载当前头像作为预览
      this.avatarPreview = this.userAvatar;
      this.changeAvatarDialogVisible = true;
    },
    // 关闭更改头像对话框前的处理
    handleAvatarDialogClose(done) {
      this.avatarPreview = this.userAvatar; // 恢复为当前头像
      done();
    },
    // 取消更改头像
    cancelChangeAvatar() {
      this.changeAvatarDialogVisible = false;
      this.avatarPreview = this.userAvatar; // 恢复为当前头像
    },
    // 上传前验证
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      return false; // 阻止默认上传，使用自定义预览
    },
    // 移除头像
    removeAvatar() {
      this.avatarPreview = '';
    },
    // 确认更改头像
    confirmChangeAvatar() {
      // 保存头像到 localStorage
      if (this.avatarPreview) {
        localStorage.setItem('userAvatar', this.avatarPreview);
        this.userAvatar = this.avatarPreview;
        this.$message.success('头像更改成功');
      } else {
        localStorage.removeItem('userAvatar');
        this.userAvatar = '';
        this.$message.success('头像已移除');
      }
      this.changeAvatarDialogVisible = false;
    },
    // 更新时间显示
    updateCurrentTime() {
      const now = new Date();
      const pad = (n) => (n < 10 ? '0' + n : n);
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      this.currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
  mounted() {
    // 获取当前用户角色
    this.currentUserRole = localStorage.getItem('role') || 'user';
    
    // 加载用户头像
    this.userAvatar = localStorage.getItem('userAvatar') || '';
    
    // 加载首页公告
    this.$axios.get('/api/announcements/active')
        .then(response => {
          this.announcements = response.data || []
          console.log('公告数据:', this.announcements)
          if (this.announcements.length === 0) {
            console.warn('没有获取到公告数据，请检查数据库是否有启用状态的公告')
          }
        })
        .catch(error => {
          console.error('获取公告失败:', error)
          // 公告失败不影响主功能，静默处理
          this.announcements = []
        });

    // 初始化并定时更新时间
    this.updateCurrentTime();
    this._timeTimer = setInterval(this.updateCurrentTime, 1000);
  },
  beforeUnmount() {
    if (this._timeTimer) {
      clearInterval(this._timeTimer);
      this._timeTimer = null;
    }
  }
}
</script>

<style>
/* 彻底的重置样式 - 替换掉原来的 * 规则 */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

/* 确保你的app容器也是0边距 */
/* 应用整体容器 + 霓虹边框效果 */
#app {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.app-with-frame {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.app-with-frame::before {
  content: '';
  position: fixed;
  inset: 10px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  background: rgba(15, 23, 42, 0.02);
  box-shadow:
      0 0 14px rgba(148, 163, 184, 0.35),
      0 0 30px rgba(15, 23, 42, 0.3);
  z-index: 0;
  pointer-events: none;
}

.app-with-frame::after {
  content: '';
  position: fixed;
  border-radius: 999px;
  background: linear-gradient(120deg, #60a5fa, #a855f7, #f97316, #22c55e);
  box-shadow:
      0 0 12px rgba(96, 165, 250, 0.7),
      0 0 22px rgba(168, 85, 247, 0.6);
  pointer-events: none;
  z-index: 1;
  animation: frameRunner 14s linear infinite;
}

@keyframes frameRunner {
  /* 顶部：从左到右 */
  0% {
    top: 10px;
    left: 10px;
    width: 180px;
    height: 3px;
  }
  24% {
    top: 10px;
    left: calc(100% - 150px);
    width: 180px;
    height: 3px;
  }

  /* 右侧：从上到下 */
  25% {
    top: 10px;
    left: calc(100% - 13px);
    width: 3px;
    height: 180px;
  }
  49% {
    top: calc(100% - 150px);
    left: calc(100% - 13px);
    width: 3px;
    height: 80px;
  }

  /* 底部：从右到左 */
  50% {
    top: calc(100% - 13px);
    left: calc(100% - 150px);
    width: 140px;
    height: 3px;
  }
  74% {
    top: calc(100% - 13px);
    left: 10px;
    width: 140px;
    height: 3px;
  }

  /* 左侧：从下到上，回到起点 */
  75% {
    top: calc(100% - 150px);
    left: 10px;
    width: 3px;
    height: 140px;
  }
  100% {
    top: 10px;
    left: 10px;
    width: 3px;
    height: 140px;
  }
}

/* 特别确保导航栏没有上边距 */
.navbar {
  margin: 0; /* 确保这里也是0 */
  /* 青色 + 蓝色主色调导航栏 */
  background: linear-gradient(120deg, #00bcd4 0%, #2196f3 45%, #0069c0 100%);
  color: white;
  padding: 0 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 1000;
  position: relative;
}



.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.nav-logo i {
  margin-right: 10px;
  font-size: 1.8rem;
}

.nav-logo-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.nav-logo-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  letter-spacing: 0.5px;
  margin-top: 2px;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
  animation: timeGlow 2.5s ease-in-out infinite;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 10px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.nav-link:hover,
.nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-user {
  display: flex;
  align-items: center;
}

.nav-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.nav-time-fixed {
  position: absolute;
  top: 50%;
  right: 1.2rem;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
  animation: timeGlow 2.5s ease-in-out infinite;
}

@keyframes timeGlow {
  0% {
    opacity: 0.7;
    transform: translateY(-50%) scale(1);
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
  }
  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.03);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  }
  100% {
    opacity: 0.7;
    transform: translateY(-50%) scale(1);
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
  }
}

.nav-avatar {
  margin-left: 12px;
  background: linear-gradient(135deg, #4b6cb7, #182848);
  font-size: 16px;
}

/* 下拉菜单样式 - 新增 */
.el-dropdown-menu {
  background-color: white !important; /* 设置背景为白色 */
  border: none !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 4px !important;
}

.el-dropdown-menu__item {
  color: #606266 !important; /* 设置菜单项文字颜色 */
  font-size: 14px !important;
}

.el-dropdown-menu__item:hover {
  background-color: #f5f7fa !important; /* 悬停背景色 */
  color: #4b6cb7 !important; /* 悬停文字颜色 */
}

.el-dropdown-link {
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 10px;
}

/* 主内容区域 */
.main-container {
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

/* 首页公告栏样式 */
.announcement-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
  font-size: 13px;
  color: #1f2937;
}

.announcement-label {
  font-weight: 600;
  color: #2563eb;
  white-space: nowrap;
}

.announcement-track {
  overflow: hidden;
  flex: 1;
}

.announcement-items {
  display: inline-flex;
  gap: 32px;
  white-space: nowrap;
  animation: announcement-marquee 25s linear infinite;
}

.announcement-item {
  color: #374151;
}

@keyframes announcement-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.dashboard-header {
  padding: 25px 30px;
  /* 顶部欢迎区采用更柔和的青蓝渐变 */
  background: linear-gradient(110deg, #00acc1 0%, #26c6da 40%, #42a5f5 100%);
  color: white;
}

.dashboard-header h2 {
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.dashboard-header p {
  opacity: 0.9;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 25px 30px;
  background-color: #f8f9fa;
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
  background: linear-gradient(135deg, #00bcd4, #2196f3);
}

.bg-success {
  background: linear-gradient(135deg, #26a69a, #66bb6a);
}

.bg-warning {
  background: linear-gradient(135deg, #ffb300, #ffca28);
}

.bg-info {
  background: linear-gradient(135deg, #29b6f6, #0288d1);
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

/* 内容区域 */
.content-section {
  padding: 20px 30px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.6rem;
  color: #333;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.section-header h2 i {
  font-size: 1.8rem;
}

.section-header p {
  color: #777;
}

.placeholder-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }

  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }

  .nav-menu {
    margin: 10px 0;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-item {
    margin: 5px;
  }

  .main-container {
    padding: 10px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    padding: 15px;
  }

  .dashboard-header {
    padding: 20px;
    text-align: center;
  }

  .content-section {
    padding: 15px;
  }
}

/* 头像上传对话框样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-preview {
  margin-bottom: 20px;
}

.avatar-preview :deep(.el-avatar) {
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-upload-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.avatar-tips {
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.avatar-tips p {
  margin: 0;
}
</style>

<template>
  <div class="login-container">

    <div class="login-box">
      <div class="login-header">
        <el-image
          :src="require('../assets/zbdt.jpg')"
          class="login-logo"
        />
        <h2>人事管理系统</h2>
        <p class="login-subtitle">高效 · 便捷 · 智能的人力资源管理平台</p>
      </div>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>

        <div class="slider-verify" ref="sliderTrack">
          <div
              class="slider-progress"
              :class="{ 'slider-success': sliderState.verified }"
              :style="{ width: sliderProgressWidth }"
          ></div>
          <div class="slider-text">
            {{ sliderState.verified ? '验证成功' : '按住滑块拖动完成验证' }}
          </div>
          <div
              class="slider-handle"
              :class="{
                'slider-success': sliderState.verified,
                'is-dragging': sliderState.dragging
              }"
              :style="{ transform: `translateX(${sliderState.offsetX}px)` }"
              @mousedown="handleSliderDown"
              @touchstart.prevent="handleSliderDown"
          >
            <span v-if="!sliderState.verified">⇆</span>
            <el-icon v-else>
              <CircleCheck />
            </el-icon>
          </div>
        </div>

        <el-form-item>
          <el-button
              type="primary"
              style="width: 100%"
              size="large"
              @click="handleLogin"
              :loading="loading"
              :disabled="!sliderState.verified || loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tip"></div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { User, Lock, CircleCheck } from '@element-plus/icons-vue'

export default {
  name: 'UserLogin',
  data() {
    return {
      loading: false,
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      sliderState: {
        dragging: false,
        startX: 0,
        offsetX: 0,
        trackWidth: 0,
        verified: false
      }
    }
  },
  computed: {
    sliderProgressWidth() {
      const base = this.sliderState.verified
          ? this.sliderState.trackWidth
          : this.sliderState.offsetX + 48;
      return `${Math.min(base, this.sliderState.trackWidth)}px`;
    }
  },
  methods: {
    handleSliderDown(event) {
      if (this.sliderState.verified) return;
      const clientX = this.getClientX(event);
      this.sliderState.dragging = true;
      this.sliderState.startX = clientX - this.sliderState.offsetX;
      document.addEventListener('mousemove', this.handleSliderMove);
      document.addEventListener('mouseup', this.handleSliderUp);
      document.addEventListener('touchmove', this.handleSliderMove, { passive: false });
      document.addEventListener('touchend', this.handleSliderUp);
    },
    handleSliderMove(event) {
      if (!this.sliderState.dragging) return;
      const clientX = this.getClientX(event);
      const delta = clientX - this.sliderState.startX;
      const maxOffset = Math.max(this.sliderState.trackWidth - 48, 0);
      const offset = Math.min(Math.max(0, delta), maxOffset);
      this.sliderState.offsetX = offset;
      if (offset >= maxOffset - 2) {
        this.sliderState.verified = true;
        this.sliderState.dragging = false;
        this.cleanupSliderListeners();
        this.$message.success('滑动验证通过');
      }
    },
    handleSliderUp() {
      if (!this.sliderState.dragging) return;
      this.sliderState.dragging = false;
      if (!this.sliderState.verified) {
        this.sliderState.offsetX = 0;
      }
      this.cleanupSliderListeners();
    },
    cleanupSliderListeners() {
      document.removeEventListener('mousemove', this.handleSliderMove);
      document.removeEventListener('mouseup', this.handleSliderUp);
      document.removeEventListener('touchmove', this.handleSliderMove);
      document.removeEventListener('touchend', this.handleSliderUp);
    },
    resetSlider() {
      this.sliderState.dragging = false;
      this.sliderState.offsetX = 0;
      this.sliderState.verified = false;
    },
    getClientX(event) {
      if (event.touches && event.touches.length) {
        return event.touches[0].clientX;
      }
      return event.clientX || 0;
    },
    updateSliderWidth() {
      this.$nextTick(() => {
        if (this.$refs.sliderTrack) {
          this.sliderState.trackWidth = this.$refs.sliderTrack.offsetWidth;
        }
      });
    },
    handleLogin() {
      if (!this.sliderState.verified) {
        this.$message.warning('请先完成滑动验证');
        return;
      }
      this.loading = true;
      this.$axios.post('/api/logindata/login', {
        userName: this.loginForm.username,
        passWord: this.loginForm.password
      })
          .then(response => {
            // 处理后端返回的Map对象
            const data = response.data;
            if(data.success) {
              // 使用 JWT 方案：保存后端返回的 token 和基础用户信息
              if (data.token) {
                localStorage.setItem('token', data.token);
              }
              localStorage.setItem('username', data.username || this.loginForm.username);
              if (data.role) {
                localStorage.setItem('role', data.role);
              }
              this.$message.success('登录成功！');
              this.resetSlider();
              this.$router.push('/helloWorld'); // 跳转到管理界面
            } else {
              this.$message.error('登录失败：用户名或密码错误！');
              this.resetSlider();
            }
          })
          .catch(error => {
            console.error('登录错误:', error);
            this.$message.error('登录失败：' + (error.response?.data || '网络错误'));
            this.resetSlider();
          })
          .finally(() => {
            this.loading = false;
          });

    }
  },
  mounted() {
    this.updateSliderWidth();
    window.addEventListener('resize', this.updateSliderWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSliderWidth);
    this.cleanupSliderListeners();
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  /* 使用本地图片 */
  background: url('../assets/114514.png') no-repeat center center;
  background-size: cover; /* 让图片覆盖整个区域 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
}

/* 可选：添加半透明遮罩，让文字更清晰 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3); /* 黑色半透明遮罩 */
  z-index: 1;
}

.login-box {
  position: relative; /* 确保登录框在遮罩之上 */
  z-index: 2;
}

.login-box {
  width: 400px;
  background: rgba(255, 255, 255, 0.92);
  padding: 40px 36px 32px;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  color: #111827;
  margin-bottom: 6px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.login-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.login-header p {
  color: #666;
}

.login-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
}

.login-tip {
  margin-top: 20px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.slider-verify {
  position: relative;
  width: 100%;
  height: 48px;
  background: rgba(15, 23, 42, 0.04);
  border-radius: 999px;
  margin-bottom: 18px;
  overflow: hidden;
  user-select: none;
}

.slider-progress {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(135deg, #a0c4ff, #5c7cfa, #3a0ca3);
  border-radius: inherit;
  transition: width 0.2s ease;
}

.slider-progress.slider-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.slider-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  color: #64748b;
  letter-spacing: 0.05em;
  pointer-events: none;
  z-index: 1;
}

.slider-handle {
  position: absolute;
  top: 4px;
  left: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: background-color 0.2s ease;
  z-index: 2;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.slider-handle.is-dragging {
  cursor: grabbing;
}

.slider-handle.slider-success {
  background: #22c55e;
  color: #fff;
  box-shadow: 0 10px 28px rgba(34, 197, 94, 0.4);
}

/* 调整输入框和按钮的间距与细节 */
:deep(.el-input__wrapper) {
  border-radius: 999px;
  padding: 0 18px;
}

:deep(.el-button.is-round),
:deep(.el-button) {
  border-radius: 999px;
}

/* 登录按钮主色调更贴近系统主色 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  border-color: transparent;
}

:deep(.el-button--primary:hover) {
  filter: brightness(1.06);
}
</style>

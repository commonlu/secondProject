<template>
  <div class="docs-container">
    <!-- Element Plus 的加载动画 -->
    <el-skeleton :rows="5" animated v-if="loading"/>
    <!-- Element Plus 的表格组件 -->
    <div v-else>
      <div class="filter-container" style="background-color: #f0f9ff; border: 1px solid #b3e0ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <span style="margin-right: 15px; color: #11998e; font-weight: bold;">文件名：</span>
        <el-input v-model="searchName" placeholder="文件名" style="width: 120px; margin-right: 20px;"></el-input>

        <!-- 新增文件类型下拉列表 -->
        <span style="margin-right: 15px; color: #11998e; font-weight: bold;">文件类型：</span>
        <el-select v-model="searchFileType" placeholder="请选择文件类型" clearable style="width: 120px; margin-right: 20px;">
          <el-option label="文本文件" value="1"></el-option>
          <el-option label="CSV文件" value="2"></el-option>
          <el-option label="PDF文件" value="3"></el-option>
        </el-select>

        <el-button type="primary" @click="handleSearch" style="margin-right: 10px;">
          搜索
        </el-button>
        <el-button @click="resetSearch" style="margin-right: 10px;">
          重置
        </el-button>
      </div>

      <el-table :data="docsList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="文件名称"/>
        <el-table-column prop="employeeName" label="上传人员"/>
        <el-table-column prop="oldName" label="文件旧称"/>
        <el-table-column prop="md5" label="是否加密">
          <template #default="scope">
            <el-tag :type="scope.row.md5 === 1 ? 'success' : 'success'">
              {{ scope.row.md5 === 1 ? '否' : '是' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小">
          <template #default="scope">
            {{ scope.row.size ? scope.row.size + 'MB' : 'MB' }}
          </template>
        </el-table-column>
        <el-table-column prop="staffId" label="文件类型">
          <template #default="scope">
            <el-tag :type="scope.row.staffId === 1 ? 'success' : 'danger'">
              {{ scope.row.staffId === 1 ? '文本文件' : 'csv文件' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="文件备注"/>
        <el-table-column prop="createTime" label="创建时间"/>
        <el-table-column prop="updateTime" label="更新时间">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'docsList',
  data() {
    return {
      docsList: [],
      loading: true,
      dialogVisible: false,
      dialogTitle: '',
      isEditMode: false,
      searchName: '',     // 搜索用的文件名
      searchFileType: '', // 新增：搜索用的文件类型
      formData: {
        id: null,
        name: '',
        employeeName: '',
        type: '',
        oldName: '',
        md5: '',
        size: '',
        remark: '',
        createTime: '',
        updateTime: '',
        staffId: '' // 添加审批状态字段
      }
    };
  },
  methods: {
    fetchDocsList() {
      this.loading = true;
      axios.get('/api/documents')
          .then(response => {
            this.docsList = response.data;
            console.log('文件数据获取成功:', this.docsList);
          })
          .catch(error => {
            console.error('获取文件数据失败:', error);
            this.$message.error('获取文件数据失败，请检查后端服务是否启动。');
          })
          .finally(() => {
            this.loading = false;
          });
    },
    // 搜索文件记录
  handleSearch() {
    console.log('搜索文件记录:', this.searchName, this.searchFileType);

    // 构造搜索参数
    const params = {};
    if (this.searchName) {
      params.name = this.searchName;
    }
    if (this.searchFileType) {
      params.staffId = this.searchFileType; // 根据后端API要求调整参数名
    }

    // 如果没有搜索条件，则获取所有文件记录
    if (Object.keys(params).length === 0) {
      this.fetchDocsList();
      return;
    }

    // 调用搜索API
    this.loading = true;
    axios.get('/api/documents/search', {params})
        .then(response => {
          this.docsList = response.data;
          console.log('搜索接口返回原始数据:', response.data);
        })
        .catch(error => {
          console.error('搜索文件记录失败:', error);
          this.$message.error('搜索文件记录失败，请检查后端服务是否启动。');
        })
        .finally(() => {
          this.loading = false;
        });
  },
    // 重置搜索条件并获取所有文件记录
    resetSearch() {
      this.searchName = '';
      this.searchFileType = '';
      this.fetchDocsList();
    },

},
  mounted() {
    this.fetchDocsList();
  }
};
</script>

<style scoped>
.docs-container {
  padding: 20px;
}
</style>

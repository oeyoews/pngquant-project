<template>
  <div class="container">
    <div>
      <el-upload
        accept=".png"
        drag
        action="/compress"
        :show-file-list="true"
        :before-upload="beforeUpload"
        :on-success="handleSuccess">
        <el-button size="small" type="primary">点击上传图片</el-button>
      </el-upload>
    </div>

    <!-- 显示文件大小 -->
    <div v-if="originalSize !== null && newSize !== null" class="file-sizes">
      原文件大小: {{ originalSize }} KB | 压缩后大小: {{ newSize }} KB<br />
      压缩率为: {{ compressionRate }}%<br />
      大小减少了: {{ sizeReduced }} KB
    </div>

    <!-- 显示压缩后的图片 -->
    <div style="display: flex; justify-content: center;flex-direction: column;">
      <div>
        <img v-if="imageSrc" :src="imageSrc" alt="压缩结果" style="border-radius: 5px;max-height: 50vh;max-width: 50vw;" />
      </div>
      <div>
        <el-button size="small" v-if="imageSrc" @click="copyImage">复制图片</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { ElNotification, ElButton, ElUpload } from 'element-plus';

export default {
	components: {
		ElButton, ElUpload
	},
  name: 'ImageCompressor',
  setup() {
    const originalSize = ref(null);
    const newSize = ref(null);
    const imageSrc = ref(null);

    const compressionRate = computed(() => {
      if (originalSize.value && newSize.value) {
        return (((originalSize.value - newSize.value) / originalSize.value) * 100).toFixed(2);
      }
      return 0;
    });

    const sizeReduced = computed(() => {
      if (originalSize.value && newSize.value) {
        return (originalSize.value - newSize.value).toFixed(2);
      }
      return 0;
    });

    const formatFileSize = (file) => {
      return (file.size / 1024).toFixed(2);
    };

    const beforeUpload = (file) => {
      originalSize.value = formatFileSize(file);
    };

    const handleSuccess = (res, file) => {
      if (file) {
        newSize.value = res.size;
        imageSrc.value = res.data;
      }
    };

    const base64ToBlob = (base64, mimeType = '') => {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    };

    const copyImage = async () => {
      try {
        const clipboardItem = new ClipboardItem({
          'image/png': base64ToBlob(imageSrc.value.replace('data:image/png;base64,', ''), 'image/png'),
        });
        await navigator.clipboard.write([clipboardItem]);
        ElNotification({ type: 'success', message: '图片已复制到剪贴板' });
      } catch (error) {
        console.error('复制失败:', error);
        ElNotification({ type: 'error', message: '复制失败，请重试' });
      }
    };

    return {
      originalSize,
      newSize,
      imageSrc,
      compressionRate,
      sizeReduced,
      beforeUpload,
      handleSuccess,
      copyImage,
    };
  },
};
</script>

<style>
.container {
  text-align: center;
  padding: 20px;
}

img {
  max-width: 100%;
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.file-sizes {
  margin-top: 10px;
  font-size: 14px;
}
</style>

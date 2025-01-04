<template>
  <div style="margin-top: 20px">
    <h2 style="text-align: center">在线图片压缩</h2>
    <!-- :limit="1"
        :on-exceed="handleExceed" -->
    <el-upload
      accept=".png"
      drag
      style="width: 600px; margin: 0 auto"
      action="/compress"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      ref="upload">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32">
        <path
          fill="currentColor"
          d="M16 4c-4.12 0-7.36 3.13-7.813 7.125a4.9 4.9 0 0 0-3.843 3.22C1.884 15.054 0 17.248 0 20c0 3.324 2.676 6 6 6h20c3.324 0 6-2.676 6-6c0-1.76-.855-3.336-2.094-4.438c-.232-3.514-3.035-6.318-6.562-6.5C22.14 6.133 19.378 4 16 4m0 2c2.762 0 4.97 1.77 5.75 4.28l.22.72H23c2.755 0 5 2.245 5 5v.5l.406.313A4.07 4.07 0 0 1 30 20c0 2.276-1.724 4-4 4H6c-2.276 0-4-1.724-4-4c0-2.02 1.45-3.588 3.28-3.906l.657-.125l.125-.658C6.362 13.964 7.556 13 9 13h1v-1c0-3.37 2.63-6 6-6m0 5.594l-.72.687l-4 4l1.44 1.44L15 15.437V22h2v-6.563l2.28 2.282l1.44-1.44l-4-4z" />
      </svg>
      <div style="font-size: 12px; color: gray">拖动/粘贴/点击上传图片</div>
    </el-upload>

    <!-- 显示文件大小 -->
    <div style="margin: 0 auto; width: 600px;text-align: center;">
      <div
        v-if="originalSize !== null && newSize !== null"
        class="file-sizes">
        原文件大小: {{ originalSize }} KB | 压缩后大小: {{ newSize }} KB | 压缩率为: {{ compressionRate }}% | 大小减少了: {{ sizeReduced }} KB
      </div>

      <!-- 显示压缩后的图片 -->
        <div>
          <img
            v-if="imageSrc"
            :src="imageSrc"
            alt="压缩结果"
            style="border-radius: 5px; max-height: 50vh;" />
        </div>
        <div>
          <el-button
            v-if="imageSrc"
            plain
            type="primary"
            @click="copyImage">
            复制图片
          </el-button>
          <el-button
            v-if="imageSrc"
            plain
            type="success"
            @click="downloadImage">
            下载图片
          </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { genFileId, ElNotification, ElButton, ElUpload } from 'element-plus';

const originalSize = ref(null);
const newSize = ref(null);
const imageSrc = ref(null);
const originalName = ref(new Date().getTime() +'图片.png');

const compressionRate = computed(() => {
  if (originalSize.value && newSize.value) {
    return (
      ((originalSize.value - newSize.value) / originalSize.value) *
      100
    ).toFixed(2);
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
    originalName.value = file.name;
  }
};

const handleError = (err, file) => {
  ElNotification({ type: 'error', message: '上传失败请重试' });
};
const upload = ref();

const handleExceed = (files) => {
  upload.value.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  upload.value.handleStart(file);
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
      'image/png': base64ToBlob(
        imageSrc.value.replace('data:image/png;base64,', ''),
        'image/png'
      ),
    });
    await navigator.clipboard.write([clipboardItem]);
    ElNotification({ type: 'success', message: '图片已复制到剪贴板' });
  } catch (error) {
    console.error('复制失败:', error);
    ElNotification({ type: 'error', message: '复制失败，请重试' });
  }
};

const downloadImage = () => {
  const link = document.createElement('a');
  link.href = imageSrc.value;
  link.download = originalName.value;
  link.click();
};

const handlePaste = async (event) => {
  const clipboardItems = event.clipboardData.items;
  // console.log(clipboardItems)
  for (const item of clipboardItems) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      originalSize.value = formatFileSize(file);

      const formData = new FormData();
      formData.append('file', file);

      // 模拟请求压缩
      const response = await fetch('/compress', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      newSize.value = result.size;
      imageSrc.value = result.data;
    }
  }
};

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});

//   return {
//     handleExceed,
//     downloadImage,
//     originalSize,
//     newSize,
//     imageSrc,
//     compressionRate,
//     sizeReduced,
//     beforeUpload,
//     handleSuccess,
//     handleError,
//     copyImage,
//   };
// },
// };
</script>

<style>
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

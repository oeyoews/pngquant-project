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
    <div style="margin: 0 auto; width: 600px; text-align: center">
      <div
        v-if="originalSize !== null && newSize !== null"
        class="file-sizes">
        大小: {{ originalSize }} KB →  {{ newSize }} KB |
        压缩率为: {{ compressionRate }}% | 压缩大小: {{ sizeReduced }} KB
      </div>

      <!-- 显示压缩后的图片 -->
      <div>
        <img
          v-if="imageSrc"
          :src="imageSrc"
          alt="压缩结果"
          style="border-radius: 5px; max-height: 50vh" />
      </div>
      <div style="margin-top: 10px;">
        <el-button
          v-if="imageSrc"
          plain
          type="primary"
          @click="copyImage(imageSrc)">
          复制图片
        </el-button>
        <el-button
          v-if="imageSrc"
          plain
          type="success"
          @click="downloadImage(imageSrc, originalName)">
          下载图片
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, ref, computed, onMounted, onUnmounted } from 'vue';
import { genFileId, ElNotification, ElButton, ElUpload } from 'element-plus';
import { copyImage, downloadImage, formatFileSize } from '../utils';

const originalSize = ref(null);
const newSize = ref(null);
const imageSrc = ref(null);
const originalName = ref(new Date().getTime() + '图片.png');

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

const beforeUpload = (file) => {
  originalSize.value = formatFileSize(file);
  ElNotification({
    type: 'info',
    message: h('div', {class: "notify-wrapper"}, [
      h('i', { class: { 'uploading': true, } }),
      h('span','图片上传中'),
    ]),
  });
};

const handleSuccess = (res, file) => {
  ElNotification.closeAll();
  ElNotification({ type: 'success', message: '图片压缩成功' });
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

const handlePaste = async (event) => {
  const clipboardItems = event.clipboardData.items;
  // console.log(clipboardItems)
  for (const item of clipboardItems) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      originalSize.value = formatFileSize(file);

      const formData = new FormData();
      formData.append('file', file);

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
</script>

<style>
.file-sizes {
  margin: 10px 0;
  font-size: 12px;
  color: gray;
}
.uploading {
  display: inline-block;
  width: 16px;
  height: 16px;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath stroke-dasharray='2 4' stroke-dashoffset='6' d='M12 21c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9'%3E%3Canimate attributeName='stroke-dashoffset' dur='0.6s' repeatCount='indefinite' values='6;0'/%3E%3C/path%3E%3Cpath stroke-dasharray='32' stroke-dashoffset='32' d='M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='0.1s' dur='0.4s' values='32;0'/%3E%3C/path%3E%3Cpath stroke-dasharray='10' stroke-dashoffset='10' d='M12 16v-7.5'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='0.5s' dur='0.2s' values='10;0'/%3E%3C/path%3E%3Cpath stroke-dasharray='6' stroke-dashoffset='6' d='M12 8.5l3.5 3.5M12 8.5l-3.5 3.5'%3E%3Canimate fill='freeze' attributeName='stroke-dashoffset' begin='0.7s' dur='0.2s' values='6;0'/%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
.notify-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { default: pngquant } = require('pngquant-bin');
const cors = require('cors');

// console.log(pngquant)

const app = express();
const PORT = 3001;
app.use(express.static('public'));
app.use(cors()); // 允许跨域

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'upload');
    checkDir(uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 获取文件扩展名
    const ext = path.extname(file.originalname);
    // 使用时间戳和随机数生成唯一文件名
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

function uploadFile(req, res, next) {
  let upload = multer({ storage }).single('file');
  upload(req, res, (err) => {
    if (err) {
      res.send('err:' + err);
    } else {
      next();
    }
  });
}

function checkDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log('创建目录', dir);
    fs.mkdirSync(dir, { recursive: true });
  }
}

app.post('/compress', uploadFile, (req, res) => {
  console.log('开始压缩文件', new Date(), req.file.originalname);
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;

  // 确保目标目录存在
  const compressedDir = path.join(__dirname, 'compressed');
  checkDir(compressedDir);
  const outputPath2 = path.join(
    compressedDir + '/' + new Date().getTime() + '.png'
  );

  execFile(
    // `pngquant`,
    // ['-o', outputPath2, inputPath],
    pngquant,
    ['--quality=65-80', '--output', outputPath2, inputPath],
    (err) => {
      if (err) {
        console.error('Error during compression:', err);
        return res.status(500).send('Compression failed');
      }

      // res.setHeader('Content-Type', 'image/png');
      // res.sendFile(outputPath2, (sendErr) => {
      //   if (sendErr) console.error('Error sending file:', sendErr);
      // });
      // console.log(req.file.)
      // return
      fs.stat(outputPath2, (err, stats) => {
        if (err) {
          console.error('Error getting file size:', err);
          return res.status(500).json({ error: 'Failed to get file size' });
        }

        // 读取文件数据
        fs.readFile(outputPath2, (readErr, fileData) => {
          if (readErr) {
            console.error('Error reading file:', readErr);
            return res.status(500).json({ error: 'Failed to read file' });
          }

          // 将文件转换为 Base64
          const base64Image = `data:image/png;base64,${fileData.toString(
            'base64'
          )}`;
          const fileSizeInKB = (stats.size / 1024).toFixed(2); // 文件大小（KB）
          console.log(stats)

          // 返回文件大小和 Base64 数据
          res.json({
            size: fileSizeInKB,
            data: base64Image,
            filename: req.file.originalname,
          });
        });
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

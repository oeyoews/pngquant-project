const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const pngquant = require('pngquant-bin');

const app = express();
app.use(express.static('public'));

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

//自定义中间件
function uploadFile(req, res, next) {
  //dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
  let upload = multer({ storage }).single('file');
  debugger;
  upload(req, res, (err) => {
    //打印结果看下面的截图
    console.log(req.file);
    if (err) {
      res.send('err:' + err);
    } else {
      //将文件信息赋值到req.body中，继续执行下一步
      req.body.photo = req.file.filename;
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
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log(req.file);
  const inputPath = req.file.path;

  // 确保目标目录存在
  const compressedDir = path.join(__dirname, 'compressed');
  checkDir(compressedDir);
  const outputPath2 = path.join(
    compressedDir + '/' + new Date().getTime() + '.png'
  );

  execFile(
    `pngquant`,
    ['--quality=65-80', '-o', outputPath2, inputPath],
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

          // 返回文件大小和 Base64 数据
          res.json({
            size: fileSizeInKB,
            data: base64Image,
          });
        });
      });
    }
  );
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

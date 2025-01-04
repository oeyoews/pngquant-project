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
function uploadFile(req,res,next){
	//dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
	let upload=multer({ storage}).single("image");
	upload(req,res,(err)=>{
		//打印结果看下面的截图
	    console.log(req.file);
		if(err){
	        res.send("err:"+err);
	    }else{
	        //将文件信息赋值到req.body中，继续执行下一步
	        req.body.photo=req.file.filename;
	        next();
	    }
	})
}


app.post('/compress',uploadFile, (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, 'upload', `${req.file.filename}`);

  // 确保目标目录存在
  const compressedDir = path.join(__dirname, 'compressed');
  if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
  }
  // console.log(inputPath, outputPath)
  const outputPath2 = path.join(compressedDir + '/' + new Date().getTime() + ".png");

  execFile(
    `pngquant`,
    ['--quality=65-80', '-o',outputPath2,  inputPath],
    (err) => {
      if (err) {
        console.error('Error during compression:', err);
        return res.status(500).send('Compression failed');
      }

      res.setHeader('Content-Type', 'image/png');
      res.sendFile(outputPath, (sendErr) => {
        if (sendErr) console.error('Error sending file:', sendErr);
        // fs.unlinkSync(inputPath); // 删除临时文件
        // fs.unlinkSync(outputPath);
      });
    }
  );
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

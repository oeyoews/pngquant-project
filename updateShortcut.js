if (process.platform != "win32") {
	return
}

const os = require("os")
const path = require('path');
const fs = require("fs");

// const filename ='在线PNG图片压缩.url'
const batname = 'pngquant-start.bat'
const templatePath = path.join(__dirname, '/templates', filename);
const templateContent = fs.readFileSync(templatePath,"utf8");
const iconfilepath = path.join(__dirname, 'vite.ico')

const desktopPath = path.join(os.homedir(), '/Desktop');
const targetPath = path.join(desktopPath, filename);
const targetContent = templateContent.replace(/PATH/g, iconfilepath);

fs.writeFileSync(targetPath, targetContent);

// fs.symlink(path.join(process.cwd(), batname), path.join(desktopPath, batname), 'file', (e) => {
// 	console.log("error", e);
// });
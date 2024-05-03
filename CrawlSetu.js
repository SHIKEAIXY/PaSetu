import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import { get } from 'http';

// 设置图片保存目录
const saveDir = 'img';
if (!existsSync(saveDir)) {
    mkdirSync(saveDir, { recursive: true });
}

// 爬取的图片地址
const url = 'http://loli.tianyi.one'

// 下载图片
function downloadImage(imageUrl, imageCount) {
    get(imageUrl, (response) => {
        if (response.statusCode === 200) {
            // 从URL中提取文件名
            const fileName = `SHIKEAIXY_${imageCount}.png`
            const filePath = join(saveDir, fileName)
            const outFile = createWriteStream(filePath)

            response.pipe(outFile)

            outFile.on('finish', () => {
                 outFile.close();
                console.log(`Downloaded ${fileName}\n中文：已下载 ${fileName}`)
                // 在图片下载完成后递归调用下载下一张图片
                if (imageCount < maxImages) {
                    downloadImage(url, imageCount + 1)
                }
            })
        } else {
            console.log("Failed to retrieve image.\n中文：无法获取图片。")
        }
    }).on('error', (err) => {
        console.error("Error downloading image:", err)
    });
}

// 下载图片数量
const maxImages = 500
downloadImage(url, 0)

import { existsSync, mkdirSync, createWriteStream } from 'fs'
import { join } from 'path'
import { get } from 'http'

// 设置图片保存目录
const saveDir = 'img'
if (!existsSync(saveDir)) {
    try {
        mkdirSync(saveDir, { recursive: true })
    } catch (err) {
        console.error("Failed to create directory:", err)
        process.exit(1) // 退出
    }
}

// 爬取的URL地址
const url = 'http://moe.jitsu.top/r18'

// 下载图片
function downloadImage(url, index) {
    get(url, (response) => {
        if (response.statusCode === 200) {
            const fileName = `SHIKEAIXY_${index}.png`
            const filePath = join(saveDir, fileName)
            const outFile = createWriteStream(filePath)

            response.pipe(outFile);

            outFile.on('finish', () => {
                outFile.close();
                console.log(`Downloaded ${fileName}\n中文：已下载 ${fileName}`)
                if (index < maxImages) {
                    downloadImage(url, index + 1)
                }
            })
        } else {
            console.log("Failed to retrieve image.\n中文：无法获取图片。")
        }
    }).on('error', (err) => {
        console.error("Error downloading image:", err)
    })
}

// 下载图片数量，默认500（
const maxImages = 500
downloadImage(url, 0)

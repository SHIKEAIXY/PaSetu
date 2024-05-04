import { existsSync, mkdirSync, createWriteStream } from 'fs'
import { join } from 'path'
import { get } from 'http' // 当URL为https时因修改为'https'

// 下载图片
async function downloadImages(url, saveDir, maxImages = 200) {
    // 检查保存目录是否存在，不存在则创建
    if (!existsSync(saveDir)) {
        try {
            mkdirSync(saveDir, { recursive: true })
        } catch (err) {
            throw new Error("创建目录失败: " + err)
        }
    }

    // 下载图片逻辑
    for (let index = 0; index < maxImages; index++) {
        const fileName = `${index}.png`
        const filePath = join(saveDir, fileName)
        const outFile = createWriteStream(filePath)

        try {
            await downloadImage(url, outFile, fileName)
            console.log(`已下载 ${fileName}`)
        } catch (error) {
            console.error(`下载失败 ${fileName}: ${error.message}`)
        }
    }
}

// 下载单张图片
function downloadImage(url, outFile, fileName) {
    return new Promise((resolve, reject) => {
        get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(outFile)
                outFile.on('finish', () => {
                    outFile.close()
                    resolve()
                })
                outFile.on('error', (err) => {
                    reject(new Error("写入错误: " + err))
                })
            } else {
                reject(new Error("获取图片失败.状态码: " + response.statusCode));
            }
        }).on('error', (err) => {
            reject(new Error("下载图片出错: " + err))
        })
    })
}

// 爬取的URL地址，或许 loli.tianyi.one
const url = 'URL链接'
// 设置图片保存目录，当前目录上一级img目录中
const saveDir = '../img'
// 下载图片数量，默认200
downloadImages(url, saveDir, 200).then(() => {
    console.log("所有图片已成功下载！")
}).catch((error) => {
    console.error("下载图片失败:", error.message)
})

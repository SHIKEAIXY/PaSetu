import axios from 'axios'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync, mkdirSync, createWriteStream } from 'fs'

// 设置URL地址 或许可以loli.tianyi.one
const url = 'http://URL链接'
// 设置图片保存目录
const saveDir = '../Img'

function generateRandomString() {
    return uuidv4().replace(/-/g, '')
}

async function downloadImages(url, saveDir, maxImages = 200) {
    if (!existsSync(saveDir)) {
        try {
            mkdirSync(saveDir, { recursive: true })
        } catch (err) {
            throw new Error("创建目录失败: " + err)
        }
    }

    let downloadedCount = 0

    for (let index = 0; index < maxImages; index++) {
        const randomString = generateRandomString()
        const fileName = `image_${randomString}.png`
        const filePath = join(saveDir, fileName)
        const outFile = createWriteStream(filePath)

        try {
            await downloadImage(url, outFile, fileName)
            downloadedCount++
            const currentTime = new Date().toLocaleString()
            console.log(`${currentTime}- ${downloadedCount}: 已下载 ${fileName}`)
        } catch (error) {
            console.error(`下载失败 ${fileName}: ${error.message}`)
        }
    }
}

async function downloadImage(url, outFile, fileName) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        })

        if (response.status >= 300 && response.status < 400) {
            return downloadImage(response.headers.location, outFile, fileName)
        }

        response.data.pipe(outFile)
        outFile.on('finish', () => outFile.close())
    } catch (error) {
        if (error.response) {
            throw new Error(`获取图片失败.状态码: ${error.response.status}`)
        } else if (error.request) {
            throw new Error("下载图片出错: 没有收到响应")
        } else {
            throw new Error("下载图片出错: " + error.message)
        }
    }
}

// 下载图片数量，默认200
downloadImages(url, saveDir, 200).then(() => {
    console.log("所有图片已成功下载！")
}).catch((error) => {
    console.error("下载图片失败:", error.message)
})

process.on('SIGINT', function() {
    console.log("操作被中断")
    process.exit()
})
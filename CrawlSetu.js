import axios from 'axios';
import https from 'https';
import { join, dirname } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

// 配置参数
const CONFIG = {
  baseUrl: 'http://127.0.0.1:5366/Fafa',
  saveDir: join(dirname(fileURLToPath(import.meta.url)), '../Img'),
  concurrency: 10, // 并发下载数量
  maxRetries: 3,  // 单张图片最大重试次数
  timeout: 0   // 单次请求超时(毫秒)
};

// 全局状态
const state = {
  downloaded: new Set(),
  stats: {
    total: 0,
    success: 0,
    skipped: 0,
    failed: 0
  }
};

// HTTP客户端
const httpClient = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: CONFIG.timeout,
  headers: { 'User-Agent': 'Mozilla/5.0' }
});

// 获取文件名
function optimizeFilename(response) {
  const getExt = (type) => ({
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp'
  }[type] || '.webp');

  try {
    const disposition = response.headers['content-disposition'] || '';
    const filename = disposition.match(/filename\*?=["']?(?:UTF-\d['"]*)?([^;\r\n"']*)["']?/i)?.[1] 
                   || new URL(response.config.url).pathname.split('/').pop() 
                   || `dl_${Date.now()}`;
    
    return decodeURIComponent(filename)
      .replace(/[^\w.-]/g, '')
      .replace(/(\.\w+)?$/, getExt(response.headers['content-type']));
  } catch {
    return `dl_${Date.now()}.webp`;
  }
}

// 下载单个文件
async function downloadFile(url, retryCount = 0) {
  const id = ++state.stats.total;
  
  try {
    const response = await httpClient.get(url, { 
      responseType: 'arraybuffer',
      timeout: CONFIG.timeout
    });

    const buffer = response.data;
    const hash = createHash('md5').update(buffer).digest('hex');

    // 重复检测
    if (state.downloaded.has(hash)) {
      state.stats.skipped++;
      process.stdout.write(`\r[${id}] 跳过重复文件 | 成功:${state.stats.success} 失败:${state.stats.failed}`);
      return;
    }

    // 写入
    const filename = optimizeFilename(response);
    const writer = createWriteStream(join(CONFIG.saveDir, filename));
    writer.write(buffer);
    writer.end();

    state.downloaded.add(hash);
    state.stats.success++;
    process.stdout.write(`\r[${id}] 下载:${filename.padEnd(20)} | 成功:${state.stats.success} 失败:${state.stats.failed}`);

  } catch (error) {
    if (retryCount < CONFIG.maxRetries) {
      return downloadFile(url, retryCount + 1);
    }
    state.stats.failed++;
    process.stdout.write(`\r[${id}] 下载失败 | 成功:${state.stats.success} 失败:${state.stats.failed}`);
  }
}

// 下载控制器
async function burstDownload() {
  if (!existsSync(CONFIG.saveDir)) {
    mkdirSync(CONFIG.saveDir, { recursive: true });
  }

  console.log(`🚀 正在爬取图片(线程数:${CONFIG.concurrency})`);
  
  const workers = Array(CONFIG.concurrency).fill().map(async (_, i) => {
    while (true) {
      await downloadFile(CONFIG.baseUrl);
    }
  });

  await Promise.all(workers);
}

// 退出统计
process.on('SIGINT', () => {
  console.log('\n\n📊 最终统计:');
  console.log(`总请求: ${state.stats.total} 成功: ${state.stats.success}`);
  console.log(`跳过重复: ${state.stats.skipped} 失败: ${state.stats.failed}`);
  process.exit();
});

// 启动
burstDownload().catch(console.error);
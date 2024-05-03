import os
import shutil
import requests
from urllib.parse import urlparse
from pathlib import Path
import uuid
import logging

# 设置日志记录
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 设置图片保存目录，当前目录上一级img目录中
save_dir = Path('../img')
save_dir.mkdir(parents=True, exist_ok=True)

# 爬取的图片地址，或许 loli.tianyi.one
url = 'URL链接'

# 下载图片
def download_image(image_url, image_count):
    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()  # 检查是否请求成功
        if response.status_code == 200:
            # 从Content-Disposition头或URL中提取文件名
            #'_' + str(uuid.uuid1())
            file_name = 'SHIKEAIXY_' + str(image_count) + '.png'

            with open(save_dir / file_name, 'wb') as out_file:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, out_file)
            logger.info(f"Downloaded {file_name}\n已下载 {file_name}")
        else:
            logger.warning("Failed to retrieve image.\n无法获取图片。")
    except Exception as e:
        logger.error(f"Error downloading image: {str(e)}\n下载图片时出错：{str(e)}")

try:
    image_count = 0
    # 下载图片数量，默认200（
    while image_count < 200: 
        download_image(url, image_count)
        image_count += 1
except KeyboardInterrupt:
    logger.info("Interrupted by user.\n用户中断了操作。")

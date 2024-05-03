# 修改岁纳京子的原程序进行优化
import os
import shutil
import requests
from urllib.parse import urlparse
from pathlib import Path
import uuid

# 设置图片保存目录
save_dir = Path('img')
save_dir.mkdir(parents=True, exist_ok=True)

# 爬取的图片地址
url = 'http://moe.jitsu.top/r18'

# 下载图片
def download_image(image_url, image_count):
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        # 从Content-Disposition头或URL中提取文件名
        #'_' + str(uuid.uuid1())
        file_name = 'SHIKEAIXY_' + str(image_count) + '.png'

        with open(save_dir / file_name, 'wb') as out_file:
            response.raw.decode_content = True
            shutil.copyfileobj(response.raw, out_file)
        print(f"Downloaded {file_name}\n中文：已下载 {file_name}")
    else:
        print("Failed to retrieve image.\n中文：无法获取图片。")

try:
    image_count = 0
    # 下载图片数量
    while image_count < 500: 
        download_image(url, image_count)
        image_count += 1
except KeyboardInterrupt:
    print("Interrupted by user.\n中文：用户中断了操作。")
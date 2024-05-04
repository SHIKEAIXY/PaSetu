import shutil
import requests # type: ignore
from pathlib import Path
import uuid
import logging
import colorlog # type: ignore

# 设置图片保存目录，当前目录上一级img目录中
save_dir = Path('../img')
save_dir.mkdir(parents=True, exist_ok=True)

# 爬取的图片地址，或许 loli.tianyi.one
url = 'http://URL链接'

# 设置日志记录
handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(asctime)s - %(log_color)s%(levelname)s%(reset)s - %(message)s',
    log_colors={
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'red,bg_white',
    },
    secondary_log_colors={
        'message': {
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red',
        }
    }
))
logger = colorlog.getLogger(__name__)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# 下载图片
def download_image(image_url, image_count):
    try:
        response = requests.get(image_url, stream=True)
        response.raise_for_status() 
        if response.status_code == 200:
            # 从Content-Disposition头或URL中提取文件名
            file_extension = ".png"
            file_name = f"image_{str(uuid.uuid4())}{file_extension}"
            with open(save_dir / file_name, 'wb') as out_file:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, out_file)
            logger.info(f"{image_count}: \033[0;32m已下载\033[0m {file_name}")
        else:
            logger.warning(f"\033[0;33m无法获取图片. 状态码: {response.status_code}\033[0m")
    except requests.exceptions.RequestException as e:
        logger.error(f"\033[0;31m下载图片时出错：{str(e)}\033[0m")
    except Exception as e:
        logger.error(f"\033[0;31m发生未知错误：{str(e)}\033[0m")

try:
    image_count = 0

    # 下载图片数量，默认200
    while image_count < 200: 
        image_count += 1
        download_image(url, image_count)
except KeyboardInterrupt:
    logger.info("中断了操作")

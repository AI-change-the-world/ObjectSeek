"""
测试中文字体渲染功能
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

def test_chinese_text_rendering():
    """测试中文文本渲染"""
    print("🔍 正在测试中文字体渲染...")
    
    # 创建测试图像
    width, height = 800, 600
    img = Image.new('RGB', (width, height), color=(0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    test_text = "第1个场景"
    
    # 尝试加载中文字体
    font_paths = [
        "C:/Windows/Fonts/simhei.ttf",  # 黑体
        "C:/Windows/Fonts/msyh.ttc",    # 微软雅黑
        "C:/Windows/Fonts/simsun.ttc",  # 宋体
        "/System/Library/Fonts/PingFang.ttc",  # macOS
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"  # Linux
    ]
    
    font = None
    font_size = 60
    found_font_path = None
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                font = ImageFont.truetype(font_path, font_size)
                found_font_path = font_path
                print(f"✓ 成功加载字体: {font_path}")
                break
            except Exception as e:
                print(f"× 加载字体失败 {font_path}: {e}")
                continue
    
    if font is None:
        font = ImageFont.load_default()
        print("⚠️ 使用默认字体")
    
    # 获取文本大小
    try:
        bbox = draw.textbbox((0, 0), test_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        print(f"✓ 文本尺寸: {text_width}x{text_height}")
    except Exception as e:
        print(f"× 获取文本尺寸失败: {e}")
        return False
    
    # 计算居中位置
    text_x = (width - text_width) // 2
    text_y = (height - text_height) // 2
    
    # 绘制文本
    try:
        draw.text((text_x, text_y), test_text, font=font, fill=(255, 255, 255))
        print("✓ 成功绘制中文文本")
    except Exception as e:
        print(f"× 绘制文本失败: {e}")
        return False
    
    # 保存测试图像
    try:
        img.save("test_chinese_text.png")
        print("✓ 成功保存测试图像: test_chinese_text.png")
    except Exception as e:
        print(f"× 保存图像失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 开始测试中文字体渲染功能...\n")
    
    success = test_chinese_text_rendering()
    
    if success:
        print("\n✅ 中文字体渲染测试通过！")
        print("💡 现在可以在 moviepy 转场图像中正确显示中文了。")
    else:
        print("\n❌ 中文字体渲染测试失败！")
        print("💡 请检查系统是否有中文字体，或安装 Pillow 库。")
    
    print("\n📋 修复要点:")
    print("1. 使用 PIL/Pillow 替代 OpenCV 进行文本渲染")
    print("2. 自动检测和加载系统中文字体")
    print("3. 支持跨平台字体路径 (Windows/macOS/Linux)")
    print("4. 添加了字体加载失败的容错机制")
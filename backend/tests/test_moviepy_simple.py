"""
简单的 moviepy 测试脚本，验证修复后的代码是否可以正常导入和运行
"""
import sys
import os

# 添加当前目录到路径
sys.path.append(os.path.dirname(__file__))

try:
    from test_moviepy import BBoxAnnotation, Segment, VideoEditor
    print("✓ 成功导入所有类")
    
    # 测试基本功能
    bbox = BBoxAnnotation(120, 50, 50, 200, 200)
    print(f"✓ BBoxAnnotation 创建成功: frame={bbox.frame_index}, bbox={bbox.bbox}")
    
    seg = Segment(100, 300, [bbox])
    print(f"✓ Segment 创建成功: start={seg.start_frame}, end={seg.end_frame}")
    
    # 测试 bbox_dict 转换
    bbox_dict = seg.get_bbox_dict(30)  # 假设 30fps
    print(f"✓ bbox_dict 转换成功: {bbox_dict}")
    
    print("\n所有基本测试通过！MoviePy 代码修复成功。")
    print("\n注意：要运行完整的视频处理功能，需要：")
    print("1. 安装 moviepy: pip install moviepy")
    print("2. 准备测试视频文件 'test.mp4'")
    
except ImportError as e:
    print(f"❌ 导入错误: {e}")
except Exception as e:
    print(f"❌ 其他错误: {e}")
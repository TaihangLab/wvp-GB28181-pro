"""
简单测试脚本 - 直接测试三个技能和triton客户端
"""
import cv2
import numpy as np
import os
import sys
import time
from pathlib import Path

# 添加项目根目录到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

# 导入技能实现
from app.skills.yolo_detector_skill import YoloDetectorSkill
from app.skills.helmet_detector_skill import HelmetDetectorSkill
from app.skills.belt_detector_skill import BeltDetectorSkill
from app.services.triton_client import triton_client

# 创建保存测试图像的目录
OUTPUT_DIR = Path(__file__).parent / "test_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 测试图像路径
COCO_TEST_IMAGE = os.path.join(OUTPUT_DIR, "test3.jpeg")
HELMET_TEST_IMAGE = os.path.join(OUTPUT_DIR, "test1.jpg")
BELT_TEST_IMAGE = os.path.join(OUTPUT_DIR, "test2.jpg")

def test_yolo_detector():
    """测试通用YOLO目标检测"""
    print("\n====== 测试通用YOLO目标检测 ======")
    
    # 创建检测器
    detector = YoloDetectorSkill(model_name="yolo11_coco")
    
    # 检查模型是否就绪
    if not triton_client.is_model_ready(detector.model_name):
        print(f"模型 {detector.model_name} 未就绪，跳过测试")
        return False
    
    # 检查测试图像是否存在
    if not os.path.exists(COCO_TEST_IMAGE):
        print(f"测试图像不存在: {COCO_TEST_IMAGE}")
        return False
    
    # 读取测试图像
    test_image = cv2.imread(COCO_TEST_IMAGE)
    if test_image is None:
        print(f"无法读取测试图像: {COCO_TEST_IMAGE}")
        return False
    
    print(f"测试图像尺寸: {test_image.shape}")
    
    # 执行检测
    start_time = time.time()
    detections = detector(test_image)
    elapsed = time.time() - start_time
    
    # 输出结果
    print(f"检测耗时: {elapsed:.3f}秒")
    print(f"检测到 {len(detections)} 个对象:")
    for i, det in enumerate(detections):
        print(f"对象 {i+1}: 类别={det['class_name']}({det['class_id']}), 置信度={det['score']:.4f}, 边界框={det['bbox']}")
    
    # 可视化结果
    output_path = os.path.join(OUTPUT_DIR, "yolo_test3_output.jpg")
    result_image = detector.visualize(test_image, detections, output_path)
    
    print(f"检测结果已保存至: {output_path}")
    return True

def test_helmet_detector():
    """测试安全帽检测"""
    print("\n====== 测试安全帽检测 ======")
    
    # 创建检测器
    detector = HelmetDetectorSkill(model_name="yolo11_helmet")
    print(f"安全帽检测类别: {detector.class_names}")
    
    # 检查模型是否就绪
    if not triton_client.is_model_ready(detector.model_name):
        print(f"模型 {detector.model_name} 未就绪，跳过测试")
        return False
    
    # 检查测试图像是否存在
    if not os.path.exists(HELMET_TEST_IMAGE):
        print(f"测试图像不存在: {HELMET_TEST_IMAGE}")
        return False
    
    # 读取测试图像
    test_image = cv2.imread(HELMET_TEST_IMAGE)
    if test_image is None:
        print(f"无法读取测试图像: {HELMET_TEST_IMAGE}")
        return False
    
    # 执行检测
    start_time = time.time()
    detections = detector(test_image)
    elapsed = time.time() - start_time
    
    # 输出结果
    print(f"检测耗时: {elapsed:.3f}秒")
    print(f"检测到 {len(detections)} 个对象:")
    for i, det in enumerate(detections):
        print(f"对象 {i+1}: 类别={det['class_name']}({det['class_id']}), 置信度={det['score']:.4f}, 边界框={det['bbox']}")
    
    # 可视化结果
    output_path = os.path.join(OUTPUT_DIR, "helmet_test1_output.jpg")
    result_image = detector.visualize(test_image, detections, output_path)
    
    # 分析安全状况
    if detections:
        safety = detector.analyze_safety(detections)
        print(f"安全分析: {safety}")
    
    print(f"检测结果已保存至: {output_path}")
    return True

def test_belt_detector():
    """测试安全带检测"""
    print("\n====== 测试安全带检测 ======")
    
    # 创建检测器
    detector = BeltDetectorSkill(model_name="yolo11_safebelts")
    print(f"安全带检测类别: {detector.class_names}")
    
    # 检查模型是否就绪
    if not triton_client.is_model_ready(detector.model_name):
        print(f"模型 {detector.model_name} 未就绪，跳过测试")
        return False
    
    # 检查测试图像是否存在
    if not os.path.exists(BELT_TEST_IMAGE):
        print(f"测试图像不存在: {BELT_TEST_IMAGE}")
        return False
    
    # 读取测试图像
    test_image = cv2.imread(BELT_TEST_IMAGE)
    if test_image is None:
        print(f"无法读取测试图像: {BELT_TEST_IMAGE}")
        return False
    
    # 执行检测
    start_time = time.time()
    detections = detector(test_image)
    elapsed = time.time() - start_time
    
    # 输出结果
    print(f"检测耗时: {elapsed:.3f}秒")
    print(f"检测到 {len(detections)} 个对象:")
    for i, det in enumerate(detections):
        print(f"对象 {i+1}: 类别={det['class_name']}({det['class_id']}), 置信度={det['score']:.4f}, 边界框={det['bbox']}")
    
    # 可视化结果
    output_path = os.path.join(OUTPUT_DIR, "belt_test2_output.jpg")
    result_image = detector.visualize(test_image, detections, output_path)
    
    # 分析安全状况
    if detections:
        safety = detector.analyze_safety(detections)
        print(f"安全分析: {safety}")
    
    print(f"检测结果已保存至: {output_path}")
    return True

if __name__ == "__main__":
    print("开始测试各检测技能：")
    print(f"- COCO检测使用: {COCO_TEST_IMAGE}")
    print(f"- 安全帽检测使用: {HELMET_TEST_IMAGE}")
    print(f"- 安全带检测使用: {BELT_TEST_IMAGE}")
    
    # 检查服务器是否就绪
    if not triton_client.is_server_ready():
        print("Triton服务器未就绪，请先启动服务器")
        sys.exit(1)
    
    # 测试各个技能
    success_count = 0
    total_count = 3
    
    if test_yolo_detector():
        success_count += 1
    
    if test_helmet_detector():
        success_count += 1
    
    if test_belt_detector():
        success_count += 1
    
    # 输出测试摘要
    print(f"\n测试完成: {success_count}/{total_count} 个测试通过")
    print(f"测试结果已保存到: {OUTPUT_DIR}") 
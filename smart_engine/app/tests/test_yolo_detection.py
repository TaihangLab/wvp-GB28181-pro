#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import os
import cv2
import numpy as np
from pathlib import Path

# 将项目根目录添加到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# 导入Triton客户端
from app.services.triton_client import TritonClient, YOLOTritonClient

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_yolo_detection():
    """测试YOLO模型目标检测功能"""
    logger.info("\n====== 测试YOLO模型目标检测功能 ======")
    
    # 初始化基础Triton客户端
    client = TritonClient()
    
    # 检查服务器状态
    if not client.is_server_live() or not client.is_server_ready():
        logger.error("服务器离线或未就绪，无法测试YOLO模型")
        return False
    
    # 获取可用的YOLO模型
    models = client.get_model_repository_index()
    yolo_models = []
    
    if not models or "models" not in models:
        logger.error("无法获取模型仓库信息")
        return False
    
    # 查找所有YOLO模型
    for model in models["models"]:
        model_name = model.get("name", "")
        if "yolo" in model_name.lower():
            yolo_models.append(model_name)
    
    if not yolo_models:
        logger.error("未找到任何YOLO模型")
        return False
    
    logger.info(f"发现 {len(yolo_models)} 个YOLO模型: {', '.join(yolo_models)}")
    
    # 先确保所有YOLO模型都已加载
    loaded_models = []
    for model_name in yolo_models:
        logger.info(f"\n----- 尝试加载模型 {model_name} -----")
        
        # 检查模型是否已就绪
        ready = client.is_model_ready(model_name)
        logger.info(f"模型 {model_name} 就绪状态: {ready}")
        
        if not ready:
            # 尝试加载模型
            logger.info(f"尝试加载模型 {model_name}")
            load_result = client.load_model(model_name)
            logger.info(f"加载结果: {'成功' if load_result else '失败'}")
            
            # 再次检查就绪状态
            ready = client.is_model_ready(model_name)
            logger.info(f"加载后模型 {model_name} 就绪状态: {ready}")
        
        if ready:
            loaded_models.append(model_name)
    
    if not loaded_models:
        logger.error("没有就绪的YOLO模型可用于测试")
        return False
    
    logger.info(f"\n可用于测试的模型: {len(loaded_models)} 个, {', '.join(loaded_models)}")
    
    # 为测试准备图像
    test_images_dir = os.path.join(os.path.dirname(__file__), "test_images")
    os.makedirs(test_images_dir, exist_ok=True)
    
    test_image_path = os.path.join(test_images_dir, "test1.jpg")
    
    # 检查测试图像是否存在，如果不存在则创建一个简单的测试图像
    if not os.path.exists(test_image_path):
        logger.warning(f"测试图像不存在: {test_image_path}, 创建一个简单的测试图像")
        # 创建一个640x640的测试图像，包含一个矩形
        test_image = np.zeros((640, 640, 3), dtype=np.uint8)
        # 添加一个矩形，模拟目标
        cv2.rectangle(test_image, (100, 100), (300, 300), (0, 0, 255), -1)
        # 添加一个圆形，模拟另一个目标
        cv2.circle(test_image, (450, 450), 80, (0, 255, 0), -1)
        # 保存测试图像
        cv2.imwrite(test_image_path, test_image)
        logger.info(f"已创建测试图像: {test_image_path}")
    
    # 对每个可用模型执行测试
    for model_name in loaded_models:
        logger.info(f"\n----- 使用模型 {model_name} 进行测试 -----")
        
        # 初始化YOLO客户端，禁用自动加载
        yolo_client = YOLOTritonClient(
            model_name=model_name,
            conf_thres=0.3,  # 较低的置信度阈值
            iou_thres=0.45,
            auto_load=False  # 禁用自动加载，因为我们已经确保模型已加载
        )
        
        # 读取测试图像
        logger.info(f"读取测试图像: {test_image_path}")
        image = cv2.imread(test_image_path)
        if image is None:
            logger.error(f"无法读取测试图像: {test_image_path}")
            continue
        
        # 执行检测
        try:
            logger.info(f"使用模型 {model_name} 执行检测")
            results = yolo_client.detect(image)
            
            # 输出检测结果
            if results:
                logger.info(f"检测到 {len(results)} 个目标:")
                for i, result in enumerate(results):
                    class_id = result.get("class_id", -1)
                    class_name = result.get("class_name", "未知")
                    score = result.get("score", 0)
                    bbox = result.get("bbox", [0, 0, 0, 0])
                    
                    logger.info(f"  目标 {i+1}: 类别: {class_id} ({class_name}), 置信度: {score:.4f}, 边界框: {bbox}")
                
                # 可视化结果
                output_path = os.path.join(test_images_dir, f"result_{model_name}.jpg")
                logger.info(f"可视化结果并保存到: {output_path}")
                yolo_client.visualize(image, results, output_path)
            else:
                logger.warning(f"模型 {model_name} 未检测到任何目标")
        
        except Exception as e:
            logger.error(f"使用模型 {model_name} 检测时出错: {e}", exc_info=True)
    
    logger.info("\nYOLO模型目标检测测试完成")
    return True

if __name__ == "__main__":
    test_yolo_detection() 
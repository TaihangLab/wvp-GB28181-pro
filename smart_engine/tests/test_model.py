#!/usr/bin/env python
"""
测试模型服务和Triton服务器连接
用法: python -m tests.test_model
"""
import requests
import json
import logging
import sys
import os
import cv2
import numpy as np
from app.services.triton_client import triton_client

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_triton_server():
    """测试Triton服务器连接"""
    logger.info("测试Triton服务器连接...")
    
    # 检查服务器是否在线
    is_live = triton_client.is_server_live()
    logger.info(f"服务器是否在线: {is_live}")
    
    # 检查服务器是否就绪
    is_ready = triton_client.is_server_ready()
    logger.info(f"服务器是否就绪: {is_ready}")
    
    if not is_live or not is_ready:
        logger.error("Triton服务器连接失败")
        return False
    
    # 获取服务器元数据
    metadata = triton_client.get_server_metadata()
    if metadata:
        logger.info(f"服务器名称: {metadata.get('name')}")
        logger.info(f"服务器版本: {metadata.get('version')}")
    
    # 获取模型仓库索引
    models = triton_client.get_model_repository_index()
    if models and "models" in models:
        model_list = models["models"]
        logger.info(f"找到 {len(model_list)} 个模型:")
        
        for model in model_list:
            model_name = model.get("name")
            model_version = model.get("version", "")
            model_state = model.get("state", "")
            
            # 检查模型是否就绪
            is_model_ready = triton_client.is_model_ready(model_name)
            
            logger.info(f"  - {model_name} (版本: {model_version}, 状态: {model_state}, 就绪: {is_model_ready})")
    else:
        logger.warning("未找到任何模型")
    
    return True

def test_yolo_inference(image_path=None):
    """测试YOLO模型推理"""
    logger.info("测试YOLO模型推理...")
    
    # 获取可用的YOLO模型
    models = triton_client.get_model_repository_index()
    yolo_models = []
    
    if models and "models" in models:
        for model in models["models"]:
            model_name = model.get("name", "")
            if "yolo" in model_name.lower() and triton_client.is_model_ready(model_name):
                yolo_models.append(model_name)
    
    if not yolo_models:
        logger.error("未找到可用的YOLO模型")
        return False
    
    # 选择第一个YOLO模型
    model_name = yolo_models[0]
    logger.info(f"使用模型: {model_name}")
    
    # 准备测试图像
    if image_path is None or not os.path.exists(image_path):
        # 创建一个简单的测试图像
        logger.info("未提供测试图像，创建一个空白测试图像")
        test_image = np.zeros((640, 640, 3), dtype=np.uint8)
    else:
        # 读取指定的测试图像
        logger.info(f"使用测试图像: {image_path}")
        test_image = cv2.imread(image_path)
        if test_image is None:
            logger.error(f"无法读取测试图像: {image_path}")
            return False
    
    # 预处理图像
    logger.info("预处理图像...")
    input_image = cv2.resize(test_image, (640, 640))
    input_image = input_image.astype(np.float32) / 255.0
    input_tensor = np.expand_dims(input_image.transpose(2, 0, 1), axis=0)
    
    # 执行推理
    logger.info(f"执行推理，使用模型: {model_name}")
    try:
        inputs = {"images": input_tensor}
        outputs = triton_client.infer(model_name, inputs)
        
        if outputs is None:
            logger.error("推理失败")
            return False
        
        # 输出结果
        logger.info("推理成功，输出结果:")
        for output_name, output_data in outputs.items():
            logger.info(f"  - {output_name}: 形状={output_data.shape}, 类型={output_data.dtype}")
        
        return True
    except Exception as e:
        logger.exception(f"推理过程中发生错误: {str(e)}")
        return False

def run_tests():
    """运行所有模型测试"""
    tests = [
        {"name": "Triton服务器连接测试", "func": test_triton_server},
        {"name": "YOLO模型推理测试", "func": test_yolo_inference}
    ]
    
    success_count = 0
    for test in tests:
        logger.info(f"\n=== 执行 {test['name']} ===")
        if test["func"]():
            logger.info(f"{test['name']} 通过!")
            success_count += 1
        else:
            logger.error(f"{test['name']} 失败!")
        logger.info("=" * 50)
    
    logger.info(f"测试完成: {success_count}/{len(tests)} 测试通过")
    return success_count == len(tests)

if __name__ == "__main__":
    logger.info("开始模型服务测试...")
    if run_tests():
        logger.info("所有模型测试通过！")
        sys.exit(0)
    else:
        logger.warning("部分模型测试失败，请检查日志")
        sys.exit(1) 
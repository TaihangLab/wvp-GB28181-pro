#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import os
import cv2
import numpy as np
from pathlib import Path
import json  # 添加json模块导入

# 将项目根目录添加到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# 导入Triton客户端
from app.services.triton_client import TritonClient, YOLOTritonClient

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_basic_client():
    """测试基本的Triton客户端功能"""
    logger.info("====== 测试基本Triton客户端 ======")
    
    # 初始化客户端
    client = TritonClient()
    
    # 检查服务器状态
    server_live = client.is_server_live()
    logger.info(f"服务器是否在线: {server_live}")
    
    server_ready = client.is_server_ready()
    logger.info(f"服务器是否就绪: {server_ready}")
    
    if not server_live:
        logger.error("服务器离线，无法继续测试")
        return
    
    # 获取服务器元数据
    server_metadata = client.get_server_metadata()
    if server_metadata:
        logger.info(f"服务器名称: {server_metadata.get('name')}")
        logger.info(f"服务器版本: {server_metadata.get('version')}")
    
    # 获取可用模型列表
    models = client.get_model_repository_index()
    if models and "models" in models:
        logger.info(f"发现 {len(models['models'])} 个模型:")
        
        # 检查每个模型的状态
        for model in models["models"]:
            model_name = model.get("name")
            if model_name:
                logger.info(f"- 模型: {model_name}")
                model_ready = client.is_model_ready(model_name)
                logger.info(f"  - 就绪状态: {model_ready}")
                
                # 获取模型元数据
                if model_ready:
                    model_metadata = client.get_model_metadata(model_name)
                    if model_metadata:
                        logger.info(f"  - 模型元数据:")
                        # 格式化输出元数据
                        formatted_metadata = json.dumps(model_metadata, indent=4, ensure_ascii=False)
                        for line in formatted_metadata.split('\n'):
                            logger.info(f"      {line}")
                        logger.info(f"  - 输入: {len(model_metadata.get('inputs', []))} 个")
                        logger.info(f"  - 输出: {len(model_metadata.get('outputs', []))} 个")
    else:
        logger.warning("未找到可用模型")
    
    logger.info("基本Triton客户端测试完成")

def test_model_load_unload():
    """测试模型加载与卸载功能"""
    logger.info("\n====== 测试模型加载与卸载功能 ======")
    
    client = TritonClient()
    
    # 检查服务器状态
    if not client.is_server_live() or not client.is_server_ready():
        logger.error("服务器离线或未就绪，无法测试模型加载/卸载")
        return
    
    # 获取仓库中的模型信息
    models = client.get_model_repository_index()
    
    if not models or "models" not in models:
        logger.error("无法获取模型仓库信息")
        return
    
    # 尝试找到所有YOLO模型
    yolo_models = []
    for model in models["models"]:
        model_name = model.get("name", "")
        if "yolo" in model_name.lower():
            yolo_models.append(model_name)
    
    if not yolo_models:
        logger.warning("未找到YOLO模型，无法测试加载/卸载功能")
        return
    
    # 测试每个YOLO模型的加载/卸载
    for model_name in yolo_models:
        logger.info(f"\n测试模型 {model_name} 的加载/卸载")
        
        # 检查模型当前状态
        initial_ready = client.is_model_ready(model_name)
        logger.info(f"模型 {model_name} 初始状态: {'已就绪' if initial_ready else '未就绪'}")
        
        # 尝试卸载模型
        if initial_ready:
            logger.info(f"尝试卸载模型 {model_name}")
            unload_result = client.unload_model(model_name)
            logger.info(f"卸载模型 {model_name} 结果: {'成功' if unload_result else '失败'}")
            
            # 验证卸载结果
            after_unload = client.is_model_ready(model_name)
            logger.info(f"卸载后模型 {model_name} 状态: {'已就绪' if after_unload else '未就绪'}")
            
            if after_unload:
                logger.warning(f"模型 {model_name} 卸载失败或卸载后仍然就绪")
        
        # 尝试加载模型
        logger.info(f"尝试加载模型 {model_name}")
        load_result = client.load_model(model_name)
        logger.info(f"加载模型 {model_name} 结果: {'成功' if load_result else '失败'}")
        
        # 验证加载结果
        after_load = client.is_model_ready(model_name)
        logger.info(f"加载后模型 {model_name} 状态: {'已就绪' if after_load else '未就绪'}")
        
        if not after_load:
            logger.warning(f"模型 {model_name} 加载失败或加载后仍未就绪")
    
    logger.info("模型加载/卸载测试完成")

def test_yolo():
    """测试YOLO模型检测功能"""
    logger.info("\n====== 测试YOLO模型检测功能 ======")
    
    # 初始化基础Triton客户端用于操作模型
    base_client = TritonClient()
    
    # 检查服务器状态
    if not base_client.is_server_live() or not base_client.is_server_ready():
        logger.error("服务器离线或未就绪，无法测试YOLO模型")
        return
    
    # 获取所有YOLO模型并尝试加载
    models = base_client.get_model_repository_index()
    yolo_models = []
    
    if models and "models" in models:
        for model in models["models"]:
            model_name = model.get("name")
            if model_name and "yolo" in model_name.lower():
                yolo_models.append(model_name)
    
    if not yolo_models:
        logger.error("没有找到YOLO模型")
        return
    
    # 尝试加载所有YOLO模型
    logger.info("尝试加载所有YOLO模型")
    for model_name in yolo_models:
        ready_before = base_client.is_model_ready(model_name)
        logger.info(f"尝试加载模型: {model_name}, 当前就绪状态: {ready_before}")
        load_result = base_client.load_model(model_name)
        logger.info(f"加载模型 {model_name} 结果: {'成功' if load_result else '失败'}")
        
        # 再次检查模型是否就绪
        ready_after = base_client.is_model_ready(model_name)
        logger.info(f"加载后模型 {model_name} 就绪状态: {ready_after}")
    
    # 再次检查所有模型的状态，选择第一个就绪的模型进行测试
    available_models = []
    for model_name in yolo_models:
        if base_client.is_model_ready(model_name):
            available_models.append(model_name)
    
    if not available_models:
        logger.error("尝试加载后仍没有可用的YOLO模型，无法继续测试")
        return
    
    test_model = available_models[0]
    logger.info(f"选择模型 {test_model} 进行测试")
    
    # 初始化YOLO客户端，禁用自动加载
    yolo_client = YOLOTritonClient(
        model_name=test_model, 
        conf_thres=0.4, 
        iou_thres=0.45,
        auto_load=False  # 禁用自动加载，因为我们已经手动加载了
    )
    
    # 准备测试图像
    test_image_path = os.path.join(os.path.dirname(__file__), "test_images", "test1.jpg")
    if not os.path.exists(test_image_path):
        logger.error(f"测试图像不存在: {test_image_path}")
        test_image_dir = os.path.join(os.path.dirname(__file__), "test_images")
        os.makedirs(test_image_dir, exist_ok=True)
        logger.info(f"已创建测试图像目录: {test_image_dir}，请放入测试图像并重新运行测试")
        return
    
    # 读取测试图像
    image = cv2.imread(test_image_path)
    if image is None:
        logger.error(f"无法读取测试图像: {test_image_path}")
        return
    
    # 执行推理
    logger.info(f"使用模型 {test_model} 进行检测")
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
    else:
        logger.warning("未检测到任何目标，或检测过程出现错误")
    
    logger.info("YOLO模型测试完成")

if __name__ == "__main__":
    # 测试基本客户端
    test_basic_client()
    
    # 测试模型加载和卸载
    test_model_load_unload()
    
    # 测试YOLO客户端
    test_yolo() 
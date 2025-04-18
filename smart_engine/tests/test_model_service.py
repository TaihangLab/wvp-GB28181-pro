#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import json
import grpc
import sys
import os
import time
import cv2
import numpy as np

# 将项目根目录添加到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# 导入proto生成的文件
from protos.generated import vision_service_pb2
from protos.generated import vision_service_pb2_grpc
from app.core.auth import create_access_token

# 确保SQLAlchemy模型已加载
from app.db.base import Base
from app.db.session import engine, get_db

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_model_service():
    """测试模型管理服务"""
    # 创建认证token
    token = create_access_token({"sub": "test_user"})
    metadata = [('authorization', token)]
    
    # 创建gRPC通道
    channel = grpc.insecure_channel('localhost:50051')
    stub = vision_service_pb2_grpc.ModelServiceStub(channel)
    
    try:
        # 测试添加模型
        logger.info("====== 测试添加模型 ======")
        model = vision_service_pb2.Model(
            name="测试模型_" + str(int(time.time())),
            version="1.0.0",
            description="这是一个测试模型",
            status=True,
            config=json.dumps({
                "framework": "pytorch",
                "input_shape": [1, 3, 224, 224],
                "output_shape": [1, 1000]
            }),
            triton_config=json.dumps({
                "platform": "pytorch_libtorch",
                "max_batch_size": 16,
                "input": [
                    {
                        "name": "input",
                        "data_type": "TYPE_FP32",
                        "dims": [3, 224, 224]
                    }
                ],
                "output": [
                    {
                        "name": "output",
                        "data_type": "TYPE_FP32",
                        "dims": [1000]
                    }
                ]
            })
        )
        
        try:
            add_response = stub.AddModel(
                vision_service_pb2.AddModelRequest(model=model),
                metadata=metadata
            )
            logger.info(f"添加模型成功: ID={add_response.model.id}, 名称={add_response.model.name}")
        except grpc.RpcError as e:
            logger.error(f"添加模型失败: {e.code()}: {e.details()}")
            return
        
        # 测试获取模型列表
        logger.info("\n====== 测试获取模型列表 ======")
        try:
            list_response = stub.ListModels(
                vision_service_pb2.ListModelsRequest(page=1, page_size=10),
                metadata=metadata
            )
            logger.info(f"获取到 {list_response.total} 个模型")
            
            # 打印所有模型的基本信息
            for i, model in enumerate(list_response.models):
                logger.info(f"模型 #{i+1}: ID={model.id}, 名称={model.name}, 版本={model.version}, 状态={model.status}")
        except grpc.RpcError as e:
            logger.error(f"获取模型列表失败: {e.code()}: {e.details()}")
        
        # 测试获取单个模型详情
        logger.info("\n====== 测试获取模型详情 ======")
        try:
            get_response = stub.GetModel(
                vision_service_pb2.GetModelRequest(id=add_response.model.id),
                metadata=metadata
            )
            logger.info(f"获取模型详情成功: ID={get_response.model.id}, 名称={get_response.model.name}")
            logger.info(f"模型配置: {get_response.model.config}")
            logger.info(f"Triton配置: {get_response.model.triton_config}")
        except grpc.RpcError as e:
            logger.error(f"获取模型详情失败: {e.code()}: {e.details()}")
        
        # 测试更新模型
        logger.info("\n====== 测试更新模型 ======")
        update_model = vision_service_pb2.Model(
            name=add_response.model.name + "_更新",
            version="1.0.1",
            description="这是一个更新后的测试模型",
            status=True,
            config=add_response.model.config,
            triton_config=add_response.model.triton_config
        )
        
        try:
            update_response = stub.UpdateModel(
                vision_service_pb2.UpdateModelRequest(
                    id=add_response.model.id,
                    model=update_model
                ),
                metadata=metadata
            )
            logger.info(f"更新模型成功: ID={update_response.model.id}, 名称={update_response.model.name}, 版本={update_response.model.version}")
        except grpc.RpcError as e:
            logger.error(f"更新模型失败: {e.code()}: {e.details()}")
        
        # 测试获取Triton模型信息
        logger.info("\n====== 测试获取Triton模型信息 ======")
        try:
            # 获取所有YOLO模型的信息
            yolo_models = ["yolo11_coco", "yolo11_helmet", "yolo11_safebelts"]
            
            for model_name in yolo_models:
                logger.info(f"\n----- 获取模型 {model_name} 信息 -----")
                
                model_info_response = stub.GetModelInfo(
                    vision_service_pb2.ModelInfoRequest(model_name=model_name),
                    metadata=metadata
                )
                
                if model_info_response.success:
                    info = model_info_response.model_info
                    logger.info(f"模型名称: {info.name}")
                    logger.info(f"模型状态: {info.state}")
                    logger.info(f"是否就绪: {info.ready}")
                    
                    if info.metadata:
                        metadata_dict = json.loads(info.metadata)
                        logger.info(f"元数据: {json.dumps(metadata_dict, indent=2, ensure_ascii=False)}")
                    
                    if info.config:
                        config_dict = json.loads(info.config)
                        logger.info(f"配置: {json.dumps(config_dict, indent=2, ensure_ascii=False)}")
                else:
                    logger.error(f"获取模型信息失败: {model_info_response.message}")
        except grpc.RpcError as e:
            logger.error(f"获取模型信息失败: {e.code()}: {e.details()}")
        
        # 测试模型加载和卸载
        logger.info("\n====== 测试模型加载和卸载 ======")
        try:
            # 选择任意一个YOLO模型进行测试
            test_model = "yolo11_coco"
            
            # 先检查模型信息
            info_response = stub.GetModelInfo(
                vision_service_pb2.ModelInfoRequest(model_name=test_model),
                metadata=metadata
            )
            
            if info_response.success:
                initial_ready = info_response.model_info.ready
                logger.info(f"模型 {test_model} 初始状态: {'就绪' if initial_ready else '未就绪'}")
                
                # 如果模型就绪，先卸载它
                if initial_ready:
                    logger.info(f"尝试卸载模型 {test_model}")
                    unload_response = stub.UnloadModel(
                        vision_service_pb2.UnloadModelRequest(
                            model_name=test_model,
                            unload_dependents=False
                        ),
                        metadata=metadata
                    )
                    
                    logger.info(f"卸载结果: {'成功' if unload_response.success else '失败'}")
                    logger.info(f"消息: {unload_response.message}")
                    
                    # 验证卸载后状态
                    info_after_unload = stub.GetModelInfo(
                        vision_service_pb2.ModelInfoRequest(model_name=test_model),
                        metadata=metadata
                    ).model_info
                    
                    logger.info(f"卸载后状态: {'就绪' if info_after_unload.ready else '未就绪'}")
                
                # 尝试加载模型
                logger.info(f"尝试加载模型 {test_model}")
                load_response = stub.LoadModel(
                    vision_service_pb2.LoadModelRequest(
                        model_name=test_model,
                        model_version=""
                    ),
                    metadata=metadata
                )
                
                logger.info(f"加载结果: {'成功' if load_response.success else '失败'}")
                logger.info(f"消息: {load_response.message}")
                logger.info(f"是否就绪: {load_response.ready}")
                
                # 验证加载后状态
                info_after_load = stub.GetModelInfo(
                    vision_service_pb2.ModelInfoRequest(model_name=test_model),
                    metadata=metadata
                ).model_info
                
                logger.info(f"加载后状态: {'就绪' if info_after_load.ready else '未就绪'}")
            else:
                logger.error(f"获取模型信息失败: {info_response.message}")
        except grpc.RpcError as e:
            logger.error(f"模型加载/卸载测试失败: {e.code()}: {e.details()}")
        
        # 测试删除模型
        logger.info("\n====== 测试删除模型 ======")
        try:
            delete_response = stub.DeleteModel(
                vision_service_pb2.DeleteModelRequest(id=add_response.model.id),
                metadata=metadata
            )
            logger.info(f"删除模型结果: {delete_response.success}")
            
            # 验证模型已被删除
            try:
                stub.GetModel(
                    vision_service_pb2.GetModelRequest(id=add_response.model.id),
                    metadata=metadata
                )
                logger.error("删除验证失败: 模型仍然存在!")
            except grpc.RpcError as e:
                if e.code() == grpc.StatusCode.NOT_FOUND:
                    logger.info("删除验证成功: 模型已被正确删除")
                else:
                    logger.error(f"删除验证时发生错误: {e.code()}: {e.details()}")
        except grpc.RpcError as e:
            logger.error(f"删除模型失败: {e.code()}: {e.details()}")
    
    except Exception as e:
        logger.error(f"测试过程中发生错误: {str(e)}", exc_info=True)
    finally:
        channel.close()

if __name__ == '__main__':
    test_model_service() 
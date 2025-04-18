#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import json
import grpc
import sys
import os
from protos.generated import vision_service_pb2
from protos.generated import vision_service_pb2_grpc
from app.services.wvp_client import wvp_client
from app.services.camera_service import CameraService
from app.core.auth import create_access_token

# 将项目根目录添加到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# 确保SQLAlchemy模型已加载
from app.db.base import Base  # 这会加载所有模型
from app.db.session import engine, get_db

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_wvp_devices():
    """测试WVP设备获取功能"""
    try:
        # 测试获取国标设备
        logger.info("====== 测试获取国标设备 ======")
        gb_devices = wvp_client.get_devices()
        logger.info(f"获取到 {gb_devices.get('total', 0)} 个国标设备")
        
        # 打印前5个设备的关键信息
        for i, device in enumerate(gb_devices.get("list", [])[:5]):
            logger.info(f"GB设备 #{i+1}: deviceId={device.get('deviceId')}, name={device.get('name')}, online={device.get('online')}")
        
        # 测试获取推流设备
        logger.info("\n====== 测试获取推流设备 ======")
        push_devices = wvp_client.get_push_list()
        logger.info(f"获取到 {push_devices.get('total', 0)} 个推流设备")
        
        # 打印前5个设备的关键信息
        for i, device in enumerate(push_devices.get("list", [])[:5]):
            logger.info(f"推流设备 #{i+1}: app={device.get('app')}, stream={device.get('stream')}, name={device.get('name')}")
        
        # 测试获取流代理设备
        logger.info("\n====== 测试获取流代理设备 ======")
        proxy_devices = wvp_client.get_proxy_list()
        logger.info(f"获取到 {proxy_devices.get('total', 0)} 个流代理设备")
        
        # 打印前5个设备的关键信息
        for i, device in enumerate(proxy_devices.get("list", [])[:5]):
            logger.info(f"流代理 #{i+1}: app={device.get('app')}, stream={device.get('stream')}, name={device.get('name')}")
        
        logger.info("\n所有WVP设备测试完成")
        
    except Exception as e:
        logger.error(f"WVP设备测试失败: {str(e)}", exc_info=True)

def test_local_camera_service():
    """测试本地CameraService实例"""
    try:
        logger.info("\n====== 测试本地CameraService实例 ======")
        
        # 确保SQLAlchemy模型关系已正确加载
        from app.models.camera import Camera, CameraSkill
        from app.models.skill import Skill, SkillModel
        from app.models.model import Model
        
        # 创建CameraService实例
        service = CameraService()
        
        # 创建一个模拟的gRPC上下文
        class MockContext:
            def set_code(self, code):
                logger.info(f"设置错误码: {code}")
                
            def set_details(self, details):
                logger.info(f"设置错误详情: {details}")
        
        mock_context = MockContext()
        
        # 调用ListCameras方法
        response = service.ListCameras(
            vision_service_pb2.ListCamerasRequest(),
            mock_context
        )
        
        logger.info(f"本地ListCameras调用返回摄像头总数: {response.total}")
        
        # 按类型统计摄像头
        ai_cameras = 0
        gb_cameras = 0
        push_cameras = 0
        proxy_cameras = 0
        
        # 分析返回的摄像头
        for camera in response.cameras:
            # 通过设备ID前缀或标签判断设备类型
            if camera.device_id.startswith("push_"):
                push_cameras += 1
            elif camera.device_id.startswith("proxy_"):
                proxy_cameras += 1
            elif "GB28181" in camera.tags:
                gb_cameras += 1
            else:
                ai_cameras += 1
        
        # 打印摄像头统计
        logger.info("\n====== 本地测试摄像头类型统计 ======")
        logger.info(f"AI平台设备: {ai_cameras}")
        logger.info(f"国标设备: {gb_cameras}")
        logger.info(f"推流设备: {push_cameras}")
        logger.info(f"流代理: {proxy_cameras}")
        logger.info(f"总计: {response.total}")
        
    except Exception as e:
        logger.error(f"本地CameraService测试失败: {str(e)}", exc_info=True)

def test_list_cameras():
    """测试ListCameras服务方法"""
    try:
        logger.info("\n====== 测试ListCameras服务方法 ======")
        
        # 创建认证token
        token = create_access_token({"sub": "test_user"})
        metadata = [('authorization', token)]

        
        # 创建gRPC测试通道和stub
        channel = grpc.insecure_channel('localhost:50051')
        stub = vision_service_pb2_grpc.CameraServiceStub(channel)
        
        try:
            # 调用ListCameras方法
            response = stub.ListCameras(
                vision_service_pb2.ListCamerasRequest(),
                metadata=metadata
            )
            
            logger.info(f"ListCameras 返回摄像头总数: {response.total}")
            
            # 按类型统计摄像头
            ai_cameras = 0
            gb_cameras = 0
            push_cameras = 0
            proxy_cameras = 0
            
            # 分析返回的摄像头，并打印详细信息
            for i, camera in enumerate(response.cameras):
                # 通过设备ID前缀或标签判断设备类型
                if camera.device_id.startswith("push_"):
                    push_cameras += 1
                    camera_type = "推流设备"
                elif camera.device_id.startswith("proxy_"):
                    proxy_cameras += 1
                    camera_type = "流代理"
                elif "GB28181" in camera.tags:
                    gb_cameras += 1
                    camera_type = "国标设备"
                else:
                    ai_cameras += 1
                    camera_type = "AI平台设备"
                
                # 只打印前3个各类型设备的详细信息
                if (camera_type == "AI平台设备" and ai_cameras <= 3) or \
                   (camera_type == "国标设备" and gb_cameras <= 3) or \
                   (camera_type == "推流设备" and push_cameras <= 3) or \
                   (camera_type == "流代理" and proxy_cameras <= 3):
                    logger.info(f"摄像头 #{i+1}: 类型={camera_type}, ID={camera.id}, 设备ID={camera.device_id}, 名称={camera.name}")
                    logger.info(f"  状态={camera.status}, 标签={camera.tags}")
            
            # 打印摄像头统计
            logger.info("\n====== 摄像头类型统计 ======")
            logger.info(f"AI平台设备: {ai_cameras}")
            logger.info(f"国标设备: {gb_cameras}")
            logger.info(f"推流设备: {push_cameras}")
            logger.info(f"流代理: {proxy_cameras}")
            logger.info(f"总计: {response.total}")
            
        except grpc.RpcError as e:
            logger.error(f"ListCameras服务调用失败: {e.code()}: {e.details()}")
            
        finally:
            channel.close()
            
    except Exception as e:
        logger.error(f"ListCameras测试失败: {str(e)}", exc_info=True)

if __name__ == '__main__':
    # 测试WVP设备
    test_wvp_devices()
    
    # 测试本地CameraService
    test_local_camera_service()
    
    # 测试ListCameras服务
    test_list_cameras() 
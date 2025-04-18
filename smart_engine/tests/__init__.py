"""
测试包
包含各种API测试脚本

使用方法：
- 摄像头API测试: python -m tests.test_camera_api
- 模型服务测试: python -m tests.test_model
"""

# 导出测试函数以便在其他模块中使用
from tests.test_camera_api import (
    test_create_camera, 
    test_get_camera, 
    test_update_camera, 
    test_delete_camera, 
    test_list_ai_cameras, 
    test_list_wvp_cameras,
    test_list_gb28181_devices,
    test_list_push_devices,
    test_list_proxy_devices,
    test_get_gb28181_device,
    test_get_proxy_stream_device
) 
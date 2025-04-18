import grpc
import logging
import json
from protos.generated import vision_service_pb2
from protos.generated import vision_service_pb2_grpc
from app.core.auth import create_access_token

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_camera_service():
    # 创建认证token
    token = create_access_token({"sub": "test_user"})
    metadata = [('authorization', token)]
    
    # 创建gRPC通道
    channel = grpc.insecure_channel('localhost:50051')
    stub = vision_service_pb2_grpc.CameraServiceStub(channel)


    
    try:
        # 测试添加摄像头
        logger.info("Testing AddCamera...")
        camera = vision_service_pb2.Camera(
            device_id="test_device_001",
            name="Test Camera",
            location="Test Location",
            tags=["test", "camera"],
            status=True,
            warning_level=1,
            frame_rate=1.0,
            running_period=json.dumps({"start": "00:00", "end": "23:59"}),
            electronic_fence=json.dumps({"points": [[0, 0], [1, 1]]}),
            skill_ids=[]
        )
        try:
            add_response = stub.AddCamera(
                vision_service_pb2.AddCameraRequest(camera=camera),
                metadata=metadata
            )
            logger.info(f"AddCamera response: {add_response}")
        except grpc.RpcError as e:
            logger.error(f"AddCamera failed: {e.code()}: {e.details()}")
            return
        
        # 测试获取摄像头列表
        logger.info("Testing ListCameras...")
        try:
            list_response = stub.ListCameras(
                vision_service_pb2.ListCamerasRequest(),
                metadata=metadata
            )
            logger.info(f"ListCameras total cameras: {list_response.total}")
            
            # 详细打印每个摄像头的关键信息
            for i, camera in enumerate(list_response.cameras):
                logger.info(f"Camera #{i+1}: device_id={camera.device_id}, name={camera.name}, status={camera.status}")
                
            if list_response.total == 0:
                logger.warning("No cameras returned in ListCameras response")
        except grpc.RpcError as e:
            logger.error(f"ListCameras failed: {e.code()}: {e.details()}")
        
        # 测试获取单个摄像头
        logger.info("Testing GetCamera...")
        try:
            get_response = stub.GetCamera(
                vision_service_pb2.GetCameraRequest(id=add_response.camera.id),
                metadata=metadata
            )
            logger.info(f"GetCamera response: {get_response}")
        except grpc.RpcError as e:
            logger.error(f"GetCamera failed: {e.code()}: {e.details()}")
        
        # 测试更新摄像头
        logger.info("Testing UpdateCamera...")
        camera.name = "Updated Test Camera"
        try:
            update_response = stub.UpdateCamera(
                vision_service_pb2.UpdateCameraRequest(
                    id=add_response.camera.id,
                    camera=camera
                ),
                metadata=metadata
            )
            logger.info(f"UpdateCamera response: {update_response}")
        except grpc.RpcError as e:
            logger.error(f"UpdateCamera failed: {e.code()}: {e.details()}")
        
        # 测试删除摄像头
        logger.info("Testing DeleteCamera...")
        try:
            delete_response = stub.DeleteCamera(
                vision_service_pb2.DeleteCameraRequest(id=add_response.camera.id),
                metadata=metadata
            )
            logger.info(f"DeleteCamera response: {delete_response}")
        except grpc.RpcError as e:
            logger.error(f"DeleteCamera failed: {e.code()}: {e.details()}")
        
    except grpc.RpcError as e:
        logger.error(f"RPC failed: {e.code()}: {e.details()}")
    except Exception as e:
        logger.error(f"Test failed: {str(e)}", exc_info=True)
    finally:
        channel.close()

if __name__ == '__main__':
    test_camera_service() 
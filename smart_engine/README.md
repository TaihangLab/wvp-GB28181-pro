# Smart Vision Engine

基于WVP的视觉AI平台后端服务，提供摄像头管理、技能管理和模型推理等功能。

## 功能特点

- 摄像头管理：支持从WVP同步设备，配置摄像头属性（位置、标签、预警等级等）
- 技能管理：支持创建和管理视觉AI技能，一个技能可以包含多个模型
- 模型管理：支持管理Triton推理服务器上的模型
- 模型推理：支持通过gRPC接口进行模型推理

## 技术栈

- Python 3.8+
- gRPC
- SQLAlchemy
- Triton Inference Server
- MySQL

## 安装

1. 克隆项目
```bash
git clone <repository-url>
cd smart_engine
```

2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 配置环境变量
创建`.env`文件，配置以下环境变量：
```
MYSQL_SERVER=192.168.1.107
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DB=smart_vision
MYSQL_PORT=3306
WVP_API_URL=http://192.168.1.107:18080
TRITON_SERVER_URL=192.168.1.111:8001
```

5. 初始化数据库
```bash
python -m app.db.init_db
```

## 运行

启动gRPC服务器：
```bash
python -m app.main
```

## API文档

### 认证服务

- `Login`: 用户登录，获取JWT token
- `Register`: 用户注册

### 摄像头服务

- `ListCameras`: 获取摄像头列表
- `GetCamera`: 获取摄像头详情
- `AddCamera`: 添加摄像头
- `UpdateCamera`: 更新摄像头
- `DeleteCamera`: 删除摄像头

### 技能服务

- `ListSkills`: 获取技能列表
- `GetSkill`: 获取技能详情
- `AddSkill`: 添加技能
- `UpdateSkill`: 更新技能
- `DeleteSkill`: 删除技能

### 模型服务

- `ListModels`: 获取模型列表
- `GetModel`: 获取模型详情
- `AddModel`: 添加模型
- `UpdateModel`: 更新模型
- `DeleteModel`: 删除模型
- `Infer`: 执行模型推理

## 开发

1. 生成gRPC代码
```bash
python -m grpc_tools.protoc -I./protos --python_out=./app --grpc_python_out=./app ./protos/vision_service.proto
```

2. 运行测试
```bash
python -m pytest
```

## 部署

1. 构建Docker镜像
```bash
docker build -t smart-vision-engine .
```

2. 运行容器
```bash
docker run -d -p 50051:50051 --env-file .env smart-vision-engine
```

## 许可证

MIT 
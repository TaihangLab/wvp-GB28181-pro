from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    location = Column(String(256))
    tags = Column(JSON)
    status = Column(Boolean, default=True)
    warning_level = Column(Integer, default=0)  # 预警等级
    frame_rate = Column(Float, default=1.0)  # 抽帧频率
    running_period = Column(JSON)  # 运行时段
    electronic_fence = Column(JSON)  # 电子围栏
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    camera_type = Column(String(32), default="gb28181")  # 摄像头类型: gb28181, proxy_stream, push_stream
    meta_data = Column(JSON)  # 存储摄像头额外的元数据信息，包含设备标识等信息

    # 关联技能
    skills = relationship("CameraSkill", back_populates="camera")

class CameraSkill(Base):
    __tablename__ = "camera_skills"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    camera = relationship("Camera", back_populates="skills")
    # 使用字符串引用避免循环导入
    skill = relationship("app.models.skill.Skill", back_populates="cameras") 
from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    description = Column(String(512))
    status = Column(Boolean, default=True)
    config = Column(JSON)  # 技能配置
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联模型
    models = relationship("SkillModel", back_populates="skill")
    # 关联摄像头
    cameras = relationship("app.models.camera.CameraSkill", back_populates="skill")

class SkillModel(Base):
    __tablename__ = "skill_models"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    model_id = Column(Integer, ForeignKey("models.id"))
    config = Column(JSON)  # 模型配置
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skill = relationship("Skill", back_populates="models")
    model = relationship("app.models.model.Model", back_populates="skills") 
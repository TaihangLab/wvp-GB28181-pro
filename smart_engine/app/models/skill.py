from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Skill(Base):
    """技能数据模型"""
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)  # 技能唯一标识符，英文名
    name_zh = Column(String(128))  # 技能中文名称
    description = Column(String(512))  # 技能描述
    type = Column(String(64), index=True)  # 技能类型
    status = Column(Boolean, default=True)  # 技能是否启用
    config = Column(JSON)  # 技能配置，包含具体参数
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联模型
    models = relationship("SkillModel", back_populates="skill")
    # 关联到AI任务 (一对多关系)
    tasks = relationship("AITask", back_populates="skill")

class SkillModel(Base):
    """技能与模型的关联表，建立多对多关系"""
    __tablename__ = "skill_models"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    model_id = Column(Integer, ForeignKey("models.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skill = relationship("Skill", back_populates="models")
    model = relationship("app.models.model.Model", back_populates="skills") 
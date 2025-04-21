# 导入所有模型，便于Alembic和SQLAlchemy一起使用
from app.db.base_class import Base
from app.models.camera import Camera
from app.models.skill import Skill, SkillModel
from app.models.model import Model 
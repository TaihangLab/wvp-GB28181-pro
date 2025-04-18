# 导入所有模型类
from app.models.camera import Camera, CameraSkill
from app.models.skill import Skill, SkillModel
from app.models.model import Model

# 为避免循环导入问题，这里显式地设置所有相关关系
# 可以在这里注册所有模型，以便在应用启动时能正确加载 
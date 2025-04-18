"""
技能注册服务 - 用于初始化和维护数据库中的技能记录
"""
import logging
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.models.skill import Skill, SkillModel
from app.models.model import Model
from app.skills.skill_factory import skill_factory, get_available_skill_configs
from app.skills.skill_base import BaseSkill
from app.services.redis_service import register_skill_model_relation

logger = logging.getLogger(__name__)

def get_skill_class_by_type(skill_type: str) -> Optional[type]:
    """
    根据技能类型获取技能实现类
    
    Args:
        skill_type: 技能类型标识符
        
    Returns:
        技能实现类或None（如果找不到）
    """
    return skill_factory.get_skill_class(skill_type)

def sync_skill_models(db: Session, skill: Skill, skill_instance: BaseSkill) -> None:
    """
    同步技能所需的模型关联
    
    Args:
        db: 数据库会话
        skill: 技能数据库对象
        skill_instance: 技能实例
    """
    # 获取技能类型 
    skill_type = skill.config.get("type")
    if not skill_type:
        logger.warning(f"技能 '{skill.name}' 缺少类型配置")
        return
    
    # 获取技能实例需要的模型
    required_models = []
    try:
        # 调用技能实例的方法获取所需模型
        if hasattr(skill_instance, 'get_required_models'):
            required_models = skill_instance.get_required_models()
        else:
            logger.warning(f"技能 '{skill.name}' 不支持获取所需模型")
            return
    except Exception as e:
        logger.error(f"获取技能 '{skill.name}' 所需模型时出错: {str(e)}")
        return
        
    if not required_models:
        logger.info(f"技能 '{skill.name}' 没有指定所需模型")
        return
        
    # 同步模型关联
    existing_models = {model.name: model for model in db.query(Model).filter(Model.name.in_(required_models)).all()}
    
    # 为技能关联模型
    for model_name in required_models:
        if model_name in existing_models:
            model = existing_models[model_name]
            # 检查是否已经关联
            skill_model = db.query(SkillModel).filter_by(skill_id=skill.id, model_id=model.id).first()
            if not skill_model:
                logger.info(f"为技能 '{skill.name}' 关联模型 '{model_name}'")
                skill_model = SkillModel(skill_id=skill.id, model_id=model.id)
                db.add(skill_model)
        else:
            logger.warning(f"技能 '{skill.name}' 需要的模型 '{model_name}' 不存在")
    
    db.commit()
    
    # 同步到Redis
    register_skill_model_relation(str(skill.id), required_models)
    logger.info(f"技能 '{skill.name}' 的模型关系已同步到Redis")

def sync_configured_skills_to_database():
    """
    确保所有配置的技能都同步到数据库中
    
    此函数扫描所有已注册技能配置，确保它们在数据库中有相应的记录
    如果技能不存在，将创建它；如果配置已更改，将更新它。
    """
    # 获取可用技能配置
    skill_configs = get_available_skill_configs()
    
    logger.info(f"发现 {len(skill_configs)} 个技能配置")
    
    with SessionLocal() as db:
        # 获取当前数据库中的所有技能
        existing_skills = {
            skill.name: skill for skill in db.query(Skill).all()
        }
        
        # 同步或创建每个技能
        for config in skill_configs:
            # 获取技能类型
            skill_type = config.get("type")
            if not skill_type:
                logger.warning(f"技能配置缺少类型: {config}")
                continue
                
            skill_class = get_skill_class_by_type(skill_type)
            
            if not skill_class:
                logger.warning(f"找不到技能类型 '{skill_type}' 的实现，跳过")
                continue
                
            # 获取技能名称，如果没有则使用技能类型
            skill_name = config.get("name", skill_type) 
                
            # 尝试实例化技能验证配置
            try:
                skill_instance = skill_class(config)
                
                # 生成数据库配置
                skill_config = {
                    "type": skill_type,
                    "parameters": config.get("parameters", config.get("params", {}))
                }
                
                # 检查技能是否存在
                if skill_name in existing_skills:
                    # 更新配置（如果需要）
                    skill = existing_skills[skill_name]
                    if skill.config != skill_config:
                        logger.info(f"更新技能配置 '{skill_name}'")
                        skill.config = skill_config
                        db.commit()
                else:
                    # 创建新技能
                    logger.info(f"创建新技能 '{skill_name}'")
                    skill = Skill(
                        name=skill_name,
                        description=config.get("description", ""),
                        config=skill_config,
                        status=True
                    )
                    db.add(skill)
                    db.commit()
                    db.refresh(skill)
                    existing_skills[skill_name] = skill
                
                # 同步技能所需的模型
                sync_skill_models(db, skill, skill_instance)
                
            except Exception as e:
                logger.error(f"无法实例化技能 '{skill_name}': {str(e)}")
                continue
            
        # 标记数据库中存在但配置中不存在的技能
        config_skill_names = {config.get("name", config.get("type")) for config in skill_configs}
        for skill_name, skill in existing_skills.items():
            if skill_name not in config_skill_names:
                logger.info(f"标记不存在的技能 '{skill_name}' 为不可用")
                skill.status = False
                db.commit()

def get_skill_by_id(db: Session, skill_id: int) -> Optional[Skill]:
    """
    通过ID获取技能
    
    Args:
        db: 数据库会话
        skill_id: 技能ID
        
    Returns:
        技能对象或None
    """
    return db.query(Skill).filter(Skill.id == skill_id).first()

def get_skill_by_name(db: Session, name: str) -> Optional[Skill]:
    """
    通过名称获取技能
    
    Args:
        db: 数据库会话
        name: 技能名称
        
    Returns:
        技能对象或None
    """
    return db.query(Skill).filter(Skill.name == name).first()

def get_skills(db: Session) -> List[Skill]:
    """
    获取所有技能
    
    Args:
        db: 数据库会话
        
    Returns:
        技能列表
    """
    return db.query(Skill).all()

def create_skill(db: Session, 
                name: str, 
                description: str, 
                config: Dict[str, Any],
                status: bool = True) -> Skill:
    """
    创建新技能
    
    Args:
        db: 数据库会话
        name: 技能名称
        description: 技能描述
        config: 技能配置
        status: 技能状态，默认启用
        
    Returns:
        新创建的技能对象
    """
    skill = Skill(
        name=name,
        description=description,
        config=config,
        status=status
    )
    
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

def update_skill(db: Session, 
                skill_id: int,
                name: Optional[str] = None,
                description: Optional[str] = None,
                config: Optional[Dict[str, Any]] = None,
                status: Optional[bool] = None) -> Optional[Skill]:
    """
    更新技能
    
    Args:
        db: 数据库会话
        skill_id: 技能ID
        name: 新的技能名称（可选）
        description: 新的技能描述（可选）
        config: 新的技能配置（可选）
        status: 新的技能状态（可选）
        
    Returns:
        更新后的技能对象或None（如果技能不存在）
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return None
    
    if name is not None:
        skill.name = name
    if description is not None:
        skill.description = description
    if config is not None:
        skill.config = config
    if status is not None:
        skill.status = status
    
    db.commit()
    db.refresh(skill)
    
    return skill

def delete_skill(db: Session, skill_id: int) -> bool:
    """
    删除技能
    
    Args:
        db: 数据库会话
        skill_id: 技能ID
        
    Returns:
        是否成功删除
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return False
    
    db.delete(skill)
    db.commit()
    
    return True

def get_skill_implementations(skill_id: int) -> List[Dict[str, Any]]:
    """
    获取技能的所有实现
    
    Args:
        skill_id: 技能ID
        
    Returns:
        技能实现列表
    """
    db = next(get_db())
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        logger.warning(f"获取技能实现时找不到技能ID: {skill_id}")
        return []
    
    # 获取技能类型
    skill_type = skill.config.get("type")
    if not skill_type:
        logger.warning(f"技能 {skill.name} 缺少类型配置")
        return []
    
    # 获取技能类
    skill_class = get_skill_class_by_type(skill_type)
    if not skill_class:
        logger.warning(f"找不到技能类型 {skill_type} 的实现")
        return []
    
    implementations = []
    
    # 添加默认实现
    default_impl = {
        "name": skill.name,
        "type": skill_type,
        "class": skill_class.__name__,
        "config": skill.config
    }
    implementations.append(default_impl)
    
    # 获取自定义实现
    # TODO: 添加获取自定义实现的逻辑
    
    return implementations 
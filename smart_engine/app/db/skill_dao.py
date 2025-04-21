"""
技能数据访问对象(DAO)模块，负责技能相关的数据库操作
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.skill import Skill, SkillModel
import logging

logger = logging.getLogger(__name__)

class SkillDAO:
    """技能数据访问对象，提供技能相关的数据库操作"""
    
    @staticmethod
    def get_all_skills(db: Session) -> List[Skill]:
        """
        获取所有技能
        
        Args:
            db: 数据库会话
            
        Returns:
            List[Skill]: 技能列表
        """
        return db.query(Skill).all()
    
    @staticmethod
    def get_skill_by_id(skill_id: int, db: Session) -> Optional[Skill]:
        """
        根据ID获取技能
        
        Args:
            skill_id: 技能ID
            db: 数据库会话
            
        Returns:
            Optional[Skill]: 技能对象，如果不存在则返回None
        """
        return db.query(Skill).filter(Skill.id == skill_id).first()
    
    @staticmethod
    def get_skill_by_name(name: str, db: Session) -> Optional[Skill]:
        """
        根据名称获取技能
        
        Args:
            name: 技能名称
            db: 数据库会话
            
        Returns:
            Optional[Skill]: 技能对象，如果不存在则返回None
        """
        return db.query(Skill).filter(Skill.name == name).first()
    
    @staticmethod
    def get_skills_by_type(skill_type: str, db: Session) -> List[Skill]:
        """
        根据类型获取技能列表
        
        Args:
            skill_type: 技能类型
            db: 数据库会话
            
        Returns:
            List[Skill]: 技能列表
        """
        return db.query(Skill).filter(Skill.type == skill_type).all()
    
    @staticmethod
    def create_skill(skill_data: Dict[str, Any], db: Session) -> Optional[Skill]:
        """
        创建新技能
        
        Args:
            skill_data: 技能数据
            db: 数据库会话
            
        Returns:
            Optional[Skill]: 新创建的技能对象，如果创建失败则返回None
        """
        try:
            # 检查是否已存在相同名称的技能
            if SkillDAO.get_skill_by_name(skill_data.get('name'), db):
                return None
            
            # 创建新技能
            new_skill = Skill(
                name=skill_data.get('name'),
                name_zh=skill_data.get('name_zh', ''),
                type=skill_data.get('type'),
                description=skill_data.get('description', ''),
                config=skill_data.get('config', {}),
                status=skill_data.get('status', True)
            )
            
            db.add(new_skill)
            db.commit()
            db.refresh(new_skill)
            
            # 处理模型关联（如果有）
            model_ids = skill_data.get('model_ids', [])
            if model_ids:
                for model_id in model_ids:
                    skill_model = SkillModel(
                        skill_id=new_skill.id,
                        model_id=int(model_id)
                    )
                    db.add(skill_model)
                db.commit()
            
            return new_skill
        except Exception as e:
            db.rollback()
            logger.error(f"创建技能失败: {str(e)}", exc_info=True)
            return None
    
    @staticmethod
    def update_skill(skill_id: int, skill_data: Dict[str, Any], db: Session) -> Optional[Skill]:
        """
        更新技能信息
        
        Args:
            skill_id: 技能ID
            skill_data: 新的技能数据
            db: 数据库会话
            
        Returns:
            Optional[Skill]: 更新后的技能对象，如果更新失败则返回None
        """
        try:
            skill = SkillDAO.get_skill_by_id(skill_id, db)
            if not skill:
                return None
            
            # 如果更新名称，检查新名称是否已存在
            if 'name' in skill_data and skill_data['name'] != skill.name:
                existing_skill = SkillDAO.get_skill_by_name(skill_data['name'], db)
                if existing_skill:
                    return None
            
            # 更新技能基本信息
            if 'name' in skill_data:
                skill.name = skill_data['name']
            if 'name_zh' in skill_data:
                skill.name_zh = skill_data['name_zh']
            if 'type' in skill_data:
                skill.type = skill_data['type']
            if 'description' in skill_data:
                skill.description = skill_data['description']
            if 'config' in skill_data:
                skill.config = skill_data['config']
            if 'status' in skill_data:
                skill.status = skill_data['status']
            
            # 更新模型关联（如果提供）
            if 'model_ids' in skill_data:
                # 删除现有关联
                db.query(SkillModel).filter(SkillModel.skill_id == skill.id).delete()
                
                # 创建新关联
                for model_id in skill_data['model_ids']:
                    skill_model = SkillModel(
                        skill_id=skill.id,
                        model_id=int(model_id)
                    )
                    db.add(skill_model)
            
            db.commit()
            db.refresh(skill)
            
            return skill
        except Exception as e:
            db.rollback()
            logger.error(f"更新技能失败: {str(e)}", exc_info=True)
            return None
    
    @staticmethod
    def delete_skill(skill_id: int, db: Session) -> bool:
        """
        删除技能
        
        Args:
            skill_id: 技能ID
            db: 数据库会话
            
        Returns:
            bool: 是否成功删除
        """
        try:
            skill = SkillDAO.get_skill_by_id(skill_id, db)
            if not skill:
                return False
            
            # 删除模型关联
            db.query(SkillModel).filter(SkillModel.skill_id == skill.id).delete()
            
            # 删除技能
            db.delete(skill)
            db.commit()
            
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"删除技能失败: {str(e)}", exc_info=True)
            return False 
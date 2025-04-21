"""
技能服务模块，负责技能相关的业务逻辑
"""
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.db.skill_dao import SkillDAO
from app.models.skill import Skill
from app.skills.skill_factory import create_skill_instance
from app.services.redis_service import register_skill_model_relation
import logging

logger = logging.getLogger(__name__)

class SkillService:
    """技能服务类，提供技能相关的业务逻辑处理"""
    
    @staticmethod
    def get_all_skills(db: Session) -> Dict[str, Any]:
        """
        获取所有技能
        
        Args:
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 技能列表及总数
        """
        logger.info("获取所有技能")
        db_skills = SkillDAO.get_all_skills(db)
        
        # 构建响应数据
        skills = []
        for db_skill in db_skills:
            # 获取关联的模型
            model_ids = [str(model.id) for model in db_skill.models]
            
            skill_data = {
                "id": db_skill.id,
                "name": db_skill.name,
                "name_zh": db_skill.name_zh,
                "type": db_skill.type,
                "description": db_skill.description,
                "config": db_skill.config,
                "status": db_skill.status,
                "created_at": db_skill.created_at.isoformat() if db_skill.created_at else None,
                "updated_at": db_skill.updated_at.isoformat() if db_skill.updated_at else None,
                "model_ids": model_ids
            }
            skills.append(skill_data)
        
        return {"skills": skills, "total": len(skills)}
    
    @staticmethod
    def get_skill_by_id(skill_id: int, db: Session) -> Dict[str, Any]:
        """
        获取指定技能的详细信息
        
        Args:
            skill_id: 技能ID
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 技能详细信息
        """
        logger.info(f"获取技能: id={skill_id}")
        skill = SkillDAO.get_skill_by_id(skill_id, db)
        if not skill:
            return None
        
        # 获取关联的模型
        model_ids = [str(model.id) for model in skill.models]
        
        skill_data = {
            "id": skill.id,
            "name": skill.name,
            "name_zh": skill.name_zh,
            "type": skill.type,
            "description": skill.description,
            "config": skill.config,
            "status": skill.status,
            "created_at": skill.created_at.isoformat() if skill.created_at else None,
            "updated_at": skill.updated_at.isoformat() if skill.updated_at else None,
            "model_ids": model_ids
        }
        
        return skill_data
    
    @staticmethod
    def create_skill(skill_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        创建新技能
        
        Args:
            skill_data: 技能数据
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 新创建的技能信息
        """
        logger.info(f"创建技能: name={skill_data.get('name')}, type={skill_data.get('type')}")
        
        # 验证技能类型是否已存在于数据库中
        skill_type = skill_data.get('type')
        available_types = SkillService.get_skill_types_from_db(db)
        if skill_type not in [t["type"] for t in available_types]:
            logger.error(f"无效的技能类型: {skill_type}, 可用类型: {[t['type'] for t in available_types]}")
            return None
        
        # 使用DAO创建技能
        new_skill = SkillDAO.create_skill(skill_data, db)
        if not new_skill:
            return None
        
        # 注册技能与模型的关系到Redis（如果有模型关联）
        model_ids = skill_data.get('model_ids', [])
        if model_ids:
            register_skill_model_relation(str(new_skill.id), model_ids)
        
        # 构建响应数据
        skill_data = {
            "id": new_skill.id,
            "name": new_skill.name,
            "name_zh": new_skill.name_zh,
            "type": new_skill.type,
            "description": new_skill.description,
            "config": new_skill.config,
            "status": new_skill.status,
            "created_at": new_skill.created_at.isoformat() if new_skill.created_at else None,
            "updated_at": new_skill.updated_at.isoformat() if new_skill.updated_at else None,
            "model_ids": model_ids
        }
        
        return skill_data
    
    @staticmethod
    def update_skill(skill_id: int, skill_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        更新技能信息
        
        Args:
            skill_id: 技能ID
            skill_data: 新的技能数据
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 更新后的技能信息
        """
        logger.info(f"更新技能: id={skill_id}")
        
        # 如果更新技能类型，验证新类型是否有效
        if 'type' in skill_data:
            skill_type = skill_data.get('type')
            available_types = SkillService.get_skill_types_from_db(db)
            if skill_type not in [t["type"] for t in available_types]:
                logger.error(f"无效的技能类型: {skill_type}, 可用类型: {[t['type'] for t in available_types]}")
                return None
        
        # 使用DAO更新技能
        updated_skill = SkillDAO.update_skill(skill_id, skill_data, db)
        if not updated_skill:
            return None
        
        # 更新技能与模型的关系到Redis（如果有模型关联）
        if 'model_ids' in skill_data:
            register_skill_model_relation(str(updated_skill.id), skill_data['model_ids'])
        
        # 获取关联的模型
        model_ids = [str(model.id) for model in updated_skill.models]
        
        # 构建响应数据
        skill_data = {
            "id": updated_skill.id,
            "name": updated_skill.name,
            "name_zh": updated_skill.name_zh,
            "type": updated_skill.type,
            "description": updated_skill.description,
            "config": updated_skill.config,
            "status": updated_skill.status,
            "created_at": updated_skill.created_at.isoformat() if updated_skill.created_at else None,
            "updated_at": updated_skill.updated_at.isoformat() if updated_skill.updated_at else None,
            "model_ids": model_ids
        }
        
        return skill_data
    
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
        logger.info(f"删除技能: id={skill_id}")
        return SkillDAO.delete_skill(skill_id, db)
    
    @staticmethod
    def get_skill_types_from_db(db: Session) -> List[Dict[str, Any]]:
        """
        从数据库获取所有已定义的技能类型
        
        Args:
            db: 数据库会话
            
        Returns:
            List[Dict[str, Any]]: 技能类型列表
        """
        # 从数据库中获取所有不同的技能类型
        result = db.query(Skill.type).distinct().all()
        types = [r[0] for r in result if r[0]]  # 过滤掉None值
        
        # 构建类型描述列表
        type_descriptions = []
        for skill_type in types:
            # 查找使用该类型的第一个技能作为示例，获取其描述
            sample_skill = db.query(Skill).filter(Skill.type == skill_type).first()
            description = sample_skill.description if sample_skill else f"{skill_type} 技能类型"
            
            type_descriptions.append({
                "type": skill_type,
                "description": description
            })
        
        return type_descriptions
    
    @staticmethod
    def get_skill_types(db: Session) -> List[Dict[str, Any]]:
        """
        获取所有可用的技能类型
        
        Args:
            db: 数据库会话
            
        Returns:
            List[Dict[str, Any]]: 技能类型列表，包含类型名称和描述
        """
        return SkillService.get_skill_types_from_db(db)
    
    @staticmethod
    def test_skill(skill_id: int, test_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        测试技能执行
        
        Args:
            skill_id: 技能ID
            test_data: 测试数据
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 测试结果
        """
        logger.info(f"测试技能: id={skill_id}")
        
        # 获取技能数据
        skill = SkillDAO.get_skill_by_id(skill_id, db)
        if not skill:
            return {"success": False, "message": "技能不存在"}
        
        # 检查技能是否启用
        if not skill.status:
            return {"success": False, "message": "技能已禁用"}
        
        try:
            # 创建技能实例
            skill_instance = create_skill_instance(skill.type, skill.config)
            if not skill_instance:
                return {"success": False, "message": f"无法创建技能实例，类型: {skill.type}"}
            
            # 使用技能处理测试数据
            result = skill_instance.process(test_data)
            
            return {
                "success": True,
                "result": result,
                "skill_id": skill_id,
                "skill_name": skill.name,
                "skill_type": skill.type
            }
        except Exception as e:
            logger.error(f"测试技能失败: {str(e)}", exc_info=True)
            return {"success": False, "message": f"测试失败: {str(e)}"}
    
    @staticmethod
    def enable_skill(skill_id: int, db: Session) -> Dict[str, Any]:
        """
        启用技能
        
        Args:
            skill_id: 技能ID
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 操作结果
        """
        logger.info(f"启用技能: id={skill_id}")
        
        # 获取技能数据
        skill = SkillDAO.get_skill_by_id(skill_id, db)
        if not skill:
            return {"success": False, "message": "技能不存在"}
        
        # 如果技能已经启用，直接返回成功
        if skill.status:
            return {"success": True, "message": "技能已经是启用状态"}
        
        # 更新技能状态
        update_result = SkillDAO.update_skill(skill_id, {"status": True}, db)
        if not update_result:
            return {"success": False, "message": "启用技能失败"}
        
        return {"success": True, "message": "技能已启用"}
    
    @staticmethod
    def disable_skill(skill_id: int, db: Session) -> Dict[str, Any]:
        """
        禁用技能
        
        Args:
            skill_id: 技能ID
            db: 数据库会话
            
        Returns:
            Dict[str, Any]: 操作结果
        """
        logger.info(f"禁用技能: id={skill_id}")
        
        # 获取技能数据
        skill = SkillDAO.get_skill_by_id(skill_id, db)
        if not skill:
            return {"success": False, "message": "技能不存在"}
        
        # 如果技能已经禁用，直接返回成功
        if not skill.status:
            return {"success": True, "message": "技能已经是禁用状态"}
        
        # 更新技能状态
        update_result = SkillDAO.update_skill(skill_id, {"status": False}, db)
        if not update_result:
            return {"success": False, "message": "禁用技能失败"}
        
        return {"success": True, "message": "技能已禁用"} 
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
技能扫描模块，用于自动扫描系统中的技能并更新到数据库
"""

import logging
import os
import sys
import inspect
import importlib
import re
from typing import List, Dict, Any, Optional, Type
from sqlalchemy.orm import Session
import traceback

from app.db.skill_dao import SkillDAO
from app.skills.skill_base import BaseSkill

logger = logging.getLogger(__name__)

def scan_skill_classes() -> Dict[str, Any]:
    """
    扫描项目中所有继承自BaseSkill的技能类
    
    Returns:
        Dict[str, Any]: 包含技能类列表和技能类型统计的字典
    """
    logger.info("开始扫描技能类...")
    
    skills_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "skills")
    logger.info(f"扫描技能目录: {skills_dir}")
    
    skill_classes = {}
    skill_types = set()
    
    # 遍历技能目录
    try:
        for filename in os.listdir(skills_dir):
            if filename.endswith(".py") and not filename.startswith("__") and not filename in ["skill_base.py", "skill_factory.py"]:
                module_name = filename[:-3]  # 去掉.py后缀
                try:
                    # 导入模块
                    module_path = f"app.skills.{module_name}"
                    module = importlib.import_module(module_path)
                    
                    # 查找模块中的技能类
                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)
                        if (isinstance(attr, type) and 
                            issubclass(attr, BaseSkill) and 
                            attr != BaseSkill):
                            
                            # 创建临时实例以获取配置
                            try:
                                temp_instance = attr({})
                                config = temp_instance.config
                                
                                # 获取技能名称和类型
                                skill_name = config.get("name", "")
                                skill_type = config.get("type", "")
                                
                                if skill_name:
                                    skill_classes[skill_name] = attr
                                    if skill_type:
                                        skill_types.add(skill_type)
                                    
                                    logger.info(f"发现技能类: {attr.__name__}, 名称: {skill_name}, 类型: {skill_type}")
                            except Exception as e:
                                logger.warning(f"初始化技能类 {attr.__name__} 失败: {str(e)}")
                            
                except (ImportError, AttributeError) as e:
                    logger.warning(f"导入技能模块 {module_name} 失败: {str(e)}")
                    
        logger.info(f"技能扫描完成，共发现 {len(skill_classes)} 个技能类，{len(skill_types)} 种技能类型")
        return {
            "skill_classes": skill_classes,
            "skill_types": list(skill_types),
            "count": len(skill_classes)
        }
    except Exception as e:
        logger.error(f"扫描技能类失败: {str(e)}", exc_info=True)
        return {
            "skill_classes": {},
            "skill_types": [],
            "count": 0
        }

def sync_skill_classes_to_database(db: Session) -> Dict[str, Any]:
    """
    扫描所有技能类并同步到数据库
    
    Args:
        db: 数据库会话
        
    Returns:
        Dict[str, Any]: 同步结果
    """
    logger.info("开始同步技能类到数据库...")
    
    # 扫描技能类
    scan_result = scan_skill_classes()
    skill_classes = scan_result["skill_classes"]
    
    if not skill_classes:
        logger.warning("未发现任何技能类，同步操作取消")
        return {
            "success": False,
            "message": "未发现任何技能类",
            "created": [],
            "updated": [],
            "count": 0
        }
    
    created_skills = []
    updated_skills = []
    
    # 获取数据库中所有技能
    existing_skills = {skill.name: skill for skill in SkillDAO.get_all_skills(db)}
    
    # 遍历技能类并同步到数据库
    for skill_name, skill_class in skill_classes.items():
        # 创建临时实例以获取完整配置
        temp_instance = skill_class({})
        config = temp_instance.config
        
        if skill_name in existing_skills:
            # 使用新方法更新已有技能
            existing_skill = existing_skills[skill_name]
            updated_skill = update_existing_skill(db, skill_class, existing_skill, config)
            
            updated_skills.append({
                "id": updated_skill.id,
                "name": updated_skill.name,
                "name_zh": updated_skill.name_zh,
                "type": updated_skill.type,
                "status": "已更新"
            })
        else:
            # 尝试从文档中提取中文名称
            doc_str = skill_class.__doc__ or ""
            name_zh_match = re.search(r"中文名称[：:]\s*(.+?)(?:\n|$)", doc_str)
            name_zh = ""
            if name_zh_match:
                name_zh = name_zh_match.group(1).strip()
            else:
                # 如果没有明确标记的中文名称，尝试使用第一行作为中文名称
                first_line = doc_str.split('\n')[0].strip() if doc_str else ""
                if any('\u4e00' <= c <= '\u9fff' for c in first_line):  # 包含中文字符
                    name_zh = first_line.split("技能")[0].strip() if "技能" in first_line else first_line
                else:
                    name_zh = skill_name.replace("_", " ").title()
            
            # 创建新技能
            skill_data = {
                "name": skill_name,
                "name_zh": name_zh,
                "type": config.get("type", ""),
                "description": skill_class.__doc__ or f"{skill_name} 技能",
                "config": config,
                "status": True
            }
            
            new_skill = SkillDAO.create_skill(skill_data, db)
            if new_skill:
                logger.info(f"已创建新技能: {skill_name}")
                created_skills.append({
                    "id": new_skill.id,
                    "name": new_skill.name,
                    "name_zh": new_skill.name_zh,
                    "type": new_skill.type,
                    "status": "已创建"
                })
    
    total_count = len(created_skills) + len(updated_skills)
    logger.info(f"技能同步完成, 创建了 {len(created_skills)} 个新技能, 更新了 {len(updated_skills)} 个已有技能")
    
    return {
        "success": True,
        "message": f"成功同步 {total_count} 个技能到数据库",
        "created": created_skills,
        "updated": updated_skills,
        "count": total_count
    }

def update_existing_skill(
    db: Session, 
    skill_class: Type, 
    existing_skill: 'Skill', 
    config: Dict[str, Any] = None
) -> 'Skill':
    """
    更新现有技能的信息
    
    Args:
        db: 数据库会话
        skill_class: 技能类
        existing_skill: 现有技能记录
        config: 技能配置信息，如果提供则使用它，否则创建临时实例获取
        
    Returns:
        Skill: 更新后的技能
    """
    try:
        # 获取配置信息
        if config is None:
            # 如果没有提供配置，则创建临时实例获取
            temp_instance = skill_class({})
            config = temp_instance.config
            
        # 合并配置，保留用户可能已经修改的参数
        if existing_skill.config:
            merged_config = existing_skill.config.copy()
            # 更新配置中的必要项
            required_keys = ["name", "type", "required_models"]
            for key in required_keys:
                if key in config:
                    merged_config[key] = config[key]
            
            # 确保params存在
            if "params" not in merged_config:
                merged_config["params"] = {}
            if "params" in config:
                # 合并params，保留用户可能修改的参数
                for key, value in config["params"].items():
                    if key not in merged_config["params"]:
                        merged_config["params"][key] = value
        else:
            merged_config = config
            
        # 获取描述信息
        description = config.get("description", "")
        if not description and skill_class.__doc__:
            description = skill_class.__doc__.strip()
            
        # 获取中文名称
        name_zh = config.get("name_zh", "")
        if not name_zh:
            doc_str = skill_class.__doc__ or ""
            name_zh_match = re.search(r"中文名称[：:]\s*(.+?)(?:\n|$)", doc_str)
            if name_zh_match:
                name_zh = name_zh_match.group(1).strip()
            elif "name_zh" in config:
                name_zh = config["name_zh"]
                
        # 更新技能信息
        update_data = {
            "config": merged_config,
            "description": description
        }
        
        # 如果类型在配置中存在且与现有不同，则更新
        if "type" in config and config["type"] != existing_skill.type:
            update_data["type"] = config["type"]
            
        # 如果中文名称有值且与现有不同，则更新
        if name_zh and name_zh != existing_skill.name_zh:
            update_data["name_zh"] = name_zh
            
        # 更新技能
        updated_skill = SkillDAO.update_skill(existing_skill.id, update_data, db)
        
        logger.info(f"已更新技能: {existing_skill.name}")
        return updated_skill
    except Exception as e:
        logger.error(f"更新技能时出错: {e}")
        db.rollback()
        return existing_skill

def create_or_update_skill(db: Session, skill_class: Type) -> Optional[Dict[str, Any]]:
    """
    创建或更新技能记录
    
    Args:
        db: 数据库会话
        skill_class: 技能类
        
    Returns:
        Optional[Dict[str, Any]]: 操作结果
    """
    try:
        # 创建临时实例以获取完整配置
        temp_instance = skill_class({})
        config = temp_instance.config
        
        # 获取技能名称和类型
        skill_name = config.get("name", "")
        skill_type = config.get("type", "")
        
        # 获取技能描述
        description = skill_class.__doc__ or f"{skill_name} 技能"
        
        # 尝试从文档中提取中文名称
        name_zh = ""
        if skill_class.__doc__:
            doc_str = skill_class.__doc__
            name_zh_match = re.search(r"中文名称[：:]\s*(.+?)(?:\n|$)", doc_str)
            
            if name_zh_match:
                name_zh = name_zh_match.group(1).strip()
            else:
                # 如果没有明确标记的中文名称，尝试使用第一行作为中文名称
                first_line = doc_str.split('\n')[0].strip()
                if any('\u4e00' <= c <= '\u9fff' for c in first_line):  # 包含中文字符
                    name_zh = first_line.split("技能")[0].strip() if "技能" in first_line else first_line
                else:
                    name_zh = skill_name.replace("_", " ").title()
        else:
            name_zh = skill_name.replace("_", " ").title()
        
        # 检查技能是否存在
        existing_skill = SkillDAO.get_skill_by_name(skill_name, db)
        
        if existing_skill:
            # 更新现有技能
            updated_skill = update_existing_skill(db, skill_class, existing_skill, config)
            
            return {
                "id": updated_skill.id,
                "name": updated_skill.name,
                "type": updated_skill.type,
                "status": "已更新"
            }
        else:
            # 创建新技能
            skill_data = {
                "name": skill_name,
                "name_zh": name_zh,
                "type": skill_type,
                "description": description,
                "config": config,
                "status": True
            }
            
            new_skill = SkillDAO.create_skill(skill_data, db)
            if new_skill:
                logger.info(f"已创建新技能: {skill_name}")
                return {
                    "id": new_skill.id,
                    "name": new_skill.name,
                    "type": new_skill.type,
                    "status": "已创建"
                }
            
            return None
    except Exception as e:
        logger.error(f"创建或更新技能时出错: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # 直接运行时的测试代码
    logging.basicConfig(level=logging.INFO)
    
    from app.db.session import get_db
    db = next(get_db())
    
    result = sync_skill_classes_to_database(db)
    print(f"同步结果: {result}") 
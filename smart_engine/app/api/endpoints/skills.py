"""
技能API端点模块，提供技能相关的REST API
"""
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Response, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.skill import Skill as SkillModel
from app.models.model import Model
from app.services.triton_client import triton_client
from app.skills.skill_factory import skill_factory, register_available_skill_classes
from app.services.skill_registry import sync_configured_skills_to_database
from app.skills.skill_manager import skill_manager
from app.services.redis_service import (
    get_skill_models,
    register_skill_model_relation,
    unregister_skill
)
from app.services.skill_service import SkillService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/list", response_model=Dict[str, Any])
def list_skills(db: Session = Depends(get_db)):
    """
    获取所有技能列表
    
    Returns:
        Dict[str, Any]: 技能列表及总数
    """
    try:
        # 调用服务层获取技能列表
        return SkillService.get_all_skills(db)
    except Exception as e:
        logger.error(f"获取技能列表失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{skill_id}", response_model=Dict[str, Any])
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    """
    获取指定技能的详细信息
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict[str, Any]: 技能详细信息
    """
    try:
        # 调用服务层获取技能详情
        skill_data = SkillService.get_skill_by_id(skill_id, db)
        
        if not skill_data:
            logger.warning(f"未找到技能: {skill_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        return {"skill": skill_data}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取技能详情失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("", response_model=Dict[str, Any])
def add_skill(skill_data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    添加新技能
    
    Args:
        skill_data: 技能数据
        
    Returns:
        Dict[str, Any]: 新添加的技能信息
    """
    try:
        # 调用服务层创建技能
        result = SkillService.create_skill(skill_data, db)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"技能已存在或类型无效: {skill_data.get('name')}"
            )
        
        return {"skill": result, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"添加技能失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/{skill_id}", response_model=Dict[str, Any])
def update_skill(skill_id: int, skill_data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    更新指定技能信息
    
    Args:
        skill_id: 技能ID
        skill_data: 新的技能数据
        
    Returns:
        Dict[str, Any]: 更新后的技能信息
    """
    try:
        # 调用服务层更新技能
        result = SkillService.update_skill(skill_id, skill_data, db)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found or update failed"
            )
        
        return {"skill": result, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新技能失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{skill_id}", response_model=Dict[str, Any])
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    """
    删除指定技能
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict[str, Any]: 操作结果
    """
    try:
        # 调用服务层删除技能
        result = SkillService.delete_skill(skill_id, db)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        return {"success": True, "message": f"Successfully deleted skill {skill_id}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除技能失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/types", response_model=Dict[str, Any])
def get_skill_types():
    """
    获取所有可用的技能类型
    
    Returns:
        Dict[str, Any]: 技能类型列表
    """
    try:
        # 调用服务层获取技能类型
        skill_types = SkillService.get_skill_types()
        return {"skill_types": skill_types, "total": len(skill_types)}
    except Exception as e:
        logger.error(f"获取技能类型失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{skill_id}/test", response_model=Dict[str, Any])
def test_skill(skill_id: int, test_data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    测试技能执行
    
    Args:
        skill_id: 技能ID
        test_data: 测试数据
        
    Returns:
        Dict[str, Any]: 测试结果
    """
    try:
        # 调用服务层测试技能
        result = SkillService.test_skill(skill_id, test_data, db)
        return result
    except Exception as e:
        logger.error(f"测试技能失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{skill_id}/enable", response_model=Dict[str, Any])
def enable_skill(skill_id: int, db: Session = Depends(get_db)):
    """
    启用技能
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict[str, Any]: 操作结果
    """
    try:
        # 调用服务层启用技能
        result = SkillService.enable_skill(skill_id, db)
        return result
    except Exception as e:
        logger.error(f"启用技能失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{skill_id}/disable", response_model=Dict[str, Any])
def disable_skill(skill_id: int, db: Session = Depends(get_db)):
    """
    禁用技能
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict[str, Any]: 操作结果
    """
    try:
        # 调用服务层禁用技能
        result = SkillService.disable_skill(skill_id, db)
        return result
    except Exception as e:
        logger.error(f"禁用技能失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{skill_id}/load-models", response_model=Dict[str, Any])
def load_skill_models(skill_id: int, db: Session = Depends(get_db)):
    """
    加载指定技能所需的所有模型
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict: 加载结果
    """
    # 从数据库获取技能
    db_skill = db.query(SkillModel).filter(SkillModel.id == skill_id).first()
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"技能 ID {skill_id} 不存在"
        )
    
    # 构建内存中技能实例
    skill_config = db_skill.config or {}
    skill_type = skill_config.get("type")
    if not skill_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"技能配置缺少类型字段"
        )
    
    # 获取技能类
    skill_class = skill_factory.get_skill_class(skill_type)
    if not skill_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"技能类型 {skill_type} 未注册"
        )
    
    # 创建内存中技能实例
    memory_skill = skill_class(skill_config)
    memory_skill.skill_id = str(skill_id)
    
    # 加载模型
    result = skill_manager.load_skill_models(memory_skill.skill_id)
    
    return {
        "skill_id": skill_id,
        "skill_name": db_skill.name,
        "models": result
    }

@router.post("/{skill_id}/unload-models", response_model=Dict[str, Any])
def unload_skill_models(skill_id: int, db: Session = Depends(get_db)):
    """
    卸载指定技能所需的模型，但会检查其他技能是否也需要这些模型
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict: 卸载结果
    """
    # 从数据库获取技能
    db_skill = db.query(SkillModel).filter(SkillModel.id == skill_id).first()
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"技能 ID {skill_id} 不存在"
        )
    
    # 构建内存中技能实例
    skill_config = db_skill.config or {}
    skill_type = skill_config.get("type")
    if not skill_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"技能配置缺少类型字段"
        )
    
    # 获取技能类
    skill_class = skill_factory.get_skill_class(skill_type)
    if not skill_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"技能类型 {skill_type} 未注册"
        )
    
    # 创建临时技能实例，仅用于获取模型列表
    memory_skill = skill_class(skill_config)
    memory_skill.skill_id = str(skill_id)
    
    # 卸载模型
    result = skill_manager.unload_skill_models(memory_skill.skill_id)
    
    return {
        "skill_id": skill_id,
        "skill_name": db_skill.name,
        "models": result
    }

@router.post("/load-all-models", response_model=Dict[str, Any])
def load_all_enabled_skill_models():
    """
    加载所有启用的技能所需的模型
    
    Returns:
        Dict: 所有技能的模型加载结果
    """
    # 先确保所有技能都已加载
    skill_manager.initialize()
    
    # 加载所有模型
    results = skill_manager.load_all_enabled_skill_models()
    
    return {
        "success": True,
        "results": results
    }

@router.get("/types/list", response_model=List[str])
def list_skill_types():
    """
    获取所有已注册的技能类型
    
    Returns:
        List[str]: 技能类型列表
    """
    return skill_factory.get_registered_skill_types()

@router.post("/reload", response_model=Dict[str, Any])
def reload_skills():
    """
    重新扫描技能目录并同步数据库
    
    当添加或删除技能文件后，可调用此接口刷新系统
    
    Returns:
        Dict[str, Any]: 刷新结果
    """
    try:
        # 重新扫描技能文件
        registered_count = register_available_skill_classes()
        
        # 同步数据库
        sync_configured_skills_to_database()
        
        return {
            "success": True, 
            "message": "技能重新扫描成功",
            "skill_types": skill_factory.get_registered_skill_types(),
            "registered_count": registered_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"技能重新扫描失败: {str(e)}"
        )

@router.get("/{skill_id}/models", response_model=Dict[str, Any])
def get_skill_required_models(skill_id: int, db: Session = Depends(get_db)):
    """
    获取技能所需的所有模型信息（从Redis）
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict: 技能所需的模型信息
    """
    # 从数据库获取技能
    db_skill = db.query(SkillModel).filter(SkillModel.id == skill_id).first()
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"技能 ID {skill_id} 不存在"
        )
    
    # 获取技能所需的模型列表（从Redis）
    model_names = get_skill_models(str(skill_id))
    
    # 获取模型详细信息
    models_info = []
    server_ready = triton_client.is_server_ready()
    
    for model_name in model_names:
        # 从数据库查询模型（如果存在）
        db_model = db.query(Model).filter(Model.name == model_name).first()
        
        # 检查模型就绪状态
        is_ready = server_ready and triton_client.is_model_ready(model_name)
        
        model_info = {
            "name": model_name,
            "ready": is_ready,
            "db_info": db_model.to_dict() if db_model else None
        }
        models_info.append(model_info)
    
    return {
        "skill_id": skill_id,
        "skill_name": db_skill.name,
        "models": models_info
    }

@router.delete("/{skill_id}/model-relations", response_model=Dict[str, Any])
def delete_skill_model_relations(skill_id: int, db: Session = Depends(get_db)):
    """
    删除技能与模型的关联关系
    
    Args:
        skill_id: 技能ID
        
    Returns:
        Dict: 操作结果
    """
    # 从数据库获取技能
    db_skill = db.query(SkillModel).filter(SkillModel.id == skill_id).first()
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"技能 ID {skill_id} 不存在"
        )
    
    # 清空关系
    success = unregister_skill(str(skill_id))
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除技能模型关系失败"
        )
    
    return {
        "success": True,
        "skill_id": skill_id,
        "message": "技能模型关系已清除"
    }

@router.post("/{skill_id}/register-models", response_model=Dict[str, Any])
def register_skill_models(skill_id: int, model_data: Dict[str, Any], db: Session = Depends(get_db)):
    """
    注册技能与模型的关联关系
    
    Args:
        skill_id: 技能ID
        model_data: 包含模型列表的数据，格式为 {"models": ["model1", "model2", ...]}
        
    Returns:
        Dict: 操作结果
    """
    # 从数据库获取技能
    db_skill = db.query(SkillModel).filter(SkillModel.id == skill_id).first()
    if not db_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"技能 ID {skill_id} 不存在"
        )
    
    models = model_data.get("models", [])
    
    # 注册关系
    success = register_skill_model_relation(str(skill_id), models)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="注册技能模型关系失败"
        )
    
    return {
        "success": True,
        "skill_id": skill_id,
        "models": models,
        "message": "技能模型关系已注册"
    } 
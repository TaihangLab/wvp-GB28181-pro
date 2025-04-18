"""
基础检测技能，提供通用的检测结果可视化等功能
"""
import cv2
import numpy as np
import random
from typing import Dict, List, Any, Tuple
from .base import Skill

class BaseSkill(Skill):
    """基础检测技能类
    
    提供可视化等通用功能，可被其他检测技能继承
    """
    
    def __init__(self, name=None):
        """初始化基础检测技能
        
        Args:
            name: 技能名称
        """
        super().__init__(name or "BaseSkill")
        self._color_cache = {}
    
    def _get_color(self, class_id):
        """获取类别对应的颜色
        
        对每个类别ID生成固定的随机颜色
        
        Args:
            class_id: 类别ID
            
        Returns:
            BGR颜色元组
        """
        # 如果颜色已经缓存，直接返回
        if class_id in self._color_cache:
            return self._color_cache[class_id]
        
        # 生成新的随机颜色（避免太暗或太亮）
        random.seed(class_id)
        r = random.randint(80, 255)
        g = random.randint(80, 255)
        b = random.randint(80, 255)
        color = (b, g, r)  # OpenCV使用BGR颜色格式
        
        # 缓存颜色
        self._color_cache[class_id] = color
        return color
    
    def visualize(self, image, detections, output_path=None):
        """可视化检测结果

        Args:
            image: 输入图像
            detections: 检测结果列表
            output_path: 可选的输出路径

        Returns:
            标注后的图像
        """
        # 创建图像副本
        result_image = image.copy()
        
        # 根据图像大小计算自适应字体大小和线条宽度
        h, w = image.shape[:2]
        image_area = h * w
        font_scale_base = 0.4
        
        # 根据图像面积计算自适应字体大小，防止太大或太小
        font_scale = max(0.4, min(1.2, font_scale_base * (image_area / (640 * 480)) ** 0.4))
        thickness = max(1, min(3, int(font_scale * 2)))
        
        # 绘制每个检测结果
        for det in detections:
            # 获取边界框坐标
            x1, y1, x2, y2 = det['bbox']
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            # 获取类别和置信度
            class_name = det.get('class_name', 'unknown')
            score = det.get('score', 0.0)
            
            # 根据类别选择颜色
            color = self._get_color(det.get('class_id', 0))
            
            # 绘制边界框
            cv2.rectangle(result_image, (x1, y1), (x2, y2), color, thickness)
            
            # 准备标签文本
            label = f"{class_name} {score:.2f}"
            
            # 计算标签文本大小
            text_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
            
            # 绘制标签背景
            cv2.rectangle(result_image, (x1, y1 - text_size[1] - 4), (x1 + text_size[0], y1), color, -1)
            
            # 绘制标签文本
            cv2.putText(result_image, label, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX,
                        font_scale, (255, 255, 255), thickness)
        
        # 如果指定了输出路径，保存图像
        if output_path:
            cv2.imwrite(output_path, result_image)
            self.log("info", f"可视化结果已保存至: {output_path}")
        
        return result_image 
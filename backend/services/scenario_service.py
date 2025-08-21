from typing import Optional

from sqlalchemy.orm import Session

from common import jieba_cut
from models.api.scenario import CreateScenarioRequest, UpdateScenarioRequest
from models.db.scenario import ScenarioCrud

prompt = """
你是一个专业的图像分析师。你的任务是仔细观察我上传的图片，并严格按照下面的特征列表，提取图中主要对象的具体信息。

# 输出要求
1.  **严格按照列表:** 必须逐一对应下面的每一项特征进行回答。
2.  **格式固定:** 输出格式必须为 `特征名: 描述`，例如 `发型: 短发`。
3.  **一行一项:** 每个特征及其描述占独立的一行。
4.  **言简意赅:** 描述部分应直接、简洁。
5.  **处理未知项:** 如果图片中看不到或无法确定某个特征，请使用“未显示”或“无法判断”作为描述。

# 特征列表
{{list_of_keypoints}}
"""


def create_scenario(req: CreateScenarioRequest, session: Session) -> int:
    if req.keypoints:
        __prompt = prompt.replace(
            "{{list_of_keypoints}}", req.keypoints.replace(";", "\n")
        )
        d = {
            "name": req.name,
            "description": req.description,
            "keypoints": req.keypoints,
            "prompt": __prompt,
        }
    else:
        d = {
            "name": req.name,
            "description": req.description,
        }
    scenario = ScenarioCrud.create(session, d)
    return scenario.id


def get_by_page(session, page_size: int = 10, page_num: int = 1) -> list[dict]:
    return list(
        x.to_dict()
        for x in ScenarioCrud.list(session, (page_num - 1) * page_size, page_size)
    )


def count(session) -> int:
    return ScenarioCrud.count(session)


def delete(session, id: int) -> bool:
    return ScenarioCrud.soft_delete(session, id)


def update(session, req: UpdateScenarioRequest) -> Optional[int]:
    if req.keypoints:
        __prompt = prompt.replace(
            "{{list_of_keypoints}}", req.keypoints.replace(";", "\n")
        )
        d = {
            "name": req.name,
            "description": req.description,
            "keypoints": req.keypoints,
            "prompt": __prompt,
        }
    else:
        d = {
            "name": req.name,
            "description": req.description,
        }
    scenario = ScenarioCrud.update(session, req.id, d)
    return scenario.id if scenario else None


async def get_wordcloud(session) -> list[str]:
    objs = ScenarioCrud.fetch_all(session)
    strs = ";".join([x.description for x in objs if x.description])
    return jieba_cut(strs)

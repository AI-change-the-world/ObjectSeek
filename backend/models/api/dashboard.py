from typing import Optional

from pydantic import BaseModel


class Dashboard(BaseModel):
    total_scenario: int
    scenario_wordcloud: Optional[list[str]] = None
    total_video: int
    total_algorithm: int
    algorithm_wordcloud: Optional[list[str]] = None

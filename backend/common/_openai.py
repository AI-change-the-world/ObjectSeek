from openai import OpenAI

from ._config import settings

chat_client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

chat_model = settings.openai_model
chat_vlm_model = settings.openai_vlm_model

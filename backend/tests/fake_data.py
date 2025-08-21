import sys

from tqdm import tqdm

sys.path.append("..")
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    "mysql+pymysql://root:123456@127.0.0.1:3306/object_seek?charset=utf8mb4",
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    pool_timeout=30,
    echo=False,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

sess = SessionLocal()

from faker import Faker

from models.db.stream import Stream
from models.db.stream.stream_crud import StreamCrud

fake = Faker()


def generate_stream_instance():
    """生成 Stream 类的实例"""

    # 生成随机数据
    algo_id = fake.random_element(elements=[1, 2, 3, 4, 5, None])
    name = fake.word()[:20]  # 限制在20字符内
    description = (
        fake.text(max_nb_chars=1024)
        if fake.boolean(chance_of_getting_true=70)
        else None
    )
    scenario_id = fake.random_element(elements=[1, 2, 3, 4, 5, None])

    # 随机选择数据流类型
    stream_type = fake.random_element(elements=["file", "stream"])

    # 根据类型生成不同的路径
    if stream_type == "file":
        stream_path = fake.file_path(depth=3, extension=None)
    else:
        stream_path = f"rtsp://{fake.domain_name()}/{fake.word()}"

    # 创建 Stream 实例
    stream = Stream(
        algo_id=algo_id,
        name=name,
        description=description,
        scenario_id=scenario_id,
        stream_type=stream_type,
        stream_path=stream_path,
    )

    return stream


def generate_multiple_streams(count=100):
    """生成多个 Stream 实例"""
    return [generate_stream_instance() for _ in range(count)]


# 使用示例
if __name__ == "__main__":
    # 生成单个实例
    stream_instance = generate_stream_instance()
    print(
        f"Generated stream: {stream_instance.name}, type: {stream_instance.stream_type}"
    )

    # 生成多个实例
    streams = generate_multiple_streams(100)
    for i, stream in tqdm(enumerate(streams, 1)):
        # print(f"Stream {i}: {stream.name} - {stream.stream_type} - {stream.stream_path}")
        StreamCrud.create(sess, stream)

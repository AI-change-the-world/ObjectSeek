from typing import List, Union
from sqlalchemy.orm import Session

from models.db.stream.stream_details import StreamDetails

class StreamDetailsCrud:
    @staticmethod
    def create(session: Session, obj: Union[StreamDetails, dict]) -> StreamDetails:
        if isinstance(obj, dict):
            obj = StreamDetails(**obj)

        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj
    
    @staticmethod
    def get_by_stream_id(session: Session, stream_id: int) -> List[StreamDetails]:
        return session.query(StreamDetails).filter(StreamDetails.stream_id == stream_id).all()
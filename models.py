from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    video_url = Column(String)
    thumbnail_url = Column(String)
    category = Column(String, index=True)
    year = Column(Integer)
    age_rating = Column(String)
    match_score = Column(Integer)
    duration = Column(String)
    tags = Column(String)

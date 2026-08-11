from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import get_db, engine
import models
from seed import seed_db

# Ensure tables are created and seeded
models.Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI()

@app.get("/api/videos")
def get_videos(db: Session = Depends(get_db)):
    videos = db.query(models.Video).all()
    # Group videos by category
    categories = {}
    for video in videos:
        if video.category not in categories:
            categories[video.category] = []
        categories[video.category].append({
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "video_url": video.video_url,
            "thumbnail_url": video.thumbnail_url,
            "year": video.year,
            "age_rating": video.age_rating,
            "match_score": video.match_score,
            "duration": video.duration,
            "tags": video.tags.split(", ") if video.tags else []
        })
    return categories

@app.get("/api/videos/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if video:
        return {
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "video_url": video.video_url,
            "thumbnail_url": video.thumbnail_url,
            "year": video.year,
            "age_rating": video.age_rating,
            "match_score": video.match_score,
            "duration": video.duration,
            "tags": video.tags.split(", ") if video.tags else []
        }
    return {"error": "Video not found"}

from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # For prototype purposes, we will authenticate any email
    # Let's check if the user exists, if not, create them!
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        user = models.User(email=request.email, password_hash="dummy")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {"message": "Login successful", "user": {"id": user.id, "email": user.email}}

# Mount the current directory to serve static files (index.html, style.css, script.js, assets)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

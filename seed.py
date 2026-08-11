from database import engine, Base, SessionLocal
from models import Video

Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    if db.query(Video).count() > 0:
        print("Database already seeded.")
        return
        
    videos = [
        # Trending Now
        Video(title="Explosive Action", description="An explosive thriller.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_action_1785404303118.jpg", category="Trending Now", year=2026, age_rating="TV-MA", match_score=98, duration="2h 10m", tags="Action, Thriller"),
        Video(title="The Rain", description="A deep emotional drama.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_drama_1785404328822.jpg", category="Trending Now", year=2025, age_rating="R", match_score=88, duration="1h 50m", tags="Drama, Emotional"),
        Video(title="Deep Space", description="Journey into the unknown.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_scifi_1785404281097.jpg", category="Trending Now", year=2026, age_rating="TV-14", match_score=95, duration="2h 0m", tags="Sci-Fi, Space"),
        
        # Sci-Fi & Fantasy
        Video(title="The Ether", description="A magical sword awakens.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_fantasy_1785404346688.jpg", category="Sci-Fi & Fantasy", year=2026, age_rating="TV-MA", match_score=98, duration="2h 15m", tags="Fantasy, Magic, Epic"),
        Video(title="Stellar Gateway", description="Exploring new worlds.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_scifi_1785404281097.jpg", category="Sci-Fi & Fantasy", year=2024, age_rating="TV-14", match_score=91, duration="1h 45m", tags="Sci-Fi, Adventure"),

        # Action Thrillers
        Video(title="Fast Chase", description="Non-stop action.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_action_1785404303118.jpg", category="Action Thrillers", year=2026, age_rating="R", match_score=92, duration="1h 55m", tags="Action, Chase"),
        
        # Critically Acclaimed
        Video(title="Shadows in the Rain", description="A gripping noir.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_drama_1785404328822.jpg", category="Critically Acclaimed", year=2025, age_rating="TV-MA", match_score=99, duration="2h 30m", tags="Drama, Noir, Crime"),
    ]
    
    # Duplicate entries to fill out rows for visual effect
    for i in range(5):
        videos.append(Video(title=f"Action Thrill {i+1}", description="Non-stop action.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_action_1785404303118.jpg", category="Action Thrillers", year=2026, age_rating="R", match_score=92, duration="1h 55m", tags="Action, Chase"))
        videos.append(Video(title=f"SciFi Journey {i+1}", description="Journey into the unknown.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_scifi_1785404281097.jpg", category="Sci-Fi & Fantasy", year=2026, age_rating="TV-14", match_score=95, duration="2h 0m", tags="Sci-Fi, Space"))
        videos.append(Video(title=f"Drama Masterpiece {i+1}", description="A deep emotional drama.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_drama_1785404328822.jpg", category="Critically Acclaimed", year=2025, age_rating="TV-MA", match_score=99, duration="2h 30m", tags="Drama, Emotion"))
        videos.append(Video(title=f"Trending Hit {i+1}", description="An explosive thriller.", video_url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail_url="assets/thumb_action_1785404303118.jpg", category="Trending Now", year=2026, age_rating="TV-MA", match_score=98, duration="2h 10m", tags="Action, Thriller"))
    
    db.add_all(videos)
    db.commit()
    print("Database seeded with sample videos.")
    db.close()

if __name__ == "__main__":
    seed_db()

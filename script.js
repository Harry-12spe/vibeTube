const loginBtn = document.getElementById('openLoginBtn');
const closeBtn = document.getElementById('closeLoginBtn');
const modal = document.getElementById('loginModal');
const navbar = document.querySelector('.navbar');

loginBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fetch and populate Cards dynamically
async function loadVideos() {
    try {
        const response = await fetch('/api/videos');
        const categories = await response.json();
        const main = document.querySelector('main');
        
        // Remove the existing hardcoded rows from HTML to replace them with dynamic ones
        const oldRows = document.querySelectorAll('.content-row:not(:first-of-type)');
        oldRows.forEach(row => row.remove());
        
        // Ensure the first content row (Trending) doesn't have a huge negative margin if we re-render
        let isFirstRow = true;

        for (const [category, videos] of Object.entries(categories)) {
            const section = document.createElement('section');
            section.className = 'content-row';
            if (isFirstRow) {
                section.style.marginTop = '-100px';
                section.style.position = 'relative';
                section.style.zIndex = '20';
                isFirstRow = false;
            }

            const title = document.createElement('h3');
            title.textContent = category;
            section.appendChild(title);

            const container = document.createElement('div');
            container.className = 'cards-container';
            
            let html = '';
            videos.forEach(video => {
                // Determine tags HTML
                let tagsHtml = video.tags.map(tag => `<span>${tag}</span>`).join(' • ');
                
                html += `<div class="card" onclick="playVideo(${video.id})">
                    <img class="card-img" src="${video.thumbnail_url}" alt="${video.title}">
                    <div class="card-info">
                        <div class="card-actions">
                            <button class="card-btn play-btn" onclick="event.stopPropagation(); playVideo(${video.id})"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></button>
                            <button class="card-btn" onclick="event.stopPropagation();"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg></button>
                            <button class="card-btn" style="margin-left: auto;" onclick="event.stopPropagation();"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                        </div>
                        <div class="card-meta">
                            <span class="match">${video.match_score}% Match</span>
                            <span class="age">${video.age_rating}</span>
                            <span class="duration">${video.duration}</span>
                        </div>
                        <div class="card-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>`;
            });
            container.innerHTML = html;
            
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'slider-wrapper';
            
            const btnLeft = document.createElement('button');
            btnLeft.className = 'slider-btn left';
            btnLeft.innerHTML = '&#10094;';
            btnLeft.onclick = () => scrollSlider(container, -1);
            
            const btnRight = document.createElement('button');
            btnRight.className = 'slider-btn right';
            btnRight.innerHTML = '&#10095;';
            btnRight.onclick = () => scrollSlider(container, 1);
            
            sliderWrapper.appendChild(btnLeft);
            sliderWrapper.appendChild(container);
            sliderWrapper.appendChild(btnRight);
            
            section.appendChild(sliderWrapper);
            main.appendChild(section);
        }
    } catch (error) {
        console.error("Failed to fetch videos:", error);
    }
}

function scrollSlider(container, direction) {
    // scroll amount is roughly one viewport width minus padding
    const scrollAmount = window.innerWidth * 0.8;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Initialize
loadVideos();

const videoModal = document.getElementById('videoModal');
const closeVideoBtn = document.getElementById('closeVideoBtn');
const vibePlayer = document.getElementById('vibePlayer');

// Handle play button clicks
window.playVideo = async function(videoId) {
    try {
        const res = await fetch(/api/videos/ + videoId);
        const videoData = await res.json();
        
        if (videoData.video_url) {
            vibePlayer.src = videoData.video_url;
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            vibePlayer.play();
        } else {
            console.error("Video URL not found");
        }
    } catch(err) {
        console.error("Failed to load video", err);
    }
};

closeVideoBtn.addEventListener('click', () => {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    vibePlayer.pause();
    vibePlayer.currentTime = 0;
    vibePlayer.src = "";
});


const loginForm = document.querySelector('.login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, password})
            });
            const data = await res.json();
            
            if (data.message) {
                // Success! Close modal and update UI
                modal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Update Sign In button to show User profile icon
                const userActions = document.querySelector('.user-actions');
                const signinBtn = document.getElementById('openLoginBtn');
                if (signinBtn) signinBtn.remove();
                
                // Add profile icon
                const profileBtn = document.createElement('button');
                profileBtn.className = 'icon-btn';
                profileBtn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                profileBtn.style.background = 'rgba(255,0,0,0.2)';
                profileBtn.style.padding = '5px';
                profileBtn.style.borderRadius = '50%';
                profileBtn.title = data.user.email;
                userActions.appendChild(profileBtn);
            }
        } catch (err) {
            console.error("Login failed", err);
        }
    });
}

// Hero Video Mute Toggle
const heroVideo = document.getElementById('heroVideo');
const muteBtn = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');
const unmuteIcon = document.getElementById('unmuteIcon');

if (muteBtn && heroVideo) {
    muteBtn.addEventListener('click', () => {
        heroVideo.muted = !heroVideo.muted;
        if (heroVideo.muted) {
            muteIcon.style.display = 'block';
            unmuteIcon.style.display = 'none';
        } else {
            muteIcon.style.display = 'none';
            unmuteIcon.style.display = 'block';
        }
    });
}

// Advanced Card Hover Physics (Edge Detection)
document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        const rect = card.getBoundingClientRect();
        if (rect.left < window.innerWidth * 0.1) {
            card.style.transformOrigin = 'left center';
        } else if (rect.right > window.innerWidth * 0.9) {
            card.style.transformOrigin = 'right center';
        } else {
            card.style.transformOrigin = 'center center';
        }
    }
});

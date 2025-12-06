// ============================================
// SLIDER.JS - AUTO-SLIDING HERO CAROUSEL
// ============================================

let sliderData = [];
let currentSlide = 0;
let sliderInterval = null;
let isHovering = false;

document.addEventListener('DOMContentLoaded', async () => {
    await initSlider();
});

async function initSlider() {
    try {
        // Fetch 10 latest content
        sliderData = await getLatestContent(10);

        if (sliderData.length === 0) {
            console.warn('No content available for slider');
            return;
        }

        // Render slides
        renderSlides();

        // Render navigation dots
        renderDots();

        // Show first slide
        showSlide(0);

        // Setup event listeners
        setupSliderEvents();

        // Start auto-play
        startAutoPlay();

    } catch (error) {
        console.error('Error initializing slider:', error);
    }
}

async function getLatestContent(limit = 10) {
    try {
        const { data, error } = await supabase
            .from('series')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching latest content:', error);
        return [];
    }
}

function renderSlides() {
    const container = document.getElementById('slider-container');
    if (!container) return;

    container.innerHTML = sliderData.map((item, index) => `
        <div class="slider-slide ${index === 0 ? 'active' : ''}" data-index="${index}" style="background-image: url('${item.backdrop_url || item.poster_url || 'https://via.placeholder.com/1920x1080'}');">
            <div class="slide-content">
                <h1 class="slide-title">${item.title}</h1>
                <div class="slide-meta">
                    <span>${item.year || 'N/A'}</span>
                    <span>•</span>
                    <span>${item.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>⭐ ${item.rating || 'N/A'}</span>
                </div>
                <p class="slide-description">${item.description || 'Découvrez ce contenu passionnant sur CinéTN'}</p>
                <div class="slide-cta">
                    <button class="btn-neon" onclick="window.location.href='details.html?id=${item.id}'">
                        <span>▶️ Regarder maintenant</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDots() {
    const dotsContainer = document.getElementById('slider-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = sliderData.map((_, index) => `
        <div class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
}

function setupSliderEvents() {
    const container = document.getElementById('slider-container');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    // Hover pause/resume
    if (container) {
        container.addEventListener('mouseenter', () => {
            isHovering = true;
            stopAutoPlay();
        });

        container.addEventListener('mouseleave', () => {
            isHovering = false;
            startAutoPlay();
        });
    }

    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            previousSlide();
        });
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
    }

    // Dots navigation
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('slider-dot')) {
                const index = parseInt(e.target.dataset.index);
                goToSlide(index);
            }
        });
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slider-slide');
    const dots = document.querySelectorAll('.slider-dot');

    // Remove active class from all
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');

    currentSlide = index;
}

function nextSlide() {
    let next = currentSlide + 1;
    if (next >= sliderData.length) {
        next = 0; // Loop back to first
    }
    goToSlide(next);
}

function previousSlide() {
    let prev = currentSlide - 1;
    if (prev < 0) {
        prev = sliderData.length - 1; // Loop to last
    }
    goToSlide(prev);
}

function goToSlide(index) {
    showSlide(index);

    // Restart auto-play timer
    if (!isHovering) {
        stopAutoPlay();
        startAutoPlay();
    }
}

function startAutoPlay() {
    if (sliderInterval) return; // Already running

    sliderInterval = setInterval(() => {
        if (!isHovering) {
            nextSlide();
        }
    }, 5000); // 5 seconds
}

function stopAutoPlay() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
    }
}

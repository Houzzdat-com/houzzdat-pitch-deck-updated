class HouzzdatPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 20;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideElement = document.getElementById('currentSlide');
        this.totalSlidesElement = document.getElementById('totalSlides');
        this.indicatorsContainer = document.getElementById('indicators');
        this.slidesWrapper = document.getElementById('slidesWrapper');
        this.timerElement = document.getElementById('presentationTimer');
        this.startTime = Date.now();
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.createIndicators();
        this.attachEventListeners();
        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateIndicators();
        this.startTimer();
        
        // Set initial total slides
        this.totalSlidesElement.textContent = this.totalSlides;
    }

    createIndicators() {
        for (let i = 1; i <= this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.dataset.slide = i;
            if (i === 1) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });
            
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    attachEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => {
            this.previousSlide();
        });

        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Space bar
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
            }
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        this.slidesWrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.slidesWrapper.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });

        // Mouse drag support for desktop
        let isMouseDown = false;
        let mouseStartX = 0;
        let mouseStartY = 0;

        this.slidesWrapper.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            if (isMouseDown) {
                isMouseDown = false;
                const mouseEndX = e.clientX;
                const mouseEndY = e.clientY;
                this.handleSwipe(mouseStartX, mouseStartY, mouseEndX, mouseEndY);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                e.preventDefault();
            }
        });

        // Prevent context menu on slides
        this.slidesWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    handleSwipe(startX, startY, endX, endY) {
        const diffX = startX - endX;
        const diffY = startY - endY;
        const minSwipeDistance = 50;

        // Only register swipe if horizontal movement is greater than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide) {
            return;
        }

        // Remove active class from current slide
        const currentSlideElement = document.querySelector(`.slide[data-slide="${this.currentSlide}"]`);
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
            
            // Add prev class if moving forward, or let it fade out if moving backward
            if (slideNumber > this.currentSlide) {
                currentSlideElement.classList.add('prev');
            }
        }

        // Update current slide number
        this.currentSlide = slideNumber;

        // Add active class to new slide
        const newSlideElement = document.querySelector(`.slide[data-slide="${this.currentSlide}"]`);
        if (newSlideElement) {
            // Remove any previous classes
            newSlideElement.classList.remove('prev');
            newSlideElement.classList.add('active');
        }

        // Clean up prev classes after transition
        setTimeout(() => {
            this.slides.forEach(slide => {
                if (!slide.classList.contains('active')) {
                    slide.classList.remove('prev');
                }
            });
        }, 300);

        this.updateSlideCounter();
        this.updateNavigationButtons();
        this.updateIndicators();

        // Announce slide change for screen readers
        this.announceSlideChange();
    }

    updateSlideCounter() {
        this.currentSlideElement.textContent = this.currentSlide;
    }

    updateNavigationButtons() {
        // Update previous button
        this.prevBtn.disabled = this.currentSlide === 1;
        
        // Update next button
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index + 1 === this.currentSlide);
        });
    }

    announceSlideChange() {
        // Create or update screen reader announcement
        let announcement = document.getElementById('slide-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'slide-announcement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            document.body.appendChild(announcement);
        }

        const slideTitle = this.getCurrentSlideTitle();
        announcement.textContent = `Slide ${this.currentSlide} of ${this.totalSlides}: ${slideTitle}`;
    }

    getCurrentSlideTitle() {
        const currentSlideElement = document.querySelector(`.slide[data-slide="${this.currentSlide}"]`);
        if (currentSlideElement) {
            const heading = currentSlideElement.querySelector('h1, h2');
            if (heading) {
                return heading.textContent.trim();
            }
        }
        return 'Slide content';
    }

    // Public methods for external control
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    // Method to go to first slide
    goToFirstSlide() {
        this.goToSlide(1);
    }

    // Method to go to last slide
    goToLastSlide() {
        this.goToSlide(this.totalSlides);
    }

    // Method to check if presentation is at beginning
    isAtBeginning() {
        return this.currentSlide === 1;
    }

    // Method to check if presentation is at end
    isAtEnd() {
        return this.currentSlide === this.totalSlides;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - this.startTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global presentation instance
    window.houzzdatPresentation = new HouzzdatPresentation();

    // Add some additional functionality for better UX
    
    // Prevent default drag behavior on images and other elements
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Add focus management for better accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Allow normal tab navigation
            return;
        }
    });

    // Add smooth scrolling behavior for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });

    // Add resize handler to ensure proper layout
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Force a repaint to ensure proper layout
            document.body.style.display = 'none';
            document.body.offsetHeight; // Trigger reflow
            document.body.style.display = '';
        }, 100);
    });

    // Add visibility change handler to pause/resume if needed
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Resume any animations or timers if needed
            console.log('Presentation visible');
        } else {
            // Pause any animations or timers if needed
            console.log('Presentation hidden');
        }
    });

    // Add error handling for any missing elements
    const requiredElements = [
        'prevBtn', 'nextBtn', 'currentSlide', 'totalSlides', 
        'indicators', 'slidesWrapper'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
    }

    // Log initialization
    console.log('Houzzdat Presentation initialized successfully');
    console.log(`Total slides: ${window.houzzdatPresentation.getTotalSlides()}`);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HouzzdatPresentation;
}
/**
 * Main JavaScript File - T4n OS Website Functionality
 * Organized and optimized according to web development standards
 */

// DOM Elements Cache
const DOM = {
    preloader: document.querySelector('.preloader'),
    menuToggle: document.getElementById('menu-toggle'),
    navLinks: document.querySelector('.nav-links'),
    menuIcon: document.querySelector('#menu-toggle i'),
    galleryItems: document.querySelectorAll('.gallery-item'),
    lightbox: document.getElementById('lightbox'),
    lightboxImage: document.getElementById('lightbox-image'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.querySelector('.lightbox-prev'),
    lightboxNext: document.querySelector('.lightbox-next'),
    downloadModal: document.getElementById('download-modal'),
    modalClose: document.getElementById('modal-close'),
    backToTop: document.getElementById('back-to-top')
};

// State Management
const AppState = {
    isMenuOpen: false,
    isLightboxOpen: false,
    isModalOpen: false,
    currentGalleryIndex: 0
};

// Constants
const CONSTANTS = {
    HEADER_HEIGHT: 70,
    ANIMATION_THRESHOLD: 0.1,
    ROOT_MARGIN: '0px 0px -50px 0px',
    TRANSITION_DURATION: 500,
    PRELOADER_DELAY: 1000
};

// Preloader Manager
class PreloaderManager {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (DOM.preloader) {
                    DOM.preloader.classList.add('fade-out');
                    setTimeout(() => {
                        DOM.preloader.style.display = 'none';
                    }, 500);
                }
            }, CONSTANTS.PRELOADER_DELAY);
        });
    }
}

// Mobile Navigation Manager
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (DOM.menuToggle) {
            DOM.menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking on links
        if (DOM.navLinks) {
            DOM.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });
        }

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        
        if (DOM.navLinks) {
            DOM.navLinks.classList.toggle('active', AppState.isMenuOpen);
        }
        
        if (DOM.menuIcon) {
            DOM.menuIcon.classList.toggle('fa-bars', !AppState.isMenuOpen);
            DOM.menuIcon.classList.toggle('fa-times', AppState.isMenuOpen);
        }

        // Toggle body scroll lock on mobile
        document.body.style.overflow = AppState.isMenuOpen ? 'hidden' : '';
    }

    closeMenu() {
        AppState.isMenuOpen = false;
        
        if (DOM.navLinks) {
            DOM.navLinks.classList.remove('active');
        }
        
        if (DOM.menuIcon) {
            DOM.menuIcon.classList.replace('fa-times', 'fa-bars');
        }
        
        document.body.style.overflow = '';
    }

    // Handle window resize
    handleResize() {
        if (window.innerWidth > 768 && AppState.isMenuOpen) {
            this.closeMenu();
        }
    }
}

// Smooth Scrolling Manager
class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupScrollSpy();
        this.setupBackToTop();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                this.scrollToElement(targetId);
            });
        });
    }

    scrollToElement(targetId) {
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition - CONSTANTS.HEADER_HEIGHT;
        const duration = 1000;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + distance * this.easeInOutQuad(progress));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        
        if (!sections.length || !navLinks.length) return;

        const observerOptions = {
            root: null,
            rootMargin: `-${CONSTANTS.HEADER_HEIGHT}px 0px 0px 0px`,
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    
                    navLinks.forEach(link => {
                        link.classList.toggle(
                            'active', 
                            link.getAttribute('href') === `#${currentId}`
                        );
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    setupBackToTop() {
        if (!DOM.backToTop) return;

        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                DOM.backToTop.classList.add('show');
            } else {
                DOM.backToTop.classList.remove('show');
            }
        });

        // Scroll to top when button is clicked
        DOM.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Animation Manager
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: CONSTANTS.ANIMATION_THRESHOLD,
            rootMargin: CONSTANTS.ROOT_MARGIN
        };

        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.card, .gallery-item, .animate-on-scroll').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity ${CONSTANTS.TRANSITION_DURATION}ms ease, transform ${CONSTANTS.TRANSITION_DURATION}ms ease`;
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                this.observer.unobserve(entry.target);
            }
        });
    }

    setupScrollAnimations() {
        // Additional scroll-based animations can be added here
        window.addEventListener('scroll', this.throttle(() => {
            // Add parallax or other scroll effects
        }, 100));
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Gallery Lightbox Manager
class LightboxManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (DOM.galleryItems) {
            DOM.galleryItems.forEach((item, index) => {
                item.addEventListener('click', () => this.openLightbox(index));
            });
        }

        if (DOM.lightboxClose) {
            DOM.lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        if (DOM.lightboxPrev) {
            DOM.lightboxPrev.addEventListener('click', () => this.previousImage());
        }

        if (DOM.lightboxNext) {
            DOM.lightboxNext.addEventListener('click', () => this.nextImage());
        }

        if (DOM.lightbox) {
            DOM.lightbox.addEventListener('click', (e) => {
                if (e.target === DOM.lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!AppState.isLightboxOpen) return;

            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
                case 'ArrowLeft':
                    this.previousImage();
                    break;
            }
        });
    }

    openLightbox(index) {
        AppState.isLightboxOpen = true;
        AppState.currentGalleryIndex = index;
        
        const item = DOM.galleryItems[index];
        const img = item.querySelector('img');
        const title = item.getAttribute('data-title');
        const caption = item.getAttribute('data-caption');
        
        if (DOM.lightboxImage && img) {
            DOM.lightboxImage.src = img.src;
            DOM.lightboxImage.alt = img.alt || title || 'Gallery image';
        }
        
        if (DOM.lightboxCaption) {
            DOM.lightboxCaption.textContent = caption || title || '';
        }
        
        if (DOM.lightbox) {
            DOM.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeLightbox() {
        AppState.isLightboxOpen = false;
        
        if (DOM.lightbox) {
            DOM.lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    nextImage() {
        if (!DOM.galleryItems.length) return;
        
        AppState.currentGalleryIndex = 
            (AppState.currentGalleryIndex + 1) % DOM.galleryItems.length;
        this.updateLightboxImage();
    }

    previousImage() {
        if (!DOM.galleryItems.length) return;
        
        AppState.currentGalleryIndex = 
            (AppState.currentGalleryIndex - 1 + DOM.galleryItems.length) % DOM.galleryItems.length;
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const item = DOM.galleryItems[AppState.currentGalleryIndex];
        const img = item.querySelector('img');
        const title = item.getAttribute('data-title');
        const caption = item.getAttribute('data-caption');
        
        if (DOM.lightboxImage && img) {
            DOM.lightboxImage.src = img.src;
            DOM.lightboxImage.alt = img.alt || title || 'Gallery image';
        }
        
        if (DOM.lightboxCaption) {
            DOM.lightboxCaption.textContent = caption || title || '';
        }
    }
}

// Modal Manager
class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Get all download buttons
        const downloadBtns = document.querySelectorAll('.download-btn');
        
        // Add click event to each download button
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const version = btn.getAttribute('data-version');
                const size = btn.getAttribute('data-size');
                this.openModal(version, size);
            });
        });

        if (DOM.modalClose) {
            DOM.modalClose.addEventListener('click', () => this.closeModal());
        }

        if (DOM.downloadModal) {
            DOM.downloadModal.addEventListener('click', (e) => {
                if (e.target === DOM.downloadModal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.isModalOpen) {
                this.closeModal();
            }
        });
    }

    openModal(version, size) {
        AppState.isModalOpen = true;
        
        // Update modal title with version info
        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Unduh T4n OS - ${version}`;
        }
        
        // Update download options based on version
        this.updateDownloadOptions(version);
        
        if (DOM.downloadModal) {
            DOM.downloadModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    updateDownloadOptions(version) {
        // This is where you would customize download options based on the version
        // For now, we'll keep the same options for all versions
        // In a real implementation, you might have different download links for each version
        
        const downloadOptions = document.querySelector('.modal-download-options');
        if (!downloadOptions) return;
        
        // For demonstration, we'll just update the first option to show the selected version
        const firstOption = downloadOptions.querySelector('.download-info h3');
        if (firstOption) {
            firstOption.textContent = `T4n OS ${version}`;
        }
    }

    closeModal() {
        AppState.isModalOpen = false;
        
        if (DOM.downloadModal) {
            DOM.downloadModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Initialize Application
class App {
    constructor() {
        this.preloader = new PreloaderManager();
        this.navigation = new NavigationManager();
        this.scrollManager = new ScrollManager();
        this.animation = new AnimationManager();
        this.lightbox = new LightboxManager();
        this.modal = new ModalManager();
        
        this.setupGlobalEventListeners();
    }

    setupGlobalEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.navigation.handleResize();
        });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
